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
