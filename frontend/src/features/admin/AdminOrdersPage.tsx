import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, ShoppingBag, AlertCircle } from 'lucide-react';
import {
  adminOrdersApi,
  STATUS_LABEL,
  STATUS_COLOR,
  type OrderStatus,
  type AdminOrder,
} from '../../api/orders';
import { formatPrice } from '../../api/products';

const ALL_STATUSES: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const PAGE_SIZE = 15;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function StatusSelect({
  order,
  onError,
}: {
  order: AdminOrder;
  onError: (msg: string) => void;
}) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (status: OrderStatus) => adminOrdersApi.updateStatus(order._id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-orders'] }),
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      onError(msg ?? 'Failed to update status');
    },
  });

  return (
    <select
      value={order.status}
      onChange={(e) => mutation.mutate(e.target.value as OrderStatus)}
      disabled={mutation.isPending}
      className={`text-xs font-semibold rounded-full px-2.5 py-1 border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-60 ${STATUS_COLOR[order.status]}`}
    >
      {ALL_STATUSES.map((s) => (
        <option key={s} value={s} className="bg-white text-gray-700 font-medium">
          {STATUS_LABEL[s]}
        </option>
      ))}
    </select>
  );
}

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<OrderStatus | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', statusFilter, page],
    queryFn: () =>
      adminOrdersApi.getAll({ status: statusFilter, page, limit: PAGE_SIZE }),
  });

  function handleFilterChange(s: OrderStatus | undefined) {
    setStatusFilter(s);
    setPage(1);
    queryClient.removeQueries({ queryKey: ['admin-orders'] });
  }

  const filterTabs: { label: string; value: OrderStatus | undefined }[] = [
    { label: 'All', value: undefined },
    ...ALL_STATUSES.map((s) => ({ label: STATUS_LABEL[s], value: s })),
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {data?.total != null ? `${data.total} orders total` : 'Loading…'}
          </p>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex items-center gap-1 flex-wrap mb-5">
        {filterTabs.map((tab) => (
          <button
            key={tab.label}
            onClick={() => handleFilterChange(tab.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              statusFilter === tab.value
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.label}
            {tab.value && data && statusFilter !== tab.value && null}
          </button>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 text-red-700 rounded-xl mb-4 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-400 hover:text-red-600"
          >
            ×
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-10 text-center text-gray-400 text-sm animate-pulse">
            Loading orders…
          </div>
        ) : !data?.items.length ? (
          <div className="p-14 text-center">
            <ShoppingBag className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">
              {statusFilter ? `No ${STATUS_LABEL[statusFilter].toLowerCase()} orders` : 'No orders yet'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-500">Order</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 hidden md:table-cell">
                    Customer
                  </th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-500 hidden sm:table-cell">
                    Items
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-500">Total</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-500">Status</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-500 hidden lg:table-cell">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.items.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-mono text-xs font-semibold text-gray-700">
                        #{order._id.slice(-8).toUpperCase()}
                      </p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {order.userId ? (
                        <>
                          <p className="font-medium text-gray-800 text-xs">{order.userId.name}</p>
                          <p className="text-gray-400 text-xs">{order.userId.email}</p>
                        </>
                      ) : (
                        <p className="text-gray-400 text-xs italic">Deleted user</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center hidden sm:table-cell text-gray-500 text-xs">
                      {order.items.length}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-700">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusSelect order={order} onError={(msg) => setError(msg)} />
                    </td>
                    <td className="px-4 py-3 text-right hidden lg:table-cell text-gray-400 text-xs">
                      {formatDate(order.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-500">
              Page {data.page} of {data.totalPages} · {data.total} orders
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 1}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page === data.totalPages}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
