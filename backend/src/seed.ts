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

const CategorySchema = new Schema({
  name:        { type: String, required: true, unique: true, trim: true },
  description: { type: String, default: '' },
  imageUrl:    { type: String, required: true },
  slug:        { type: String, trim: true },
}, { timestamps: { createdAt: 'createdAt', updatedAt: false } });

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
const CategoryModel = model<any>('Category', CategorySchema);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const UserModel    = model<any>('User',    UserSchema);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ProductModel = model<any>('Product', ProductSchema);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const OrderModel   = model<any>('Order',   OrderSchema);

// ── Seed data ──────────────────────────────────────────────────────────────────

const PRODUCTS = [
  // Electronics (0–4)
  { name: 'Wireless Noise-Cancelling Headphones', description: 'Premium over-ear headphones with 30-hour battery life, active noise cancellation, and foldable design.', price: 7999, imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80', category: 'Electronics', stock: 25 },
  { name: 'Mechanical Keyboard', description: 'Compact TKL mechanical keyboard with Cherry MX switches, RGB backlighting, and aluminium frame.', price: 8999, imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80', category: 'Electronics', stock: 18 },
  { name: 'USB-C Monitor 27"', description: '4K IPS display with 99% sRGB coverage, 60Hz refresh rate, and single-cable USB-C power delivery.', price: 39999, imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=80', category: 'Electronics', stock: 10 },
  { name: 'Portable Bluetooth Speaker', description: 'Waterproof IP67 speaker with 360° sound, 12-hour playback, and built-in microphone.', price: 4999, imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80', category: 'Electronics', stock: 40 },
  { name: 'Smart Watch Series 9', description: 'Health tracking smartwatch with ECG, blood oxygen monitoring, GPS, and 18-hour battery.', price: 29999, imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80', category: 'Electronics', stock: 15 },

  // Clothing (5–9)
  { name: 'Premium Merino Wool Jumper', description: 'Lightweight 100% Merino wool jumper — naturally temperature regulating, itch-free, and machine washable.', price: 8999, imageUrl: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&q=80', category: 'Clothing', stock: 30 },
  { name: 'Slim-Fit Chino Trousers', description: 'Classic slim-fit chinos in stretch cotton-twill. Available in multiple colours. Machine washable.', price: 5499, imageUrl: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=80', category: 'Clothing', stock: 50 },
  { name: 'Waterproof Running Jacket', description: 'Lightweight packable jacket with taped seams, zip-away hood, and reflective details. Perfect for commuting and training.', price: 11999, imageUrl: 'https://images.unsplash.com/photo-1544923246-77307dd654cb?w=600&q=80', category: 'Clothing', stock: 20 },
  { name: 'Organic Cotton T-Shirt 3-Pack', description: 'Three classic crew-neck T-shirts in GOTS-certified organic cotton. Preshrunk and long-lasting.', price: 3499, imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80', category: 'Clothing', stock: 80 },
  { name: 'Leather Chelsea Boots', description: 'Full-grain leather Chelsea boots with elastic side panels and rubber sole. Handcrafted in Portugal.', price: 17999, imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80', category: 'Clothing', stock: 12 },

  // Books (10–14)
  { name: 'Clean Code', description: "Robert C. Martin's classic guide to writing readable, maintainable software. Essential reading for every developer.", price: 3499, imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80', category: 'Books', stock: 60 },
  { name: 'Designing Data-Intensive Applications', description: "Martin Kleppmann's deep dive into distributed systems, databases, and data engineering best practices.", price: 4999, imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80', category: 'Books', stock: 45 },
  { name: 'The Pragmatic Programmer', description: "David Thomas and Andrew Hunt's timeless guide to software craftsmanship — from career advice to code quality.", price: 3999, imageUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&q=80', category: 'Books', stock: 55 },
  { name: "You Don't Know JS (Book Series)", description: "6-volume series diving deep into JavaScript's core mechanisms — scope, closures, prototypes, and async.", price: 7999, imageUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600&q=80', category: 'Books', stock: 35 },
  { name: 'Atomic Habits', description: "James Clear's practical guide to building good habits and breaking bad ones through tiny, consistent changes.", price: 1999, imageUrl: 'https://images.unsplash.com/photo-1535398089889-dd807df1dfaa?w=600&q=80', category: 'Books', stock: 100 },

  // Home & Kitchen (15–19)
  { name: 'Pour-Over Coffee Maker', description: 'Borosilicate glass pour-over brewer with reusable stainless steel filter. Produces clean, flavourful coffee.', price: 3499, imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80', category: 'Home & Kitchen', stock: 28 },
  { name: 'Cast Iron Skillet 26cm', description: 'Pre-seasoned cast iron frying pan suitable for all hob types including induction. Oven-safe to 260°C.', price: 4999, imageUrl: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=600&q=80', category: 'Home & Kitchen', stock: 22 },
  { name: 'Bamboo Cutting Board Set', description: 'Set of 3 bamboo cutting boards in S/M/L with non-slip feet. Naturally antibacterial and dishwasher safe.', price: 2999, imageUrl: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=600&q=80', category: 'Home & Kitchen', stock: 45 },
  { name: 'Stainless Steel Thermos 500ml', description: 'Double-wall vacuum insulated flask. Keeps drinks hot 12 hours or cold 24 hours. Leak-proof lid.', price: 2499, imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80', category: 'Home & Kitchen', stock: 60 },
  { name: 'Smart Air Purifier', description: 'True HEPA H13 air purifier with auto mode, real-time air quality display, and companion app. 50m² coverage.', price: 14999, imageUrl: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&q=80', category: 'Home & Kitchen', stock: 8 },

  // Sports & Fitness (20–24)
  { name: 'Adjustable Dumbbell Set 5–25kg', description: 'Space-saving adjustable dumbbells with quick-lock dial. Replaces 9 pairs of dumbbells. Steel and ABS construction.', price: 12999, imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80', category: 'Sports & Fitness', stock: 15 },
  { name: 'Premium Yoga Mat 6mm', description: 'Non-slip TPE yoga mat with alignment lines, carrying strap, and sweat-resistant surface. Suitable for all styles.', price: 3999, imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80', category: 'Sports & Fitness', stock: 40 },
  { name: 'Resistance Bands Set (5 Levels)', description: 'Set of 5 latex resistance bands from extra-light to heavy. Ideal for strength training, rehab, and stretching.', price: 2499, imageUrl: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=600&q=80', category: 'Sports & Fitness', stock: 60 },
  { name: 'Trail Running Shoes', description: 'Lightweight trail runners with Vibram outsole, Gore-Tex waterproofing, and responsive foam midsole.', price: 9999, imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80', category: 'Sports & Fitness', stock: 25 },
  { name: 'Speed Jump Rope', description: 'Aluminium handle speed rope with ball-bearing swivel, adjustable 3m cable, and carry pouch.', price: 1999, imageUrl: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=600&q=80', category: 'Sports & Fitness', stock: 80 },

  // Beauty & Personal Care (25–29)
  { name: 'Sonic Face Cleansing Brush', description: 'Waterproof sonic brush with 3 cleansing modes, 2-minute timer, and USB wireless charging. Removes 6× more makeup than hands.', price: 5999, imageUrl: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=600&q=80', category: 'Beauty & Personal Care', stock: 30 },
  { name: 'Vitamin C Brightening Serum 30ml', description: '20% Vitamin C with hyaluronic acid and Vitamin E. Brightens dull skin, fades dark spots, and boosts collagen overnight.', price: 2999, imageUrl: 'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=600&q=80', category: 'Beauty & Personal Care', stock: 50 },
  { name: 'SPF 50 Daily Moisturiser 50ml', description: 'Lightweight daily moisturiser with broad-spectrum UVA/UVB protection. Non-greasy, fragrance-free, and suitable for all skin types.', price: 1999, imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80', category: 'Beauty & Personal Care', stock: 70 },
  { name: 'Professional Hair Dryer 2200W', description: 'Ionic hair dryer with DC motor, 3 heat settings, 2 speeds, cool shot, and concentrator nozzle. Reduces frizz and drying time.', price: 8999, imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80', category: 'Beauty & Personal Care', stock: 20 },
  { name: 'Bamboo Toothbrush Set of 4', description: 'Biodegradable bamboo handles with BPA-free medium bristles. Compostable packaging. Dentist-recommended softness.', price: 999, imageUrl: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=600&q=80', category: 'Beauty & Personal Care', stock: 100 },

  // Toys & Games (30–34)
  { name: 'LEGO Classic Creative Bricks 1500pcs', description: '1,500-piece classic brick set in 33 colours. Includes baseplate, wheels, doors, and windows for open-ended building.', price: 5999, imageUrl: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&q=80', category: 'Toys & Games', stock: 25 },
  { name: 'Strategy Board Game — Settlers Edition', description: '3–4 player resource-management and negotiation game. 60-minute average playtime. Ages 10+.', price: 3499, imageUrl: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=600&q=80', category: 'Toys & Games', stock: 40 },
  { name: 'Remote Control Racing Car 1:16', description: '2.4GHz RC car with 25km/h top speed, all-terrain suspension, rechargeable battery, and 50m range.', price: 4999, imageUrl: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=600&q=80', category: 'Toys & Games', stock: 30 },
  { name: 'Kids Science Experiment Kit', description: '30 STEM experiments in one box: volcano, slime, circuits, and more. Includes all materials and illustrated guide. Ages 6–12.', price: 2999, imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80', category: 'Toys & Games', stock: 35 },
  { name: 'Plush Animal Collection (Set of 5)', description: 'Set of 5 ultra-soft stuffed animals — lion, elephant, giraffe, panda, and fox. Machine washable. Suitable from birth.', price: 2499, imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', category: 'Toys & Games', stock: 50 },

  // Garden & Outdoor (35–39)
  { name: '5-Piece Stainless Steel Garden Tool Set', description: 'Trowel, transplanter, cultivator, weeder, and rake with ergonomic rubber-grip handles and hanging holes.', price: 3999, imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80', category: 'Garden & Outdoor', stock: 20 },
  { name: 'Solar Path Lights 12-Pack', description: 'Warm-white LED solar stake lights. Auto on at dusk, IP65 waterproof, 8-hour runtime. No wiring needed.', price: 2999, imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&q=80', category: 'Garden & Outdoor', stock: 35 },
  { name: 'Cedar Raised Garden Bed 120×60cm', description: 'FSC-certified cedar planter with open base for drainage. Pre-drilled, tool-free assembly. Treated for 10+ years outdoors.', price: 8999, imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80', category: 'Garden & Outdoor', stock: 10 },
  { name: 'Automatic Drip Irrigation Timer', description: 'LCD timer with 1–240 min cycles, hose splitter for 2 zones, and rain-delay mode. Fits standard 3/4" faucets.', price: 4499, imageUrl: 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=600&q=80', category: 'Garden & Outdoor', stock: 18 },
  { name: 'Folding Camping Chair Set of 2', description: 'Powder-coated steel frame, breathable mesh back, cup holder, and carry bag. 120kg weight limit per chair.', price: 5999, imageUrl: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&q=80', category: 'Garden & Outdoor', stock: 15 },

  // Office & Stationery (40–44)
  { name: 'Ergonomic Mesh Office Chair', description: 'Adjustable lumbar support, 4D armrests, breathable mesh back, and 120° recline. 150kg rated. 5-year warranty.', price: 29999, imageUrl: 'https://images.unsplash.com/photo-1505843513577-22bb7d21e455?w=600&q=80', category: 'Office & Stationery', stock: 8 },
  { name: 'A4 Laser Printer', description: 'Monochrome laser printer, 30ppm, Wi-Fi, duplex printing, and 250-sheet tray. Low cost per page at 0.8p.', price: 19999, imageUrl: 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=600&q=80', category: 'Office & Stationery', stock: 12 },
  { name: 'Fountain Pen Gift Set', description: 'Brass fountain pen with medium nib, 10 ink cartridges in 5 colours, leather case, and gift box.', price: 4999, imageUrl: 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=600&q=80', category: 'Office & Stationery', stock: 25 },
  { name: 'Bamboo Desk Organiser', description: 'Six-compartment bamboo desk caddy for pens, scissors, and office supplies. Anti-scratch base. Natural finish.', price: 2999, imageUrl: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&q=80', category: 'Office & Stationery', stock: 40 },
  { name: 'Wireless Keyboard & Mouse Combo', description: '2.4GHz wireless combo with full-size keyboard, silent optical mouse, single USB nano receiver, and 24-month battery life.', price: 5999, imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80', category: 'Office & Stationery', stock: 30 },

  // Food & Grocery (45–49)
  { name: 'Single-Origin Coffee Beans 1kg', description: 'Medium-roast Arabica beans sourced from Ethiopian Yirgacheffe. Tasting notes of blueberry, jasmine, and dark chocolate.', price: 2999, imageUrl: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&q=80', category: 'Food & Grocery', stock: 50 },
  { name: 'Manuka Honey MGO 400+ 250g', description: 'Certified New Zealand Manuka honey with MGO 400+ potency. Raw, unpasteurised, traceable to single hive.', price: 3999, imageUrl: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=600&q=80', category: 'Food & Grocery', stock: 30 },
  { name: 'Premium Mixed Nuts & Seeds 1kg', description: 'Dry-roasted almonds, cashews, walnuts, pumpkin seeds, and sunflower seeds. No added salt, oil, or preservatives.', price: 1999, imageUrl: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=600&q=80', category: 'Food & Grocery', stock: 60 },
  { name: 'Extra Virgin Olive Oil 1L', description: 'Cold-pressed Greek EVOO, harvested from century-old Koroneiki trees. Acidity < 0.3%. Protected designation of origin.', price: 1499, imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&q=80', category: 'Food & Grocery', stock: 80 },
  { name: 'Dark Chocolate 85% Cacao 12-Bar Box', description: 'Single-origin Ecuadorian dark chocolate bars, 85% cacao. Fairtrade certified, minimal ingredients, intense flavour.', price: 2499, imageUrl: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=600&q=80', category: 'Food & Grocery', stock: 45 },
];

const CATEGORIES = [
  {
    name: 'Electronics',
    description: 'Latest gadgets, devices, and tech accessories',
    imageUrl: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&q=80',
    slug: 'electronics',
  },
  {
    name: 'Clothing',
    description: 'Fashion, footwear, and accessories for every style',
    imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&q=80',
    slug: 'clothing',
  },
  {
    name: 'Books',
    description: 'Bestsellers, textbooks, and timeless classics',
    imageUrl: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600&q=80',
    slug: 'books',
  },
  {
    name: 'Home & Kitchen',
    description: 'Everything for your home, from decor to cookware',
    imageUrl: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&q=80',
    slug: 'home-kitchen',
  },
  {
    name: 'Sports & Fitness',
    description: 'Equipment and apparel for every sport and fitness level',
    imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80',
    slug: 'sports-fitness',
  },
  {
    name: 'Beauty & Personal Care',
    description: 'Skincare, haircare, and wellness essentials',
    imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80',
    slug: 'beauty-personal-care',
  },
  {
    name: 'Toys & Games',
    description: 'Fun for all ages — from building sets to board games',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
    slug: 'toys-games',
  },
  {
    name: 'Garden & Outdoor',
    description: 'Tools, furniture, and lighting for gardens and outdoor spaces',
    imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80',
    slug: 'garden-outdoor',
  },
  {
    name: 'Office & Stationery',
    description: 'Furniture, supplies, and tech for productive workspaces',
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80',
    slug: 'office-stationery',
  },
  {
    name: 'Food & Grocery',
    description: 'Artisan, organic, and specialty food from around the world',
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80',
    slug: 'food-grocery',
  },
];

const ADMIN    = { name: 'Admin',            email: 'admin@cartverse.com',    password: 'Admin@1234',    role: 'admin'    as const };
const CUSTOMER = { name: 'Demo Customer',    email: 'customer@cartverse.com', password: 'Customer@1234', role: 'customer' as const };

// ── Main ───────────────────────────────────────────────────────────────────────

async function seed() {
  const uri = process.env.MONGO_URI ?? 'mongodb://localhost:27017/cartverse';
  console.log('Connecting to MongoDB…');
  await connect(uri);
  console.log('Connected.');

  // 1. Categories — wipe and re-create
  await CategoryModel.deleteMany({});
  await CategoryModel.insertMany(CATEGORIES);
  console.log(`✓ Seeded ${CATEGORIES.length} categories`);

  // 2. Products — wipe and re-create
  await ProductModel.deleteMany({});
  const products = await ProductModel.insertMany(PRODUCTS);
  console.log(`✓ Seeded ${products.length} products`);

  // 3. Users — upsert by email so existing tokens stay valid
  const [adminUser, customerUser] = await Promise.all([
    upsertUser(ADMIN),
    upsertUser(CUSTOMER),
  ]);
  console.log(`✓ Upserted users: ${ADMIN.email}, ${CUSTOMER.email}`);

  // 4. Orders for customer — wipe and re-create
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
        { productId: products[20]._id, name: products[20].name, priceAtOrder: products[20].price, quantity: 1 },
      ],
      subtotal: products[10].price + products[20].price,
      total:    products[10].price + products[20].price,
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
