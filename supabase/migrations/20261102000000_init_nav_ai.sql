-- ====================================================================
-- NAV AI SUPABASE POSTGRESQL INITIAL MIGRATION
-- Production-ready schema with RLS, triggers, indexes, and constraints
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS & HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    age INTEGER CHECK (age > 0 AND age < 130),
    height_cm NUMERIC(5,2) CHECK (height_cm > 0),
    current_weight_kg NUMERIC(5,2) CHECK (current_weight_kg > 0),
    activity_level TEXT CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')) DEFAULT 'moderate',
    goal_type TEXT CHECK (goal_type IN ('lose_weight', 'maintain_weight', 'gain_weight', 'improve_consistency')) DEFAULT 'maintain_weight',
    dietary_preference TEXT DEFAULT 'all',
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Profiles trigger for updated_at
CREATE OR REPLACE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Automatically create profile on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO NOTHING;

    -- Also seed default daily goal
    INSERT INTO public.daily_goals (user_id, calorie_target, protein_target_g, carbs_target_g, fat_target_g, water_target_ml)
    VALUES (NEW.id, 2000, 120, 220, 60, 2500)
    ON CONFLICT DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. DAILY GOALS TABLE
CREATE TABLE IF NOT EXISTS public.daily_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
    calorie_target INTEGER NOT NULL DEFAULT 2000 CHECK (calorie_target >= 800 AND calorie_target <= 10000),
    protein_target_g NUMERIC(6,1) NOT NULL DEFAULT 120 CHECK (protein_target_g >= 0),
    carbs_target_g NUMERIC(6,1) NOT NULL DEFAULT 220 CHECK (carbs_target_g >= 0),
    fat_target_g NUMERIC(6,1) NOT NULL DEFAULT 60 CHECK (fat_target_g >= 0),
    water_target_ml INTEGER NOT NULL DEFAULT 2500 CHECK (water_target_ml >= 500 AND water_target_ml <= 15000),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER update_daily_goals_updated_at
BEFORE UPDATE ON public.daily_goals
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_daily_goals_user_date ON public.daily_goals(user_id, effective_date);

-- 5. FOOD ITEMS (Verified and Reference Database)
CREATE TABLE IF NOT EXISTS public.food_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    normalized_name TEXT,
    category TEXT,
    serving_basis TEXT NOT NULL DEFAULT '100g',
    serving_size_g NUMERIC(6,1) DEFAULT 100,
    serving_unit TEXT DEFAULT 'g',
    calories_per_100g NUMERIC(6,1) NOT NULL CHECK (calories_per_100g >= 0),
    protein_per_100g NUMERIC(6,1) NOT NULL CHECK (protein_per_100g >= 0),
    carbs_per_100g NUMERIC(6,1) NOT NULL CHECK (carbs_per_100g >= 0),
    fat_per_100g NUMERIC(6,1) NOT NULL CHECK (fat_per_100g >= 0),
    fiber_per_100g NUMERIC(6,1) DEFAULT 0,
    nutrition_source TEXT NOT NULL DEFAULT 'verified_reference',
    is_estimated BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_food_items_name ON public.food_items(name);
CREATE INDEX IF NOT EXISTS idx_food_items_normalized ON public.food_items(normalized_name);

-- 6. MEALS TABLE
CREATE TABLE IF NOT EXISTS public.meals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    meal_date DATE NOT NULL DEFAULT CURRENT_DATE,
    meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
    name TEXT NOT NULL,
    notes TEXT,
    image_path TEXT,
    total_calories NUMERIC(7,1) NOT NULL DEFAULT 0 CHECK (total_calories >= 0),
    total_protein_g NUMERIC(6,1) NOT NULL DEFAULT 0 CHECK (total_protein_g >= 0),
    total_carbs_g NUMERIC(6,1) NOT NULL DEFAULT 0 CHECK (total_carbs_g >= 0),
    total_fat_g NUMERIC(6,1) NOT NULL DEFAULT 0 CHECK (total_fat_g >= 0),
    nutrition_is_estimated BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER update_meals_updated_at
BEFORE UPDATE ON public.meals
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_meals_user_date ON public.meals(user_id, meal_date);

-- 7. MEAL ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.meal_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meal_id UUID NOT NULL REFERENCES public.meals(id) ON DELETE CASCADE,
    food_item_id UUID REFERENCES public.food_items(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    quantity NUMERIC(6,1) NOT NULL CHECK (quantity > 0),
    unit TEXT NOT NULL DEFAULT 'g',
    calories NUMERIC(6,1) NOT NULL DEFAULT 0,
    protein_g NUMERIC(6,1) NOT NULL DEFAULT 0,
    carbs_g NUMERIC(6,1) NOT NULL DEFAULT 0,
    fat_g NUMERIC(6,1) NOT NULL DEFAULT 0,
    nutrition_source TEXT NOT NULL DEFAULT 'estimate',
    is_estimated BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_meal_items_meal_id ON public.meal_items(meal_id);

-- 8. RECIPES TABLE
CREATE TABLE IF NOT EXISTS public.recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    instructions TEXT[] NOT NULL DEFAULT '{}',
    preparation_time_minutes INTEGER NOT NULL DEFAULT 20 CHECK (preparation_time_minutes > 0),
    servings INTEGER NOT NULL DEFAULT 2 CHECK (servings > 0),
    dietary_tags TEXT[] NOT NULL DEFAULT '{}',
    calories_per_serving NUMERIC(6,1) NOT NULL CHECK (calories_per_serving >= 0),
    protein_per_serving_g NUMERIC(6,1) NOT NULL CHECK (protein_per_serving_g >= 0),
    carbs_per_serving_g NUMERIC(6,1) NOT NULL CHECK (carbs_per_serving_g >= 0),
    fat_per_serving_g NUMERIC(6,1) NOT NULL CHECK (fat_per_serving_g >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. RECIPE INGREDIENTS TABLE
CREATE TABLE IF NOT EXISTS public.recipe_ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
    food_item_id UUID REFERENCES public.food_items(id) ON DELETE SET NULL,
    ingredient_name TEXT NOT NULL,
    quantity NUMERIC(6,1) NOT NULL CHECK (quantity > 0),
    unit TEXT NOT NULL,
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe_id ON public.recipe_ingredients(recipe_id);

-- 10. WATER LOGS TABLE
CREATE TABLE IF NOT EXISTS public.water_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    quantity_ml INTEGER NOT NULL CHECK (quantity_ml > 0),
    logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_water_logs_user_date ON public.water_logs(user_id, log_date);

-- 11. WEIGHT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.weight_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    weight_kg NUMERIC(5,2) NOT NULL CHECK (weight_kg > 0),
    recorded_at DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_weight_logs_user_date ON public.weight_logs(user_id, recorded_at);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Strict isolation ensuring users only access their own data
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weight_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view & update only their own profile
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Daily Goals: Users can view, insert, update own goals
CREATE POLICY "Users can view own goals"
    ON public.daily_goals FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals"
    ON public.daily_goals FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
    ON public.daily_goals FOR UPDATE
    USING (auth.uid() = user_id);

-- Food Items: Readable by all (authenticated + anonymous)
CREATE POLICY "Public read for food items"
    ON public.food_items FOR SELECT
    TO public
    USING (true);

-- Meals: Users can view, insert, update, delete own meals
CREATE POLICY "Users can view own meals"
    ON public.meals FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meals"
    ON public.meals FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meals"
    ON public.meals FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own meals"
    ON public.meals FOR DELETE
    USING (auth.uid() = user_id);

-- Meal Items: Protected through meal ownership
CREATE POLICY "Users can view own meal items"
    ON public.meal_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.meals
            WHERE public.meals.id = meal_items.meal_id
            AND public.meals.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own meal items"
    ON public.meal_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.meals
            WHERE public.meals.id = meal_items.meal_id
            AND public.meals.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own meal items"
    ON public.meal_items FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.meals
            WHERE public.meals.id = meal_items.meal_id
            AND public.meals.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own meal items"
    ON public.meal_items FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.meals
            WHERE public.meals.id = meal_items.meal_id
            AND public.meals.user_id = auth.uid()
        )
    );

-- Recipes: Public read-only for all users and guests
CREATE POLICY "Public read for recipes"
    ON public.recipes FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Public read for recipe ingredients"
    ON public.recipe_ingredients FOR SELECT
    TO public
    USING (true);

-- Water Logs: Users can view, insert, delete own logs
CREATE POLICY "Users can view own water logs"
    ON public.water_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own water logs"
    ON public.water_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own water logs"
    ON public.water_logs FOR DELETE
    USING (auth.uid() = user_id);

-- Weight Logs: Users can view, insert, update, delete own logs
CREATE POLICY "Users can view own weight logs"
    ON public.weight_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weight logs"
    ON public.weight_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weight logs"
    ON public.weight_logs FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own weight logs"
    ON public.weight_logs FOR DELETE
    USING (auth.uid() = user_id);

