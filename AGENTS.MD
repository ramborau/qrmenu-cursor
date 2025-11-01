# Agents & Responsibilities

## 1) Frontend Agent

**Responsible for:**

-   Building UI using Next.js (App Router) & React
-   Implementing ShadCN/UI components
-   Consuming backend APIs securely
-   State management, caching, performance optimization
-   Client-side validation & UX enhancements
-   Responsive layouts, accessibility (a11y)
-   Integrating React Icons & Unsplash image feeds

**Outputs:**

-   Reusable components
-   Layout structures
-   UI flows & interactions

## 2) Backend Agent

**Responsible for:**

-   Creating API routes in Next.js & Node.js runtime
-   Authentication flows using Better Auth
-   Server Actions & Edge Function optimization
-   Data validation & input sanitization
-   Rate limiting & security middleware
-   Integrating external services (Unsplash, payment, etc.)
-   Business logic orchestration

**Outputs:**

-   REST/GraphQL endpoints
-   Auth flows
-   Service integrations

## 3) Database Agent

**Responsible for:**

-   Designing schema & relations using Prisma
-   Prisma Migrate workflows
-   Query optimization & indexing strategy
-   Seeding environments
-   Data modeling for multi-tenant/role-based systems
-   Backup & recovery planning
-   Complying with security best practices

**Outputs:**

-   DB schema
-   Migration scripts
-   Data models

## 4) Testing Agent

**Responsible for:**

-   Unit tests for components, hooks, business logic
-   Backend API endpoint tests
-   Integration tests (auth, DB, UI flows)
-   E2E tests (Playwright/Cypress)
-   Load & stress testing for scalability
-   Regression testing before deployments
-   Automation workflows (CI/CD triggers)

**Outputs:**

-   Test suites
-   Coverage reports
-   Quality gates

## 5) Architect Agent

**Responsible for:**

-   Choosing folder structure & monorepo strategy
-   Defining microservice boundaries if needed
-   Performance optimization strategy (ISR, caching, CDN)
-   Security posture (OAuth tokens, secrets, rate limits)
-   Database scaling plan (read replicas, partitioning)
-   Observability (logs, monitoring, tracing)
-   Deployment blueprint for Vercel/Edge/Postgres

**Outputs:**

-   High-level diagrams
-   Infrastructure decisions
-   Tech strategy & governance

---

## Model Context Protocol (MCP) Integration

All agents should reference the appropriate MCPs defined in `MCP.MD` when working with related technologies:

-   **Frontend Agent:** Next.js, React, ShadCN/UI MCPs
-   **Backend Agent:** Next.js, Better Auth MCPs
-   **Database Agent:** Prisma MCP
-   **Testing Agent:** All MCPs (for comprehensive testing context)
-   **Architect Agent:** All MCPs (for architectural decisions)

See `MCP.MD` for complete list of available MCP references.
