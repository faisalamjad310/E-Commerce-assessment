# CartVerse — Design Notes

## Agentic development workflow

This project was built end-to-end using **Claude Code** as the primary development agent. Claude Code read the codebase, proposed implementation plans, wrote all code, resolved TypeScript errors, and updated a persistent memory file across sessions. Each phase was proposed as a plan, approved, then implemented — giving a coherent git history that reflects real incremental progress rather than a single monolithic commit.

Specific agentic behaviours demonstrated:
- Reading multiple files in parallel before writing to avoid context drift
- Running `tsc --noEmit` after each phase to catch type errors immediately
- Using the persistent memory system (`memory/project-cartverse-progress.md`) to maintain context across context-window resets
- Proposing targeted fixes (e.g. exporting `CartResponseItem` to resolve TS4053) rather than rewriting unrelated code

---

## Design decisions

### Recommendations (Phase 9)

**Interpretation:** "Relevant products" = products from categories the authenticated user has previously ordered, sorted newest first, excluding already-purchased items. Guests receive the 8 newest products site-wide ("Trending Now").

**Why this approach:**
- Zero external dependencies — runs entirely on existing MongoDB data
- Explainable and auditable — no black-box ML
- Handles new users gracefully (falls back to newest products)
- Category-based signal is durable: even if a purchased product is deleted, the category lookup naturally handles it
- Scales linearly with order history size without additional infrastructure

**Considered alternatives:**
- Collaborative filtering (users who bought X also bought Y) — requires cross-user data and meaningful purchase volumes to produce useful results; overkill for a demo
- Tag/attribute similarity — requires a richer product data model

### Image storage (Phase 7)

Images are stored locally in `backend/public/uploads/` and served as static files by NestJS's `useStaticAssets()`. This was explicitly specified in the requirements ("image save in local backend public folder").

For production this would move to S3 or similar object storage, but the API contract (`imageUrl` string field on Product) would remain unchanged — only the upload endpoint implementation changes.

### Stripe payment integration (post-Phase 10)

`PaymentsService` creates a real Stripe `PaymentIntent` server-side and returns the `clientSecret` to the frontend. The checkout page uses `@stripe/react-stripe-js` + `PaymentElement` to collect card details. On confirm, the frontend passes the `paymentIntentId` back to the backend, which calls `stripe.paymentIntents.retrieve` to verify `status === 'succeeded'` before creating the order. A webhook endpoint (`POST /api/payments/webhook`) handles async events using `stripe.webhooks.constructEvent` for signature verification.

Only Stripe test-mode keys are used (prefix `sk_test_`/`pk_test_`). No live keys are committed.

### Money representation

All prices stored and computed as **integer cents** throughout the stack. The frontend converts for display only: `(cents / 100).toFixed(2)`. URL params store dollar values for human readability; the CatalogPage multiplies ×100 before sending to the API. This prevents floating-point accumulation errors in order totals.

### Cart persistence

One cart document per user (unique index on `userId`). Cart items reference products by ObjectId but are enriched at query time via `.populate()` — giving live prices on the cart page while the order snapshot captures the price at checkout moment.

### Guest cart (post-Phase 10)

Unauthenticated users can add items and proceed to checkout. Guest cart state lives in `localStorage` (managed by `CartContext` in `lib/cart.tsx`). On checkout, `GuestCheckoutDto` accepts the cart items inline so no server-side cart document is needed. The `ProductDetailPage` no longer requires authentication to add to cart. Guest users who log in keep their local cart items — the context merges localStorage into the server cart on login.

### Wishlist (post-Phase 10)

Wishlist state is stored in `localStorage` via `WishlistContext` in `lib/wishlist.tsx`. No backend persistence — this is a client-side feature only, suitable for a demo. `WishlistPage` lists saved products with a remove action. A heart-toggle button on `ProductCard` and `ProductDetailPage` adds/removes from the wishlist. State survives page reloads via localStorage but does not sync across devices.

### Order ownership

`findOneUserOrder` compares `order.userId.toString() !== userId` and throws `ForbiddenException` (not `NotFoundException`) — this avoids leaking the existence of an order ID to an unauthorised user.

---

## Trade-offs and scope decisions

| Decision | What was chosen | What was deferred |
|----------|----------------|-------------------|
| Auth | Access token only (7-day expiry) | Refresh token rotation |
| Image upload | Local disk (`public/uploads/`) | S3 / cloud object storage |
| Payment | Real Stripe test integration (PaymentIntent flow) | Webhook-driven order fulfillment in production |
| Wishlist | Client-side localStorage only | Server-persisted wishlist with cross-device sync |
| Guest cart | localStorage, merged on login | Guest account prompt / persistent server cart |
| Recommendations | Category-based, server-rendered | ML-based collaborative filtering |
| Search | Case-insensitive regex on product name | Full-text Atlas Search |
| Tests | Backend unit tests (Jest) + frontend component tests (Vitest) | Integration tests against a real test DB |
| Pagination (admin orders) | Simple prev/next | Cursor-based infinite scroll |

---

## What would be done with more time

1. **Real Stripe integration** — `stripe.paymentIntents.create` flow with webhook confirmation
2. **Cloud image storage** — presigned S3 URLs; keep `imageUrl` field unchanged on the Product model
3. **Integration tests** — spin up a MongoDB Memory Server in CI and test service + controller together
4. **Role escalation protection** — prevent a customer from self-promoting to admin via profile update
5. **Email notifications** — order confirmation and status-change emails via nodemailer / SendGrid
