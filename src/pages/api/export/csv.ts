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

  const { restaurantId, startDate, endDate, status } = req.query

  try {
    // Build where clause
    const where: any = {}
    
    if (restaurantId && typeof restaurantId === 'string') {
      where.restaurantId = restaurantId
    }
    
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

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: true,
        restaurant: {
          select: { name: true }
        },
        createdBy: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Generate CSV content
    const csvHeaders = [
      'Order Number',
      'Customer Name',
      'Customer Phone',
      'Customer Email',
      'Restaurant',
      'Status',
      'Order Type',
      'Total Amount',
      'Items',
      'Notes',
      'Special Requests',
      'Delivery Address',
      'Created At',
      'Created By',
      'Estimated Time',
      'Actual Time'
    ]

    const csvRows = orders.map(order => {
      const items = order.items.map(item => 
        `${item.name} (${item.quantity}x$${item.price})`
      ).join('; ')

      return [
        order.orderNumber,
        order.customerName,
        order.customerPhone,
        order.customerEmail || '',
        order.restaurant.name,
        order.status,
        order.orderType,
        order.totalAmount,
        items,
        order.notes || '',
        order.specialRequests || '',
        order.deliveryAddress || '',
        order.createdAt.toISOString(),
        order.createdBy?.name || 'System',
        order.estimatedTime?.toISOString() || '',
        order.actualTime?.toISOString() || ''
      ]
    })

    // Convert to CSV format
    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => 
        row.map(field => 
          typeof field === 'string' && field.includes(',') 
            ? `"${field.replace(/"/g, '""')}"` 
            : field
        ).join(',')
      )
    ].join('\n')

    // Set response headers for CSV download
    const filename = `orders_export_${new Date().toISOString().split('T')[0]}.csv`
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    
    return res.status(200).send(csvContent)
  } catch (error) {
    console.error('Error exporting orders:', error)
    return res.status(500).json({ error: 'Failed to export orders' })
  }
}