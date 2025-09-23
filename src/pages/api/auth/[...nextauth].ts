import NextAuth, { SessionStrategy } from 'next-auth'
import type { JWT } from 'next-auth/jwt'
import type { Session } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { UserService, RestaurantService } from '@/lib/dynamoService'
import bcrypt from 'bcryptjs'
import { config } from '@/lib/config'
import { UserRole } from '@/types/api'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Find user in database
          const user = await UserService.findByEmail(credentials.email)

          if (!user) {
            console.log('User not found:', credentials.email)
            return null
          }

          // Verify password
          const isValidPassword = await bcrypt.compare(credentials.password, user.password)
          if (!isValidPassword) {
            console.log('Invalid password for user:', credentials.email)
            return null
          }

          // Get restaurant info if user has one
          let restaurant = null
          if (user.restaurantId) {
            restaurant = await RestaurantService.findById(user.restaurantId)
          }

          // Return user data for session
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            restaurantId: user.restaurantId || undefined,
            restaurant: restaurant ? {
              id: restaurant.id,
              name: restaurant.name,
              email: restaurant.email
            } : undefined
          } as any
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt' as SessionStrategy
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user: any }) {
      // Include user info in JWT token
      if (user) {
        token.role = user.role
        token.restaurantId = user.restaurantId
        token.restaurant = user.restaurant
      }
      return token
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      // Send properties to the client
      if (token?.sub && session.user) {
        session.user.id = token.sub
        session.user.role = token.role as UserRole
        session.user.restaurantId = token.restaurantId as string | undefined
        session.user.restaurant = token.restaurant as any
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin'
  },
  secret: config.NEXTAUTH_SECRET
}

export default NextAuth(authOptions)