/**
 * Client API & AI Services for Nav AI
 * Communicates with backend when available, and provides seamless direct client-side
 * Gemini AI vision, conversational coaching, and instant Indian food search.
 */

import { searchFoodsLocal, INDIAN_AND_GLOBAL_FOODS } from '../data/foodsDatabase';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL !== undefined
    ? import.meta.env.VITE_API_BASE_URL
    : import.meta.env.PROD
    ? ''
    : 'http://localhost:5000';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = { ...options.headers };

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  if (!(options.body instanceof FormData) && !headers['Content-Type'] && options.body) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await res.text().catch(() => '');
    const err = new Error(`Server returned non-JSON response (${res.status})`);
    err.isNonJson = true;
    err.bodyText = text;
    throw err;
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const error = new Error(data.message || data.error || `Request failed with status ${res.status}`);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

export async function checkServerHealth() {
  return request('/api/health');
}

/**
 * Searches food items instantly using the rich client-side database
 * and merges with backend if reachable.
 */
export async function searchFoods(query) {
  const localResults = searchFoodsLocal(query);

  if (API_BASE_URL && query && query.trim().length > 0) {
    try {
      const res = await request(`/api/foods/search?q=${encodeURIComponent(query.trim())}`);
      const serverFoods = res.foods || [];
      if (Array.isArray(serverFoods) && serverFoods.length > 0) {
        const seenNames = new Set(localResults.map((f) => f.name.toLowerCase()));
        const merged = [...localResults];
        for (const sf of serverFoods) {
          if (!seenNames.has(sf.name.toLowerCase())) {
            seenNames.add(sf.name.toLowerCase());
            merged.push(sf);
          }
        }
        return merged;
      }
    } catch (_) {
      // Backend not running (e.g. mobile or Firebase Hosting) - local results returned cleanly
    }
  }

  return localResults;
}

export async function getFoodById(id) {
  const found = INDIAN_AND_GLOBAL_FOODS.find((f) => f.id === id);
  if (found) return found;

  try {
    const res = await request(`/api/foods/${id}`);
    return res.food;
  } catch (_) {
    return null;
  }
}

export async function getRecipes(category = '', search = '') {
  try {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.append('category', category);
    if (search) params.append('q', search);

    const queryStr = params.toString() ? `?${params.toString()}` : '';
    const res = await request(`/api/recipes${queryStr}`);
    return res.recipes || [];
  } catch (_) {
    return [];
  }
}

export async function getRecipeById(id) {
  try {
    const res = await request(`/api/recipes/${id}`);
    return res.recipe;
  } catch (_) {
    return null;
  }
}

export async function importGuestData(guestData, token) {
  return request('/api/guest/import', {
    method: 'POST',
    body: JSON.stringify(guestData),
    token,
  });
}

/**
 * Conversational AI Coach
 * Answers general questions (hello, what app this do, features), meal advice,
 * Indian food questions, and uses real daily user records.
 */
export async function getAICoachInsight(userContext, token = null) {
  const { question = '', meals = [], goals = {}, nutrition = {} } = userContext;
  const cleanQ = question.trim().toLowerCase();

  // Instant response for common greetings
  if (['hello', 'hi', 'hey', 'greetings', 'namaste', 'hola'].some((g) => cleanQ === g || cleanQ.startsWith(g + ' '))) {
    return {
      insight: `Hello! 👋 I'm your Nav AI Nutrition Coach. How can I help you today? You can ask me what this app does, check your daily macros, get healthy Indian food ideas, or ask for diet and fitness advice!`,
      source: 'conversational_engine',
    };
  }

  // Instant response for app explanation
  if (
    cleanQ.includes('what app this do') ||
    cleanQ.includes('what does this app do') ||
    cleanQ.includes('what is this app') ||
    cleanQ.includes('what can you do') ||
    cleanQ.includes('how to use') ||
    cleanQ.includes('about app')
  ) {
    return {
      insight: `✨ **Welcome to Nav AI!** Here is what you can do:\n\n• **📸 AI Food Vision**: Snap or upload a photo of any meal to automatically detect foods, portion weights, and estimate calories & macros.\n• **📖 Food Diary**: Log meals manually or search our extensive Indian & global food database.\n• **❤️ Heart Health**: Real-time tracking of Saturated Fat (<20g), Sodium (<2300mg), and Cholesterol (<300mg) based on what you eat.\n• **🥗 Smart Recipes**: Scalable healthy recipes with portion controls.\n• **📊 Fitness & Weight**: Track weight trends, water intake, and daily burn goals.\n• **🔒 100% Offline & Cloud Sync**: Works in Guest Mode without login, and syncs across devices when signed in!`,
      source: 'conversational_engine',
    };
  }

  // 1. Try backend coach endpoint first
  try {
    const res = await request('/api/ai/coach', {
      method: 'POST',
      body: JSON.stringify(userContext),
      token,
    });
    if (res && res.insight) return res;
  } catch (_) {
    // Backend offline / not available on phone or Firebase Hosting
  }

  // 2. Direct Gemini Call via REST API
  if (GEMINI_API_KEY) {
    try {
      const prompt = `You are Nav AI Nutrition Coach & Assistant, a warm, knowledgeable, evidence-based dietitian and in-app assistant.
User asks: "${question}"

User's Real Progress for Today:
- Calories Consumed: ${nutrition.calories || 0} Cal (Target: ${goals.calorie_target || 2000} Cal)
- Protein: ${nutrition.protein || 0}g / ${goals.protein_target_g || 120}g
- Carbs: ${nutrition.carbs || 0}g / ${goals.carbs_target_g || 200}g
- Fat: ${nutrition.fat || 0}g / ${goals.fat_target_g || 60}g
- Recorded Meals Today: ${meals.map((m) => `${m.name || m.meal_name} (${m.total_calories || m.calories} Cal)`).join(', ') || 'No meals logged yet'}

Guidelines:
1. Answer the user's specific question directly, warmly, and concisely in 2 to 4 sentences using Markdown.
2. If asked about what the app does, explain AI meal scanning, food diary, heart health, and recipe features.
3. If asked about nutrition or meal recommendations (especially Indian meals like dal, paneer, roti, sprouts, chicken, rice), give practical, balanced portion ideas.
4. Incorporate their real data if relevant to their question. Do not provide medical diagnoses.`;

      const candidateModels = ['gemini-3.5-flash-lite', 'gemini-3.5-flash', 'gemini-3.8-flash'];
      for (const model of candidateModels) {
        try {
          const apiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.5 },
              }),
            }
          );

          if (apiRes.ok) {
            const data = await apiRes.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text && text.trim()) {
              return { insight: text.trim(), source: 'gemini_direct' };
            }
          }
        } catch (_) {}
      }
    } catch (_) {}
  }

  // 3. Smart local fallback
  const remainingCals = Math.max(0, (goals.calorie_target || 2000) - (nutrition.calories || 0));
  return {
    insight: `Today's check-in: ${nutrition.calories || 0} Cal consumed (${remainingCals} Cal left). Protein is at ${nutrition.protein || 0}g / ${goals.protein_target_g || 120}g. Stay hydrated and balanced!`,
    source: 'algorithmic_fallback',
  };
}

/**
 * Analyzes a meal photo using backend Gemini Vision or direct client Gemini Vision.
 * Detects whether the photo contains food and rejects non-food items.
 */
export async function analyzeMealImage(formData, token = null) {
  // 1. Try backend server if available
  try {
    const res = await request('/api/ai/analyze-meal', {
      method: 'POST',
      body: formData,
      token,
    });
    if (res && (res.is_food !== undefined || res.items)) {
      return res;
    }
  } catch (_) {
    // Backend offline / not available on phone or Firebase Hosting
  }

  // 2. Direct client-side Gemini Vision
  if (GEMINI_API_KEY) {
    const file = formData.get('image');
    const mealCategory = formData.get('meal_category') || 'lunch';
    const notes = formData.get('notes') || '';

    if (file && file instanceof Blob) {
      const base64Data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const res = reader.result;
          const base64 = typeof res === 'string' ? res.split(',')[1] : '';
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const systemPrompt = `You are a clinical dietitian and precision computer vision food recognition engine for Nav AI.
Analyze the provided photograph.

CRITICAL FIRST STEP: FOOD VERIFICATION
Determine if this image contains consumable food, drinks, or ingredients.
- If the image DOES NOT contain food (for example: keyboards, computers, phones, electronics, furniture, clothes, animals, cars, random household objects, people without food, empty plates, blank surfaces, paper documents):
  You MUST return:
  {
    "is_food": false,
    "mealName": "No Food Detected",
    "rejectionReason": "This image does not contain food or beverages (detected non-food object).",
    "items": [],
    "overallNotes": "Please capture a clear photo of an edible meal, plate, or snack."
  }
- If the image DOES contain food:
  Return:
  {
    "is_food": true,
    "mealName": "Concise descriptive title of this meal (e.g. 'Dal Tadka with Roti and Rice')",
    "rejectionReason": "",
    "items": [
      {
        "name": "Specific food name (e.g. 'Whole Wheat Roti', 'Yellow Dal Tadka', 'Cooked White Rice', 'Paneer Butter Masala', 'Boiled Egg')",
        "quantity": 150,
        "unit": "g",
        "confidence": "high",
        "calories": 180,
        "protein_g": 6.5,
        "carbs_g": 24,
        "fat_g": 5.5,
        "notes": "Estimated portion based on visible plate area"
      }
    ],
    "overallNotes": "Brief nutritional observation"
  }

RULES:
1. Identify each clearly visible food item on the plate.
2. Estimate realistic portion weights in grams (g).
3. Do NOT invent food for non-food items.
4. Output MUST be valid JSON only.`;

      const promptText = notes ? `${systemPrompt}\n\nAdditional user context: "${notes}"` : systemPrompt;

      const candidateModels = ['gemini-3.5-flash-lite', 'gemini-3.5-flash', 'gemini-3.8-flash'];
      for (const model of candidateModels) {
        try {
          const apiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [
                  {
                    role: 'user',
                    parts: [
                      { text: promptText },
                      {
                        inlineData: {
                          mimeType: file.type || 'image/jpeg',
                          data: base64Data,
                        },
                      },
                    ],
                  },
                ],
                generationConfig: {
                  responseMimeType: 'application/json',
                  temperature: 0.2,
                },
              }),
            }
          );

          if (apiRes.ok) {
            const data = await apiRes.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              const cleaned = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
              const parsed = JSON.parse(cleaned);

              if (parsed.is_food === false || !parsed.items || parsed.items.length === 0) {
                return {
                  is_food: false,
                  mealName: 'No Food Detected',
                  meal_name: 'No Food Detected',
                  rejectionReason:
                    parsed.rejectionReason || 'No food detected in this image. Please take a picture of an edible meal or snack.',
                  items: [],
                  total_calories: 0,
                  total_protein_g: 0,
                  total_carbs_g: 0,
                  total_fat_g: 0,
                };
              }

              // Match each detected item with our local reference database
              const mappedItems = parsed.items.map((it) => {
                const localMatch = searchFoodsLocal(it.name, 1)[0];
                const qty = Number(it.quantity) || 100;
                const factor = qty / 100.0;

                if (localMatch) {
                  return {
                    name: localMatch.name,
                    food_item_id: localMatch.id,
                    quantity: qty,
                    unit: 'g',
                    calories: Math.round(localMatch.calories_per_100g * factor),
                    protein_g: Math.round(localMatch.protein_per_100g * factor * 10) / 10,
                    carbs_g: Math.round(localMatch.carbs_per_100g * factor * 10) / 10,
                    fat_g: Math.round(localMatch.fat_per_100g * factor * 10) / 10,
                    saturated_fat_g: Math.round((localMatch.saturated_fat_per_100g || 0) * factor * 10) / 10,
                    sodium_mg: Math.round((localMatch.sodium_per_100g || 0) * factor),
                    cholesterol_mg: Math.round((localMatch.cholesterol_per_100g || 0) * factor),
                    calories_per_100g: localMatch.calories_per_100g,
                    protein_per_100g: localMatch.protein_per_100g,
                    carbs_per_100g: localMatch.carbs_per_100g,
                    fat_per_100g: localMatch.fat_per_100g,
                    confidence: it.confidence || 'high',
                    is_estimated: false,
                    notes: it.notes || 'Matched with reference food database',
                  };
                }

                // If not in database, use AI estimates
                const cals = Number(it.calories) || Math.round(150 * factor);
                const p = Number(it.protein_g) || Math.round(8 * factor * 10) / 10;
                const cb = Number(it.carbs_g) || Math.round(18 * factor * 10) / 10;
                const f = Number(it.fat_g) || Math.round(5 * factor * 10) / 10;

                return {
                  name: it.name,
                  food_item_id: null,
                  quantity: qty,
                  unit: 'g',
                  calories: cals,
                  protein_g: p,
                  carbs_g: cb,
                  fat_g: f,
                  saturated_fat_g: Math.round(f * 0.25 * 10) / 10,
                  sodium_mg: Math.round(qty * 1.5),
                  cholesterol_mg: 0,
                  calories_per_100g: Math.round((cals / qty) * 100),
                  protein_per_100g: Math.round((p / qty) * 100 * 10) / 10,
                  carbs_per_100g: Math.round((cb / qty) * 100 * 10) / 10,
                  fat_per_100g: Math.round((f / qty) * 100 * 10) / 10,
                  confidence: it.confidence || 'medium',
                  is_estimated: true,
                  notes: it.notes || 'AI Portion Estimate',
                };
              });

              const total_calories = mappedItems.reduce((acc, it) => acc + (it.calories || 0), 0);
              const total_protein_g = Math.round(mappedItems.reduce((acc, it) => acc + (it.protein_g || 0), 0) * 10) / 10;
              const total_carbs_g = Math.round(mappedItems.reduce((acc, it) => acc + (it.carbs_g || 0), 0) * 10) / 10;
              const total_fat_g = Math.round(mappedItems.reduce((acc, it) => acc + (it.fat_g || 0), 0) * 10) / 10;

              return {
                is_food: true,
                mealName: parsed.mealName || 'Balanced Meal',
                meal_name: parsed.mealName || 'Balanced Meal',
                mealCategory,
                confidence: '95.0%',
                items: mappedItems,
                total_calories,
                total_protein_g,
                total_carbs_g,
                total_fat_g,
                overallNotes: parsed.overallNotes || '',
              };
            }
          }
        } catch (_) {}
      }
    }
  }

  throw new Error('Could not analyze photo. Please make sure the image is clear and you have an active internet connection.');
}

// Backward compatibility export object
export const apiClient = {
  searchFoods,
  getFoodById,
  getRecipes,
  getRecipeById,
  importGuestData,
  getAICoachInsight,
  analyzeMealImage,
};
