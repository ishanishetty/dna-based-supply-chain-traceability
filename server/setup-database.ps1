# MySQL Database Setup Script for DNA Trace
# This script helps you set up the MySQL database

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

# Prompt for MySQL root password
$password = Read-Host "Enter MySQL root password (press Enter if no password)" -AsSecureString
$passwordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))

# Create database
Write-Host "Creating database 'dna_trace'..." -ForegroundColor Cyan
if ($passwordPlain) {
    & $mysqlPath -u root -p"$passwordPlain" -e "CREATE DATABASE IF NOT EXISTS dna_trace;"
} else {
    & $mysqlPath -u root -e "CREATE DATABASE IF NOT EXISTS dna_trace;"
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "Database created successfully!" -ForegroundColor Green
} else {
    Write-Host "Failed to create database. Please check your MySQL credentials." -ForegroundColor Red
    exit 1
}

# Run schema
Write-Host "Running schema.sql..." -ForegroundColor Cyan
$schemaPath = Join-Path $PSScriptRoot "schema.sql"
if ($passwordPlain) {
    & $mysqlPath -u root -p"$passwordPlain" dna_trace -e "source $schemaPath"
    Get-Content $schemaPath | & $mysqlPath -u root -p"$passwordPlain" dna_trace
} else {
    Get-Content $schemaPath | & $mysqlPath -u root dna_trace
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "Schema applied successfully!" -ForegroundColor Green
} else {
    Write-Host "Failed to apply schema. Please check the error messages above." -ForegroundColor Red
    exit 1
}

# Update .env file
Write-Host "Updating .env file..." -ForegroundColor Cyan
$envPath = Join-Path $PSScriptRoot ".env"
$envContent = @"
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=$passwordPlain
DB_NAME=dna_trace
PORT=3001
"@
$envContent | Out-File -FilePath $envPath -Encoding utf8 -NoNewline
Write-Host ".env file updated!" -ForegroundColor Green

Write-Host ""
Write-Host "=== Setup Complete! ===" -ForegroundColor Green
Write-Host "You can now start the server with: npm run dev" -ForegroundColor Cyan




