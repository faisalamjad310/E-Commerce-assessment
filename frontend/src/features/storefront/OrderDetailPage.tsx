import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Package, MapPin, CreditCard } from 'lucide-react';
import { ordersApi, STATUS_COLOR, STATUS_LABEL, type OrderStatus } from '../../api/orders';
import { formatPrice } from '../../api/products';

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const TIMELINE_STEPS: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered'];

function StatusTimeline({ status }: { status: OrderStatus }) {
  if (status === 'cancelled') {
    return (
      <div className="px-3 py-2 rounded-xl bg-red-50 dark:bg-red-500/15 text-red-600 dark:text-red-400 text-sm font-medium inline-flex">
        Order Cancelled
      </div>
    );
  }
  const currentIdx = TIMELINE_STEPS.indexOf(status);
  return (
    <div className="flex items-start gap-1 overflow-x-auto pb-1">
      {TIMELINE_STEPS.map((s, i) => (
        <div key={s} className="flex items-center flex-1 min-w-0">
          <div className="flex flex-col items-center shrink-0">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              i <= currentIdx
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 dark:bg-white/10 text-gray-400 dark:text-gray-500'
            }`}>
              {i < currentIdx ? '✓' : i + 1}
            </div>
            <p className={`text-[10px] mt-1 text-center whitespace-nowrap ${
              i <= currentIdx ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-gray-400'
            }`}>
              {STATUS_LABEL[s]}
            </p>
          </div>
          {i < TIMELINE_STEPS.length - 1 && (
            <div className={`flex-1 h-px mt-[-14px] mx-1 ${i < currentIdx ? 'bg-indigo-400' : 'bg-gray-200 dark:bg-white/15'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersApi.getOrder(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 animate-pulse space-y-4">
        <div className="h-4 w-28 bg-gray-100 dark:bg-white/10 rounded-full" />
        <div className="h-8 w-56 bg-gray-100 dark:bg-white/10 rounded-full" />
        <div className="h-40 bg-gray-100 dark:bg-white/10 rounded-2xl" />
        <div className="h-32 bg-gray-100 dark:bg-white/10 rounded-2xl" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 dark:text-gray-400 mb-4">Order not found or access denied.</p>
        <Link to="/orders" className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm">
          ← Back to orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <Link
        to="/orders"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to orders
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Order #{order._id.slice(-8).toUpperCase()}
          </h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
            Placed {formatDate(order.createdAt)}
          </p>
        </div>
        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${STATUS_COLOR[order.status]}`}>
          {STATUS_LABEL[order.status]}
        </span>
      </div>

      {/* Status timeline */}
      <div className="theme-card rounded-2xl p-5 mb-4">
        <StatusTimeline status={order.status} />
      </div>

      {/* Items */}
      <div className="theme-card rounded-2xl overflow-hidden mb-4">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-white/10 flex items-center gap-2">
          <Package className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
            {order.items.length} Item{order.items.length !== 1 ? 's' : ''}
          </h2>
        </div>
        <div className="divide-y divide-gray-50 dark:divide-white/8">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-3.5">
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.name}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  {formatPrice(item.priceAtOrder)} × {item.quantity}
                </p>
              </div>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {formatPrice(item.priceAtOrder * item.quantity)}
              </span>
            </div>
          ))}
        </div>
        <div className="px-5 py-4 bg-gray-50 dark:bg-white/5 space-y-1.5">
          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>Subtotal</span><span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>Shipping</span>
            <span className="text-green-600 dark:text-green-400 font-medium">Free</span>
          </div>
          <div className="flex justify-between font-bold text-gray-900 dark:text-white pt-1.5 border-t border-gray-200 dark:border-white/10">
            <span>Total</span>
            <span className="gradient-text">{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Shipping + Payment */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="theme-card rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Shipping Address</h3>
          </div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{order.shippingAddress.name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{order.shippingAddress.address}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{order.shippingAddress.city}</p>
        </div>
        <div className="theme-card rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Payment</h3>
          </div>
          <p className="text-xs text-gray-400 mb-1">Reference</p>
          <p className="text-sm font-mono text-gray-600 dark:text-gray-400 break-all">{order.paymentRef}</p>
        </div>
      </div>
    </div>
  );
}
