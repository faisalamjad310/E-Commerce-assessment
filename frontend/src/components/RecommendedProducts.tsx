import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, TrendingUp } from 'lucide-react';
import { productsApi, formatPrice, type Product } from '../api/products';
import { useAuth } from '../lib/auth';

function RecommendedCard({ product }: { product: Product }) {
  return (
    <Link
      to={`/product/${product._id}`}
      className="group flex-shrink-0 w-40 sm:w-48 rounded-2xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-900/50 transition-all"
    >
      <div className="aspect-square overflow-hidden bg-gray-50 dark:bg-gray-800">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://placehold.co/200x200/e0e7ff/6366f1?text=?';
          }}
        />
      </div>
      <div className="p-3">
        <p className="text-xs font-medium text-gray-800 dark:text-gray-200 line-clamp-2 leading-snug mb-1.5">
          {product.name}
        </p>
        <p className="text-sm font-bold gradient-text">{formatPrice(product.price)}</p>
        {product.stock === 0 && (
          <p className="text-[10px] text-red-400 mt-0.5">Out of stock</p>
        )}
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="flex-shrink-0 w-40 sm:w-48 rounded-2xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 animate-pulse">
      <div className="aspect-square bg-gray-100 dark:bg-gray-800" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full" />
        <div className="h-3 w-2/3 bg-gray-100 dark:bg-gray-800 rounded-full" />
        <div className="h-4 w-1/2 bg-gray-100 dark:bg-gray-800 rounded-full" />
      </div>
    </div>
  );
}

export default function RecommendedProducts({ excludeProductId }: { excludeProductId: string }) {
  const { user } = useAuth();

  const { data: products, isLoading } = useQuery({
    queryKey: ['recommendations', excludeProductId],
    queryFn: () => productsApi.recommendations(excludeProductId),
    staleTime: 60_000,
  });

  if (!isLoading && !products?.length) return null;

  return (
    <div className="mt-12">
      <div className="flex items-center gap-2 mb-4">
        {user ? (
          <>
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              You might also like
            </h2>
          </>
        ) : (
          <>
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Trending Now</h2>
          </>
        )}
      </div>

      <div className="flex gap-3 overflow-x-auto pb-3 -mx-4 px-4 sm:-mx-6 sm:px-6 scrollbar-thin">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
          : products!.map((p) => <RecommendedCard key={p._id} product={p} />)}
      </div>
    </div>
  );
}
