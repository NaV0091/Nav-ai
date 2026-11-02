import express from 'express';
import { requireAuth, getSupabaseServer } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(requireAuth);

/**
 * GET /api/water?date=YYYY-MM-DD
 */
router.get('/', async (req, res, next) => {
  try {
    const client = getSupabaseServer();
    const date = req.query.date || new Date().toISOString().split('T')[0];

    const { data, error } = await client
      .from('water_logs')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('log_date', date);

    if (error) throw error;
    res.json({ logs: data || [] });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/water
 */
router.post('/', async (req, res, next) => {
  try {
    const client = getSupabaseServer();
    const { quantity_ml, log_date } = req.body;

    const qty = parseInt(quantity_ml, 10);
    if (!qty || qty <= 0) {
      return res.status(400).json({ error: 'Valid quantity_ml required' });
    }

    const { data, error } = await client
      .from('water_logs')
      .insert({
        user_id: req.user.id,
        quantity_ml: qty,
        log_date: log_date || new Date().toISOString().split('T')[0],
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
 * DELETE /api/water/:id
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const client = getSupabaseServer();
    const { error } = await client
      .from('water_logs')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.json({ success: true, message: 'Water log deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;

