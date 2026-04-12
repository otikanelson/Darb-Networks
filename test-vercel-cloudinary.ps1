# Test Vercel Cloudinary Configuration
Write-Host "Testing Vercel Cloudinary Configuration..." -ForegroundColor Cyan
Write-Host ""

# Test 1: Check Cloudinary Status
Write-Host "1. Checking Cloudinary Status Endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://darb-backend.vercel.app/api/cloudinary-status" -Method GET -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    
    Write-Host "   Response:" -ForegroundColor White
    Write-Host "   $($response.Content)" -ForegroundColor Gray
    Write-Host ""
    
    if ($data.cloudinary.configured -eq $true) {
        Write-Host "   ✅ Cloudinary is CONFIGURED" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Cloudinary is NOT configured" -ForegroundColor Red
        Write-Host "   Cloud Name: $($data.cloudinary.hasConfig.cloudName)" -ForegroundColor Gray
        Write-Host "   API Key: $($data.cloudinary.hasConfig.apiKey)" -ForegroundColor Gray
        Write-Host "   API Secret: $($data.cloudinary.hasConfig.apiSecret)" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "2. Checking Health Endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://darb-backend.vercel.app/health" -Method GET -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    
    if ($data.status -eq "healthy") {
        Write-Host "   ✅ Backend is healthy" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Backend status: $($data.status)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "3. Checking Database Status..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://darb-backend.vercel.app/api/db-status" -Method GET -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    
    if ($data.database.initialized -eq $true) {
        Write-Host "   ✅ Database is initialized" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Database not initialized: $($data.database.error)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Complete!" -ForegroundColor Cyan
Write-Host ""
Write-Host "If Cloudinary shows as NOT configured:" -ForegroundColor Yellow
Write-Host "1. Wait 1-2 minutes for Vercel deployment to complete" -ForegroundColor White
Write-Host "2. Run this script again" -ForegroundColor White
Write-Host "3. Check Vercel dashboard for deployment status" -ForegroundColor White
Write-Host ""
