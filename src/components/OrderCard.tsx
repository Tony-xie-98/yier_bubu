import type { Order } from '../types';
import styles from './OrderCard.module.css';

interface Props {
  order: Order;
  onToggleStatus: (id: string, status: 'pending' | 'completed') => void;
}

export default function OrderCard({ order, onToggleStatus }: Props) {
  const time = new Date(order.createdAt).toLocaleString('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.time}>{time}</span>
        <span
          className={`${styles.status} ${order.status === 'completed' ? styles.completed : styles.pending}`}
          onClick={() => onToggleStatus(order.id, order.status === 'pending' ? 'completed' : 'pending')}
        >
          {order.status === 'pending' ? '🐻 布布做菜中...' : '🐼 一二吃光啦！'}
        </span>
      </div>
      <div className={styles.items}>
        {order.items.map((item, i) => (
          <div key={i} className={styles.item}>
            <span className={styles.itemName}>{item.name}</span>
            <span className={styles.itemQty}>×{item.quantity}</span>
            <span className={styles.itemPrice}>¥{item.price * item.quantity}</span>
          </div>
        ))}
      </div>
      {order.note && <div className={styles.note}>备注：{order.note}</div>}
      <div className={styles.total}>
        <span>合计</span>
        <span className={styles.totalPrice}>¥{order.totalPrice}</span>
      </div>
    </div>
  );
}
