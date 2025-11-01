# Database Setup Guide

## Prisma Setup

This project uses Prisma ORM with PostgreSQL.

### Initial Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   - Copy `.env.example` to `.env.local`
   - Update `DATABASE_URL` with your PostgreSQL connection string

3. **Generate Prisma Client:**
   ```bash
   npm run db:generate
   ```

### Database Migrations

**For Development (quick setup):**
```bash
npm run db:push
```

**For Production (versioned migrations):**
```bash
npm run db:migrate
```

This creates a migration file in `prisma/migrations/`

### Seed Database

Run the seed script to populate the database with sample data:
```bash
npm run db:seed
```

### Prisma Studio

Launch Prisma Studio to view and edit database records:
```bash
npm run db:studio
```

This opens a GUI at `http://localhost:5555`

### Database Schema

The schema includes:
- **User** - Authentication and user management
- **Restaurant** - Restaurant information and branding
- **Category** - Top-level menu categories
- **SubCategory** - Second-level menu groupings
- **MenuItem** - Individual menu items with details
- **Table** - QR code table assignments

### Connection Utility

Use the Prisma client from `lib/prisma.ts`:
```typescript
import { prisma } from "@/lib/prisma";

const restaurants = await prisma.restaurant.findMany();
```

### Production Setup

For Vercel Postgres:
1. Create a Postgres database in Vercel dashboard
2. Add the connection string to environment variables
3. Run migrations before deployment:
   ```bash
   npm run db:migrate
   ```

