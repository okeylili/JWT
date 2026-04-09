# Secure SaaS Authentication Platform

Production-ready full-stack auth and authorization app with JWT rotation, RBAC + permission checks, Redis rate limiting, account lockout, CSRF protection, and audit monitoring.

## Stack
- Backend: Node.js + Express + Prisma + PostgreSQL + Redis
- Auth: JWT access + refresh tokens with refresh rotation and reuse detection
- Frontend: React + Vite + Tailwind CSS
- DevOps: Docker + Docker Compose

## Project Structure
```text
/server
  /src
    /controllers
    /services
    /middlewares
    /routes
    /utils
    /config
    /models
    /logs
/client
  /src
    /pages
    /components
    /hooks
    /services
    /context
```



## Prisma Database Schema (Core)
- `User`: identity, credentials, role, lockout state
- `RefreshToken`: hashed refresh token store with family, rotation, revoke status
- `BlacklistedToken`: revoked access token JTIs
- `AuditLog`: security and admin actions with actor, IP, timestamp

Schema file: `server/prisma/schema.prisma`.

## API Routes
### Auth
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`

### Security
- `GET /api/csrf-token`
- `GET /api/health`

### Admin
- `GET /api/admin/users`
- `PATCH /api/admin/users/:userId/role`
- `PATCH /api/admin/users/:userId/unlock`
- `GET /api/admin/logs`

## Swagger Docs
Swagger UI is exposed at `GET /api/docs`.

## Testing
From `server`:
- `npm test`

Includes sample tests for:
- auth route validation
- protected route authorization
