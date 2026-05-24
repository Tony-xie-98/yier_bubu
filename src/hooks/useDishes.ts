import { useState, useEffect, useCallback } from 'react';
import type { Dish } from '../types';
import { DEFAULT_DISHES } from '../data/defaults';

const STORAGE_KEY = 'family-order-dishes';

function loadDishes(): Dish[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DISHES));
  return DEFAULT_DISHES;
}

export function useDishes() {
  const [dishes, setDishes] = useState<Dish[]>(loadDishes);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dishes));
  }, [dishes]);

  const addDish = useCallback((dish: Dish) => {
    setDishes(prev => [...prev, dish]);
  }, []);

  const updateDish = useCallback((dish: Dish) => {
    setDishes(prev => prev.map(d => d.id === dish.id ? dish : d));
  }, []);

  const deleteDish = useCallback((id: string) => {
    setDishes(prev => prev.filter(d => d.id !== id));
  }, []);

  return { dishes, addDish, updateDish, deleteDish };
}
