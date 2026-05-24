import { useState, useEffect, useCallback } from 'react';
import type { Order } from '../types';
import { api } from '../api';
import { useSSE } from '../hooks/useSSE';
import OrderCard from '../components/OrderCard';
import styles from './ChefDashboard.module.css';

interface Props {
  onGoBack: () => void;
  onManageDishes: () => void;
}

export default function ChefDashboard({ onGoBack, onManageDishes }: Props) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('pending');
  const [newOrderId, setNewOrderId] = useState<string | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [pushToken, setPushToken] = useState('');
  const [tokenSaved, setTokenSaved] = useState(false);
  const [testResult, setTestResult] = useState('');

  const fetchOrders = useCallback(() => {
    api.getOrders().then(setOrders).catch(() => {});
  }, []);

  useEffect(() => {
    fetchOrders();
    api.getSettings().then(s => {
      if (s.pushToken) setPushToken(s.pushToken);
    }).catch(() => {});
  }, [fetchOrders]);

  const saveToken = async () => {
    await api.updatePushToken(pushToken.trim());
    setTokenSaved(true);
    setTimeout(() => setTokenSaved(false), 2000);
  };

  const testPush = async () => {
    setTestResult('⏳');
    try {
      const res = await fetch('/api/orders/test-push', { method: 'POST' });
      const data = await res.json();
      setTestResult(data.ok ? '✅ ' + data.msg : '❌ ' + data.msg);
    } catch {
      setTestResult('❌ 网络错误');
    }
    setTimeout(() => setTestResult(''), 5000);
  };

  const handleNewOrder = useCallback((order: Order) => {
    setOrders(prev => {
      if (prev.find(o => o.id === order.id)) return prev;
      return [order, ...prev];
    });
    setNewOrderId(order.id);
    // Play notification sound
    if (audioEnabled) {
      try {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        gain.gain.value = 0.3;
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
        setTimeout(() => {
          const osc2 = ctx.createOscillator();
          osc2.connect(gain);
          osc2.frequency.value = 1100;
          osc2.start();
          osc2.stop(ctx.currentTime + 0.15);
        }, 150);
      } catch { /* audio not supported */ }
    }
    setTimeout(() => setNewOrderId(null), 3000);
  }, [audioEnabled]);

  const handleOrderUpdate = useCallback((updated: Order) => {
    setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
  }, []);

  useSSE(handleNewOrder, handleOrderUpdate);

  const handleToggleStatus = async (id: string, status: 'pending' | 'completed') => {
    await api.updateOrderStatus(id, status);
    fetchOrders();
  };

  const filtered = filter === 'all'
    ? orders
    : orders.filter(o => o.status === filter);

  const pendingCount = orders.filter(o => o.status === 'pending').length;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onGoBack}>← 切换</button>
        <h1 className={styles.title}>🐻 布布的厨房</h1>
        <button
          className={`${styles.soundBtn} ${audioEnabled ? styles.soundOn : ''}`}
          onClick={() => setAudioEnabled(!audioEnabled)}
        >
          {audioEnabled ? '🔔' : '🔕'}
        </button>
        <button className={styles.soundBtn} onClick={() => setShowSettings(true)}>
          ⚙️
        </button>
      </div>

      {pendingCount > 0 && (
        <div className={styles.alert}>
          🍳 {pendingCount} 个订单等待布布做菜~
        </div>
      )}

      <div className={styles.filters}>
        {(['pending', 'completed', 'all'] as const).map(key => (
          <button
            key={key}
            className={`${styles.filterBtn} ${filter === key ? styles.filterActive : ''}`}
            onClick={() => setFilter(key)}
          >
            {{ pending: `做菜中 (${orders.filter(o => o.status === 'pending').length})`, completed: '已完成', all: '全部' }[key]}
          </button>
        ))}
      </div>

      <div className={styles.list}>
        {filtered.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🍳</div>
            <div>暂时没有订单~</div>
            <div className={styles.emptySub}>等一二来点餐吧！</div>
          </div>
        ) : (
          filtered.map(order => (
            <div
              key={order.id}
              className={`${styles.orderWrap} ${order.id === newOrderId ? styles.newOrder : ''}`}
            >
              <OrderCard order={order} onToggleStatus={handleToggleStatus} />
            </div>
          ))
        )}
      </div>

      <nav className={styles.bottomNav}>
        <span className={`${styles.navTab} ${styles.navActive}`}>
          <span className={styles.navIcon}>📋</span>
          <span className={styles.navLabel}>
            订单{badgeText(pendingCount)}
          </span>
        </span>
        <button className={styles.navTab} onClick={onManageDishes}>
          <span className={styles.navIcon}>🍯</span>
          <span className={styles.navLabel}>菜品管理</span>
        </button>
      </nav>

      {showSettings && (
        <div className={styles.settingsOverlay} onClick={() => setShowSettings(false)}>
          <div className={styles.settingsModal} onClick={e => e.stopPropagation()}>
            <div className={styles.settingsHeader}>
              <span>🔔 微信推送设置</span>
              <button className={styles.settingsClose} onClick={() => setShowSettings(false)}>✕</button>
            </div>
            <div className={styles.settingsBody}>
              <p className={styles.settingsHelp}>
                1. 微信搜索「<b>pushplus</b>」公众号并关注<br/>
                2. 回复「<b>token</b>」获取你的推送码<br/>
                3. 粘贴到下方即可收到订单通知
              </p>
              <input
                className={styles.settingsInput}
                placeholder="粘贴 PushPlus Token"
                value={pushToken}
                onChange={e => setPushToken(e.target.value)}
              />
              <button className={styles.settingsSave} onClick={saveToken}>
                {tokenSaved ? '✅ 已保存' : '保存'}
              </button>
              <button className={styles.settingsTest} onClick={testPush}>
                📤 测试推送
              </button>
              {testResult && <div className={styles.testResult}>{testResult}</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function badgeText(n: number) {
  return n > 0 ? ` (${n})` : '';
}
