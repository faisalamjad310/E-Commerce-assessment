import { Link } from 'react-router-dom';
import { ShoppingBag, Heart, Eye } from 'lucide-react';
import type { Product } from '../api/products';
import { formatPrice } from '../api/products';
import { useWishlist } from '../lib/wishlist';

interface Props {
  product: Product;
}

function getProductBadge(product: Product): 'new' | 'hot' | null {
  if (product.stock <= 3) return null;
  let sum = 0;
  for (const ch of product._id) sum += ch.charCodeAt(0);
  if (sum % 5 === 0) return 'hot';
  if (sum % 5 === 1) return 'new';
  return null;
}

export default function ProductCard({ product }: Props) {
  const { toggle, isWishlisted } = useWishlist();
  const wishlisted = isWishlisted(product._id);
  const outOfStock = product.stock === 0;
  const lowStock   = product.stock > 0 && product.stock <= 5;
  const badge = getProductBadge(product);

  return (
    <Link
      to={`/product/${product._id}`}
      className="group block theme-card card-shine neon-ring rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-indigo-200/60 dark:hover:shadow-indigo-950/80 hover:-translate-y-2 transition-all duration-300"
    >
      {/* ── Image ─────────────────────────────────────────── */}
      <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-white/5">
        <img
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={e => {
            (e.target as HTMLImageElement).src =
              'https://placehold.co/400x400/e0e7ff/6366f1?text=No+Image';
          }}
        />

        {/* Out-of-stock overlay */}
        {outOfStock && (
          <div className="absolute inset-0 bg-gray-900/55 flex items-center justify-center">
            <span className="bg-gray-800/90 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
              Out of Stock
            </span>
          </div>
        )}

        {/* Quick-view pill — centre fade on hover */}
        {!outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex items-center gap-1.5 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-indigo-600 dark:text-indigo-400 text-xs font-bold px-4 py-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
              <Eye className="w-3.5 h-3.5" />
              Quick View
            </div>
          </div>
        )}

        {/* Category tag — bottom-left */}
        <span className="absolute bottom-2.5 left-2.5 bg-black/50 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
          {product.category}
        </span>

        {/* Badges — top-right */}
        <div className="absolute top-2.5 right-2.5 flex flex-col items-end gap-1">
          {badge === 'hot' && <span className="badge-hot shadow">🔥 Hot</span>}
          {badge === 'new' && <span className="badge-new shadow">✨ New</span>}
          {lowStock && !outOfStock && !badge && (
            <span className="badge-sale shadow">Low Stock</span>
          )}
        </div>

        {/* Wishlist heart — top-left, always visible when wishlisted, hover to toggle */}
        <button
          onClick={e => { e.preventDefault(); toggle(product._id); }}
          className={`absolute top-2.5 left-2.5 w-7 h-7 rounded-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center hover:scale-110 transition-all duration-300 shadow-sm ${wishlisted ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart className={`w-3.5 h-3.5 transition-colors ${wishlisted ? 'fill-rose-500 text-rose-500' : 'text-gray-400 hover:text-rose-500'}`} />
        </button>
      </div>

      {/* ── Content ───────────────────────────────────────── */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm leading-snug line-clamp-2 mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
          {product.name}
        </h3>

        <div className="flex items-center justify-between">
          <span className="text-lg font-extrabold gradient-text">{formatPrice(product.price)}</span>
          <span
            className={`flex items-center gap-1 text-xs font-medium transition-opacity ${
              outOfStock
                ? 'hidden'
                : 'text-indigo-500 dark:text-indigo-400 opacity-0 group-hover:opacity-100'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Add
          </span>
        </div>

        {lowStock && (
          <p className="text-[11px] text-amber-500 dark:text-amber-400 font-semibold mt-1.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block animate-pulse" />
            Only {product.stock} left!
          </p>
        )}
      </div>
    </Link>
  );
}
