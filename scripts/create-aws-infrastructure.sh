#!/bin/bash

# AWS Manual Deployment Script for TheJERKTracker
# This script creates AWS infrastructure without Amplify CLI

set -e

echo "🚀 Starting AWS manual deployment for TheJERKTracker..."

# Configuration
APP_NAME="thejerktracker"
REGION="us-west-2"
DB_PASSWORD="ThejerkTracker2025!"
DB_USERNAME="thejerktracker"

echo "📋 Configuration:"
echo "  App Name: $APP_NAME"
echo "  Region: $REGION"
echo "  Database: PostgreSQL"

# Step 1: Create VPC
echo "📋 Step 1: Creating VPC..."
VPC_ID=$(aws ec2 create-vpc \
  --cidr-block 10.0.0.0/16 \
  --tag-specifications "ResourceType=vpc,Tags=[{Key=Name,Value=$APP_NAME-vpc}]" \
  --query 'Vpc.VpcId' \
  --output text \
  --region $REGION)

echo "✅ VPC created: $VPC_ID"

# Enable DNS hostnames
aws ec2 modify-vpc-attribute --vpc-id $VPC_ID --enable-dns-hostnames --region $REGION

# Step 2: Create Internet Gateway
echo "📋 Step 2: Creating Internet Gateway..."
IGW_ID=$(aws ec2 create-internet-gateway \
  --tag-specifications "ResourceType=internet-gateway,Tags=[{Key=Name,Value=$APP_NAME-igw}]" \
  --query 'InternetGateway.InternetGatewayId' \
  --output text \
  --region $REGION)

echo "✅ Internet Gateway created: $IGW_ID"

# Attach Internet Gateway to VPC
aws ec2 attach-internet-gateway --vpc-id $VPC_ID --internet-gateway-id $IGW_ID --region $REGION

# Step 3: Create Subnets
echo "📋 Step 3: Creating Subnets..."
SUBNET1_ID=$(aws ec2 create-subnet \
  --vpc-id $VPC_ID \
  --cidr-block 10.0.1.0/24 \
  --availability-zone ${REGION}a \
  --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=$APP_NAME-subnet-1}]" \
  --query 'Subnet.SubnetId' \
  --output text \
  --region $REGION)

SUBNET2_ID=$(aws ec2 create-subnet \
  --vpc-id $VPC_ID \
  --cidr-block 10.0.2.0/24 \
  --availability-zone ${REGION}b \
  --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=$APP_NAME-subnet-2}]" \
  --query 'Subnet.SubnetId' \
  --output text \
  --region $REGION)

echo "✅ Subnets created: $SUBNET1_ID, $SUBNET2_ID"

# Step 4: Create Route Table
echo "📋 Step 4: Creating Route Table..."
ROUTE_TABLE_ID=$(aws ec2 create-route-table \
  --vpc-id $VPC_ID \
  --tag-specifications "ResourceType=route-table,Tags=[{Key=Name,Value=$APP_NAME-rt}]" \
  --query 'RouteTable.RouteTableId' \
  --output text \
  --region $REGION)

# Add route to Internet Gateway
aws ec2 create-route \
  --route-table-id $ROUTE_TABLE_ID \
  --destination-cidr-block 0.0.0.0/0 \
  --gateway-id $IGW_ID \
  --region $REGION

# Associate subnets with route table
aws ec2 associate-route-table --subnet-id $SUBNET1_ID --route-table-id $ROUTE_TABLE_ID --region $REGION
aws ec2 associate-route-table --subnet-id $SUBNET2_ID --route-table-id $ROUTE_TABLE_ID --region $REGION

echo "✅ Route table configured: $ROUTE_TABLE_ID"

# Step 5: Create Security Groups
echo "📋 Step 5: Creating Security Groups..."

# Security Group for RDS
RDS_SG_ID=$(aws ec2 create-security-group \
  --group-name "$APP_NAME-rds-sg" \
  --description "Security group for RDS database" \
  --vpc-id $VPC_ID \
  --tag-specifications "ResourceType=security-group,Tags=[{Key=Name,Value=$APP_NAME-rds-sg}]" \
  --query 'GroupId' \
  --output text \
  --region $REGION)

# Security Group for ECS
ECS_SG_ID=$(aws ec2 create-security-group \
  --group-name "$APP_NAME-ecs-sg" \
  --description "Security group for ECS tasks" \
  --vpc-id $VPC_ID \
  --tag-specifications "ResourceType=security-group,Tags=[{Key=Name,Value=$APP_NAME-ecs-sg}]" \
  --query 'GroupId' \
  --output text \
  --region $REGION)

# Security Group for ALB
ALB_SG_ID=$(aws ec2 create-security-group \
  --group-name "$APP_NAME-alb-sg" \
  --description "Security group for Application Load Balancer" \
  --vpc-id $VPC_ID \
  --tag-specifications "ResourceType=security-group,Tags=[{Key=Name,Value=$APP_NAME-alb-sg}]" \
  --query 'GroupId' \
  --output text \
  --region $REGION)

echo "✅ Security groups created:"
echo "  RDS: $RDS_SG_ID"
echo "  ECS: $ECS_SG_ID"
echo "  ALB: $ALB_SG_ID"

# Configure Security Group Rules
echo "📋 Step 6: Configuring Security Group Rules..."

# ALB Security Group - Allow HTTP/HTTPS from internet
aws ec2 authorize-security-group-ingress \
  --group-id $ALB_SG_ID \
  --protocol tcp \
  --port 80 \
  --cidr 0.0.0.0/0 \
  --region $REGION

aws ec2 authorize-security-group-ingress \
  --group-id $ALB_SG_ID \
  --protocol tcp \
  --port 443 \
  --cidr 0.0.0.0/0 \
  --region $REGION

# ECS Security Group - Allow traffic from ALB
aws ec2 authorize-security-group-ingress \
  --group-id $ECS_SG_ID \
  --protocol tcp \
  --port 3000 \
  --source-group $ALB_SG_ID \
  --region $REGION

# RDS Security Group - Allow traffic from ECS
aws ec2 authorize-security-group-ingress \
  --group-id $RDS_SG_ID \
  --protocol tcp \
  --port 5432 \
  --source-group $ECS_SG_ID \
  --region $REGION

echo "✅ Security group rules configured"

# Save configuration to file
echo "📋 Saving configuration..."
cat > aws-config.env << EOF
# AWS Infrastructure Configuration for TheJERKTracker
VPC_ID=$VPC_ID
IGW_ID=$IGW_ID
SUBNET1_ID=$SUBNET1_ID
SUBNET2_ID=$SUBNET2_ID
ROUTE_TABLE_ID=$ROUTE_TABLE_ID
RDS_SG_ID=$RDS_SG_ID
ECS_SG_ID=$ECS_SG_ID
ALB_SG_ID=$ALB_SG_ID
REGION=$REGION
APP_NAME=$APP_NAME
DB_PASSWORD=$DB_PASSWORD
DB_USERNAME=$DB_USERNAME
EOF

echo "✅ Configuration saved to aws-config.env"
echo "🎉 AWS VPC infrastructure setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Create RDS database"
echo "2. Create ECS cluster"
echo "3. Deploy application"