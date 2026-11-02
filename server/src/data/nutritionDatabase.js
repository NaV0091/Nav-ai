/**
 * Verified Reference Nutrition Dataset (USDA FoodData Central + Curated Indian Foods)
 * Values are standardized per 100 grams of edible portion.
 */

export const referenceFoods = [
  // Grains & Carbs
  {
    id: 'food-rice-white',
    name: 'Cooked White Rice',
    normalized_name: 'cooked white rice boiled',
    category: 'Grains',
    calories_per_100g: 130.0,
    protein_per_100g: 2.7,
    carbs_per_100g: 28.2,
    fat_per_100g: 0.3,
    fiber_per_100g: 0.4,
    nutrition_source: 'USDA FoodData Central',
  },
  {
    id: 'food-rice-brown',
    name: 'Cooked Brown Rice',
    normalized_name: 'cooked brown rice whole grain',
    category: 'Grains',
    calories_per_100g: 111.0,
    protein_per_100g: 2.6,
    carbs_per_100g: 23.0,
    fat_per_100g: 0.9,
    fiber_per_100g: 1.8,
    nutrition_source: 'USDA FoodData Central',
  },
  {
    id: 'food-quinoa',
    name: 'Cooked Quinoa',
    normalized_name: 'cooked quinoa grain',
    category: 'Grains',
    calories_per_100g: 120.0,
    protein_per_100g: 4.4,
    carbs_per_100g: 21.3,
    fat_per_100g: 1.9,
    fiber_per_100g: 2.8,
    nutrition_source: 'USDA FoodData Central',
  },
  {
    id: 'food-roti',
    name: 'Whole Wheat Roti / Chapati',
    normalized_name: 'whole wheat roti chapati indian bread phulka',
    category: 'Grains',
    calories_per_100g: 264.0,
    protein_per_100g: 9.0,
    carbs_per_100g: 52.0,
    fat_per_100g: 3.5,
    fiber_per_100g: 9.0,
    nutrition_source: 'Curated Indian Food Composition',
  },
  {
    id: 'food-poha',
    name: 'Vegetable Poha (Cooked)',
    normalized_name: 'cooked poha flattened rice aval',
    category: 'Grains',
    calories_per_100g: 160.0,
    protein_per_100g: 3.5,
    carbs_per_100g: 28.0,
    fat_per_100g: 4.2,
    fiber_per_100g: 2.1,
    nutrition_source: 'Curated Indian Food Composition',
  },
  {
    id: 'food-oats',
    name: 'Cooked Oatmeal / Porridge',
    normalized_name: 'cooked rolled oats oatmeal porridge',
    category: 'Grains',
    calories_per_100g: 71.0,
    protein_per_100g: 2.5,
    carbs_per_100g: 12.0,
    fat_per_100g: 1.5,
    fiber_per_100g: 1.7,
    nutrition_source: 'USDA FoodData Central',
  },
  {
    id: 'food-bread-wheat',
    name: 'Whole Wheat Bread',
    normalized_name: 'whole wheat bread toast slice',
    category: 'Grains',
    calories_per_100g: 247.0,
    protein_per_100g: 13.0,
    carbs_per_100g: 41.0,
    fat_per_100g: 3.4,
    fiber_per_100g: 7.0,
    nutrition_source: 'USDA FoodData Central',
  },
  {
    id: 'food-potato',
    name: 'Roasted Herb Potatoes',
    normalized_name: 'roasted potatoes baked potato herb',
    category: 'Vegetables',
    calories_per_100g: 93.0,
    protein_per_100g: 2.0,
    carbs_per_100g: 21.0,
    fat_per_100g: 0.1,
    fiber_per_100g: 2.2,
    nutrition_source: 'USDA FoodData Central',
  },

  // Proteins: Poultry, Fish, Eggs & Meat
  {
    id: 'food-chicken-breast',
    name: 'Grilled Chicken Breast',
    normalized_name: 'grilled chicken breast skinless roasted tenderloin',
    category: 'Poultry',
    calories_per_100g: 165.0,
    protein_per_100g: 31.0,
    carbs_per_100g: 0.0,
    fat_per_100g: 3.6,
    fiber_per_100g: 0.0,
    nutrition_source: 'USDA FoodData Central',
  },
  {
    id: 'food-chicken-wings',
    name: 'Crispy Herb Chicken Wings',
    normalized_name: 'chicken wings grilled baked drumette',
    category: 'Poultry',
    calories_per_100g: 203.0,
    protein_per_100g: 20.0,
    carbs_per_100g: 0.0,
    fat_per_100g: 13.0,
    fiber_per_100g: 0.0,
    nutrition_source: 'USDA FoodData Central',
  },
  {
    id: 'food-salmon',
    name: 'Pan-Seared Atlantic Salmon Fillet',
    normalized_name: 'atlantic salmon cooked pan seared grilled fish fillet',
    category: 'Seafood',
    calories_per_100g: 206.0,
    protein_per_100g: 22.1,
    carbs_per_100g: 0.0,
    fat_per_100g: 12.3,
    fiber_per_100g: 0.0,
    nutrition_source: 'USDA FoodData Central',
  },
  {
    id: 'food-beef-lean',
    name: 'Lean Beef Strips (Fajitas / Steak)',
    normalized_name: 'lean beef steak strips flank fajitas cooked',
    category: 'Meat',
    calories_per_100g: 198.0,
    protein_per_100g: 28.0,
    carbs_per_100g: 0.0,
    fat_per_100g: 9.0,
    fiber_per_100g: 0.0,
    nutrition_source: 'USDA FoodData Central',
  },
  {
    id: 'food-egg-boiled',
    name: 'Boiled Egg',
    normalized_name: 'boiled egg whole hard boiled',
    category: 'Eggs',
    calories_per_100g: 155.0,
    protein_per_100g: 12.6,
    carbs_per_100g: 1.1,
    fat_per_100g: 10.6,
    fiber_per_100g: 0.0,
    nutrition_source: 'USDA FoodData Central',
  },
  {
    id: 'food-egg-omelette',
    name: 'Egg Omelette / Scrambled',
    normalized_name: 'egg omelette scrambled eggs',
    category: 'Eggs',
    calories_per_100g: 154.0,
    protein_per_100g: 11.0,
    carbs_per_100g: 1.5,
    fat_per_100g: 11.5,
    fiber_per_100g: 0.0,
    nutrition_source: 'USDA FoodData Central',
  },

  // Vegetarian Proteins & Dairy
  {
    id: 'food-paneer',
    name: 'Fresh Paneer (Indian Cottage Cheese)',
    normalized_name: 'fresh paneer cottage cheese indian curd cheese',
    category: 'Dairy',
    calories_per_100g: 265.0,
    protein_per_100g: 18.3,
    carbs_per_100g: 3.4,
    fat_per_100g: 20.8,
    fiber_per_100g: 0.0,
    nutrition_source: 'Curated Indian Food Composition',
  },
  {
    id: 'food-dal-yellow',
    name: 'Yellow Dal Tadka (Cooked)',
    normalized_name: 'yellow dal tadka cooked toor moong lentils curry',
    category: 'Legumes',
    calories_per_100g: 105.0,
    protein_per_100g: 6.5,
    carbs_per_100g: 14.2,
    fat_per_100g: 2.8,
    fiber_per_100g: 4.1,
    nutrition_source: 'Curated Indian Food Composition',
  },
  {
    id: 'food-chickpeas',
    name: 'Boiled Chickpeas (Chole / Garbanzo)',
    normalized_name: 'boiled chickpeas chole garbanzo beans chana',
    category: 'Legumes',
    calories_per_100g: 164.0,
    protein_per_100g: 8.9,
    carbs_per_100g: 27.4,
    fat_per_100g: 2.6,
    fiber_per_100g: 7.6,
    nutrition_source: 'USDA FoodData Central',
  },
  {
    id: 'food-tofu',
    name: 'Firm Tofu',
    normalized_name: 'firm tofu soy bean curd',
    category: 'Plant Protein',
    calories_per_100g: 83.0,
    protein_per_100g: 10.0,
    carbs_per_100g: 1.9,
    fat_per_100g: 5.3,
    fiber_per_100g: 1.0,
    nutrition_source: 'USDA FoodData Central',
  },
  {
    id: 'food-greek-yogurt',
    name: 'Greek Yogurt (Plain 0% Nonfat)',
    normalized_name: 'greek yogurt plain nonfat dahi curd',
    category: 'Dairy',
    calories_per_100g: 59.0,
    protein_per_100g: 10.0,
    carbs_per_100g: 3.6,
    fat_per_100g: 0.4,
    fiber_per_100g: 0.0,
    nutrition_source: 'USDA FoodData Central',
  },

  // Vegetables & Salads
  {
    id: 'food-avocado',
    name: 'Hass Avocado (Fresh)',
    normalized_name: 'hass avocado fresh sliced ripe',
    category: 'Produce',
    calories_per_100g: 160.0,
    protein_per_100g: 2.0,
    carbs_per_100g: 8.5,
    fat_per_100g: 14.7,
    fiber_per_100g: 6.7,
    nutrition_source: 'USDA FoodData Central',
  },
  {
    id: 'food-salad-greens',
    name: 'Mixed Salad Greens & Arugula',
    normalized_name: 'mixed salad greens baby lettuce spinach arugula',
    category: 'Produce',
    calories_per_100g: 17.0,
    protein_per_100g: 1.5,
    carbs_per_100g: 3.0,
    fat_per_100g: 0.2,
    fiber_per_100g: 1.8,
    nutrition_source: 'USDA FoodData Central',
  },
  {
    id: 'food-cherry-tomatoes',
    name: 'Cherry Tomatoes',
    normalized_name: 'cherry tomatoes fresh raw',
    category: 'Produce',
    calories_per_100g: 18.0,
    protein_per_100g: 0.9,
    carbs_per_100g: 3.9,
    fat_per_100g: 0.2,
    fiber_per_100g: 1.2,
    nutrition_source: 'USDA FoodData Central',
  },
  {
    id: 'food-cucumber',
    name: 'Cucumber (Sliced)',
    normalized_name: 'cucumber raw sliced with peel',
    category: 'Produce',
    calories_per_100g: 15.0,
    protein_per_100g: 0.7,
    carbs_per_100g: 3.6,
    fat_per_100g: 0.1,
    fiber_per_100g: 0.5,
    nutrition_source: 'USDA FoodData Central',
  },
  {
    id: 'food-broccoli',
    name: 'Steamed Broccoli',
    normalized_name: 'steamed broccoli florets cooked',
    category: 'Produce',
    calories_per_100g: 35.0,
    protein_per_100g: 2.4,
    carbs_per_100g: 7.2,
    fat_per_100g: 0.4,
    fiber_per_100g: 3.3,
    nutrition_source: 'USDA FoodData Central',
  },
  {
    id: 'food-bell-pepper',
    name: 'Bell Peppers (Sauteed / Raw)',
    normalized_name: 'bell peppers capsicum red green yellow sauteed',
    category: 'Produce',
    calories_per_100g: 26.0,
    protein_per_100g: 1.0,
    carbs_per_100g: 6.0,
    fat_per_100g: 0.3,
    fiber_per_100g: 2.1,
    nutrition_source: 'USDA FoodData Central',
  },

  // Fruits
  {
    id: 'food-banana',
    name: 'Fresh Banana',
    normalized_name: 'banana fresh ripe fruit',
    category: 'Fruits',
    calories_per_100g: 89.0,
    protein_per_100g: 1.1,
    carbs_per_100g: 22.8,
    fat_per_100g: 0.3,
    fiber_per_100g: 2.6,
    nutrition_source: 'USDA FoodData Central',
  },
  {
    id: 'food-blueberries',
    name: 'Fresh Blueberries',
    normalized_name: 'blueberries fresh raw wild berries',
    category: 'Fruits',
    calories_per_100g: 57.0,
    protein_per_100g: 0.7,
    carbs_per_100g: 14.5,
    fat_per_100g: 0.3,
    fiber_per_100g: 2.4,
    nutrition_source: 'USDA FoodData Central',
  },
  {
    id: 'food-apple',
    name: 'Fresh Apple (Sliced)',
    normalized_name: 'apple raw with skin fruit',
    category: 'Fruits',
    calories_per_100g: 52.0,
    protein_per_100g: 0.3,
    carbs_per_100g: 13.8,
    fat_per_100g: 0.2,
    fiber_per_100g: 2.4,
    nutrition_source: 'USDA FoodData Central',
  },

  // Nuts, Seeds & Oils
  {
    id: 'food-almonds',
    name: 'Roasted California Almonds',
    normalized_name: 'almonds roasted whole nuts badam california salted dry roasted',
    category: 'Nuts & Seeds',
    calories_per_100g: 579.0,
    protein_per_100g: 21.2,
    carbs_per_100g: 21.6,
    fat_per_100g: 49.9,
    fiber_per_100g: 12.5,
    nutrition_source: 'USDA FoodData Central',
  },
  {
    id: 'food-pumpkin-seeds',
    name: 'Pumpkin Seeds (Pepitas)',
    normalized_name: 'pumpkin seeds pepitas roasted raw seeds',
    category: 'Nuts & Seeds',
    calories_per_100g: 559.0,
    protein_per_100g: 30.2,
    carbs_per_100g: 10.7,
    fat_per_100g: 49.1,
    fiber_per_100g: 6.0,
    nutrition_source: 'USDA FoodData Central',
  },
  {
    id: 'food-walnuts',
    name: 'Walnuts',
    normalized_name: 'walnuts akhrot nuts raw',
    category: 'Nuts & Seeds',
    calories_per_100g: 654.0,
    protein_per_100g: 15.2,
    carbs_per_100g: 13.7,
    fat_per_100g: 65.2,
    fiber_per_100g: 6.7,
    nutrition_source: 'USDA FoodData Central',
  },
  {
    id: 'food-olive-oil',
    name: 'Extra Virgin Olive Oil',
    normalized_name: 'olive oil extra virgin cooking oil dressing',
    category: 'Oils',
    calories_per_100g: 884.0,
    protein_per_100g: 0.0,
    carbs_per_100g: 0.0,
    fat_per_100g: 100.0,
    fiber_per_100g: 0.0,
    nutrition_source: 'USDA FoodData Central',
  },
  {
    id: 'food-ghee',
    name: 'Pure Desi Ghee',
    normalized_name: 'ghee clarified butter desi',
    category: 'Oils',
    calories_per_100g: 900.0,
    protein_per_100g: 0.0,
    carbs_per_100g: 0.0,
    fat_per_100g: 100.0,
    fiber_per_100g: 0.0,
    nutrition_source: 'Curated Indian Food Composition',
  },
];

/**
 * Searches reference foods using token containment
 */
export function searchNutritionDatabase(query) {
  if (!query || typeof query !== 'string') return [];
  const tokens = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!tokens.length) return [];

  return referenceFoods.filter((item) => {
    const target = `${item.name} ${item.normalized_name} ${item.category}`.toLowerCase();
    return tokens.every((tok) => target.includes(tok));
  });
}

/**
 * Finds the closest matching reference food item for an AI-detected name
 */
export function findBestNutritionMatch(detectedName) {
  if (!detectedName || typeof detectedName !== 'string') return null;
  const raw = detectedName.toLowerCase().trim();

  // 1. Direct exact or substring match
  const exact = referenceFoods.find(
    (f) => f.name.toLowerCase() === raw || raw.includes(f.name.toLowerCase())
  );
  if (exact) return exact;

  // 2. Token overlap score with whole word priority
  const tokens = raw.split(/\s+/).filter((t) => t.length > 2);
  let bestMatch = null;
  let highestScore = 0;

  for (const food of referenceFoods) {
    const haystack = `${food.name} ${food.normalized_name}`.toLowerCase();
    const foodWords = haystack.split(/\s+/);
    let score = 0;

    for (const t of tokens) {
      if (foodWords.includes(t)) {
        score += 3;
      } else if (haystack.includes(t)) {
        score += 1;
      }
      // Modifiers shouldn't outvote core food nouns
      if (['roasted', 'fried', 'cooked', 'salted', 'boiled', 'steamed', 'raw', 'baked', 'fresh'].includes(t)) {
        score -= 0.5;
      }
    }

    if (score > highestScore && score >= 1) {
      highestScore = score;
      bestMatch = food;
    }
  }

  return bestMatch;
}

