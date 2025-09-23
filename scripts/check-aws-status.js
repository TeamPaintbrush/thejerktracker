#!/usr/bin/env node

/**
 * AWS Account Status Checker
 * Monitors AWS account verification and billing status
 */

const { execSync } = require('child_process');

console.log('🔍 Checking AWS account status...');

async function checkAWSStatus() {
  try {
    // Check AWS CLI access
    console.log('📋 Testing AWS CLI access...');
    const identity = execSync('aws sts get-caller-identity --output json', { encoding: 'utf8' });
    const accountInfo = JSON.parse(identity);
    
    console.log('✅ AWS CLI working');
    console.log(`   Account ID: ${accountInfo.Account}`);
    console.log(`   User ID: ${accountInfo.UserId}`);

    // Check AWS regions access
    console.log('\n📋 Testing AWS regions access...');
    try {
      const regions = execSync('aws ec2 describe-regions --output json', { encoding: 'utf8' });
      console.log('✅ EC2 regions accessible');
    } catch (error) {
      console.log('⚠️  EC2 regions access limited (billing verification needed)');
    }

    // Check IAM access
    console.log('\n📋 Testing IAM access...');
    try {
      execSync('aws iam get-user --output json', { encoding: 'utf8' });
      console.log('✅ IAM access working');
    } catch (error) {
      console.log('⚠️  IAM access limited (billing verification needed)');
    }

    // Check S3 access
    console.log('\n📋 Testing S3 access...');
    try {
      execSync('aws s3 ls', { encoding: 'utf8' });
      console.log('✅ S3 access working');
    } catch (error) {
      console.log('⚠️  S3 access limited (billing verification needed)');
    }

    // Check if ready for Amplify
    console.log('\n📋 Amplify readiness check...');
    try {
      // Test CloudFormation access (required for Amplify)
      execSync('aws cloudformation list-stacks --output json', { encoding: 'utf8' });
      console.log('✅ CloudFormation access working - Ready for Amplify!');
      return true;
    } catch (error) {
      console.log('❌ CloudFormation access blocked - Billing verification needed');
      console.log('   Complete billing setup first');
      return false;
    }

  } catch (error) {
    console.error('❌ AWS access error:', error.message);
    return false;
  }
}

checkAWSStatus().then(ready => {
  if (ready) {
    console.log('\n🎉 AWS account is ready for Amplify deployment!');
    console.log('Next step: Run "amplify init"');
  } else {
    console.log('\n⏳ AWS account needs billing verification');
    console.log('Complete billing setup and run this script again');
  }
});