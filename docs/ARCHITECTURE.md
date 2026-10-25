# CarSwipe architecture

This document explains how CarSwipe is put together: the request flow, the data model, the HTTP API, and the decisions behind them. For setup, see the [README](../README.md).

## Request flow

```
Browser
  │
  ├─ src/proxy.ts            Edge check: protected routes redirect signed-out users to /login
  │
  ├─ Server Components       app/(site)/**/page.tsx read data directly through server/services/*
  │
  ├─ Server Actions          app/actions/*: form posts (auth, messages, account, preferences)
  │
  └─ Route handlers          app/api/**/route.ts: JSON for client-side interactions
           │
           ▼
     server/api.ts           route() wrapper: auth → rate limit → Zod parse → service → JSON
           │
           ▼
     server/services/*       business rules and ownership checks; the only code that touches Prisma
           │
           ▼
     server/db.ts            Prisma client (PrismaPg driver adapter) → PostgreSQL
```

**Layering rules**

- `server/**` modules import `server-only`, so they can never be bundled into client code.
- Pages, route handlers and server actions stay thin: they authenticate, validate and call a service.
- Services enforce authorization. Each one takes the acting `userId` and checks ownership itself, so no entry point can skip the check.
- `features/**` holds pure, framework-free logic (filter parsing, listing schema, recommendation scoring). Client and server share it, and it's covered by unit tests.

**Errors.** Services throw `AppError(code, message)` for expected failures (`NOT_FOUND`, `FORBIDDEN`, `INVALID`, `CONFLICT`, `RATE_LIMITED`, `UNAUTHORIZED`). The `route()` wrapper turns these into HTTP statuses, turns `ZodError` into a 400 with the list of issues, and returns a generic 500 for anything else. The 500 is logged without request bodies.

## Data model

```
User ─┬─< Vehicle ─┬─< VehicleImage
      │            ├─< ListingView
      │            ├─< Report
      │            └─< Conversation >─ (buyer) User
      │                    └─< Message
      ├─< Swipe >───────── Vehicle          unique (userId, vehicleId)
      ├─< SavedVehicle >── Vehicle          unique (userId, vehicleId)
      ├─< SellerReview (as seller / as reviewer)   unique (sellerId, reviewerId)
      ├─< Notification
      ├── UserPreferences (1:1)
      └─< Account / Session                 Auth.js adapter tables
```

| Model | Notes |
| --- | --- |
| `User` | `sellerType` is `PRIVATE` or `DEALER` (with `dealerName`). `passwordHash` is null for Google-only accounts |
| `UserPreferences` | Discovery preferences stored as native Postgres arrays (`BodyStyle[]`, `String[]`). Includes notification toggles and `onboardedAt` |
| `Vehicle` | `status` is `DRAFT → ACTIVE ⇄ PENDING → SOLD`, with deletion as a soft `REMOVED`. `isDemo` flags seeded listings. Indexed for the browse sorts |
| `VehicleImage` | Ordered by `position`; `storageKey` is used to delete the file |
| `Swipe` | `LIKE` or `PASS`. Upserted, so a double-submit can't create duplicates |
| `SavedVehicle` | `viaSwipe` marks saves that came from a right swipe, so undoing that swipe also removes the save, while a manual heart is kept |
| `Conversation` / `Message` | One conversation per (vehicle, buyer). `Message.readAt` drives unread counts and read receipts |
| `SellerReview` | Rating 1–5, enforced by a database `CHECK` constraint. Only allowed after the reviewer has a conversation with the seller |
| `ListingView` | One row per detail-page view, de-duplicated per signed-in viewer per hour. Feeds the dashboard chart |

## HTTP API

Every route returns JSON. Errors have the shape `{ "error": string }`, with `issues` added for validation failures. Mutations need a session cookie.

| Method and path | Auth | Purpose |
| --- | :---: | --- |
| `GET /api/swipe/queue?…filters&exclude=&limit=` | optional | Ranked cards for the swipe deck. Guests can pass already-swiped IDs in `exclude` |
| `POST /api/swipe` `{ vehicleId, direction }` | ✓ | Record a swipe. A `LIKE` also saves the car |
| `POST /api/swipe/undo` `{ vehicleId }` | ✓ | Undo the most recent swipe. Returns 409 if it isn't the latest |
| `POST /api/swipe/import` `{ swipes[] }` | ✓ | Import swipes made as a guest, after sign-in |
| `POST`, `DELETE /api/saved/:vehicleId` | ✓ | Save or unsave a car |
| `GET /api/vehicles?ids=&view=compare` | | Look up cars by ID (compare page, guest garage) |
| `POST /api/listings` | ✓ | Create a listing (draft or published) |
| `PUT /api/listings/:id` | ✓ owner | Replace listing fields and photos |
| `PATCH /api/listings/:id` `{ status }` | ✓ owner | Change status. The state machine is in `services/listings.ts` |
| `DELETE /api/listings/:id` | ✓ owner | Soft delete (`REMOVED`) |
| `POST /api/uploads` (multipart `file`) | ✓ | Process and store a photo. Returns `{ url, key }` |
| `GET /api/conversations/:id/messages?after=` | ✓ member | Poll for new messages. Also marks them read and returns `readUpTo` |
| `PUT`, `DELETE /api/sellers/:id/reviews` `{ rating, comment? }` | ✓ eligible | Create, update or delete your review of a seller |
| `GET /api/me/counts` | ✓ | Unread message and notification counts |
| `GET`, `PATCH /api/notifications` | ✓ | List notifications, or mark them read |

Server actions (`app/actions/*`) handle form posts: `loginAction`, `signupAction`, `contactSellerAction`, `sendMessageAction`, `savePreferencesAction`, `updateProfileAction`, `changePasswordAction`, `deleteAccountAction` and a few others.

## Key decisions

**URL-driven filters.** Browse and swipe share one filter shape (`features/vehicles/filters.ts`). It is parsed defensively with Zod, so unknown values are dropped instead of throwing, and it round-trips through the query string. `buildVehicleWhere()` turns it into a Prisma `where`, and distance filtering uses a latitude/longitude bounding box around a known city.

**Optimistic UI with a server mirror.** Saved IDs live in a Zustand store, hydrated from the server in the root layout. Hearts, swipes and the garage update instantly and roll back if the request fails.

**Guest-first swiping.** Signed-out users can swipe straight away. Their swipes persist to `localStorage` and are imported once after sign-in.

**Messaging without websockets.** The open thread polls every 4 seconds while the tab is visible, using `?after=` so only new messages are sent. Optimistic messages are reconciled against polled ones, so a reply can't appear twice. `router.refresh()` keeps the inbox previews current. This can be swapped for SSE later without changing the data model.

**Image pipeline.** `server/storage/images.ts` checks size, decodes with `sharp` (rejecting anything that isn't a real JPEG, PNG, WebP, HEIC or AVIF), auto-rotates, caps the longest edge at 2000px and re-encodes to WebP. Re-encoding removes EXIF. Files are stored at `public/uploads/<userId>/<random>.webp`, and listings only accept URLs matching the owner's folder. To move to S3 or Cloudinary, change this module.

**Route protection.** `src/proxy.ts` (Next 16's replacement for `middleware.ts`) runs Auth.js's edge-safe config (`auth.config.ts`, which has no Prisma or bcrypt imports) to redirect signed-out users away from private routes. Pages and services check the session again, so the proxy is a convenience, not the security boundary.

**Rate limiting.** `server/rate-limit.ts` is a fixed-window in-memory limiter keyed by user or IP. Set `DISABLE_RATE_LIMITS=true` in test environments.

## Design system

Design tokens live in `src/app/globals.css` as CSS variables, with a `.dark` override.

- **Brand:** purple `#7B3FE4` and pink `#D9549A`. The purple-to-pink gradient (`bg-brand-gradient`, Button `variant="brand"`) is reserved for the logo and the main action on each screen.
- **Surfaces:** neutral backgrounds, with off-white `#F3F2FB` for muted fills and `#1C1C1F` for dark ink.
- **Pink** marks notification badges and the saved heart. Purple is the primary and focus colour.
- **Radius scale:** 8, 12, 16 and 24px. Cards use `shadow-card`, and floating elements use `shadow-float`.
