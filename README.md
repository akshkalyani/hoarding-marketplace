# AdMax — Outdoor Advertising Marketplace

A full-stack B2B marketplace for outdoor advertising inventory (hoardings, kiosks, gantries, transit media). Media owners list their inventory; agencies browse, build multi-listing deals, negotiate prices, and close bookings — all in one platform.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup — macOS](#setup--macos)
- [Setup — Windows](#setup--windows)
- [Setup — Docker (any OS)](#setup--docker-any-os)
- [Environment Variables](#environment-variables)
- [Running the App](#running-the-app)
- [Seed Data & Test Accounts](#seed-data--test-accounts)
- [API Overview](#api-overview)
- [Key Flows](#key-flows)

---

## Features

- **Listing Management** — Create, edit, upload images, submit for admin approval
- **Admin Panel** — Approve/reject users and listings with audit trail
- **Marketplace** — Browse live listings with search, type, price, and landmark filters
- **Deal Builder** — Add multiple listings to a cart, set a negotiated price, send offer to owner
- **Offers & Negotiation** — Accept, reject, or counter offers; linked to conversations
- **Real-time Chat** — Per-listing and per-offer messaging with listing context in chat
- **Dashboard** — My Listings, Bookings, Deals, Analytics tabs
- **Auth** — JWT-based signup/login, role-based access (USER, ADMIN)
- **Image Upload** — Multer disk storage, served as static assets
- **Rate Limiting** — 100 requests/minute via @nestjs/throttler

---

## Tech Stack

| Layer     | Technology                                                  |
|-----------|-------------------------------------------------------------|
| Frontend  | Next.js 16 (App Router), React 19, Tailwind CSS v4, Zustand, React Query |
| Backend   | NestJS 11, Prisma 6, PostgreSQL 16, Passport JWT, Multer   |
| Auth      | JWT (7-day expiry), bcrypt password hashing                 |
| Tooling   | TypeScript 5, ESLint, ts-node, Docker Compose (optional)    |

---

## Project Structure

```
admax/
├── apps/
│   ├── frontend/               # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/            # Pages (login, signup, marketplace, dashboard, chat, admin, deals, listings)
│   │   │   ├── components/     # UI components (Navbar, ListingCard, ListingGallery, Providers)
│   │   │   │   └── ui/         # Primitives (Button, Input, Select, Badge, Modal, Tabs, StatCard, etc.)
│   │   │   ├── hooks/          # React Query hooks (useAuth, useListings, useOffers, useChat, useAdmin)
│   │   │   ├── stores/         # Zustand stores (authStore, dealStore, chatStore)
│   │   │   └── lib/            # API client, shared types
│   │   ├── .env.local
│   │   └── package.json
│   │
│   └── backend/                # NestJS backend
│       ├── src/
│       │   ├── auth/           # Login, Signup, JWT strategy
│       │   ├── listings/       # CRUD, filters, image upload, submit for approval
│       │   ├── offers/         # Create, accept, reject, counter offers
│       │   ├── chat/           # Conversations, messages, listing-linked chat
│       │   ├── admin/          # Pending users/listings, approve/reject
│       │   ├── bookings/       # User bookings
│       │   ├── dashboard/      # Stats (totalListings, revenue, etc.)
│       │   ├── prisma/         # PrismaService (global)
│       │   └── common/         # Guards, decorators, utils
│       ├── prisma/
│       │   ├── schema.prisma   # 10 models, 5 enums
│       │   └── seed.ts         # Sample data (4 users, 6 listings, bookings, offers)
│       ├── .env
│       └── package.json
│
├── docker-compose.yml          # PostgreSQL 16 (optional)
├── setup.sh                    # One-command setup (macOS)
└── ApiContracts.md             # Full API contract documentation
```

---

## Prerequisites

| Tool        | Version  | Required |
|-------------|----------|----------|
| Node.js     | ≥ 18     | Yes      |
| npm         | ≥ 9      | Yes      |
| PostgreSQL  | ≥ 14     | Yes (local or Docker) |
| Docker      | Any      | Optional (for DB only) |

---

## Setup — macOS

### Option A: Local PostgreSQL (recommended)

```bash
# 1. Install PostgreSQL if not installed
brew install postgresql@16
brew services start postgresql@16

# 2. Clone and enter project
git clone <repo-url> admax && cd admax

# 3. Create database
createdb admax

# 4. Configure backend environment
cp apps/backend/.env.example apps/backend/.env
# Edit .env — set DATABASE_URL to your local user:
# DATABASE_URL="postgresql://<your-mac-username>@localhost:5432/admax?schema=public"

# 5. Install dependencies
cd apps/backend && npm install
cd ../frontend && npm install
cd ../..

# 6. Run migrations and seed
cd apps/backend
npx prisma migrate dev --name init
npx prisma generate
npx ts-node prisma/seed.ts

# 7. Configure frontend environment
cp apps/frontend/.env.local.example apps/frontend/.env.local
# Defaults are fine for local dev
```

### Option B: One-command setup (macOS with local PostgreSQL)

```bash
chmod +x setup.sh && ./setup.sh
```

---

## Setup — Windows

### Option A: Local PostgreSQL

```powershell
# 1. Install PostgreSQL from https://www.postgresql.org/download/windows/
#    During install, note the username (default: postgres) and password you set.

# 2. Open pgAdmin or psql and create the database:
#    CREATE DATABASE admax;

# 3. Clone and enter project
git clone <repo-url> admax
cd admax

# 4. Configure backend environment
copy apps\backend\.env.example apps\backend\.env
# Edit .env with notepad or VS Code:
# DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/admax?schema=public"

# 5. Install dependencies
cd apps\backend
npm install
cd ..\frontend
npm install
cd ..\..

# 6. Run migrations and seed
cd apps\backend
npx prisma migrate dev --name init
npx prisma generate
npx ts-node prisma/seed.ts

# 7. Configure frontend environment
copy apps\frontend\.env.local.example apps\frontend\.env.local
# Defaults are fine for local dev
```

### Option B: Using Docker for PostgreSQL (Windows)

```powershell
# 1. Install Docker Desktop from https://docker.com
# 2. Start PostgreSQL container
docker compose up -d postgres

# 3. Set DATABASE_URL in apps/backend/.env to:
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/admax?schema=public"

# 4. Continue from step 5 above
```

---

## Setup — Docker (any OS)

If you prefer running PostgreSQL via Docker on any platform:

```bash
# Start PostgreSQL
docker compose up -d postgres

# Set this in apps/backend/.env:
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/admax?schema=public"

# Then install deps, migrate, and seed as described above
```

---

## Environment Variables

### Backend (`apps/backend/.env`)

| Variable        | Description                        | Default                        |
|-----------------|------------------------------------|--------------------------------|
| `DATABASE_URL`  | PostgreSQL connection string       | _(required)_                   |
| `JWT_SECRET`    | Secret key for JWT signing         | `admax-dev-jwt-secret-2026`    |
| `JWT_EXPIRES_IN`| Token expiry duration              | `7d`                           |
| `PORT`          | Backend server port                | `4000`                         |
| `UPLOAD_DIR`    | Directory for uploaded images      | `./uploads`                    |
| `FRONTEND_URL`  | Frontend origin for CORS           | `http://localhost:3000`        |

### Frontend (`apps/frontend/.env.local`)

| Variable                        | Description             | Default                        |
|---------------------------------|-------------------------|--------------------------------|
| `NEXT_PUBLIC_API_URL`           | Backend API base URL    | `http://localhost:4000/api`    |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps API key (optional) | _(empty — map won't render)_ |

---

## Running the App

Open **two terminals**:

```bash
# Terminal 1 — Backend
cd apps/backend
npm run dev
# → http://localhost:4000/api

# Terminal 2 — Frontend
cd apps/frontend
npm run dev
# → http://localhost:3000
```

---

## Seed Data & Test Accounts

After running `npx ts-node prisma/seed.ts`, you get:

| Role    | Email              | Password      |
|---------|--------------------|---------------|
| Admin   | admin@admax.com    | password123   |
| Owner   | owner@admax.com    | password123   |
| Agency  | agency@admax.com   | password123   |
| Pending | pending@admax.com  | password123   |

Plus: 6 sample listings (various types/statuses), 3 bookings, 2 offers with conversations and messages.

---

## API Overview

All endpoints are prefixed with `/api`. Full contracts are in [`ApiContracts.md`](./ApiContracts.md).

| Area       | Endpoints                                                          | Auth     |
|------------|--------------------------------------------------------------------|----------|
| **Auth**   | `POST /auth/login`, `POST /auth/signup`, `GET /auth/me`           | Public / JWT |
| **Listings** | `GET /listings`, `GET /listings/:id`, `GET /listings/mine`, `POST /listings`, `PUT /listings/:id`, `DELETE /listings/:id`, `POST /listings/:id/images`, `POST /listings/:id/submit` | Public / JWT |
| **Offers** | `GET /offers`, `GET /offers/:id`, `POST /offers`, `POST /offers/:id/accept`, `POST /offers/:id/reject`, `POST /offers/:id/counter` | JWT |
| **Chat**   | `GET /conversations`, `GET /conversations/:id`, `POST /conversations/:id/messages`, `POST /conversations/listing/:listingId` | JWT |
| **Admin**  | `GET /admin/users/pending`, `GET /admin/listings/pending`, `POST /admin/users/:id/approve`, `POST /admin/users/:id/reject`, `POST /admin/listings/:id/approve`, `POST /admin/listings/:id/reject` | JWT + Admin |
| **Bookings** | `GET /bookings/mine`                                             | JWT |
| **Dashboard** | `GET /dashboard/stats`                                          | JWT |

---

## Key Flows

### Listing Creation → Marketplace
```
User creates listing → status: DRAFT
  → uploads images
  → auto-submits → status: PENDING
Admin approves → status: LIVE
  → visible in marketplace for all users
```

### Deal Flow
```
Agency browses marketplace → adds listings to deal cart
  → sets negotiated price → sends offer to owner
Owner receives offer → accepts / rejects / counters
  → conversation auto-created for negotiation
```

### Chat
```
From listing detail → "Contact Owner" → creates conversation linked to listing
From deal → offer auto-creates conversation → listing info shown in chat header
Both parties see full listing context (image, price, type) in every conversation
```

---

## Useful Commands

```bash
# Prisma
npx prisma studio          # Visual database browser at http://localhost:5555
npx prisma migrate dev     # Create and apply new migration
npx prisma generate        # Regenerate Prisma client after schema changes
npx ts-node prisma/seed.ts # Re-seed the database

# Build
cd apps/backend && npx nest build    # Build backend
cd apps/frontend && npx next build   # Build frontend

# Reset database
npx prisma migrate reset              # Drop all tables and re-migrate + seed
```