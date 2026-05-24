import { useCallback } from 'react';
import type { CartItem } from '../types';

export function useCart() {
  const getCart = (): CartItem[] => {
    try {
      const raw = localStorage.getItem('family-order-cart');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const saveCart = (items: CartItem[]) => {
    localStorage.setItem('family-order-cart', JSON.stringify(items));
  };

  const addToCart = useCallback((dishId: string) => {
    const cart = getCart();
    const existing = cart.find(item => item.dishId === dishId);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ dishId, quantity: 1 });
    }
    saveCart(cart);
    return cart;
  }, []);

  const removeFromCart = useCallback((dishId: string) => {
    const cart = getCart();
    const existing = cart.find(item => item.dishId === dishId);
    if (existing && existing.quantity > 1) {
      existing.quantity -= 1;
      saveCart(cart);
      return cart;
    }
    const filtered = cart.filter(item => item.dishId !== dishId);
    saveCart(filtered);
    return filtered;
  }, []);

  const deleteFromCart = useCallback((dishId: string) => {
    const cart = getCart().filter(item => item.dishId !== dishId);
    saveCart(cart);
    return cart;
  }, []);

  const clearCart = useCallback(() => {
    saveCart([]);
    return [];
  }, []);

  return { getCart, addToCart, removeFromCart, deleteFromCart, clearCart };
}
