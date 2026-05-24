import { Router, type Request, type Response } from 'express';
import { readJSON, writeJSON } from '../store';
import { type Order } from '../../src/types';

const router = Router();

function getOrders(): Order[] {
  return readJSON<Order[]>('orders.json', []);
}

function saveOrders(orders: Order[]) {
  writeJSON('orders.json', orders);
}

function getSettings(): { pushToken?: string } {
  return readJSON<{ pushToken?: string }>('settings.json', {});
}

// SSE clients
const clients = new Set<Response>();

async function sendWxPush(order: Order) {
  const settings = getSettings();
  if (!settings.pushToken) {
    console.log('[push] No token configured, skipping');
    return;
  }

  const content = [
    ...order.items.map(i => `${i.name} ×${i.quantity} = ¥${i.price * i.quantity}`),
    `合计：¥${order.totalPrice}`,
    order.note ? `备注：${order.note}` : '',
  ].filter(Boolean).join('\n');

  try {
    console.log('[push] Sending to PushPlus...');
    const res = await fetch('http://www.pushplus.plus/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: settings.pushToken,
        title: `🐻 一二下单啦！¥${order.totalPrice}`,
        content,
      }),
    });
    const data = await res.json() as { code: number; msg: string; data?: string };
    if (data.code === 200) {
      console.log('[push] Success:', data.msg);
    } else {
      console.error('[push] PushPlus error:', data.code, data.msg);
    }
  } catch (err) {
    console.error('[push] Failed:', err);
  }
}

// GET /api/orders
router.get('/', (_req: Request, res: Response) => {
  const orders = getOrders();
  res.json(orders);
});

// POST /api/orders
router.post('/', async (req: Request, res: Response) => {
  const order: Order = req.body;
  if (!order.id || !order.items?.length) {
    res.status(400).json({ error: 'Invalid order' });
    return;
  }
  const orders = getOrders();
  orders.unshift(order);
  saveOrders(orders);

  // Notify all SSE chef clients
  const data = JSON.stringify({ type: 'new_order', order });
  for (const client of clients) {
    client.write(`data: ${data}\n\n`);
  }

  // Send WeChat push
  sendWxPush(order);

  res.json({ success: true });
});

// Settings (must be before /:id to avoid route conflict)
router.get('/settings', (_req: Request, res: Response) => {
  res.json(getSettings());
});

router.put('/settings', (req: Request, res: Response) => {
  const { pushToken } = req.body;
  writeJSON('settings.json', { pushToken });
  res.json({ success: true });
});

// PUT /api/orders/:id
router.put('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const orders = getOrders();
  const order = orders.find(o => o.id === id);
  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }
  order.status = status;
  saveOrders(orders);

  const data = JSON.stringify({ type: 'order_update', order });
  for (const client of clients) {
    client.write(`data: ${data}\n\n`);
  }

  res.json({ success: true });
});

// GET /api/orders/events — SSE endpoint
router.get('/events', (_req: Request, res: Response) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });

  res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);
  clients.add(res);

  const heartbeat = setInterval(() => {
    res.write(`: heartbeat\n\n`);
  }, 30000);

  res.on('close', () => {
    clearInterval(heartbeat);
    clients.delete(res);
  });
});

// POST /api/orders/test-push — test WeChat push
router.post('/test-push', async (_req: Request, res: Response) => {
  const settings = getSettings();
  if (!settings.pushToken) {
    res.status(400).json({ error: '未配置 PushPlus Token' });
    return;
  }
  try {
    const result = await fetch('http://www.pushplus.plus/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: settings.pushToken,
        title: '🐻 一二布布 · 测试推送',
        content: '如果你收到这条消息，说明微信推送已配置成功！',
      }),
    });
    const data = await result.json() as { code: number; msg: string };
    if (data.code === 200) {
      res.json({ ok: true, msg: '推送成功！请查看微信' });
    } else if (data.code === 905) {
      res.json({ ok: false, msg: 'PushPlus 需要实名认证。请在 PushPlus 公众号完成实名后再试。' });
    } else {
      res.json({ ok: false, msg: `推送失败 (${data.code}): ${data.msg}` });
    }
  } catch (err) {
    res.status(500).json({ ok: false, msg: '网络错误，请稍后重试' });
  }
});

export default router;
