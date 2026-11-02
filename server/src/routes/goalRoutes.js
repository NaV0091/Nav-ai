import express from 'express';
import { requireAuth, getSupabaseServer } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(requireAuth);

/**
 * GET /api/goals
 */
router.get('/', async (req, res, next) => {
  try {
    const client = getSupabaseServer();
    const { data, error } = await client
      .from('daily_goals')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    res.json({ goals: data || null });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/goals
 */
router.put('/', async (req, res, next) => {
  try {
    const client = getSupabaseServer();
    const { calorie_target, protein_target_g, carbs_target_g, fat_target_g, water_target_ml } = req.body;

    const { data, error } = await client
      .from('daily_goals')
      .upsert({
        user_id: req.user.id,
        calorie_target: Number(calorie_target) || 2000,
        protein_target_g: Number(protein_target_g) || 120,
        carbs_target_g: Number(carbs_target_g) || 200,
        fat_target_g: Number(fat_target_g) || 60,
        water_target_ml: Number(water_target_ml) || 2500,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, goals: data });
  } catch (err) {
    next(err);
  }
});

export default router;

