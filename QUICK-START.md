# Quick Start Guide

## 1. Configure Database

Create a `.env` file with your DATABASE_URL:

```bash
DATABASE_URL="postgresql://username:password@localhost:5432/qrmenu?schema=public"
APP_URL="http://localhost:3000"
BETTER_AUTH_SECRET="your-secret-here"
BETTER_AUTH_URL="http://localhost:3000"
```

Generate secret:
```bash
openssl rand -hex 32
```

## 2. Setup Database

```bash
# Push schema
npx prisma db push

# Generate client
npx prisma generate
```

## 3. Start App

```bash
npm run dev
```

## 4. Create Admin User

Go to: http://localhost:3000/auth/signup

Sign up with:
- Email: **rahul@botpe.com**
- Password: **Ramborau46**
- Name: Rahul Admin

## 5. Set User as Owner

After signup, in another terminal:

```bash
npx prisma studio
```

Find the user (rahul@botpe.com) and change `role` to `OWNER`.

Or use SQL:
```bash
psql -U postgres -d qrmenu
UPDATE users SET role = 'OWNER' WHERE email = 'rahul@botpe.com';
```

## 6. Seed Sample Data

```bash
npm run db:seed
```

## 7. Login

Go to: http://localhost:3000/auth/login

Login with:
- Email: **rahul@botpe.com**
- Password: **Ramborau46**

Done! 🎉

