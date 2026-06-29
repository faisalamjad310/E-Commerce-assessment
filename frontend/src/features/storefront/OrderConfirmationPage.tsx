import { Link, useParams, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, Package, ArrowRight, Home, Mail, Phone } from 'lucide-react';
import { ordersApi, STATUS_COLOR, STATUS_LABEL } from '../../api/orders';
import { formatPrice } from '../../api/products';
import { useAuth } from '../../lib/auth';

interface GuestConfirmState {
  orderId: string;
  paymentRef: string;
  shippingAddress: { name: string; address: string; city: string };
  guestContact: { email: string; phone: string };
}

export default function OrderConfirmationPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { user } = useAuth();
  const location = useLocation();

  const isGuest = !user || orderId === 'guest';
  const guestState = location.state as GuestConfirmState | null;

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => ordersApi.getOrder(orderId!),
    enabled: !isGuest && !!orderId,
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
        {guestState?.orderId && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 font-mono">
            Order #{guestState.orderId.slice(-8).toUpperCase()}
          </p>
        )}
        {order && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 font-mono">
            Order #{order._id.slice(-8).toUpperCase()}
          </p>
        )}
      </div>

      {/* Guest with no state — direct navigation or page refresh */}
      {isGuest && !guestState ? (
        <div className="theme-card rounded-2xl p-6 text-center space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
            Your order has been placed successfully.
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            A confirmation will be sent to your email. To track your order,{' '}
            <Link to="/signup" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
              create an account
            </Link>.
          </p>
        </div>
      ) : isGuest && guestState ? (
        <div className="theme-card rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-white/10">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Package className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              Order Details
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-400 mb-1">Ship to</p>
                <p className="font-medium text-gray-800 dark:text-gray-200">{guestState.shippingAddress.name}</p>
                <p className="text-xs text-gray-400">
                  {guestState.shippingAddress.address}, {guestState.shippingAddress.city}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Payment ref</p>
                <p className="text-xs font-mono text-gray-500 dark:text-gray-400 break-all">
                  {guestState.paymentRef}
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Confirmation to</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{guestState.guestContact.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Contact</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{guestState.guestContact.phone}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="p-5 bg-indigo-50 dark:bg-indigo-500/10">
            <p className="text-xs text-indigo-700 dark:text-indigo-300">
              Want to track your order?{' '}
              <Link to="/signup" className="font-semibold hover:underline">
                Create an account
              </Link>{' '}
              to save your order history.
            </p>
          </div>
        </div>
      ) : isLoading ? (
        <div className="theme-card rounded-2xl p-6 animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-4 bg-gray-100 dark:bg-white/10 rounded-full" />
          ))}
        </div>
      ) : isError ? (
        <div className="theme-card rounded-2xl p-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Could not load order details.{' '}
            <Link to="/orders" className="text-indigo-600 dark:text-indigo-400 hover:underline">
              View your orders
            </Link>
            .
          </p>
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
        {!isGuest && (
          <Link
            to="/orders"
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/8 transition-colors"
          >
            <Package className="w-4 h-4" />
            View All Orders
          </Link>
        )}
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
