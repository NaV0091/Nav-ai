import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  convertToGrams,
  calculateItemNutrients,
  calculateMealTotals,
  calculateDailyCalorieBalance,
  calculateMacroProgress,
  scaleRecipe,
} from './nutritionEngine.js';

describe('Nutrition Engine Tests', () => {
  it('converts units to grams correctly', () => {
    assert.strictEqual(convertToGrams(100, 'g'), 100);
    assert.strictEqual(convertToGrams(1, 'kg'), 1000);
    assert.strictEqual(convertToGrams(2, 'tbsp'), 30);
    assert.strictEqual(convertToGrams(1, 'cup'), 240);
  });

  it('calculates portion nutrients from reference food', () => {
    const reference = {
      name: 'Grilled Chicken Breast',
      caloriesPer100g: 165,
      proteinPer100g: 31,
      carbsPer100g: 0,
      fatPer100g: 3.6,
      nutritionSource: 'USDA',
    };

    const calculated = calculateItemNutrients({ quantity: 200, unit: 'g' }, reference);
    assert.strictEqual(calculated.calories, 330);
    assert.strictEqual(calculated.protein, 62);
    assert.strictEqual(calculated.carbs, 0);
    assert.strictEqual(calculated.fat, 7.2);
    assert.strictEqual(calculated.nutritionSource, 'USDA');
  });

  it('calculates meal totals with multiple items', () => {
    const items = [
      { calories: 330, protein: 62, carbs: 0, fat: 7.2 },
      { calories: 130, protein: 2.7, carbs: 28.2, fat: 0.3 },
    ];
    const totals = calculateMealTotals(items);
    assert.strictEqual(totals.totalCalories, 460);
    assert.strictEqual(Math.round(totals.totalProtein), 65);
    assert.strictEqual(Math.round(totals.totalCarbs), 28);
    assert.strictEqual(Math.round(totals.totalFat), 8);
  });

  it('calculates calorie balance and preserves negative remainder when over-target', () => {
    // Normal under target
    const normal = calculateDailyCalorieBalance(1200, 2000);
    assert.strictEqual(normal.consumed, 1200);
    assert.strictEqual(normal.remaining, 800);
    assert.strictEqual(normal.isOverTarget, false);
    assert.strictEqual(normal.overAmount, 0);

    // Over target: Must report true negative remainder and positive overAmount
    const over = calculateDailyCalorieBalance(2350, 2000);
    assert.strictEqual(over.consumed, 2350);
    assert.strictEqual(over.remaining, -350);
    assert.strictEqual(over.isOverTarget, true);
    assert.strictEqual(over.overAmount, 350);
  });

  it('calculates macro progress accurately', () => {
    const progress = calculateMacroProgress(45, 90);
    assert.strictEqual(progress.percent, 50);
    assert.strictEqual(progress.remaining, 45);
    assert.strictEqual(progress.isOver, false);

    const overMacro = calculateMacroProgress(100, 80);
    assert.strictEqual(overMacro.percent, 125);
    assert.strictEqual(overMacro.isOver, true);
  });

  it('scales recipe servings and ingredients proportionally', () => {
    const recipe = {
      title: 'Paneer Bhurji',
      servings: 1,
      caloriesPerServing: 320,
      proteinPerServing: 22.5,
      carbsPerServing: 9,
      fatPerServing: 21,
      ingredients: [
        { name: 'Paneer', quantity: 150, unit: 'g' },
        { name: 'Onion', quantity: 50, unit: 'g' },
      ],
    };

    const scaled = scaleRecipe(recipe, 3);
    assert.strictEqual(scaled.servings, 3);
    assert.strictEqual(scaled.totalCalories, 960);
    assert.strictEqual(scaled.ingredients[0].quantity, 450);
    assert.strictEqual(scaled.ingredients[1].quantity, 150);
  });
});

