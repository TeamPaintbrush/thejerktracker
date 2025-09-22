import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { requireAuth, requireAdmin } from '@/lib/auth'
import { createRestaurantSchema } from '@/lib/validation'
import { z } from 'zod'

// Query schema for restaurant listing
const restaurantsQuerySchema = z.object({
  search: z.string().max(200, 'Search term must be less than 200 characters').optional(),
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case 'GET':
        return handleGetRestaurants(req, res)
      case 'POST':
        return handleCreateRestaurant(req, res)
      default:
        res.setHeader('Allow', ['GET', 'POST'])
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Restaurants API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

async function handleGetRestaurants(req: NextApiRequest, res: NextApiResponse) {
  // Require authentication
  const authenticatedReq = await requireAuth(req, res)
  if (!authenticatedReq) return

  try {
    let restaurants
    
    if (authenticatedReq.user.role === 'ADMIN') {
      // Admins can see all restaurants
      restaurants = await prisma.restaurant.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          address: true,
          city: true,
          state: true,
          zipCode: true,
          website: true,
          description: true,
          logoUrl: true,
          createdAt: true,
          _count: {
            select: {
              orders: true,
              users: true
            }
          }
        },
        orderBy: { name: 'asc' }
      })
    } else {
      // Non-admin users can only see their own restaurant
      restaurants = await prisma.restaurant.findMany({
        where: { id: authenticatedReq.user.restaurantId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          address: true,
          city: true,
          state: true,
          zipCode: true,
          website: true,
          description: true,
          logoUrl: true,
          createdAt: true,
          _count: {
            select: {
              orders: true,
              users: true
            }
          }
        }
      })
    }

    return res.status(200).json(restaurants)
  } catch (error) {
    console.error('Error fetching restaurants:', error)
    return res.status(500).json({ error: 'Failed to fetch restaurants' })
  }
}

async function handleCreateRestaurant(req: NextApiRequest, res: NextApiResponse) {
  // Only admins can create restaurants
  const authenticatedReq = await requireAdmin(req, res)
  if (!authenticatedReq) return

  const {
    name,
    email,
    phone,
    address,
    city,
    state,
    zipCode,
    website,
    description,
    logoUrl
  } = req.body

  // Basic validation
  if (!name || !email) {
    return res.status(400).json({
      error: 'Missing required fields: name, email'
    })
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' })
  }

  try {
    // Check if restaurant with email already exists
    const existingRestaurant = await prisma.restaurant.findUnique({
      where: { email }
    })

    if (existingRestaurant) {
      return res.status(409).json({ error: 'Restaurant with this email already exists' })
    }

    const restaurant = await prisma.restaurant.create({
      data: {
        name,
        email,
        phone,
        address,
        city,
        state,
        zipCode,
        website,
        description,
        logoUrl
      }
    })

    return res.status(201).json(restaurant)
  } catch (error) {
    console.error('Error creating restaurant:', error)
    return res.status(500).json({ error: 'Failed to create restaurant' })
  }
}