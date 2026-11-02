import { z } from 'zod';
import { supabaseClient } from '../services/supabaseService.js';
import { calculateMealTotals, finalizeMealTotals, calculateItemNutrients } from '../services/nutritionEngine.js';
import { matchFoodItem } from '../services/foodDb.js';

const mealItemInputSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  quantity: z.number().positive('Quantity must be greater than 0'),
  unit: z.string().default('g'),
  calories: z.number().nonnegative().optional(),
  protein: z.number().nonnegative().optional(),
  carbs: z.number().nonnegative().optional(),
  fat: z.number().nonnegative().optional(),
  nutritionSource: z.string().optional(),
  isEstimated: z.boolean().optional(),
});

const createMealSchema = z.object({
  name: z.string().min(1, 'Meal name is required'),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  mealDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').default(() => new Date().toISOString().split('T')[0]),
  notes: z.string().optional().nullable(),
  imagePath: z.string().optional().nullable(),
  items: z.array(mealItemInputSchema).min(1, 'At least one meal item is required'),
});

/**
 * GET /api/meals - Retrieve meals for user on a specific date
 */
export async function getMeals(req, res) {
  try {
    const userId = req.user?.id;
    const date = req.query.date || new Date().toISOString().split('T')[0];

    if (!supabaseClient || !userId) {
      return res.json({ success: true, meals: [] });
    }

    const { data: meals, error } = await supabaseClient
      .from('meals')
      .select('*, meal_items(*)')
      .eq('user_id', userId)
      .eq('meal_date', date)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching meals:', error.message);
      return res.status(500).json({ error: 'Failed to fetch meals from database.', code: 'DB_ERROR' });
    }

    return res.json({ success: true, date, meals: meals || [] });
  } catch (err) {
    return res.status(500).json({ error: err.message, code: 'SERVER_ERROR' });
  }
}

/**
 * POST /api/meals - Validate, recalculate, and persist a meal
 */
export async function createMeal(req, res) {
  try {
    const parseResult = createMealSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Invalid meal payload.',
        code: 'VALIDATION_ERROR',
        details: parseResult.error.errors,
      });
    }

    const data = parseResult.data;
    const userId = req.user?.id;

    // Validate and recompute items on backend to guarantee nutrition integrity
    const computedItems = data.items.map(item => {
      const match = matchFoodItem(item.name);
      return calculateItemNutrients(item, match);
    });

    const rawTotals = calculateMealTotals(computedItems);
    const totals = finalizeMealTotals(rawTotals);

    // If user is authenticated and Supabase is active, persist to database
    if (supabaseClient && userId) {
      const { data: mealRow, error: mealErr } = await supabaseClient
        .from('meals')
        .insert({
          user_id: userId,
          meal_date: data.mealDate,
          meal_type: data.mealType,
          name: data.name,
          notes: data.notes || null,
          image_path: data.imagePath || null,
          total_calories: totals.totalCalories,
          total_protein_g: totals.totalProtein,
          total_carbs_g: totals.totalCarbs,
          total_fat_g: totals.totalFat,
          nutrition_is_estimated: totals.nutritionIsEstimated,
        })
        .select()
        .single();

      if (mealErr) {
        console.error('Error saving meal:', mealErr.message);
        return res.status(500).json({ error: 'Failed to persist meal record.', code: 'DB_ERROR' });
      }

      // Insert meal items
      const itemRows = computedItems.map(item => ({
        meal_id: mealRow.id,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        calories: item.calories,
        protein_g: item.protein,
        carbs_g: item.carbs,
        fat_g: item.fat,
        nutrition_source: item.nutritionSource,
        is_estimated: item.isEstimated,
      }));

      const { data: insertedItems, error: itemsErr } = await supabaseClient
        .from('meal_items')
        .insert(itemRows)
        .select();

      if (itemsErr) {
        console.error('Error saving meal items:', itemsErr.message);
      }

      return res.status(201).json({
        success: true,
        meal: {
          ...mealRow,
          items: insertedItems || computedItems,
        },
      });
    }

    // Guest / calculation response
    return res.status(200).json({
      success: true,
      meal: {
        id: 'guest_' + Date.now(),
        mealDate: data.mealDate,
        mealType: data.mealType,
        name: data.name,
        notes: data.notes || null,
        imagePath: data.imagePath || null,
        totalCalories: totals.totalCalories,
        totalProtein: totals.totalProtein,
        totalCarbs: totals.totalCarbs,
        totalFat: totals.totalFat,
        nutritionIsEstimated: totals.nutritionIsEstimated,
        items: computedItems,
      },
    });
  } catch (err) {
    console.error('Create meal error:', err);
    return res.status(500).json({ error: err.message, code: 'SERVER_ERROR' });
  }
}

/**
 * DELETE /api/meals/:id
 */
export async function deleteMeal(req, res) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!supabaseClient || !userId) {
      return res.status(200).json({ success: true, message: 'Meal deleted locally.' });
    }

    const { error } = await supabaseClient
      .from('meals')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      return res.status(500).json({ error: error.message, code: 'DB_ERROR' });
    }

    return res.json({ success: true, message: 'Meal deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ error: err.message, code: 'SERVER_ERROR' });
  }
}

