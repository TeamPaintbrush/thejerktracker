import { NextApiRequest, NextApiResponse } from 'next';
import { UserService, RestaurantService } from '@/lib/dynamoService';
import { UserRole } from '@/types/api';
import bcrypt from 'bcryptjs';
import { 
  asyncHandler, 
  ValidationError, 
  ConflictError 
} from '@/lib/errors';

export default asyncHandler(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('🔍 Checking database and admin user...');

  // Check if admin user exists
  const existingAdmin = await UserService.findByEmail('admin@thejerktracker.com');

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
  const restaurant = await RestaurantService.create({
    name: 'TheJERKTracker Demo Restaurant',
    email: 'restaurant@thejerktracker.com',
    phone: '(555) 123-4567',
    address: '123 Main Street',
    city: 'Demo City',
    state: 'DC',
    zipCode: '12345',
    description: 'Demo restaurant for TheJERKTracker application'
  });

  console.log('👤 Creating admin user...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const adminUser = await UserService.create({
    name: 'Admin User',
    email: 'admin@thejerktracker.com',
    password: hashedPassword,
    role: UserRole.ADMIN,
    restaurantId: String(restaurant.id || '')
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
})