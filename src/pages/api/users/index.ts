import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Get user session
  const session = await getServerSession(req, res, {})

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    switch (req.method) {
      case 'GET':
        return handleGetUsers(req, res, session)
      default:
        res.setHeader('Allow', ['GET'])
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Users API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

async function handleGetUsers(req: NextApiRequest, res: NextApiResponse, session: any) {
  try {
    const { restaurantId } = req.query

    // Build where clause - users can only see users from their restaurant
    const where: any = {
      restaurantId: session.user.restaurantId
    }

    // If specific restaurant requested and user is admin, allow it
    if (restaurantId && session.user.role === 'ADMIN') {
      where.restaurantId = restaurantId as string
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        restaurantId: true,
        createdAt: true,
        updatedAt: true,
        restaurant: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return res.status(200).json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return res.status(500).json({ error: 'Failed to fetch users' })
  }
}