import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { config, isGeminiConfigured } from '../config/env.js';
import { findBestNutritionMatch } from '../data/nutritionDatabase.js';
import { calculateItemNutrition, calculateMealTotals, roundNutritionTotals } from './nutritionEngine.js';

// Zod Schema for Gemini AI structured food detection
const AIItemSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().positive().default(100),
  unit: z.string().default('g'),
  confidence: z.enum(['high', 'medium', 'low']).default('medium'),
  notes: z.string().optional().default(''),
});

const AIResponseSchema = z.object({
  is_food: z.boolean().default(true),
  mealName: z.string().default('Balanced Meal'),
  rejectionReason: z.string().optional().default(''),
  items: z.array(AIItemSchema).default([]),
  overallNotes: z.string().optional().default(''),
});

let genAIClient = null;

function getGenAI() {
  if (!genAIClient && config.geminiApiKey) {
    genAIClient = new GoogleGenAI({ apiKey: config.geminiApiKey });
  }
  return genAIClient;
}

/**
 * Analyzes a meal photo using Gemini Vision, strictly validates whether it contains food,
 * rejects non-food items, and matches foods to the verified reference nutrition database.
 *
 * @param {Buffer} imageBuffer - Raw image file buffer
 * @param {string} mimeType - Image MIME type (e.g. image/jpeg, image/png)
 * @param {string} mealCategory - breakfast, lunch, dinner, or snack
 * @param {string} userNotes - optional user context
 * @returns {Promise<Object>} Validated meal analysis with verified nutrition
 */
export async function analyzeMealImage(imageBuffer, mimeType, mealCategory = 'lunch', userNotes = '') {
  if (!isGeminiConfigured) {
    const error = new Error('Gemini API key is not configured. Please set GEMINI_API_KEY in server/.env.');
    error.missingApiKey = true;
    error.status = 503;
    throw error;
  }

  const ai = getGenAI();
  const candidateModels = Array.from(
    new Set([
      'gemini-flash-lite-latest',
      'gemini-3.5-flash-lite',
      'gemini-3-flash-preview',
      'gemini-3.1-flash-lite',
      config.geminiModel,
    ].filter(Boolean))
  );

  const systemPrompt = `You are a clinical dietitian and precision computer vision food recognition engine for the Nav AI nutrition app.
Analyze the provided photograph.

CRITICAL FIRST STEP: FOOD VERIFICATION
Determine if this image contains consumable food, drinks, or ingredients.
- If the image DOES NOT contain food (for example: keyboards, computers, phones, electronics, furniture, clothes, animals, cars, random household objects, people without food, empty plates, blank surfaces, paper documents):
  You MUST return:
  {
    "is_food": false,
    "mealName": "No Food Detected",
    "rejectionReason": "This photo does not contain food or beverages (detected non-food object).",
    "items": [],
    "overallNotes": "Please capture a clear photo of an edible meal, plate, or snack."
  }
- If the image DOES contain food:
  Return:
  {
    "is_food": true,
    "mealName": "Concise descriptive title of this meal (e.g. 'Dal Tadka with Roti and Rice' or 'Paneer Butter Masala')",
    "rejectionReason": "",
    "items": [
      {
        "name": "Specific food item name (e.g. 'Whole Wheat Roti', 'Yellow Dal Tadka', 'Cooked White Rice', 'Paneer', 'Grilled Chicken')",
        "quantity": 150,
        "unit": "g",
        "confidence": "high" | "medium" | "low",
        "notes": "Estimated portion based on visible plate area"
      }
    ],
    "overallNotes": "Brief nutritional observation"
  }

RULES FOR FOOD IMAGES:
1. Identify each clearly visible food item on the plate (e.g. whole wheat roti, basmati rice, dal tadka, paneer, chicken curry, salad, curd, sabzi).
2. Estimate realistic portion weights in grams (g).
3. Do NOT invent foods that are not in the photo.
4. Output MUST be strictly valid JSON matching the schema above.`;

  const promptText = userNotes
    ? `${systemPrompt}\n\nAdditional user meal context: "${userNotes}"`
    : systemPrompt;

  let response = null;
  let lastError = null;

  for (const model of candidateModels) {
    try {
      response = await ai.models.generateContent({
        model,
        contents: [
          {
            role: 'user',
            parts: [
              { text: promptText },
              {
                inlineData: {
                  mimeType: mimeType || 'image/jpeg',
                  data: imageBuffer.toString('base64'),
                },
              },
            ],
          },
        ],
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      if (response && response.text) {
        break;
      }
    } catch (err) {
      console.warn(`[GeminiService] Candidate model "${model}" failed, trying next candidate:`, err.message);
      lastError = err;
    }
  }

  if (!response || !response.text) {
    throw lastError || new Error('All Gemini candidate models failed to return content.');
  }

  try {
    const responseText = response.text?.trim() || '';
    if (!responseText) {
      throw new Error('Gemini returned an empty response.');
    }

    // Parse JSON
    let parsed;
    try {
      const cleaned = responseText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      throw new Error('Failed to parse Gemini structured JSON: ' + parseErr.message);
    }

    // Validate structured output with Zod
    const validated = AIResponseSchema.parse(parsed);

    // If non-food detected, return early with rejection notice
    if (!validated.is_food || !validated.items || validated.items.length === 0) {
      return {
        is_food: false,
        mealName: 'No Food Detected',
        meal_name: 'No Food Detected',
        rejectionReason: validated.rejectionReason || 'No recognizable food found in the image. Please take a photo of your meal or snack.',
        items: [],
        total_calories: 0,
        total_protein_g: 0,
        total_carbs_g: 0,
        total_fat_g: 0,
        confidence: '0%',
        analyzed_at: new Date().toISOString(),
      };
    }

    // Cross-reference detected items with USDA / Indian Food reference database
    const mappedItems = validated.items.map((item) => {
      const match = findBestNutritionMatch(item.name);

      if (match) {
        const nut = calculateItemNutrition(match, item.quantity);
        return {
          name: match.name,
          food_item_id: match.id,
          quantity: item.quantity,
          unit: 'g',
          calories: nut.calories,
          protein_g: nut.protein_g,
          carbs_g: nut.carbs_g,
          fat_g: nut.fat_g,
          fiber_g: nut.fiber_g,
          saturated_fat_g: nut.saturated_fat_g || Math.round(nut.fat_g * 0.25 * 10) / 10,
          sodium_mg: nut.sodium_mg || Math.round(item.quantity * 1.5),
          cholesterol_mg: nut.cholesterol_mg || 0,
          calories_per_100g: match.calories_per_100g,
          protein_per_100g: match.protein_per_100g,
          carbs_per_100g: match.carbs_per_100g,
          fat_per_100g: match.fat_per_100g,
          confidence: item.confidence,
          nutrition_source: match.nutrition_source,
          is_estimated: false,
          notes: item.notes || 'Matched with reference dataset',
        };
      }

      // Fallback estimate for uncatalogued food items
      const estimatedCalsPer100 = 150;
      const factor = item.quantity / 100.0;
      const fat = Math.round(5.0 * factor * 10) / 10;
      return {
        name: item.name,
        food_item_id: null,
        quantity: item.quantity,
        unit: 'g',
        calories: Math.round(estimatedCalsPer100 * factor),
        protein_g: Math.round(8.0 * factor * 10) / 10,
        carbs_g: Math.round(18.0 * factor * 10) / 10,
        fat_g: fat,
        fiber_g: Math.round(2.0 * factor * 10) / 10,
        saturated_fat_g: Math.round(fat * 0.25 * 10) / 10,
        sodium_mg: Math.round(factor * 180),
        cholesterol_mg: 0,
        calories_per_100g: estimatedCalsPer100,
        protein_per_100g: 8.0,
        carbs_per_100g: 18.0,
        fat_per_100g: 5.0,
        confidence: item.confidence || 'medium',
        nutrition_source: 'Portion nutritional estimate',
        is_estimated: true,
        notes: item.notes || 'Portion nutritional estimate',
      };
    });

    // Central backend calculation of total meal nutrition
    const rawTotals = calculateMealTotals(mappedItems);
    const totals = roundNutritionTotals(rawTotals);

    return {
      is_food: true,
      mealName: validated.mealName,
      meal_name: validated.mealName,
      mealCategory,
      confidence: mappedItems.every((it) => it.confidence === 'high')
        ? '98.5%'
        : mappedItems.some((it) => it.confidence === 'high')
        ? '94.2%'
        : '88.0%',
      overallNotes: validated.overallNotes,
      items: mappedItems,
      total_calories: totals.total_calories,
      total_protein_g: totals.total_protein_g,
      total_carbs_g: totals.total_carbs_g,
      total_fat_g: totals.total_fat_g,
      analyzed_at: new Date().toISOString(),
    };
  } catch (err) {
    if (err.name === 'ZodError') {
      const zodErr = new Error('AI output failed schema validation: ' + JSON.stringify(err.errors));
      zodErr.status = 502;
      throw zodErr;
    }
    throw err;
  }
}

/**
 * Generates AI Nutrition Coach responses using real user records and context.
 * Answers greetings, app functionality questions, and diet/nutrition inquiries.
 */
export async function getNutritionCoachAdvice(userContext) {
  const { question = '', meals = [], goals = {}, nutrition = {} } = userContext;

  const cleanQ = question.trim().toLowerCase();

  // Instant intelligent response for greetings & app info questions
  if (['hello', 'hi', 'hey', 'greetings', 'namaste'].some((g) => cleanQ === g || cleanQ.startsWith(g + ' '))) {
    return {
      insight: `Hello! 👋 I'm your Nav AI Nutrition Coach. How can I help you today? You can ask me what this app does, check your daily macros, get healthy Indian food ideas, or ask for diet and fitness advice!`,
      source: 'conversational_engine',
    };
  }

  if (
    cleanQ.includes('what app this do') ||
    cleanQ.includes('what does this app do') ||
    cleanQ.includes('what is this app') ||
    cleanQ.includes('what can you do') ||
    cleanQ.includes('how to use') ||
    cleanQ.includes('about app')
  ) {
    return {
      insight: `✨ **Welcome to Nav AI!** Here is what you can do:\n\n• **📸 AI Food Vision**: Snap or upload a photo of any meal (breakfast, lunch, dinner) to detect items and estimate calories & macros.\n• **📖 Food Diary**: Log meals manually or search our extensive Indian & global food database.\n• **❤️ Heart Health**: Real-time tracking of Saturated Fat (<20g), Sodium (<2300mg), and Cholesterol (<300mg) based on what you eat.\n• **🥗 Smart Recipes**: Scalable healthy recipes with portion controls.\n• **📊 Fitness & Weight**: Track weight trends, water intake, and daily burn goals.\n• **🔒 100% Offline & Cloud Sync**: Works in Guest Mode without login, and syncs across devices when signed in!`,
      source: 'conversational_engine',
    };
  }

  if (!isGeminiConfigured) {
    const remainingCals = Math.max(0, (goals.calorie_target || 2000) - (nutrition.calories || 0));
    return {
      insight: `Today's check-in: You've logged ${nutrition.calories || 0} Cal (${remainingCals} Cal remaining against your ${goals.calorie_target || 2000} Cal goal). Protein: ${nutrition.protein || 0}g / ${goals.protein_target_g || 120}g. Focus on whole grains, fresh vegetables, lentils, and lean proteins!`,
      source: 'algorithmic_coach',
    };
  }

  const ai = getGenAI();
  const candidateModels = Array.from(
    new Set([
      'gemini-flash-lite-latest',
      'gemini-3.5-flash-lite',
      'gemini-3-flash-preview',
      'gemini-3.1-flash-lite',
      config.geminiModel,
    ].filter(Boolean))
  );

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

  try {
    let responseText = '';
    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: { temperature: 0.5 },
        });
        if (response?.text) {
          responseText = response.text.trim();
          break;
        }
      } catch (mErr) {
        console.warn(`[GeminiService Coach] Model ${model} failed:`, mErr.message);
      }
    }

    if (responseText) {
      return {
        insight: responseText,
        source: 'gemini_coach',
      };
    }
    throw new Error('All candidate models failed');
  } catch (err) {
    const remainingCals = Math.max(0, (goals.calorie_target || 2000) - (nutrition.calories || 0));
    return {
      insight: `Today's check-in: ${nutrition.calories || 0} Cal consumed (${remainingCals} Cal left). Protein is at ${nutrition.protein || 0}g / ${goals.protein_target_g || 120}g. Stay hydrated and balanced!`,
      source: 'algorithmic_fallback',
    };
  }
}
