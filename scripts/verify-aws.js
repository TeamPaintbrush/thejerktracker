#!/usr/bin/env node

/**
 * AWS Verification Script for TheJERKTracker
 * This script verifies AWS configuration and deployment status
 */

const { execSync } = require('child_process');
const https = require('https');

console.log('🔍 Verifying AWS deployment for TheJERKTracker...');

async function verifyAWS() {
  try {
    // Check AWS CLI configuration
    console.log('📋 Checking AWS CLI configuration...');
    
    try {
      const awsId = execSync('aws sts get-caller-identity --output text --query Account', { encoding: 'utf8' });
      console.log('✅ AWS CLI configured - Account ID:', awsId.trim());
    } catch (error) {
      console.log('❌ AWS CLI not configured or not installed');
      console.log('Install: npm install -g @aws-amplify/cli');
      return;
    }

    // Check Amplify app status
    console.log('📋 Checking Amplify app status...');
    
    try {
      const amplifyApps = execSync('aws amplify list-apps --output json', { encoding: 'utf8' });
      const apps = JSON.parse(amplifyApps);
      
      if (apps.apps && apps.apps.length > 0) {
        console.log('✅ Found Amplify apps:');
        apps.apps.forEach(app => {
          console.log(`  - ${app.name}: ${app.defaultDomain}`);
          console.log(`    Status: ${app.platform}`);
          console.log(`    Created: ${new Date(app.createTime).toLocaleDateString()}`);
        });
      } else {
        console.log('⚠️  No Amplify apps found');
        console.log('Run: amplify init to create your first app');
      }
    } catch (error) {
      console.log('⚠️  Could not check Amplify apps');
    }

    // Check RDS instances
    console.log('📋 Checking RDS instances...');
    
    try {
      const rdsInstances = execSync('aws rds describe-db-instances --output json', { encoding: 'utf8' });
      const instances = JSON.parse(rdsInstances);
      
      if (instances.DBInstances && instances.DBInstances.length > 0) {
        console.log('✅ Found RDS instances:');
        instances.DBInstances.forEach(db => {
          console.log(`  - ${db.DBInstanceIdentifier}: ${db.DBInstanceStatus}`);
          console.log(`    Engine: ${db.Engine} ${db.EngineVersion}`);
          console.log(`    Endpoint: ${db.Endpoint?.Address || 'Not available'}`);
        });
      } else {
        console.log('⚠️  No RDS instances found');
        console.log('Create one in AWS Console or use Amplify: amplify add storage');
      }
    } catch (error) {
      console.log('⚠️  Could not check RDS instances');
    }

    // Environment variables check
    console.log('📋 Checking environment variables...');
    
    const requiredEnvVars = [
      'AWS_ACCESS_KEY_ID',
      'AWS_SECRET_ACCESS_KEY',
      'AWS_REGION'
    ];

    let envOk = true;
    requiredEnvVars.forEach(varName => {
      if (process.env[varName]) {
        console.log(`✅ ${varName}: Set`);
      } else {
        console.log(`❌ ${varName}: Not set`);
        envOk = false;
      }
    });

    if (!envOk) {
      console.log('\n⚠️  Some environment variables are missing');
      console.log('Run: npm run setup:aws to configure them');
    }

    console.log('\n🎉 AWS verification completed!');

  } catch (error) {
    console.error('❌ AWS verification failed:', error.message);
  }
}

verifyAWS();