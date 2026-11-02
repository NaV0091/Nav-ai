import express from 'express';
import { z } from 'zod';
import { requireAuth, getSupabaseServer } from '../middleware/authMiddleware.js';

const router = express.Router();

// Validation schema for guest export bundle
const GuestImportSchema = z.object({
  profile: z.object({
    age: z.number().optional(),
    height_cm: z.number().optional(),
    current_weight_kg: z.number().optional(),
    activity_level: z.string().optional(),
    goal_type: z.string().optional(),
    dietary_preference: z.string().optional(),
  }).optional(),
  daily_goals: z.object({
    calorie_target: z.number().optional(),
    protein_target_g: z.number().optional(),
    carbs_target_g: z.number().optional(),
    fat_target_g: z.number().optional(),
    water_target_ml: z.number().optional(),
  }).optional(),
  meals: z.array(z.object({
    meal_date: z.string(),
    meal_type: z.string(),
    name: z.string(),
    notes: z.string().optional(),
    total_calories: z.number(),
    total_protein_g: z.number(),
    total_carbs_g: z.number(),
    total_fat_g: z.number(),
    items: z.array(z.object({
      name: z.string(),
      quantity: z.number(),
      unit: z.string().default('g'),
      calories: z.number(),
      protein_g: z.number(),
      carbs_g: z.number(),
      fat_g: z.number(),
      nutrition_source: z.string().optional(),
      is_estimated: z.boolean().optional(),
    })).optional(),
  })).default([]),
  weight_logs: z.array(z.object({
    weight_kg: z.number(),
    recorded_at: z.string(),
    notes: z.string().optional(),
  })).default([]),
});

/**
 * POST /api/guest/import
 * Authenticated endpoint for migrating local IndexedDB guest records into Supabase.
 */
router.post('/import', requireAuth, async (req, res, next) => {
  try {
    const validated = GuestImportSchema.parse(req.body);
    const userId = req.user.id;
    const client = getSupabaseServer();

    if (!client) {
      return res.status(503).json({
        error: 'Database Unavailable',
        message: 'Supabase server client is not configured.',
      });
    }

    let importedMealsCount = 0;
    let importedWeightsCount = 0;

    // 1. Sync Daily Goals if provided
    if (validated.daily_goals) {
      await client.from('daily_goals').upsert({
        user_id: userId,
        calorie_target: validated.daily_goals.calorie_target || 2000,
        protein_target_g: validated.daily_goals.protein_target_g || 120,
        carbs_target_g: validated.daily_goals.carbs_target_g || 200,
        fat_target_g: validated.daily_goals.fat_target_g || 60,
        water_target_ml: validated.daily_goals.water_target_ml || 2500,
      });
    }

    // 2. Sync Profile Settings
    if (validated.profile) {
      await client.from('profiles').update({
        age: validated.profile.age,
        height_cm: validated.profile.height_cm,
        current_weight_kg: validated.profile.current_weight_kg,
        activity_level: validated.profile.activity_level,
        goal_type: validated.profile.goal_type,
        updated_at: new Date().toISOString(),
      }).eq('id', userId);
    }

    // 3. Import Meals & Items
    for (const m of validated.meals) {
      // Insert meal parent
      const { data: insertedMeal, error: mealErr } = await client
        .from('meals')
        .insert({
          user_id: userId,
          meal_date: m.meal_date,
          meal_type: m.meal_type,
          name: m.name,
          notes: m.notes || 'Imported from Guest Session',
          total_calories: m.total_calories,
          total_protein_g: m.total_protein_g,
          total_carbs_g: m.total_carbs_g,
          total_fat_g: m.total_fat_g,
          nutrition_is_estimated: true,
        })
        .select()
        .single();

      if (!mealErr && insertedMeal && m.items && m.items.length > 0) {
        importedMealsCount += 1;
        const itemsToInsert = m.items.map((it) => ({
          meal_id: insertedMeal.id,
          name: it.name,
          quantity: it.quantity,
          unit: it.unit || 'g',
          calories: it.calories,
          protein_g: it.protein_g,
          carbs_g: it.carbs_g,
          fat_g: it.fat_g,
          nutrition_source: it.nutrition_source || 'Guest Import',
          is_estimated: it.is_estimated ?? true,
        }));

        await client.from('meal_items').insert(itemsToInsert);
      }
    }

    // 4. Import Weight Logs
    for (const w of validated.weight_logs) {
      const { error: weightErr } = await client.from('weight_logs').insert({
        user_id: userId,
        weight_kg: w.weight_kg,
        recorded_at: w.recorded_at,
        notes: w.notes || 'Imported from Guest Session',
      });
      if (!weightErr) importedWeightsCount += 1;
    }

    res.json({
      success: true,
      importedMeals: importedMealsCount,
      importedWeights: importedWeightsCount,
      message: `Successfully migrated ${importedMealsCount} meals and ${importedWeightsCount} weight entries into your account!`,
    });
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({
        error: 'Invalid Payload',
        details: err.errors,
      });
    }
    next(err);
  }
});

export default router;

