import { NextApiRequest, NextApiResponse } from 'next'
import { RestaurantService, UserService, OrderService } from '@/lib/dynamoService'
import { requireAuth, requireAdmin } from '@/lib/auth'
import { updateRestaurantSchema } from '@/lib/validation'
import { 
  asyncHandler, 
  ValidationError, 
  ConflictError, 
  NotFoundError,
  validateAndThrow 
} from '@/lib/errors'
import { Restaurant } from '@/types/api'

export default asyncHandler(async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid restaurant ID' })
  }

  switch (req.method) {
    case 'GET':
      return handleGetRestaurant(id, res)
    case 'PUT':
      return handleUpdateRestaurant(id, req, res)
    case 'DELETE':
      return handleDeleteRestaurant(id, res)
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
      return res.status(405).json({ error: 'Method not allowed' })
  }
})

async function handleGetRestaurant(id: string, res: NextApiResponse) {
  const restaurant = await RestaurantService.findById(id)
  
  if (!restaurant) {
    throw new NotFoundError('Restaurant')
  }

  // Get users for this restaurant
  const allUsers = await UserService.getAll()
  const restaurantUsers = allUsers
    .filter(user => user.restaurantId === restaurant.id)
    .map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    }))

  // Get orders for this restaurant (latest 10)
  const allOrders = await OrderService.getByRestaurant(restaurant.id)
  const latestOrders = allOrders
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10)
    .map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      status: order.status,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt
    }))

  const response = {
    ...restaurant,
    users: restaurantUsers,
    orders: latestOrders,
    _count: {
      orders: allOrders.length,
      users: restaurantUsers.length
    }
  }

  return res.status(200).json(response)
}

async function handleUpdateRestaurant(id: string, req: NextApiRequest, res: NextApiResponse) {
  const authenticatedReq = await requireAuth(req, res)
  if (!authenticatedReq) return

  // Only admins can update restaurants, or restaurant owners can update their own
  const isAdmin = authenticatedReq.user.role === 'ADMIN'
  const isOwnRestaurant = authenticatedReq.user.restaurantId === id

  if (!isAdmin && !isOwnRestaurant) {
    return res.status(403).json({ error: 'Access denied' })
  }

  // Validate request body
  const restaurantData = validateAndThrow<{
    name?: string
    email?: string
    phone?: string
    address?: string
    city?: string
    state?: string
    zipCode?: string
    website?: string
    description?: string
    logoUrl?: string
  }>(updateRestaurantSchema, req.body, 'Validation failed')

  // Verify restaurant exists
  const existingRestaurant = await RestaurantService.findById(id)
  if (!existingRestaurant) {
    throw new NotFoundError('Restaurant')
  }

  // If email is being changed, check it's not taken
  if (restaurantData.email && restaurantData.email !== existingRestaurant.email) {
    const emailExists = await RestaurantService.findByEmail(restaurantData.email)
    if (emailExists) {
      throw new ConflictError('Email already in use by another restaurant')
    }
  }

  // Prepare update data - only include fields that were provided
  const updateData: Partial<Restaurant> = {}
  Object.keys(restaurantData).forEach(key => {
    const value = restaurantData[key as keyof typeof restaurantData]
    if (value !== undefined) {
      updateData[key as keyof Restaurant] = value as any
    }
  })

  const updatedRestaurant = await RestaurantService.update(id, updateData) as Restaurant

  if (!updatedRestaurant) {
    throw new Error('Failed to update restaurant')
  }

  return res.status(200).json(updatedRestaurant)
}

async function handleDeleteRestaurant(id: string, res: NextApiResponse) {
  // Only admins can delete restaurants
  const authenticatedReq = await requireAdmin({ method: 'DELETE' } as NextApiRequest, res)
  if (!authenticatedReq) return

  // Verify restaurant exists
  const existingRestaurant = await RestaurantService.findById(id)
  if (!existingRestaurant) {
    throw new NotFoundError('Restaurant')
  }

  // Check if restaurant has orders or users
  const orders = await OrderService.getByRestaurant(id)
  const allUsers = await UserService.getAll()
  const restaurantUsers = allUsers.filter(user => user.restaurantId === id)

  if (orders.length > 0) {
    return res.status(400).json({ 
      error: 'Cannot delete restaurant with existing orders. Please archive instead.' 
    })
  }

  if (restaurantUsers.length > 0) {
    return res.status(400).json({ 
      error: 'Cannot delete restaurant with existing users. Please remove users first.' 
    })
  }

  // Delete restaurant
  await RestaurantService.delete(id)

  return res.status(200).json({ message: 'Restaurant deleted successfully' })
}