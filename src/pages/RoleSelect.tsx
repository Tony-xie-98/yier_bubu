import styles from './RoleSelect.module.css';

interface Props {
  onSelect: (role: 'user' | 'chef') => void;
}

export default function RoleSelect({ onSelect }: Props) {
  return (
    <div className={styles.page}>
      <div className={styles.brand}>
        <div className={styles.logo}>🐻🐼</div>
        <h1 className={styles.title}>一二布布 · 家庭点餐</h1>
        <p className={styles.subtitle}>选择你的身份</p>
      </div>
      <div className={styles.cards}>
        <button className={styles.card} onClick={() => onSelect('user')}>
          <div className={styles.cardEmoji}>🐼</div>
          <div className={styles.cardTitle}>我是食客</div>
          <div className={styles.cardDesc}>一二来点餐啦~</div>
        </button>
        <button className={`${styles.card} ${styles.chefCard}`} onClick={() => onSelect('chef')}>
          <div className={styles.cardEmoji}>🐻</div>
          <div className={styles.cardTitle}>我是大厨</div>
          <div className={styles.cardDesc}>布布来做饭啦~</div>
        </button>
      </div>
    </div>
  );
}
