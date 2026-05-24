import { useState, useEffect, useCallback } from 'react';
import { CATEGORIES, type Dish, type Order, type OrderItem } from '../types';
import { api } from '../api';
import { v4 as uuid } from 'uuid';
import DishCard from '../components/DishCard';
import CartDrawer from '../components/CartDrawer';
import styles from './UserMenuPage.module.css';

interface CartItem {
  dishId: string;
  quantity: number;
}

interface Props {
  onGoBack: () => void;
  onViewOrders: () => void;
}

export default function UserMenuPage({ onGoBack, onViewOrders }: Props) {
  const [category, setCategory] = useState('');
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [note, setNote] = useState('');

  useEffect(() => {
    api.getDishes().then(setDishes).catch(() => {});
  }, []);

  const filtered = category ? dishes.filter(d => d.category === category) : dishes;
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const updateCart = useCallback((items: CartItem[]) => {
    setCart(items);
  }, []);

  const handleSubmitOrder = async () => {
    if (cart.length === 0) return;
    const cartItems = cart
      .map(item => ({ item, dish: dishes.find(d => d.id === item.dishId) }))
      .filter((x): x is typeof x & { dish: Dish } => !!x.dish);

    const items: OrderItem[] = cartItems.map(({ item, dish }) => ({
      dishId: item.dishId,
      name: dish.name,
      price: dish.price,
      quantity: item.quantity,
    }));

    const order: Order = {
      id: uuid(),
      items,
      totalPrice: cartItems.reduce((s, { item, dish }) => s + dish.price * item.quantity, 0),
      status: 'pending',
      note,
      createdAt: Date.now(),
    };

    try {
      await api.createOrder(order);
      setCart([]);
      setNote('');
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setShowCart(false);
      }, 2000);
    } catch {
      alert('提交失败，请重试');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onGoBack}>← 切换</button>
        <h1 className={styles.title}>🐻 一二布布 · 点餐</h1>
      </div>

      <div className={styles.categories}>
        <button
          className={`${styles.catBtn} ${!category ? styles.catActive : ''}`}
          onClick={() => setCategory('')}
        >全部</button>
        {CATEGORIES.map(c => (
          <button
            key={c}
            className={`${styles.catBtn} ${category === c ? styles.catActive : ''}`}
            onClick={() => setCategory(category === c ? '' : c)}
          >{c}</button>
        ))}
      </div>

      <div className={styles.grid}>
        {filtered.map(dish => (
          <DishCard key={dish.id} dish={dish} cart={cart} onCartChange={updateCart} />
        ))}
        {filtered.length === 0 && (
          <div className={styles.empty}>布布还在准备食材呢~ 🐻</div>
        )}
      </div>

      {totalCount > 0 && !showCart && (
        <div className={styles.fab} onClick={() => setShowCart(true)}>
          <span className={styles.fabIcon}>🛒</span>
          <span className={styles.fabBadge}>{totalCount}</span>
        </div>
      )}

      {showCart && (
        <CartDrawer
          cart={cart}
          dishes={dishes}
          note={note}
          showSuccess={showSuccess}
          onCartChange={updateCart}
          onNoteChange={setNote}
          onSubmit={handleSubmitOrder}
          onClose={() => setShowCart(false)}
        />
      )}

      <nav className={styles.bottomNav}>
        <span className={`${styles.navTab} ${styles.navActive}`}>
          <span className={styles.navIcon}>🍽️</span>
          <span className={styles.navLabel}>点餐</span>
        </span>
        <button className={styles.navTab} onClick={onViewOrders}>
          <span className={styles.navIcon}>📋</span>
          <span className={styles.navLabel}>我的订单</span>
        </button>
      </nav>
    </div>
  );
}
