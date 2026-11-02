import { z } from 'zod';
import { supabaseClient } from '../services/supabaseService.js';
import { calculateMealTotals, finalizeMealTotals } from '../services/nutritionEngine.js';

const guestImportSchema = z.object({
  meals: z.array(
    z.object({
      id: z.string().optional(),
      mealDate: z.string(),
      mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
      name: z.string(),
      notes: z.string().optional().nullable(),
      items: z.array(
        z.object({
          name: z.string(),
          quantity: z.number(),
          unit: z.string().default('g'),
          calories: z.number().default(0),
          protein: z.number().default(0),
          carbs: z.number().default(0),
          fat: z.number().default(0),
          nutritionSource: z.string().optional(),
          isEstimated: z.boolean().optional(),
        })
      ),
    })
  ).optional().default([]),
  waterLogs: z.array(
    z.object({
      quantityMl: z.number().positive(),
      loggedAt: z.string(),
    })
  ).optional().default([]),
  weightLogs: z.array(
    z.object({
      weightKg: z.number().positive(),
      recordedAt: z.string(),
      notes: z.string().optional().nullable(),
    })
  ).optional().default([]),
  profile: z.object({
    displayName: z.string().optional(),
    heightCm: z.number().optional().nullable(),
    currentWeightKg: z.number().optional().nullable(),
    activityLevel: z.string().optional(),
    goalType: z.string().optional(),
    dietaryPreference: z.string().optional(),
  }).optional().nullable(),
});

/**
 * POST /api/guest/import - Migrates IndexedDB records to authenticated Supabase account
 */
export async function importGuestData(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required for migration.', code: 'UNAUTHORIZED' });
    }

    if (!supabaseClient) {
      return res.status(503).json({ error: 'Supabase service is not active.', code: 'DB_UNAVAILABLE' });
    }

    const parseResult = guestImportSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Invalid import payload.',
        code: 'VALIDATION_ERROR',
        details: parseResult.error.errors,
      });
    }

    const { meals, waterLogs, weightLogs, profile } = parseResult.data;
    let importedMealsCount = 0;
    let importedWaterCount = 0;
    let importedWeightCount = 0;

    // 1. Update Profile if provided
    if (profile) {
      await supabaseClient
        .from('profiles')
        .upsert({
          id: userId,
          display_name: profile.displayName || undefined,
          height_cm: profile.heightCm || undefined,
          current_weight_kg: profile.currentWeightKg || undefined,
          activity_level: profile.activityLevel || undefined,
          goal_type: profile.goalType || undefined,
          dietary_preference: profile.dietaryPreference || undefined,
        });
    }

    // 2. Import Meals and nested items
    for (const meal of meals) {
      const totals = finalizeMealTotals(calculateMealTotals(meal.items));
      const { data: insertedMeal, error: mealErr } = await supabaseClient
        .from('meals')
        .insert({
          user_id: userId,
          meal_date: meal.mealDate,
          meal_type: meal.mealType,
          name: meal.name,
          notes: meal.notes || null,
          total_calories: totals.totalCalories,
          total_protein_g: totals.totalProtein,
          total_carbs_g: totals.totalCarbs,
          total_fat_g: totals.totalFat,
          nutrition_is_estimated: totals.nutritionIsEstimated,
        })
        .select()
        .single();

      if (!mealErr && insertedMeal && meal.items?.length > 0) {
        const itemRows = meal.items.map(item => ({
          meal_id: insertedMeal.id,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          calories: item.calories,
          protein_g: item.protein,
          carbs_g: item.carbs,
          fat_g: item.fat,
          nutrition_source: item.nutritionSource || 'Guest Data',
          is_estimated: Boolean(item.isEstimated),
        }));

        await supabaseClient.from('meal_items').insert(itemRows);
        importedMealsCount++;
      }
    }

    // 3. Import Water Logs
    if (waterLogs.length > 0) {
      const waterRows = waterLogs.map(w => ({
        user_id: userId,
        quantity_ml: w.quantityMl,
        logged_at: w.loggedAt,
      }));
      const { data, error } = await supabaseClient.from('water_logs').insert(waterRows).select();
      if (!error && data) importedWaterCount = data.length;
    }

    // 4. Import Weight Logs
    if (weightLogs.length > 0) {
      const weightRows = weightLogs.map(w => ({
        user_id: userId,
        weight_kg: w.weightKg,
        recorded_at: w.recordedAt,
        notes: w.notes || null,
      }));
      const { data, error } = await supabaseClient.from('weight_logs').insert(weightRows).select();
      if (!error && data) importedWeightCount = data.length;
    }

    return res.status(200).json({
      success: true,
      message: 'Guest data successfully imported into your account!',
      stats: {
        importedMealsCount,
        importedWaterCount,
        importedWeightCount,
      },
    });
  } catch (err) {
    console.error('Guest import error:', err);
    return res.status(500).json({ error: err.message, code: 'IMPORT_FAILED' });
  }
}

