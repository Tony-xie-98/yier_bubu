import { useState, useEffect } from 'react';
import type { Dish } from '../types';
import { CATEGORIES } from '../types';
import { v4 as uuid } from 'uuid';
import styles from './DishForm.module.css';

interface Props {
  dish?: Dish | null;
  onSave: (dish: Dish) => void;
  onClose: () => void;
}

const defaultDish = (): Dish => ({
  id: uuid(),
  name: '',
  category: CATEGORIES[0],
  price: 0,
  emoji: '🍽️',
  description: '',
});

export default function DishForm({ dish, onSave, onClose }: Props) {
  const [form, setForm] = useState<Dish>(dish || defaultDish());

  useEffect(() => {
    if (dish) setForm(dish);
  }, [dish]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || form.price <= 0) return;
    onSave(form);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <form className={styles.form} onClick={e => e.stopPropagation()} onSubmit={handleSubmit}>
        <div className={styles.header}>
          <span className={styles.title}>{dish ? '编辑菜品' : '添加菜品'}</span>
          <button type="button" className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div className={styles.body}>
          <div className={styles.field}>
            <label className={styles.label}>Emoji 图标</label>
            <input
              className={styles.input}
              value={form.emoji}
              onChange={e => setForm({ ...form, emoji: e.target.value })}
              placeholder="🍽️"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>菜品名称</label>
            <input
              className={styles.input}
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="输入菜品名称"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>分类</label>
            <select
              className={styles.select}
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>价格 (元)</label>
            <input
              className={styles.input}
              type="number"
              value={form.price || ''}
              onChange={e => setForm({ ...form, price: Number(e.target.value) })}
              placeholder="0"
              min="0"
              step="0.01"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>描述</label>
            <input
              className={styles.input}
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="简单描述一下"
            />
          </div>
        </div>
        <button type="submit" className={styles.submitBtn}>保存</button>
      </form>
    </div>
  );
}
