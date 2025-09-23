import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding AWS database...')

  // Create a default restaurant
  const restaurant = await prisma.restaurant.upsert({
    where: { email: 'admin@thejerktracker.aws' },
    update: {},
    create: {
      name: 'The JERK Tracker Demo Restaurant',
      email: 'admin@thejerktracker.aws',
      phone: '(555) 123-4567',
      address: '123 Main Street',
      city: 'Demo City',
      state: 'DC',
      zipCode: '12345'
    }
  })

  console.log('✅ Created restaurant:', restaurant.name)

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@thejerktracker.aws' },
    update: {},
    create: {
      email: 'admin@thejerktracker.aws',
      name: 'Admin User',
      password: adminPassword,
      role: UserRole.ADMIN,
      restaurantId: restaurant.id
    }
  })

  console.log('✅ Created admin user:', adminUser.email)

  // Create manager user
  const managerPassword = await bcrypt.hash('manager123', 10)
  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@thejerktracker.aws' },
    update: {},
    create: {
      email: 'manager@thejerktracker.aws',
      name: 'Manager User',
      password: managerPassword,
      role: 'MANAGER' as any,
      restaurantId: restaurant.id
    }
  })

  console.log('✅ Created manager user:', managerUser.email)

  // Create employee user
  const employeePassword = await bcrypt.hash('employee123', 10)
  const employeeUser = await prisma.user.upsert({
    where: { email: 'employee@thejerktracker.aws' },
    update: {},
    create: {
      email: 'employee@thejerktracker.aws',
      name: 'Employee User',
      password: employeePassword,
      role: 'EMPLOYEE' as any,
      restaurantId: restaurant.id
    }
  })

  console.log('✅ Created employee user:', employeeUser.email)

  // Create sample incidents (commented out until schema is generated)
  /*
  const incidents = [
    {
      type: 'HARASSMENT',
      severity: 'HIGH',
      title: 'Inappropriate Comments',
      description: 'Customer made inappropriate comments to staff member',
      location: 'Front counter',
      reportedById: employeeUser.id,
      restaurantId: restaurant.id,
      incidentDate: new Date(Date.now() - 86400000), // Yesterday
      witnesses: 'John Doe, Jane Smith',
      actionsTaken: 'Spoke with customer, documented incident'
    },
    {
      type: 'SAFETY_VIOLATION',
      severity: 'MEDIUM',
      title: 'Wet Floor Not Marked',
      description: 'Customer slipped on wet floor that was not properly marked',
      location: 'Kitchen entrance',
      reportedById: managerUser.id,
      restaurantId: restaurant.id,
      incidentDate: new Date(Date.now() - 172800000), // 2 days ago
      actionsTaken: 'Added more warning signs, retrained staff'
    }
  ]

  for (const incident of incidents) {
    const createdIncident = await prisma.incident.create({
      data: incident
    })
    console.log('✅ Created incident:', createdIncident.title)
  }
  */

  console.log('🎉 AWS Database seeding completed!')
  console.log('\n📝 Test Accounts:')
  console.log('Admin: admin@thejerktracker.aws / admin123')
  console.log('Manager: manager@thejerktracker.aws / manager123')
  console.log('Employee: employee@thejerktracker.aws / employee123')
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })