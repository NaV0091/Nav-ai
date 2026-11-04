import express from 'express';
import { getSupabaseServer } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * Direct user registration using Supabase Admin API
 * Pre-confirms the email so users never get stuck with email confirmation
 * or free-tier SMTP rate limit issues.
 */
router.post('/register', async (req, res) => {
  const { email, password, displayName } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  const client = getSupabaseServer();
  if (!client) {
    return res.status(500).json({ error: 'Supabase server client not configured.' });
  }

  try {
    const { data, error } = await client.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: displayName || '' },
    });

    if (error) {
      const msg = error.message || '';
      if (msg.includes('already been registered') || error.code === 'user_already_exists') {
        return res.status(409).json({ error: 'User already registered. Please log in.' });
      }
      return res.status(400).json({ error: msg });
    }

    return res.status(201).json({
      success: true,
      user: data.user,
      message: 'Account created successfully with instant verification.',
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Server error creating user.' });
  }
});

/**
 * Auto-confirm an existing unconfirmed user's email
 */
router.post('/confirm', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required.' });

  const client = getSupabaseServer();
  if (!client) return res.status(500).json({ error: 'Supabase server client not configured.' });

  try {
    const { data: usersData, error: listError } = await client.auth.admin.listUsers();
    if (listError) throw listError;

    const user = usersData.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const { data, error } = await client.auth.admin.updateUserById(user.id, {
      email_confirm: true,
    });
    if (error) throw error;

    return res.json({
      success: true,
      message: `Email ${email} confirmed successfully.`,
      user: data.user,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;

