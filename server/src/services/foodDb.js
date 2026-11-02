// Comprehensive Reference Nutrition Dataset (per 100g)
// Sourced from USDA FoodData Central & Curated Nutrition Datasets
export const REFERENCE_FOODS = [
  {
    id: 'food_chicken_breast',
    name: 'Grilled Chicken Breast',
    category: 'Poultry',
    servingBasis: '100g',
    caloriesPer100g: 165.0,
    proteinPer100g: 31.0,
    carbsPer100g: 0.0,
    fatPer100g: 3.6,
    fiberPer100g: 0.0,
    nutritionSource: 'USDA FoodData Central',
    isEstimated: false,
  },
  {
    id: 'food_paneer',
    name: 'Fresh Paneer (Cottage Cheese)',
    category: 'Dairy',
    servingBasis: '100g',
    caloriesPer100g: 265.0,
    proteinPer100g: 18.3,
    carbsPer100g: 3.4,
    fatPer100g: 20.8,
    fiberPer100g: 0.0,
    nutritionSource: 'Curated Nutrition Reference',
    isEstimated: false,
  },
  {
    id: 'food_white_rice',
    name: 'Cooked White Rice (Basmati)',
    category: 'Grains',
    servingBasis: '100g',
    caloriesPer100g: 130.0,
    proteinPer100g: 2.7,
    carbsPer100g: 28.2,
    fatPer100g: 0.3,
    fiberPer100g: 0.4,
    nutritionSource: 'USDA FoodData Central',
    isEstimated: false,
  },
  {
    id: 'food_brown_rice',
    name: 'Cooked Brown Rice',
    category: 'Grains',
    servingBasis: '100g',
    caloriesPer100g: 123.0,
    proteinPer100g: 2.7,
    carbsPer100g: 25.6,
    fatPer100g: 1.0,
    fiberPer100g: 1.6,
    nutritionSource: 'USDA FoodData Central',
    isEstimated: false,
  },
  {
    id: 'food_roti',
    name: 'Whole Wheat Roti / Chapati',
    category: 'Grains',
    servingBasis: '100g',
    caloriesPer100g: 240.0,
    proteinPer100g: 8.5,
    carbsPer100g: 49.0,
    fatPer100g: 2.8,
    fiberPer100g: 7.5,
    nutritionSource: 'Curated Nutrition Reference',
    isEstimated: false,
  },
  {
    id: 'food_dal_tadka',
    name: 'Yellow Dal Tadka (Cooked)',
    category: 'Legumes',
    servingBasis: '100g',
    caloriesPer100g: 115.0,
    proteinPer100g: 6.2,
    carbsPer100g: 17.5,
    fatPer100g: 2.8,
    fiberPer100g: 4.2,
    nutritionSource: 'Curated Nutrition Reference',
    isEstimated: false,
  },
  {
    id: 'food_boiled_egg',
    name: 'Whole Boiled Egg',
    category: 'Eggs',
    servingBasis: '100g',
    caloriesPer100g: 155.0,
    proteinPer100g: 12.6,
    carbsPer100g: 1.1,
    fatPer100g: 10.6,
    fiberPer100g: 0.0,
    nutritionSource: 'USDA FoodData Central',
    isEstimated: false,
  },
  {
    id: 'food_egg_white',
    name: 'Boiled Egg White',
    category: 'Eggs',
    servingBasis: '100g',
    caloriesPer100g: 52.0,
    proteinPer100g: 11.0,
    carbsPer100g: 0.7,
    fatPer100g: 0.2,
    fiberPer100g: 0.0,
    nutritionSource: 'USDA FoodData Central',
    isEstimated: false,
  },
  {
    id: 'food_oats',
    name: 'Rolled Oats (Raw)',
    category: 'Grains',
    servingBasis: '100g',
    caloriesPer100g: 389.0,
    proteinPer100g: 16.9,
    carbsPer100g: 66.3,
    fatPer100g: 6.9,
    fiberPer100g: 10.6,
    nutritionSource: 'USDA FoodData Central',
    isEstimated: false,
  },
  {
    id: 'food_quinoa',
    name: 'Cooked Quinoa',
    category: 'Grains',
    servingBasis: '100g',
    caloriesPer100g: 120.0,
    proteinPer100g: 4.4,
    carbsPer100g: 21.3,
    fatPer100g: 1.9,
    fiberPer100g: 2.8,
    nutritionSource: 'USDA FoodData Central',
    isEstimated: false,
  },
  {
    id: 'food_greek_yogurt',
    name: 'Greek Yogurt (Plain, Low Fat)',
    category: 'Dairy',
    servingBasis: '100g',
    caloriesPer100g: 73.0,
    proteinPer100g: 10.0,
    carbsPer100g: 3.9,
    fatPer100g: 1.9,
    fiberPer100g: 0.0,
    nutritionSource: 'USDA FoodData Central',
    isEstimated: false,
  },
  {
    id: 'food_chana',
    name: 'Chickpeas / Boiled Chana',
    category: 'Legumes',
    servingBasis: '100g',
    caloriesPer100g: 164.0,
    proteinPer100g: 8.9,
    carbsPer100g: 27.4,
    fatPer100g: 2.6,
    fiberPer100g: 7.6,
    nutritionSource: 'USDA FoodData Central',
    isEstimated: false,
  },
  {
    id: 'food_avocado',
    name: 'Hass Avocado',
    category: 'Fruits',
    servingBasis: '100g',
    caloriesPer100g: 160.0,
    proteinPer100g: 2.0,
    carbsPer100g: 8.5,
    fatPer100g: 14.7,
    fiberPer100g: 6.7,
    nutritionSource: 'USDA FoodData Central',
    isEstimated: false,
  },
  {
    id: 'food_broccoli',
    name: 'Steamed Broccoli',
    category: 'Vegetables',
    servingBasis: '100g',
    caloriesPer100g: 35.0,
    proteinPer100g: 2.4,
    carbsPer100g: 7.2,
    fatPer100g: 0.4,
    fiberPer100g: 2.6,
    nutritionSource: 'USDA FoodData Central',
    isEstimated: false,
  },
  {
    id: 'food_banana',
    name: 'Ripe Banana',
    category: 'Fruits',
    servingBasis: '100g',
    caloriesPer100g: 89.0,
    proteinPer100g: 1.1,
    carbsPer100g: 22.8,
    fatPer100g: 0.3,
    fiberPer100g: 2.6,
    nutritionSource: 'USDA FoodData Central',
    isEstimated: false,
  },
  {
    id: 'food_apple',
    name: 'Fresh Red Apple',
    category: 'Fruits',
    servingBasis: '100g',
    caloriesPer100g: 52.0,
    proteinPer100g: 0.3,
    carbsPer100g: 13.8,
    fatPer100g: 0.2,
    fiberPer100g: 2.4,
    nutritionSource: 'USDA FoodData Central',
    isEstimated: false,
  },
  {
    id: 'food_almonds',
    name: 'Raw Almonds',
    category: 'Nuts',
    servingBasis: '100g',
    caloriesPer100g: 579.0,
    proteinPer100g: 21.2,
    carbsPer100g: 21.6,
    fatPer100g: 49.9,
    fiberPer100g: 12.5,
    nutritionSource: 'USDA FoodData Central',
    isEstimated: false,
  },
  {
    id: 'food_tofu',
    name: 'Firm Tofu',
    category: 'Soy',
    servingBasis: '100g',
    caloriesPer100g: 144.0,
    proteinPer100g: 15.6,
    carbsPer100g: 2.8,
    fatPer100g: 8.7,
    fiberPer100g: 2.3,
    nutritionSource: 'USDA FoodData Central',
    isEstimated: false,
  },
  {
    id: 'food_olive_oil',
    name: 'Extra Virgin Olive Oil',
    category: 'Fats & Oils',
    servingBasis: '100g',
    caloriesPer100g: 884.0,
    proteinPer100g: 0.0,
    carbsPer100g: 0.0,
    fatPer100g: 100.0,
    fiberPer100g: 0.0,
    nutritionSource: 'USDA FoodData Central',
    isEstimated: false,
  },
  {
    id: 'food_mixed_greens',
    name: 'Mixed Salad Greens',
    category: 'Vegetables',
    servingBasis: '100g',
    caloriesPer100g: 20.0,
    proteinPer100g: 1.5,
    carbsPer100g: 3.6,
    fatPer100g: 0.2,
    fiberPer100g: 2.0,
    nutritionSource: 'USDA FoodData Central',
    isEstimated: false,
  },
  {
    id: 'food_cherry_tomatoes',
    name: 'Cherry Tomatoes',
    category: 'Vegetables',
    servingBasis: '100g',
    caloriesPer100g: 18.0,
    proteinPer100g: 0.9,
    carbsPer100g: 3.9,
    fatPer100g: 0.2,
    fiberPer100g: 1.2,
    nutritionSource: 'USDA FoodData Central',
    isEstimated: false,
  },
  {
    id: 'food_poha',
    name: 'Cooked Vegetable Poha',
    category: 'Grains',
    servingBasis: '100g',
    caloriesPer100g: 140.0,
    proteinPer100g: 2.8,
    carbsPer100g: 26.5,
    fatPer100g: 3.2,
    fiberPer100g: 2.1,
    nutritionSource: 'Curated Nutrition Reference',
    isEstimated: false,
  },
];

/**
 * Fuzzy search food items by query string
 */
export function searchFoods(query) {
  if (!query || typeof query !== 'string') return REFERENCE_FOODS.slice(0, 10);
  const q = query.toLowerCase().trim();
  return REFERENCE_FOODS.filter(item => 
    item.name.toLowerCase().includes(q) ||
    item.category.toLowerCase().includes(q)
  );
}

/**
 * Match a recognized food name against our verified reference dataset
 */
export function matchFoodItem(name) {
  if (!name || typeof name !== 'string') return null;
  const target = name.toLowerCase().trim();
  
  // Exact match
  const exact = REFERENCE_FOODS.find(f => f.name.toLowerCase() === target);
  if (exact) return exact;

  // Substring match
  const partial = REFERENCE_FOODS.find(f => 
    target.includes(f.name.toLowerCase()) || 
    f.name.toLowerCase().includes(target)
  );
  if (partial) return partial;

  // Keyword match
  const keywords = target.split(/\s+/);
  for (const kw of keywords) {
    if (kw.length < 3) continue;
    const match = REFERENCE_FOODS.find(f => f.name.toLowerCase().includes(kw));
    if (match) return match;
  }

  return null;
}

