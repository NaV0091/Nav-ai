import { verifyAuthToken } from '../services/supabaseService.js';
import { config } from '../config/env.js';

/**
 * Middleware: Strictly requires authenticated Supabase session
 */
export async function requireAuth(req, res, next) {
  if (!config.supabase.isConfigured) {
    return res.status(503).json({
      error: 'Authentication service not configured on server.',
      code: 'AUTH_NOT_CONFIGURED',
      message: 'Please configure SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY in the server environment.',
    });
  }

  const authHeader = req.headers.authorization;
  const user = await verifyAuthToken(authHeader);

  if (!user) {
    return res.status(401).json({
      error: 'Unauthorized. A valid authenticated session is required.',
      code: 'UNAUTHORIZED',
    });
  }

  req.user = user;
  next();
}

/**
 * Middleware: Allows guests while identifying authenticated users if token is present
 */
export async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && config.supabase.isConfigured) {
    const user = await verifyAuthToken(authHeader);
    if (user) {
      req.user = user;
      req.isGuest = false;
      return next();
    }
  }

  req.user = null;
  req.isGuest = true;
  next();
}

