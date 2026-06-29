import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQueries } from '@tanstack/react-query';
import { Heart, ShoppingCart, X, ArrowRight, CheckCircle } from 'lucide-react';
import { useWishlist } from '../../lib/wishlist';
import { useCart } from '../../lib/cart';
import { productsApi, formatPrice } from '../../api/products';
import type { Product } from '../../api/products';

interface WishlistCardProps {
  product: Product;
  onRemove: (id: string) => void;
  onAddToCart: (id: string, qty: number, meta: { name: string; price: number; imageUrl: string }) => Promise<void>;
}

function WishlistCard({ product, onRemove, onAddToCart }: WishlistCardProps) {
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  async function handleAdd() {
    setAdding(true);
    try {
      await onAddToCart(product._id, 1, {
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
      });
      setAdded(true);
      setTimeout(() => setAdded(false), 2200);
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="group theme-card card-shine neon-ring rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-indigo-200/60 dark:hover:shadow-indigo-950/80 hover:-translate-y-1.5 transition-all duration-300">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-white/5">
        <Link to={`/product/${product._id}`}>
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={e => {
              (e.target as HTMLImageElement).src =
                'https://placehold.co/400x400/e0e7ff/6366f1?text=No+Image';
            }}
          />
        </Link>

        {product.stock === 0 && (
          <div className="absolute inset-0 bg-gray-900/55 flex items-center justify-center">
            <span className="bg-gray-800/90 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
              Out of Stock
            </span>
          </div>
        )}

        {/* Remove button */}
        <button
          onClick={() => onRemove(product._id)}
          className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm flex items-center justify-center text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/20 transition-all shadow-sm"
          aria-label="Remove from wishlist"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Category */}
        <span className="absolute bottom-2.5 left-2.5 bg-black/50 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
          {product.category}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        <Link to={`/product/${product._id}`}>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm leading-snug line-clamp-2 mb-1.5 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-lg font-extrabold gradient-text mb-3">{formatPrice(product.price)}</p>

        <button
          onClick={handleAdd}
          disabled={adding || product.stock === 0}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            added
              ? 'bg-green-500 text-white'
              : product.stock === 0
              ? 'bg-gray-100 dark:bg-white/10 text-gray-400 cursor-not-allowed'
              : 'btn-gradient text-white'
          }`}
        >
          {added ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Added!
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              {adding ? 'Adding…' : 'Add to Cart'}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function WishlistSkeleton({ count }: { count: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="theme-card rounded-2xl overflow-hidden animate-pulse">
          <div className="aspect-square bg-gray-100 dark:bg-white/8" />
          <div className="p-4 space-y-2.5">
            <div className="h-3.5 bg-gray-100 dark:bg-white/10 rounded-full w-3/4" />
            <div className="h-5 bg-gray-100 dark:bg-white/10 rounded-full w-1/3" />
            <div className="h-9 bg-gray-100 dark:bg-white/10 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function WishlistPage() {
  const { items, toggle } = useWishlist();
  const { addItem } = useCart();

  const productQueries = useQueries({
    queries: items.map(id => ({
      queryKey: ['product', id],
      queryFn: () => productsApi.getOne(id),
      staleTime: 60_000,
    })),
  });

  const isLoading = productQueries.some(q => q.isLoading);
  const products = productQueries
    .map(q => q.data)
    .filter((p): p is Product => p !== undefined);

  if (items.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-24 text-center animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center mx-auto mb-5">
          <Heart className="w-9 h-9 text-rose-300 dark:text-rose-500/60" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Your wishlist is empty
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-xs mx-auto">
          Save items you love by tapping the heart icon on any product.
        </p>
        <Link
          to="/"
          className="btn-gradient inline-flex items-center gap-2 px-7 py-3 text-sm font-semibold text-white rounded-xl"
        >
          Browse Products
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs text-rose-500 font-semibold uppercase tracking-widest mb-1.5">
            Saved for later
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
            Your Wishlist{' '}
            <span className="text-gray-400 dark:text-gray-500 font-normal text-xl">
              ({items.length} item{items.length !== 1 ? 's' : ''})
            </span>
          </h1>
        </div>
        <Link
          to="/"
          className="shrink-0 text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium flex items-center gap-1"
        >
          Continue shopping
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {isLoading ? (
        <WishlistSkeleton count={items.length} />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map(product => (
            <WishlistCard
              key={product._id}
              product={product}
              onRemove={toggle}
              onAddToCart={addItem}
            />
          ))}
        </div>
      )}
    </div>
  );
}
