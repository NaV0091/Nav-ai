import test from 'node:test';
import assert from 'node:assert/strict';

import {
  calculateItemNutrition,
  calculateMealTotals,
  calculateRemainingCalories,
  calculateMacroDistribution,
  calculateSuggestedGoals,
  adjustRecipeServing,
} from '../src/services/nutritionEngine.js';

import {
  searchNutritionDatabase,
  findBestNutritionMatch,
} from '../src/data/nutritionDatabase.js';

test('Nutrition Engine - Item Calculation', () => {
  const mockFood = {
    name: 'Grilled Chicken Breast',
    calories_per_100g: 165.0,
    protein_per_100g: 31.0,
    carbs_per_100g: 0.0,
    fat_per_100g: 3.6,
    fiber_per_100g: 0.0,
  };

  // 150g portion
  const result = calculateItemNutrition(mockFood, 150);
  assert.equal(result.quantity, 150);
  assert.equal(result.calories, 247.5);
  assert.equal(result.protein_g, 46.5);
  assert.equal(result.carbs_g, 0);
  assert.equal(result.fat_g, 5.4);
});

test('Nutrition Engine - Meal Totals Sum', () => {
  const items = [
    { calories: 250, protein_g: 45, carbs_g: 0, fat_g: 5 },
    { calories: 150, protein_g: 3, carbs_g: 30, fat_g: 1 },
    { calories: 80, protein_g: 1, carbs_g: 4, fat_g: 7 },
  ];

  const totals = calculateMealTotals(items);
  assert.equal(totals.total_calories, 480);
  assert.equal(totals.total_protein_g, 49);
  assert.equal(totals.total_carbs_g, 34);
  assert.equal(totals.total_fat_g, 13);
});

test('Nutrition Engine - Remaining Calories and Over-Target State', () => {
  // Case 1: Under target
  const under = calculateRemainingCalories(2000, 1400);
  assert.equal(under.remaining, 600);
  assert.equal(under.isOverTarget, false);
  assert.equal(under.overAmount, 0);
  assert.equal(under.percentConsumed, 70);

  // Case 2: Exactly on target
  const equal = calculateRemainingCalories(2000, 2000);
  assert.equal(equal.remaining, 0);
  assert.equal(equal.isOverTarget, false);
  assert.equal(equal.overAmount, 0);

  // Case 3: Over target (Prompt requirement: negative remainder should not simply be 0 without over-amount)
  const over = calculateRemainingCalories(2000, 2250);
  assert.equal(over.remaining, 0);
  assert.equal(over.isOverTarget, true);
  assert.equal(over.overAmount, 250);
});

test('Nutrition Engine - Macro Distribution Percentages', () => {
  // 50g Protein (200 kcal), 100g Carbs (400 kcal), 22.2g Fat (~200 kcal) -> total 800 kcal
  const dist = calculateMacroDistribution(50, 100, 22.2);
  assert.equal(dist.proteinPct, 25);
  assert.equal(dist.carbsPct, 50);
  assert.equal(dist.fatPct, 25);
  assert.equal(dist.totalCaloriesFromMacros, 800);
});

test('Nutrition Engine - Recipe Serving Scaler', () => {
  const recipe = {
    title: 'High-Protein Paneer Bhurji',
    servings: 2,
    calories_per_serving: 310,
    protein_per_serving_g: 22,
    carbs_per_serving_g: 8,
    fat_per_serving_g: 21,
    ingredients: [
      { ingredient_name: 'Fresh Paneer', quantity: 200, unit: 'g' },
      { ingredient_name: 'Red Onion', quantity: 80, unit: 'g' },
    ],
  };

  // Scale from 2 servings to 4 servings
  const scaled = adjustRecipeServing(recipe, 4);
  assert.equal(scaled.current_servings, 4);
  assert.equal(scaled.total_recipe_calories, 1240); // 310 * 4
  assert.equal(scaled.total_recipe_protein_g, 88); // 22 * 4
  assert.equal(scaled.adjusted_ingredients[0].quantity, 400); // 200 * (4/2)
  assert.equal(scaled.adjusted_ingredients[1].quantity, 160); // 80 * (4/2)
});

test('Nutrition Engine - Suggested BMR / TDEE Goals', () => {
  const profile = {
    age: 28,
    height_cm: 170,
    current_weight_kg: 65,
    activity_level: 'moderate',
    goal_type: 'lose_weight',
  };

  const goals = calculateSuggestedGoals(profile);
  assert.ok(goals.calorie_target >= 1200);
  assert.ok(goals.protein_target_g >= 70);
  assert.ok(goals.water_target_ml >= 2000);
  assert.ok(goals.explanation.length > 0);
});

test('Nutrition Database - Search and Matching', () => {
  // Test search for Indian and USDA foods
  const dalSearch = searchNutritionDatabase('dal');
  assert.ok(dalSearch.length > 0);
  assert.equal(dalSearch[0].category, 'Legumes');

  const chickenSearch = searchNutritionDatabase('chicken breast');
  assert.ok(chickenSearch.length > 0);
  assert.ok(chickenSearch[0].protein_per_100g >= 30);

  // Test AI best match lookup
  const match1 = findBestNutritionMatch('avocado');
  assert.ok(match1);
  assert.equal(match1.name, 'Hass Avocado (Fresh)');

  const match2 = findBestNutritionMatch('roasted chicken breast slices');
  assert.ok(match2);
  assert.equal(match2.name, 'Grilled Chicken Breast');
});

