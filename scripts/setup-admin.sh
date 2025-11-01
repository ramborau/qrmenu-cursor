#!/bin/bash

# Setup script to create admin user and seed database

echo "🚀 Setting up QR Menu Manager Pro..."
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  DATABASE_URL not set. Please set it in your .env file or export it."
    echo "   Example: export DATABASE_URL='postgresql://user:password@localhost:5432/qrmenu?schema=public'"
    exit 1
fi

echo "📦 Pushing database schema..."
npx prisma db push --skip-generate

echo ""
echo "🌱 Seeding database..."
npm run db:seed

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Admin Credentials:"
echo "   Email: rahul@botpe.com"
echo "   Password: Ramborau46**"
echo ""
echo "💡 If the admin user doesn't exist yet, please:"
echo "   1. Start the app: npm run dev"
echo "   2. Go to: http://localhost:3000/auth/signup"
echo "   3. Sign up with the credentials above"
echo "   4. Run this script again to set the user role to OWNER"
echo ""

