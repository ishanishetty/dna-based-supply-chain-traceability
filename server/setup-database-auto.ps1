# MySQL Database Setup Script for DNA Trace (Non-Interactive)
# This script tries to set up the database automatically

Write-Host "=== DNA Trace MySQL Database Setup ===" -ForegroundColor Cyan
Write-Host ""

# Check if MySQL is available
$mysqlPath = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
if (-not (Test-Path $mysqlPath)) {
    Write-Host "MySQL not found at expected location: $mysqlPath" -ForegroundColor Yellow
    Write-Host "Please ensure MySQL is installed and update the path in this script." -ForegroundColor Yellow
    exit 1
}

Write-Host "MySQL found at: $mysqlPath" -ForegroundColor Green
Write-Host ""

# Try to read password from .env if it exists
$envPath = Join-Path $PSScriptRoot ".env"
$password = ""
if (Test-Path $envPath) {
    $envContent = Get-Content $envPath
    $passwordLine = $envContent | Where-Object { $_ -match "^DB_PASSWORD=(.+)$" }
    if ($passwordLine) {
        $password = $matches[1]
        Write-Host "Found password in .env file" -ForegroundColor Green
    }
}

# Try without password first
Write-Host "Attempting to connect without password..." -ForegroundColor Cyan
$result = & $mysqlPath -u root -e "SELECT 1;" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "Connected successfully without password!" -ForegroundColor Green
    $password = ""
} else {
    if ($password) {
        Write-Host "Trying with password from .env..." -ForegroundColor Cyan
        $result = & $mysqlPath -u root -p"$password" -e "SELECT 1;" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Connected successfully with password from .env!" -ForegroundColor Green
        } else {
            Write-Host "Password from .env didn't work. Please update server/.env with correct password." -ForegroundColor Red
            Write-Host ""
            Write-Host "To set up manually:" -ForegroundColor Yellow
            Write-Host "1. Edit server/.env and set DB_PASSWORD=your_password" -ForegroundColor White
            Write-Host "2. Run this script again" -ForegroundColor White
            exit 1
        }
    } else {
        Write-Host "MySQL requires a password." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Please update server/.env file with your MySQL root password:" -ForegroundColor Yellow
        Write-Host "  DB_PASSWORD=your_password_here" -ForegroundColor White
        Write-Host ""
        Write-Host "Then run this script again." -ForegroundColor White
        exit 1
    }
}

# Create database
Write-Host ""
Write-Host "Creating database 'dna_trace'..." -ForegroundColor Cyan
if ($password) {
    & $mysqlPath -u root -p"$password" -e "CREATE DATABASE IF NOT EXISTS dna_trace;" 2>&1 | Out-Null
} else {
    & $mysqlPath -u root -e "CREATE DATABASE IF NOT EXISTS dna_trace;" 2>&1 | Out-Null
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "Database created successfully!" -ForegroundColor Green
} else {
    Write-Host "Failed to create database." -ForegroundColor Red
    exit 1
}

# Run schema
Write-Host "Running schema.sql..." -ForegroundColor Cyan
$schemaPath = Join-Path $PSScriptRoot "schema.sql"
$schemaContent = Get-Content $schemaPath -Raw

# Split by semicolons and execute each statement
$statements = $schemaContent -split ';' | Where-Object { $_.Trim() -ne '' -and $_ -notmatch '^--' }

foreach ($statement in $statements) {
    $cleanStatement = $statement.Trim()
    if ($cleanStatement -and $cleanStatement -notmatch '^--' -and $cleanStatement.Length -gt 10) {
        if ($password) {
            $cleanStatement | & $mysqlPath -u root -p"$password" dna_trace 2>&1 | Out-Null
        } else {
            $cleanStatement | & $mysqlPath -u root dna_trace 2>&1 | Out-Null
        }
    }
}

# Verify tables were created
Write-Host "Verifying tables..." -ForegroundColor Cyan
if ($password) {
    $tables = & $mysqlPath -u root -p"$password" dna_trace -e "SHOW TABLES;" 2>&1
} else {
    $tables = & $mysqlPath -u root dna_trace -e "SHOW TABLES;" 2>&1
}

if ($tables -match "products" -and $tables -match "events" -and $tables -match "dna_history") {
    Write-Host "All tables created successfully!" -ForegroundColor Green
} else {
    Write-Host "Warning: Some tables may not have been created. Check the output above." -ForegroundColor Yellow
}

# Update .env file with password
Write-Host ""
Write-Host "Updating .env file..." -ForegroundColor Cyan
$envContent = @"
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=$password
DB_NAME=dna_trace
PORT=3001
"@
$envContent | Out-File -FilePath $envPath -Encoding utf8 -NoNewline
Write-Host ".env file updated!" -ForegroundColor Green

Write-Host ""
Write-Host "=== Setup Complete! ===" -ForegroundColor Green
Write-Host "Database 'dna_trace' is ready to use." -ForegroundColor Green
Write-Host "The backend server should automatically reconnect." -ForegroundColor Cyan




