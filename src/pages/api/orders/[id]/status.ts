import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'PATCH') {
    res.setHeader('Allow', ['PATCH'])
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { id } = req.query
  const { status, updatedById, estimatedTime, actualTime } = req.body

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid order ID' })
  }

  if (!status) {
    return res.status(400).json({ error: 'Status is required' })
  }

  const validStatuses = ['PENDING', 'IN_PROGRESS', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ 
      error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
    })
  }

  try {
    // Verify order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id }
    })

    if (!existingOrder) {
      return res.status(404).json({ error: 'Order not found' })
    }

    // Prepare update data
    const updateData: any = {
      status,
      updatedById
    }

    // Set actual time when order is delivered
    if (status === 'DELIVERED' && !existingOrder.actualTime) {
      updateData.actualTime = actualTime ? new Date(actualTime) : new Date()
    }

    // Set estimated time if provided
    if (estimatedTime) {
      updateData.estimatedTime = new Date(estimatedTime)
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        items: true,
        restaurant: {
          select: { id: true, name: true }
        },
        createdBy: {
          select: { id: true, name: true, email: true }
        },
        updatedBy: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    return res.status(200).json(updatedOrder)
  } catch (error) {
    console.error('Error updating order status:', error)
    return res.status(500).json({ error: 'Failed to update order status' })
  }
}