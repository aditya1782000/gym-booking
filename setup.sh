#!/bin/bash

echo "🏋️ Gym Management API Setup"
echo "============================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please update .env with your actual credentials:"
    echo "   - DATABASE_URL (Neon DB connection string)"
    echo "   - GOOGLE_CLIENT_ID"
    echo "   - GOOGLE_CLIENT_SECRET"
    echo "   - JWT_SECRET (generate a secure random string)"
    echo ""
    read -p "Press Enter when you've updated .env file..."
else
    echo "✅ .env file already exists"
fi

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🗄️  Setting up database..."
npx prisma generate
echo ""
echo "⚠️  About to run database migrations..."
echo "   Make sure your DATABASE_URL in .env is correct!"
read -p "Press Enter to continue..."

npx prisma migrate dev --name init

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 To start the server:"
echo "   npm run start:dev"
echo ""
echo "📖 Visit http://localhost:3000/api/auth/google to test authentication"
echo ""
echo "📚 Read README.md for detailed documentation"
echo "🧪 Read API_TESTING.md for API usage examples"
