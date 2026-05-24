import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { CartItem } from '../types';

interface CartContextType {
  cart: CartItem[];
  setCart: (items: CartItem[]) => void;
}

const CartContext = createContext<CartContextType>({
  cart: [],
  setCart: () => {},
});

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem('family-order-cart');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const updateCart = useCallback((items: CartItem[]) => {
    localStorage.setItem('family-order-cart', JSON.stringify(items));
    setCart(items);
  }, []);

  return (
    <CartContext.Provider value={{ cart, setCart: updateCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCartContext() {
  return useContext(CartContext);
}
