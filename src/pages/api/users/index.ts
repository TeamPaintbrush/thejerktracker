import { NextApiRequest, NextApiResponse } from 'next'
import { UserService, RestaurantService } from '@/lib/dynamoService'
import { requireAdmin, requireAuth } from '@/lib/auth'
import { createUserSchema } from '@/lib/validation'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { 
  asyncHandler, 
  ValidationError, 
  ConflictError, 
  NotFoundError,
  validateAndThrow 
} from '@/lib/errors'
import { UserRole } from '@/types/api'

// Query schema for user listing
const usersQuerySchema = z.object({
  restaurantId: z.string().uuid('Invalid restaurant ID').optional(),
  role: z.enum(['CUSTOMER', 'ADMIN']).optional(),
  search: z.string().max(200, 'Search term must be less than 200 characters').optional(),
})

export default asyncHandler(async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case 'GET':
      return handleGetUsers(req, res)
    case 'POST':
      return handleCreateUser(req, res)
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      return res.status(405).json({ error: 'Method not allowed' })
  }
})

async function handleGetUsers(req: NextApiRequest, res: NextApiResponse) {
  // Require authentication
  const authenticatedReq = await requireAuth(req, res)
  if (!authenticatedReq) return

  // Validate query parameters
  const queryData = validateAndThrow<{
    restaurantId?: string
    role?: 'CUSTOMER' | 'ADMIN'
    search?: string
  }>(
    usersQuerySchema, 
    req.query, 
    'Invalid query parameters'
  )
  
  const { restaurantId, role, search } = queryData

  try {
    // Get all users
    const allUsers = await UserService.getAll()

    // Filter based on user role and permissions
    let filteredUsers = allUsers

    if (authenticatedReq.user.role !== 'ADMIN') {
      // Non-admin users can only see users from their restaurant
      filteredUsers = allUsers.filter(user => 
        user.restaurantId === authenticatedReq.user.restaurantId
      )
    } else if (restaurantId) {
      // Admins can filter by restaurant
      filteredUsers = allUsers.filter(user => 
        user.restaurantId === restaurantId
      )
    }

    // Apply role filter
    if (role) {
      filteredUsers = filteredUsers.filter(user => user.role === role)
    }

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase()
      filteredUsers = filteredUsers.filter(user =>
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      )
    }

    // Get restaurant data for users
    const usersWithRestaurants = await Promise.all(
      filteredUsers.map(async (user) => {
        let restaurant = null
        if (user.restaurantId) {
          restaurant = await RestaurantService.findById(user.restaurantId)
        }
        
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          restaurantId: user.restaurantId,
          restaurant: restaurant ? {
            id: restaurant.id,
            name: restaurant.name,
          } : null,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        }
      })
    )

    // Sort by creation date (newest first)
    usersWithRestaurants.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    return res.status(200).json({ users: usersWithRestaurants })
  } catch (error) {
    throw error // Let asyncHandler handle it
  }
}

async function handleCreateUser(req: NextApiRequest, res: NextApiResponse) {
  // Require admin privileges for creating users
  const authenticatedReq = await requireAdmin(req, res)
  if (!authenticatedReq) return

  // Validate request body
  const userData = validateAndThrow<{
    email: string
    password: string
    name: string
    role?: 'CUSTOMER' | 'ADMIN'
    restaurantId?: string
  }>(createUserSchema, req.body, 'Validation failed')

  const { email, password, name, role = 'CUSTOMER', restaurantId } = userData

  // Check if user already exists
  const existingUser = await UserService.findByEmail(email)

  if (existingUser) {
    throw new ConflictError('User with this email already exists')
  }

  // Validate restaurant exists if provided
  if (restaurantId) {
    const restaurant = await RestaurantService.findById(restaurantId)
    
    if (!restaurant) {
      throw new NotFoundError('Restaurant')
    }
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12)

  // Create user
  const newUser = await UserService.create({
    email,
    password, // UserService will hash it
    name,
    role: role as UserRole,
    restaurantId: restaurantId || null,
  })

  // Get restaurant data if user has one
  let restaurant = null
  if (newUser.restaurantId) {
    restaurant = await RestaurantService.findById(String(newUser.restaurantId))
  }

  const response = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    restaurantId: newUser.restaurantId,
    restaurant: restaurant ? {
      id: restaurant.id,
      name: restaurant.name,
    } : null,
    createdAt: newUser.createdAt,
    updatedAt: newUser.updatedAt,
  }

  return res.status(201).json(response)
}