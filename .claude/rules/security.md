# Security Rules — CartVerse

## Authentication & Authorization

### JWT Guards
- Every protected route: `@UseGuards(JwtAuthGuard)`
- Admin routes: `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles('admin')`
- Verify `role` from JWT payload on admin routes — presence of a valid token is not enough
- Token expiry: 7 days (`JWT_EXPIRES_IN=7d`)
- Never log tokens or include them in API responses beyond the login endpoint

### Customer Data Isolation
- Cart: validate `cart.userId === req.user.sub` before every operation
- Orders: `findOneUserOrder()` must check `order.userId.toString() === requestingUserId`
- Never query by a user-supplied `userId` param — use `req.user.sub` from the JWT

### Passwords
- Hash with bcrypt before storing: `bcrypt.hash(password, 10)`
- Compare with `bcrypt.compare(plain, hash)` — never compare stored hashes directly
- Never store, return, or log plaintext passwords
- Login errors must say "Invalid credentials" — do not reveal whether the email exists

## Input Validation
- `ValidationPipe` applied globally: `whitelist: true, forbidNonWhitelisted: true, transform: true`
- Validate on the server even when the client also validates — never trust the client
- Validate all ObjectId params: `if (!Types.ObjectId.isValid(id)) throw new NotFoundException()`
- Escape user search input before using in regex: `input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')`

## Money & Business Logic Integrity
- **All monetary values are integer cents — never floats**
- Never accept `total`, `subtotal`, or `price` from the client for order creation
- `order.total` is always computed server-side from snapshotted `priceAtOrder` values
- Stock decrement is atomic: `{ stock: { $gte: quantity } }` — never read-modify-write

## Secrets Management
- All secrets in `.env` only — never hardcoded in source files
- `.env` is git-ignored; only `.env.example` (with placeholder values) is committed
- Required secrets: `JWT_SECRET`, `MONGO_URI`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `VITE_STRIPE_PUBLISHABLE_KEY`
- `JWT_SECRET` must be a long random string — never a short or guessable value

## Stripe
- Webhook endpoint must verify signatures: `stripe.webhooks.constructEvent(rawBody, sig, secret)`
- Reject requests where verification fails with a 400 error
- Only Stripe test-mode keys in development (prefix `sk_test_`, `pk_test_`)
- Never commit live keys (`sk_live_`, `pk_live_`)

## Error Responses
- No stack traces in HTTP responses — global exception filter handles this
- Correct HTTP status codes:
  - `400` — bad request / validation failure
  - `401` — unauthenticated (no valid JWT)
  - `403` — authenticated but not authorized
  - `404` — resource not found
  - `409` — conflict (e.g. duplicate email on signup)
- Error message format: `{ statusCode, message, error }`

## Frontend Security
- Never read `localStorage.token` directly in components — use `useAuth()` context
- Attach JWT via the axios interceptor in `src/lib/api.ts` — never in URL params
- The api interceptor handles 401 redirect to `/login` automatically
- Never render raw user-generated content without sanitization
