# Restore TheJERKTracker to Full Mode (with real authentication)
# This restores original authentication for local development

Write-Host "🔄 Restoring Full Mode..." -ForegroundColor Cyan

# Restore original files
$filesToRestore = @(
    @{backup = "src\app\auth\signin\page.original.tsx"; src = "src\app\auth\signin\page.tsx"},
    @{backup = "src\app\providers.original.tsx"; src = "src\app\providers.tsx"},
    @{backup = "src\hooks\useRoleAccess.original.tsx"; src = "src\hooks\useRoleAccess.tsx"}
)

foreach ($file in $filesToRestore) {
    if (Test-Path $file.backup) {
        Copy-Item $file.backup $file.src
        Write-Host "✅ Restored $($file.src)" -ForegroundColor Green
    } else {
        Write-Host "⚠️ No backup found for $($file.src)" -ForegroundColor Yellow
    }
}

# Switch to dev config
Copy-Item "next.config.dev.js" "next.config.js"
Write-Host "✅ Configured for development" -ForegroundColor Green

Write-Host ""
Write-Host "🎯 Full Mode Active!" -ForegroundColor Magenta
Write-Host "   - Real authentication required" -ForegroundColor Yellow
Write-Host "   - API routes enabled" -ForegroundColor Yellow
Write-Host "   - Perfect for local development" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. npm run dev" -ForegroundColor White
Write-Host "2. Test locally at localhost:1456" -ForegroundColor White