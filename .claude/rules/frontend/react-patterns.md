# React Patterns — CartVerse

## Component Structure
```tsx
// 1. Props interface above the component
interface Props {
  product: Product;
  onAddToCart: (id: string, qty: number) => void;
}

// 2. Default export for pages/routes, named export for reusable components
export function ProductCard({ product, onAddToCart }: Props) {
  // 3. Hooks first
  const [qty, setQty] = useState(1);
  const { addItem } = useCart();

  // 4. Derived values
  const formattedPrice = formatPrice(product.price);

  // 5. Handlers
  function handleAdd() {
    onAddToCart(product._id, qty);
  }

  // 6. JSX
  return <div>...</div>;
}
```

## State Ownership
| State type | Where it lives |
|---|---|
| Server / API data | TanStack Query (`useQuery`, `useMutation`) |
| Auth (user, token, role) | `useAuth()` from `lib/auth` |
| Cart (items, total, count) | `useCart()` from `lib/cart` |
| Dark mode | `useTheme()` from `lib/theme` |
| UI state (open/closed, tabs) | Local `useState` in the component |
| Form state | React Hook Form |

Never duplicate server state in local useState — use query cache.

## Data Fetching Pattern
```tsx
const { data, isLoading, isError } = useQuery({
  queryKey: ['products', { page, category, search }],
  queryFn: () => productsApi.getAll({ page, category, search }),
});

if (isLoading) return <LoadingSpinner />;
if (isError)   return <p>Failed to load products.</p>;
// data is guaranteed to be defined here
```

## Mutation Pattern
```tsx
const queryClient = useQueryClient();
const [serverError, setServerError] = useState('');

const { mutate, isPending } = useMutation({
  mutationFn: (dto: CreateProductDto) =>
    api.post('/api/products', dto).then(r => r.data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['products'] });
    onClose();
  },
  onError: (err: unknown) => {
    const msg =
      (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Something went wrong';
    setServerError(Array.isArray(msg) ? msg[0] : msg);
  },
});
```

## Protected Routes
```tsx
// In App.tsx
<Route path="/checkout"  element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
<Route path="/admin/*"   element={<AdminRoute><AdminLayout /></AdminRoute>} />
```

`ProtectedRoute` redirects to `/login` if no token. `AdminRoute` redirects to `/` if not admin.

## Formatting Helpers
```tsx
// Prices — always use this, never divide by 100 inline
import { formatPrice } from '../../api/products';
<span>{formatPrice(product.price)}</span>   // renders "£79.99"

// Dates
new Date(iso).toLocaleDateString('en-GB', {
  day: 'numeric', month: 'short', year: 'numeric',
})  // "5 Jan 2025"
```

## Context Hooks — Use from lib/, Never Read localStorage Directly
```tsx
// ✅ correct
const { token, user, isAdmin, login, logout } = useAuth();
const { items, orderTotal, addItem, removeItem } = useCart();

// ❌ wrong — bypasses context state management
const token = localStorage.getItem('token');
```

## Dark Mode — Always Add dark: Variants
```tsx
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
```

## Performance
- Don't create new objects/functions in JSX props if the child re-renders frequently — use `useCallback`
- TanStack Query handles caching; don't sync API responses into local state
- Use `queryClient.prefetchQuery` for predictable navigations (hover → prefetch)
