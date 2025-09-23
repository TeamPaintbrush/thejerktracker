import { NextApiRequest, NextApiResponse } from 'next'
import { OrderService, RestaurantService, UserService } from '@/lib/dynamoService'
import { requireStaffOrAdmin } from '@/lib/auth'
import { updateOrderSchema } from '@/lib/validation'
import { 
  asyncHandler, 
  ValidationError, 
  NotFoundError,
  validateAndThrow 
} from '@/lib/errors'
import { z } from 'zod'

// Extended update schema for this API
const updateOrderWithItemsSchema = updateOrderSchema.extend({
  items: z.array(z.object({
    name: z.string().min(1, 'Item name is required').max(200, 'Item name must be less than 200 characters'),
    quantity: z.number().int().min(1, 'Quantity must be at least 1'),
    price: z.number().min(0, 'Price must be non-negative'),
    notes: z.string().max(200, 'Item notes must be less than 200 characters').optional(),
  })).optional(),
})

export default asyncHandler(async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query

  if (!id || typeof id !== 'string') {
    throw new ValidationError('Invalid order ID')
  }

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
})

async function handleGetOrder(id: string, req: NextApiRequest, res: NextApiResponse) {
  // Require authentication
  const authenticatedReq = await requireStaffOrAdmin(req, res)
  if (!authenticatedReq) return

  const order = await OrderService.findById(id)

  if (!order) {
    throw new NotFoundError('Order not found')
  }

  // Check restaurant access (non-admin users can only access their restaurant's orders)
  if (authenticatedReq.user.role !== 'ADMIN' && 
      order.restaurantId !== authenticatedReq.user.restaurantId) {
    return res.status(403).json({ error: 'Access denied. You can only access orders from your restaurant.' })
  }

  return res.status(200).json(order)
}

async function handleUpdateOrder(id: string, req: NextApiRequest, res: NextApiResponse) {
  // Require authentication
  const authenticatedReq = await requireStaffOrAdmin(req, res)
  if (!authenticatedReq) return

  // Validate request body
  const validatedData = validateAndThrow(updateOrderWithItemsSchema, req.body)

  // Verify order exists
  const existingOrder = await OrderService.findById(id)

  if (!existingOrder) {
    throw new NotFoundError('Order not found')
  }

  // Check restaurant access (non-admin users can only update their restaurant's orders)
  if (authenticatedReq.user.role !== 'ADMIN' && 
      existingOrder.restaurantId !== authenticatedReq.user.restaurantId) {
    return res.status(403).json({ error: 'Access denied. You can only update orders from your restaurant.' })
  }

  // Prepare update data
  const updateData: any = {
    ...validatedData,
    updatedBy: authenticatedReq.user.id,
    updatedAt: new Date().toISOString()
  }

  // Remove items from updateData as they're handled separately in DynamoDB
  const { items, ...orderUpdateData } = updateData

  // Update order
  const updatedOrder = await OrderService.update(id, orderUpdateData)

  return res.status(200).json(updatedOrder)
}

async function handleDeleteOrder(id: string, req: NextApiRequest, res: NextApiResponse) {
  // Require admin role for deleting orders
  const authenticatedReq = await requireStaffOrAdmin(req, res)
  if (!authenticatedReq) return

  // Verify order exists
  const existingOrder = await OrderService.findById(id)

  if (!existingOrder) {
    throw new NotFoundError('Order not found')
  }

  // Check restaurant access (non-admin users can only delete their restaurant's orders)
  if (authenticatedReq.user.role !== 'ADMIN' && 
      existingOrder.restaurantId !== authenticatedReq.user.restaurantId) {
    return res.status(403).json({ error: 'Access denied. You can only delete orders from your restaurant.' })
  }

  // Delete order
  await OrderService.delete(id)

  return res.status(200).json({ message: 'Order deleted successfully' })
}