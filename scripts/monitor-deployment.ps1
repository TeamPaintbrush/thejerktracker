# Monitor App Runner deployment until ready
$SERVICE_ARN = "arn:aws:apprunner:us-east-1:640837413949:service/thejerktracker-app/d8ab7cb401484c0b9b49383dc2da84e1"
$SERVICE_URL = "https://df27ezbdy6.us-east-1.awsapprunner.com"

Write-Host "🔍 Monitoring TheJERKTracker deployment..." -ForegroundColor Cyan
Write-Host "Service URL: $SERVICE_URL" -ForegroundColor Yellow
Write-Host ""

while ($true) {
    try {
        $STATUS = aws apprunner describe-service --service-arn "$SERVICE_ARN" --query "Service.Status" --output text --region us-east-1 2>$null

        if ($STATUS -eq "RUNNING") {
            Write-Host ""
            Write-Host "🎉 SUCCESS! Your application is now LIVE!" -ForegroundColor Green
            Write-Host "🌐 URL: $SERVICE_URL" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "💰 Cost: ~`$2-5/day (pay-as-you-go)" -ForegroundColor Yellow
            Write-Host "⚡ Status: RUNNING" -ForegroundColor Green
            Write-Host ""
            Write-Host "🎯 Your TheJERKTracker application is ready to use!" -ForegroundColor Magenta
            break
        }
        elseif ($STATUS -eq "CREATE_FAILED") {
            Write-Host ""
            Write-Host "❌ DEPLOYMENT FAILED" -ForegroundColor Red
            Write-Host "Status: $STATUS" -ForegroundColor Red
            Write-Host ""
            Write-Host "Let me check the logs for error details..." -ForegroundColor Yellow
            break
        }
        else {
            $timestamp = Get-Date -Format "HH:mm:ss"
            Write-Host "$timestamp - Status: $STATUS" -ForegroundColor Gray
            Start-Sleep -Seconds 30
        }
    }
    catch {
        Write-Host "Error checking status: $_" -ForegroundColor Red
        Start-Sleep -Seconds 30
    }
}