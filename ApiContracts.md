---

## Complete API Contract — AdMax Frontend

All endpoints are prefixed with `NEXT_PUBLIC_API_URL` (default `http://localhost:4000/api`).  
Auth: `Authorization: Bearer <jwt_token>` header on all requests (injected by api.ts).

---

### 1. AUTH

#### `POST /auth/login`
**Used in:** useAuth.ts → login/page.tsx

**Request body:**
```json
{
  "email": "string",       // required
  "password": "string"     // required
}
```

**Response:**
```json
{
  "user": {
    "id": "string (uuid)",
    "email": "string",
    "phone": "string | null",
    "name": "string",
    "roles": ["USER"] | ["USER","ADMIN"],   // array of Role enum
    "isActive": true,
    "isVerified": true,
    "createdAt": "ISO 8601 string"
  },
  "token": "string (JWT)"
}
```

---

#### `POST /auth/signup`
**Used in:** useAuth.ts → signup/page.tsx

**Request body:**
```json
{
  "email": "string",       // required
  "name": "string",        // required
  "password": "string",    // required, min 8 chars
  "phone": "string | undefined"  // optional
}
```

**Response:** Same as `/auth/login` (`AuthResponse`)

---

#### `GET /auth/me`
**Used in:** useAuth.ts → called on app load when token exists

**Request:** No body. Auth header required.

**Response:**
```json
{
  "id": "string (uuid)",
  "email": "string",
  "phone": "string | null",
  "name": "string",
  "roles": ["USER"],
  "isActive": true,
  "isVerified": true,
  "createdAt": "ISO 8601 string"
}
```
> Note: Returns flat `User` object, NOT wrapped in `{ user, token }`.

---

### 2. LISTINGS

#### `GET /listings`
**Used in:** useListings.ts → marketplace/page.tsx

**Query params (all optional):**
| Param | Type | Notes |
|-------|------|-------|
| `search` | string | Free-text search |
| `type` | `HOARDING\|KIOSK\|GANTRY\|TRANSIT` | Enum filter |
| `minPrice` | number | |
| `maxPrice` | number | |
| `landmarks` | string | Comma-separated list |
| `latitude` | number | For geo filtering |
| `longitude` | number | For geo filtering |
| `radius` | number | Km radius from lat/lng |
| `page` | number | 1-indexed pagination |
| `limit` | number | Items per page |

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "ownerId": "uuid",
      "owner": { "id", "name", ... } | undefined,
      "title": "string",
      "description": "string",
      "type": "HOARDING",           // ListingType enum
      "price": 50000,               // number
      "landmarks": ["string"],      // string array
      "latitude": 19.076,           // number
      "longitude": 72.877,          // number
      "images": [
        { "id": "uuid", "url": "https://...", "listingId": "uuid" }
      ],
      "status": "LIVE",             // ListingStatus enum
      "isFeatured": false,          // boolean
      "bookings": [],               // optional, can omit on list view
      "createdAt": "ISO 8601",
      "updatedAt": "ISO 8601"
    }
  ],
  "total": 42,    // number — total matching results
  "page": 1,      // number — current page
  "limit": 20     // number — page size
}
```

---

#### `GET /listings/mine`
**Used in:** useListings.ts → dashboard/MyListingsTab.tsx

**Request:** Auth header only. Returns listings owned by the authenticated user.

**Response:** `Listing[]` (flat array, NOT paginated)

**Fields consumed in UI:** `id`, `title`, `type`, `price`, `status`, `images`

---

#### `GET /listings/:id`
**Used in:** useListings.ts → [listings/[id]/page.tsx](apps/frontend/src/app/listings/[id]/page.tsx), [listings/[id]/edit/page.tsx](apps/frontend/src/app/listings/[id]/edit/page.tsx)

**Response:** Single `Listing` object **with relations loaded:**
```json
{
  "id": "uuid",
  "ownerId": "uuid",
  "owner": { "id": "uuid", "name": "string", ... },  // REQUIRED for detail view
  "title": "string",
  "description": "string",
  "type": "HOARDING",
  "price": 50000,
  "landmarks": ["Near Metro", "Highway"],
  "latitude": 19.076,
  "longitude": 72.877,
  "images": [
    { "id": "uuid", "url": "https://s3...", "listingId": "uuid" }
  ],
  "status": "LIVE",
  "isFeatured": true,
  "bookings": [                    // REQUIRED — used for availability calendar
    {
      "id": "uuid",
      "listingId": "uuid",
      "userId": "uuid",
      "startDate": "ISO 8601",
      "endDate": "ISO 8601",
      "createdAt": "ISO 8601"
    }
  ],
  "createdAt": "ISO 8601",
  "updatedAt": "ISO 8601"
}
```

---

#### `POST /listings`
**Used in:** useListings.ts → listings/new/page.tsx

**Request body:**
```json
{
  "title": "string",              // required
  "description": "string",        // required
  "type": "HOARDING",             // required, ListingType enum
  "price": 50000,                 // required, number
  "landmarks": ["string"],        // required, string array
  "latitude": 19.076,             // required, number
  "longitude": 72.877,            // required, number
  "availableFrom": "ISO 8601 | undefined",   // optional
  "availableTo": "ISO 8601 | undefined"      // optional
}
```

**Response:** Created `Listing` object. Must include `id` (used to upload images afterward).

---

#### `PUT /listings/:id`
**Used in:** useListings.ts → [listings/[id]/edit/page.tsx](apps/frontend/src/app/listings/[id]/edit/page.tsx)

**Request body:** `Partial<CreateListingRequest>` — any subset of the create fields.

**Response:** Updated `Listing` object.

---

#### `DELETE /listings/:id`
**Used in:** useListings.ts → dashboard/MyListingsTab.tsx

**Request:** No body. Auth header.

**Response:** `204 No Content` or `{}` (frontend accepts both — see api.ts).

---

#### `POST /listings/:id/images`
**Used in:** useListings.ts + raw fetch in page.tsx, page.tsx

**Request:** `multipart/form-data` with field name `images` (multiple files).
> **Content-Type header is NOT set** — browser sets it with boundary automatically.

**Response:**
```json
[
  { "id": "uuid", "url": "https://s3-url...", "listingId": "uuid" }
]
```

---

#### `POST /listings/:id/submit`
**Used in:** useListings.ts

**Request:** No body. Transitions listing status from `DRAFT` → `PENDING`.

**Response:** Any (not consumed by frontend). 200 OK is sufficient.

---

### 3. OFFERS

#### `GET /offers`
**Used in:** useOffers.ts → dashboard/MyDealsTab.tsx

**Request:** Auth header. Returns offers where user is sender OR receiver.

**Response:** `Offer[]` **with relations:**
```json
[
  {
    "id": "uuid",
    "senderId": "uuid",
    "receiverId": "uuid",
    "sender": { "id": "uuid", "name": "string", ... },    // REQUIRED
    "receiver": { "id": "uuid", "name": "string", ... },  // REQUIRED
    "listings": [                                          // REQUIRED — array of Listing
      { "id": "uuid", "title": "string", ... }
    ],
    "totalPrice": 150000,
    "negotiatedPrice": 120000,   // number | null
    "status": "PENDING",         // OfferStatus enum
    "conversationId": "uuid | null",   // REQUIRED — used for chat link
    "createdAt": "ISO 8601",
    "updatedAt": "ISO 8601"
  }
]
```

**Fields consumed in UI:** `id`, `senderId`, `receiverId`, `sender.name`, `receiver.name`, `listings[].id`, `listings[].title`, `totalPrice`, `negotiatedPrice`, `status`, `conversationId`

---

#### `GET /offers/:id`
**Used in:** useOffers.ts

**Response:** Single `Offer` with same relations as above.

---

#### `POST /offers`
**Used in:** useOffers.ts → deals/page.tsx

**Request body:**
```json
{
  "listingIds": ["uuid", "uuid"],     // required, string array
  "totalPrice": 150000,               // required, number
  "negotiatedPrice": 120000,          // optional, number
  "receiverId": "uuid"                // required, string
}
```

**Response:** Created `Offer` object.

---

#### `POST /offers/:id/accept`
**Used in:** useOffers.ts → dashboard/MyDealsTab.tsx

**Request:** No body.
**Response:** Any 200 OK.

---

#### `POST /offers/:id/reject`
**Used in:** useOffers.ts → dashboard/MyDealsTab.tsx

**Request:** No body.
**Response:** Any 200 OK.

---

#### `POST /offers/:id/counter`
**Used in:** useOffers.ts

**Request body:**
```json
{
  "negotiatedPrice": 130000    // required, number
}
```
**Response:** Any 200 OK.

---

### 4. CONVERSATIONS / CHAT

#### `GET /conversations`
**Used in:** useChat.ts → chat/page.tsx

**Response:** `Conversation[]` with relations:
```json
[
  {
    "id": "uuid",
    "offerId": "uuid | null",
    "offer": {                           // optional, but consumed
      "listings": [{ "id", "title" }]   // offer.listings.length displayed
    },
    "participants": [                    // REQUIRED
      { "id": "uuid", "name": "string", ... }
    ],
    "messages": [                        // REQUIRED — last message shown in list
      {
        "id": "uuid",
        "conversationId": "uuid",
        "senderId": "uuid",
        "content": "string",
        "createdAt": "ISO 8601"
      }
    ],
    "createdAt": "ISO 8601"
  }
]
```

**Fields consumed:** `id`, `participants[].id`, `participants[].name`, `offer.listings.length`, `messages[-1].content`

---

#### `GET /conversations/:id`
**Used in:** useChat.ts → chat/page.tsx (polled every 5s)

**Response:** Single `Conversation` with full messages:
```json
{
  "id": "uuid",
  "offerId": "uuid | null",
  "participants": [{ "id": "uuid", "name": "string" }],
  "messages": [
    {
      "id": "uuid",
      "conversationId": "uuid",
      "senderId": "uuid",            // compared to user.id for left/right alignment
      "content": "string",
      "createdAt": "ISO 8601"        // formatted as HH:mm
    }
  ],
  "createdAt": "ISO 8601"
}
```

---

#### `POST /conversations/:id/messages`
**Used in:** useChat.ts → chat/page.tsx

**Request body:**
```json
{
  "content": "string"    // required, trimmed before send
}
```

**Response:**
```json
{
  "id": "uuid",
  "conversationId": "uuid",
  "senderId": "uuid",
  "content": "string",
  "createdAt": "ISO 8601"
}
```

---

### 5. ADMIN

#### `GET /admin/users/pending`
**Used in:** useAdmin.ts → admin/AdminUsersPanel.tsx

**Response:** `User[]` — users where `isVerified = false`

**Fields consumed:** `id`, `name`, `email`, `phone`, `createdAt`

---

#### `POST /admin/users/:id/approve`
**Used in:** useAdmin.ts → admin/AdminUsersPanel.tsx

**Request:** No body.
**Response:** Any 200 OK.

---

#### `POST /admin/users/:id/reject`
**Used in:** useAdmin.ts → admin/AdminUsersPanel.tsx

**Request body:**
```json
{
  "reason": "string | undefined"   // optional
}
```
**Response:** Any 200 OK.

---

#### `GET /admin/listings/pending`
**Used in:** useAdmin.ts → admin/AdminListingsPanel.tsx

**Response:** `Listing[]` — listings where `status = 'PENDING'`

**Fields consumed:** `id`, `title`, `type`, `price`, `owner.name`, `ownerId`

---

#### `POST /admin/listings/:id/approve`
**Used in:** useAdmin.ts → admin/AdminListingsPanel.tsx

**Request:** No body. Should set `status` → `APPROVED` (or `LIVE`).
**Response:** Any 200 OK.

---

#### `POST /admin/listings/:id/reject`
**Used in:** useAdmin.ts → admin/AdminListingsPanel.tsx

**Request body:**
```json
{
  "reason": "string | undefined"
}
```
**Response:** Any 200 OK.

---

### 6. BOOKINGS & DASHBOARD

#### `GET /bookings/mine`
**Used in:** useAdmin.ts → dashboard/MyBookingsTab.tsx

**Response:** `Booking[]` with listing relation:
```json
[
  {
    "id": "uuid",
    "listingId": "uuid",
    "userId": "uuid",
    "startDate": "ISO 8601",
    "endDate": "ISO 8601",
    "listing": { "title": "string" },   // REQUIRED — title rendered in UI
    "createdAt": "ISO 8601"
  }
]
```

---

#### `GET /dashboard/stats`
**Used in:** useAdmin.ts → dashboard/AnalyticsTab.tsx

**Response:**
```json
{
  "totalListings": 12,       // number
  "activeListings": 8,       // number (status = LIVE)
  "totalBookings": 5,        // number
  "totalDeals": 3,           // number
  "estimatedRevenue": 450000 // number (₹)
}
```

All 5 fields are **required** — used in stat cards and computed ratios.

---

### Inconsistencies & Notes

| # | Issue | Location |
|---|-------|----------|
| 1 | **Duplicate image upload** — raw `fetch()` in `new/page.tsx` and `edit/page.tsx` bypasses the `api.upload` wrapper. Should use `useUploadListingImages` hook instead. | page.tsx, page.tsx |
| 2 | **`useMyBookings` and `useDashboardStats` are in useAdmin.ts** — these are user-scoped, not admin-scoped. Should live in a separate hooks file or be renamed. | useAdmin.ts |
| 3 | **`GET /offers` must filter by auth user** — the frontend splits the response into `sent` (where `senderId === user.id`) and `received` (where `receiverId === user.id`). Backend should return both. | MyDealsTab.tsx |
| 4 | **`useSubmitListing` is defined but never called** from any page/component. No UI triggers listing submission. | useListings.ts |
| 5 | **`ListingForm` component is imported but never created** — new/page.tsx and edit/page.tsx import `@/components/forms/ListingForm` which doesn't exist yet. | Missing file |
| 6 | **`Offer.conversationId`** is typed as optional `string` — backend should auto-create a `Conversation` when an offer is created, and return the `conversationId` on the Offer. | types.ts |
| 7 | **No `User.name` field in `ChatMessage`** — chat renders `senderId` for alignment but never shows sender name. If group chats are ever needed, `sender` relation should be included in messages. | page.tsx |
| 8 | **Admin listing detail needs `owner` relation** — `AdminListingsPanel` renders `listing.owner?.name`. Backend must include `owner` when returning pending listings. | AdminListingsPanel.tsx |