import { NextApiRequest, NextApiResponse } from 'next'
import { RestaurantService, OrderService } from '@/lib/dynamoService'
import { requireAuth } from '@/lib/auth'
import { 
  asyncHandler, 
  NotFoundError,
  validateAndThrow 
} from '@/lib/errors'
import { z } from 'zod'
import { OrderStatus } from '@/types/api'

// Query schema for restaurant orders
const restaurantOrdersQuerySchema = z.object({
  status: z.nativeEnum(OrderStatus).optional(),
  page: z.string().regex(/^\d+$/, 'Page must be a number').optional(),
  limit: z.string().regex(/^\d+$/, 'Limit must be a number').optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

export default asyncHandler(async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const authenticatedReq = await requireAuth(req, res)
  if (!authenticatedReq) return

  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid restaurant ID' })
  }

  // Validate query parameters
  const queryData = validateAndThrow<{
    status?: OrderStatus
    page?: string
    limit?: string
    startDate?: string
    endDate?: string
  }>(
    restaurantOrdersQuerySchema, 
    req.query, 
    'Invalid query parameters'
  )

  const { status, page = '1', limit = '10', startDate, endDate } = queryData

  // Check if user has access to this restaurant
  if (authenticatedReq.user.role !== 'ADMIN' && authenticatedReq.user.restaurantId !== id) {
    return res.status(403).json({ error: 'Access denied' })
  }

  // Verify restaurant exists
  const restaurant = await RestaurantService.findById(id)
  if (!restaurant) {
    throw new NotFoundError('Restaurant')
  }

  // Get all orders for this restaurant
  let orders = await OrderService.getByRestaurant(id)

  // Apply status filter
  if (status) {
    orders = orders.filter(order => order.status === status)
  }

  // Apply date filters
  if (startDate) {
    const start = new Date(startDate)
    orders = orders.filter(order => new Date(order.createdAt) >= start)
  }
  
  if (endDate) {
    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999) // End of day
    orders = orders.filter(order => new Date(order.createdAt) <= end)
  }

  // Sort by creation date (newest first)
  orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  // Pagination
  const pageNum = parseInt(page)
  const limitNum = parseInt(limit)
  const offset = (pageNum - 1) * limitNum
  const totalCount = orders.length
  const paginatedOrders = orders.slice(offset, offset + limitNum)

  const pagination = {
    page: pageNum,
    limit: limitNum,
    totalCount,
    totalPages: Math.ceil(totalCount / limitNum),
    hasNextPage: offset + limitNum < totalCount,
    hasPreviousPage: pageNum > 1
  }

  const response = {
    restaurant: {
      id: restaurant.id,
      name: restaurant.name
    },
    orders: paginatedOrders,
    pagination
  }

  return res.status(200).json(response)
})