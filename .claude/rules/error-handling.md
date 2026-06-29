# Error Handling — CartVerse

## Backend (NestJS)

### Use the Right Exception
```typescript
throw new BadRequestException('Cart is empty');             // 400
throw new UnauthorizedException('Invalid credentials');     // 401
throw new ForbiddenException('Cannot access this order');   // 403
throw new NotFoundException(`Product ${id} not found`);    // 404
throw new ConflictException('Email already registered');   // 409
```

### Controller Pattern — No Try/Catch
Controllers never catch and re-throw. The global exception filter handles everything:
```typescript
@Get(':id')
findOne(@Param('id') id: string) {
  return this.productsService.findOne(id);  // service throws if not found
}
```

### Service Pattern — Validate Then Query
```typescript
async findOne(id: string): Promise<Product> {
  if (!Types.ObjectId.isValid(id)) {
    throw new NotFoundException(`Invalid product ID`);
  }
  const product = await this.model.findById(id).lean();
  if (!product) {
    throw new NotFoundException(`Product ${id} not found`);
  }
  return product;
}
```

### Never Return Null for Missing Resources
Services either return the resource or throw `NotFoundException`. Never return `null` and let the caller check — that leaks business logic into controllers.

### Atomic Operation Failures
For operations that must succeed atomically (stock decrement), return a boolean and convert to exception at the service level:
```typescript
// In service:
const decremented = await this.productsService.decrementStock(productId, qty);
if (!decremented) {
  throw new BadRequestException(`Insufficient stock for product ${productId}`);
}
```

## Frontend (React)

### Query Error State
```tsx
const { data, isLoading, isError } = useQuery({ ... });

if (isLoading) return <Spinner />;
if (isError)   return <ErrorMessage message="Failed to load products" />;
```

### Mutation Error Handling
Always provide `onError` — never let mutations fail silently:
```typescript
const { mutate } = useMutation({
  mutationFn: (data) => api.post('/api/orders', data).then(r => r.data),
  onSuccess: () => navigate('/orders'),
  onError: (err: unknown) => {
    const msg =
      (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      ?? 'Something went wrong. Please try again.';
    setError(Array.isArray(msg) ? msg[0] : msg);
  },
});
```

### Error Display Rules
- Show errors inline, near the action that caused them
- Provide a dismiss button on error banners
- Never show technical details (stack traces, ObjectIds, HTTP status codes) in the UI
- Always offer a recovery path: retry button, back link, or guidance text

### HTTP 401 Handling
The axios interceptor in `src/lib/api.ts` automatically redirects to `/login` on 401 responses from non-auth endpoints. Do not handle 401 manually in components.
