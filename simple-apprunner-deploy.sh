# TheJERKTracker AWS App Runner Deployment
# Simple deployment for demo purposes

# Step 1: Create a simple ECR image (we'll use a public Node.js image as base)
aws apprunner create-service \
  --service-name "thejerktracker-demo" \
  --source-configuration '{
    "ImageRepository": {
      "ImageIdentifier": "public.ecr.aws/docker/library/node:18-alpine",
      "ImageConfiguration": {
        "Port": "3000",
        "RuntimeEnvironmentVariables": {
          "NODE_ENV": "production"
        }
      },
      "ImageRepositoryType": "ECR_PUBLIC"
    }
  }' \
  --instance-configuration '{
    "Cpu": "0.25 vCPU",
    "Memory": "0.5 GB"
  }' \
  --region us-west-2

# This will create a basic service, then we can update it with our actual application