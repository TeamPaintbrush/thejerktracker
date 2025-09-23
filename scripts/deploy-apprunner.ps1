# Deploy TheJERKTracker to AWS App Runner
# This deploys the full server-capable application with API routes

$SERVICE_NAME = "thejerktracker-app"
$REGION = "us-east-1"
$REPO_URL = "https://github.com/TeamPaintbrush/pre-work-appx"
$BRANCH = "main"

Write-Host "🚀 Deploying TheJERKTracker to AWS App Runner..." -ForegroundColor Cyan
Write-Host "Service: $SERVICE_NAME" -ForegroundColor Yellow
Write-Host "Region: $REGION" -ForegroundColor Yellow
Write-Host "Repository: $REPO_URL" -ForegroundColor Yellow
Write-Host ""

# Check if service exists
try {
    $existingService = aws apprunner describe-service --service-name $SERVICE_NAME --region $REGION 2>$null
    if ($existingService) {
        Write-Host "📋 Existing service found. Updating..." -ForegroundColor Yellow

        # Update existing service with source code
        $serviceArn = aws apprunner describe-service --service-name $SERVICE_NAME --region $REGION --query "Service.ServiceArn" --output text

        aws apprunner update-service --service-arn $serviceArn --source-configuration "{
            \"CodeRepository\": {
                \"RepositoryUrl\": \"$REPO_URL\",
                \"SourceCodeVersion\": {
                    \"Type\": \"BRANCH\",
                    \"Value\": \"$BRANCH\"
                },
                \"CodeConfiguration\": {
                    \"ConfigurationSource\": \"REPOSITORY\",
                    \"CodeConfigurationValues\": {
                        \"Runtime\": \"NODEJS_18\",
                        \"BuildCommand\": \"npm install && npm run build\",
                        \"StartCommand\": \"npm start\",
                        \"Port\": \"3000\",
                        \"RuntimeEnvironmentVariables\": [
                            {
                                \"Name\": \"NODE_ENV\",
                                \"Value\": \"production\"
                            },
                            {
                                \"Name\": \"NEXTAUTH_SECRET\",
                                \"Value\": \"thejerk-super-secret-production-key-2025-change-me\"
                            },
                            {
                                \"Name\": \"AWS_REGION\",
                                \"Value\": \"us-east-1\"
                            }
                        ]
                    }
                }
            }
        }" --region $REGION

        Write-Host "✅ Service update initiated!" -ForegroundColor Green
    }
} catch {
    Write-Host "📦 Creating new App Runner service..." -ForegroundColor Yellow

    # Create new service with source code
    aws apprunner create-service --service-name $SERVICE_NAME --source-configuration "{
        \"CodeRepository\": {
            \"RepositoryUrl\": \"$REPO_URL\",
            \"SourceCodeVersion\": {
                \"Type\": \"BRANCH\",
                \"Value\": \"$BRANCH\"
            },
            \"CodeConfiguration\": {
                \"ConfigurationSource\": \"REPOSITORY\",
                \"CodeConfigurationValues\": {
                    \"Runtime\": \"NODEJS_18\",
                    \"BuildCommand\": \"npm install && npm run build\",
                    \"StartCommand\": \"npm start\",
                    \"Port\": \"3000\",
                    \"RuntimeEnvironmentVariables\": [
                        {
                            \"Name\": \"NODE_ENV\",
                            \"Value\": \"production\"
                        },
                        {
                            \"Name\": \"NEXTAUTH_SECRET\",
                            \"Value\": \"thejerk-super-secret-production-key-2025-change-me\"
                        },
                        {
                            \"Name\": \"AWS_REGION\",
                            \"Value\": \"us-east-1\"
                        }
                    ]
                }
            }
        }
    }" --region $REGION

    Write-Host "✅ Service creation initiated!" -ForegroundColor Green
}

Write-Host ""
Write-Host "⏳ Deployment in progress. This may take 5-10 minutes..." -ForegroundColor Yellow
Write-Host "Use .\scripts\monitor-deployment.ps1 to check status" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Once deployed, your API routes will work!" -ForegroundColor Green