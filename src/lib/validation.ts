import { z } from 'zod';

// User validation schemas
export const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  role: z.enum(['CUSTOMER', 'ADMIN']).optional().default('CUSTOMER'),
  restaurantId: z.string().uuid('Invalid restaurant ID').optional(),
});

export const updateUserSchema = z.object({
  email: z.string().email('Invalid email format').optional(),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters').optional(),
  role: z.enum(['CUSTOMER', 'ADMIN']).optional(),
  restaurantId: z.string().uuid('Invalid restaurant ID').optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// Restaurant validation schemas
export const createRestaurantSchema = z.object({
  name: z.string().min(1, 'Restaurant name is required').max(200, 'Name must be less than 200 characters'),
  email: z.string().email('Invalid email format'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters').max(20, 'Phone number must be less than 20 characters').optional(),
  address: z.string().min(1, 'Address is required').max(500, 'Address must be less than 500 characters').optional(),
  city: z.string().max(100, 'City must be less than 100 characters').optional(),
  state: z.string().max(50, 'State must be less than 50 characters').optional(),
  zipCode: z.string().max(20, 'Zip code must be less than 20 characters').optional(),
  website: z.string().url('Invalid website URL').optional(),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  logoUrl: z.string().url('Invalid logo URL').optional(),
});

export const updateRestaurantSchema = z.object({
  name: z.string().min(1, 'Restaurant name is required').max(200, 'Name must be less than 200 characters').optional(),
  email: z.string().email('Invalid email format').optional(),
  phone: z.string().min(10, 'Phone number must be at least 10 characters').max(20, 'Phone number must be less than 20 characters').optional(),
  address: z.string().min(1, 'Address is required').max(500, 'Address must be less than 500 characters').optional(),
  city: z.string().max(100, 'City must be less than 100 characters').optional(),
  state: z.string().max(50, 'State must be less than 50 characters').optional(),
  zipCode: z.string().max(20, 'Zip code must be less than 20 characters').optional(),
  website: z.string().url('Invalid website URL').optional(),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  logoUrl: z.string().url('Invalid logo URL').optional(),
});

// Order validation schemas
export const createOrderSchema = z.object({
  orderNumber: z.string().min(1, 'Order number is required').max(50, 'Order number must be less than 50 characters'),
  customerName: z.string().min(1, 'Customer name is required').max(100, 'Customer name must be less than 100 characters'),
  customerEmail: z.string().email('Invalid email format'),
  customerPhone: z.string().min(10, 'Phone number must be at least 10 characters').max(20, 'Phone number must be less than 20 characters').optional(),
  orderDetails: z.string().min(1, 'Order details are required').max(2000, 'Order details must be less than 2000 characters'),
  totalAmount: z.number().min(0, 'Total amount must be non-negative').optional(),
  status: z.enum(['PENDING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED']).optional().default('PENDING'),
  restaurantId: z.string().uuid('Invalid restaurant ID'),
});

export const updateOrderSchema = z.object({
  orderNumber: z.string().min(1, 'Order number is required').max(50, 'Order number must be less than 50 characters').optional(),
  customerName: z.string().min(1, 'Customer name is required').max(100, 'Customer name must be less than 100 characters').optional(),
  customerEmail: z.string().email('Invalid email format').optional(),
  customerPhone: z.string().min(10, 'Phone number must be at least 10 characters').max(20, 'Phone number must be less than 20 characters').optional(),
  orderDetails: z.string().min(1, 'Order details are required').max(2000, 'Order details must be less than 2000 characters').optional(),
  totalAmount: z.number().min(0, 'Total amount must be non-negative').optional(),
  status: z.enum(['PENDING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED']).optional(),
  restaurantId: z.string().uuid('Invalid restaurant ID').optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED']),
});

// Migration validation schema
export const migrateDataSchema = z.object({
  data: z.array(z.object({
    orderNumber: z.string().min(1, 'Order number is required'),
    customerName: z.string().min(1, 'Customer name is required'),
    customerEmail: z.string().email('Invalid email format'),
    customerPhone: z.string().optional(),
    orderDetails: z.string().min(1, 'Order details are required'),
    totalAmount: z.number().min(0, 'Total amount must be non-negative').optional(),
    status: z.enum(['PENDING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED']).optional(),
    restaurantId: z.string().uuid('Invalid restaurant ID'),
    createdAt: z.string().datetime().optional(),
  })),
});

// Common validation schemas
export const idSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

export const queryParamsSchema = z.object({
  page: z.string().transform(val => parseInt(val, 10)).refine(val => val > 0, 'Page must be positive').optional(),
  limit: z.string().transform(val => parseInt(val, 10)).refine(val => val > 0 && val <= 100, 'Limit must be between 1 and 100').optional(),
  search: z.string().max(200, 'Search term must be less than 200 characters').optional(),
  status: z.enum(['PENDING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED']).optional(),
  restaurantId: z.string().uuid('Invalid restaurant ID').optional(),
});

// Type exports for TypeScript
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateRestaurantInput = z.infer<typeof createRestaurantSchema>;
export type UpdateRestaurantInput = z.infer<typeof updateRestaurantSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type MigrateDataInput = z.infer<typeof migrateDataSchema>;
export type IdInput = z.infer<typeof idSchema>;
export type QueryParamsInput = z.infer<typeof queryParamsSchema>;