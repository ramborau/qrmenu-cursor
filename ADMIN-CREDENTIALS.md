# Admin Credentials - QR Menu Manager Pro

## Admin User Credentials

**Email:** `rahul@botpe.com`
**Password:** `Ramborau46**`
**Name:** Rahul Admin
**Role:** OWNER

---

## How to Create Admin User

### Option 1: Through Signup Page (Recommended)

1. Make sure the app is running: `npm run dev`
2. Go to: http://localhost:3006/auth/signup
3. Sign up with the credentials above:
   - Email: `rahul@botpe.com`
   - Password: `Ramborau46**`
   - Name: Rahul Admin
4. After signup, update the user role to OWNER:
   ```bash
   # Using Prisma Studio
   npx prisma studio
   # Find the user and change role to OWNER

   # OR using SQL
   psql -U postgres -d qrmenu
   UPDATE users SET role = 'OWNER' WHERE email = 'rahul@botpe.com';
   ```

### Option 2: Direct Database Insert (Advanced)

If you have direct database access, you can insert the user manually (requires Better Auth password hashing).

---

## Database Setup

Before creating the admin user, make sure:

1. **PostgreSQL is running**
   ```bash
   # Check if PostgreSQL is running
   pg_isready
   ```

2. **Database exists**
   ```bash
   # Create database if it doesn't exist
   createdb qrmenu
   # OR
   psql -U postgres
   CREATE DATABASE qrmenu;
   ```

3. **DATABASE_URL is configured**
   ```bash
   # In .env.local file
   DATABASE_URL="postgresql://username:password@localhost:5432/qrmenu?schema=public"
   ```

4. **Push schema to database**
   ```bash
   npx prisma db push
   ```

5. **Generate Prisma client**
   ```bash
   npx prisma generate
   ```

---

## Troubleshooting Database Connection

### Error: "User was denied access on the database"

This means:
- DATABASE_URL is incorrect, OR
- Database doesn't exist, OR
- User doesn't have permissions, OR
- PostgreSQL is not running

**Solution:**

1. **Check PostgreSQL is running:**
   ```bash
   pg_isready
   ```

2. **Check database exists:**
   ```bash
   psql -U postgres -l | grep qrmenu
   ```

3. **Create database if needed:**
   ```bash
   createdb qrmenu -U postgres
   ```

4. **Test connection:**
   ```bash
   psql -U postgres -d qrmenu
   ```

5. **Update DATABASE_URL in .env.local:**
   ```bash
   DATABASE_URL="postgresql://postgres:your_password@localhost:5432/qrmenu?schema=public"
   ```

---

## After Admin User Creation

1. **Login:**
   - Go to: http://localhost:3006/auth/login
   - Email: `rahul@botpe.com`
   - Password: `Ramborau46**`

2. **Seed sample data (optional):**
   ```bash
   npm run db:seed
   ```

---

## Security Notes

- ⚠️ **Change the password** after first login for production
- ⚠️ **Never commit** `.env.local` to git
- ⚠️ **Use strong passwords** in production
- ⚠️ **Enable email verification** in production

---

**Last Updated:** November 2024

