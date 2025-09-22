import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔍 Checking database and admin user...');

    // Check if admin user exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@thejerktracker.com' }
    });

    if (existingAdmin) {
      return res.status(200).json({ 
        message: 'Admin user already exists',
        user: {
          id: existingAdmin.id,
          email: existingAdmin.email,
          name: existingAdmin.name,
          role: existingAdmin.role
        }
      });
    }

    console.log('🏪 Creating demo restaurant...');

    // First create a restaurant
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
    });

    console.log('👤 Creating admin user...');

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const adminUser = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@thejerktracker.com',
        password: hashedPassword,
        role: 'ADMIN',
        restaurantId: restaurant.id
      }
    });

    console.log('✅ Admin user created successfully');

    res.status(201).json({
      message: 'Admin user created successfully',
      user: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role
      }
    });

  } catch (error) {
    console.error('❌ Database setup error:', error);
    res.status(500).json({ 
      error: 'Database setup failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    await prisma.$disconnect();
  }
}