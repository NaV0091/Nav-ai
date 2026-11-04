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
        'Supabase email confirmation rate limit reached (3 per hour on free tier). You can continue with Guest Mode!'
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

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message?.toLowerCase().includes('email not confirmed')) {
      throw new Error(
        'Your email address has not been confirmed yet. Please check your inbox for the confirmation email or check spam.'
      );
    }
    if (error.message?.toLowerCase().includes('invalid login credentials')) {
      throw new Error('Incorrect email or password. Please check your credentials or register a new account.');
    }
    throw error;
  }
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

  // Proactively check if Google OAuth provider is enabled in Supabase settings
  try {
    const settingsRes = await fetch(`${supabaseUrl}/auth/v1/settings`, {
      headers: { apikey: supabaseAnonKey },
    });
    if (settingsRes.ok) {
      const settings = await settingsRes.json();
      if (settings?.external?.google === false) {
        const disabledErr = new Error(
          'Google Sign-In is not enabled yet in your Supabase project (pfejaswwzihrqdlntkeg). Please enable Google in Supabase Authentication settings.'
        );
        disabledErr.isGoogleDisabled = true;
        disabledErr.code = 'GOOGLE_PROVIDER_DISABLED';
        throw disabledErr;
      }
    }
  } catch (checkErr) {
    if (checkErr.isGoogleDisabled) throw checkErr;
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    if (
      error.message?.toLowerCase().includes('not enabled') ||
      error.message?.toLowerCase().includes('validation_failed')
    ) {
      const disabledErr = new Error(
        'Google Sign-In is not enabled yet in your Supabase project (pfejaswwzihrqdlntkeg). Please enable Google in Supabase Authentication settings.'
      );
      disabledErr.isGoogleDisabled = true;
      disabledErr.code = 'GOOGLE_PROVIDER_DISABLED';
      throw disabledErr;
    }
    throw error;
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

