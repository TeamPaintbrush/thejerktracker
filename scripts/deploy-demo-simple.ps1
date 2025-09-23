# Quick Static Demo Deployment to AWS S3
# This will create a fast, low-cost demo page while the main app deploys

# Variables
$bucketName = "thejerktracker-demo-$(Get-Random)"
$region = "us-east-1"

Write-Host "🚀 Deploying TheJERKTracker Demo Page to AWS..." -ForegroundColor Cyan

# Configure AWS region
aws configure set region $region

# Create S3 bucket for static hosting
Write-Host "📦 Creating S3 bucket: $bucketName" -ForegroundColor Yellow
aws s3 mb s3://$bucketName --region $region

# Enable static website hosting
Write-Host "🌐 Enabling static website hosting..." -ForegroundColor Yellow
aws s3 website s3://$bucketName --index-document demo-page.html

# Create bucket policy file
@'
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::BUCKET_NAME/*"
        }
    ]
}
'@ -replace 'BUCKET_NAME', $bucketName | Out-File -FilePath "bucket-policy.json" -Encoding UTF8

# Apply bucket policy
aws s3api put-bucket-policy --bucket $bucketName --policy file://bucket-policy.json

# Upload the demo page
Write-Host "📤 Uploading demo page..." -ForegroundColor Yellow
aws s3 cp demo-page.html s3://$bucketName/ --content-type "text/html"

# Get the website URL
$websiteUrl = "http://$bucketName.s3-website-$region.amazonaws.com"

Write-Host ""
Write-Host "✅ DEMO DEPLOYED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "🌐 Demo URL: $websiteUrl" -ForegroundColor Cyan
Write-Host ""
Write-Host "💰 Cost: ~`$0.01/day for S3 storage + minimal data transfer" -ForegroundColor Yellow
Write-Host "⚡ Load time: ~1-2 seconds globally" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Note: This is a static demo page showing the app overview." -ForegroundColor Gray
Write-Host "The full interactive app is still deploying on App Runner." -ForegroundColor Gray

# Save deployment info
$deploymentInfo = @"
# TheJERKTracker Demo Deployment

## Static Demo (LIVE NOW)
- URL: $websiteUrl
- Cost: ~`$0.01/day
- Type: Static S3 website
- Status: Active

## Full App (In Progress)  
- Platform: AWS App Runner + RDS
- Status: Deploying
- Cost: ~`$2-5/day when active

## Resources Created
- S3 Bucket: $bucketName
- Region: $region
- Public Access: Enabled

## Next Steps
1. Share the demo URL above
2. Monitor App Runner deployment
3. Update when full app is ready
"@

$deploymentInfo | Out-File -FilePath "DEMO_DEPLOYMENT.md" -Encoding UTF8

Write-Host "📄 Deployment details saved to DEMO_DEPLOYMENT.md" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 You can share this demo URL immediately!" -ForegroundColor Cyan

# Try to open the URL in default browser
try {
    Start-Process $websiteUrl
} catch {
    Write-Host "💡 Copy and paste this URL into your browser: $websiteUrl" -ForegroundColor Yellow
}