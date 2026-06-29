# CartVerse — Project Context for Claude Code

> This file is the persistent context for the project. Read it at the start of every session.
> If a request conflicts with the rules here, point that out before acting.

## What this is
A mini e-commerce platform: a customer **storefront** and an **admin panel** sharing one backend API.
Guiding principle: **working over polished, coherent over complete.** Prefer a smaller scope that
works end-to-end over a large scope that is half-wired.

## Stack (do not change without asking)
- Backend: NestJS (TypeScript)
- Frontend: React + Vite (TypeScript)
- Database: MongoDB via Mongoose
- Auth: JWT (access token), bcrypt for password hashing
- Charts: Recharts (admin dashboard)
- Validation: class-validator + class-transformer (server), zod or RHF (client)

## Repository layout
```
/backend     NestJS app
  /src
    /auth        login, signup, JWT strategy, guards
    /users       user schema + service
    /products    product schema, CRUD, catalog queries
    /cart        per-user persistent cart
    /orders      checkout, order lifecycle, history
    /payments    mock / Stripe-test payment
    /recommendations
    /common      DTOs, guards, interceptors, filters
  /test          e2e + unit tests
  seed.ts        seed script (products, 1 admin, 1 customer)
/frontend    React app
  /src
    /api         API client
    /features    storefront + admin feature folders
    /components  shared UI
    /lib         auth context, utils
/docs        data-model.md, api-contract.md
CLAUDE.md
NOTES.md
README.md
```

## Data model (authoritative — reference this, do not improvise schemas)
- **User**: { _id, email (unique), passwordHash, name, role: "customer" | "admin", createdAt }
- **Product**: { _id, name, description, price (number, in cents), imageUrl, category, stock (int >= 0), createdAt }
- **Cart**: { _id, userId (unique), items: [{ productId, quantity }], updatedAt }
  - One cart per user. Persists across sessions.
- **Order**: { _id, userId, items: [{ productId, name, priceAtOrder (cents), quantity }],
  subtotal, total, status: "pending"|"processing"|"shipped"|"delivered"|"cancelled",
  paymentRef, createdAt }
  - **Order line items snapshot name + price at order time.** Never recompute order totals
    from the live Product price.

## Hard rules (apply to every change)
1. **Validate on both client and server.** Never trust the client. Server validation is mandatory
   even when the client validates.
2. **Money is stored and computed in integer cents.** No floating-point currency math.
3. **Stock integrity:** reject any order line where quantity > current stock. Decrement stock
   atomically when an order is created. Never let stock go negative.
4. **Order totals are computed server-side** from snapshotted prices, never from client-sent totals.
5. **Authorization:** every admin route is guarded so customers cannot reach it. A customer may only
   read/modify their own cart and orders. Verify the JWT `role` on admin routes, not just presence.
6. **No secrets in the repo.** Use `.env`, commit a `.env.example` only.
7. **No raw stack traces to clients.** Use a global exception filter; return meaningful messages
   and correct HTTP status codes.
8. **Passwords are bcrypt-hashed**, never stored or logged in plain text.

## Workflow rules
- For any non-trivial task, **propose a short plan and wait for my go-ahead** before editing files.
- Keep changes scoped to the task. If you need to touch unrelated code, ask first.
- After implementing, tell me exactly what to run to verify it, and list the edge cases you handled.
- Conventional commits: `feat:`, `fix:`, `test:`, `docs:`, `chore:`. One logical unit per commit.
  I will do the commits — surface a suggested message.

## How to run
- Backend: `cd backend && npm run start:dev` (port 3000)
- Frontend: `cd frontend && npm run dev` (port 5173)
- Seed: `cd backend && npm run seed`
- Tests: `cd backend && npm test`
