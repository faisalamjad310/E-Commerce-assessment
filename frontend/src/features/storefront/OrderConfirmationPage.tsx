import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, Package, ArrowRight, Home } from 'lucide-react';
import { ordersApi, STATUS_COLOR, STATUS_LABEL } from '../../api/orders';
import { formatPrice } from '../../api/products';

export default function OrderConfirmationPage() {
  const { orderId } = useParams<{ orderId: string }>();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => ordersApi.getOrder(orderId!),
    enabled: !!orderId,
  });

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 animate-fade-in">
      {/* Success header */}
      <div className="text-center mb-10">
        <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Order Confirmed!</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Thank you for your order. We'll notify you when it ships.
        </p>
        {order && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 font-mono">
            Order #{order._id.slice(-8).toUpperCase()}
          </p>
        )}
      </div>

      {isLoading ? (
        <div className="theme-card rounded-2xl p-6 animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-4 bg-gray-100 dark:bg-white/10 rounded-full" />
          ))}
        </div>
      ) : order ? (
        <div className="theme-card rounded-2xl overflow-hidden">
          {/* Items */}
          <div className="p-5 border-b border-gray-100 dark:border-white/10">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Package className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              Items Ordered
            </h2>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.name}</p>
                    <p className="text-xs text-gray-400">
                      {formatPrice(item.priceAtOrder)} × {item.quantity}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {formatPrice(item.priceAtOrder * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Meta grid */}
          <div className="p-5 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Status</p>
              <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLOR[order.status]}`}>
                {STATUS_LABEL[order.status]}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Total Paid</p>
              <p className="text-lg font-bold gradient-text">{formatPrice(order.total)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Ship to</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{order.shippingAddress.name}</p>
              <p className="text-xs text-gray-400">{order.shippingAddress.address}, {order.shippingAddress.city}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Payment ref</p>
              <p className="text-xs font-mono text-gray-500 dark:text-gray-400 break-all">{order.paymentRef}</p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 mt-8">
        <Link
          to="/orders"
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/8 transition-colors"
        >
          <Package className="w-4 h-4" />
          View All Orders
        </Link>
        <Link
          to="/"
          className="flex-1 btn-gradient flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white"
        >
          <Home className="w-4 h-4" />
          Continue Shopping
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
