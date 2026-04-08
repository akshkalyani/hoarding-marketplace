#!/bin/bash
set -e

echo "═══════════════════════════════════════"
echo "  AdMax Hoarding Marketplace - Setup"
echo "═══════════════════════════════════════"
echo ""

# Check for local PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "ERROR: PostgreSQL is required. Install via: brew install postgresql@16"
    exit 1
fi

# 1. Ensure PostgreSQL is running and create database
echo "1. Setting up local PostgreSQL..."
if brew services list 2>/dev/null | grep -q postgresql; then
    brew services start postgresql@16 2>/dev/null || brew services start postgresql 2>/dev/null || true
fi
echo "   Creating database 'admax' (if it doesn't exist)..."
createdb admax 2>/dev/null || echo "   Database 'admax' already exists, continuing..."

# 2. Install backend dependencies
echo "2. Installing backend dependencies..."
cd apps/backend
npm install

# 3. Run Prisma migrations
echo "3. Running database migrations..."
npx prisma migrate dev --name init --skip-generate
npx prisma generate

# 4. Seed database
echo "4. Seeding database..."
npx ts-node prisma/seed.ts

# 5. Install frontend dependencies
echo "5. Installing frontend dependencies..."
cd ../frontend
npm install

echo ""
echo "═══════════════════════════════════════"
echo "  Setup complete!"
echo ""
echo "  Start backend:  cd apps/backend && npm run dev"
echo "  Start frontend: cd apps/frontend && npm run dev"
echo ""
echo "  Backend: http://localhost:4000/api"
echo "  Frontend: http://localhost:3000"
echo ""
echo "  Login credentials (password: password123):"
echo "    Admin:  admin@admax.com"
echo "    Owner:  owner@admax.com"
echo "    Agency: agency@admax.com"
echo "═══════════════════════════════════════"
