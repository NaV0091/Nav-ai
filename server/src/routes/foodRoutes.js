import express from 'express';
import { referenceFoods, searchNutritionDatabase } from '../data/nutritionDatabase.js';

const router = express.Router();

/**
 * GET /api/foods/search?q=query
 * Searches verified nutrition reference foods
 */
router.get('/search', (req, res) => {
  const query = (req.query.q || '').toString();
  const results = searchNutritionDatabase(query);
  res.json({
    count: results.length,
    foods: results.slice(0, 30),
  });
});

/**
 * GET /api/foods/:id
 * Retrieves details of a specific reference food item
 */
router.get('/:id', (req, res) => {
  const food = referenceFoods.find((f) => f.id === req.params.id);
  if (!food) {
    return res.status(404).json({ error: 'Food item not found' });
  }
  res.json({ food });
});

export default router;

