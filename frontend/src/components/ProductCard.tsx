import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import type { Product } from '../api/products';
import { formatPrice } from '../api/products';

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const outOfStock = product.stock === 0;
  const lowStock = product.stock > 0 && product.stock <= 5;

  return (
    <Link
      to={`/product/${product._id}`}
      className="group block theme-card rounded-2xl overflow-hidden hover:shadow-xl dark:hover:shadow-indigo-950/60 hover:shadow-gray-200/80 hover:-translate-y-1 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-white/5">
        <img
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={e => {
            (e.target as HTMLImageElement).src =
              'https://placehold.co/400x300/e0e7ff/6366f1?text=No+Image';
          }}
        />
        {outOfStock && (
          <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center">
            <span className="bg-gray-800/90 text-white text-xs font-semibold px-3 py-1 rounded-full">
              Out of Stock
            </span>
          </div>
        )}
        <span className="absolute top-2.5 left-2.5 bg-indigo-500/90 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full">
          {product.category}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm leading-snug line-clamp-2 mb-2.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
          {product.name}
        </h3>

        <div className="flex items-center justify-between">
          <span className="text-lg font-extrabold gradient-text">{formatPrice(product.price)}</span>
          <span className="flex items-center gap-1 text-indigo-500 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-medium">
            <ShoppingBag className="w-3.5 h-3.5" />
            View
          </span>
        </div>

        {lowStock && (
          <p className="text-xs text-amber-500 dark:text-amber-400 font-medium mt-1.5">
            Only {product.stock} left!
          </p>
        )}
      </div>
    </Link>
  );
}
