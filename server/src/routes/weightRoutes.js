import express from 'express';
import { requireAuth, getSupabaseServer } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(requireAuth);

/**
 * GET /api/weight
 */
router.get('/', async (req, res, next) => {
  try {
    const client = getSupabaseServer();
    const { data, error } = await client
      .from('weight_logs')
      .select('*')
      .eq('user_id', req.user.id)
      .order('recorded_at', { ascending: true });

    if (error) throw error;
    res.json({ logs: data || [] });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/weight
 */
router.post('/', async (req, res, next) => {
  try {
    const client = getSupabaseServer();
    const { weight_kg, recorded_at, notes } = req.body;

    const w = parseFloat(weight_kg);
    if (!w || w <= 0) {
      return res.status(400).json({ error: 'Valid weight_kg is required' });
    }

    const { data, error } = await client
      .from('weight_logs')
      .insert({
        user_id: req.user.id,
        weight_kg: w,
        recorded_at: recorded_at || new Date().toISOString().split('T')[0],
        notes: notes || '',
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, log: data });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/weight/:id
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const client = getSupabaseServer();
    const { error } = await client
      .from('weight_logs')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.json({ success: true, message: 'Weight log deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;

