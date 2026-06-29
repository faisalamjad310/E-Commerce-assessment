# TanStack Query Patterns — CartVerse

## Query Key Conventions
Query keys are arrays encoding all relevant state. Be consistent — stale queries must match exactly to invalidate correctly.

```typescript
['products']                              // all products (no filter)
['products', { page, category, search }] // filtered/paginated list
['product', id]                           // single product detail
['cart']                                  // current user's cart (server)
['orders']                                // current user's order history
['order', id]                             // single order detail
['admin-orders', statusFilter, page]      // admin order list
['admin-dashboard']                       // dashboard aggregate stats
['categories']                            // product categories list
['recommendations', productId]            // product recommendations
```

## Query Pattern
```typescript
const { data, isLoading, isError } = useQuery({
  queryKey: ['products', { page, category, search }],
  queryFn: () => productsApi.getAll({ page, category, search }),
  staleTime: 60_000,  // how long before refetching in background
});
```

## staleTime Guidelines
| Data | staleTime | Reason |
|---|---|---|
| Product catalog | `60_000` (1 min) | Changes occasionally |
| Single product | `60_000` | Same |
| Cart | `0` | Must always be fresh |
| Order history | `0` | User needs current status |
| Admin orders | `0` | Admin needs live data |
| Dashboard stats | `300_000` (5 min) | Aggregate, not time-critical |
| Categories | `600_000` (10 min) | Rarely changes |

## Mutation + Cache Invalidation
```typescript
const queryClient = useQueryClient();

const mutation = useMutation({
  mutationFn: (status: OrderStatus) =>
    adminOrdersApi.updateStatus(orderId, status),
  onSuccess: () => {
    // Invalidate ALL admin-order queries regardless of page/filter
    queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    // Also invalidate dashboard if stats depend on order status
    queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
  },
});
```

Prefer `invalidateQueries` (triggers refetch) over `setQueryData` (manual update) — less prone to inconsistencies.

## Resetting Page on Filter Change
When the user changes a filter, reset to page 1 and remove stale cached pages:
```typescript
function handleStatusChange(status: OrderStatus | undefined) {
  setStatusFilter(status);
  setPage(1);
  queryClient.removeQueries({ queryKey: ['admin-orders'] });
}
```

## Cart After Mutations
After any cart mutation (add/update/remove), the cart context calls `refreshCart()` which re-fetches from the server. Components using `useCart()` automatically get the updated state — no manual query invalidation needed for cart.

## API Client
All requests go through the axios instance at `src/lib/api.ts`. It:
- Sets `baseURL` from `VITE_API_URL`
- Attaches `Authorization: Bearer <token>` from localStorage
- Redirects to `/login` on 401 (non-auth endpoints)

Never call `axios` directly — always use `import api from '../../lib/api'`.

## Pagination with Query
```typescript
const [page, setPage] = useState(1);

const { data } = useQuery({
  queryKey: ['products', { page, category }],
  queryFn: () => productsApi.getAll({ page, limit: 12, category }),
  placeholderData: keepPreviousData,   // keeps old data visible while fetching next page
});
```
