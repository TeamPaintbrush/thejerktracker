import { UserRole } from '@prisma/client'
import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
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

  interface User {
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

declare module 'next-auth/jwt' {
  interface JWT {
    role: UserRole
    restaurantId?: string
    restaurant?: {
      id: string
      name: string
      email: string
    }
  }
}