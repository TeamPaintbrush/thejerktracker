#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 Checking database connection...');
    
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Check if tables exist by trying to count users
    try {
      const userCount = await prisma.user.count();
      console.log(`📊 Database initialized. Found ${userCount} users.`);
    } catch (error) {
      if (error.code === 'P2021') {
        console.log('🔄 Tables do not exist. Running database migration...');
        // This will be handled by prisma db push in build script
      } else {
        console.error('❌ Database error:', error.message);
      }
    }
    
    await prisma.$disconnect();
    console.log('✅ Database check completed');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  });
}

module.exports = { main };