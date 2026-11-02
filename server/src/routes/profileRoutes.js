import express from 'express';
import { requireAuth, getSupabaseServer } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(requireAuth);

/**
 * GET /api/profile
 */
router.get('/', async (req, res, next) => {
  try {
    const client = getSupabaseServer();
    const { data, error } = await client
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    res.json({ profile: data || null });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/profile
 */
router.patch('/', async (req, res, next) => {
  try {
    const client = getSupabaseServer();
    const updates = req.body;

    const { data, error } = await client
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, profile: data });
  } catch (err) {
    next(err);
  }
});

export default router;

