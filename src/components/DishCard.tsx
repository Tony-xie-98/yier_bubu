import type { Dish, CartItem } from '../types';
import styles from './DishCard.module.css';

interface Props {
  dish: Dish;
  cart: CartItem[];
  onCartChange: (cart: CartItem[]) => void;
}

export default function DishCard({ dish, cart, onCartChange }: Props) {
  const cartItem = cart.find(item => item.dishId === dish.id);
  const quantity = cartItem?.quantity || 0;

  const handleAdd = () => {
    const updated = [...cart];
    const existing = updated.find(item => item.dishId === dish.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      updated.push({ dishId: dish.id, quantity: 1 });
    }
    onCartChange(updated);
  };

  const handleRemove = () => {
    const updated = [...cart];
    const idx = updated.findIndex(item => item.dishId === dish.id);
    if (idx === -1) return;
    if (updated[idx].quantity > 1) {
      updated[idx].quantity -= 1;
    } else {
      updated.splice(idx, 1);
    }
    onCartChange(updated);
  };

  return (
    <div className={styles.card}>
      <div className={styles.emoji}>{dish.emoji}</div>
      <div className={styles.name}>{dish.name}</div>
      <div className={styles.desc}>{dish.description}</div>
      <div className={styles.bottom}>
        <span className={styles.price}>¥{dish.price}</span>
        <div className={styles.actions}>
          {quantity > 0 && (
            <>
              <button className={styles.btn} onClick={handleRemove}>−</button>
              <span className={styles.qty}>{quantity}</span>
            </>
          )}
          <button className={styles.btn} onClick={handleAdd}>+</button>
        </div>
      </div>
    </div>
  );
}
