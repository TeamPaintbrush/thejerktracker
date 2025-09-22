import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { requireStaffOrAdmin, requireSameRestaurant } from '@/lib/auth'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid order ID' })
  }

  try {
    switch (req.method) {
      case 'GET':
        return handleGetOrder(id, req, res)
      case 'PUT':
        return handleUpdateOrder(id, req, res)
      case 'DELETE':
        return handleDeleteOrder(id, req, res)
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Order API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

async function handleGetOrder(id: string, req: NextApiRequest, res: NextApiResponse) {
  // Require authentication
  const authenticatedReq = await requireStaffOrAdmin(req, res)
  if (!authenticatedReq) return

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        restaurant: {
          select: { id: true, name: true, phone: true, address: true }
        },
        createdBy: {
          select: { id: true, name: true, email: true }
        },
        updatedBy: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    // Check restaurant access (non-admin users can only access their restaurant's orders)
    if (authenticatedReq.user.role !== 'ADMIN' && 
        order.restaurantId !== authenticatedReq.user.restaurantId) {
      return res.status(403).json({ error: 'Access denied. You can only access orders from your restaurant.' })
    }

    return res.status(200).json(order)
  } catch (error) {
    console.error('Error fetching order:', error)
    return res.status(500).json({ error: 'Failed to fetch order' })
  }
}

async function handleUpdateOrder(id: string, req: NextApiRequest, res: NextApiResponse) {
  // Require authentication
  const authenticatedReq = await requireStaffOrAdmin(req, res)
  if (!authenticatedReq) return

  const {
    customerName,
    customerPhone,
    customerEmail,
    totalAmount,
    status,
    orderType,
    notes,
    specialRequests,
    deliveryAddress,
    estimatedTime,
    actualTime,
    items,
    updatedById
  } = req.body

  try {
    // Verify order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: { items: true }
    })

    if (!existingOrder) {
      return res.status(404).json({ error: 'Order not found' })
    }

    // Check restaurant access (non-admin users can only update their restaurant's orders)
    if (authenticatedReq.user.role !== 'ADMIN' && 
        existingOrder.restaurantId !== authenticatedReq.user.restaurantId) {
      return res.status(403).json({ error: 'Access denied. You can only update orders from your restaurant.' })
    }

    // Prepare update data
    const updateData: any = {
      updatedById: authenticatedReq.user.id
    }

    if (customerName) updateData.customerName = customerName
    if (customerPhone) updateData.customerPhone = customerPhone
    if (customerEmail !== undefined) updateData.customerEmail = customerEmail
    if (totalAmount) updateData.totalAmount = parseFloat(totalAmount)
    if (status) updateData.status = status
    if (orderType) updateData.orderType = orderType
    if (notes !== undefined) updateData.notes = notes
    if (specialRequests !== undefined) updateData.specialRequests = specialRequests
    if (deliveryAddress !== undefined) updateData.deliveryAddress = deliveryAddress
    if (estimatedTime) updateData.estimatedTime = new Date(estimatedTime)
    if (actualTime) updateData.actualTime = new Date(actualTime)

    // Update order in transaction
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Update order
      const order = await tx.order.update({
        where: { id },
        data: updateData
      })

      // Update items if provided
      if (items && Array.isArray(items)) {
        // Delete existing items
        await tx.orderItem.deleteMany({
          where: { orderId: id }
        })

        // Create new items
        await tx.orderItem.createMany({
          data: items.map((item: any) => ({
            orderId: id,
            name: item.name,
            quantity: parseInt(item.quantity, 10),
            price: parseFloat(item.price),
            notes: item.notes
          }))
        })
      }

      // Return updated order with items
      return tx.order.findUnique({
        where: { id },
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
    })

    return res.status(200).json(updatedOrder)
  } catch (error) {
    console.error('Error updating order:', error)
    return res.status(500).json({ error: 'Failed to update order' })
  }
}

async function handleDeleteOrder(id: string, req: NextApiRequest, res: NextApiResponse) {
  // Require admin role for deleting orders
  const authenticatedReq = await requireStaffOrAdmin(req, res)
  if (!authenticatedReq) return

  try {
    // Verify order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id }
    })

    if (!existingOrder) {
      return res.status(404).json({ error: 'Order not found' })
    }

    // Check restaurant access (non-admin users can only delete their restaurant's orders)
    if (authenticatedReq.user.role !== 'ADMIN' && 
        existingOrder.restaurantId !== authenticatedReq.user.restaurantId) {
      return res.status(403).json({ error: 'Access denied. You can only delete orders from your restaurant.' })
    }

    // Delete order (items will be deleted due to cascade)
    await prisma.order.delete({
      where: { id }
    })

    return res.status(200).json({ message: 'Order deleted successfully' })
  } catch (error) {
    console.error('Error deleting order:', error)
    return res.status(500).json({ error: 'Failed to delete order' })
  }
}