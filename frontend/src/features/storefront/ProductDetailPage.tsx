import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ShoppingCart, Package, Plus, Minus, CheckCircle } from 'lucide-react';
import { productsApi, formatPrice } from '../../api/products';
import { useCart } from '../../lib/cart';
import { useAuth } from '../../lib/auth';
import RecommendedProducts from '../../components/RecommendedProducts';

function DetailSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 animate-pulse">
      <div className="h-4 w-28 bg-gray-100 dark:bg-white/10 rounded-full mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="aspect-square bg-gray-100 dark:bg-white/10 rounded-2xl" />
        <div className="space-y-4 pt-2">
          <div className="h-5 bg-gray-100 dark:bg-white/10 rounded-full w-1/4" />
          <div className="h-8 bg-gray-100 dark:bg-white/10 rounded-full w-3/4" />
          <div className="h-7 bg-gray-100 dark:bg-white/10 rounded-full w-1/3" />
          <div className="space-y-2 pt-2">
            <div className="h-3.5 bg-gray-100 dark:bg-white/10 rounded-full" />
            <div className="h-3.5 bg-gray-100 dark:bg-white/10 rounded-full w-5/6" />
            <div className="h-3.5 bg-gray-100 dark:bg-white/10 rounded-full w-4/5" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem } = useCart();

  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.getOne(id!),
    enabled: !!id,
  });

  async function handleAddToCart() {
    if (!user) {
      navigate('/login', { state: { from: `/product/${id}` } });
      return;
    }
    try {
      setAdding(true);
      setCartError(null);
      await addItem(product!._id, qty);
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to add to cart. Try again.';
      setCartError(msg);
    } finally {
      setAdding(false);
    }
  }

  if (isLoading) return <DetailSkeleton />;

  if (isError || !product) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">Product not found.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to catalog
        </Link>
      </div>
    );
  }

  const maxQty = Math.min(product.stock, 10);
  const outOfStock = product.stock === 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to catalog
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14">
        {/* Product image */}
        <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-white/5 border border-gray-100 dark:border-white/10">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={e => {
              (e.target as HTMLImageElement).src =
                'https://placehold.co/600x600/e0e7ff/6366f1?text=No+Image';
            }}
          />
        </div>

        {/* Product info */}
        <div className="flex flex-col">
          <span className="inline-flex self-start px-3 py-1 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-semibold rounded-full mb-3">
            {product.category}
          </span>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-tight mb-3">
            {product.name}
          </h1>

          <div className="text-3xl font-extrabold gradient-text mb-5">
            {formatPrice(product.price)}
          </div>

          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6 flex-1">
            {product.description}
          </p>

          <div className="flex items-center gap-2 mb-6">
            <Package className="w-4 h-4 text-gray-400 shrink-0" />
            {outOfStock ? (
              <span className="text-sm font-medium text-red-500">Out of stock</span>
            ) : product.stock <= 5 ? (
              <span className="text-sm font-medium text-amber-500 dark:text-amber-400">
                Only {product.stock} left in stock — order soon
              </span>
            ) : (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                In stock ({product.stock} available)
              </span>
            )}
          </div>

          {outOfStock ? (
            <button
              disabled
              className="w-full py-3.5 rounded-xl font-semibold text-sm bg-gray-100 dark:bg-white/10 text-gray-400 dark:text-gray-500 cursor-not-allowed"
            >
              Out of Stock
            </button>
          ) : (
            <>
              <div className="flex items-stretch gap-3 mb-3">
                <div className="flex items-center border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden shrink-0">
                  <button
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    disabled={qty <= 1}
                    className="px-3 py-3 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/10 disabled:opacity-40 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center text-sm font-semibold text-gray-900 dark:text-white select-none">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty(q => Math.min(maxQty, q + 1))}
                    disabled={qty >= maxQty}
                    className="px-3 py-3 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/10 disabled:opacity-40 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={adding}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm shadow-sm transition-all ${
                    added
                      ? 'bg-green-500 text-white scale-[0.98]'
                      : 'btn-gradient text-white'
                  }`}
                >
                  {added ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Added to Cart!
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      {adding ? 'Adding…' : 'Add to Cart'}
                    </>
                  )}
                </button>
              </div>

              {cartError && (
                <p className="text-sm text-red-500 dark:text-red-400">{cartError}</p>
              )}
            </>
          )}
        </div>
      </div>

      <RecommendedProducts excludeProductId={id!} />
    </div>
  );
}
