#!/usr/bin/env node

const { execSync } = require('child_process');

async function setupDatabase() {
  console.log('🔄 Database setup script starting...');
  
  try {
    // Check environment
    if (process.env.GITHUB_ACTIONS || process.env.CI) {
      console.log('🏗️  CI/CD environment detected - skipping database setup');
      console.log('✅ Static build mode - no database required');
      return;
    }
    
    // Check if we're in a Vercel environment
    if (process.env.VERCEL) {
      console.log('🚀 Vercel environment detected');
      console.log('📊 Pushing database schema...');
      execSync('npx prisma db push', { stdio: 'inherit' });
      
      console.log('🌱 Seeding database...');
      execSync('npm run db:seed', { stdio: 'inherit' });
      
      console.log('✅ Vercel database setup completed!');
      return;
    }
    
    // Local development setup
    console.log('💻 Local development environment detected');
    console.log('📊 Setting up local database...');
    
    try {
      execSync('npx prisma db push', { stdio: 'inherit' });
      console.log('🌱 Seeding local database...');
      execSync('npm run db:seed', { stdio: 'inherit' });
      console.log('✅ Local database setup completed!');
    } catch (error) {
      console.log('⚠️  Database setup had issues, but continuing...');
      console.log('💡 You may need to run: npm run db:push && npm run db:seed');
    }
    
  } catch (error) {
    console.log('⚠️  Database setup encountered issues:', error.message);
    
    // Don't fail the build if database setup fails
    if (error.message.includes('already exists') || error.message.includes('unique constraint')) {
      console.log('ℹ️  Database appears to be already set up');
      return;
    }
    
    // For other errors, we'll continue but log them
    console.log('✅ Continuing build process despite database setup issues...');
    console.log('💡 Manual database setup may be required later');
  }
}

if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };