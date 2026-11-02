import { createClient } from '@supabase/supabase-js';
import { config } from '../config/env.js';

let supabaseClient = null;
let supabaseAdminClient = null;

if (config.supabase.isConfigured) {
  // Client for verifying user auth tokens
  supabaseClient = createClient(
    config.supabase.url,
    config.supabase.publishableKey || config.supabase.secretKey
  );

  // Admin client if secretKey is provided
  if (config.supabase.secretKey) {
    supabaseAdminClient = createClient(
      config.supabase.url,
      config.supabase.secretKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  }
}

export { supabaseClient, supabaseAdminClient };

/**
 * Verify a Supabase JWT access token passed in the Authorization header
 */
export async function verifyAuthToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) return null;

  if (!supabaseClient) {
    // Supabase credentials not set up on server
    return null;
  }

  try {
    const { data: { user }, error } = await supabaseClient.auth.getUser(token);
    if (error || !user) {
      return null;
    }
    return user;
  } catch {
    return null;
  }
}

