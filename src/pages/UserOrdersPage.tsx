import { useState, useEffect } from 'react';
import type { Order } from '../types';
import { api } from '../api';
import OrderCard from '../components/OrderCard';
import styles from './UserOrdersPage.module.css';

interface Props {
  onGoBack: () => void;
}

export default function UserOrdersPage({ onGoBack }: Props) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const fetchOrders = () => {
    api.getOrders().then(setOrders).catch(() => {});
  };

  useEffect(() => {
    fetchOrders();
    const timer = setInterval(fetchOrders, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleToggleStatus = async (id: string, status: 'pending' | 'completed') => {
    await api.updateOrderStatus(id, status);
    fetchOrders();
  };

  const filtered = filter === 'all'
    ? orders
    : orders.filter(o => o.status === filter);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onGoBack}>← 切换</button>
        <h1 className={styles.title}>🐼 一二的订单</h1>
      </div>

      <div className={styles.filters}>
        {(['all', 'pending', 'completed'] as const).map(key => (
          <button
            key={key}
            className={`${styles.filterBtn} ${filter === key ? styles.filterActive : ''}`}
            onClick={() => setFilter(key)}
          >
            {{ all: '全部', pending: '做菜中', completed: '吃光啦' }[key]}
          </button>
        ))}
      </div>

      <div className={styles.list}>
        {filtered.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🐼</div>
            <div>一二还没有点餐哦~</div>
          </div>
        ) : (
          filtered.map(order => (
            <OrderCard key={order.id} order={order} onToggleStatus={handleToggleStatus} />
          ))
        )}
      </div>

      <nav className={styles.bottomNav}>
        <button className={styles.navTab} onClick={onGoBack}>
          <span className={styles.navIcon}>🍽️</span>
          <span className={styles.navLabel}>点餐</span>
        </button>
        <span className={`${styles.navTab} ${styles.navActive}`}>
          <span className={styles.navIcon}>📋</span>
          <span className={styles.navLabel}>我的订单</span>
        </span>
      </nav>
    </div>
  );
}
