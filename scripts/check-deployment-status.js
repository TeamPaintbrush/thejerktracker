#!/usr/bin/env node

/**
 * AWS Deployment Status Checker for TheJERKTracker
 * Monitors the status of all AWS resources
 */

const { execSync } = require('child_process');

console.log('🔍 Checking AWS deployment status for TheJERKTracker...');

async function checkDeploymentStatus() {
  try {
    // Load configuration
    const config = {
      vpcId: 'vpc-0bc62432f9cfed291',
      dbInstanceId: 'thejerktracker-db',
      clusterName: 'thejerktracker-cluster',
      repositoryName: 'thejerktracker',
      region: 'us-west-2'
    };

    console.log('📋 Infrastructure Status:');

    // Check VPC
    try {
      const vpcStatus = execSync(`aws ec2 describe-vpcs --vpc-ids ${config.vpcId} --query "Vpcs[0].State" --output text --region ${config.region}`, { encoding: 'utf8' });
      console.log(`✅ VPC: ${vpcStatus.trim()}`);
    } catch (error) {
      console.log('❌ VPC: Not found or error');
    }

    // Check RDS Database
    try {
      const dbStatus = execSync(`aws rds describe-db-instances --db-instance-identifier ${config.dbInstanceId} --query "DBInstances[0].DBInstanceStatus" --output text --region ${config.region}`, { encoding: 'utf8' });
      console.log(`📊 RDS Database: ${dbStatus.trim()}`);
      
      if (dbStatus.trim() === 'available') {
        const dbEndpoint = execSync(`aws rds describe-db-instances --db-instance-identifier ${config.dbInstanceId} --query "DBInstances[0].Endpoint.Address" --output text --region ${config.region}`, { encoding: 'utf8' });
        console.log(`   Endpoint: ${dbEndpoint.trim()}`);
      }
    } catch (error) {
      console.log('❌ RDS Database: Not found or error');
    }

    // Check ECS Cluster
    try {
      const clusterStatus = execSync(`aws ecs describe-clusters --clusters ${config.clusterName} --query "clusters[0].status" --output text --region ${config.region}`, { encoding: 'utf8' });
      console.log(`🐳 ECS Cluster: ${clusterStatus.trim()}`);
    } catch (error) {
      console.log('❌ ECS Cluster: Not found or error');
    }

    // Check ECR Repository
    try {
      const repoUri = execSync(`aws ecr describe-repositories --repository-names ${config.repositoryName} --query "repositories[0].repositoryUri" --output text --region ${config.region}`, { encoding: 'utf8' });
      console.log(`📦 ECR Repository: ${repoUri.trim()}`);
    } catch (error) {
      console.log('❌ ECR Repository: Not found or error');
    }

    console.log('\n📋 Next Steps:');
    console.log('1. Wait for RDS database to be "available"');
    console.log('2. Build and push Docker image to ECR');
    console.log('3. Create ECS task definition');
    console.log('4. Create Application Load Balancer');
    console.log('5. Deploy ECS service');

    console.log('\n📝 Commands to run:');
    console.log('# Build and push Docker image:');
    console.log('docker build -t thejerktracker .');
    console.log('docker tag thejerktracker:latest 640837413949.dkr.ecr.us-west-2.amazonaws.com/thejerktracker:latest');
    console.log('docker push 640837413949.dkr.ecr.us-west-2.amazonaws.com/thejerktracker:latest');

  } catch (error) {
    console.error('❌ Status check failed:', error.message);
  }
}

checkDeploymentStatus();