import api from '../lib/api';

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: string;
  name: string;
  priceAtOrder: number; // cents
  quantity: number;
}

export interface ShippingAddress {
  name: string;
  address: string;
  city: string;
}

export interface Order {
  _id: string;
  userId: string;
  items: OrderItem[];
  subtotal: number; // cents
  total: number;    // cents
  status: OrderStatus;
  paymentRef: string;
  shippingAddress: ShippingAddress;
  createdAt: string;
}

export interface CheckoutPayload {
  shippingAddress: ShippingAddress;
}

export interface CheckoutResult {
  orderId: string;
  paymentRef: string;
}

export interface AdminOrder {
  _id: string;
  userId: { _id: string; name: string; email: string } | null;
  items: OrderItem[];
  subtotal: number;
  total: number;
  status: OrderStatus;
  paymentRef: string;
  shippingAddress: ShippingAddress;
  createdAt: string;
}

export interface AdminOrdersResponse {
  items: AdminOrder[];
  total: number;
  page: number;
  totalPages: number;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  orderCountByStatus: Partial<Record<OrderStatus, number>>;
  topProducts: { _id: string; totalSold: number }[];
}

export const adminOrdersApi = {
  getAll: (params?: { status?: OrderStatus; page?: number; limit?: number }) =>
    api.get<AdminOrdersResponse>('/api/admin/orders', { params }).then((r) => r.data),

  updateStatus: (id: string, status: OrderStatus) =>
    api.patch<AdminOrder>(`/api/admin/orders/${id}/status`, { status }).then((r) => r.data),

  getDashboard: () =>
    api.get<DashboardStats>('/api/admin/dashboard').then((r) => r.data),
};

export const ordersApi = {
  checkout: (payload: CheckoutPayload) =>
    api.post<CheckoutResult>('/api/payments/checkout', payload).then(r => r.data),

  getMyOrders: () =>
    api.get<Order[]>('/api/orders').then(r => r.data),

  getOrder: (id: string) =>
    api.get<Order>(`/api/orders/${id}`).then(r => r.data),
};

export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const STATUS_COLOR: Record<OrderStatus, string> = {
  pending:    'bg-amber-100  text-amber-700  dark:bg-amber-900/30  dark:text-amber-400',
  processing: 'bg-blue-100   text-blue-700   dark:bg-blue-900/30   dark:text-blue-400',
  shipped:    'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  delivered:  'bg-green-100  text-green-700  dark:bg-green-900/30  dark:text-green-400',
  cancelled:  'bg-red-100    text-red-700    dark:bg-red-900/30    dark:text-red-400',
};
