Audit all config and auth points

Searched for files matching `**/.env*`, 3 matches

Searched for text `process.env` (`**/apps/backend/src/**`), 6 results

Searched for text `process.env` (`**/apps/frontend/src/**`), 4 results

Searched for regex `API_URL|baseUrl|endpoint|fetch\(|axios\(|http[s]?://` (`**/apps/frontend/src/**`), 20 results

Searched for regex `API_URL|baseUrl|endpoint|fetch\(|axios\(|http[s]?://` (`**/apps/backend/src/**`), 3 results

Searched for regex `jwt|JWT|auth|login|token|guard|passport|strategy|Authorization|Bearer` (`**/apps/backend/src/**`), 20 results

Searched for regex `jwt|JWT|auth|login|token|guard|passport|strategy|Authorization|Bearer` (`**/apps/frontend/src/**`), 20 results

Searched for regex `multer|upload|uploads|static|image|file` (`**/apps/backend/src/**`), 20 results

Searched for regex `multer|upload|uploads|static|image|file` (`**/apps/frontend/src/**`), 20 results

Searched for regex `prisma|DATABASE_URL|PrismaClient` (`**/apps/backend/src/**`), 20 results

Searched for regex `user.id|userId|user_id|sub|fromJwt|fromToken` (`**/apps/backend/src/**`), 20 results

Searched for regex `user.id|userId|user_id|sub|fromJwt|fromToken` (`**/apps/frontend/src/**`), 20 results

Searched for regex `cors|CORS` (`**/apps/backend/src/**`), 2 results

Searched for regex `rateLimit|throttle|limit|RateLimiter` (`**/apps/backend/src/**`), 12 results

Searched for regex `secret|SECRET|API_KEY|key|privateKey|publicKey` (`**/apps/backend/src/**`), 7 results

Searched for regex `secret|SECRET|API_KEY|key|privateKey|publicKey` (`**/apps/frontend/src/**`), 20 results

Searched for regex `AuthGuard|auth.guard|jwt-auth.guard|public|@Public|isPublic|AllowAnonymous` (`**/apps/backend/src/**`), 20 results

Searched for regex `AuthGuard|auth.guard|jwt-auth.guard|public|@Public|isPublic|AllowAnonymous` (`**/apps/frontend/src/**`), 5 results

Searched for text `DATABASE_URL` (`**/docker-compose.yml`), no results

Searched for text `DATABASE_URL` (`**/apps/backend/prisma/schema.prisma`), 1 result

Here's the complete configuration & auth audit of the codebase:

---

## Environment Variables Required

| Variable | Where Used | Default |
|---|---|---|
| `DATABASE_URL` | prisma/schema.prisma | None (required) |
| `JWT_SECRET` | auth.module.ts, jwt.strategy.ts | `'admax-dev-jwt-secret-2026'` |
| `PORT` | main.ts | `4000` |
| `FRONTEND_URL` | main.ts (CORS) | `'http://localhost:3000'` |
| `UPLOAD_DIR` | main.ts, listings.controller.ts | `'./uploads'` |
| `UPLOAD_MAX_SIZE` | .env only (not read in code) | — |
| `NEXT_PUBLIC_API_URL` | api.ts, new/page.tsx, edit/page.tsx | `'http://localhost:4000/api'` |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | MapPicker.tsx | `''` (map won't work without it) |

---

## Authentication Flow

**Token storage:** `localStorage.getItem('token')` — read in:
- api.ts — injected as `Authorization: Bearer` on every request
- authStore.ts — persisted on login, cleared on logout
- new/page.tsx — raw `fetch` reads token directly (bypasses api.ts)

**JWT issued with:** `{ sub: user.id }` in auth.service.ts, expires in `'7d'`

---

## Public vs Protected Routes (Backend)

| Route | Auth | Guard |
|---|---|---|
| `POST /auth/login` | Public | None |
| `POST /auth/signup` | Public | None |
| `GET /auth/me` | Login | `JwtAuthGuard` |
| `GET /listings` | Public | None |
| `GET /listings/:id` | Public | None |
| `GET /listings/mine` | Login | `JwtAuthGuard` |
| `POST /listings` | Login | `JwtAuthGuard` |
| `PUT /listings/:id` | Login | `JwtAuthGuard` |
| `DELETE /listings/:id` | Login | `JwtAuthGuard` |
| `POST /listings/:id/images` | Login | `JwtAuthGuard` |
| `POST /listings/:id/submit` | Login | `JwtAuthGuard` |
| `GET /offers`, `POST /offers`, etc. | Login | `JwtAuthGuard` |
| `GET /chat/*`, `POST /chat/*` | Login | `JwtAuthGuard` |
| `GET /bookings/mine` | Login | `JwtAuthGuard` |
| `GET /dashboard/stats` | Login | `JwtAuthGuard` |
| `GET /admin/*`, `POST /admin/*` | Admin | `JwtAuthGuard` + `AdminGuard` |

---

## File Upload / Image Storage

- **Multer config:** listings.controller.ts — `diskStorage` to `$UPLOAD_DIR`, filenames are `randomUUID() + extension`
- **Static serving:** main.ts — `app.useStaticAssets(uploadDir, { prefix: '/uploads/' })`
- **Image URLs stored in DB** as `/uploads/{filename}` — relative paths, served by the backend
- **Frontend uploads** via `FormData` with field name `'images'`, max 10 files per request

---

## Key Configs

- **CORS:** Single origin from `FRONTEND_URL` env var
- **Rate limiting:** 100 requests per 60 seconds (hardcoded in app.module.ts)
- **Validation:** Global `ValidationPipe` with `whitelist: true, transform: true`
- **API prefix:** All backend routes under `/api` (main.ts)
- **Google Maps:** Needs `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in frontend `.env.local` for MapPicker to work