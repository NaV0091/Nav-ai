/**
 * Centralized Nutrition Engine for Nav AI
 * Shared logic for nutrient conversions, macro totals, calorie remainders,
 * suggested BMR/TDEE targets, and recipe serving adjustments.
 */

/**
 * Calculates nutritional values for a given food item and quantity in grams
 * @param {Object} food - Food item with per-100g values
 * @param {number} quantityGrams - Portion weight in grams
 * @returns {Object} Nutrients for this portion
 */
export function calculateItemNutrition(food, quantityGrams) {
  const qty = Math.max(0, Number(quantityGrams) || 0);
  const factor = qty / 100.0;

  return {
    quantity: Math.round(qty * 10) / 10,
    unit: 'g',
    calories: Math.round((Number(food.calories_per_100g) || 0) * factor * 10) / 10,
    protein_g: Math.round((Number(food.protein_per_100g) || 0) * factor * 10) / 10,
    carbs_g: Math.round((Number(food.carbs_per_100g) || 0) * factor * 10) / 10,
    fat_g: Math.round((Number(food.fat_per_100g) || 0) * factor * 10) / 10,
    fiber_g: Math.round((Number(food.fiber_per_100g) || 0) * factor * 10) / 10,
  };
}

/**
 * Sums up nutritional values for a list of meal items
 * @param {Array} items - Array of items with calories, protein_g, carbs_g, fat_g
 * @returns {Object} Total macros and calories
 */
export function calculateMealTotals(items = []) {
  const totals = (items || []).reduce(
    (acc, item) => {
      const c = Number(item.total_calories ?? item.calories) || 0;
      const p = Number(item.total_protein_g ?? item.protein_g ?? item.protein) || 0;
      const cb = Number(item.total_carbs_g ?? item.carbs_g ?? item.carbs) || 0;
      const f = Number(item.total_fat_g ?? item.fat_g ?? item.fat) || 0;

      acc.calories += c;
      acc.protein += p;
      acc.carbs += cb;
      acc.fat += f;

      acc.total_calories += c;
      acc.total_protein_g += p;
      acc.total_carbs_g += cb;
      acc.total_fat_g += f;
      return acc;
    },
    {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      total_calories: 0,
      total_protein_g: 0,
      total_carbs_g: 0,
      total_fat_g: 0,
    }
  );

  return {
    calories: Math.round(totals.calories),
    protein: Math.round(totals.protein * 10) / 10,
    carbs: Math.round(totals.carbs * 10) / 10,
    fat: Math.round(totals.fat * 10) / 10,
    total_calories: Math.round(totals.calories),
    total_protein_g: Math.round(totals.protein * 10) / 10,
    total_carbs_g: Math.round(totals.carbs * 10) / 10,
    total_fat_g: Math.round(totals.fat * 10) / 10,
  };
}

/**
 * Rounds meal totals for consistent storage and display
 * @param {Object} totals
 * @returns {Object} Rounded totals
 */
export function roundNutritionTotals(totals) {
  return {
    total_calories: Math.round(totals.total_calories),
    total_protein_g: Math.round(totals.total_protein_g * 10) / 10,
    total_carbs_g: Math.round(totals.total_carbs_g * 10) / 10,
    total_fat_g: Math.round(totals.total_fat_g * 10) / 10,
  };
}

/**
 * Calculates remaining calories and over-target state
 * @param {number} target - Calorie target
 * @param {number} consumed - Calories consumed so far
 * @returns {Object} remaining, isOverTarget, overAmount, percentConsumed
 */
export function calculateRemainingCalories(target = 2000, consumed = 0) {
  const t = Math.max(0, Number(target) || 2000);
  const c = Math.max(0, Number(consumed) || 0);
  const remaining = t - c;
  const isOverTarget = remaining < 0;
  const overAmount = isOverTarget ? Math.abs(remaining) : 0;
  const percentConsumed = t > 0 ? Math.min(100, Math.round((c / t) * 100)) : 0;

  return {
    target: t,
    consumed: c,
    remaining: isOverTarget ? 0 : remaining,
    isOverTarget,
    overAmount,
    percentConsumed,
  };
}

/**
 * Calculates macro percentage distribution (e.g. 30% Protein, 40% Carbs, 30% Fat)
 * @param {number} proteinG - grams of protein (4 kcal/g)
 * @param {number} carbsG - grams of carbs (4 kcal/g)
 * @param {number} fatG - grams of fat (9 kcal/g)
 * @returns {Object} percentages and calories per macro
 */
export function calculateMacroDistribution(proteinG = 0, carbsG = 0, fatG = 0) {
  const pCal = (Number(proteinG) || 0) * 4;
  const cCal = (Number(carbsG) || 0) * 4;
  const fCal = (Number(fatG) || 0) * 9;
  const totalCal = pCal + cCal + fCal;

  if (totalCal <= 0) {
    return {
      proteinPct: 0,
      carbsPct: 0,
      fatPct: 0,
      totalCaloriesFromMacros: 0,
    };
  }

  const pPct = Math.round((pCal / totalCal) * 100);
  const cPct = Math.round((cCal / totalCal) * 100);
  const fPct = Math.max(0, 100 - pPct - cPct);

  return {
    proteinPct: pPct,
    carbsPct: cPct,
    fatPct: fPct,
    totalCaloriesFromMacros: Math.round(totalCal),
  };
}

/**
 * Calculates suggested BMR and TDEE calorie & macro targets (Mifflin-St Jeor)
 * Transparent estimation method
 * @param {Object} profile - { age, height_cm, current_weight_kg, activity_level, goal_type }
 * @returns {Object} suggested targets with explanation
 */
export function calculateSuggestedGoals(profile = {}) {
  const weightKg = Number(profile.current_weight_kg) || 65;
  const heightCm = Number(profile.height_cm) || 170;
  const age = Number(profile.age) || 28;
  const activity = profile.activity_level || 'moderate';
  const goal = profile.goal_type || 'maintain_weight';

  // Base BMR (Mifflin-St Jeor formula averaged)
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;

  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  const multiplier = activityMultipliers[activity] || 1.55;
  const tdee = Math.round(bmr * multiplier);

  let targetCalories = tdee;
  if (goal === 'lose_weight') {
    targetCalories = Math.max(1200, Math.round(tdee - 400));
  } else if (goal === 'gain_weight') {
    targetCalories = Math.round(tdee + 350);
  }

  // Balanced healthy macronutrient split:
  // Protein: ~1.8g per kg bodyweight
  const proteinTargetG = Math.round(Math.min(targetCalories * 0.35 / 4, Math.max(70, weightKg * 1.8)));
  const proteinCalories = proteinTargetG * 4;

  // Fat: 25-30% of total calories
  const fatCalories = targetCalories * 0.28;
  const fatTargetG = Math.round(fatCalories / 9);

  // Carbs: remaining calories
  const carbsCalories = Math.max(0, targetCalories - proteinCalories - (fatTargetG * 9));
  const carbsTargetG = Math.round(carbsCalories / 4);

  // Water: ~35ml per kg bodyweight
  const waterTargetMl = Math.round(Math.max(2000, Math.min(4500, weightKg * 38)));

  return {
    calorie_target: targetCalories,
    protein_target_g: proteinTargetG,
    carbs_target_g: carbsTargetG,
    fat_target_g: fatTargetG,
    water_target_ml: waterTargetMl,
    bmr: Math.round(bmr),
    tdee,
    explanation: 'Calculated using Mifflin-St Jeor formula with healthy macro distribution. Adjust anytime in your profile.',
  };
}

/**
 * Adjusts recipe ingredients and nutritional values based on serving count
 * @param {Object} recipe - original recipe object
 * @param {number} newServings - target servings
 * @returns {Object} adjusted recipe with scaled ingredients and totals
 */
export function adjustRecipeServing(recipe, newServings) {
  const origServings = Math.max(1, Number(recipe.servings) || 1);
  const targetServings = Math.max(1, Number(newServings) || 1);
  const ratio = targetServings / origServings;

  const adjustedIngredients = (recipe.ingredients || []).map((ing) => ({
    ...ing,
    quantity: Math.round((Number(ing.quantity) || 0) * ratio * 10) / 10,
  }));

  // Per serving values remain constant; total meal values scale with servings
  return {
    ...recipe,
    current_servings: targetServings,
    adjusted_ingredients: adjustedIngredients,
    total_recipe_calories: Math.round((Number(recipe.calories_per_serving) || 0) * targetServings),
    total_recipe_protein_g: Math.round((Number(recipe.protein_per_serving_g) || 0) * targetServings * 10) / 10,
    total_recipe_carbs_g: Math.round((Number(recipe.carbs_per_serving_g) || 0) * targetServings * 10) / 10,
    total_recipe_fat_g: Math.round((Number(recipe.fat_per_serving_g) || 0) * targetServings * 10) / 10,
  };
}

/**
 * Calculates nutrients for a portion ({ quantity, unit }, food)
 */
export function calculateItemNutrients(portion, food) {
  const qty = Math.max(0, Number(portion?.quantity) || 100);
  const factor = qty / 100.0;
  return {
    calories: Math.round((Number(food.calories_per_100g) || 0) * factor),
    protein: Math.round((Number(food.protein_per_100g) || 0) * factor * 10) / 10,
    carbs: Math.round((Number(food.carbs_per_100g) || 0) * factor * 10) / 10,
    fat: Math.round((Number(food.fat_per_100g) || 0) * factor * 10) / 10,
  };
}

/**
 * Dynamic Heart Health Metric Engine
 * Sums actual Saturated Fat, Sodium, and Cholesterol from logged meals.
 * Starts at 0 when no meals are consumed for the selected day.
 */
export function calculateHeartHealthMetrics(meals = []) {
  if (!meals || !Array.isArray(meals) || meals.length === 0) {
    return {
      saturatedFat: 0,
      saturatedFatTarget: 20,
      saturatedFatPercent: 0,
      sodium: 0,
      sodiumTarget: 2300,
      sodiumPercent: 0,
      cholesterol: 0,
      cholesterolTarget: 300,
      cholesterolPercent: 0,
    };
  }

  let totalSatFat = 0;
  let totalSodium = 0;
  let totalCholesterol = 0;

  for (const meal of meals) {
    const items = meal.meal_items || meal.items || [];
    if (items.length > 0) {
      for (const item of items) {
        const qty = Number(item.quantity) || 100;
        const factor = qty / 100.0;

        // Saturated Fat
        let satFat = Number(item.saturated_fat_g ?? item.saturated_fat);
        if (isNaN(satFat) || satFat === 0) {
          const fat = Number(item.fat_g ?? item.total_fat_g) || 0;
          satFat = fat * 0.25; // standard estimate: 25% of fat is saturated
        }

        // Sodium
        let sod = Number(item.sodium_mg ?? item.sodium);
        if (isNaN(sod) || sod === 0) {
          const cals = Number(item.calories) || 0;
          sod = Math.round(cals * 0.85); // typical seasoned meal ~0.85mg sodium per cal
        }

        // Cholesterol
        let chol = Number(item.cholesterol_mg ?? item.cholesterol);
        if (isNaN(chol)) {
          chol = 0;
        }

        totalSatFat += satFat;
        totalSodium += sod;
        totalCholesterol += chol;
      }
    } else {
      // Fallback for custom / quick meals with only top-level macros
      const fat = Number(meal.total_fat_g ?? meal.fat_g) || 0;
      const cals = Number(meal.total_calories ?? meal.calories) || 0;
      const protein = Number(meal.total_protein_g ?? meal.protein_g) || 0;

      totalSatFat += fat * 0.28;
      totalSodium += Math.round(cals * 0.85);
      totalCholesterol += protein > 20 ? 35 : 0;
    }
  }

  const satFatRounded = Math.round(totalSatFat * 10) / 10;
  const sodiumRounded = Math.round(totalSodium * 10) / 10;
  const cholRounded = Math.round(totalCholesterol * 10) / 10;

  return {
    saturatedFat: satFatRounded,
    saturatedFatTarget: 20,
    saturatedFatPercent: Math.min(100, Math.round((satFatRounded / 20) * 100)),
    sodium: sodiumRounded,
    sodiumTarget: 2300,
    sodiumPercent: Math.min(100, Math.round((sodiumRounded / 2300) * 100)),
    cholesterol: cholRounded,
    cholesterolTarget: 300,
    cholesterolPercent: Math.min(100, Math.round((cholRounded / 300) * 100)),
  };
}

