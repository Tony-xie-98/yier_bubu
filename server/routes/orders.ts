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

// SSE clients
const clients = new Set<Response>();

// GET /api/orders
router.get('/', (_req: Request, res: Response) => {
  const orders = getOrders();
  res.json(orders);
});

// POST /api/orders
router.post('/', (req: Request, res: Response) => {
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

  // Notify SSE clients about status change
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

  // Send heartbeat every 30s
  const heartbeat = setInterval(() => {
    res.write(`: heartbeat\n\n`);
  }, 30000);

  res.on('close', () => {
    clearInterval(heartbeat);
    clients.delete(res);
  });
});

export default router;
