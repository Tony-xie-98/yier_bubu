import type { Dish, CartItem } from '../types';
import styles from './CartDrawer.module.css';

interface Props {
  cart: CartItem[];
  dishes: Dish[];
  note: string;
  showSuccess: boolean;
  onCartChange: (items: CartItem[]) => void;
  onNoteChange: (note: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}

export default function CartDrawer({
  cart, dishes, note, showSuccess,
  onCartChange, onNoteChange, onSubmit, onClose,
}: Props) {
  const cartItems = cart
    .map(item => {
      const dish = dishes.find(d => d.id === item.dishId);
      return dish ? { ...item, dish } : null;
    })
    .filter(Boolean) as (CartItem & { dish: Dish })[];

  const totalPrice = cartItems.reduce((sum, item) => sum + item.dish.price * item.quantity, 0);

  const handleQuantityChange = (dishId: string, delta: number) => {
    const updated = [...cart];
    const idx = updated.findIndex(item => item.dishId === dishId);
    if (idx === -1) return;
    if (delta > 0) {
      updated[idx].quantity += 1;
    } else if (updated[idx].quantity > 1) {
      updated[idx].quantity -= 1;
    } else {
      updated.splice(idx, 1);
    }
    onCartChange(updated);
  };

  const handleDelete = (dishId: string) => {
    onCartChange(cart.filter(item => item.dishId !== dishId));
  };

  if (showSuccess) {
    return (
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.drawer} onClick={e => e.stopPropagation()}>
          <div className={styles.success}>
            <div className={styles.successIcon}>🐻‍❄️</div>
            <div className={styles.successText}>一二下单成功！</div>
            <div className={styles.successSub}>布布正在准备美味的饭菜~</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.drawer} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <span className={styles.title}>🛒 一二的购物车</span>
          <button className={styles.clearBtn} onClick={() => onCartChange([])}>
            🗑 清空
          </button>
        </div>
        <div className={styles.list}>
          {cartItems.length === 0 ? (
            <div className={styles.empty}>一二还没有选菜呢~ 🐼</div>
          ) : (
            cartItems.map(item => (
              <div key={item.dishId} className={styles.item}>
                <span className={styles.itemEmoji}>{item.dish.emoji}</span>
                <div className={styles.itemInfo}>
                  <div className={styles.itemName}>{item.dish.name}</div>
                  <div className={styles.itemPrice}>¥{item.dish.price}</div>
                </div>
                <div className={styles.quantity}>
                  <button className={styles.qtyBtn} onClick={() => handleQuantityChange(item.dishId, -1)}>−</button>
                  <span className={styles.qtyNum}>{item.quantity}</span>
                  <button className={styles.qtyBtn} onClick={() => handleQuantityChange(item.dishId, 1)}>+</button>
                </div>
                <div className={styles.itemTotal}>¥{item.dish.price * item.quantity}</div>
                <button className={styles.delBtn} onClick={() => handleDelete(item.dishId)}>✕</button>
              </div>
            ))
          )}
        </div>
        {cartItems.length > 0 && (
          <>
            <div className={styles.noteSection}>
              <input
                className={styles.noteInput}
                placeholder="给布布留言（选填）"
                value={note}
                onChange={e => onNoteChange(e.target.value)}
              />
            </div>
            <div className={styles.footer}>
              <div className={styles.total}>
                <span>合计</span>
                <span className={styles.totalPrice}>¥{totalPrice}</span>
              </div>
              <button className={styles.submitBtn} onClick={onSubmit}>
                布布，做饭啦！
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
