# CartVerse

A full-stack mini e-commerce platform — customer storefront and admin panel sharing one backend API.

## Stack

| Layer     | Technology                                    |
|-----------|-----------------------------------------------|
| Backend   | NestJS 11, TypeScript, MongoDB (Mongoose)     |
| Frontend  | React 19, Vite, TypeScript, Tailwind CSS v4   |
| Auth      | JWT (access token, 7-day expiry), bcrypt      |
| Charts    | Recharts                                      |
| Validation| class-validator + class-transformer (server), zod (client) |

---

## Prerequisites

- Node.js 18 or later
- MongoDB (local instance on `localhost:27017` **or** a MongoDB Atlas URI)
- npm

---

## Setup

### 1 — Backend environment

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
MONGO_URI=mongodb://localhost:27017/cartverse
JWT_SECRET=change_me_to_a_long_random_string
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
PORT=3000
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

`STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` are required for checkout. Use your Stripe test-mode keys from the [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys). Leave both as placeholders to keep the app running; the checkout flow will error only when payment is actually submitted.

### 2 — Frontend environment

```bash
cd frontend
cp .env.example .env
```

`frontend/.env` only needs:

```env
VITE_API_URL=http://localhost:3000
```

---

## Running the application

```bash
# Terminal 1 — backend (port 3000)
cd backend
npm install
npm run start:dev

# Terminal 2 — frontend (port 5173)
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Seed the database

Populates 20 products across 4 categories, creates both demo users, and creates 3 sample orders for the customer (enabling recommendations on first run):

```bash
cd backend
npm run seed
```

### Seeded credentials

| Role     | Email                      | Password      |
|----------|----------------------------|---------------|
| Admin    | admin@cartverse.com        | Admin@1234    |
| Customer | customer@cartverse.com     | Customer@1234 |

---

## Running tests

```bash
cd backend
npm test
```

Four unit test suites covering business-critical logic (29 tests total):
- `auth.service.spec.ts` — signup, login, password hashing, ConflictException
- `products.service.spec.ts` — catalog filtering, pagination, atomic stock decrement
- `orders.service.spec.ts` — empty cart rejection, stock guard, server-side totals, cart clear
- `cart.service.spec.ts` — add item (push/increment), stock guard, remove, clear

---

## API docs (Swagger)

Available at [http://localhost:3000/api/docs](http://localhost:3000/api/docs) when the backend is running.

---

## Uploading product images

Product images are uploaded to `backend/public/uploads/` via the admin panel and served as static files at `http://localhost:3000/uploads/<filename>`. The upload endpoint accepts JPEG, PNG, WebP, and GIF up to 5 MB.

---

## Payment

Checkout uses **Stripe** in test mode. Add your `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` to `backend/.env`. No real charges are made; use Stripe's test card `4242 4242 4242 4242` (any future expiry, any CVC) at checkout.

---

## Features

### Storefront
- **Landing page** — hero, category grid, featured products, and trust badges
- **Catalog** — search, category filter, price range, sort, pagination
- **Product detail** — image, description, quantity picker, add to cart, personalised recommendations
- **Guest cart** — cart persists in `localStorage` for unauthenticated users and merges into the server cart on login
- **Wishlist** — save products to a local wishlist (persists via `localStorage`), move items to cart
- **Checkout** — two-step: shipping address → Stripe payment
- **Order history** — per-order status timeline

### Admin panel
- **Dashboard** — revenue, order counts, top-5 products (Recharts)
- **Products** — full CRUD with drag-and-drop image upload
- **Orders** — status filter, inline status update

---

## Key business rules

- **Money in integer cents** — `price: 7999` means £79.99. Never floating-point.
- **Stock atomicity** — orders decrement stock atomically; quantity > stock is rejected.
- **Server-side totals** — `order.total` is always computed on the server from snapshotted item prices.
- **Order snapshots** — `priceAtOrder` and `name` are captured at checkout; live product changes never affect past orders.
- **Admin authz** — every admin route requires `role: 'admin'` in the JWT payload.
