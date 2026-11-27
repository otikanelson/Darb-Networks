# PowerShell script to setup the local database

Write-Host "🔧 Setting up local database..." -ForegroundColor Cyan

$mysqlPassword = $args[0]
$dbName = "darb_network_dev"
$mysqlHost = "localhost"
$mysqlUser = "root"

# If no password provided, try empty password first
if ([string]::IsNullOrEmpty($mysqlPassword)) {
    Write-Host "⚠️  No password provided. Trying without password..." -ForegroundColor Yellow
    $mysqlPassword = ""
}

# Path to SQL file
$sqlFile = "$PSScriptRoot\create-db.sql"

if (-not (Test-Path $sqlFile)) {
    Write-Host "❌ SQL file not found: $sqlFile" -ForegroundColor Red
    exit 1
}

try {
    # Try to connect and execute SQL
    Write-Host "📍 Connecting to MySQL at $mysqlHost..." -ForegroundColor Cyan
    
    if ([string]::IsNullOrEmpty($mysqlPassword)) {
        # No password
        Write-Host "Executing: mysql -u $mysqlUser -h $mysqlHost < $sqlFile" -ForegroundColor Gray
        & mysql -u $mysqlUser -h $mysqlHost < $sqlFile 2>&1
    } else {
        # With password
        Write-Host "Executing: mysql -u $mysqlUser -p$([char]8226 * $mysqlPassword.Length) -h $mysqlHost < $sqlFile" -ForegroundColor Gray
        & mysql -u $mysqlUser -p"$mysqlPassword" -h $mysqlHost < $sqlFile 2>&1
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database setup completed successfully!" -ForegroundColor Green
        Write-Host "✨ Database '$dbName' is ready for testing" -ForegroundColor Green
        exit 0
    } else {
        Write-Host "❌ MySQL command failed with exit code: $LASTEXITCODE" -ForegroundColor Red
        Write-Host "💡 Try: .\scripts\setup-db.ps1 'your_mysql_password'" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    Write-Host "💡 Make sure MySQL is running and accessible" -ForegroundColor Yellow
    exit 1
}
