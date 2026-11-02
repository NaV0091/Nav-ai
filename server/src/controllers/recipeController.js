import { scaleRecipe } from '../services/nutritionEngine.js';

// Curated recipes with realistic photography and nutritional details
export const RECIPES_DATA = [
  {
    id: 'recipe-paneer-bhurji',
    title: 'High-Protein Paneer Bhurji',
    description: 'Scrambled cottage cheese tossed with diced onions, tomatoes, fresh green chilies, and aromatic turmeric, cumin, and coriander.',
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    preparationTimeMinutes: 15,
    servings: 1,
    caloriesPerServing: 320,
    proteinPerServing: 22.5,
    carbsPerServing: 9.0,
    fatPerServing: 21.0,
    dietaryTags: ['Vegetarian', 'High-Protein', 'Gluten-Free', 'Keto-Friendly'],
    mealType: 'breakfast',
    category: 'Indian',
    ingredients: [
      { name: 'Fresh Paneer (Cottage Cheese)', quantity: 150, unit: 'g', notes: 'Crumbled by hand' },
      { name: 'Yellow Onion', quantity: 60, unit: 'g', notes: 'Finely chopped' },
      { name: 'Ripe Tomato', quantity: 50, unit: 'g', notes: 'Diced' },
      { name: 'Green Chilies', quantity: 5, unit: 'g', notes: 'Slit or minced' },
      { name: 'Extra Virgin Olive Oil', quantity: 10, unit: 'g', notes: 'For tempering' },
      { name: 'Coriander & Cumin Spices', quantity: 5, unit: 'g', notes: 'Turmeric, pink salt, jeera' },
    ],
    instructions: [
      'Heat 10g olive oil in a non-stick pan over medium heat.',
      'Add cumin seeds and finely chopped onions; sauté until golden brown.',
      'Add minced ginger, green chili, and chopped tomatoes. Cook until soft and fragrant.',
      'Sprinkle turmeric, coriander powder, and a pinch of pink salt.',
      'Crumble fresh paneer into the pan and toss gently for 3-4 minutes.',
      'Garnish with chopped fresh cilantro and a squeeze of fresh lemon juice.',
    ],
  },
  {
    id: 'recipe-dal-basmati',
    title: 'Homestyle Moong Dal & Basmati Bowl',
    description: 'Comforting yellow moong dal tempered with ghee, cumin seeds, garlic, served alongside warm basmati rice.',
    imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80',
    preparationTimeMinutes: 25,
    servings: 1,
    caloriesPerServing: 380,
    proteinPerServing: 14.8,
    carbsPerServing: 64.0,
    fatPerServing: 5.5,
    dietaryTags: ['Vegetarian', 'Comfort', 'Plant-Based Option'],
    mealType: 'lunch',
    category: 'Indian',
    ingredients: [
      { name: 'Yellow Moong Dal (Dry)', quantity: 60, unit: 'g', notes: 'Rinsed and drained' },
      { name: 'Steamed Basmati Rice', quantity: 150, unit: 'g', notes: 'Cooked' },
      { name: 'Pure Desi Ghee / Olive Oil', quantity: 5, unit: 'g', notes: 'For tempering' },
      { name: 'Garlic & Cumin', quantity: 10, unit: 'g', notes: 'Minced garlic and jeera' },
      { name: 'Turmeric & Salt', quantity: 4, unit: 'g', notes: 'To taste' },
    ],
    instructions: [
      'Pressure cook rinsed lentils with water, turmeric, and salt until completely tender.',
      'Whisk dal gently with a hand whisk to create a creamy texture.',
      'In a tadka pan, heat ghee; splutter cumin seeds, dry red chili, and minced garlic.',
      'Pour hot tadka over the dal and stir gently.',
      'Serve alongside warm steamed basmati rice and fresh cucumber slices.',
    ],
  },
  {
    id: 'recipe-chickpea-salad',
    title: 'Mediterranean Chickpea & Olive Salad',
    description: 'A crunchy, protein-packed bowl of boiled chickpeas, diced cucumbers, ruby tomatoes, and fresh mint in lemon vinaigrette.',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
    preparationTimeMinutes: 12,
    servings: 1,
    caloriesPerServing: 310,
    proteinPerServing: 13.5,
    carbsPerServing: 42.0,
    fatPerServing: 10.5,
    dietaryTags: ['Vegetarian', 'Vegan Option', 'Gluten-Free', 'High-Fiber'],
    mealType: 'lunch',
    category: 'Mediterranean',
    ingredients: [
      { name: 'Boiled Chickpeas (Chana)', quantity: 150, unit: 'g', notes: 'Drained and rinsed' },
      { name: 'English Cucumber', quantity: 70, unit: 'g', notes: 'Diced' },
      { name: 'Cherry Tomatoes', quantity: 60, unit: 'g', notes: 'Halved' },
      { name: 'Extra Virgin Olive Oil', quantity: 10, unit: 'g', notes: 'Cold pressed' },
      { name: 'Fresh Lemon Juice & Herbs', quantity: 15, unit: 'g', notes: 'Mint and oregano' },
    ],
    instructions: [
      'Rinse and drain cooked chickpeas; transfer to a wide wooden bowl.',
      'Dice cucumbers, halve cherry tomatoes, and thinly slice red onion.',
      'Whisk lemon juice, olive oil, dried oregano, salt, and freshly cracked black pepper.',
      'Pour vinaigrette over chickpeas and vegetables; toss thoroughly.',
      'Finish with torn mint leaves and serve chilled.',
    ],
  },
  {
    id: 'recipe-vegetable-poha',
    title: 'Nutritious Vegetable Poha',
    description: 'Flattened rice tempered with mustard seeds, curry leaves, roasted crunchy peanuts, diced carrots, and green peas.',
    imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
    preparationTimeMinutes: 18,
    servings: 1,
    caloriesPerServing: 285,
    proteinPerServing: 7.5,
    carbsPerServing: 48.0,
    fatPerServing: 8.0,
    dietaryTags: ['Vegetarian', 'Vegan', 'Quick & Easy', 'Gluten-Free'],
    mealType: 'breakfast',
    category: 'Indian',
    ingredients: [
      { name: 'Thick Poha (Flattened Rice)', quantity: 70, unit: 'g', notes: 'Gently rinsed' },
      { name: 'Raw Peanuts', quantity: 15, unit: 'g', notes: 'Roasted crunchy' },
      { name: 'Mixed Veggies (Carrots & Peas)', quantity: 60, unit: 'g', notes: 'Diced' },
      { name: 'Mustard Seeds & Curry Leaves', quantity: 5, unit: 'g', notes: 'Fresh' },
      { name: 'Oil & Lemon Juice', quantity: 8, unit: 'g', notes: 'Cold pressed' },
    ],
    instructions: [
      'Gently rinse poha in a colander for 30 seconds; let drain completely.',
      'Heat oil in a pan; splutter mustard seeds, green chilies, and crunchy peanuts.',
      'Add curry leaves, diced carrots, and green peas; sauté for 3-4 minutes.',
      'Add softened poha, turmeric, and pink salt; toss gently on low heat.',
      'Finish with lemon juice and freshly chopped cilantro.',
    ],
  },
  {
    id: 'recipe-overnight-oats',
    title: 'Berry Antioxidant Overnight Oats',
    description: 'Creamy rolled oats soaked overnight in almond milk, chia seeds, Greek yogurt, topped with fresh raspberries and toasted almonds.',
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    preparationTimeMinutes: 5,
    servings: 1,
    caloriesPerServing: 345,
    proteinPerServing: 17.0,
    carbsPerServing: 46.0,
    fatPerServing: 11.0,
    dietaryTags: ['Vegetarian', 'High-Protein', 'High-Fiber', 'Meal-Prep'],
    mealType: 'breakfast',
    category: 'Breakfast',
    ingredients: [
      { name: 'Rolled Oats', quantity: 50, unit: 'g', notes: 'Whole rolled' },
      { name: 'Plain Greek Yogurt', quantity: 80, unit: 'g', notes: 'Low fat' },
      { name: 'Almond Milk (Unsweetened)', quantity: 120, unit: 'ml', notes: 'Plant milk' },
      { name: 'Chia Seeds', quantity: 10, unit: 'g', notes: 'Rich in Omega-3' },
      { name: 'Fresh Berries & Almonds', quantity: 40, unit: 'g', notes: 'Garnish' },
    ],
    instructions: [
      'In a glass jar, combine rolled oats, chia seeds, and a pinch of cinnamon.',
      'Pour in almond milk and Greek yogurt; stir until thoroughly mixed.',
      'Seal the jar and refrigerate overnight (at least 6 hours).',
      'In the morning, top with fresh berries and toasted almond slivers.',
    ],
  },
  {
    id: 'recipe-chicken-quinoa',
    title: 'Lemon-Herb Grilled Chicken & Quinoa',
    description: 'Juicy lemon-herb grilled chicken breast over fluffy quinoa, sliced avocado, steamed broccoli, and roasted sunflower seeds.',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    preparationTimeMinutes: 25,
    servings: 1,
    caloriesPerServing: 465,
    proteinPerServing: 45.0,
    carbsPerServing: 32.0,
    fatPerServing: 18.0,
    dietaryTags: ['High-Protein', 'Gluten-Free', 'Clean Eating'],
    mealType: 'dinner',
    category: 'Bowls',
    ingredients: [
      { name: 'Chicken Breast Fillet', quantity: 160, unit: 'g', notes: 'Boneless, skinless' },
      { name: 'Cooked Quinoa', quantity: 120, unit: 'g', notes: 'Fluffy warm' },
      { name: 'Hass Avocado', quantity: 45, unit: 'g', notes: 'Sliced' },
      { name: 'Steamed Broccoli Florets', quantity: 70, unit: 'g', notes: 'Bright green' },
      { name: 'Extra Virgin Olive Oil', quantity: 8, unit: 'g', notes: 'Drizzle' },
    ],
    instructions: [
      'Season chicken breast with olive oil, oregano, garlic powder, and fresh lemon zest.',
      'Sear in a hot skillet for 6 minutes per side until thoroughly cooked (165°F / 74°C).',
      'Let the chicken rest for 5 minutes, then slice across the grain.',
      'Arrange cooked quinoa in a bowl, top with sliced chicken, avocado, and steamed broccoli.',
      'Drizzle with olive oil and toasted sesame seeds.',
    ],
  },
  {
    id: 'recipe-tofu-stir-fry',
    title: 'Crispy Tofu & Green Veggie Stir-Fry',
    description: 'Pan-crisped golden tofu cubes tossed with broccoli florets, bell peppers, and snap peas in a savory ginger-sesame glaze.',
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    preparationTimeMinutes: 20,
    servings: 1,
    caloriesPerServing: 290,
    proteinPerServing: 19.0,
    carbsPerServing: 16.0,
    fatPerServing: 17.0,
    dietaryTags: ['Vegan', 'Vegetarian', 'Gluten-Free', 'High-Protein'],
    mealType: 'dinner',
    category: 'Asian',
    ingredients: [
      { name: 'Firm Tofu', quantity: 150, unit: 'g', notes: 'Pressed and cubed' },
      { name: 'Broccoli Florets & Snap Peas', quantity: 100, unit: 'g', notes: 'Tender crisp' },
      { name: 'Sesame Oil', quantity: 8, unit: 'g', notes: 'Toasted' },
      { name: 'Tamari / Low-Sodium Soy', quantity: 15, unit: 'g', notes: 'Gluten-free' },
      { name: 'Ginger & Garlic', quantity: 8, unit: 'g', notes: 'Minced' },
    ],
    instructions: [
      'Press tofu with a clean kitchen towel to remove excess moisture; cut into 1-inch cubes.',
      'Pan-fry in sesame oil over medium-high heat until golden brown on all sides.',
      'Add minced ginger, garlic, broccoli, and snap peas; stir-fry for 3-4 minutes.',
      'Whisk tamari sauce with a dash of water and pour into the skillet.',
      'Toss vigorously for 1 minute until glazed and aromatic.',
    ],
  },
  {
    id: 'recipe-green-glow-smoothie',
    title: 'Tropical Green Glow Smoothie',
    description: 'Refreshing blend of baby spinach, frozen pineapple chunks, creamy banana, coconut water, and clean plant protein.',
    imageUrl: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?auto=format&fit=crop&w=800&q=80',
    preparationTimeMinutes: 5,
    servings: 1,
    caloriesPerServing: 260,
    proteinPerServing: 23.0,
    carbsPerServing: 36.0,
    fatPerServing: 2.5,
    dietaryTags: ['Vegan', 'Vegetarian', 'High-Protein', 'Quick & Easy'],
    mealType: 'snack',
    category: 'Smoothies',
    ingredients: [
      { name: 'Fresh Baby Spinach', quantity: 50, unit: 'g', notes: 'Organic leaves' },
      { name: 'Frozen Pineapple Chunks', quantity: 80, unit: 'g', notes: 'Sweet & tangy' },
      { name: 'Ripe Banana', quantity: 80, unit: 'g', notes: 'Fresh or frozen' },
      { name: 'Pure Coconut Water', quantity: 200, unit: 'ml', notes: 'Hydrating base' },
      { name: 'Plant Protein Powder', quantity: 25, unit: 'g', notes: 'Vanilla flavor' },
    ],
    instructions: [
      'Add coconut water and baby spinach to blender pitcher first.',
      'Add frozen pineapple chunks, banana slices, and protein powder.',
      'Blend on high speed for 60 seconds until velvety smooth and vibrant green.',
      'Pour into a chilled tall glass and enjoy immediately.',
    ],
  },
];

export function getRecipes(req, res) {
  const { q, diet, mealType, category } = req.query;
  let filtered = [...RECIPES_DATA];

  if (q) {
    const query = q.toLowerCase().trim();
    filtered = filtered.filter(
      r => r.title.toLowerCase().includes(query) || r.description.toLowerCase().includes(query)
    );
  }

  if (diet) {
    const targetDiet = diet.toLowerCase();
    filtered = filtered.filter(r => 
      r.dietaryTags.some(tag => tag.toLowerCase() === targetDiet)
    );
  }

  if (mealType) {
    const targetMeal = mealType.toLowerCase();
    filtered = filtered.filter(r => r.mealType.toLowerCase() === targetMeal);
  }

  if (category) {
    const targetCat = category.toLowerCase();
    filtered = filtered.filter(r => r.category.toLowerCase() === targetCat);
  }

  return res.json({
    success: true,
    count: filtered.length,
    recipes: filtered,
  });
}

export function getRecipeById(req, res) {
  const { id } = req.params;
  const targetServings = parseFloat(req.query.servings) || 1;

  const recipe = RECIPES_DATA.find(r => r.id === id);
  if (!recipe) {
    return res.status(404).json({
      error: 'Recipe not found.',
      code: 'NOT_FOUND',
    });
  }

  const scaled = scaleRecipe(recipe, targetServings);
  return res.json({
    success: true,
    recipe: scaled,
  });
}

