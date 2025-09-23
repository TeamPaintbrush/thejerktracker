#!/bin/bash

# Quick ECS Fargate deployment for TheJERKTracker
# This will get your app running faster than App Runner

echo "🚀 Deploying TheJERKTracker to ECS Fargate..."

# Variables
REGION="us-east-1"
APP_NAME="thejerktracker"
CLUSTER_NAME="thejerktracker-cluster"
SERVICE_NAME="thejerktracker-service"
TASK_DEF_NAME="thejerktracker-task"

# Load AWS config
source aws-config.env

# Configure AWS region
aws configure set region $REGION

echo "📦 Building and pushing Docker image..."

# Get ECR repository URL
ECR_REPO=$(aws ecr describe-repositories --repository-names $APP_NAME --query 'repositories[0].repositoryUri' --output text --region $REGION)

# Build and push image
docker build -t $APP_NAME .
docker tag $APP_NAME:latest $ECR_REPO:latest

# Login to ECR
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ECR_REPO

# Push image
docker push $ECR_REPO:latest

echo "📋 Creating ECS task definition..."

# Create task definition JSON
cat > task-definition.json << EOF
{
    "family": "$TASK_DEF_NAME",
    "networkMode": "awsvpc",
    "requiresCompatibilities": ["FARGATE"],
    "cpu": "256",
    "memory": "512",
    "executionRoleArn": "arn:aws:iam::640837413949:role/ecsTaskExecutionRole",
    "containerDefinitions": [
        {
            "name": "$APP_NAME",
            "image": "$ECR_REPO:latest",
            "portMappings": [
                {
                    "containerPort": 3000,
                    "protocol": "tcp"
                }
            ],
            "essential": true,
            "environment": [
                {
                    "name": "NODE_ENV",
                    "value": "production"
                },
                {
                    "name": "PORT",
                    "value": "3000"
                },
                {
                    "name": "NEXTAUTH_URL",
                    "value": "http://localhost:3000"
                }
            ],
            "logConfiguration": {
                "logDriver": "awslogs",
                "options": {
                    "awslogs-group": "/ecs/$TASK_DEF_NAME",
                    "awslogs-region": "$REGION",
                    "awslogs-stream-prefix": "ecs"
                }
            }
        }
    ]
}
EOF

# Create log group
aws logs create-log-group --log-group-name "/ecs/$TASK_DEF_NAME" --region $REGION 2>/dev/null || true

# Register task definition
aws ecs register-task-definition --cli-input-json file://task-definition.json --region $REGION

echo "🏗️ Creating ECS cluster..."

# Create ECS cluster
aws ecs create-cluster --cluster-name $CLUSTER_NAME --capacity-providers FARGATE --region $REGION 2>/dev/null || true

echo "🚀 Creating ECS service..."

# Create service
aws ecs create-service \
    --cluster $CLUSTER_NAME \
    --service-name $SERVICE_NAME \
    --task-definition $TASK_DEF_NAME \
    --desired-count 1 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[$SUBNET1_ID,$SUBNET2_ID],securityGroups=[$ECS_SG_ID],assignPublicIp=ENABLED}" \
    --region $REGION

echo "⏳ Waiting for service to start..."

# Wait for service to be running
aws ecs wait services-running --cluster $CLUSTER_NAME --services $SERVICE_NAME --region $REGION

# Get public IP
TASK_ARN=$(aws ecs list-tasks --cluster $CLUSTER_NAME --service-name $SERVICE_NAME --query 'taskArns[0]' --output text --region $REGION)
ENI_ID=$(aws ecs describe-tasks --cluster $CLUSTER_NAME --tasks $TASK_ARN --query 'tasks[0].attachments[0].details[?name==`networkInterfaceId`].value' --output text --region $REGION)
PUBLIC_IP=$(aws ec2 describe-network-interfaces --network-interface-ids $ENI_ID --query 'NetworkInterfaces[0].Association.PublicIp' --output text --region $REGION)

echo ""
echo "✅ DEPLOYMENT COMPLETE!"
echo "🌐 Application URL: http://$PUBLIC_IP:3000"
echo "💰 Cost: ~$5-10/day (pay-as-you-go)"
echo ""
echo "📝 Service Details:"
echo "- Cluster: $CLUSTER_NAME"
echo "- Service: $SERVICE_NAME"
echo "- Task: $TASK_DEF_NAME"
echo "- Public IP: $PUBLIC_IP"
echo ""
echo "🎯 Your TheJERKTracker application is now live!"