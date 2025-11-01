# QR Menu Manager Pro

Restaurant Menu Manager with QR Code Creator

## Project Overview

QR Menu Manager Pro is a comprehensive web-based platform that enables restaurant owners to create, manage, and distribute digital menus through QR codes.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** ShadCN/UI
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** Better Auth
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn or pnpm

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Type check
npm run type-check
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
QR-Menu/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Admin dashboard pages
│   ├── menu/              # Menu viewing pages
│   └── qr-codes/          # QR code management
├── components/            # React components
├── lib/                   # Utility functions
├── prisma/                # Database schema and migrations
└── public/                # Static assets
```

## Documentation

- [PRD](./PRD.MD) - Product Requirements Document
- [STACK](./STACK.MD) - Technology Stack
- [AGENTS](./AGENTS.MD) - Agent Responsibilities
- [PROJECT-PLAN](./PROJECT-PLAN.md) - Detailed Project Plan
- [Live Dashboard](./live.html) - Progress Tracking

## Repository

https://github.com/ramborau/qrmenu-cursor.git

## License

Private - All Rights Reserved

