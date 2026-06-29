# CartVerse — Data Model

> Authoritative schema. All implementations must match exactly.

## User
```
{
  _id:          ObjectId
  email:        String (unique, indexed)
  passwordHash: String (bcrypt, never returned in API responses)
  name:         String
  role:         'customer' | 'admin'
  createdAt:    Date
}
```

## Product
```
{
  _id:         ObjectId
  name:        String
  description: String
  price:       Number (integer cents — e.g. 1999 = $19.99)
  imageUrl:    String
  category:    String
  stock:       Number (integer >= 0)
  createdAt:   Date
}
```

## Cart
```
{
  _id:       ObjectId
  userId:    ObjectId (ref: User, unique — one cart per user)
  items: [
    {
      productId: ObjectId (ref: Product)
      quantity:  Number (integer >= 1)
    }
  ]
  updatedAt: Date
}
```
One cart document per user. Persists across sessions. Cleared after a successful order.

## Order
```
{
  _id:    ObjectId
  userId: ObjectId (ref: User)
  items: [
    {
      productId:    ObjectId (ref: Product)
      name:         String  (snapshot at order time)
      priceAtOrder: Number  (snapshot in cents at order time)
      quantity:     Number
    }
  ]
  subtotal:        Number (cents, server-computed)
  total:           Number (cents, server-computed — same as subtotal for now, extensible for tax/shipping)
  status:          'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  paymentRef:      String (mock ref or Stripe payment intent ID)
  shippingAddress: { name: String, address: String, city: String }
  createdAt:       Date
}
```

**Key invariants:**
- `priceAtOrder` and `name` are snapshotted at checkout — order totals never recomputed from live product prices.
- `total` and `subtotal` are always computed server-side; the client never sends a total.
- Stock is decremented atomically when an order is created; it never goes negative.
