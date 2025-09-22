import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

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
  const { restaurantId, status, page = '1', limit = '10' } = req.query

  // Build where clause
  const where: any = {}
  if (restaurantId && typeof restaurantId === 'string') {
    where.restaurantId = restaurantId
  }
  if (status && typeof status === 'string') {
    where.status = status
  }

  // Pagination
  const pageNum = parseInt(page as string, 10)
  const limitNum = parseInt(limit as string, 10)
  const skip = (pageNum - 1) * limitNum

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
        take: limitNum
      }),
      prisma.order.count({ where })
    ])

    const totalPages = Math.ceil(totalCount / limitNum)

    return res.status(200).json({
      orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalCount,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPreviousPage: pageNum > 1
      }
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return res.status(500).json({ error: 'Failed to fetch orders' })
  }
}

async function handleCreateOrder(req: NextApiRequest, res: NextApiResponse) {
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
    items = [],
    createdById
  } = req.body

  // Basic validation
  if (!orderNumber || !customerName || !customerPhone || !totalAmount || !restaurantId) {
    return res.status(400).json({
      error: 'Missing required fields: orderNumber, customerName, customerPhone, totalAmount, restaurantId'
    })
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      error: 'Order must include at least one item'
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
      where: { id: restaurantId }
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
          totalAmount: parseFloat(totalAmount.toString()),
          orderType,
          notes,
          specialRequests,
          deliveryAddress,
          restaurantId,
          createdById,
          items: {
            create: items.map((item: any) => ({
              name: item.name,
              quantity: parseInt(item.quantity.toString(), 10),
              price: parseFloat(item.price.toString()),
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