import express from 'express';
import { requireAuth, getSupabaseServer } from '../middleware/authMiddleware.js';
import { calculateMealTotals, roundNutritionTotals } from '../services/nutritionEngine.js';

const router = express.Router();

// All meal endpoints require authentication
router.use(requireAuth);

/**
 * GET /api/meals?date=YYYY-MM-DD
 */
router.get('/', async (req, res, next) => {
  try {
    const client = getSupabaseServer();
    const date = req.query.date || new Date().toISOString().split('T')[0];

    const { data, error } = await client
      .from('meals')
      .select('*, meal_items(*)')
      .eq('user_id', req.user.id)
      .eq('meal_date', date)
      .order('created_at', { ascending: true });

    if (error) throw error;
    res.json({ count: data?.length || 0, meals: data || [] });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/meals
 * Creates an authenticated meal and verifies totals using the backend nutrition engine
 */
router.post('/', async (req, res, next) => {
  try {
    const client = getSupabaseServer();
    const { meal_date, meal_type, name, notes, image_path, items = [] } = req.body;

    if (!name || !meal_type) {
      return res.status(400).json({ error: 'Name and meal_type are required' });
    }

    // Backend validates quantities and recalculates verified totals
    const rawTotals = calculateMealTotals(items);
    const totals = roundNutritionTotals(rawTotals);

    const { data: meal, error: mealErr } = await client
      .from('meals')
      .insert({
        user_id: req.user.id,
        meal_date: meal_date || new Date().toISOString().split('T')[0],
        meal_type,
        name,
        notes: notes || '',
        image_path: image_path || null,
        total_calories: totals.total_calories,
        total_protein_g: totals.total_protein_g,
        total_carbs_g: totals.total_carbs_g,
        total_fat_g: totals.total_fat_g,
        nutrition_is_estimated: items.some((it) => it.is_estimated),
      })
      .select()
      .single();

    if (mealErr) throw mealErr;

    // Insert items
    if (items.length > 0) {
      const itemsToInsert = items.map((it) => ({
        meal_id: meal.id,
        food_item_id: it.food_item_id || null,
        name: it.name,
        quantity: Math.max(1, Number(it.quantity) || 100),
        unit: it.unit || 'g',
        calories: Number(it.calories) || 0,
        protein_g: Number(it.protein_g) || 0,
        carbs_g: Number(it.carbs_g) || 0,
        fat_g: Number(it.fat_g) || 0,
        nutrition_source: it.nutrition_source || 'estimate',
        is_estimated: it.is_estimated ?? true,
      }));

      await client.from('meal_items').insert(itemsToInsert);
    }

    res.status(201).json({ success: true, meal });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/meals/:id
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const client = getSupabaseServer();
    const { error } = await client
      .from('meals')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.json({ success: true, message: 'Meal deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;

