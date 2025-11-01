# Setup Guide - QR Menu Manager Pro

## Prerequisites

1. **PostgreSQL Database** - Make sure PostgreSQL is installed and running
2. **Node.js 18+** - Already installed
3. **Environment Variables** - Need to configure

## Step 1: Database Setup

### Option A: Local PostgreSQL

```bash
# Create database
createdb qrmenu

# Or using PostgreSQL client
psql -U postgres
CREATE DATABASE qrmenu;
\q
```

### Option B: Use a PostgreSQL service (Supabase, Neon, etc.)

Get your DATABASE_URL from the service provider.

## Step 2: Environment Variables

Create a `.env` file in the root directory:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/qrmenu?schema=public"

# App URL
APP_URL="http://localhost:3000"

# Better Auth Secret (generate a random string)
BETTER_AUTH_SECRET="your-random-secret-here"

# Better Auth URL
BETTER_AUTH_URL="http://localhost:3000"

# Optional: Unsplash API Key
UNSPLASH_ACCESS_KEY=""
```

**Generate a secret:**
```bash
openssl rand -hex 32
```

## Step 3: Database Migration

```bash
# Push schema to database
npx prisma db push

# Generate Prisma client
npx prisma generate
```

## Step 4: Create Admin User

Better Auth requires creating users through the API. You have two options:

### Option A: Through Signup Page (Recommended)

1. Start the app:
   ```bash
   npm run dev
   ```

2. Go to: http://localhost:3000/auth/signup

3. Sign up with:
   - **Email:** rahul@botpe.com
   - **Password:** Ramborau46**
   - **Name:** Rahul Admin

4. After signup, update the user role to OWNER in the database:
   ```bash
   # Using Prisma Studio
   npx prisma studio
   # Or using SQL
   psql -U postgres -d qrmenu
   UPDATE users SET role = 'OWNER' WHERE email = 'rahul@botpe.com';
   ```

### Option B: Using API Script

After the app is running, you can use the create-admin script:

```bash
# In another terminal
curl -X POST http://localhost:3000/api/auth/sign-up \
  -H "Content-Type: application/json" \
  -d '{
    "email": "rahul@botpe.com",
    "password": "Ramborau46**",
    "name": "Rahul Admin"
  }'
```

Then update the role:
```bash
npx prisma studio
# Find the user and change role to OWNER
```

## Step 5: Seed Sample Data

After the admin user is created:

```bash
npm run db:seed
```

This will create:
- Sample restaurant
- Sample categories
- Sample menu items
- Sample QR code

## Step 6: Run the App

```bash
npm run dev
```

Visit: http://localhost:3000

Login with:
- **Email:** rahul@botpe.com
- **Password:** Ramborau46**

## Troubleshooting

### Database Connection Error

```bash
# Check if PostgreSQL is running
pg_isready

# Check database exists
psql -U postgres -l | grep qrmenu

# Test connection
psql -U postgres -d qrmenu
```

### User Already Exists

If you get "user already exists" error:

1. Check the database:
   ```bash
   npx prisma studio
   ```

2. Or delete and recreate:
   ```sql
   DELETE FROM users WHERE email = 'rahul@botpe.com';
   ```

### Environment Variables Not Loading

Make sure:
- `.env` file is in the root directory
- File name is exactly `.env` (not `.env.local` unless you configure it)
- Restart the dev server after changing `.env`

## Quick Start (If Database is Already Set Up)

```bash
# 1. Set environment variables
export DATABASE_URL="postgresql://user:password@localhost:5432/qrmenu?schema=public"
export APP_URL="http://localhost:3000"
export BETTER_AUTH_SECRET="$(openssl rand -hex 32)"

# 2. Push schema
npx prisma db push

# 3. Generate client
npx prisma generate

# 4. Start app
npm run dev

# 5. In browser, go to http://localhost:3000/auth/signup
#    Sign up with: rahul@botpe.com / Ramborau46**

# 6. In another terminal, update user role
npx prisma studio
# Change user role to OWNER

# 7. Seed sample data
npm run db:seed
```

## Production Setup

For production, make sure to:
- Use environment variables from your hosting provider
- Set `BETTER_AUTH_SECRET` to a secure random string
- Set `APP_URL` to your production domain
- Use a managed PostgreSQL database

