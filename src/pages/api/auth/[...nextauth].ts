import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { config } from '@/lib/config'
import { UserRole } from '@prisma/client'

export default NextAuth({
  adapter: PrismaAdapter(prisma),
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
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email
            },
            include: {
              restaurant: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          })

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

          // Return user data for session
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            restaurantId: user.restaurantId,
            restaurant: user.restaurant
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      // Include user info in JWT token
      if (user) {
        token.role = user.role
        token.restaurantId = user.restaurantId
        token.restaurant = user.restaurant
      }
      return token
    },
    async session({ session, token }) {
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
})