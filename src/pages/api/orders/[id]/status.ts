import { NextApiRequest, NextApiResponse } from 'next'
import { OrderService } from '@/lib/dynamoService'
import { requireStaffOrAdmin } from '@/lib/auth'
import { 
  asyncHandler, 
  ValidationError, 
  NotFoundError,
  validateAndThrow 
} from '@/lib/errors'
import { z } from 'zod'
import { OrderStatus } from '@/types/api'

const updateStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
  updatedById: z.string().uuid().optional(),
  estimatedTime: z.string().datetime().optional(),
  actualTime: z.string().datetime().optional(),
})

export default asyncHandler(async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'PATCH') {
    res.setHeader('Allow', ['PATCH'])
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { id } = req.query

  if (!id || typeof id !== 'string') {
    throw new ValidationError('Invalid order ID')
  }

  // Require authentication
  const authenticatedReq = await requireStaffOrAdmin(req, res)
  if (!authenticatedReq) return

  // Validate request body
  const validatedData = validateAndThrow(updateStatusSchema, req.body)

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
    status: validatedData.status,
    updatedBy: validatedData.updatedById || authenticatedReq.user.id,
    updatedAt: new Date().toISOString()
  }

  // Set actual time when order is delivered/completed
  if (validatedData.status === OrderStatus.DELIVERED && !existingOrder.actualTime) {
    updateData.actualTime = validatedData.actualTime || new Date().toISOString()
  }

  // Set estimated time if provided
  if (validatedData.estimatedTime) {
    updateData.estimatedTime = validatedData.estimatedTime
  }

  const updatedOrder = await OrderService.update(id, updateData)

  return res.status(200).json(updatedOrder)
})