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
        <option key={s} value={s} className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium">
          {STATUS_LABEL[s]}
        </option>
      ))}
    </select>
  );
}

function pageRange(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | '…')[] = [1];

  if (current > 3) pages.push('…');

  const start = Math.max(2, current - 1);
  const end   = Math.min(total - 1, current + 1);
  for (let p = start; p <= end; p++) pages.push(p);

  if (current < total - 2) pages.push('…');
  pages.push(total);

  return pages;
}

function Pagination({
  current,
  total,
  onChange,
}: {
  current: number;
  total: number;
  onChange: (page: number) => void;
}) {
  const btnBase =
    'min-w-[32px] h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-colors';
  const active  = 'bg-indigo-600 text-white shadow-sm';
  const inactive =
    'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200';
  const arrow =
    'p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed';

  return (
    <div className="flex items-center gap-1">
      <button onClick={() => onChange(current - 1)} disabled={current === 1} className={arrow}>
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pageRange(current, total).map((p, i) =>
        p === '…' ? (
          <span key={`ellipsis-${i}`} className="min-w-[32px] h-8 flex items-center justify-center text-xs text-gray-400 dark:text-gray-600">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`${btnBase} ${p === current ? active : inactive}`}
          >
            {p}
          </button>
        )
      )}

      <button onClick={() => onChange(current + 1)} disabled={current === total} className={arrow}>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
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
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Orders</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
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
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 rounded-xl mb-4 text-sm border border-red-100 dark:border-red-900/50">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-400 hover:text-red-600 dark:hover:text-red-300"
          >
            ×
          </button>
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-10 text-center text-gray-400 dark:text-gray-500 text-sm animate-pulse">
            Loading orders…
          </div>
        ) : !data?.items.length ? (
          <div className="p-14 text-center">
            <ShoppingBag className="w-12 h-12 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              {statusFilter ? `No ${STATUS_LABEL[statusFilter].toLowerCase()} orders` : 'No orders yet'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 dark:text-gray-400">Order</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 hidden md:table-cell">
                    Customer
                  </th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                    Items
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-500 dark:text-gray-400">Total</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-500 dark:text-gray-400">Status</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 hidden lg:table-cell">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {data.items.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-mono text-xs font-semibold text-gray-700 dark:text-gray-300">
                        #{order._id.slice(-8).toUpperCase()}
                      </p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {order.userId ? (
                        <>
                          <p className="font-medium text-gray-800 dark:text-gray-200 text-xs">{order.userId.name}</p>
                          <p className="text-gray-400 dark:text-gray-500 text-xs">{order.userId.email}</p>
                        </>
                      ) : (
                        <p className="text-gray-400 dark:text-gray-500 text-xs italic">Deleted user</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center hidden sm:table-cell text-gray-500 dark:text-gray-400 text-xs">
                      {order.items.length}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusSelect order={order} onError={(msg) => setError(msg)} />
                    </td>
                    <td className="px-4 py-3 text-right hidden lg:table-cell text-gray-400 dark:text-gray-500 text-xs">
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
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex-wrap gap-2">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, data.total)} of {data.total} orders
            </p>
            <Pagination current={page} total={data.totalPages} onChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
}
