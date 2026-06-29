# Forms — CartVerse

## Stack
React Hook Form + Zod + `@hookform/resolvers/zod`

## Standard Pattern
```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name:  z.string().min(1, 'Name is required'),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  price: z.number().int().min(1, 'Price must be at least 1 cent'),
});
type FormData = z.infer<typeof schema>;

function ProductForm({ onSubmit }: { onSubmit: (d: FormData) => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <input {...register('name')} />
      {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving…' : 'Save'}
      </button>
    </form>
  );
}
```

## Price Field — Pounds ↔ Cents Conversion
Display prices in pounds (£79.99) but store/send in cents (7999). Convert at form boundary:

```tsx
// defaultValues: cents → pounds for the input
defaultValues: { price: product ? product.price / 100 : 0 }

// schema: coerce and convert pounds → cents on submit
price: z.coerce.number()
  .positive('Price must be positive')
  .transform(v => Math.round(v * 100)),   // £79.99 → 7999
```

## Error Display
Errors go directly below the relevant field, not in a summary at the top:
```tsx
{errors.fieldName && (
  <p className="mt-1 text-xs text-red-500 dark:text-red-400">
    {errors.fieldName.message}
  </p>
)}
```

## Server Errors (from API)
Server validation errors live in local state, not RHF state:
```tsx
const [serverError, setServerError] = useState('');

async function onSubmit(data: FormData) {
  setServerError('');
  try {
    await mutateAsync(data);
  } catch (err: unknown) {
    const msg =
      (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Server error. Please try again.';
    setServerError(Array.isArray(msg) ? msg[0] : msg);
  }
}
```

Display server errors in a banner above the form:
```tsx
{serverError && (
  <div className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 text-sm">
    {serverError}
  </div>
)}
```

## Common Zod Schemas
```typescript
// Auth
const loginSchema = z.object({
  email:    z.string().min(1, 'Email is required').email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

const signupSchema = z.object({
  name:            z.string().min(2, 'Name must be at least 2 characters'),
  email:           z.string().email('Invalid email'),
  password:        z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Shipping
const shippingSchema = z.object({
  name:    z.string().min(1, 'Full name is required'),
  address: z.string().min(5, 'Address is required'),
  city:    z.string().min(1, 'City is required'),
});
```

## File Upload (Product Images)
```tsx
const { register, watch } = useForm<{ image: FileList }>();
const file = watch('image')?.[0];

async function upload() {
  const formData = new FormData();
  formData.append('image', file);
  await api.post('/api/admin/products/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}
```
