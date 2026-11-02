-- ====================================================================
-- NAV AI SEED DATA
-- Curated verified food database and realistic, nutritious recipes
-- ====================================================================

-- 1. VERIFIED REFERENCE FOOD ITEMS
INSERT INTO public.food_items (name, normalized_name, category, serving_basis, serving_size_g, serving_unit, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, nutrition_source, is_estimated)
VALUES
('Cooked White Rice', 'rice cooked white', 'Grains', '100g', 150, 'g', 130.0, 2.7, 28.2, 0.3, 0.4, 'USDA FoodData Central', false),
('Cooked Brown Rice', 'rice cooked brown', 'Grains', '100g', 150, 'g', 111.0, 2.6, 23.0, 0.9, 1.8, 'USDA FoodData Central', false),
('Cooked Quinoa', 'quinoa cooked', 'Grains', '100g', 185, 'g', 120.0, 4.4, 21.3, 1.9, 2.8, 'USDA FoodData Central', false),
('Rolled Oats (Dry)', 'oats dry rolled', 'Grains', '100g', 40, 'g', 389.0, 16.9, 66.3, 6.9, 10.6, 'USDA FoodData Central', false),
('Poha (Flattened Rice, Dry)', 'poha flattened rice dry', 'Grains', '100g', 60, 'g', 350.0, 7.0, 77.0, 1.0, 2.0, 'Curated Indian Food Composition', false),
('Whole Wheat Roti / Chapati', 'roti chapati whole wheat', 'Grains', '100g', 40, 'piece', 264.0, 9.0, 52.0, 3.5, 9.0, 'Curated Indian Food Composition', false),
('Grilled Chicken Breast', 'chicken breast grilled skinless', 'Poultry', '100g', 150, 'g', 165.0, 31.0, 0.0, 3.6, 0.0, 'USDA FoodData Central', false),
('Cooked Yellow Dal (Tadka)', 'dal yellow cooked tadka toor moong', 'Legumes', '100g', 150, 'g', 105.0, 6.5, 14.2, 2.8, 4.1, 'Curated Indian Food Composition', false),
('Boiled Chickpeas (Chole)', 'chickpeas boiled garbanzo', 'Legumes', '100g', 160, 'g', 164.0, 8.9, 27.4, 2.6, 7.6, 'USDA FoodData Central', false),
('Fresh Paneer (Cottage Cheese)', 'paneer indian cottage cheese', 'Dairy', '100g', 100, 'g', 265.0, 18.3, 3.4, 20.8, 0.0, 'Curated Indian Food Composition', false),
('Greek Yogurt (Plain 0%)', 'greek yogurt nonfat plain', 'Dairy', '100g', 150, 'g', 59.0, 10.0, 3.6, 0.4, 0.0, 'USDA FoodData Central', false),
('Hard Boiled Egg', 'egg boiled large', 'Poultry/Egg', '100g', 50, 'piece', 155.0, 12.6, 1.1, 10.6, 0.0, 'USDA FoodData Central', false),
('Hass Avocado', 'avocado hass fresh', 'Produce', '100g', 50, 'g', 160.0, 2.0, 8.5, 14.7, 6.7, 'USDA FoodData Central', false),
('Fresh Baby Spinach', 'spinach raw baby', 'Produce', '100g', 50, 'g', 23.0, 2.9, 3.6, 0.4, 2.2, 'USDA FoodData Central', false),
('Steamed Broccoli', 'broccoli steamed', 'Produce', '100g', 100, 'g', 35.0, 2.4, 7.2, 0.4, 3.3, 'USDA FoodData Central', false),
('Atlantic Salmon Fillet (Pan-Seared)', 'salmon atlantic cooked', 'Seafood', '100g', 150, 'g', 206.0, 22.1, 0.0, 12.3, 0.0, 'USDA FoodData Central', false),
('Olive Oil', 'olive oil extra virgin', 'Fats & Oils', '100g', 14, 'tbsp', 884.0, 0.0, 0.0, 100.0, 0.0, 'USDA FoodData Central', false),
('Desi Ghee', 'ghee clarified butter', 'Fats & Oils', '100g', 14, 'tbsp', 900.0, 0.0, 0.0, 100.0, 0.0, 'Curated Indian Food Composition', false),
('Mixed Salad Greens', 'salad greens mixed baby lettuce arugula', 'Produce', '100g', 80, 'g', 17.0, 1.5, 3.0, 0.2, 1.8, 'USDA FoodData Central', false),
('Cherry Tomatoes', 'tomatoes cherry raw', 'Produce', '100g', 100, 'g', 18.0, 0.9, 3.9, 0.2, 1.2, 'USDA FoodData Central', false),
('Cucumber (Sliced)', 'cucumber raw sliced with peel', 'Produce', '100g', 100, 'g', 15.0, 0.7, 3.6, 0.1, 0.5, 'USDA FoodData Central', false),
('Banana', 'banana fresh ripe', 'Fruits', '100g', 120, 'piece', 89.0, 1.1, 22.8, 0.3, 2.6, 'USDA FoodData Central', false),
('Fresh Blueberries', 'blueberries fresh raw', 'Fruits', '100g', 80, 'g', 57.0, 0.7, 14.5, 0.3, 2.4, 'USDA FoodData Central', false),
('Almonds (Raw)', 'almonds raw whole', 'Nuts & Seeds', '100g', 30, 'g', 579.0, 21.2, 21.6, 49.9, 12.5, 'USDA FoodData Central', false),
('Chia Seeds', 'chia seeds dry', 'Nuts & Seeds', '100g', 15, 'tbsp', 486.0, 16.5, 42.1, 30.7, 34.4, 'USDA FoodData Central', false),
('Whey Protein Powder', 'whey protein powder isolate', 'Supplements', '100g', 30, 'scoop', 370.0, 80.0, 5.0, 3.0, 0.0, 'Verified Brand Panel', false)
ON CONFLICT DO NOTHING;

-- 2. CURATED REALISTIC RECIPES
INSERT INTO public.recipes (id, title, description, image_url, instructions, preparation_time_minutes, servings, dietary_tags, calories_per_serving, protein_per_serving_g, carbs_per_serving_g, fat_per_serving_g)
VALUES
(
    '00000000-0000-0000-0000-000000000001',
    'High-Protein Paneer Bhurji with Mint',
    'Scrambled fresh paneer spiced with cumin, turmeric, green chillies, diced red onions, and fresh garden mint. High-protein, satisfying vegetarian classic.',
    'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
    ARRAY[
        'Heat 1 tsp olive oil or ghee in a pan over medium heat, add cumin seeds and saute until fragrant.',
        'Add finely chopped onions, ginger, and green chillies. Sauté until light golden brown.',
        'Add diced tomatoes, turmeric, garam masala, and salt. Cook until soft.',
        'Crumble fresh paneer into the skillet and toss gently for 3-4 minutes.',
        'Garnish with freshly chopped cilantro and mint leaves. Serve hot with warm chapati or multigrain toast.'
    ],
    15,
    2,
    ARRAY['Vegetarian', 'High-Protein', 'Gluten-Free', 'Under 20m'],
    310.0,
    22.0,
    8.0,
    21.0
),
(
    '00000000-0000-0000-0000-000000000002',
    'Comforting Dal Tadka & Jeera Brown Rice',
    'Slow-simmered yellow toor and moong lentils tempered with garlic, cumin, and hing, paired with aromatic jeera brown rice. Balanced complete plant protein.',
    'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    ARRAY[
        'Pressure cook toor and moong dal with turmeric, sliced tomato, and water for 3-4 whistles until creamy.',
        'In a small tadka pan, heat 1 tsp ghee, crackle cumin seeds, crushed garlic, and dried red chilli.',
        'Pour aromatic tempering directly into simmering dal. Season with pink salt and fresh lime juice.',
        'Serve accompanied by steamed jeera brown rice and cucumber slices.'
    ],
    25,
    2,
    ARRAY['Vegetarian', 'Vegan', 'Gluten-Free', 'High-Fiber'],
    345.0,
    14.5,
    58.0,
    6.0
),
(
    '00000000-0000-0000-0000-000000000003',
    'Mediterranean Chickpea & Avocado Bowl',
    'Crisp English cucumber, cherry tomatoes, kalamata olives, creamy avocado, and tender chickpeas tossed in cold-pressed lemon-oregano vinaigrette.',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
    ARRAY[
        'Rinse and drain boiled chickpeas thoroughly.',
        'In a wide salad bowl, combine chickpeas, halved cherry tomatoes, diced cucumbers, and sliced avocado.',
        'Whisk 1 tbsp extra virgin olive oil with lemon juice, oregano, sea salt, and black pepper.',
        'Drizzle dressing over the bowl and toss lightly. Top with optional crumbled feta.'
    ],
    10,
    1,
    ARRAY['Vegetarian', 'Vegan', 'Gluten-Free', 'High-Fiber', 'Under 20m'],
    380.0,
    13.0,
    42.0,
    19.0
),
(
    '00000000-0000-0000-0000-000000000004',
    'Nutrient-Dense Vegetable Poha',
    'Light and fluffy flattened rice tempered with mustard seeds, curry leaves, roasted peanuts, crunchy carrots, and fresh green peas with lemon squeeze.',
    'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
    ARRAY[
        'Rinse poha in a colander under running water for 30 seconds. Drain completely and set aside.',
        'Heat oil in a pan, roast peanuts until golden, then set peanuts aside.',
        'In the same pan, splutter mustard seeds, curry leaves, green chillies, and diced onions.',
        'Add diced carrots and peas; cook covered for 3 minutes.',
        'Add turmeric, salt, and drained poha. Mix gently on low heat for 2 minutes.',
        'Finish with lemon juice, fresh coriander, and reserved crunchy peanuts.'
    ],
    15,
    2,
    ARRAY['Vegetarian', 'Vegan', 'Gluten-Free', 'Under 20m'],
    265.0,
    6.5,
    44.0,
    7.5
),
(
    '00000000-0000-0000-0000-000000000005',
    'Chia & Berry Overnight Power Oats',
    'Rolled oats soaked in almond milk with chia seeds, whey isolate, pure vanilla, topped with fresh blueberries and sliced banana.',
    'https://images.unsplash.com/photo-1584776296944-ab6fb57b0bdd?auto=format&fit=crop&w=800&q=80',
    ARRAY[
        'In a mason jar, mix rolled oats, chia seeds, protein powder, and unsweetened almond milk.',
        'Stir well with a fork until no lumps remain. Seal and refrigerate overnight (at least 4 hours).',
        'In the morning, stir gently. Top with fresh blueberries and sliced banana before serving.'
    ],
    5,
    1,
    ARRAY['Vegetarian', 'High-Protein', 'Under 20m'],
    340.0,
    28.0,
    45.0,
    6.0
),
(
    '00000000-0000-0000-0000-000000000006',
    'Rosemary Lemon Herb Grilled Chicken Bowl',
    'Tender herb-marinated grilled chicken breast over fluffy cooked quinoa, roasted asparagus, and ruby cherry tomatoes with avocado slices.',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    ARRAY[
        'Season chicken breast with minced garlic, fresh rosemary, lemon zest, olive oil, salt, and black pepper.',
        'Grill over medium-high heat for 6-7 minutes per side until internal temperature reaches 165°F (74°C). Let rest 5 minutes, then slice.',
        'Warm pre-cooked quinoa and place at the base of the bowl.',
        'Arrange sliced grilled chicken, halved cherry tomatoes, steamed vegetables, and sliced avocado.',
        'Drizzle with lemon vinaigrette and enjoy warm.'
    ],
    20,
    1,
    ARRAY['High-Protein', 'Gluten-Free', 'Low-Carb'],
    465.0,
    48.0,
    24.0,
    19.0
),
(
    '00000000-0000-0000-0000-000000000007',
    'Lemon Garlic Pan-Seared Salmon',
    'Crisp-skinned wild Atlantic salmon drizzled in garlic-infused olive oil and fresh dill, served alongside steamed lemon broccoli.',
    'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80',
    ARRAY[
        'Pat salmon fillet completely dry with paper towels; season skin and flesh generously with salt and pepper.',
        'Heat 1 tsp olive oil in a non-stick skillet over medium-high heat until shimmering.',
        'Place salmon skin-side down; press lightly for 10 seconds. Sear undisturbed for 4-5 minutes until skin is golden crisp.',
        'Flip carefully, add minced garlic and lemon juice to the pan, cook 2-3 minutes more.',
        'Serve with steamed broccoli florets garnished with dill and lemon wedges.'
    ],
    20,
    1,
    ARRAY['High-Protein', 'Gluten-Free', 'Low-Carb', 'Keto-Friendly'],
    380.0,
    36.0,
    7.0,
    23.0
),
(
    '00000000-0000-0000-0000-000000000008',
    'Sizzling Lean Beef & Bell Pepper Fajitas',
    'Lean flank steak strips seared with vibrant tricolor bell peppers, red onions, smoked paprika, cumin, and fresh cilantro.',
    'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80',
    ARRAY[
        'Slice flank steak against the grain into thin strips; toss with cumin, chilli powder, oregano, and lime juice.',
        'Heat a cast-iron skillet until smoking hot. Add 1 tsp oil and sear steak for 2-3 minutes until browned; transfer to plate.',
        'In the same skillet, saute sliced peppers and onions for 3-4 minutes until tender-crisp with charred edges.',
        'Return beef and resting juices to the pan, toss together for 1 minute.',
        'Serve hot with warm whole wheat tortillas or over crisp romaine.'
    ],
    25,
    2,
    ARRAY['High-Protein', 'Gluten-Free'],
    395.0,
    38.0,
    14.0,
    18.0
)
ON CONFLICT (id) DO NOTHING;

-- 3. INGREDIENTS MAPPINGS FOR RECIPES
INSERT INTO public.recipe_ingredients (recipe_id, ingredient_name, quantity, unit, notes)
VALUES
-- Paneer Bhurji
('00000000-0000-0000-0000-000000000001', 'Fresh Paneer', 200, 'g', 'Crumpled finely'),
('00000000-0000-0000-0000-000000000001', 'Red Onion', 80, 'g', 'Finely chopped'),
('00000000-0000-0000-0000-000000000001', 'Tomatoes', 80, 'g', 'Diced'),
('00000000-0000-0000-0000-000000000001', 'Olive Oil', 10, 'g', 'For tempering'),
('00000000-0000-0000-0000-000000000001', 'Fresh Mint & Cilantro', 15, 'g', 'Chopped'),

-- Dal Tadka
('00000000-0000-0000-0000-000000000002', 'Yellow Toor/Moong Dal (Cooked)', 300, 'g', 'Simmered with turmeric'),
('00000000-0000-0000-0000-000000000002', 'Cooked Brown Rice', 250, 'g', 'Steamed'),
('00000000-0000-0000-0000-000000000002', 'Desi Ghee', 10, 'g', 'For tadka'),
('00000000-0000-0000-0000-000000000002', 'Garlic & Cumin', 10, 'g', 'Crushed'),

-- Chickpea Salad
('00000000-0000-0000-0000-000000000003', 'Boiled Chickpeas', 160, 'g', 'Rinsed and drained'),
('00000000-0000-0000-0000-000000000003', 'Hass Avocado', 60, 'g', 'Diced'),
('00000000-0000-0000-0000-000000000003', 'Cherry Tomatoes', 80, 'g', 'Halved'),
('00000000-0000-0000-0000-000000000003', 'Cucumber', 80, 'g', 'Diced'),
('00000000-0000-0000-0000-000000000003', 'Olive Oil & Lemon', 12, 'g', 'Vinaigrette'),

-- Grilled Chicken Bowl
('00000000-0000-0000-0000-000000000006', 'Grilled Chicken Breast', 160, 'g', 'Skinless breast'),
('00000000-0000-0000-0000-000000000006', 'Cooked Quinoa', 100, 'g', 'Fluffy'),
('00000000-0000-0000-0000-000000000006', 'Hass Avocado', 50, 'g', 'Sliced'),
('00000000-0000-0000-0000-000000000006', 'Cherry Tomatoes', 60, 'g', 'Fresh'),
('00000000-0000-0000-0000-000000000006', 'Mixed Salad Greens', 50, 'g', 'Baby greens')
ON CONFLICT DO NOTHING;

