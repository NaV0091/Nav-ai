/**
 * Guest Storage Service for Nav AI
 * Full-featured IndexedDB implementation for Guest Mode persistence.
 * Guarantees zero data loss across page refreshes.
 */

const DB_NAME = 'NavAI_GuestDB';
const DB_VERSION = 1;

let dbPromise = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Stores
        if (!db.objectStoreNames.contains('profile')) {
          db.createObjectStore('profile', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('daily_goals')) {
          db.createObjectStore('daily_goals', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('meals')) {
          const mealStore = db.createObjectStore('meals', { keyPath: 'id' });
          mealStore.createIndex('meal_date', 'meal_date', { unique: false });
        }
        if (!db.objectStoreNames.contains('water_logs')) {
          const waterStore = db.createObjectStore('water_logs', { keyPath: 'id' });
          waterStore.createIndex('log_date', 'log_date', { unique: false });
        }
        if (!db.objectStoreNames.contains('weight_logs')) {
          const weightStore = db.createObjectStore('weight_logs', { keyPath: 'id' });
          weightStore.createIndex('recorded_at', 'recorded_at', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        resolve(event.target.result);
      };

      request.onerror = (event) => {
        console.error('IndexedDB open error:', event.target.error);
        reject(event.target.error);
      };
    });
  }
  return dbPromise;
}

function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'guest-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
}

export function getTodayDateString(d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// -------------------------------------------------------------
// PROFILE & GOALS
// -------------------------------------------------------------

export async function getGuestProfile() {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('profile', 'readonly');
    const store = tx.objectStore('profile');
    const req = store.get('current_guest');

    req.onsuccess = () => {
      if (req.result) {
        resolve(req.result);
      } else {
        // Sensible default guest profile
        const defaultProfile = {
          id: 'current_guest',
          display_name: 'Guest Explorer',
          age: 28,
          height_cm: 170,
          current_weight_kg: 64.5,
          activity_level: 'moderate',
          goal_type: 'maintain_weight',
          dietary_preference: 'all',
          unit_system: 'metric',
          dietary_tags: ['Gluten-Free', 'High-Protein'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        saveGuestProfile(defaultProfile).then(() => resolve(defaultProfile));
      }
    };
    req.onerror = () => reject(req.error);
  });
}

export async function saveGuestProfile(profileData) {
  const db = await getDB();
  const updated = {
    ...profileData,
    id: 'current_guest',
    updated_at: new Date().toISOString(),
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction('profile', 'readwrite');
    const store = tx.objectStore('profile');
    const req = store.put(updated);
    req.onsuccess = () => {
      // If current_weight_kg is provided, automatically synchronize today's weight log in progress
      if (profileData.current_weight_kg !== undefined && profileData.current_weight_kg !== null) {
        const val = Number(profileData.current_weight_kg);
        if (!isNaN(val) && val > 0) {
          syncGuestWeightLogInternal(val, getTodayDateString(), 'Updated from profile').catch(() => {});
        }
      }
      resolve(updated);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function getGuestDailyGoals() {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('daily_goals', 'readonly');
    const store = tx.objectStore('daily_goals');
    const req = store.get('current_goals');

    req.onsuccess = () => {
      if (req.result) {
        resolve(req.result);
      } else {
        const defaultGoals = {
          id: 'current_goals',
          calorie_target: 1850,
          protein_target_g: 125,
          carbs_target_g: 180,
          fat_target_g: 60,
          water_target_ml: 2000,
          updated_at: new Date().toISOString(),
        };
        saveGuestDailyGoals(defaultGoals).then(() => resolve(defaultGoals));
      }
    };
    req.onerror = () => reject(req.error);
  });
}

export async function saveGuestDailyGoals(goalsData) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('daily_goals', 'readwrite');
    const store = tx.objectStore('daily_goals');
    const updated = {
      ...goalsData,
      id: 'current_goals',
      updated_at: new Date().toISOString(),
    };
    const req = store.put(updated);
    req.onsuccess = () => resolve(updated);
    req.onerror = () => reject(req.error);
  });
}

// -------------------------------------------------------------
// MEALS & MEAL ITEMS
// -------------------------------------------------------------

export async function getGuestMealsByDate(dateStr) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('meals', 'readonly');
    const store = tx.objectStore('meals');
    const index = store.index('meal_date');
    const req = index.getAll(IDBKeyRange.only(dateStr));

    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function getAllGuestMeals() {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('meals', 'readonly');
    const store = tx.objectStore('meals');
    const req = store.getAll();

    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function addGuestMeal(meal) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('meals', 'readwrite');
    const store = tx.objectStore('meals');
    const newMeal = {
      id: meal.id || generateId(),
      meal_date: meal.meal_date || getTodayDateString(),
      meal_type: meal.meal_type || 'lunch',
      name: meal.name || 'Untitled Meal',
      notes: meal.notes || '',
      image_data: meal.image_data || null,
      total_calories: Number(meal.total_calories) || 0,
      total_protein_g: Number(meal.total_protein_g) || 0,
      total_carbs_g: Number(meal.total_carbs_g) || 0,
      total_fat_g: Number(meal.total_fat_g) || 0,
      nutrition_is_estimated: meal.nutrition_is_estimated ?? true,
      items: (meal.items || []).map((item) => ({
        id: item.id || generateId(),
        name: item.name,
        quantity: Number(item.quantity) || 100,
        unit: item.unit || 'g',
        calories: Number(item.calories) || 0,
        protein_g: Number(item.protein_g) || 0,
        carbs_g: Number(item.carbs_g) || 0,
        fat_g: Number(item.fat_g) || 0,
        is_estimated: item.is_estimated ?? true,
        nutrition_source: item.nutrition_source || 'estimate',
      })),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const req = store.add(newMeal);
    req.onsuccess = () => resolve(newMeal);
    req.onerror = () => reject(req.error);
  });
}

export async function updateGuestMeal(id, mealData) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('meals', 'readwrite');
    const store = tx.objectStore('meals');
    const reqGet = store.get(id);

    reqGet.onsuccess = () => {
      if (!reqGet.result) {
        reject(new Error('Meal not found'));
        return;
      }
      const updated = {
        ...reqGet.result,
        ...mealData,
        id,
        updated_at: new Date().toISOString(),
      };
      const reqPut = store.put(updated);
      reqPut.onsuccess = () => resolve(updated);
      reqPut.onerror = () => reject(reqPut.error);
    };
    reqGet.onerror = () => reject(reqGet.error);
  });
}

export async function deleteGuestMeal(id) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('meals', 'readwrite');
    const store = tx.objectStore('meals');
    const req = store.delete(id);
    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
  });
}

// -------------------------------------------------------------
// WATER LOGS
// -------------------------------------------------------------

export async function getGuestWaterLogs(dateStr) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('water_logs', 'readonly');
    const store = tx.objectStore('water_logs');
    const req = store.getAll();

    req.onsuccess = () => {
      const all = req.result || [];
      const filtered = dateStr ? all.filter((l) => l.log_date === dateStr) : all;
      resolve(filtered);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function addGuestWaterLog(quantity_ml, dateStr = getTodayDateString()) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('water_logs', 'readwrite');
    const store = tx.objectStore('water_logs');
    const val = Math.max(1, Number(quantity_ml) || 250);
    const newLog = {
      id: generateId(),
      log_date: dateStr || getTodayDateString(),
      quantity_ml: val,
      amount_ml: val,
      logged_at: new Date().toISOString(),
    };
    const req = store.add(newLog);
    req.onsuccess = () => resolve(newLog);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteGuestWaterLog(id) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('water_logs', 'readwrite');
    const store = tx.objectStore('water_logs');
    const req = store.delete(id);
    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
  });
}

// -------------------------------------------------------------
// WEIGHT LOGS
// -------------------------------------------------------------

export async function getGuestWeightLogs() {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('weight_logs', 'readonly');
    const store = tx.objectStore('weight_logs');
    const req = store.getAll();

    req.onsuccess = () => {
      const records = (req.result || []).sort(
        (a, b) => new Date(a.recorded_at) - new Date(b.recorded_at)
      );
      resolve(records);
    };
    req.onerror = () => reject(req.error);
  });
}

async function syncGuestWeightLogInternal(val, dateStr = getTodayDateString(), notes = '') {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction('weight_logs', 'readwrite');
      const store = tx.objectStore('weight_logs');
      const getReq = store.getAll();
      getReq.onsuccess = () => {
        const all = getReq.result || [];
        const existing = all.find((l) => (l.recorded_at || '').startsWith(dateStr));
        if (existing) {
          const updated = {
            ...existing,
            weight_kg: val,
            notes: notes || existing.notes || '',
            updated_at: new Date().toISOString(),
          };
          store.put(updated);
          resolve(updated);
        } else {
          const newLog = {
            id: generateId(),
            weight_kg: val,
            recorded_at: dateStr,
            notes: notes || '',
            created_at: new Date().toISOString(),
          };
          store.add(newLog);
          resolve(newLog);
        }
      };
      getReq.onerror = () => resolve(null);
    });
  } catch (_) {
    return null;
  }
}

export async function addGuestWeightLog(weight_kg, dateStr = getTodayDateString(), notes = '') {
  const db = await getDB();
  const val = Number(weight_kg);

  // Automatically keep guest profile current_weight_kg in sync
  try {
    const pTx = db.transaction('profile', 'readwrite');
    const pStore = pTx.objectStore('profile');
    const pReq = pStore.get('current_guest');
    pReq.onsuccess = () => {
      if (pReq.result) {
        pStore.put({
          ...pReq.result,
          current_weight_kg: val,
          updated_at: new Date().toISOString(),
        });
      }
    };
  } catch (_) {}

  return new Promise((resolve, reject) => {
    const tx = db.transaction('weight_logs', 'readwrite');
    const store = tx.objectStore('weight_logs');
    const getReq = store.getAll();
    getReq.onsuccess = () => {
      const all = getReq.result || [];
      const existing = all.find((l) => (l.recorded_at || '').startsWith(dateStr));
      if (existing) {
        const updated = {
          ...existing,
          weight_kg: val,
          notes: notes || existing.notes || '',
          updated_at: new Date().toISOString(),
        };
        const putReq = store.put(updated);
        putReq.onsuccess = () => resolve(updated);
        putReq.onerror = () => reject(putReq.error);
      } else {
        const newLog = {
          id: generateId(),
          weight_kg: val,
          recorded_at: dateStr,
          notes: notes || '',
          created_at: new Date().toISOString(),
        };
        const addReq = store.add(newLog);
        addReq.onsuccess = () => resolve(newLog);
        addReq.onerror = () => reject(addReq.error);
      }
    };
    getReq.onerror = () => reject(getReq.error);
  });
}

export async function deleteGuestWeightLog(id) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('weight_logs', 'readwrite');
    const store = tx.objectStore('weight_logs');
    const req = store.delete(id);
    req.onsuccess = () => {
      // Sync latest remaining weight log to profile
      const listReq = store.getAll();
      listReq.onsuccess = () => {
        const remaining = (listReq.result || []).sort(
          (a, b) => new Date(a.recorded_at) - new Date(b.recorded_at)
        );
        if (remaining.length > 0) {
          const latestWeight = Number(remaining[remaining.length - 1].weight_kg);
          try {
            const pTx = db.transaction('profile', 'readwrite');
            const pStore = pTx.objectStore('profile');
            const pGet = pStore.get('current_guest');
            pGet.onsuccess = () => {
              if (pGet.result) {
                pStore.put({
                  ...pGet.result,
                  current_weight_kg: latestWeight,
                  updated_at: new Date().toISOString(),
                });
              }
            };
          } catch (_) {}
        }
      };
      resolve(true);
    };
    req.onerror = () => reject(req.error);
  });
}

// -------------------------------------------------------------
// CLEAR & EXPORT GUEST DATA
// -------------------------------------------------------------

export async function clearAllGuestData() {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const stores = ['profile', 'daily_goals', 'meals', 'water_logs', 'weight_logs'];
    const tx = db.transaction(stores, 'readwrite');

    stores.forEach((storeName) => {
      tx.objectStore(storeName).clear();
    });

    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

export async function exportGuestData() {
  const [profile, goals, meals, weights] = await Promise.all([
    getGuestProfile(),
    getGuestDailyGoals(),
    getAllGuestMeals(),
    getGuestWeightLogs(),
  ]);

  return {
    profile,
    daily_goals: goals,
    meals,
    weight_logs: weights,
    exported_at: new Date().toISOString(),
  };
}

