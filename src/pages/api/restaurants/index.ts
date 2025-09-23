import { NextApiRequest, NextApiResponse } from 'next'
import { RestaurantService, OrderService, UserService } from '@/lib/dynamoService'
import { requireAuth, requireAdmin } from '@/lib/auth'
import { createRestaurantSchema } from '@/lib/validation'
import { z } from 'zod'
import { 
  asyncHandler, 
  ValidationError, 
  ConflictError, 
  NotFoundError,
  validateAndThrow 
} from '@/lib/errors'

// Query schema for restaurant listing
const restaurantsQuerySchema = z.object({
  search: z.string().max(200, 'Search term must be less than 200 characters').optional(),
})

export default asyncHandler(async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case 'GET':
      return handleGetRestaurants(req, res)
    case 'POST':
      return handleCreateRestaurant(req, res)
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      return res.status(405).json({ error: 'Method not allowed' })
  }
})

async function handleGetRestaurants(req: NextApiRequest, res: NextApiResponse) {
  // Require authentication
  const authenticatedReq = await requireAuth(req, res)
  if (!authenticatedReq) return

  // Validate query parameters
  const queryData = validateAndThrow<{
    search?: string
  }>(
    restaurantsQuerySchema, 
    req.query, 
    'Invalid query parameters'
  )
  
  const { search } = queryData

  let restaurants = await RestaurantService.getAll()

  // Filter based on user role
  if (authenticatedReq.user.role !== 'ADMIN') {
    // Non-admin users can only see their own restaurant
    if (authenticatedReq.user.restaurantId) {
      restaurants = restaurants.filter(r => r.id === authenticatedReq.user.restaurantId)
    } else {
      restaurants = []
    }
  }

  // Apply search filter if provided
  if (search) {
    const searchLower = search.toLowerCase()
    restaurants = restaurants.filter(restaurant =>
      restaurant.name.toLowerCase().includes(searchLower) ||
      restaurant.email.toLowerCase().includes(searchLower)
    )
  }

  // Get counts for each restaurant
  const restaurantsWithCounts = await Promise.all(
    restaurants.map(async (restaurant) => {
      const orders = await OrderService.getByRestaurant(restaurant.id)
      const users = await UserService.getAll()
      const restaurantUsers = users.filter(user => user.restaurantId === restaurant.id)

      return {
        id: restaurant.id,
        name: restaurant.name,
        email: restaurant.email,
        phone: restaurant.phone,
        address: restaurant.address,
        city: restaurant.city,
        state: restaurant.state,
        zipCode: restaurant.zipCode,
        website: restaurant.website,
        description: restaurant.description,
        logoUrl: restaurant.logoUrl,
        createdAt: restaurant.createdAt,
        _count: {
          orders: orders.length,
          users: restaurantUsers.length
        }
      }
    })
  )

  // Sort by name
  restaurantsWithCounts.sort((a, b) => a.name.localeCompare(b.name))

  return res.status(200).json(restaurantsWithCounts)
}

async function handleCreateRestaurant(req: NextApiRequest, res: NextApiResponse) {
  // Only admins can create restaurants
  const authenticatedReq = await requireAdmin(req, res)
  if (!authenticatedReq) return

  // Validate request body
  const restaurantData = validateAndThrow<{
    name: string
    email: string
    phone?: string
    address?: string
    city?: string
    state?: string
    zipCode?: string
    website?: string
    description?: string
    logoUrl?: string
  }>(createRestaurantSchema, req.body, 'Validation failed')

  const { name, email, phone, address, city, state, zipCode, website, description, logoUrl } = restaurantData

  // Check if restaurant with email already exists
  const existingRestaurant = await RestaurantService.findByEmail(email)
  if (existingRestaurant) {
    throw new ConflictError('Restaurant with this email already exists')
  }

  const restaurant = await RestaurantService.create({
    name,
    email,
    phone: phone || null,
    address: address || null,
    city: city || null,
    state: state || null,
    zipCode: zipCode || null,
    website: website || null,
    description: description || null,
    logoUrl: logoUrl || null
  })

  return res.status(201).json(restaurant)
}