#!/usr/bin/env node

/**
 * Monitor AWS App Runner deployment status
 */

const { execSync } = require('child_process');

const SERVICE_ARN = 'arn:aws:apprunner:us-east-1:640837413949:service/thejerktracker-app/d8ab7cb401484c0b9b49383dc2da84e1';
const SERVICE_URL = 'https://df27ezbdy6.us-east-1.awsapprunner.com';

console.log('🔍 Monitoring AWS App Runner deployment...');
console.log(`Service URL: ${SERVICE_URL}`);
console.log('');

async function checkStatus() {
  try {
    const status = execSync(`aws apprunner describe-service --service-arn "${SERVICE_ARN}" --query "Service.Status" --output text --region us-east-1`, { encoding: 'utf8' });
    console.log(`Status: ${status.trim()}`);
    
    if (status.trim() === 'RUNNING') {
      console.log('🎉 Service is RUNNING!');
      console.log(`✅ Your demo app is live at: ${SERVICE_URL}`);
      return true;
    } else if (status.trim() === 'CREATE_FAILED') {
      console.log('❌ Service creation failed');
      return true;
    } else {
      console.log('⏳ Still deploying...');
      return false;
    }
  } catch (error) {
    console.log('❌ Error checking status:', error.message);
    return true;
  }
}

checkStatus();