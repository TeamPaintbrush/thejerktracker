import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
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

// Query schema for user listing
const usersQuerySchema = z.object({
  restaurantId: z.string().uuid('Invalid restaurant ID').optional(),
  role: z.enum(['USER', 'STAFF', 'ADMIN']).optional(),
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
    role?: 'USER' | 'STAFF' | 'ADMIN'
    search?: string
  }>(
    usersQuerySchema, 
    req.query, 
    'Invalid query parameters'
  )
  
  const { restaurantId, role, search } = queryData

  try {
    // Build where clause based on user role
    let where: any = {}

    if (authenticatedReq.user.role === 'ADMIN') {
      // Admins can see all users, with optional filtering
      if (restaurantId) {
        where.restaurantId = restaurantId
      }
    } else {
      // Non-admin users can only see users from their restaurant
      where.restaurantId = authenticatedReq.user.restaurantId
    }

    // Apply role filter
    if (role) {
      where.role = role
    }

    // Apply search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        restaurantId: true,
        restaurant: {
          select: {
            id: true,
            name: true,
          }
        },
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return res.status(200).json({ users })
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
    role?: 'USER' | 'STAFF' | 'ADMIN'
    restaurantId?: string
  }>(createUserSchema, req.body, 'Validation failed')

  const { email, password, name, role = 'USER', restaurantId } = userData

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    throw new ConflictError('User with this email already exists')
  }

  // Validate restaurant exists if provided
  if (restaurantId) {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId }
    })
    
    if (!restaurant) {
      throw new NotFoundError('Restaurant')
    }
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12)

  // Create user data object
  const createData: any = {
    email,
    password: hashedPassword,
    name,
    role,
  }

  // Only include restaurantId if it's provided
  if (restaurantId) {
    createData.restaurantId = restaurantId
  }

  const newUser = await prisma.user.create({
    data: createData,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      restaurantId: true,
      restaurant: {
        select: {
          id: true,
          name: true,
        }
      },
      createdAt: true,
      updatedAt: true,
    }
  })

  return res.status(201).json(newUser)
}