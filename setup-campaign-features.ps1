# Campaign Enhancement Setup Script for PowerShell
Write-Host "🚀 Starting Campaign Enhancement Setup..." -ForegroundColor Green

# Step 1: Install Frontend Dependencies
Write-Host "`n📦 Step 1: Installing frontend dependencies..." -ForegroundColor Cyan
Set-Location frontend
npm install react-quill quill
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install frontend dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green

# Step 2: Run Database Migration
Write-Host "`n🗄️ Step 2: Running database migration..." -ForegroundColor Cyan
Set-Location ../backend
node run-migration.js
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Migration failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Migration completed" -ForegroundColor Green

# Step 3: Seed Database
Write-Host "`n🌱 Step 3: Seeding database with 25 campaigns..." -ForegroundColor Cyan
node seed-25-campaigns-complete.js
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Seeding failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Database seeded successfully" -ForegroundColor Green

Write-Host "`n🎉 Setup Complete!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Start backend: cd backend && npm start" -ForegroundColor White
Write-Host "2. Start frontend: cd frontend && npm run dev" -ForegroundColor White
Write-Host "3. Visit http://localhost:5174 to test" -ForegroundColor White

Set-Location ..
