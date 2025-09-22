import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { name, email, password, restaurantId, role = 'STAFF' } = req.body

    // Basic validation
    if (!name || !email || !password || !restaurantId) {
      return res.status(400).json({
        error: 'Missing required fields: name, email, password, restaurantId'
      })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' })
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' })
    }

    // Validate role
    const validRoles = ['ADMIN', 'STAFF', 'DRIVER']
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' })
    }

    // Verify restaurant exists
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId }
    })

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        restaurantId
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        restaurantId: true,
        createdAt: true,
        restaurant: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return res.status(201).json({
      message: 'User created successfully',
      user
    })
  } catch (error) {
    console.error('Registration error:', error)
    return res.status(500).json({ error: 'Failed to create user' })
  }
}