import { NavLink, useLocation } from 'react-router-dom';
import styles from './BottomNav.module.css';

export default function BottomNav() {
  const location = useLocation();

  const tabs = [
    { path: '/', label: '点餐', icon: '🐻' },
    { path: '/orders', label: '订单', icon: '🐼' },
    { path: '/admin', label: '厨房', icon: '🍯' },
  ];

  return (
    <nav className={styles.nav}>
      {tabs.map(tab => (
        <NavLink
          key={tab.path}
          to={tab.path}
          className={`${styles.tab} ${location.pathname === tab.path ? styles.active : ''}`}
        >
          <span className={styles.icon}>{tab.icon}</span>
          <span className={styles.label}>{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
