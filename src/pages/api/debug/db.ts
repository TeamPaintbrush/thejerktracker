import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Test database connection
    await prisma.$connect()
    
    // Try to query a simple table
    const userCount = await prisma.user.count()
    
    return res.status(200).json({
      status: 'success',
      database: 'connected',
      userCount,
      env: {
        NODE_ENV: process.env.NODE_ENV,
        DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Not set',
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'Set' : 'Not set',
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'Not set'
      }
    })
  } catch (error) {
    console.error('Database connection error:', error)
    return res.status(500).json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      env: {
        NODE_ENV: process.env.NODE_ENV,
        DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Not set',
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'Set' : 'Not set',
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'Not set'
      }
    })
  } finally {
    await prisma.$disconnect()
  }
}