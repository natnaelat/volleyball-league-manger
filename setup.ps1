# PowerShell setup script for Windows
# Volleyball League Manager Setup

Write-Host "Volleyball League Manager Setup" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if MySQL is installed
$mysqlInstalled = $false
try {
    $null = Get-Command mysql -ErrorAction Stop
    $mysqlInstalled = $true
    Write-Host "[OK] MySQL found" -ForegroundColor Green
} catch {
    Write-Host "[X] MySQL not found" -ForegroundColor Red
    Write-Host "   Please install MySQL and add it to your PATH" -ForegroundColor Yellow
    Write-Host "   Or install MySQL from: https://dev.mysql.com/downloads/installer/" -ForegroundColor Yellow
    Write-Host ""
}

# Check if Node.js is installed
$nodeInstalled = $false
try {
    $null = Get-Command node -ErrorAction Stop
    $nodeVersion = node --version
    Write-Host "[OK] Node.js found ($nodeVersion)" -ForegroundColor Green
    $nodeInstalled = $true
} catch {
    Write-Host "[X] Node.js not found. Please install Node.js first" -ForegroundColor Red
    Write-Host "   Download from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Setup database
if ($mysqlInstalled) {
    Write-Host "Setting up database..." -ForegroundColor Cyan
    try {
        # Try to create database (may require password)
        $result = mysql -u root -e "CREATE DATABASE IF NOT EXISTS TournamentDB2;" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[OK] Database created" -ForegroundColor Green
        } else {
            Write-Host "[!] Database creation failed. You may need to enter MySQL root password" -ForegroundColor Yellow
            Write-Host "   Run manually: mysql -u root -p -e `"CREATE DATABASE IF NOT EXISTS TournamentDB2;`"" -ForegroundColor Yellow
        }
        
        # Import schema
        if (Test-Path "schema.sql") {
            Get-Content schema.sql | mysql -u root TournamentDB2 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "[OK] Schema imported" -ForegroundColor Green
            } else {
                Write-Host "[!] Schema import failed. Run manually: Get-Content schema.sql | mysql -u root -p TournamentDB2" -ForegroundColor Yellow
            }
        } else {
            Write-Host "[!] schema.sql not found" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "[!] Database setup failed. Please run MySQL commands manually" -ForegroundColor Yellow
    }
} else {
    Write-Host "[!] Skipping database setup (MySQL not found)" -ForegroundColor Yellow
}

Write-Host ""

# Install backend dependencies
Write-Host "Installing backend dependencies..." -ForegroundColor Cyan
if (Test-Path "backend") {
    Set-Location backend
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Backend dependencies installed" -ForegroundColor Green
    } else {
        Write-Host "[X] Backend dependencies installation failed" -ForegroundColor Red
    }
    Set-Location ..
} else {
    Write-Host "[!] backend directory not found" -ForegroundColor Yellow
}

Write-Host ""

# Install frontend dependencies
Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
if (Test-Path "volleyball-frontend") {
    Set-Location volleyball-frontend
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Frontend dependencies installed" -ForegroundColor Green
    } else {
        Write-Host "[X] Frontend dependencies installation failed" -ForegroundColor Red
    }
    Set-Location ..
} else {
    Write-Host "[!] volleyball-frontend directory not found" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[OK] Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "To start the application:" -ForegroundColor Cyan
Write-Host "1. Backend:  cd backend; node server.js" -ForegroundColor White
Write-Host "2. Frontend: cd volleyball-frontend; npm start" -ForegroundColor White
Write-Host ""
Write-Host "Visit: http://localhost:3000" -ForegroundColor Cyan

