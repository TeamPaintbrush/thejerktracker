# Deploy TheJERKTracker to S3 Static Hosting
# This script builds and deploys the static version to S3

$BUCKET_NAME = "thejerktracker-live-2075861439"

Write-Host "🚀 Deploying TheJERKTracker to S3..." -ForegroundColor Cyan

# Switch to static export config
Write-Host "📋 Configuring for static export..." -ForegroundColor Yellow
copy next.config.static.js next.config.js

# Build the application
Write-Host "🔨 Building application..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -eq 0) {
    # Upload to S3
    Write-Host "📤 Uploading to S3..." -ForegroundColor Yellow
    aws s3 sync out/ s3://$BUCKET_NAME/ --delete

    # Restore dev config
    Write-Host "🔄 Restoring development config..." -ForegroundColor Yellow
    copy next.config.dev.js next.config.js

    Write-Host ""
    Write-Host "✅ DEPLOYMENT COMPLETE!" -ForegroundColor Green
    Write-Host "🌐 Live URL: http://$BUCKET_NAME.s3-website-us-east-1.amazonaws.com" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "💡 TIP: Hard refresh (Ctrl+F5) to see changes immediately" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "❌ Build failed! Restoring dev config..." -ForegroundColor Red
    copy next.config.dev.js next.config.js
}