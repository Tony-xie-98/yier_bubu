import { Router, type Request, type Response } from 'express';
import { readJSON, writeJSON } from '../store';
import { type Dish } from '../../src/types';
import { DEFAULT_DISHES } from '../../src/data/defaults';

const router = Router();

function getDishes(): Dish[] {
  return readJSON<Dish[]>('dishes.json', DEFAULT_DISHES);
}

function saveDishes(dishes: Dish[]) {
  writeJSON('dishes.json', dishes);
}

// GET /api/dishes
router.get('/', (_req: Request, res: Response) => {
  res.json(getDishes());
});

// POST /api/dishes
router.post('/', (req: Request, res: Response) => {
  const dish: Dish = req.body;
  if (!dish.id || !dish.name) {
    res.status(400).json({ error: 'Invalid dish' });
    return;
  }
  const dishes = getDishes();
  dishes.push(dish);
  saveDishes(dishes);
  res.json({ success: true });
});

// PUT /api/dishes/:id
router.put('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const dish: Dish = req.body;
  const dishes = getDishes();
  const idx = dishes.findIndex(d => d.id === id);
  if (idx === -1) {
    res.status(404).json({ error: 'Dish not found' });
    return;
  }
  dishes[idx] = dish;
  saveDishes(dishes);
  res.json({ success: true });
});

// DELETE /api/dishes/:id
router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const dishes = getDishes().filter(d => d.id !== id);
  saveDishes(dishes);
  res.json({ success: true });
});

export default router;
