#!/bin/bash

echo "🏐 Volleyball League Manager Setup"
echo "=================================="

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL not found. Installing MySQL..."
    brew install mysql
    brew services start mysql
else
    echo "✅ MySQL found"
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js first"
    exit 1
else
    echo "✅ Node.js found"
fi

# Setup database
echo "📊 Setting up database..."
mysql -u root -e "CREATE DATABASE IF NOT EXISTS TournamentDB2;" 2>/dev/null || {
    echo "⚠️  Database setup failed. You may need to set MySQL root password"
    echo "Run: mysql_secure_installation"
}

mysql -u root TournamentDB2 < schema.sql 2>/dev/null || {
    echo "⚠️  Schema import failed. Run manually: mysql -u root < schema.sql"
}

# Install backend dependencies
echo "🔧 Installing backend dependencies..."
cd backend
npm install

# Install frontend dependencies
echo "🎨 Installing frontend dependencies..."
cd ../volleyball-frontend
npm install

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the application:"
echo "1. Backend:  cd backend && node server.js"
echo "2. Frontend: cd volleyball-frontend && npm start"
echo ""
echo "Visit: http://localhost:3000"