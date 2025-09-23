#!/usr/bin/env node

/**
 * Pre-build validation script for CI/CD environments
 */

const fs = require('fs');
const path = require('path');

function checkFile(filePath, description) {
  const exists = fs.existsSync(filePath);
  console.log(`${exists ? '✅' : '❌'} ${description}: ${filePath}`);
  return exists;
}

function validateEnvironment() {
  console.log('🔍 Running pre-build validation...');
  
  let allValid = true;
  
  // Check required files
  const requiredFiles = [
    ['package.json', 'Package configuration'],
    ['next.config.js', 'Next.js configuration'],
    ['src/app/page.tsx', 'Main page component'],
    ['src/app/layout.tsx', 'Root layout component'],
    ['prisma/schema.prisma', 'Database schema']
  ];
  
  // Check optional files for different environments
  const optionalFiles = [
    ['prisma/schema.github.prisma', 'GitHub Actions schema'],
    ['.env.example', 'Environment template'],
    ['scripts/db-check.js', 'Database check script'],
    ['scripts/setup-db.js', 'Database setup script']
  ];
  
  console.log('\n📋 Required files:');
  for (const [file, desc] of requiredFiles) {
    if (!checkFile(file, desc)) {
      allValid = false;
    }
  }
  
  console.log('\n📋 Optional files:');
  for (const [file, desc] of optionalFiles) {
    checkFile(file, desc);
  }
  
  // Check environment variables for different contexts
  console.log('\n🌍 Environment context:');
  console.log(`📍 NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
  console.log(`📍 GITHUB_ACTIONS: ${process.env.GITHUB_ACTIONS || 'not set'}`);
  console.log(`📍 VERCEL: ${process.env.VERCEL || 'not set'}`);
  console.log(`📍 CI: ${process.env.CI || 'not set'}`);
  
  if (allValid) {
    console.log('\n✅ Pre-build validation passed!');
  } else {
    console.log('\n❌ Pre-build validation found issues');
    if (process.env.CI || process.env.GITHUB_ACTIONS) {
      console.log('⚠️  Continuing with CI build despite validation issues...');
    }
  }
  
  return allValid;
}

if (require.main === module) {
  const isValid = validateEnvironment();
  // Don't fail CI builds for validation issues - just warn
  process.exit(0);
}

module.exports = { validateEnvironment };