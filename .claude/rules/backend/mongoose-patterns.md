# Mongoose Patterns — CartVerse

## Schema Definition
```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })   // adds createdAt + updatedAt automatically
export class Product {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, min: 0 })
  price: number;        // integer cents — NEVER a float

  @Prop({ required: true, min: 0, default: 0 })
  stock: number;        // non-negative integer

  @Prop({ required: true })
  category: string;

  @Prop()
  imageUrl?: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
```

## References Between Documents
```typescript
@Prop({ type: Types.ObjectId, ref: 'User', required: true })
userId: Types.ObjectId;
```

Populate only when needed (lazy — don't over-populate):
```typescript
const orders = await this.model
  .find({ userId: id })
  .populate('userId', 'name email')  // select only needed fields
  .lean();
```

## Atomic Stock Decrement
Never read stock, then write — that's a race condition. Use MongoDB's atomic operators:
```typescript
async decrementStock(id: string, quantity: number): Promise<boolean> {
  const result = await this.model.findOneAndUpdate(
    { _id: id, stock: { $gte: quantity } },  // fails atomically if stock < qty
    { $inc: { stock: -quantity } },
    { new: true },
  );
  return result !== null;  // null means stock was insufficient → order must be rejected
}
```

## Read vs Write Queries
Use `.lean()` for read-only queries — returns plain JS objects, skips Mongoose overhead:
```typescript
const product = await this.model.findById(id).lean();   // plain object, faster
const product = await this.model.findById(id);           // Mongoose Document, needed for .save()
```

## Upsert Pattern (Cart)
```typescript
// Upsert: create cart if it doesn't exist yet
await this.model.findOneAndUpdate(
  { userId },
  { $setOnInsert: { userId, items: [] } },
  { upsert: true, new: true },
);
```

## Array Item Operations
```typescript
// Add item to array
await this.model.updateOne({ userId }, {
  $push: { items: { productId, quantity } },
});

// Update existing array element (matched by filter)
await this.model.updateOne(
  { userId, 'items.productId': objectId },
  { $set: { 'items.$.quantity': newQty } },
);

// Remove item from array
await this.model.updateOne({ userId }, {
  $pull: { items: { productId: objectId } },
});
```

## ObjectId Validation
Always validate before querying to avoid CastErrors:
```typescript
if (!Types.ObjectId.isValid(id)) {
  throw new NotFoundException(`Invalid ID: ${id}`);
}
```

## Data Integrity Rules
- `price` and `priceAtOrder` are always integers (cents) — assert `min: 0` in schema
- `stock` is non-negative — use `min: 0` and the atomic decrement pattern
- Order line items snapshot `name` and `priceAtOrder` at creation time — never recompute from the live Product document
- Cart `items` reference `productId` but line totals are computed fresh on each read
