# /create-page [PageName]

Scaffold a new React page in CartVerse following project conventions.

## Arguments
- `PageName` — PascalCase page name (e.g. `WishlistPage`, `OrderDetailPage`, `AdminReportsPage`)

## Determine Location
- **Customer storefront**: `frontend/src/features/storefront/<PageName>.tsx`
- **Admin panel**: `frontend/src/features/admin/Admin<Name>Page.tsx`

## Step-by-Step

### 1. Add API Function (if new data is needed)
In `frontend/src/api/<domain>.ts`:
```typescript
export const wishlistApi = {
  getAll: () =>
    api.get<WishlistItem[]>('/api/wishlist').then(r => r.data),
  addItem: (productId: string) =>
    api.post('/api/wishlist', { productId }).then(r => r.data),
  removeItem: (productId: string) =>
    api.delete(`/api/wishlist/${productId}`).then(r => r.data),
};
```

### 2. Create the Page Component
```tsx
import { useQuery } from '@tanstack/react-query';
import { wishlistApi } from '../../api/wishlist';
import { formatPrice } from '../../api/products';

export default function WishlistPage() {
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: wishlistApi.getAll,
  });

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-400 dark:text-gray-500 animate-pulse">
        Loading…
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="p-14 text-center">
        <p className="text-gray-500 dark:text-gray-400">Your wishlist is empty.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Wishlist</h1>
      <div className="grid gap-4">
        {items.map(item => (
          <div key={item.productId} className="...">
            <span>{formatPrice(item.price)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 3. Register the Route in App.tsx
```tsx
import WishlistPage from './features/storefront/WishlistPage';

// Inside the route tree:
<Route
  path="/wishlist"
  element={
    <ProtectedRoute>  {/* remove if page is public */}
      <WishlistPage />
    </ProtectedRoute>
  }
/>
```

Guard options:
- **Public**: no wrapper
- **Logged-in customer**: `<ProtectedRoute>`
- **Admin only**: `<AdminRoute>`

### 4. Add Navigation Link (if needed)
- Storefront navbar: edit the relevant `Navbar` or header component
- Admin panel: edit `AdminSidebar` or admin layout nav

## Checklist
- [ ] Loading state: spinner or skeleton, never blank
- [ ] Empty state: helpful message, not a blank page
- [ ] Error state: visible error message with recovery path
- [ ] Prices formatted via `formatPrice()` — never raw cents in JSX
- [ ] Route registered in `App.tsx`
- [ ] Correct guard applied (`ProtectedRoute` / `AdminRoute` / none)
- [ ] Dark mode works (`dark:` Tailwind variants on all elements)
- [ ] Mobile responsive (works at `sm` breakpoint)
