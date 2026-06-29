import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import api from './api';
import { useAuth } from './auth';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  lineTotal: number;
}

export interface CartData {
  items: CartItem[];
  orderTotal: number;
}

interface CartContextValue {
  items: CartItem[];
  orderTotal: number;
  itemCount: number;
  loading: boolean;
  refreshCart: () => Promise<void>;
  addItem: (productId: string, quantity: number) => Promise<void>;
  updateItem: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearLocalCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [orderTotal, setOrderTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get<CartData>('/api/cart');
      setItems(data.items ?? []);
      setOrderTotal(data.orderTotal ?? 0);
    } catch {
      setItems([]);
      setOrderTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // Reload cart whenever the auth token changes (login / logout)
  useEffect(() => {
    if (token) {
      refreshCart();
    } else {
      setItems([]);
      setOrderTotal(0);
    }
  }, [token, refreshCart]);

  const addItem = useCallback(async (productId: string, quantity: number) => {
    await api.post('/api/cart/items', { productId, quantity });
    await refreshCart();
  }, [refreshCart]);

  const updateItem = useCallback(async (productId: string, quantity: number) => {
    await api.patch(`/api/cart/items/${productId}`, { quantity });
    await refreshCart();
  }, [refreshCart]);

  const removeItem = useCallback(async (productId: string) => {
    await api.delete(`/api/cart/items/${productId}`);
    await refreshCart();
  }, [refreshCart]);

  const clearLocalCart = useCallback(() => {
    setItems([]);
    setOrderTotal(0);
  }, []);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, orderTotal, itemCount, loading, refreshCart, addItem, updateItem, removeItem, clearLocalCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
