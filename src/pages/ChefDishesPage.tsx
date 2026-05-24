import { useState, useEffect } from 'react';
import type { Dish } from '../types';
import { CATEGORIES } from '../types';
import { api } from '../api';
import DishForm from '../components/DishForm';
import ConfirmDialog from '../components/ConfirmDialog';
import styles from './ChefDishesPage.module.css';

interface Props {
  onGoBack: () => void;
}

export default function ChefDishesPage({ onGoBack }: Props) {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editDish, setEditDish] = useState<Dish | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Dish | null>(null);
  const [filterCategory, setFilterCategory] = useState('');

  const fetchDishes = () => {
    api.getDishes().then(setDishes).catch(() => {});
  };

  useEffect(() => { fetchDishes(); }, []);

  const filtered = filterCategory ? dishes.filter(d => d.category === filterCategory) : dishes;

  const handleSave = async (dish: Dish) => {
    if (editDish) {
      await api.updateDish(dish);
    } else {
      await api.addDish(dish);
    }
    fetchDishes();
    setShowForm(false);
    setEditDish(null);
  };

  const handleDelete = async () => {
    if (deleteTarget) {
      await api.deleteDish(deleteTarget.id);
      fetchDishes();
      setDeleteTarget(null);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onGoBack}>← 看板</button>
        <h1 className={styles.title}>🍯 布布的厨房 · 菜品</h1>
        <button className={styles.addBtn} onClick={() => { setEditDish(null); setShowForm(true); }}>
          + 添加
        </button>
      </div>

      <div className={styles.categories}>
        <button
          className={`${styles.catBtn} ${!filterCategory ? styles.catActive : ''}`}
          onClick={() => setFilterCategory('')}
        >全部</button>
        {CATEGORIES.map(c => (
          <button
            key={c}
            className={`${styles.catBtn} ${filterCategory === c ? styles.catActive : ''}`}
            onClick={() => setFilterCategory(filterCategory === c ? '' : c)}
          >{c}</button>
        ))}
      </div>

      <div className={styles.list}>
        {filtered.map(dish => (
          <div key={dish.id} className={styles.item}>
            <span className={styles.itemEmoji}>{dish.emoji}</span>
            <div className={styles.itemInfo}>
              <div className={styles.itemName}>{dish.name}</div>
              <div className={styles.itemMeta}>
                <span className={styles.itemCategory}>{dish.category}</span>
                <span className={styles.itemPrice}>¥{dish.price}</span>
              </div>
            </div>
            <div className={styles.itemActions}>
              <button className={styles.editBtn} onClick={() => { setEditDish(dish); setShowForm(true); }}>编辑</button>
              <button className={styles.delBtn} onClick={() => setDeleteTarget(dish)}>删除</button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className={styles.empty}>布布的厨房还空着呢~ 🍯</div>
        )}
      </div>

      {showForm && (
        <DishForm
          dish={editDish}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditDish(null); }}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`确定要删除「${deleteTarget.name}」吗？`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <nav className={styles.bottomNav}>
        <span className={styles.navTab} onClick={onGoBack}>
          <span className={styles.navIcon}>📋</span>
          <span className={styles.navLabel}>订单看板</span>
        </span>
        <span className={`${styles.navTab} ${styles.navActive}`}>
          <span className={styles.navIcon}>🍯</span>
          <span className={styles.navLabel}>菜品管理</span>
        </span>
      </nav>
    </div>
  );
}
