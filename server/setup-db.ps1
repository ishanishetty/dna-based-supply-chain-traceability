# Quick MySQL Setup - Usage: .\setup-db.ps1 -Password "your_password"
param(
    [string]$Password = ""
)

$mysqlPath = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"

if (-not (Test-Path $mysqlPath)) {
    Write-Host "MySQL not found!" -ForegroundColor Red
    exit 1
}

Write-Host "Setting up MySQL database..." -ForegroundColor Cyan

# Create database
if ($Password) {
    & $mysqlPath -u root -p"$Password" -e "CREATE DATABASE IF NOT EXISTS dna_trace;" 2>&1 | Out-Null
} else {
    & $mysqlPath -u root -e "CREATE DATABASE IF NOT EXISTS dna_trace;" 2>&1 | Out-Null
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to create database. Check your password." -ForegroundColor Red
    exit 1
}

# Run schema
$schemaPath = Join-Path $PSScriptRoot "schema.sql"
if ($Password) {
    Get-Content $schemaPath | & $mysqlPath -u root -p"$Password" dna_trace 2>&1 | Out-Null
} else {
    Get-Content $schemaPath | & $mysqlPath -u root dna_trace 2>&1 | Out-Null
}

# Update .env
$envContent = @"
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=$Password
DB_NAME=dna_trace
PORT=3001
"@
$envContent | Out-File -FilePath (Join-Path $PSScriptRoot ".env") -Encoding utf8 -NoNewline

Write-Host "Database setup complete!" -ForegroundColor Green




