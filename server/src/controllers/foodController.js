import { REFERENCE_FOODS, searchFoods } from '../services/foodDb.js';

export function getFoodList(req, res) {
  const query = req.query.q || '';
  const results = searchFoods(query);
  return res.json({
    success: true,
    count: results.length,
    foods: results,
  });
}

export function getFoodById(req, res) {
  const { id } = req.params;
  const food = REFERENCE_FOODS.find((f) => f.id === id);
  if (!food) {
    return res.status(404).json({
      error: 'Food item not found in reference database.',
      code: 'NOT_FOUND',
    });
  }
  return res.json({
    success: true,
    food,
  });
}

