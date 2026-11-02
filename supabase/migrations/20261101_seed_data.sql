-- ==============================================================================
-- NAV AI - SEED DATA: REFERENCE FOODS & CURATED RECIPES
-- ==============================================================================

-- 1. REFERENCE FOOD ITEMS (Nutrients per 100g)
insert into public.food_items (name, normalized_name, category, serving_basis, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, nutrition_source)
values
  ('Grilled Chicken Breast', 'grilled chicken breast', 'Poultry', '100g', 165.0, 31.0, 0.0, 3.6, 0.0, 'USDA FoodData Central'),
  ('Paneer (Indian Cottage Cheese)', 'paneer', 'Dairy', '100g', 265.0, 18.3, 3.4, 20.8, 0.0, 'Curated Nutrition Reference'),
  ('Cooked White Rice (Basmati)', 'cooked white rice', 'Grains', '100g', 130.0, 2.7, 28.2, 0.3, 0.4, 'USDA FoodData Central'),
  ('Whole Wheat Roti / Chapati', 'roti chapati', 'Grains', '100g', 240.0, 8.5, 49.0, 2.8, 7.5, 'Curated Nutrition Reference'),
  ('Yellow Dal Tadka (Cooked)', 'yellow dal tadka', 'Legumes', '100g', 115.0, 6.2, 17.5, 2.8, 4.2, 'Curated Nutrition Reference'),
  ('Boiled Eggs', 'boiled egg', 'Eggs', '100g', 155.0, 12.6, 1.1, 10.6, 0.0, 'USDA FoodData Central'),
  ('Rolled Oats (Raw)', 'rolled oats', 'Grains', '100g', 389.0, 16.9, 66.3, 6.9, 10.6, 'USDA FoodData Central'),
  ('Cooked Quinoa', 'cooked quinoa', 'Grains', '100g', 120.0, 4.4, 21.3, 1.9, 2.8, 'USDA FoodData Central'),
  ('Greek Yogurt (Plain, Low Fat)', 'greek yogurt', 'Dairy', '100g', 73.0, 10.0, 3.9, 1.9, 0.0, 'USDA FoodData Central'),
  ('Chickpeas (Boiled Chana)', 'boiled chickpeas', 'Legumes', '100g', 164.0, 8.9, 27.4, 2.6, 7.6, 'USDA FoodData Central'),
  ('Hass Avocado', 'avocado', 'Fruits', '100g', 160.0, 2.0, 8.5, 14.7, 6.7, 'USDA FoodData Central'),
  ('Steamed Broccoli', 'steamed broccoli', 'Vegetables', '100g', 35.0, 2.4, 7.2, 0.4, 2.6, 'USDA FoodData Central'),
  ('Banana', 'banana', 'Fruits', '100g', 89.0, 1.1, 22.8, 0.3, 2.6, 'USDA FoodData Central'),
  ('Almonds', 'almonds', 'Nuts', '100g', 579.0, 21.2, 21.6, 49.9, 12.5, 'USDA FoodData Central'),
  ('Tofu (Firm)', 'firm tofu', 'Soy', '100g', 144.0, 15.6, 2.8, 8.7, 2.3, 'USDA FoodData Central'),
  ('Olive Oil', 'olive oil', 'Fats & Oils', '100g', 884.0, 0.0, 0.0, 100.0, 0.0, 'USDA FoodData Central'),
  ('Chia Seeds', 'chia seeds', 'Seeds', '100g', 486.0, 16.5, 42.1, 30.7, 34.4, 'USDA FoodData Central'),
  ('Vegetable Poha (Cooked)', 'vegetable poha', 'Grains', '100g', 140.0, 2.8, 26.5, 3.2, 2.1, 'Curated Nutrition Reference')
on conflict do nothing;

-- 2. CURATED RECIPES WITH INGREDIENTS & NUTRITION
insert into public.recipes (
  title, description, image_url, instructions, preparation_time_minutes, 
  servings, calories_per_serving, protein_per_serving_g, carbs_per_serving_g, fat_per_serving_g, 
  dietary_tags, meal_type
)
values
  (
    'High-Protein Paneer Bhurji',
    'Scrambled cottage cheese tossed with diced onions, tomatoes, fresh green chilies, and aromatic turmeric, cumin, and coriander.',
    'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    array[
      'Heat 1 tbsp olive oil in a non-stick pan over medium heat.',
      'Add cumin seeds and finely chopped onions; sauté until golden brown.',
      'Add minced ginger, green chili, and chopped tomatoes. Cook until soft and fragrant.',
      'Sprinkle turmeric, red chili powder, coriander powder, and pink salt.',
      'Crumble fresh paneer into the pan and toss gently for 3-4 minutes.',
      'Garnish with chopped fresh cilantro and a squeeze of fresh lemon juice.'
    ],
    15,
    1,
    320,
    22.5,
    9.0,
    21.0,
    array['Vegetarian', 'High-Protein', 'Gluten-Free', 'Keto-Friendly'],
    'breakfast'
  ),
  (
    'Homestyle Dal & Basmati Bowl',
    'Comforting yellow moong and toor dal tempered with ghee, cumin seeds, garlic, and served with fluffy steamed basmati rice.',
    'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80',
    array[
      'Pressure cook rinsed lentils with water, turmeric, and salt until completely tender.',
      'Whisk dal gently to create a creamy texture.',
      'In a tadka pan, heat 1 tsp ghee; splutter cumin seeds, dry red chili, and minced garlic.',
      'Pour hot tadka over the dal and stir gently.',
      'Serve alongside 150g warm steamed basmati rice with cucumber slices.'
    ],
    25,
    1,
    380,
    14.8,
    64.0,
    5.5,
    array['Vegetarian', 'Comfort', 'Plant-Based Option'],
    'lunch'
  ),
  (
    'Zesty Mediterranean Chickpea Salad',
    'A crunchy, protein-packed bowl of boiled chickpeas, diced cucumbers, cherry tomatoes, kalamata olives, and fresh mint in lemon vinaigrette.',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
    array[
      'Rinse and drain cooked chickpeas; transfer to a large mixing bowl.',
      'Dice Persian cucumbers, halve ruby cherry tomatoes, and finely chop red onion.',
      'Whisk lemon juice, extra virgin olive oil, minced garlic, oregano, salt, and black pepper.',
      'Pour vinaigrette over chickpeas and vegetables; toss thoroughly.',
      'Finish with crumbled feta and torn fresh mint leaves. Serve chilled or room temperature.'
    ],
    12,
    1,
    310,
    13.5,
    42.0,
    10.5,
    array['Vegetarian', 'Vegan Option', 'Gluten-Free', 'High-Fiber'],
    'lunch'
  ),
  (
    'Healthy Vegetable Poha',
    'Flattened rice tempered with mustard seeds, curry leaves, roasted peanuts, crunchy carrots, and green peas.',
    'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
    array[
      'Gently rinse flattened rice (poha) in a colander and drain completely. Toss with a pinch of turmeric and salt.',
      'Heat oil in a pan; add mustard seeds, crunchy peanuts, and fresh green curry leaves.',
      'Add finely chopped onions, diced carrots, and green peas; cook for 4-5 minutes.',
      'Add softened poha and toss gently on low heat until thoroughly warmed.',
      'Finish with fresh coriander and generous lemon juice.'
    ],
    18,
    1,
    285,
    7.5,
    48.0,
    8.0,
    array['Vegetarian', 'Vegan', 'Quick & Easy', 'Gluten-Free'],
    'breakfast'
  ),
  (
    'Berry Antioxidant Overnight Oats',
    'Creamy rolled oats soaked overnight in almond milk, chia seeds, Greek yogurt, topped with fresh raspberries and toasted almonds.',
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    array[
      'In a glass jar, combine rolled oats, chia seeds, and a dash of cinnamon.',
      'Pour in unsweetened almond milk and plain Greek yogurt; stir until combined.',
      'Seal jar and refrigerate overnight (at least 6 hours).',
      'In the morning, top with fresh berries, sliced almonds, and a drizzle of pure maple syrup.'
    ],
    5,
    1,
    345,
    17.0,
    46.0,
    11.0,
    array['Vegetarian', 'High-Protein', 'High-Fiber', 'Meal-Prep'],
    'breakfast'
  ),
  (
    'Grilled Herb Chicken Quinoa Bowl',
    'Juicy lemon-herb grilled chicken breast over fluffy quinoa, sliced avocado, steamed broccoli, and roasted sunflower seeds.',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    array[
      'Season chicken breast with olive oil, oregano, garlic powder, salt, and lemon zest.',
      'Grill chicken on a cast-iron skillet for 6-7 minutes per side until internal temp is 165°F (74°C).',
      'Let rest for 5 minutes, then slice across the grain.',
      'Assemble warm cooked quinoa in a wide bowl, arrange sliced chicken, avocado, and steamed broccoli.',
      'Drizzle with olive oil and toasted sesame seeds.'
    ],
    25,
    1,
    465,
    45.0,
    32.0,
    18.0,
    array['High-Protein', 'Gluten-Free', 'Clean Eating'],
    'dinner'
  ),
  (
    'Crispy Tofu & Green Veggie Stir-Fry',
    'Pan-crisped golden tofu cubes tossed with broccoli florets, bell peppers, and snap peas in a ginger-sesame amino glaze.',
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    array[
      'Press firm tofu with a clean kitchen towel to remove moisture, then cube into 1-inch pieces.',
      'Pan fry tofu in sesame oil over medium-high heat until golden brown on all sides.',
      'Add minced ginger, garlic, broccoli, sliced bell peppers, and snap peas.',
      'Whisk low-sodium soy sauce (or tamari) with rice vinegar and a touch of arrowroot starch.',
      'Pour sauce into skillet, tossing vigorously for 2 minutes until glossy and vegetables are tender-crisp.'
    ],
    20,
    1,
    290,
    19.0,
    16.0,
    17.0,
    array['Vegan', 'Vegetarian', 'Gluten-Free', 'High-Protein'],
    'dinner'
  ),
  (
    'Tropical Green Glow Smoothie',
    'Refreshing blend of baby spinach, frozen pineapple chunks, creamy banana, coconut water, and plant protein powder.',
    'https://images.unsplash.com/photo-1610970881699-44a5587cabec?auto=format&fit=crop&w=800&q=80',
    array[
      'Add fresh coconut water to blender first.',
      'Pack in fresh baby spinach leaves.',
      'Add frozen banana slices, frozen pineapple chunks, and 1 scoop vanilla protein powder.',
      'Blend on high speed for 60 seconds until completely smooth and velvety.',
      'Pour into a chilled glass and enjoy immediately.'
    ],
    5,
    1,
    260,
    23.0,
    36.0,
    2.5,
    array['Vegan', 'Vegetarian', 'High-Protein', 'Quick & Easy'],
    'snack'
  );

