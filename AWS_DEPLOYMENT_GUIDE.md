# 🚀 AWS Deployment Guide for TheJERKTracker

This guide walks you through deploying TheJERKTracker to AWS while keeping your existing Vercel and GitHub configurations intact (but disconnected).

## 📋 Prerequisites

✅ **AWS CLI installed** (done)
✅ **AWS credentials configured** (done)
✅ **Amplify CLI installed** (done)

## 🎯 Step 1: Initialize Amplify Project

```bash
cd "C:\Users\leroy\Downloads\wordpress-to-react-project\The-JERK-Tracker\thejerktracker"
amplify init
```

**Choose these options:**
- Project name: `thejerktracker`
- Environment name: `prod`
- Default editor: `Visual Studio Code`
- App type: `javascript`
- Framework: `react`
- Source directory path: `src`
- Distribution directory path: `.next`
- Build command: `npm run build:aws`
- Start command: `npm run start`
- Use AWS profile: `Yes` → `default`

## 🎯 Step 2: Add Database (RDS PostgreSQL)

```bash
amplify add storage
```

**Choose these options:**
- Storage service: `Content (Images, audio, video, etc.)`
- Resource name: `thejerktracker`
- Bucket name: `thejerktracker-storage`
- Access: `Auth and guest users`

Then add database:
```bash
amplify add api
```

**Choose these options:**
- Service: `GraphQL`
- API name: `thejerktracker`
- Authorization type: `Amazon Cognito User Pool`
- Do you want to configure advanced settings: `No`
- Schema template: `Single object with fields`

## 🎯 Step 3: Add Hosting

```bash
amplify add hosting
```

**Choose these options:**
- Hosting service: `Amazon CloudFront and S3`
- Static hosting or Continuous deployment: `Continuous deployment`
- Repository: Connect your GitHub repository
- Branch: `main`
- Build settings: Use existing `amplify.yml`

## 🎯 Step 4: Configure Environment Variables

In AWS Amplify Console:
1. Go to your app → App settings → Environment variables
2. Add these variables:

```
AWS_DATABASE_URL=postgresql://username:password@your-rds-endpoint:5432/thejerktracker
NEXTAUTH_SECRET=um3RglR8CEgy3+Cl1YgFYy06BZsEzucAC9uHrpoxhzY=
NEXTAUTH_URL=https://your-app-id.amplifyapp.com
NODE_ENV=production
```

## 🎯 Step 5: Deploy to AWS

```bash
amplify push
```

This will:
- Create AWS resources (RDS, S3, CloudFront)
- Deploy your application
- Provide you with a public URL

## 🔄 Step 6: Disconnect Vercel & GitHub (Optional)

### Disconnect Vercel:
1. Go to Vercel Dashboard
2. Project Settings → Git
3. Disconnect repository
4. Keep the project for reference but disable auto-deployments

### Disable GitHub Actions:
1. In your repository: `.github/workflows/deploy.yml`
2. Add this at the top to disable:
```yaml
# DISABLED - Using AWS Amplify instead
# Remove this line to re-enable GitHub Pages deployment
name: Deploy to GitHub Pages (DISABLED)
```

## 🎯 Step 7: Verify Deployment

```bash
npm run verify:aws
```

This will check:
- AWS CLI configuration
- Amplify app status
- RDS instances
- Environment variables

## 📱 Your AWS URLs

After deployment, you'll get:
- **Main App**: `https://main.your-app-id.amplifyapp.com`
- **Branch URLs**: `https://branch-name.your-app-id.amplifyapp.com`

## 🔧 AWS vs Other Platforms

| Feature | AWS Amplify | Vercel | GitHub Pages |
|---------|-------------|---------|--------------|
| **Backend API** | ✅ Full support | ✅ Full support | ❌ Static only |
| **Database** | ✅ RDS PostgreSQL | ✅ Vercel Postgres | ❌ None |
| **Authentication** | ✅ Cognito + NextAuth | ✅ NextAuth | ❌ Static only |
| **Custom Domain** | ✅ Free SSL | ✅ Free SSL | ✅ Free SSL |
| **Build Time** | ~3-5 minutes | ~1-2 minutes | ~1-2 minutes |
| **Cost** | ~$5-15/month | ~$0-20/month | Free |
| **Scalability** | ✅ Auto-scaling | ✅ Auto-scaling | ❌ Static |

## 🛠️ Build Commands Reference

```bash
# Local development
npm run dev

# Build for AWS
npm run build:aws

# Build for Vercel (disabled)
npm run build:vercel

# Build for GitHub Pages (disabled)
npm run build:github

# Database seeding
npm run db:seed:aws
```

## 🚨 Troubleshooting

### Common Issues:

1. **Build fails**: Check `amplify.yml` configuration
2. **Database errors**: Verify RDS connection string
3. **Auth issues**: Check NEXTAUTH_SECRET and NEXTAUTH_URL
4. **Environment variables**: Verify in Amplify Console

### Debug Commands:

```bash
amplify status          # Check resource status
amplify console         # Open Amplify Console
npm run verify:aws      # Verify configuration
```

## 🎉 Success!

Your TheJERKTracker is now running on AWS with:
- ✅ **Public URL** for sharing
- ✅ **Full backend** with API routes
- ✅ **PostgreSQL database** via RDS
- ✅ **Authentication** with NextAuth.js
- ✅ **Auto-scaling** and **CDN**
- ✅ **Preserved configs** for Vercel/GitHub

**Your application is now enterprise-ready on AWS! 🚀**