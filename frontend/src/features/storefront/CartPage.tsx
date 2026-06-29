import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import { useCart } from '../../lib/cart';
import { formatPrice } from '../../api/products';

function CartSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 animate-pulse">
      <div className="h-7 w-40 bg-gray-100 dark:bg-white/10 rounded-full mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="flex gap-4 p-4 theme-card rounded-2xl">
              <div className="w-20 h-20 bg-gray-100 dark:bg-white/10 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-4 bg-gray-100 dark:bg-white/10 rounded-full w-3/4" />
                <div className="h-3 bg-gray-100 dark:bg-white/10 rounded-full w-1/4" />
                <div className="h-4 bg-gray-100 dark:bg-white/10 rounded-full w-1/3 mt-2" />
              </div>
            </div>
          ))}
        </div>
        <div className="h-52 bg-gray-100 dark:bg-white/10 rounded-2xl" />
      </div>
    </div>
  );
}

export default function CartPage() {
  const { items, orderTotal, loading, updateItem, removeItem } = useCart();
  const navigate = useNavigate();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function handleQtyChange(productId: string, newQty: number) {
    setBusyId(productId);
    try {
      await updateItem(productId, newQty);
    } finally {
      setBusyId(null);
    }
  }

  async function handleRemove(productId: string) {
    setBusyId(productId);
    try {
      await removeItem(productId);
    } finally {
      setBusyId(null);
    }
  }

  if (loading && items.length === 0) return <CartSkeleton />;

  if (items.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <ShoppingBag className="w-16 h-16 text-gray-200 dark:text-white/20 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Your cart is empty
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Looks like you haven't added anything yet.
        </p>
        <Link
          to="/"
          className="btn-gradient inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white rounded-xl"
        >
          Browse Products
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Shopping Cart
        <span className="ml-2 text-base font-normal text-gray-400 dark:text-gray-500">
          ({itemCount} item{itemCount !== 1 ? 's' : ''})
        </span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Item list */}
        <div className="lg:col-span-2 space-y-3">
          {items.map(item => {
            const busy = busyId === item.productId;
            return (
              <div
                key={item.productId}
                className={`flex gap-4 p-4 theme-card rounded-2xl transition-opacity ${busy ? 'opacity-60 pointer-events-none' : ''}`}
              >
                <Link to={`/product/${item.productId}`} className="shrink-0">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-xl border border-gray-100 dark:border-white/10"
                    onError={e => {
                      (e.target as HTMLImageElement).src =
                        'https://placehold.co/80x80/e0e7ff/6366f1?text=?';
                    }}
                  />
                </Link>

                <div className="flex-1 min-w-0">
                  <Link
                    to={`/product/${item.productId}`}
                    className="font-medium text-gray-900 dark:text-gray-100 text-sm leading-snug hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-2"
                  >
                    {item.name}
                  </Link>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    {formatPrice(item.price)} each
                  </p>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-gray-200 dark:border-white/10 rounded-lg overflow-hidden">
                      <button
                        onClick={() => handleQtyChange(item.productId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="px-2.5 py-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/10 disabled:opacity-40 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold text-gray-900 dark:text-gray-100 select-none">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQtyChange(item.productId, item.quantity + 1)}
                        className="px-2.5 py-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                        {formatPrice(item.lineTotal)}
                      </span>
                      <button
                        onClick={() => handleRemove(item.productId)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/15 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 theme-card rounded-2xl p-5">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Tag className="w-4 h-4 text-indigo-500" />
              Order Summary
            </h2>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal ({itemCount} item{itemCount !== 1 ? 's' : ''})</span>
                <span>{formatPrice(orderTotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Shipping</span>
                <span className="text-green-600 dark:text-green-400 font-medium">Free</span>
              </div>
              <div className="border-t border-gray-100 dark:border-white/10 pt-2.5 flex justify-between font-bold text-gray-900 dark:text-white text-base">
                <span>Total</span>
                <span className="gradient-text">{formatPrice(orderTotal)}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="mt-5 w-full btn-gradient flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white shadow-sm"
            >
              Proceed to Checkout
              <ArrowRight className="w-4 h-4" />
            </button>

            <Link
              to="/"
              className="mt-3 w-full flex items-center justify-center text-sm text-indigo-600 dark:text-indigo-400 hover:underline py-1"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
