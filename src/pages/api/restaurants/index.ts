import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

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
  try {
    const restaurants = await prisma.restaurant.findMany({
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

    return res.status(200).json(restaurants)
  } catch (error) {
    console.error('Error fetching restaurants:', error)
    return res.status(500).json({ error: 'Failed to fetch restaurants' })
  }
}

async function handleCreateRestaurant(req: NextApiRequest, res: NextApiResponse) {
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