/**
 * Idempotent seed script — safe to run multiple times.
 * Run: npm run seed
 */
import mongoose, { Schema, model, connect, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: join(__dirname, '../.env') });

// ── Inline schemas (avoids NestJS bootstrap overhead) ─────────────────────────

const UserSchema = new Schema({
  name:         { type: String, required: true },
  email:        { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role:         { type: String, enum: ['customer', 'admin'], default: 'customer' },
}, { timestamps: { createdAt: 'createdAt', updatedAt: false } });

const ProductSchema = new Schema({
  name:        { type: String, required: true },
  description: { type: String, required: true },
  price:       { type: Number, required: true, min: 0 },
  imageUrl:    { type: String, required: true },
  category:    { type: String, required: true },
  stock:       { type: Number, required: true, min: 0, default: 0 },
}, { timestamps: { createdAt: 'createdAt', updatedAt: false } });

const OrderItemSchema = new Schema({
  productId:    { type: Types.ObjectId, ref: 'Product', required: true },
  name:         { type: String, required: true },
  priceAtOrder: { type: Number, required: true },
  quantity:     { type: Number, required: true, min: 1 },
}, { _id: false });

const ShippingAddressSchema = new Schema({
  name:    { type: String, required: true },
  address: { type: String, required: true },
  city:    { type: String, required: true },
}, { _id: false });

const OrderSchema = new Schema({
  userId:          { type: Types.ObjectId, ref: 'User', required: true },
  items:           { type: [OrderItemSchema], required: true },
  subtotal:        { type: Number, required: true },
  total:           { type: Number, required: true },
  status:          { type: String, enum: ['pending','processing','shipped','delivered','cancelled'], default: 'pending' },
  paymentRef:      { type: String, required: true },
  shippingAddress: { type: ShippingAddressSchema, required: true },
}, { timestamps: { createdAt: 'createdAt', updatedAt: false } });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const UserModel    = model<any>('User',    UserSchema);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ProductModel = model<any>('Product', ProductSchema);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const OrderModel   = model<any>('Order',   OrderSchema);

// ── Seed data ──────────────────────────────────────────────────────────────────

const PRODUCTS = [
  // Electronics (5)
  { name: 'Wireless Noise-Cancelling Headphones', description: 'Premium over-ear headphones with 30-hour battery life, active noise cancellation, and foldable design.', price: 7999, imageUrl: 'https://placehold.co/600x600/e0e7ff/6366f1?text=Headphones', category: 'Electronics', stock: 25 },
  { name: 'Mechanical Keyboard', description: 'Compact TKL mechanical keyboard with Cherry MX switches, RGB backlighting, and aluminium frame.', price: 8999, imageUrl: 'https://placehold.co/600x600/e0e7ff/6366f1?text=Keyboard', category: 'Electronics', stock: 18 },
  { name: 'USB-C Monitor 27"', description: '4K IPS display with 99% sRGB coverage, 60Hz refresh rate, and single-cable USB-C power delivery.', price: 39999, imageUrl: 'https://placehold.co/600x600/e0e7ff/6366f1?text=Monitor', category: 'Electronics', stock: 10 },
  { name: 'Portable Bluetooth Speaker', description: 'Waterproof IP67 speaker with 360° sound, 12-hour playback, and built-in microphone.', price: 4999, imageUrl: 'https://placehold.co/600x600/e0e7ff/6366f1?text=Speaker', category: 'Electronics', stock: 40 },
  { name: 'Smart Watch Series 9', description: 'Health tracking smartwatch with ECG, blood oxygen monitoring, GPS, and 18-hour battery.', price: 29999, imageUrl: 'https://placehold.co/600x600/e0e7ff/6366f1?text=Watch', category: 'Electronics', stock: 15 },

  // Clothing (5)
  { name: 'Premium Merino Wool Jumper', description: 'Lightweight 100% Merino wool jumper — naturally temperature regulating, itch-free, and machine washable.', price: 8999, imageUrl: 'https://placehold.co/600x600/fce7f3/db2777?text=Jumper', category: 'Clothing', stock: 30 },
  { name: 'Slim-Fit Chino Trousers', description: 'Classic slim-fit chinos in stretch cotton-twill. Available in multiple colours. Machine washable.', price: 5499, imageUrl: 'https://placehold.co/600x600/fce7f3/db2777?text=Chinos', category: 'Clothing', stock: 50 },
  { name: 'Waterproof Running Jacket', description: 'Lightweight packable jacket with taped seams, zip-away hood, and reflective details. Perfect for commuting and training.', price: 11999, imageUrl: 'https://placehold.co/600x600/fce7f3/db2777?text=Jacket', category: 'Clothing', stock: 20 },
  { name: 'Organic Cotton T-Shirt 3-Pack', description: 'Three classic crew-neck T-shirts in GOTS-certified organic cotton. Preshrunk and long-lasting.', price: 3499, imageUrl: 'https://placehold.co/600x600/fce7f3/db2777?text=T-Shirts', category: 'Clothing', stock: 80 },
  { name: 'Leather Chelsea Boots', description: 'Full-grain leather Chelsea boots with elastic side panels and rubber sole. Handcrafted in Portugal.', price: 17999, imageUrl: 'https://placehold.co/600x600/fce7f3/db2777?text=Boots', category: 'Clothing', stock: 12 },

  // Books (5)
  { name: 'Clean Code', description: "Robert C. Martin's classic guide to writing readable, maintainable software. Essential reading for every developer.", price: 3499, imageUrl: 'https://placehold.co/600x600/ecfdf5/059669?text=Clean+Code', category: 'Books', stock: 60 },
  { name: 'Designing Data-Intensive Applications', description: "Martin Kleppmann's deep dive into distributed systems, databases, and data engineering best practices.", price: 4999, imageUrl: 'https://placehold.co/600x600/ecfdf5/059669?text=DDIA', category: 'Books', stock: 45 },
  { name: 'The Pragmatic Programmer', description: "David Thomas and Andrew Hunt's timeless guide to software craftsmanship — from career advice to code quality.", price: 3999, imageUrl: 'https://placehold.co/600x600/ecfdf5/059669?text=Pragmatic', category: 'Books', stock: 55 },
  { name: 'You Don\'t Know JS (Book Series)', description: '6-volume series diving deep into JavaScript\'s core mechanisms — scope, closures, prototypes, and async.', price: 7999, imageUrl: 'https://placehold.co/600x600/ecfdf5/059669?text=YDKJS', category: 'Books', stock: 35 },
  { name: 'Atomic Habits', description: "James Clear's practical guide to building good habits and breaking bad ones through tiny, consistent changes.", price: 1999, imageUrl: 'https://placehold.co/600x600/ecfdf5/059669?text=Atomic', category: 'Books', stock: 100 },

  // Home & Kitchen (5)
  { name: 'Pour-Over Coffee Maker', description: 'Borosilicate glass pour-over brewer with reusable stainless steel filter. Produces clean, flavourful coffee.', price: 3499, imageUrl: 'https://placehold.co/600x600/fff7ed/c2410c?text=Coffee', category: 'Home & Kitchen', stock: 28 },
  { name: 'Cast Iron Skillet 26cm', description: 'Pre-seasoned cast iron frying pan suitable for all hob types including induction. Oven-safe to 260°C.', price: 4999, imageUrl: 'https://placehold.co/600x600/fff7ed/c2410c?text=Skillet', category: 'Home & Kitchen', stock: 22 },
  { name: 'Bamboo Cutting Board Set', description: 'Set of 3 bamboo cutting boards in S/M/L with non-slip feet. Naturally antibacterial and dishwasher safe.', price: 2999, imageUrl: 'https://placehold.co/600x600/fff7ed/c2410c?text=Boards', category: 'Home & Kitchen', stock: 45 },
  { name: 'Stainless Steel Thermos 500ml', description: 'Double-wall vacuum insulated flask. Keeps drinks hot 12 hours or cold 24 hours. Leak-proof lid.', price: 2499, imageUrl: 'https://placehold.co/600x600/fff7ed/c2410c?text=Thermos', category: 'Home & Kitchen', stock: 60 },
  { name: 'Smart Air Purifier', description: 'True HEPA H13 air purifier with auto mode, real-time air quality display, and companion app. 50m² coverage.', price: 14999, imageUrl: 'https://placehold.co/600x600/fff7ed/c2410c?text=Purifier', category: 'Home & Kitchen', stock: 8 },
];

const ADMIN    = { name: 'Admin',            email: 'admin@cartverse.com',    password: 'Admin@1234',    role: 'admin'    as const };
const CUSTOMER = { name: 'Demo Customer',    email: 'customer@cartverse.com', password: 'Customer@1234', role: 'customer' as const };

// ── Main ───────────────────────────────────────────────────────────────────────

async function seed() {
  const uri = process.env.MONGO_URI ?? 'mongodb://localhost:27017/cartverse';
  console.log('Connecting to MongoDB…');
  await connect(uri);
  console.log('Connected.');

  // 1. Products — wipe and re-create
  await ProductModel.deleteMany({});
  const products = await ProductModel.insertMany(PRODUCTS);
  console.log(`✓ Seeded ${products.length} products`);

  // 2. Users — upsert by email so existing tokens stay valid
  const [adminUser, customerUser] = await Promise.all([
    upsertUser(ADMIN),
    upsertUser(CUSTOMER),
  ]);
  console.log(`✓ Upserted users: ${ADMIN.email}, ${CUSTOMER.email}`);

  // 3. Orders for customer — wipe and re-create
  await OrderModel.deleteMany({ userId: customerUser._id });

  const [p0, p1, p2] = products;

  const shippingAddress = { name: 'Demo Customer', address: '42 Elm Street', city: 'London' };

  const sampleOrders = [
    {
      userId: customerUser._id,
      items: [
        { productId: p0._id, name: p0.name, priceAtOrder: p0.price, quantity: 1 },
        { productId: p1._id, name: p1.name, priceAtOrder: p1.price, quantity: 1 },
      ],
      subtotal: p0.price + p1.price,
      total:    p0.price + p1.price,
      status:   'delivered',
      paymentRef: 'MOCK-SEED0001',
      shippingAddress,
    },
    {
      userId: customerUser._id,
      items: [
        { productId: p2._id, name: p2.name, priceAtOrder: p2.price, quantity: 2 },
      ],
      subtotal: p2.price * 2,
      total:    p2.price * 2,
      status:   'shipped',
      paymentRef: 'MOCK-SEED0002',
      shippingAddress,
    },
    {
      userId: customerUser._id,
      items: [
        { productId: products[10]._id, name: products[10].name, priceAtOrder: products[10].price, quantity: 1 },
        { productId: products[15]._id, name: products[15].name, priceAtOrder: products[15].price, quantity: 1 },
      ],
      subtotal: products[10].price + products[15].price,
      total:    products[10].price + products[15].price,
      status:   'pending',
      paymentRef: 'MOCK-SEED0003',
      shippingAddress,
    },
  ];

  await OrderModel.insertMany(sampleOrders);
  console.log(`✓ Seeded 3 sample orders for ${CUSTOMER.email}`);

  console.log('\n── Seeded credentials ───────────────────');
  console.log(`  Admin:    ${ADMIN.email}    /  ${ADMIN.password}`);
  console.log(`  Customer: ${CUSTOMER.email} / ${CUSTOMER.password}`);
  console.log('─────────────────────────────────────────\n');

  await mongoose.disconnect();
}

async function upsertUser(data: { name: string; email: string; password: string; role: 'admin' | 'customer' }) {
  const passwordHash = await bcrypt.hash(data.password, 12);
  return UserModel.findOneAndUpdate(
    { email: data.email },
    { $set: { name: data.name, passwordHash, role: data.role } },
    { upsert: true, new: true },
  );
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
