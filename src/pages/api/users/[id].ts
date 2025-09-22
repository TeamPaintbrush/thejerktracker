import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { requireAuth, requireAdmin } from '@/lib/auth'
import { updateUserSchema } from '@/lib/validation'
import bcrypt from 'bcryptjs'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'User ID is required' })
  }

  try {
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
  } catch (error) {
    console.error('User API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

async function handleGetUser(req: NextApiRequest, res: NextApiResponse, id: string) {
  const authenticatedReq = await requireAuth(req, res)
  if (!authenticatedReq) return

  try {
    // Build where clause based on user permissions
    let where: any = { id }

    // Non-admin users can only view themselves or users from their restaurant
    if (authenticatedReq.user.role !== 'ADMIN') {
      if (authenticatedReq.user.id === id) {
        // User viewing their own profile
      } else if (authenticatedReq.user.restaurantId) {
        // User viewing someone from their restaurant
        where.restaurantId = authenticatedReq.user.restaurantId
      } else {
        return res.status(403).json({ error: 'Access denied' })
      }
    }

    const user = await prisma.user.findFirst({
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
      }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    return res.status(200).json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    return res.status(500).json({ error: 'Failed to fetch user' })
  }
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
  const bodyValidation = updateUserSchema.safeParse(req.body)
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

  const { name, email, password, role, restaurantId } = bodyValidation.data

  try {
    // Verify user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Check email uniqueness if email is being updated
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email }
      })
      if (emailExists) {
        return res.status(409).json({ error: 'Email already in use' })
      }
    }

    // Only admins can change roles or restaurant assignments
    if (!isAdmin && (role || restaurantId !== undefined)) {
      return res.status(403).json({ error: 'Only admins can change roles or restaurant assignments' })
    }

    // Validate restaurant exists if provided
    if (restaurantId) {
      const restaurant = await prisma.restaurant.findUnique({
        where: { id: restaurantId }
      })
      
      if (!restaurant) {
        return res.status(400).json({ error: 'Restaurant not found' })
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
      updateData.password = await bcrypt.hash(password, 12)
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
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

    return res.status(200).json(updatedUser)
  } catch (error) {
    console.error('Error updating user:', error)
    return res.status(500).json({ error: 'Failed to update user' })
  }
}

async function handleDeleteUser(req: NextApiRequest, res: NextApiResponse, id: string) {
  // Only admins can delete users
  const authenticatedReq = await requireAdmin(req, res)
  if (!authenticatedReq) return

  try {
    // Verify user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Prevent deleting yourself
    if (authenticatedReq.user.id === id) {
      return res.status(400).json({ error: 'Cannot delete your own account' })
    }

    await prisma.user.delete({
      where: { id }
    })

    return res.status(200).json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return res.status(500).json({ error: 'Failed to delete user' })
  }
}