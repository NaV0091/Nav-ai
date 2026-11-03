/**
 * Supabase Client Wrapper for Nav AI Frontend
 * Gracefully handles unconfigured environment states without crashing,
 * allowing full guest mode functionality while clearly reporting auth readiness.
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://pfejaswwzihrqdlntkeg.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_on_uwHxoqghjuub69dPoLw_jaO4vvnk';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-supabase-url') &&
  !supabaseAnonKey.includes('your-anon-key')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

// Auth helpers
export async function signUpWithEmail(email, password, displayName) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.');
  }

  // Attempt instant registration via backend admin endpoint if reachable
  const backendBase = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');
  try {
    const res = await fetch(`${backendBase}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, displayName }),
    });

    if (res.ok) {
      // User registered and pre-confirmed on backend; sign in directly to get session
      const loginData = await supabase.auth.signInWithPassword({ email, password });
      if (!loginData.error && loginData.data?.session) {
        return loginData.data;
      }
    } else if (res.status === 409) {
      throw new Error('This email is already registered. Please sign in instead.');
    }
  } catch (apiErr) {
    if (apiErr.message?.includes('already registered')) throw apiErr;
    // Otherwise fallback to client-side Supabase signUp
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: displayName,
      },
    },
  });

  if (error) {
    if (error.status === 429 || error.message?.toLowerCase().includes('rate limit')) {
      throw new Error(
        'Supabase email confirmation rate limit reached (3 per hour on free tier). You can turn off "Confirm email" in Supabase Auth Settings for instant signups, or continue with Guest Mode!'
      );
    }
    throw error;
  }
  return data;
}

export async function signInWithEmail(email, password) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.');
  }

  let { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error && error.message?.toLowerCase().includes('email not confirmed')) {
    // Attempt auto-confirmation via backend admin endpoint if available
    const backendBase = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');
    try {
      const confirmRes = await fetch(`${backendBase}/api/auth/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (confirmRes.ok) {
        // Retry sign in after confirmation
        const retryResult = await supabase.auth.signInWithPassword({ email, password });
        if (!retryResult.error) {
          return retryResult.data;
        }
      }
    } catch (_) {
      // Backend not running, show friendly email confirmation notice
    }

    throw new Error(
      'Your email address has not been confirmed yet. Please check your inbox for the confirmation email or check spam.'
    );
  }

  if (error) throw error;
  return data;
}

export async function resendConfirmationEmail(email) {
  if (!isSupabaseConfigured || !supabase) return;
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
  });
  if (error) throw error;
}

export async function signInWithGoogle() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.');
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      skipBrowserRedirect: true,
    },
  });

  if (error) throw error;

  if (data?.url) {
    try {
      // Verify if the Google provider is enabled on Supabase server before redirecting
      const checkRes = await fetch(data.url, { method: 'GET' });
      if (checkRes.status === 400) {
        const body = await checkRes.json().catch(() => ({}));
        if (body.error_code === 'validation_failed' || body.msg?.toLowerCase().includes('not enabled')) {
          const disabledErr = new Error(
            'Google Sign-In is not enabled in your Supabase project (pfejaswwzihrqdlntkeg). Please enable Google in Supabase Authentication settings.'
          );
          disabledErr.isGoogleDisabled = true;
          disabledErr.code = 'GOOGLE_PROVIDER_DISABLED';
          throw disabledErr;
        }
      }
    } catch (checkErr) {
      if (checkErr.isGoogleDisabled) throw checkErr;
      // Network check failed due to something else (e.g. strict CORS), proceed to redirect
    }

    window.location.href = data.url;
    return data;
  }

  return data;
}

export async function signOutUser() {
  if (!isSupabaseConfigured || !supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Session retrieval error:', error);
    return null;
  }
  return data.session;
}

export function onAuthStateChange(callback) {
  if (!isSupabaseConfigured || !supabase) {
    return { data: { subscription: { unsubscribe: () => {} } } };
  }
  return supabase.auth.onAuthStateChange(callback);
}

// -------------------------------------------------------------
// AUTHENTICATED DATA OPERATIONS
// -------------------------------------------------------------

export async function fetchUserProfile(userId) {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching profile:', error);
  }
  return data;
}

export async function updateUserProfile(userId, profileUpdates) {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...profileUpdates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function fetchDailyGoals(userId) {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data, error } = await supabase
    .from('daily_goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching daily goals:', error);
  }
  return data;
}

export async function upsertDailyGoals(userId, goals) {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data, error } = await supabase
    .from('daily_goals')
    .upsert({
      user_id: userId,
      calorie_target: goals.calorie_target,
      protein_target_g: goals.protein_target_g,
      carbs_target_g: goals.carbs_target_g,
      fat_target_g: goals.fat_target_g,
      water_target_ml: goals.water_target_ml,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function fetchMealsByDate(userId, dateStr) {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase
    .from('meals')
    .select(`
      *,
      meal_items (*)
    `)
    .eq('user_id', userId)
    .eq('meal_date', dateStr)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching meals:', error);
    return [];
  }
  return data || [];
}

export async function createAuthenticatedMeal(userId, mealData, items = []) {
  if (!isSupabaseConfigured || !supabase) throw new Error('Supabase not configured');

  // Insert parent meal
  const { data: meal, error: mealError } = await supabase
    .from('meals')
    .insert({
      user_id: userId,
      meal_date: mealData.meal_date,
      meal_type: mealData.meal_type,
      name: mealData.name,
      notes: mealData.notes || '',
      image_path: mealData.image_path || null,
      total_calories: mealData.total_calories,
      total_protein_g: mealData.total_protein_g,
      total_carbs_g: mealData.total_carbs_g,
      total_fat_g: mealData.total_fat_g,
      nutrition_is_estimated: mealData.nutrition_is_estimated ?? true,
    })
    .select()
    .single();

  if (mealError) throw mealError;

  // Insert items if any
  if (items.length > 0) {
    const mealItemsToInsert = items.map((it) => ({
      meal_id: meal.id,
      food_item_id: it.food_item_id || null,
      name: it.name,
      quantity: it.quantity,
      unit: it.unit || 'g',
      calories: it.calories,
      protein_g: it.protein_g,
      carbs_g: it.carbs_g,
      fat_g: it.fat_g,
      nutrition_source: it.nutrition_source || 'estimate',
      is_estimated: it.is_estimated ?? true,
    }));

    const { error: itemsError } = await supabase
      .from('meal_items')
      .insert(mealItemsToInsert);

    if (itemsError) console.error('Error inserting meal items:', itemsError);
  }

  return meal;
}

export async function deleteAuthenticatedMeal(mealId) {
  if (!isSupabaseConfigured || !supabase) return;
  const { error } = await supabase.from('meals').delete().eq('id', mealId);
  if (error) throw error;
}

export async function fetchWaterLogsByDate(userId, dateStr) {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase
    .from('water_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('log_date', dateStr);

  if (error) {
    console.error('Error fetching water logs:', error);
    return [];
  }
  return data || [];
}

export async function createAuthenticatedWaterLog(userId, quantityMl, dateStr) {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data, error } = await supabase
    .from('water_logs')
    .insert({
      user_id: userId,
      log_date: dateStr,
      quantity_ml: quantityMl,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteAuthenticatedWaterLog(logId) {
  if (!isSupabaseConfigured || !supabase) return;
  const { error } = await supabase.from('water_logs').delete().eq('id', logId);
  if (error) throw error;
}

export async function fetchWeightLogs(userId) {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase
    .from('weight_logs')
    .select('*')
    .eq('user_id', userId)
    .order('recorded_at', { ascending: true });

  if (error) {
    console.error('Error fetching weight logs:', error);
    return [];
  }
  return data || [];
}

export async function createAuthenticatedWeightLog(userId, weightKg, dateStr, notes = '') {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data, error } = await supabase
    .from('weight_logs')
    .insert({
      user_id: userId,
      weight_kg: weightKg,
      recorded_at: dateStr,
      notes,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

