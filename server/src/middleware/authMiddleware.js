import { createClient } from '@supabase/supabase-js';
import { config, isSupabaseConfigured } from '../config/env.js';

let supabaseServerClient = null;

export function getSupabaseServer() {
  if (!supabaseServerClient && isSupabaseConfigured) {
    supabaseServerClient = createClient(
      config.supabaseUrl,
      config.supabaseSecretKey || config.supabasePublishableKey
    );
  }
  return supabaseServerClient;
}

/**
 * Optional Authentication Middleware
 * Attaches req.user if a valid token is provided, but allows guest access.
 */
export async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];
  const client = getSupabaseServer();

  if (!client) {
    req.user = null;
    return next();
  }

  try {
    const { data: { user }, error } = await client.auth.getUser(token);
    if (!error && user) {
      req.user = user;
    } else {
      req.user = null;
    }
  } catch (err) {
    req.user = null;
  }
  next();
}

/**
 * Required Authentication Middleware
 * Rejects requests with 401 Unauthorized if no valid Supabase user session exists.
 */
export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication token is required for this operation.',
    });
  }

  const token = authHeader.split(' ')[1];
  const client = getSupabaseServer();

  if (!client) {
    return res.status(503).json({
      error: 'Service Unavailable',
      message: 'Authentication service is not configured on the server.',
    });
  }

  try {
    const { data: { user }, error } = await client.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired authentication session.',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Failed to authenticate user session.',
    });
  }
}

