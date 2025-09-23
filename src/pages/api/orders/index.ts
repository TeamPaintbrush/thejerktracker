import { NextApiRequest, NextApiResponse } from 'next'
import { OrderService, RestaurantService } from '@/lib/dynamoService'
import { requireStaffOrAdmin } from '@/lib/auth'
import { OrderStatus, OrderType } from '@/types/api'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return handleGetOrders(req, res)
  } else if (req.method === 'POST') {
    return handleCreateOrder(req, res)
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    return res.status(405).json({ error: 'Method not allowed' })
  }
}

async function handleGetOrders(req: NextApiRequest, res: NextApiResponse) {
  // Require authentication for getting orders
  const authenticatedReq = await requireStaffOrAdmin(req, res)
  if (!authenticatedReq) return

  try {
    const orders = await OrderService.getAll()
    
    return res.status(200).json({
      orders,
      pagination: {
        page: 1,
        limit: orders.length,
        totalCount: orders.length,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false
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

  const {
    orderNumber,
    customerName,
    customerPhone,
    customerEmail,
    totalAmount,
    orderType = OrderType.TAKEOUT,
    notes,
    specialRequests,
    deliveryAddress,
    restaurantId,
    orderDetails
  } = req.body

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
    const existingOrders = await OrderService.getAll()
    const existingOrder = existingOrders.find(order => order.orderNumber === orderNumber)

    if (existingOrder) {
      return res.status(409).json({ error: 'Order number already exists' })
    }

    // Verify restaurant exists
    const restaurant = await RestaurantService.findById(targetRestaurantId)
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' })
    }

    // Create order
    const orderData = {
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
      userId: authenticatedReq.user.id,
      status: OrderStatus.PENDING,
      orderDetails: orderDetails || `Order ${orderNumber} for ${customerName}`,
      items: [] // Basic implementation - can be extended
    }

    const order = await OrderService.create(orderData)
    return res.status(201).json(order)
  } catch (error) {
    console.error('Error creating order:', error)
    return res.status(500).json({ error: 'Failed to create order' })
  }
}