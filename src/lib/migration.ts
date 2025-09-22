import { prisma } from '@/lib/prisma'
import { Order as LegacyOrder } from '@/types/order'
import { OrderStatus, OrderType } from '@prisma/client'

const STORAGE_KEY = 'jerk-tracker-orders'

// Default restaurant for migration (will be created if doesn't exist)
const DEFAULT_RESTAURANT = {
  id: 'default-restaurant',
  name: 'TheJERKTracker Restaurant',
  email: 'admin@thejerktracker.com',
  phone: '(555) 123-4567',
  address: '123 Main Street',
  city: 'Anytown',
  state: 'NY',
  zipCode: '12345'
}

// Status mapping from legacy to new schema
const STATUS_MAPPING: Record<LegacyOrder['status'], OrderStatus> = {
  'Pending': 'PENDING',
  'Preparing': 'IN_PROGRESS',
  'Ready': 'READY',
  'Out for Delivery': 'OUT_FOR_DELIVERY',
  'Picked Up': 'DELIVERED',
  'Cancelled': 'CANCELLED'
}

// Utility functions
function getLegacyOrders(): LegacyOrder[] {
  if (typeof window === 'undefined') {
    console.log('Running on server side - no localStorage access')
    return []
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      console.log('No legacy orders found in localStorage')
      return []
    }
    
    const orders = JSON.parse(stored)
    return orders.map((order: any) => ({
      ...order,
      createdAt: new Date(order.createdAt),
      updatedAt: order.updatedAt ? new Date(order.updatedAt) : undefined,
      preparingAt: order.preparingAt ? new Date(order.preparingAt) : undefined,
      readyAt: order.readyAt ? new Date(order.readyAt) : undefined,
      outForDeliveryAt: order.outForDeliveryAt ? new Date(order.outForDeliveryAt) : undefined,
      pickedUpAt: order.pickedUpAt ? new Date(order.pickedUpAt) : undefined,
      cancelledAt: order.cancelledAt ? new Date(order.cancelledAt) : undefined,
    }))
  } catch (error) {
    console.error('Error reading legacy orders:', error)
    return []
  }
}

function extractItemsFromOrderDetails(orderDetails?: string): Array<{ name: string; quantity: number; price: number }> {
  if (!orderDetails) {
    return [{ name: 'Order Item', quantity: 1, price: 0 }]
  }

  // Try to parse structured data or create a default item
  try {
    // If orderDetails contains structured data (JSON), parse it
    if (orderDetails.startsWith('[') || orderDetails.startsWith('{')) {
      const parsed = JSON.parse(orderDetails)
      if (Array.isArray(parsed)) {
        return parsed.map((item: any) => ({
          name: item.name || item.item || 'Unknown Item',
          quantity: parseInt(item.quantity || '1', 10),
          price: parseFloat(item.price || '0')
        }))
      }
    }
    
    // Otherwise, treat as a single item description
    return [{ 
      name: orderDetails, 
      quantity: 1, 
      price: 0 // Legacy data doesn't have pricing
    }]
  } catch (error) {
    return [{ 
      name: orderDetails, 
      quantity: 1, 
      price: 0 
    }]
  }
}

function calculateTotalAmount(items: Array<{ name: string; quantity: number; price: number }>): number {
  return items.reduce((total, item) => total + (item.quantity * item.price), 0)
}

// Main migration functions
export async function ensureDefaultRestaurant() {
  try {
    let restaurant = await prisma.restaurant.findUnique({
      where: { id: DEFAULT_RESTAURANT.id }
    })

    if (!restaurant) {
      restaurant = await prisma.restaurant.create({
        data: DEFAULT_RESTAURANT
      })
      console.log('Created default restaurant for migration')
    }

    return restaurant
  } catch (error) {
    console.error('Error ensuring default restaurant:', error)
    throw error
  }
}

export async function migrateLegacyOrders(): Promise<{
  success: boolean
  migratedCount: number
  skippedCount: number
  errors: string[]
}> {
  const result = {
    success: false,
    migratedCount: 0,
    skippedCount: 0,
    errors: [] as string[]
  }

  try {
    console.log('Starting legacy order migration...')

    // Ensure default restaurant exists
    const restaurant = await ensureDefaultRestaurant()

    // Get legacy orders
    const legacyOrders = getLegacyOrders()
    console.log(`Found ${legacyOrders.length} legacy orders`)

    if (legacyOrders.length === 0) {
      result.success = true
      return result
    }

    // Check for existing migrated orders
    const existingOrders = await prisma.order.findMany({
      select: { orderNumber: true }
    })
    const existingOrderNumbers = new Set(existingOrders.map(o => o.orderNumber))

    // Migrate each order
    for (const legacyOrder of legacyOrders) {
      try {
        // Skip if already migrated
        if (existingOrderNumbers.has(legacyOrder.orderNumber)) {
          console.log(`Skipping order ${legacyOrder.orderNumber} - already exists`)
          result.skippedCount++
          continue
        }

        // Extract order items
        const items = extractItemsFromOrderDetails(legacyOrder.orderDetails)
        const totalAmount = calculateTotalAmount(items)

        // Map status
        const status = STATUS_MAPPING[legacyOrder.status] || 'PENDING'

        // Create order with items in transaction
        await prisma.$transaction(async (tx) => {
          const newOrder = await tx.order.create({
            data: {
              orderNumber: legacyOrder.orderNumber,
              customerName: legacyOrder.customerName || 'Legacy Customer',
              customerPhone: '000-000-0000', // Legacy data doesn't have phone
              customerEmail: legacyOrder.customerEmail,
              totalAmount,
              status,
              orderType: 'TAKEOUT' as OrderType, // Default for legacy orders
              notes: legacyOrder.notes,
              restaurantId: restaurant.id,
              createdAt: legacyOrder.createdAt,
              updatedAt: legacyOrder.updatedAt || legacyOrder.createdAt,
              // Map timestamp fields if they exist
              estimatedTime: legacyOrder.readyAt,
              actualTime: legacyOrder.pickedUpAt || legacyOrder.outForDeliveryAt,
              items: {
                create: items.map(item => ({
                  name: item.name,
                  quantity: item.quantity,
                  price: item.price
                }))
              }
            }
          })

          console.log(`Migrated order: ${newOrder.orderNumber}`)
        })

        result.migratedCount++
      } catch (error) {
        const errorMsg = `Failed to migrate order ${legacyOrder.orderNumber}: ${error}`
        console.error(errorMsg)
        result.errors.push(errorMsg)
      }
    }

    result.success = result.errors.length === 0 || result.migratedCount > 0
    console.log(`Migration completed: ${result.migratedCount} migrated, ${result.skippedCount} skipped, ${result.errors.length} errors`)

    return result
  } catch (error) {
    console.error('Migration failed:', error)
    result.errors.push(`Migration failed: ${error}`)
    return result
  }
}

export async function createBackup(): Promise<{ success: boolean; backupData?: any; error?: string }> {
  try {
    const legacyOrders = getLegacyOrders()
    const backupData = {
      timestamp: new Date().toISOString(),
      orderCount: legacyOrders.length,
      orders: legacyOrders
    }

    // Save backup to a file (in a real app, you might save to cloud storage)
    if (typeof window !== 'undefined') {
      const backupJson = JSON.stringify(backupData, null, 2)
      const blob = new Blob([backupJson], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `jerktracker-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }

    return { success: true, backupData }
  } catch (error) {
    return { success: false, error: `Backup failed: ${error}` }
  }
}

export async function clearLegacyData(): Promise<{ success: boolean; error?: string }> {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY)
      console.log('Legacy localStorage data cleared')
    }
    return { success: true }
  } catch (error) {
    return { success: false, error: `Failed to clear legacy data: ${error}` }
  }
}

// Admin utility to check migration status
export async function getMigrationStatus() {
  try {
    const legacyOrders = getLegacyOrders()
    const dbOrders = await prisma.order.count()
    
    return {
      legacyOrderCount: legacyOrders.length,
      databaseOrderCount: dbOrders,
      hasLegacyData: legacyOrders.length > 0,
      migrationComplete: legacyOrders.length === 0 && dbOrders > 0
    }
  } catch (error) {
    console.error('Error checking migration status:', error)
    return {
      legacyOrderCount: 0,
      databaseOrderCount: 0,
      hasLegacyData: false,
      migrationComplete: false,
      error: `Failed to check status: ${error}`
    }
  }
}