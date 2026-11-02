import { describe, it } from 'node:test';
import assert from 'node:assert';
import { searchFoods, matchFoodItem, REFERENCE_FOODS } from './foodDb.js';

describe('Food Database & Search Tests', () => {
  it('contains reference foods', () => {
    assert.ok(REFERENCE_FOODS.length >= 15);
    const chicken = REFERENCE_FOODS.find(f => f.name.includes('Chicken'));
    assert.ok(chicken);
    assert.strictEqual(chicken.proteinPer100g, 31);
  });

  it('searches foods by query string', () => {
    const results = searchFoods('paneer');
    assert.ok(results.length >= 1);
    assert.ok(results[0].name.toLowerCase().includes('paneer'));
  });

  it('matches recognized food names correctly', () => {
    const matched = matchFoodItem('Fresh Paneer (Cottage Cheese)');
    assert.ok(matched);
    assert.strictEqual(matched.caloriesPer100g, 265);

    const partial = matchFoodItem('cooked basmati rice');
    assert.ok(partial);
    assert.strictEqual(partial.caloriesPer100g, 130);
  });

  it('returns null for unknown foods without crashing', () => {
    const unknown = matchFoodItem('extraterrestrial glowing orb');
    assert.strictEqual(unknown, null);
  });
});

