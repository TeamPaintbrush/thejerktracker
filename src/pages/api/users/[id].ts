import { NextApiRequest, NextApiResponse } from 'next'
import { UserService, RestaurantService } from '@/lib/dynamoService'
import { requireAuth, requireAdmin } from '@/lib/auth'
import { updateUserSchema } from '@/lib/validation'
import bcrypt from 'bcryptjs'
import { 
  asyncHandler, 
  ValidationError, 
  ConflictError, 
  NotFoundError,
  validateAndThrow 
} from '@/lib/errors'
import { UserRole, User } from '@/types/api'

export default asyncHandler(async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'User ID is required' })
  }

  switch (req.method) {
    case 'GET':
      return handleGetUser(req, res, id)
    case 'PUT':
      return handleUpdateUser(req, res, id)
    case 'DELETE':
      return handleDeleteUser(req, res, id)
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
      return res.status(405).json({ error: 'Method not allowed' })
  }
})

async function handleGetUser(req: NextApiRequest, res: NextApiResponse, id: string) {
  const authenticatedReq = await requireAuth(req, res)
  if (!authenticatedReq) return

  // Find the user
  const user = await UserService.findById(id)
  
  if (!user) {
    throw new NotFoundError('User')
  }

  // Check permissions - non-admin users can only view themselves or users from their restaurant
  if (authenticatedReq.user.role !== 'ADMIN') {
    if (authenticatedReq.user.id !== id) {
      if (!authenticatedReq.user.restaurantId || user.restaurantId !== authenticatedReq.user.restaurantId) {
        return res.status(403).json({ error: 'Access denied' })
      }
    }
  }

  // Get restaurant data if user has one
  let restaurant = null
  if (user.restaurantId) {
    restaurant = await RestaurantService.findById(user.restaurantId)
  }

  const response = {
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

  return res.status(200).json(response)
}

async function handleUpdateUser(req: NextApiRequest, res: NextApiResponse, id: string) {
  const authenticatedReq = await requireAuth(req, res)
  if (!authenticatedReq) return

  // Check if user can update this profile
  const isOwnProfile = authenticatedReq.user.id === id
  const isAdmin = authenticatedReq.user.role === 'ADMIN'

  if (!isOwnProfile && !isAdmin) {
    return res.status(403).json({ error: 'Access denied' })
  }

  // Validate request body
  const userData = validateAndThrow<{
    name?: string
    email?: string
    password?: string
    role?: 'CUSTOMER' | 'ADMIN'
    restaurantId?: string
  }>(updateUserSchema, req.body, 'Validation failed')

  const { name, email, password, role, restaurantId } = userData

  // Verify user exists
  const existingUser = await UserService.findById(id)
  if (!existingUser) {
    throw new NotFoundError('User')
  }

  // Check email uniqueness if email is being updated
  if (email && email !== existingUser.email) {
    const emailExists = await UserService.findByEmail(email)
    if (emailExists) {
      throw new ConflictError('Email already in use')
    }
  }

  // Only admins can change roles or restaurant assignments
  if (!isAdmin && (role || restaurantId !== undefined)) {
    return res.status(403).json({ error: 'Only admins can change roles or restaurant assignments' })
  }

  // Validate restaurant exists if provided
  if (restaurantId) {
    const restaurant = await RestaurantService.findById(restaurantId)
    if (!restaurant) {
      throw new NotFoundError('Restaurant')
    }
  }

  // Prepare update data
  const updateData: any = {}
  if (name) updateData.name = name
  if (email) updateData.email = email
  if (role && isAdmin) updateData.role = role
  if (restaurantId !== undefined && isAdmin) updateData.restaurantId = restaurantId

  // Handle password update
  if (password) {
    updateData.password = password // UserService will hash it
  }

  const updatedUser = await UserService.update(id, updateData) as User

  if (!updatedUser) {
    throw new Error('Failed to update user')
  }

  // Get restaurant data if user has one
  let restaurant = null
  if (updatedUser.restaurantId) {
    restaurant = await RestaurantService.findById(updatedUser.restaurantId)
  }

  const response = {
    id: updatedUser.id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
    restaurantId: updatedUser.restaurantId,
    restaurant: restaurant ? {
      id: restaurant.id,
      name: restaurant.name,
    } : null,
    createdAt: updatedUser.createdAt,
    updatedAt: updatedUser.updatedAt,
  }

  return res.status(200).json(response)
}

async function handleDeleteUser(req: NextApiRequest, res: NextApiResponse, id: string) {
  // Only admins can delete users
  const authenticatedReq = await requireAdmin(req, res)
  if (!authenticatedReq) return

  // Verify user exists
  const existingUser = await UserService.findById(id)
  if (!existingUser) {
    throw new NotFoundError('User')
  }

  // Prevent deleting yourself
  if (authenticatedReq.user.id === id) {
    return res.status(400).json({ error: 'Cannot delete your own account' })
  }

  await UserService.delete(id)

  return res.status(200).json({ message: 'User deleted successfully' })
}