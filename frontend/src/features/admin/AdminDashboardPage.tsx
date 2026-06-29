import { useQuery } from '@tanstack/react-query';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { TrendingUp, ShoppingBag, Clock, Package } from 'lucide-react';
import { adminOrdersApi, STATUS_LABEL, type OrderStatus } from '../../api/orders';
import { formatPrice } from '../../api/products';
import { useTheme } from '../../lib/theme';

const STATUS_CHART_FILL: Record<OrderStatus, string> = {
  pending:    '#f59e0b',
  processing: '#3b82f6',
  shipped:    '#6366f1',
  delivered:  '#22c55e',
  cancelled:  '#ef4444',
};

const ALL_STATUSES: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  color: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { isDark } = useTheme();
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: adminOrdersApi.getDashboard,
  });

  const gridColor  = isDark ? '#374151' : '#f3f4f6';
  const tickColor  = isDark ? '#9ca3af' : '#6b7280';
  const tooltipBg  = isDark ? '#1f2937' : '#ffffff';
  const tooltipBorder = isDark ? '#374151' : '#e5e7eb';

  const statusData = ALL_STATUSES.map((s) => ({
    name: STATUS_LABEL[s],
    count: stats?.orderCountByStatus[s] ?? 0,
    fill: STATUS_CHART_FILL[s],
  }));

  const topProductsData = (stats?.topProducts ?? []).map((p) => ({
    name: p._id.length > 22 ? p._id.slice(0, 22) + '…' : p._id,
    sold: p.totalSold,
  }));

  const pending = stats?.orderCountByStatus.pending ?? 0;

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Dashboard</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {isLoading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 animate-pulse">
              <div className="h-3 w-24 bg-gray-100 dark:bg-gray-800 rounded-full mb-3" />
              <div className="h-7 w-20 bg-gray-100 dark:bg-gray-800 rounded-full" />
            </div>
          ))
        ) : (
          <>
            <StatCard
              icon={TrendingUp}
              label="Total Revenue"
              value={formatPrice(stats?.totalRevenue ?? 0)}
              sub="Excludes cancelled orders"
              color="bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400"
            />
            <StatCard
              icon={ShoppingBag}
              label="Total Orders"
              value={String(stats?.totalOrders ?? 0)}
              color="bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
            />
            <StatCard
              icon={Clock}
              label="Pending Orders"
              value={String(pending)}
              sub={pending > 0 ? 'Needs attention' : 'All caught up'}
              color="bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400"
            />
          </>
        )}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders by Status */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Orders by Status</h2>
          {isLoading ? (
            <div className="h-52 bg-gray-50 dark:bg-gray-800 rounded-xl animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={statusData} barCategoryGap="35%">
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: tickColor }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: tickColor }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value) => [value, 'Orders']}
                  contentStyle={{
                    borderRadius: '12px',
                    border: `1px solid ${tooltipBorder}`,
                    fontSize: '12px',
                    backgroundColor: tooltipBg,
                    color: isDark ? '#f3f4f6' : '#111827',
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-4 h-4 text-indigo-500" />
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Top 5 Products by Units Sold</h2>
          </div>
          {isLoading ? (
            <div className="h-52 bg-gray-50 dark:bg-gray-800 rounded-xl animate-pulse" />
          ) : topProductsData.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-sm text-gray-400 dark:text-gray-500">
              No sales data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart layout="vertical" data={topProductsData} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridColor} />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: tickColor }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={130}
                  tick={{ fontSize: 11, fill: tickColor }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value) => [value, 'Units Sold']}
                  contentStyle={{
                    borderRadius: '12px',
                    border: `1px solid ${tooltipBorder}`,
                    fontSize: '12px',
                    backgroundColor: tooltipBg,
                    color: isDark ? '#f3f4f6' : '#111827',
                  }}
                />
                <Bar dataKey="sold" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
