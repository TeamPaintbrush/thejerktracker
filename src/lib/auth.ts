import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { UserRole } from '@prisma/client'

// Extended request type with user info
export interface AuthenticatedRequest extends NextApiRequest {
  user: {
    id: string
    email: string
    name: string
    role: UserRole
    restaurantId?: string
    restaurant?: {
      id: string
      name: string
      email: string
    }
  }
}

// Middleware function to check authentication
export async function requireAuth(
  req: NextApiRequest,
  res: NextApiResponse,
  requiredRoles?: UserRole[]
): Promise<AuthenticatedRequest | null> {
  try {
    const session = await getServerSession(req, res, {})

    if (!session || !session.user) {
      res.status(401).json({ error: 'Authentication required' })
      return null
    }

    // Check if user has required role
    if (requiredRoles && !requiredRoles.includes(session.user.role)) {
      res.status(403).json({ 
        error: 'Insufficient permissions',
        required: requiredRoles,
        current: session.user.role
      })
      return null
    }

    // Add user info to request
    const authenticatedReq = req as AuthenticatedRequest
    authenticatedReq.user = session.user

    return authenticatedReq
  } catch (error) {
    console.error('Auth middleware error:', error)
    res.status(500).json({ error: 'Authentication error' })
    return null
  }
}

// Middleware specifically for admin routes
export async function requireAdmin(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<AuthenticatedRequest | null> {
  return requireAuth(req, res, ['ADMIN'])
}

// Middleware for admin or staff routes
export async function requireStaffOrAdmin(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<AuthenticatedRequest | null> {
  return requireAuth(req, res, ['ADMIN', 'STAFF'])
}

// Check if user belongs to the same restaurant
export function checkSameRestaurant(
  userRestaurantId: string | undefined,
  targetRestaurantId: string
): boolean {
  return userRestaurantId === targetRestaurantId
}

// Middleware to check restaurant ownership
export async function requireSameRestaurant(
  req: NextApiRequest,
  res: NextApiResponse,
  targetRestaurantId: string
): Promise<AuthenticatedRequest | null> {
  const authenticatedReq = await requireAuth(req, res)
  
  if (!authenticatedReq) {
    return null
  }

  // Admins can access any restaurant
  if (authenticatedReq.user.role === 'ADMIN') {
    return authenticatedReq
  }

  // Check if user belongs to the same restaurant
  if (!checkSameRestaurant(authenticatedReq.user.restaurantId, targetRestaurantId)) {
    res.status(403).json({ 
      error: 'Access denied. You can only access data from your restaurant.' 
    })
    return null
  }

  return authenticatedReq
}

// Utility function to get current user info
export async function getCurrentUser(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, {})
    return session?.user || null
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}