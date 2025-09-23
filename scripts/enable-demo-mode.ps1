# Switch TheJERKTracker to Demo Mode for Static Deployment
# This replaces authentication with demo bypasses

Write-Host "🔄 Switching to Demo Mode..." -ForegroundColor Cyan

# Backup original files
$filesToBackup = @(
    @{src = "src\app\auth\signin\page.tsx"; backup = "src\app\auth\signin\page.original.tsx"},
    @{src = "src\app\providers.tsx"; backup = "src\app\providers.original.tsx"},
    @{src = "src\hooks\useRoleAccess.tsx"; backup = "src\hooks\useRoleAccess.original.tsx"}
)

foreach ($file in $filesToBackup) {
    if (!(Test-Path $file.backup)) {
        if (Test-Path $file.src) {
            Copy-Item $file.src $file.backup
            Write-Host "✅ Backed up $($file.src)" -ForegroundColor Green
        }
    }
}

# Replace with demo versions
Copy-Item "src\app\auth\signin\page.static.tsx" "src\app\auth\signin\page.tsx"
Copy-Item "src\app\providers.demo.tsx" "src\app\providers.tsx"
Copy-Item "src\hooks\useRoleAccess.demo.tsx" "src\hooks\useRoleAccess.tsx"

Write-Host "✅ Switched to demo components" -ForegroundColor Green

# Switch to static export config
Copy-Item "next.config.static.js" "next.config.js"
Write-Host "✅ Configured for static export" -ForegroundColor Green

Write-Host ""
Write-Host "🎯 Demo Mode Active!" -ForegroundColor Magenta
Write-Host "   - All NextAuth calls replaced with mocks" -ForegroundColor Yellow
Write-Host "   - Any email/password will work" -ForegroundColor Yellow
Write-Host "   - No API dependencies" -ForegroundColor Yellow
Write-Host "   - Perfect for static S3 hosting" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. npm run build" -ForegroundColor White
Write-Host "2. Deploy to S3" -ForegroundColor White