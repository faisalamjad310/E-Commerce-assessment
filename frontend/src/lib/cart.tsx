import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';
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

export interface ProductInfo {
  name: string;
  price: number;
  imageUrl: string;
}

interface CartContextValue {
  items: CartItem[];
  orderTotal: number;
  itemCount: number;
  loading: boolean;
  refreshCart: () => Promise<void>;
  addItem: (productId: string, quantity: number, productInfo?: ProductInfo) => Promise<void>;
  updateItem: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearLocalCart: () => void;
}

const GUEST_CART_KEY = 'guestCart';

function loadGuestCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function saveGuestCart(items: CartItem[]) {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
}

function sumTotal(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.lineTotal, 0);
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [orderTotal, setOrderTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const prevToken = useRef<string | null>(token);

  const loadServerCart = useCallback(async () => {
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

  const refreshCart = useCallback(async () => {
    if (!token) {
      const guestItems = loadGuestCart();
      setItems(guestItems);
      setOrderTotal(sumTotal(guestItems));
      return;
    }
    await loadServerCart();
  }, [token, loadServerCart]);

  useEffect(() => {
    const justLoggedIn = prevToken.current === null && token !== null;
    prevToken.current = token;

    if (!token) {
      const guestItems = loadGuestCart();
      setItems(guestItems);
      setOrderTotal(sumTotal(guestItems));
      return;
    }

    if (!justLoggedIn) {
      loadServerCart();
      return;
    }

    // User just logged in — merge any guest cart items into the server cart
    const guestItems = loadGuestCart();
    if (guestItems.length === 0) {
      loadServerCart();
      return;
    }

    setLoading(true);
    Promise.allSettled(
      guestItems.map(item =>
        api.post('/api/cart/items', { productId: item.productId, quantity: item.quantity })
      )
    ).then(() => {
      localStorage.removeItem(GUEST_CART_KEY);
    }).finally(() => {
      loadServerCart();
    });
  }, [token, loadServerCart]);

  const addItem = useCallback(async (
    productId: string,
    quantity: number,
    productInfo?: ProductInfo,
  ) => {
    if (!token) {
      const current = loadGuestCart();
      const idx = current.findIndex(i => i.productId === productId);
      if (idx >= 0) {
        current[idx].quantity += quantity;
        current[idx].lineTotal = current[idx].price * current[idx].quantity;
      } else if (productInfo) {
        current.push({
          productId,
          name: productInfo.name,
          price: productInfo.price,
          imageUrl: productInfo.imageUrl,
          quantity,
          lineTotal: productInfo.price * quantity,
        });
      }
      saveGuestCart(current);
      setItems([...current]);
      setOrderTotal(sumTotal(current));
      return;
    }
    await api.post('/api/cart/items', { productId, quantity });
    await refreshCart();
  }, [token, refreshCart]);

  const updateItem = useCallback(async (productId: string, quantity: number) => {
    if (!token) {
      const current = loadGuestCart();
      const idx = current.findIndex(i => i.productId === productId);
      if (idx >= 0) {
        if (quantity <= 0) {
          current.splice(idx, 1);
        } else {
          current[idx].quantity = quantity;
          current[idx].lineTotal = current[idx].price * quantity;
        }
      }
      saveGuestCart(current);
      setItems([...current]);
      setOrderTotal(sumTotal(current));
      return;
    }
    await api.patch(`/api/cart/items/${productId}`, { quantity });
    await refreshCart();
  }, [token, refreshCart]);

  const removeItem = useCallback(async (productId: string) => {
    if (!token) {
      const current = loadGuestCart().filter(i => i.productId !== productId);
      saveGuestCart(current);
      setItems([...current]);
      setOrderTotal(sumTotal(current));
      return;
    }
    await api.delete(`/api/cart/items/${productId}`);
    await refreshCart();
  }, [token, refreshCart]);

  const clearLocalCart = useCallback(() => {
    setItems([]);
    setOrderTotal(0);
    if (!token) {
      localStorage.removeItem(GUEST_CART_KEY);
    }
  }, [token]);

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
