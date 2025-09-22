import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { requireStaffOrAdmin } from '@/lib/auth'
import { createOrderSchema, queryParamsSchema } from '@/lib/validation'
import { ValidatedRequest } from '@/lib/validation-middleware'
import { z } from 'zod'

// Extended order schema for this API
const createOrderWithItemsSchema = z.object({
  orderNumber: z.string().min(1, 'Order number is required').max(50, 'Order number must be less than 50 characters'),
  customerName: z.string().min(1, 'Customer name is required').max(100, 'Customer name must be less than 100 characters'),
  customerEmail: z.string().email('Invalid email format'),
  customerPhone: z.string().min(10, 'Phone number must be at least 10 characters').max(20, 'Phone number must be less than 20 characters'),
  orderDetails: z.string().min(1, 'Order details are required').max(2000, 'Order details must be less than 2000 characters'),
  totalAmount: z.number().min(0, 'Total amount must be non-negative'),
  status: z.enum(['PENDING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED']).optional().default('PENDING'),
  restaurantId: z.string().uuid('Invalid restaurant ID'),
  orderType: z.enum(['TAKEOUT', 'DELIVERY', 'DINE_IN']).optional().default('TAKEOUT'),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
  specialRequests: z.string().max(500, 'Special requests must be less than 500 characters').optional(),
  deliveryAddress: z.string().max(500, 'Delivery address must be less than 500 characters').optional(),
  items: z.array(z.object({
    name: z.string().min(1, 'Item name is required').max(200, 'Item name must be less than 200 characters'),
    quantity: z.number().int().min(1, 'Quantity must be at least 1'),
    price: z.number().min(0, 'Price must be non-negative'),
    notes: z.string().max(200, 'Item notes must be less than 200 characters').optional(),
  })).min(1, 'Order must include at least one item'),
})

const ordersQuerySchema = queryParamsSchema.extend({
  restaurantId: z.string().uuid('Invalid restaurant ID').optional(),
  orderType: z.enum(['TAKEOUT', 'DELIVERY', 'DINE_IN']).optional(),
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case 'GET':
        return handleGetOrders(req, res)
      case 'POST':
        return handleCreateOrder(req, res)
      default:
        res.setHeader('Allow', ['GET', 'POST'])
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Orders API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

async function handleGetOrders(req: NextApiRequest, res: NextApiResponse) {
  // Require authentication for getting orders
  const authenticatedReq = await requireStaffOrAdmin(req, res)
  if (!authenticatedReq) return

  // Validate query parameters
  const queryValidation = ordersQuerySchema.safeParse(req.query)
  if (!queryValidation.success) {
    const errors = queryValidation.error.issues.map(err => ({
      field: err.path.join('.'),
      message: err.message,
    }))
    return res.status(400).json({
      error: 'Invalid query parameters',
      details: errors,
    })
  }

  const { 
    restaurantId, 
    status, 
    orderType,
    page = 1, 
    limit = 10,
    search 
  } = queryValidation.data

  // Build where clause with restaurant restriction
  const where: any = {}
  
  // Users can only see orders from their restaurant (unless they're admin)
  if (authenticatedReq.user.role !== 'ADMIN') {
    where.restaurantId = authenticatedReq.user.restaurantId
  } else if (restaurantId) {
    where.restaurantId = restaurantId
  }
  
  if (status) {
    where.status = status
  }

  if (orderType) {
    where.orderType = orderType
  }

  // Add search functionality
  if (search) {
    where.OR = [
      { orderNumber: { contains: search, mode: 'insensitive' } },
      { customerName: { contains: search, mode: 'insensitive' } },
      { customerEmail: { contains: search, mode: 'insensitive' } },
      { customerPhone: { contains: search, mode: 'insensitive' } },
    ]
  }

  // Pagination
  const skip = (page - 1) * limit

  try {
    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: true,
          restaurant: {
            select: { id: true, name: true }
          },
          createdBy: {
            select: { id: true, name: true, email: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.order.count({ where })
    ])

    const totalPages = Math.ceil(totalCount / limit)

    return res.status(200).json({
      orders,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return res.status(500).json({ error: 'Failed to fetch orders' })
  }
}

async function handleCreateOrder(req: NextApiRequest, res: NextApiResponse) {
  // Require authentication for creating orders
  const authenticatedReq = await requireStaffOrAdmin(req, res)
  if (!authenticatedReq) return

  // Validate request body
  const bodyValidation = createOrderWithItemsSchema.safeParse(req.body)
  if (!bodyValidation.success) {
    const errors = bodyValidation.error.issues.map(err => ({
      field: err.path.join('.'),
      message: err.message,
    }))
    return res.status(400).json({
      error: 'Validation failed',
      details: errors,
    })
  }

  const {
    orderNumber,
    customerName,
    customerPhone,
    customerEmail,
    totalAmount,
    orderType = 'TAKEOUT',
    notes,
    specialRequests,
    deliveryAddress,
    restaurantId,
    items,
    orderDetails
  } = bodyValidation.data

  // Determine which restaurant to use
  let targetRestaurantId: string | undefined = restaurantId
  if (authenticatedReq.user.role !== 'ADMIN') {
    // Non-admin users can only create orders for their restaurant
    targetRestaurantId = authenticatedReq.user.restaurantId
  }

  if (!targetRestaurantId) {
    return res.status(400).json({
      error: 'Restaurant ID is required'
    })
  }

  try {
    // Check if order number already exists
    const existingOrder = await prisma.order.findUnique({
      where: { orderNumber }
    })

    if (existingOrder) {
      return res.status(409).json({ error: 'Order number already exists' })
    }

    // Verify restaurant exists
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: targetRestaurantId }
    })

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' })
    }

    // Create order with items in a transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerName,
          customerPhone,
          customerEmail,
          totalAmount,
          orderType,
          notes,
          specialRequests,
          deliveryAddress,
          restaurantId: targetRestaurantId,
          createdById: authenticatedReq.user.id,
          items: {
            create: items.map((item: any) => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              notes: item.notes
            }))
          }
        },
        include: {
          items: true,
          restaurant: {
            select: { id: true, name: true }
          },
          createdBy: {
            select: { id: true, name: true, email: true }
          }
        }
      })

      return newOrder
    })

    return res.status(201).json(order)
  } catch (error) {
    console.error('Error creating order:', error)
    return res.status(500).json({ error: 'Failed to create order' })
  }
}