import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { id } = req.query
  const { status, page = '1', limit = '10', startDate, endDate } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid restaurant ID' })
  }

  try {
    // Verify restaurant exists
    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
      select: { id: true, name: true }
    })

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' })
    }

    // Build where clause
    const where: any = { restaurantId: id }
    
    if (status && typeof status === 'string') {
      where.status = status
    }

    // Date filtering
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate && typeof startDate === 'string') {
        where.createdAt.gte = new Date(startDate)
      }
      if (endDate && typeof endDate === 'string') {
        where.createdAt.lte = new Date(endDate)
      }
    }

    // Pagination
    const pageNum = parseInt(page as string, 10)
    const limitNum = parseInt(limit as string, 10)
    const skip = (pageNum - 1) * limitNum

    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: true,
          createdBy: {
            select: { id: true, name: true, email: true }
          },
          updatedBy: {
            select: { id: true, name: true, email: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.order.count({ where })
    ])

    const totalPages = Math.ceil(totalCount / limitNum)

    return res.status(200).json({
      restaurant,
      orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalCount,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPreviousPage: pageNum > 1
      }
    })
  } catch (error) {
    console.error('Error fetching restaurant orders:', error)
    return res.status(500).json({ error: 'Failed to fetch restaurant orders' })
  }
}