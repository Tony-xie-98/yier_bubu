import { useState } from 'react';
import RoleSelect from './pages/RoleSelect';
import UserMenuPage from './pages/UserMenuPage';
import UserOrdersPage from './pages/UserOrdersPage';
import ChefDashboard from './pages/ChefDashboard';
import ChefDishesPage from './pages/ChefDishesPage';

type Role = 'user' | 'chef' | null;
type UserPage = 'menu' | 'orders';
type ChefPage = 'dashboard' | 'dishes';

function getSavedRole(): Role {
  try {
    const r = localStorage.getItem('family-order-role');
    if (r === 'user' || r === 'chef') return r;
  } catch { /* */ }
  return null;
}

export default function App() {
  const [role, setRole] = useState<Role>(getSavedRole);
  const [userPage, setUserPage] = useState<UserPage>('menu');
  const [chefPage, setChefPage] = useState<ChefPage>('dashboard');

  const handleSelectRole = (r: 'user' | 'chef') => {
    localStorage.setItem('family-order-role', r);
    setRole(r);
  };

  const handleGoBack = () => {
    localStorage.removeItem('family-order-role');
    setRole(null);
  };

  if (!role) {
    return <RoleSelect onSelect={handleSelectRole} />;
  }

  if (role === 'user') {
    if (userPage === 'orders') {
      return <UserOrdersPage onGoBack={() => setUserPage('menu')} />;
    }
    return (
      <UserMenuPage
        onGoBack={handleGoBack}
        onViewOrders={() => setUserPage('orders')}
      />
    );
  }

  // Chef
  if (chefPage === 'dishes') {
    return <ChefDishesPage onGoBack={() => setChefPage('dashboard')} />;
  }
  return (
    <ChefDashboard
      onGoBack={handleGoBack}
      onManageDishes={() => setChefPage('dishes')}
    />
  );
}
