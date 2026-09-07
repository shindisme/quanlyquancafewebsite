import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from 'react';

export interface CartItem {
  cartItemId: string;
  productId: string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
  sizeId?: string;
  sizeName?: string;
  extraPrice: number;
  note?: string;
  toppings: { toppingId: string; name: string; price: number; }[];
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'cartItemId'>) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  updateNote: (cartItemId: string, note: string) => void;
  clearCart: () => void;
  totalPrice: number;
  totalCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const TTL_MS = 4 * 60 * 60 * 1000; // 4h

function getDeviceId(): string {
  let id = localStorage.getItem('cafe_device_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('cafe_device_id', id);
  }
  return id;
}

function getStorageKey(tableCode: string): string {
  return `cafe_cart_${tableCode}_${getDeviceId()}`;
}

function loadCart(tableCode: string): CartItem[] {
  try {
    const raw = localStorage.getItem(getStorageKey(tableCode));
    if (!raw) return [];
    const { items, createdAt } = JSON.parse(raw);
    if (Date.now() - createdAt > TTL_MS) {
      localStorage.removeItem(getStorageKey(tableCode));
      return [];
    }
    return items || [];
  } catch {
    return [];
  }
}

function saveCart(tableCode: string, items: CartItem[]) {
  const key = getStorageKey(tableCode);
  if (items.length === 0) {
    localStorage.removeItem(key);
    return;
  }
  const existing = localStorage.getItem(key);
  let createdAt = Date.now();
  if (existing) {
    try { createdAt = JSON.parse(existing).createdAt || createdAt; } catch { /* empty */ }
  }
  localStorage.setItem(key, JSON.stringify({ items, createdAt }));
}

interface Props { tableCode: string; children: ReactNode; }

export const CartProvider = ({ tableCode, children }: Props) => {
  const [items, setItems] = useState<CartItem[]>(() => loadCart(tableCode));

  useEffect(() => { saveCart(tableCode, items); }, [tableCode, items]);

  const addItem = (item: Omit<CartItem, 'cartItemId'>) => {
    setItems((prev) => [...prev, { ...item, cartItemId: crypto.randomUUID() }]);
  };

  const removeItem = (cartItemId: string) => {
    setItems((prev) => prev.filter(i => i.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setItems((prev) => prev.map(i => {
      if (i.cartItemId === cartItemId) {
        const q = i.quantity + delta;
        return { ...i, quantity: q > 0 ? q : 1 };
      }
      return i;
    }));
  };

  const updateNote = (cartItemId: string, note: string) => {
    setItems((prev) => prev.map(i => i.cartItemId === cartItemId ? { ...i, note } : i));
  };

  const clearCart = () => setItems([]);

  const totalPrice = useMemo(() => items.reduce((t, i) => {
    const toppingTotal = i.toppings.reduce((s, tp) => s + tp.price, 0);
    return t + (i.price + i.extraPrice + toppingTotal) * i.quantity;
  }, 0), [items]);

  const totalCount = useMemo(() => items.reduce((t, i) => t + i.quantity, 0), [items]);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, updateNote, clearCart, totalPrice, totalCount }}>
      {children}
    </CartContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
