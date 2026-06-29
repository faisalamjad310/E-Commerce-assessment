import React, { useRef, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  ShoppingBag,
  Search,
  CreditCard,
  Package,
  Star,
  Truck,
  ShieldCheck,
  RefreshCw,
  Zap,
  ChevronDown,
} from 'lucide-react';
import { categoriesApi, type Category } from '../../api/categories';
import { productsApi } from '../../api/products';
import ProductCard from '../../components/ProductCard';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

// ── Scroll-reveal wrapper ─────────────────────────────────────────────────────
function AnimSection({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, isVisible } = useIntersectionObserver();
  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      } ${className}`}
    >
      {children}
    </div>
  );
}

// ── Constants ─────────────────────────────────────────────────────────────────
const HERO_IMG =
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900&q=80';

const STATS = [
  { icon: Package, value: '500+', label: 'Products' },
  { icon: Zap, value: 'Fast', label: 'Delivery' },
  { icon: ShieldCheck, value: 'Secure', label: 'Payments' },
  { icon: RefreshCw, value: '30-Day', label: 'Returns' },
];

const HOW_STEPS = [
  {
    step: '01',
    icon: Search,
    title: 'Browse Products',
    desc: 'Explore hundreds of curated products across all categories. Filter by price, sort by newest.',
    color: 'from-indigo-500 to-violet-500',
    glow: 'group-hover:shadow-indigo-500/30',
  },
  {
    step: '02',
    icon: ShoppingBag,
    title: 'Add to Cart',
    desc: 'Pick your favourites and add them to your persistent cart. Your cart is saved across sessions.',
    color: 'from-violet-500 to-purple-500',
    glow: 'group-hover:shadow-violet-500/30',
  },
  {
    step: '03',
    icon: CreditCard,
    title: 'Checkout Securely',
    desc: 'Sign in and pay safely through our encrypted checkout. Real-time stock checks protect your order.',
    color: 'from-purple-500 to-pink-500',
    glow: 'group-hover:shadow-purple-500/30',
  },
  {
    step: '04',
    icon: Package,
    title: 'Get Delivered',
    desc: 'Sit back and track your order. Full order history and status updates every step of the way.',
    color: 'from-pink-500 to-rose-500',
    glow: 'group-hover:shadow-pink-500/30',
  },
];

// ── Main Component ────────────────────────────────────────────────────────────
export default function LandingPage() {
  const categoriesRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();

  const { data: categories = [], isLoading: catsLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.list,
  });

  const { data: featuredData, isLoading: productsLoading } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => productsApi.catalog({ sortBy: 'newest', limit: 8 }),
  });

  function scrollToCategories() {
    categoriesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  function handleCategoryClick(name: string) {
    navigate(`/shop?category=${encodeURIComponent(name)}`);
  }

  return (
    <div className="overflow-x-hidden">
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[calc(100vh-64px)] flex items-center overflow-hidden">
        {/* Animated blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-3xl animate-blob-1" />
          <div className="absolute top-1/4 -right-32 w-[400px] h-[400px] rounded-full bg-violet-600/15 blur-3xl animate-blob-2" />
          <div className="absolute -bottom-32 left-1/3 w-[350px] h-[350px] rounded-full bg-cyan-600/10 blur-3xl animate-blob-3" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 w-full py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left — Text */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-6 animate-fade-in">
                <Star className="w-3 h-3 fill-current" />
                New arrivals every week
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 animate-fade-in-up">
                <span className="text-gray-900 dark:text-white">Shop</span>{' '}
                <span className="gradient-text">Smarter,</span>
                <br />
                <span className="text-gray-900 dark:text-white">Live</span>{' '}
                <span className="gradient-text">Better.</span>
              </h1>

              <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0 animate-fade-in-up delay-100">
                Discover thousands of curated products across electronics, fashion, books, and home essentials — all in one beautiful store.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start animate-fade-in-up delay-200">
                <Link
                  to="/shop"
                  className="btn-gradient inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-white font-semibold text-base shadow-lg"
                >
                  Shop Now
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={scrollToCategories}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border border-gray-300 dark:border-white/20 text-gray-700 dark:text-white font-semibold text-base hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
                >
                  Browse Categories
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              {/* Trust signals */}
              <div className="flex items-center gap-6 justify-center lg:justify-start mt-10 animate-fade-in-up delay-300">
                <div className="flex -space-x-2">
                  {['A', 'B', 'C', 'D'].map((l) => (
                    <div
                      key={l}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 border-2 border-gray-900 flex items-center justify-center text-white text-[10px] font-bold"
                    >
                      {l}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500 text-gray-500 mt-0.5">
                    Trusted by 2,000+ customers
                  </p>
                </div>
              </div>
            </div>

            {/* Right — Hero image */}
            <div className="relative flex justify-center lg:justify-end animate-fade-in-up delay-150">
              <div className="relative w-full max-w-md">
                {/* Glow behind image */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/30 to-violet-500/30 blur-3xl rounded-3xl transform scale-95" />

                {/* Main image */}
                <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-indigo-900/40 transform rotate-1 hover:rotate-0 transition-transform duration-500">
                  <img
                    src={HERO_IMG}
                    alt="Shop the latest trends"
                    className="w-full h-[420px] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent" />
                </div>

                {/* Floating card — top left */}
                <div className="absolute -left-6 top-8 bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-3 flex items-center gap-2.5 animate-blob-1 border border-gray-100 dark:border-white/10">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                    <Truck className="w-4 h-4 text-indigo-500" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-gray-900 dark:text-white">Free Shipping</p>
                    <p className="text-[10px] text-gray-500">Orders over $50</p>
                  </div>
                </div>

                {/* Floating card — bottom right */}
                <div className="absolute -right-6 bottom-10 bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-3 flex items-center gap-2.5 animate-blob-2 border border-gray-100 dark:border-white/10">
                  <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-gray-900 dark:text-white">Secure Payment</p>
                    <p className="text-[10px] text-gray-500">256-bit encryption</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ────────────────────────────────────────────────────── */}
      <section className="bg-white dark:bg-gray-900 border-y border-gray-200 dark:border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {STATS.map(({ icon: Icon, value, label }, i) => (
              <div key={label} className={`flex flex-col sm:flex-row items-center justify-center gap-3 px-4 ${i > 0 ? 'sm:border-l border-gray-200 dark:border-white/10' : ''}`}>
                <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-xl font-extrabold text-gray-900 dark:text-white">{value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ───────────────────────────────────────────────────── */}
      <section
        ref={categoriesRef as React.RefObject<HTMLElement>}
        className="py-24 bg-gray-50 dark:bg-[#0d0f20]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <AnimSection className="text-center mb-14">
            <span className="inline-block px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-widest mb-4">
              What we offer
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
              Shop by <span className="gradient-text">Category</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-md mx-auto">
              Browse our hand-picked selection across every category. Something for everyone.
            </p>
          </AnimSection>

          {catsLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-60 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12 text-gray-400 dark:text-gray-500">No categories yet.</div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((cat, i) => (
                <AnimSection key={cat._id} delay={i * 80}>
                  <CategoryCard category={cat} onClick={() => handleCategoryClick(cat.name)} />
                </AnimSection>
              ))}
            </div>
          )}

          <AnimSection className="text-center mt-12">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-indigo-200 dark:border-indigo-500/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 font-semibold transition-all text-sm"
            >
              View all products <ArrowRight className="w-4 h-4" />
            </Link>
          </AnimSection>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ────────────────────────────────────────────── */}
      <section className="py-24 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <AnimSection className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/20 text-violet-600 dark:text-violet-400 text-xs font-semibold uppercase tracking-widest mb-4">
                Just dropped
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900 dark:text-white">
                Trending <span className="gradient-text">Now</span>
              </h2>
            </div>
            <Link
              to="/shop"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-indigo-200 dark:border-indigo-500/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-sm font-semibold transition-all shrink-0"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </AnimSection>

          {productsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse h-64" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {featuredData?.items.map((product, i) => (
                <AnimSection key={product._id} delay={i * 60}>
                  <ProductCard product={product} />
                </AnimSection>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── HOW TO BUY ───────────────────────────────────────────────────── */}
      <section className="py-24 bg-gray-50 dark:bg-[#0d0f20] border-t border-gray-100 dark:border-white/5 relative overflow-hidden">
        {/* Decorative glow — subtle in light, visible in dark */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-indigo-400/5 dark:bg-indigo-600/8 blur-3xl rounded-full" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-violet-400/5 dark:bg-violet-600/6 blur-3xl rounded-full" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <AnimSection className="text-center mb-16">
            <span className="inline-block px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-widest mb-4">
              Simple process
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
              How to <span className="gradient-text">Buy</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-md mx-auto">
              Get from discovery to delivery in four easy steps.
            </p>
          </AnimSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_STEPS.map(({ step, icon: Icon, title, desc, color, glow }, i) => (
              <AnimSection key={step} delay={i * 100}>
                <div className={`group relative bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:border-indigo-300 dark:hover:border-indigo-500/60 hover:shadow-xl dark:hover:shadow-2xl ${glow} transition-all duration-300 hover:-translate-y-1.5 h-full`}>
                  {/* Step badge */}
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 flex items-center justify-center text-[11px] font-bold text-gray-500 dark:text-gray-300 shadow-sm">
                    {step}
                  </div>

                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-5 shadow-lg shadow-black/10 dark:shadow-black/30`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  <h3 className="font-bold text-gray-900 dark:text-white text-base mb-2.5">{title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{desc}</p>
                </div>
              </AnimSection>
            ))}
          </div>

          <AnimSection className="text-center mt-14">
            <Link
              to="/shop"
              className="btn-gradient inline-flex items-center gap-2 px-9 py-4 rounded-xl text-white font-semibold shadow-lg shadow-indigo-500/20 dark:shadow-indigo-900/40 text-base"
            >
              Start Shopping <ArrowRight className="w-5 h-5" />
            </Link>
          </AnimSection>
        </div>
      </section>
    </div>
  );
}

// ── Category Card ─────────────────────────────────────────────────────────────
function CategoryCard({ category, onClick }: { category: Category; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group relative w-full h-60 rounded-2xl overflow-hidden border border-gray-700 hover:border-indigo-500/70 hover:shadow-2xl hover:shadow-indigo-900/40 hover:-translate-y-2 transition-all duration-400 text-left"
    >
      {/* Background image */}
      <img
        src={category.imageUrl}
        alt={category.name}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-600"
        onError={e => {
          (e.target as HTMLImageElement).src =
            'https://placehold.co/600x400/1e1b4b/6366f1?text=' + encodeURIComponent(category.name);
        }}
      />

      {/* Gradient overlay — always strong from bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/50 to-gray-950/10 group-hover:via-indigo-950/60 group-hover:to-transparent transition-all duration-400" />

      {/* Top-right glow dot */}
      <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg shadow-indigo-500/50" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <h3 className="font-extrabold text-white text-lg mb-1 drop-shadow-lg">{category.name}</h3>
        {category.description && (
          <p className="text-xs text-gray-300 line-clamp-1 mb-2">{category.description}</p>
        )}
        <div className="flex items-center gap-1.5 text-indigo-300 group-hover:text-indigo-200 transition-colors text-xs font-semibold">
          <span>Shop now</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </button>
  );
}
