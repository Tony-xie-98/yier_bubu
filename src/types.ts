export interface Dish {
  id: string;
  name: string;
  category: string;
  price: number;
  emoji: string;
  description: string;
}

export interface CartItem {
  dishId: string;
  quantity: number;
}

export interface OrderItem {
  dishId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  items: OrderItem[];
  totalPrice: number;
  status: 'pending' | 'completed';
  note: string;
  createdAt: number;
}

export const CATEGORIES = ['热菜', '凉菜', '主食', '汤品', '饮品', '小吃'] as const;
