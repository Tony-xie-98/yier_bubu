import { useState, useEffect, useCallback } from 'react';
import type { Order } from '../types';

const STORAGE_KEY = 'family-order-orders';

function loadOrders(): Order[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>(loadOrders);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  }, [orders]);

  const addOrder = useCallback((order: Order) => {
    setOrders(prev => [order, ...prev]);
  }, []);

  const updateOrderStatus = useCallback((id: string, status: 'pending' | 'completed') => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  }, []);

  return { orders, addOrder, updateOrderStatus };
}
