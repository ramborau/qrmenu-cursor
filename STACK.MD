# Tech Stack

## Overview

QR Menu Manager Pro is built using modern web technologies with a focus on performance, scalability, and developer experience.

---

## Frontend

### Core Framework

-   **Next.js** (App Router)
    -   Server Components & Client Components
    -   Server Actions
    -   Edge Functions
    -   API Routes
    -   Image Optimization
    -   Incremental Static Regeneration (ISR)

### UI Library

-   **React**
    -   Hooks and component patterns
    -   State management
    -   Rendering optimization

### Component Library

-   **ShadCN/UI**
    -   Accessible component primitives
    -   Customizable design system
    -   Built on Radix UI

### Icons & Assets

-   **React Icons** - Comprehensive icon library
-   **Unsplash API** - Stock image integration

### Styling

-   Tailwind CSS (via ShadCN/UI)
-   CSS Modules (as needed)

---

## Backend

### Runtime

-   **Node.js** - Server runtime
-   **Next.js API Routes** - RESTful API endpoints
-   **Server Actions** - Form handling and mutations
-   **Edge Functions** - Globally distributed logic

### Authentication

-   **Better Auth**
    -   Email/password authentication
    -   Session management
    -   OAuth providers (if needed)
    -   Role-based access control (RBAC)
    -   Password reset flows

### Validation & Security

-   **Zod** - Schema validation
-   Input sanitization
-   Rate limiting middleware
-   CORS configuration
-   Security headers

---

## Database

### ORM

-   **Prisma**
    -   Type-safe database client
    -   Schema management
    -   Migrations
    -   Query builder

### Database

-   **PostgreSQL**
    -   Primary database
    -   Read replicas (for scaling)
    -   Connection pooling

### Database Tools

-   Prisma Migrate - Migration management
-   Prisma Studio - Database GUI
-   Seeding scripts - Test data generation

---

## Testing

### Unit Testing

-   **Vitest** or **Jest** - Test runner
-   React Testing Library - Component testing

### End-to-End Testing

-   **Playwright** or **Cypress** - E2E testing framework

### API Testing

-   Supertest or similar - API endpoint testing

### Load Testing

-   k6, Artillery, or similar - Performance testing

---

## Development Tools

### Language

-   **TypeScript** - Type safety and better DX

### Version Control

-   **Git** - Source control

### Package Manager

-   npm, yarn, or pnpm (to be determined)

### Code Quality

-   ESLint - Linting
-   Prettier - Code formatting
-   TypeScript compiler - Type checking

---

## External Services & Integrations

### Image Services

-   **Unsplash API** - Stock photos for menu items
-   Image optimization service
-   CDN for image delivery

### QR Code Generation

-   QR code generation library
-   SVG and PNG export support
-   Custom styling capabilities

### File Processing

-   CSV parser - Import menus from CSV
-   JSON validator - Import menus from JSON
-   Excel file reader - Import from Excel
-   Markdown parser - Import from Markdown
-   HTML sanitizer - Security for HTML content

### Analytics (Optional)

-   Google Analytics or similar
-   Custom event tracking
-   QR code scan tracking
-   Menu item view tracking

---

## Infrastructure & Deployment

### Hosting

-   **Vercel** - Primary hosting platform
    -   Next.js App Router deployment
    -   Edge Function support
    -   Automatic HTTPS
    -   CDN integration

### Database Hosting

-   **Vercel Postgres** or external PostgreSQL service

### Caching & CDN

-   Vercel Edge Cache
-   Next.js Image Optimization
-   Static asset CDN

### Environment Management

-   Development environment
-   Staging environment
-   Production environment

---

## CI/CD

### Continuous Integration

-   Automated test runs on PRs
-   Type checking
-   Linting and formatting checks
-   Security scanning

### Continuous Deployment

-   Automated deployments to staging
-   Production deployment workflow
-   Rollback capabilities

### Quality Gates

-   Test coverage thresholds
-   Build success requirements
-   Security checks

---

## Monitoring & Observability

### Logging

-   Structured JSON logs
-   Application logging
-   Error logging

### Monitoring

-   Vercel Analytics
-   Custom monitoring dashboards
-   Performance metrics

### Error Tracking

-   Sentry or similar - Error tracking and reporting

### APM

-   Application Performance Monitoring
-   Response time tracking
-   Database query monitoring

### Alerting

-   Critical error alerts
-   Performance degradation alerts
-   System health notifications

---

## Browser & Device Support

### Supported Browsers

-   Chrome/Edge (last 2 versions)
-   Firefox (last 2 versions)
-   Safari (last 2 versions)
-   Mobile Safari (iOS 12+)
-   Chrome Mobile (Android 8+)

### Device Support

-   Smartphones (320px - 768px)
-   Tablets (768px - 1024px)
-   Desktops (1024px+)
-   QR code scanners (all major camera apps)

### Accessibility

-   WCAG 2.1 Level AA compliance
-   Screen reader compatibility
-   Keyboard navigation
-   Focus indicators
-   Color contrast compliance

---

## Security

### Authentication & Authorization

-   Secure session management
-   Password complexity requirements
-   Account lockout after failed attempts
-   Role-based access control

### Data Protection

-   SQL injection prevention (via Prisma)
-   XSS (Cross-Site Scripting) protection
-   CSRF (Cross-Site Request Forgery) tokens
-   Input validation and sanitization
-   File upload validation

### Privacy

-   GDPR compliance
-   Data retention policies
-   User data export functionality
-   Right to be forgotten implementation

---

## Dependencies Reference

### MCP References

All technologies have Model Context Protocol (MCP) documentation available:

-   [Next.js MCP](https://context7.com/vercel/next.js/llms.txt)
-   [React MCP](https://context7.com/reactjs/react.dev)
-   [ShadCN/UI MCP](https://context7.com/shadcn-ui/ui/llms.txt)
-   [Better Auth MCP](https://context7.com/better-auth/better-auth/llms.txt)
-   [Prisma MCP](https://context7.com/prisma/docs/llms.txt)

See `MCP.MD` for complete MCP documentation.

---

## Stack Summary

```
Frontend:     Next.js (App Router) + React + ShadCN/UI + TypeScript
Backend:      Next.js API Routes + Server Actions + Edge Functions
Database:     PostgreSQL + Prisma ORM
Auth:         Better Auth
Testing:      Vitest/Jest + Playwright/Cypress
Deployment:   Vercel + Vercel Postgres
Monitoring:   Vercel Analytics + Sentry
```

---

## Future Considerations

### Potential Additions

-   Redis for caching (if needed)
-   Stripe/PayPal for payment processing
-   Email service provider (SendGrid, Resend, etc.)
-   File storage service (if file uploads are needed)
-   Real-time features (WebSockets, if needed)

### Scaling Strategy

-   Database read replicas
-   CDN optimization
-   Edge function distribution
-   Caching layers (Redis, if needed)
-   Horizontal scaling via Vercel
