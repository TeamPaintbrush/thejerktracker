#!/bin/bash

# Monitor App Runner deployment until ready
SERVICE_ARN="arn:aws:apprunner:us-east-1:640837413949:service/thejerktracker-app/d8ab7cb401484c0b9b49383dc2da84e1"
SERVICE_URL="https://df27ezbdy6.us-east-1.awsapprunner.com"

echo "🔍 Monitoring TheJERKTracker deployment..."
echo "Service URL: $SERVICE_URL"
echo ""

while true; do
    STATUS=$(aws apprunner describe-service --service-arn "$SERVICE_ARN" --query "Service.Status" --output text --region us-east-1 2>/dev/null)

    if [ "$STATUS" = "RUNNING" ]; then
        echo ""
        echo "🎉 SUCCESS! Your application is now LIVE!"
        echo "🌐 URL: $SERVICE_URL"
        echo ""
        echo "💰 Cost: ~$2-5/day (pay-as-you-go)"
        echo "⚡ Status: RUNNING"
        echo ""
        echo "🎯 Your TheJERKTracker application is ready to use!"
        break
    elif [ "$STATUS" = "CREATE_FAILED" ]; then
        echo ""
        echo "❌ DEPLOYMENT FAILED"
        echo "Status: $STATUS"
        echo ""
        echo "Let me check the logs for error details..."
        break
    else
        echo "$(date '+%H:%M:%S') - Status: $STATUS"
        sleep 30
    fi
done