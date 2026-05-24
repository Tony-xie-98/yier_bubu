import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import ordersRouter from './routes/orders';
import dishesRouter from './routes/dishes';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API routes
app.use('/api/orders', ordersRouter);
app.use('/api/dishes', dishesRouter);

// Serve static frontend in production
const distPath = path.join(import.meta.dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('/{*splat}', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🍽️  一二布布点餐服务已启动`);
  console.log(`   API: http://localhost:${PORT}/api`);
  console.log(`   SSE: http://localhost:${PORT}/api/orders/events`);
});
