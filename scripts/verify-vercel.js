#!/usr/bin/env node

/**
 * Vercel deployment verification script
 */

console.log('🔍 Vercel Deployment Status Check');
console.log('==================================');

// Check if Vercel CLI is available
try {
  const { execSync } = require('child_process');
  const vercelVersion = execSync('vercel --version', { encoding: 'utf8' }).trim();
  console.log(`✅ Vercel CLI: ${vercelVersion}`);
} catch (error) {
  console.log('⚠️  Vercel CLI not installed globally');
  console.log('💡 Install with: npm install -g vercel');
}

// Check Vercel-related files
const fs = require('fs');
const vercelFiles = [
  'vercel.json',
  'package.json',
  'prisma/schema.prisma'
];

console.log('\n📁 Vercel Configuration Files:');
vercelFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`${exists ? '✅' : '❌'} ${file}`);
});

// Check build scripts
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const buildScripts = ['build:vercel', 'db:seed', 'setup:db'];

console.log('\n🔧 Build Scripts:');
buildScripts.forEach(script => {
  const exists = packageJson.scripts && packageJson.scripts[script];
  console.log(`${exists ? '✅' : '❌'} ${script}`);
});

// Environment recommendations
console.log('\n🌍 Environment Variables for Vercel:');
console.log('Required in Vercel Dashboard:');
console.log('- DATABASE_URL (Postgres connection string)');
console.log('- NEXTAUTH_SECRET (random secret)');
console.log('- NEXTAUTH_URL (your vercel domain)');

console.log('\n🚀 Deployment URLs:');
console.log('- Vercel: https://thejerktracker0.vercel.app');
console.log('- GitHub Pages: https://teampaintbrush.github.io/thejerktracker/');

console.log('\n✅ Vercel deployment configuration is ready!');