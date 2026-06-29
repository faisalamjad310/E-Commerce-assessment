import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Package, ChevronRight, ShoppingBag } from 'lucide-react';
import { ordersApi, STATUS_COLOR, STATUS_LABEL } from '../../api/orders';
import { formatPrice } from '../../api/products';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export default function OrderHistoryPage() {
  const { data: orders, isLoading, isError } = useQuery({
    queryKey: ['my-orders'],
    queryFn: ordersApi.getMyOrders,
  });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Orders</h1>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="theme-card rounded-2xl p-4 animate-pulse">
              <div className="flex justify-between">
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-gray-100 dark:bg-white/10 rounded-full" />
                  <div className="h-3 w-20 bg-gray-100 dark:bg-white/10 rounded-full" />
                </div>
                <div className="h-5 w-20 bg-gray-100 dark:bg-white/10 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-12">Failed to load orders.</p>
      ) : !orders?.length ? (
        <div className="text-center py-20">
          <ShoppingBag className="w-14 h-14 text-gray-200 dark:text-white/20 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300 font-medium mb-1">No orders yet</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">Your order history will appear here.</p>
          <Link to="/" className="btn-gradient inline-block px-5 py-2 text-sm font-semibold text-white rounded-xl">
            Shop Now
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <Link
              key={order._id}
              to={`/orders/${order._id}`}
              className="group flex items-center gap-4 theme-card rounded-2xl hover:shadow-md dark:hover:shadow-indigo-950/40 hover:shadow-gray-200 p-4 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/15 flex items-center justify-center shrink-0">
                <Package className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Order #{order._id.slice(-8).toUpperCase()}
                  </p>
                  <span className={`hidden sm:inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLOR[order.status]}`}>
                    {STATUS_LABEL[order.status]}
                  </span>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {formatDate(order.createdAt)} · {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="text-right shrink-0">
                <p className="text-sm font-bold gradient-text">{formatPrice(order.total)}</p>
                <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 mt-1 ml-auto group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
