/**
 * Supabase Client Wrapper for Nav AI Frontend
 * Gracefully handles unconfigured environment states without crashing,
 * allowing full guest mode functionality while clearly reporting auth readiness.
 */
import { createClient } from '@supabase/supabase-js';
import {
  getGuestProfile,
  saveGuestProfile,
  getGuestDailyGoals,
  saveGuestDailyGoals,
  getGuestMealsByDate,
  addGuestMeal,
  deleteGuestMeal,
  getGuestWaterLogs,
  addGuestWaterLog,
  deleteGuestWaterLog,
  getGuestWeightLogs,
  addGuestWeightLog,
  deleteGuestWeightLog,
  getTodayDateString,
} from './guestStorage';

function getLocalUserProfile(userId) {
  try {
    const raw = localStorage.getItem(`navai_profile_${userId}`);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return null;
}

function setLocalUserProfile(userId, profile) {
  try {
    localStorage.setItem(`navai_profile_${userId}`, JSON.stringify({ ...profile, id: userId }));
  } catch (_) {}
}

function getLocalUserDailyGoals(userId) {
  try {
    const raw = localStorage.getItem(`navai_goals_${userId}`);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return null;
}

function setLocalUserDailyGoals(userId, goals) {
  try {
    localStorage.setItem(`navai_goals_${userId}`, JSON.stringify({ ...goals, user_id: userId }));
  } catch (_) {}
}

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
// AUTHENTICATED DATA OPERATIONS (Local-First Resilient Architecture)
// -------------------------------------------------------------

export async function fetchUserProfile(userId) {
  let cloudData = null;
  if (isSupabaseConfigured && supabase && userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!error && data) {
        cloudData = data;
        setLocalUserProfile(userId, data);
      }
    } catch (err) {
      console.warn('Supabase fetchUserProfile failed, falling back to local storage:', err.message);
    }
  }

  if (cloudData) return cloudData;

  // Fallback to local profile for this user
  const local = getLocalUserProfile(userId);
  if (local) return local;

  // Fallback to guest profile if first time
  const guest = await getGuestProfile().catch(() => null);
  return guest || null;
}

export async function updateUserProfile(userId, profileUpdates) {
  // 1. Immediately persist locally (guarantees profile is saved even if Supabase tables are uninitialized)
  const merged = { ...profileUpdates, id: userId, updated_at: new Date().toISOString() };
  setLocalUserProfile(userId, merged);
  saveGuestProfile(merged).catch(() => {});

  // 2. If current_weight_kg is present, automatically ensure weight log for today is created or updated
  if (profileUpdates.current_weight_kg !== undefined && profileUpdates.current_weight_kg !== null) {
    const val = Number(profileUpdates.current_weight_kg);
    if (!isNaN(val) && val > 0) {
      addGuestWeightLog(val, getTodayDateString(), 'Updated from profile').catch(() => {});
      if (isSupabaseConfigured && supabase && userId) {
        (async () => {
          try {
            const todayStr = getTodayDateString();
            const { data: existing } = await supabase
              .from('weight_logs')
              .select('id')
              .eq('user_id', userId)
              .eq('recorded_at', todayStr)
              .maybeSingle();

            if (existing) {
              await supabase
                .from('weight_logs')
                .update({ weight_kg: val, notes: 'Updated from profile' })
                .eq('id', existing.id);
            } else {
              await supabase
                .from('weight_logs')
                .insert({
                  user_id: userId,
                  weight_kg: val,
                  recorded_at: todayStr,
                  notes: 'Updated from profile',
                });
            }
          } catch (_) {}
        })();
      }
    }
  }

  // 3. Sync to Supabase cloud if available
  if (isSupabaseConfigured && supabase && userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert(merged)
        .select()
        .maybeSingle();

      if (!error && data) return data;
    } catch (err) {
      console.warn('Supabase updateUserProfile sync skipped:', err.message);
    }
  }

  return merged;
}

export async function fetchDailyGoals(userId) {
  let cloudData = null;
  if (isSupabaseConfigured && supabase && userId) {
    try {
      const { data, error } = await supabase
        .from('daily_goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        cloudData = data;
        setLocalUserDailyGoals(userId, data);
      }
    } catch (err) {
      console.warn('Supabase fetchDailyGoals failed, falling back to local storage:', err.message);
    }
  }

  if (cloudData) return cloudData;

  // Fallback to local goals for this user
  const local = getLocalUserDailyGoals(userId);
  if (local) return local;

  // Fallback to guest goals if first time
  const guest = await getGuestDailyGoals().catch(() => null);
  return guest || null;
}

export async function upsertDailyGoals(userId, goals) {
  // 1. Immediately persist locally
  const merged = {
    ...goals,
    user_id: userId,
    updated_at: new Date().toISOString(),
  };
  setLocalUserDailyGoals(userId, merged);
  saveGuestDailyGoals(merged).catch(() => {});

  // 2. Sync to Supabase cloud if available
  if (isSupabaseConfigured && supabase && userId) {
    try {
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
        .maybeSingle();

      if (!error && data) return data;
    } catch (err) {
      console.warn('Supabase upsertDailyGoals sync skipped:', err.message);
    }
  }

  return merged;
}

export async function fetchMealsByDate(userId, dateStr) {
  if (isSupabaseConfigured && supabase && userId) {
    try {
      const { data, error } = await supabase
        .from('meals')
        .select(`
          *,
          meal_items (*)
        `)
        .eq('user_id', userId)
        .eq('meal_date', dateStr)
        .order('created_at', { ascending: true });

      if (!error && Array.isArray(data) && data.length > 0) {
        return data;
      }
    } catch (_) {}
  }
  return getGuestMealsByDate(dateStr).catch(() => []);
}

export async function createAuthenticatedMeal(userId, mealData, items = []) {
  // Always persist locally first so food is NEVER lost
  const localMeal = await addGuestMeal({
    ...mealData,
    user_id: userId,
    items,
  }).catch(() => null);

  if (isSupabaseConfigured && supabase && userId) {
    try {
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
        .maybeSingle();

      if (!mealError && meal) {
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
          await supabase.from('meal_items').insert(mealItemsToInsert).catch(() => {});
        }
        return meal;
      }
    } catch (_) {}
  }

  return localMeal || { id: 'meal-' + Date.now(), ...mealData, items };
}

export async function deleteAuthenticatedMeal(mealId) {
  await deleteGuestMeal(mealId).catch(() => {});
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('meals').delete().eq('id', mealId);
    } catch (_) {}
  }
}

export async function fetchWaterLogsByDate(userId, dateStr) {
  if (isSupabaseConfigured && supabase && userId) {
    try {
      const { data, error } = await supabase
        .from('water_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('log_date', dateStr);

      if (!error && Array.isArray(data) && data.length > 0) {
        return data;
      }
    } catch (_) {}
  }
  return getGuestWaterLogs(dateStr).catch(() => []);
}

export async function createAuthenticatedWaterLog(userId, quantityMl, dateStr) {
  const localLog = await addGuestWaterLog(quantityMl, dateStr).catch(() => null);
  if (isSupabaseConfigured && supabase && userId) {
    try {
      const { data, error } = await supabase
        .from('water_logs')
        .insert({
          user_id: userId,
          log_date: dateStr,
          quantity_ml: quantityMl,
        })
        .select()
        .maybeSingle();

      if (!error && data) return data;
    } catch (_) {}
  }
  return localLog || { id: 'water-' + Date.now(), quantity_ml: quantityMl, log_date: dateStr };
}

export async function deleteAuthenticatedWaterLog(logId) {
  await deleteGuestWaterLog(logId).catch(() => {});
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('water_logs').delete().eq('id', logId);
    } catch (_) {}
  }
}

export async function fetchWeightLogs(userId) {
  if (isSupabaseConfigured && supabase && userId) {
    try {
      const { data, error } = await supabase
        .from('weight_logs')
        .select('*')
        .eq('user_id', userId)
        .order('recorded_at', { ascending: true });

      if (!error && Array.isArray(data) && data.length > 0) {
        return data;
      }
    } catch (_) {}
  }
  return getGuestWeightLogs().catch(() => []);
}

export async function createAuthenticatedWeightLog(userId, weightKg, dateStr, notes = '') {
  const val = Number(weightKg);
  const localLog = await addGuestWeightLog(val, dateStr, notes).catch(() => null);

  // Synchronize profile current_weight_kg in local storage and Supabase
  try {
    const localProf = getLocalUserProfile(userId);
    if (localProf) {
      setLocalUserProfile(userId, { ...localProf, current_weight_kg: val });
    }
  } catch (_) {}

  if (isSupabaseConfigured && supabase && userId) {
    try {
      await supabase
        .from('profiles')
        .update({ current_weight_kg: val })
        .eq('id', userId);
    } catch (_) {}

    try {
      const { data: existing } = await supabase
        .from('weight_logs')
        .select('id')
        .eq('user_id', userId)
        .eq('recorded_at', dateStr)
        .maybeSingle();

      if (existing) {
        const { data, error } = await supabase
          .from('weight_logs')
          .update({
            weight_kg: val,
            notes: notes || '',
          })
          .eq('id', existing.id)
          .select()
          .maybeSingle();

        if (!error && data) return data;
      } else {
        const { data, error } = await supabase
          .from('weight_logs')
          .insert({
            user_id: userId,
            weight_kg: val,
            recorded_at: dateStr,
            notes,
          })
          .select()
          .maybeSingle();

        if (!error && data) return data;
      }
    } catch (_) {}
  }
  return localLog || { id: 'weight-' + Date.now(), weight_kg: val, recorded_at: dateStr, notes };
}

export async function deleteAuthenticatedWeightLog(userId, id) {
  await deleteGuestWeightLog(id).catch(() => {});
  if (isSupabaseConfigured && supabase && userId) {
    try {
      await supabase
        .from('weight_logs')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
    } catch (_) {}
  }

  // After deletion, find latest remaining log and sync back to profile
  try {
    const remaining = await fetchWeightLogs(userId);
    if (remaining && remaining.length > 0) {
      const latest = Number(remaining[remaining.length - 1].weight_kg);
      if (!isNaN(latest) && latest > 0) {
        const localProf = getLocalUserProfile(userId);
        if (localProf) {
          setLocalUserProfile(userId, { ...localProf, current_weight_kg: latest });
        }
        if (isSupabaseConfigured && supabase) {
          await supabase.from('profiles').update({ current_weight_kg: latest }).eq('id', userId).catch(() => {});
        }
      }
    }
  } catch (_) {}
}

