# CartVerse — API Contract

Base URL: `http://localhost:3000/api`

Auth: `Authorization: Bearer <jwt>` header for protected routes.

---

## Auth

| Method | Path              | Auth     | Description                          |
|--------|-------------------|----------|--------------------------------------|
| POST   | /auth/signup      | None     | Create customer account, return JWT  |
| POST   | /auth/login       | None     | Login, return JWT                    |

### POST /auth/signup
**Body:** `{ name, email, password }`
**Returns:** `{ access_token, user: { id, name, email, role } }`

### POST /auth/login
**Body:** `{ email, password }`
**Returns:** `{ access_token, user: { id, name, email, role } }`

---

## Products

| Method | Path              | Auth        | Description                          |
|--------|-------------------|-------------|--------------------------------------|
| GET    | /products         | None        | Paginated catalog with filters       |
| GET    | /products/:id     | None        | Single product detail                |
| POST   | /products         | Admin       | Create product                       |
| PATCH  | /products/:id     | Admin       | Update product                       |
| DELETE | /products/:id     | Admin       | Delete product                       |

### GET /products query params
- `search` — name substring match
- `category` — exact match
- `minPrice`, `maxPrice` — in cents
- `sortBy` — `price_asc | price_desc | newest`
- `page` (default 1), `limit` (default 12, max 48)

**Returns:** `{ items: Product[], total, page, totalPages }`

---

## Cart

| Method | Path                   | Auth     | Description                       |
|--------|------------------------|----------|-----------------------------------|
| GET    | /cart                  | Customer | Get cart with computed totals     |
| POST   | /cart/items            | Customer | Add item `{ productId, quantity }` |
| PATCH  | /cart/items/:productId | Customer | Update quantity `{ quantity }`    |
| DELETE | /cart/items/:productId | Customer | Remove item                       |

**Cart response includes** `lineTotal` per item and `orderTotal`.

---

## Orders

| Method | Path                        | Auth     | Description                          |
|--------|-----------------------------|----------|--------------------------------------|
| POST   | /orders                     | Customer | Create order (via /payments/checkout)|
| GET    | /orders                     | Customer | Own order history                    |
| GET    | /orders/:id                 | Customer | Single order (own only)              |
| GET    | /admin/orders               | Admin    | All orders, filterable by status     |
| PATCH  | /admin/orders/:id/status    | Admin    | Update order status                  |

---

## Payments

| Method | Path               | Auth     | Description                          |
|--------|--------------------|----------|--------------------------------------|
| POST   | /payments/checkout | Customer | Process mock payment + create order  |

**Body:** `{ shippingAddress: { name, address, city } }`
**Returns:** `{ orderId, paymentRef }`

---

## Admin Dashboard

| Method | Path              | Auth  | Description                          |
|--------|-------------------|-------|--------------------------------------|
| GET    | /admin/dashboard  | Admin | Revenue, order counts, top products  |

---

## Recommendations

| Method | Path              | Auth     | Description                          |
|--------|-------------------|----------|--------------------------------------|
| GET    | /recommendations  | Optional | Personalized if token present        |

**Query:** `?excludeProductId=<id>`
**Returns:** `Product[]` (max 8)

---

## Error format
All errors return:
```json
{
  "statusCode": 400,
  "message": "Descriptive error message",
  "error": "Bad Request",
  "path": "/api/..."
}
```
