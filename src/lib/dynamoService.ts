import { DynamoDBService, TABLES } from './dynamodb'
import bcrypt from 'bcryptjs'
import { User, Restaurant, Order, UserCreateData, UserRole } from '@/types/api'

// User operations
export class UserService {
  static async create(userData: UserCreateData) {
    const hashedPassword = await bcrypt.hash(userData.password, 12)
    const user = await DynamoDBService.create(TABLES.USERS, {
      ...userData,
      password: hashedPassword
    })
    return user
  }

  static async findByEmail(email: string): Promise<User | null> {
    const users = await DynamoDBService.getAll(TABLES.USERS) as User[]
    return users.find((user) => user.email === email) || null
  }

  static async findById(id: string): Promise<User | null> {
    return await DynamoDBService.getById(TABLES.USERS, id) as User | null
  }

  static async getAll(): Promise<User[]> {
    return await DynamoDBService.getAll(TABLES.USERS) as User[]
  }

  static async update(id: string, updates: Partial<User>) {
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 12)
    }
    return await DynamoDBService.update(TABLES.USERS, id, updates)
  }

  static async delete(id: string) {
    return await DynamoDBService.delete(TABLES.USERS, id)
  }

  static async validatePassword(user: User, password: string): Promise<boolean> {
    return await bcrypt.compare(password, user.password)
  }
}

// Restaurant operations
export class RestaurantService {
  static async create(restaurantData: Omit<Restaurant, 'id' | 'createdAt' | 'updatedAt'>) {
    return await DynamoDBService.create(TABLES.RESTAURANTS, restaurantData)
  }

  static async findById(id: string): Promise<Restaurant | null> {
    return await DynamoDBService.getById(TABLES.RESTAURANTS, id) as Restaurant | null
  }

  static async findByEmail(email: string): Promise<Restaurant | null> {
    const restaurants = await DynamoDBService.getAll(TABLES.RESTAURANTS) as Restaurant[]
    return restaurants.find((restaurant) => restaurant.email === email) || null
  }

  static async getAll(): Promise<Restaurant[]> {
    return await DynamoDBService.getAll(TABLES.RESTAURANTS) as Restaurant[]
  }

  static async update(id: string, updates: Partial<Restaurant>) {
    return await DynamoDBService.update(TABLES.RESTAURANTS, id, updates)
  }

  static async delete(id: string) {
    return await DynamoDBService.delete(TABLES.RESTAURANTS, id)
  }
}

// Order operations
export class OrderService {
  static async create(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) {
    return await DynamoDBService.create(TABLES.ORDERS, orderData)
  }

  static async findById(id: string): Promise<Order | null> {
    return await DynamoDBService.getById(TABLES.ORDERS, id) as Order | null
  }

  static async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    const orders = await DynamoDBService.getAll(TABLES.ORDERS) as Order[]
    return orders.find((order) => order.orderNumber === orderNumber) || null
  }

  static async getAll(): Promise<Order[]> {
    return await DynamoDBService.getAll(TABLES.ORDERS) as Order[]
  }

  static async getByRestaurant(restaurantId: string): Promise<Order[]> {
    const orders = await DynamoDBService.getAll(TABLES.ORDERS) as Order[]
    return orders.filter((order) => order.restaurantId === restaurantId)
  }

  static async update(id: string, updates: Partial<Order>) {
    return await DynamoDBService.update(TABLES.ORDERS, id, updates)
  }

  static async updateStatus(id: string, status: Order['status']) {
    return await DynamoDBService.update(TABLES.ORDERS, id, { status })
  }

  static async delete(id: string) {
    return await DynamoDBService.delete(TABLES.ORDERS, id)
  }

  static async exportToCSV(): Promise<string> {
    const orders = await this.getAll()
    
    const headers = ['Order Number', 'Customer Name', 'Email', 'Phone', 'Status', 'Total', 'Created']
    const rows = orders.map(order => [
      order.orderNumber,
      order.customerName,
      order.customerEmail || '',
      order.customerPhone,
      order.status,
      order.totalAmount.toString(),
      new Date(order.createdAt).toLocaleDateString()
    ])

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')

    return csvContent
  }
}

// Initialize default data
export async function initializeDefaultData() {
  try {
    // Check if admin user exists
    const existingAdmin = await UserService.findByEmail('admin@thejerktracker.com')
    
    if (!existingAdmin) {
      // Create default restaurant
      const restaurant = await RestaurantService.create({
        name: 'TheJERKTracker Demo Restaurant',
        email: 'restaurant@thejerktracker.com',
        phone: '(555) 123-4567',
        address: '123 Main Street',
        city: 'Demo City',
        state: 'DC',
        zipCode: '12345',
        description: 'Demo restaurant for TheJERKTracker application'
      })

      // Create default admin user
      await UserService.create({
        name: 'Admin User',
        email: 'admin@thejerktracker.com',
        password: 'admin123',
        role: UserRole.ADMIN,
        restaurantId: String(restaurant.id || '')
      })

      console.log('✅ Default data initialized successfully!')
    }
  } catch (error) {
    console.error('Error initializing default data:', error)
  }
}