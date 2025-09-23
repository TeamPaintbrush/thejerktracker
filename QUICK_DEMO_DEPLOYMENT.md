# Quick Demo Deployment for TheJERKTracker
# Using AWS App Runner - Perfect for demos, pay-as-you-go

## 💰 Cost for Demo App (Pay-as-you-go):
- **AWS App Runner**: $0.0025 per vCPU/minute + $0.000125 per GB/minute
- **RDS t3.micro**: $0.018/hour (only when running)
- **Estimated Demo Cost**: $2-5/day when actively testing

## 🚀 Quick Deployment Options:

### Option A: AWS App Runner (Recommended for Demo)
```bash
# Build and deploy in one command
aws apprunner create-service \
  --service-name "thejerktracker-demo" \
  --source-configuration '{
    "ImageRepository": {
      "ImageIdentifier": "640837413949.dkr.ecr.us-west-2.amazonaws.com/thejerktracker:latest",
      "ImageConfiguration": {
        "Port": "3000",
        "RuntimeEnvironmentVariables": {
          "NODE_ENV": "production",
          "DATABASE_URL": "postgresql://thejerktracker:ThejerkTracker2025!@thejerktracker-db.cb6i4a0qipsz.us-west-2.rds.amazonaws.com:5432/postgres",
          "NEXTAUTH_URL": "https://thejerktracker-demo.us-west-2.awsapprunner.com",
          "NEXTAUTH_SECRET": "um3RglR8CEgy3+Cl1YgFYy06BZsEzucAC9uHrpoxhzY="
        }
      },
      "ImageRepositoryType": "ECR"
    }
  }' \
  --region us-west-2
```

### Option B: Use Existing Vercel (Fastest)
Since you already have Vercel working, just fix the auth issue:
```bash
# Set the missing environment variable in Vercel Dashboard
NEXTAUTH_SECRET=um3RglR8CEgy3+Cl1YgFYy06BZsEzucAC9uHrpoxhzY=
```

### Option C: Local Docker (Free Testing)
```bash
# Test locally with Docker
docker-compose up
# Access at http://localhost:3000
```

## 🎯 Recommendation for Demo:

**Go back to Vercel** - it's already set up and working, just needs the environment variable fixed. This will give you:
- ✅ **Instant deployment**
- ✅ **Public URL**: https://thejerktracker0.vercel.app
- ✅ **Free tier**
- ✅ **Zero AWS costs**

AWS is great for production, but for a demo, Vercel is perfect!