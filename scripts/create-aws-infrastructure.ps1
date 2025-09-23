# AWS Manual Deployment Script for TheJERKTracker (PowerShell)
# This script creates AWS infrastructure without Amplify CLI

param(
    [string]$AppName = "thejerktracker",
    [string]$Region = "us-west-2",
    [string]$DbPassword = "ThejerkTracker2025!",
    [string]$DbUsername = "thejerktracker"
)

Write-Host "🚀 Starting AWS manual deployment for TheJERKTracker..." -ForegroundColor Green

Write-Host "📋 Configuration:" -ForegroundColor Yellow
Write-Host "  App Name: $AppName"
Write-Host "  Region: $Region"
Write-Host "  Database: PostgreSQL"

try {
    # Step 1: Create VPC
    Write-Host "📋 Step 1: Creating VPC..." -ForegroundColor Yellow
    $vpcResult = aws ec2 create-vpc --cidr-block "10.0.0.0/16" --tag-specifications "ResourceType=vpc,Tags=[{Key=Name,Value=$AppName-vpc}]" --query "Vpc.VpcId" --output text --region $Region
    $VpcId = $vpcResult.Trim()
    Write-Host "✅ VPC created: $VpcId" -ForegroundColor Green

    # Enable DNS hostnames
    aws ec2 modify-vpc-attribute --vpc-id $VpcId --enable-dns-hostnames --region $Region

    # Step 2: Create Internet Gateway
    Write-Host "📋 Step 2: Creating Internet Gateway..." -ForegroundColor Yellow
    $igwResult = aws ec2 create-internet-gateway --tag-specifications "ResourceType=internet-gateway,Tags=[{Key=Name,Value=$AppName-igw}]" --query "InternetGateway.InternetGatewayId" --output text --region $Region
    $IgwId = $igwResult.Trim()
    Write-Host "✅ Internet Gateway created: $IgwId" -ForegroundColor Green

    # Attach Internet Gateway to VPC
    aws ec2 attach-internet-gateway --vpc-id $VpcId --internet-gateway-id $IgwId --region $Region

    # Step 3: Create Subnets
    Write-Host "📋 Step 3: Creating Subnets..." -ForegroundColor Yellow
    $subnet1Result = aws ec2 create-subnet --vpc-id $VpcId --cidr-block "10.0.1.0/24" --availability-zone "$Region" + "a" --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=$AppName-subnet-1}]" --query "Subnet.SubnetId" --output text --region $Region
    $Subnet1Id = $subnet1Result.Trim()

    $subnet2Result = aws ec2 create-subnet --vpc-id $VpcId --cidr-block "10.0.2.0/24" --availability-zone "$Region" + "b" --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=$AppName-subnet-2}]" --query "Subnet.SubnetId" --output text --region $Region
    $Subnet2Id = $subnet2Result.Trim()

    Write-Host "✅ Subnets created: $Subnet1Id, $Subnet2Id" -ForegroundColor Green

    # Step 4: Create Route Table
    Write-Host "📋 Step 4: Creating Route Table..." -ForegroundColor Yellow
    $routeTableResult = aws ec2 create-route-table --vpc-id $VpcId --tag-specifications "ResourceType=route-table,Tags=[{Key=Name,Value=$AppName-rt}]" --query "RouteTable.RouteTableId" --output text --region $Region
    $RouteTableId = $routeTableResult.Trim()

    # Add route to Internet Gateway
    aws ec2 create-route --route-table-id $RouteTableId --destination-cidr-block "0.0.0.0/0" --gateway-id $IgwId --region $Region

    # Associate subnets with route table
    aws ec2 associate-route-table --subnet-id $Subnet1Id --route-table-id $RouteTableId --region $Region
    aws ec2 associate-route-table --subnet-id $Subnet2Id --route-table-id $RouteTableId --region $Region

    Write-Host "✅ Route table configured: $RouteTableId" -ForegroundColor Green

    # Step 5: Create Security Groups
    Write-Host "📋 Step 5: Creating Security Groups..." -ForegroundColor Yellow

    # Security Group for RDS
    $rdsSgResult = aws ec2 create-security-group --group-name "$AppName-rds-sg" --description "Security group for RDS database" --vpc-id $VpcId --tag-specifications "ResourceType=security-group,Tags=[{Key=Name,Value=$AppName-rds-sg}]" --query "GroupId" --output text --region $Region
    $RdsSgId = $rdsSgResult.Trim()

    # Security Group for ECS
    $ecsSgResult = aws ec2 create-security-group --group-name "$AppName-ecs-sg" --description "Security group for ECS tasks" --vpc-id $VpcId --tag-specifications "ResourceType=security-group,Tags=[{Key=Name,Value=$AppName-ecs-sg}]" --query "GroupId" --output text --region $Region
    $EcsSgId = $ecsSgResult.Trim()

    # Security Group for ALB
    $albSgResult = aws ec2 create-security-group --group-name "$AppName-alb-sg" --description "Security group for Application Load Balancer" --vpc-id $VpcId --tag-specifications "ResourceType=security-group,Tags=[{Key=Name,Value=$AppName-alb-sg}]" --query "GroupId" --output text --region $Region
    $AlbSgId = $albSgResult.Trim()

    Write-Host "✅ Security groups created:" -ForegroundColor Green
    Write-Host "  RDS: $RdsSgId"
    Write-Host "  ECS: $EcsSgId"
    Write-Host "  ALB: $AlbSgId"

    # Configure Security Group Rules
    Write-Host "📋 Step 6: Configuring Security Group Rules..." -ForegroundColor Yellow

    # ALB Security Group - Allow HTTP/HTTPS from internet
    aws ec2 authorize-security-group-ingress --group-id $AlbSgId --protocol tcp --port 80 --cidr "0.0.0.0/0" --region $Region
    aws ec2 authorize-security-group-ingress --group-id $AlbSgId --protocol tcp --port 443 --cidr "0.0.0.0/0" --region $Region

    # ECS Security Group - Allow traffic from ALB
    aws ec2 authorize-security-group-ingress --group-id $EcsSgId --protocol tcp --port 3000 --source-group $AlbSgId --region $Region

    # RDS Security Group - Allow traffic from ECS
    aws ec2 authorize-security-group-ingress --group-id $RdsSgId --protocol tcp --port 5432 --source-group $EcsSgId --region $Region

    Write-Host "✅ Security group rules configured" -ForegroundColor Green

    # Save configuration to file
    Write-Host "📋 Saving configuration..." -ForegroundColor Yellow
    
    $configContent = @"
# AWS Infrastructure Configuration for TheJERKTracker
VPC_ID=$VpcId
IGW_ID=$IgwId
SUBNET1_ID=$Subnet1Id
SUBNET2_ID=$Subnet2Id
ROUTE_TABLE_ID=$RouteTableId
RDS_SG_ID=$RdsSgId
ECS_SG_ID=$EcsSgId
ALB_SG_ID=$AlbSgId
REGION=$Region
APP_NAME=$AppName
DB_PASSWORD=$DbPassword
DB_USERNAME=$DbUsername
"@

    $configContent | Out-File -FilePath "aws-config.env" -Encoding UTF8

    Write-Host "✅ Configuration saved to aws-config.env" -ForegroundColor Green
    Write-Host "🎉 AWS VPC infrastructure setup complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Next steps:" -ForegroundColor Yellow
    Write-Host "1. Create RDS database"
    Write-Host "2. Create ECS cluster"
    Write-Host "3. Deploy application"

    # Return the configuration
    return @{
        VpcId = $VpcId
        Subnet1Id = $Subnet1Id
        Subnet2Id = $Subnet2Id
        RdsSgId = $RdsSgId
        EcsSgId = $EcsSgId
        AlbSgId = $AlbSgId
    }

} catch {
    Write-Host "❌ Error occurred: $($_.Exception.Message)" -ForegroundColor Red
    throw
}