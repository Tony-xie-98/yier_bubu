import type { Dish, Order } from '../types';

const BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const api = {
  // Orders
  getOrders: () => request<Order[]>('/orders'),
  createOrder: (order: Order) => request<{ success: boolean }>('/orders', {
    method: 'POST',
    body: JSON.stringify(order),
  }),
  updateOrderStatus: (id: string, status: 'pending' | 'completed') =>
    request<{ success: boolean }>(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  // Dishes
  getDishes: () => request<Dish[]>('/dishes'),
  addDish: (dish: Dish) => request<{ success: boolean }>('/dishes', {
    method: 'POST',
    body: JSON.stringify(dish),
  }),
  updateDish: (dish: Dish) => request<{ success: boolean }>(`/dishes/${dish.id}`, {
    method: 'PUT',
    body: JSON.stringify(dish),
  }),
  deleteDish: (id: string) => request<{ success: boolean }>(`/dishes/${id}`, {
    method: 'DELETE',
  }),

  // Settings
  getSettings: () => request<{ pushToken?: string }>('/orders/settings'),
  updatePushToken: (pushToken: string) => request<{ success: boolean }>('/orders/settings', {
    method: 'PUT',
    body: JSON.stringify({ pushToken }),
  }),
};
