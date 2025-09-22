import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Check if admin user already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@thejerktracker.com' }
  })

  if (existingAdmin) {
    console.log('👤 Admin user already exists, skipping creation')
    return
  }

  // Create default restaurant
  const restaurant = await prisma.restaurant.create({
    data: {
      name: 'TheJERKTracker Demo Restaurant',
      email: 'restaurant@thejerktracker.com',
      phone: '(555) 123-4567',
      address: '123 Main Street',
      city: 'Demo City',
      state: 'DC',
      zipCode: '12345',
      description: 'Demo restaurant for TheJERKTracker application'
    }
  })

  console.log('🏪 Created restaurant:', {
    id: restaurant.id,
    name: restaurant.name,
    email: restaurant.email
  })

  // Create default admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@thejerktracker.com',
      password: hashedPassword,
      role: 'ADMIN',
      restaurantId: restaurant.id
    }
  })

  console.log('👤 Created admin user:', {
    id: adminUser.id,
    name: adminUser.name,
    email: adminUser.email,
    role: adminUser.role,
    restaurantId: adminUser.restaurantId
  })

  console.log('✅ Database seed completed successfully!')
  console.log('')
  console.log('🔑 Default admin credentials:')
  console.log('   Email: admin@thejerktracker.com')
  console.log('   Password: admin123')
  console.log('')
  console.log('⚠️  Please change the default password after first login!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })