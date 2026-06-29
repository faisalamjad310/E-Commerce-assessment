/**
 * Quick seed: creates 1 admin user + 5 products directly via Mongoose.
 * Run: npx ts-node -r tsconfig-paths/register src/seed-quick.ts
 * Safe to re-run — skips existing products, upserts admin by email.
 */
import mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';

const MONGO_URI = process.env.MONGO_URI ?? 'mongodb://localhost:27017/cartverse';

// ── Inline schemas (no NestJS decorators needed here) ──────────────────────
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, lowercase: true },
  passwordHash: String,
  role: { type: String, default: 'customer' },
  createdAt: { type: Date, default: Date.now },
});

const ProductSchema = new mongoose.Schema(
  { name: String, description: String, price: Number, imageUrl: String, category: String, stock: Number },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } },
);

const User = mongoose.model('User', UserSchema);
const Product = mongoose.model('Product', ProductSchema);

// ── Seed data ───────────────────────────────────────────────────────────────
const ADMIN = {
  name: 'Admin',
  email: 'admin@cartverse.com',
  password: 'Admin@1234',
  role: 'admin',
};

const PRODUCTS = [
  {
    name: 'Sony WH-1000XM5 Wireless Headphones',
    description:
      'Industry-leading noise cancellation with 30-hour battery life. Crystal-clear call quality, multipoint Bluetooth connection, and premium comfort for all-day wear.',
    price: 34999, // $349.99
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
    category: 'Electronics',
    stock: 18,
  },
  {
    name: 'Running Pro X5 Athletic Shoes',
    description:
      'Lightweight performance running shoes with responsive foam cushioning, breathable mesh upper, and durable rubber outsole. Perfect for road and track running.',
    price: 12999, // $129.99
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
    category: 'Clothing',
    stock: 42,
  },
  {
    name: 'Atomic Habits by James Clear',
    description:
      'A proven framework for improving every day. Learn how tiny changes in behaviour can lead to remarkable results. #1 New York Times bestseller.',
    price: 1699, // $16.99
    imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600',
    category: 'Books',
    stock: 75,
  },
  {
    name: 'Fellow Stagg EKG Electric Kettle',
    description:
      'Variable temperature control (135–212°F), 60-minute keep-warm mode, and precision pour spout. The perfect kettle for pour-over coffee and loose-leaf tea.',
    price: 16500, // $165.00
    imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600',
    category: 'Home & Kitchen',
    stock: 11,
  },
  {
    name: 'Apple iPad Air 11" (M2)',
    description:
      'Supercharged by the M2 chip with a stunning Liquid Retina display, USB-C connectivity, and all-day battery. Compatible with Apple Pencil Pro and Magic Keyboard.',
    price: 59900, // $599.00
    imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600',
    category: 'Electronics',
    stock: 9,
  },
];

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // Upsert admin user
  const hash = await bcrypt.hash(ADMIN.password, 12);
  await User.findOneAndUpdate(
    { email: ADMIN.email },
    { $set: { name: ADMIN.name, email: ADMIN.email, passwordHash: hash, role: ADMIN.role } },
    { upsert: true },
  );
  console.log(`Admin user: ${ADMIN.email} / ${ADMIN.password}`);

  // Insert products (skip if same name already exists)
  let created = 0;
  for (const p of PRODUCTS) {
    const exists = await Product.exists({ name: p.name });
    if (!exists) {
      await Product.create(p);
      created++;
    }
  }
  console.log(`Products: ${created} created, ${PRODUCTS.length - created} already existed`);

  await mongoose.disconnect();
  console.log('Done.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
