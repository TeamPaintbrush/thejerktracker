#!/usr/bin/env node

const { execSync } = require('child_process');

async function setupDatabase() {
  console.log('🔄 Setting up database on Vercel...');
  
  try {
    // Check if we're in a Vercel environment
    if (!process.env.VERCEL) {
      console.log('ℹ️  Not in Vercel environment, skipping setup');
      return;
    }
    
    console.log('📊 Pushing database schema...');
    execSync('npx prisma db push', { stdio: 'inherit' });
    
    console.log('🌱 Seeding database...');
    execSync('npx prisma db seed', { stdio: 'inherit' });
    
    console.log('✅ Database setup completed!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    
    // Don't fail the build if seeding fails (might already be seeded)
    if (error.message.includes('already exists')) {
      console.log('ℹ️  Database appears to be already set up');
      return;
    }
    
    // For other errors, we'll continue but log them
    console.log('⚠️  Continuing build despite database setup issues...');
  }
}

if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };