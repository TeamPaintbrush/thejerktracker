import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid restaurant ID' })
  }

  try {
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
  } catch (error) {
    console.error('Restaurant API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

async function handleGetRestaurant(id: string, res: NextApiResponse) {
  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true
          }
        },
        orders: {
          select: {
            id: true,
            orderNumber: true,
            customerName: true,
            status: true,
            totalAmount: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 10 // Latest 10 orders
        },
        _count: {
          select: {
            orders: true,
            users: true
          }
        }
      }
    })

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' })
    }

    return res.status(200).json(restaurant)
  } catch (error) {
    console.error('Error fetching restaurant:', error)
    return res.status(500).json({ error: 'Failed to fetch restaurant' })
  }
}

async function handleUpdateRestaurant(id: string, req: NextApiRequest, res: NextApiResponse) {
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

  try {
    // Verify restaurant exists
    const existingRestaurant = await prisma.restaurant.findUnique({
      where: { id }
    })

    if (!existingRestaurant) {
      return res.status(404).json({ error: 'Restaurant not found' })
    }

    // If email is being changed, check it's not taken
    if (email && email !== existingRestaurant.email) {
      const emailExists = await prisma.restaurant.findUnique({
        where: { email }
      })

      if (emailExists) {
        return res.status(409).json({ error: 'Email already in use by another restaurant' })
      }
    }

    // Prepare update data
    const updateData: any = {}
    if (name) updateData.name = name
    if (email) updateData.email = email
    if (phone !== undefined) updateData.phone = phone
    if (address !== undefined) updateData.address = address
    if (city !== undefined) updateData.city = city
    if (state !== undefined) updateData.state = state
    if (zipCode !== undefined) updateData.zipCode = zipCode
    if (website !== undefined) updateData.website = website
    if (description !== undefined) updateData.description = description
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl

    const updatedRestaurant = await prisma.restaurant.update({
      where: { id },
      data: updateData
    })

    return res.status(200).json(updatedRestaurant)
  } catch (error) {
    console.error('Error updating restaurant:', error)
    return res.status(500).json({ error: 'Failed to update restaurant' })
  }
}

async function handleDeleteRestaurant(id: string, res: NextApiResponse) {
  try {
    // Verify restaurant exists
    const existingRestaurant = await prisma.restaurant.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            orders: true,
            users: true
          }
        }
      }
    })

    if (!existingRestaurant) {
      return res.status(404).json({ error: 'Restaurant not found' })
    }

    // Check if restaurant has orders or users
    if (existingRestaurant._count.orders > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete restaurant with existing orders. Please archive instead.' 
      })
    }

    if (existingRestaurant._count.users > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete restaurant with existing users. Please remove users first.' 
      })
    }

    // Delete restaurant
    await prisma.restaurant.delete({
      where: { id }
    })

    return res.status(200).json({ message: 'Restaurant deleted successfully' })
  } catch (error) {
    console.error('Error deleting restaurant:', error)
    return res.status(500).json({ error: 'Failed to delete restaurant' })
  }
}