-- ==============================================================================
-- NAV AI - SUPABASE DATABASE INITIAL SCHEMA & RLS POLICIES
-- ==============================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. PROFILES TABLE
-- References Supabase Auth users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  age integer check (age is null or (age >= 10 and age <= 120)),
  height_cm numeric(5, 2) check (height_cm is null or (height_cm > 50 and height_cm < 300)),
  current_weight_kg numeric(5, 2) check (current_weight_kg is null or (current_weight_kg > 20 and current_weight_kg < 400)),
  activity_level text check (activity_level in ('sedentary', 'light', 'moderate', 'active', 'very_active')) default 'moderate',
  goal_type text check (goal_type in ('maintain', 'lose', 'gain', 'consistency')) default 'maintain',
  dietary_preference text check (dietary_preference in ('all', 'vegetarian', 'vegan', 'keto', 'pescatarian')) default 'all',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. DAILY NUTRITION GOALS TABLE
create table if not exists public.daily_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  target_date date not null default current_date,
  calorie_target integer not null check (calorie_target >= 800 and calorie_target <= 8000) default 2000,
  protein_target_g numeric(5, 1) not null check (protein_target_g >= 10 and protein_target_g <= 400) default 75,
  carbs_target_g numeric(5, 1) not null check (carbs_target_g >= 10 and carbs_target_g <= 800) default 250,
  fat_target_g numeric(5, 1) not null check (fat_target_g >= 10 and fat_target_g <= 300) default 65,
  water_target_ml integer not null check (water_target_ml >= 500 and water_target_ml <= 8000) default 2500,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint unique_user_daily_goal unique (user_id, target_date)
);

-- 4. FOOD ITEMS REFERENCE TABLE
create table if not exists public.food_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  normalized_name text,
  category text,
  serving_basis text not null default '100g',
  calories_per_100g numeric(6, 1) not null check (calories_per_100g >= 0),
  protein_per_100g numeric(5, 1) not null check (protein_per_100g >= 0),
  carbs_per_100g numeric(5, 1) not null check (carbs_per_100g >= 0),
  fat_per_100g numeric(5, 1) not null check (fat_per_100g >= 0),
  fiber_per_100g numeric(5, 1) default 0,
  nutrition_source text default 'USDA / Curated Food DB',
  is_estimated boolean default false,
  created_at timestamptz not null default now()
);

-- Index for searching food items
create index if not exists idx_food_items_name on public.food_items using gin (to_tsvector('english', name));

-- 5. MEALS TABLE
create table if not exists public.meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  meal_date date not null default current_date,
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  name text not null,
  notes text,
  image_path text,
  total_calories integer not null default 0 check (total_calories >= 0),
  total_protein_g numeric(6, 1) not null default 0 check (total_protein_g >= 0),
  total_carbs_g numeric(6, 1) not null default 0 check (total_carbs_g >= 0),
  total_fat_g numeric(6, 1) not null default 0 check (total_fat_g >= 0),
  nutrition_is_estimated boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_meals_user_date on public.meals(user_id, meal_date);

-- 6. MEAL ITEMS TABLE
create table if not exists public.meal_items (
  id uuid primary key default gen_random_uuid(),
  meal_id uuid not null references public.meals(id) on delete cascade,
  food_item_id uuid references public.food_items(id) on delete set null,
  name text not null,
  quantity numeric(7, 2) not null check (quantity > 0),
  unit text not null default 'g',
  calories numeric(6, 1) not null default 0 check (calories >= 0),
  protein_g numeric(5, 1) not null default 0 check (protein_g >= 0),
  carbs_g numeric(5, 1) not null default 0 check (carbs_g >= 0),
  fat_g numeric(5, 1) not null default 0 check (fat_g >= 0),
  nutrition_source text default 'Estimate',
  is_estimated boolean default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_meal_items_meal on public.meal_items(meal_id);

-- 7. RECIPES TABLE
create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  image_url text,
  instructions text[] not null,
  preparation_time_minutes integer not null default 20 check (preparation_time_minutes > 0),
  servings integer not null default 1 check (servings > 0),
  calories_per_serving integer not null check (calories_per_serving >= 0),
  protein_per_serving_g numeric(5, 1) not null check (protein_per_serving_g >= 0),
  carbs_per_serving_g numeric(5, 1) not null check (carbs_per_serving_g >= 0),
  fat_per_serving_g numeric(5, 1) not null check (fat_per_serving_g >= 0),
  dietary_tags text[] default '{}',
  meal_type text default 'lunch',
  created_at timestamptz not null default now()
);

-- 8. RECIPE INGREDIENTS TABLE
create table if not exists public.recipe_ingredients (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  food_item_id uuid references public.food_items(id) on delete set null,
  ingredient_name text not null,
  quantity numeric(6, 2) not null check (quantity > 0),
  unit text not null default 'g',
  notes text
);

create index if not exists idx_recipe_ingredients_recipe on public.recipe_ingredients(recipe_id);

-- 9. WATER LOGS TABLE
create table if not exists public.water_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  quantity_ml integer not null check (quantity_ml > 0),
  logged_at timestamptz not null default now()
);

create index if not exists idx_water_logs_user_logged on public.water_logs(user_id, logged_at);

-- 10. WEIGHT LOGS TABLE
create table if not exists public.weight_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  weight_kg numeric(5, 2) not null check (weight_kg > 20 and weight_kg < 400),
  recorded_at date not null default current_date,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_weight_logs_user_date on public.weight_logs(user_id, recorded_at);


-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

alter table public.profiles enable row level security;
alter table public.daily_goals enable row level security;
alter table public.food_items enable row level security;
alter table public.meals enable row level security;
alter table public.meal_items enable row level security;
alter table public.recipes enable row level security;
alter table public.recipe_ingredients enable row level security;
alter table public.water_logs enable row level security;
alter table public.weight_logs enable row level security;

-- PROFILES: Users can only read & update their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- DAILY GOALS: Users can view, insert, update own daily goals
create policy "Users can view own daily goals"
  on public.daily_goals for select
  using (auth.uid() = user_id);

create policy "Users can insert own daily goals"
  on public.daily_goals for insert
  with check (auth.uid() = user_id);

create policy "Users can update own daily goals"
  on public.daily_goals for update
  using (auth.uid() = user_id);

-- FOOD ITEMS: Public read access for reference nutrition dataset
create policy "Anyone can read food items"
  on public.food_items for select
  using (true);

-- MEALS: Strict owner isolation
create policy "Users can view own meals"
  on public.meals for select
  using (auth.uid() = user_id);

create policy "Users can insert own meals"
  on public.meals for insert
  with check (auth.uid() = user_id);

create policy "Users can update own meals"
  on public.meals for update
  using (auth.uid() = user_id);

create policy "Users can delete own meals"
  on public.meals for delete
  using (auth.uid() = user_id);

-- MEAL ITEMS: Protected through parent meal owner identity
create policy "Users can view items of own meals"
  on public.meal_items for select
  using (
    exists (
      select 1 from public.meals
      where meals.id = meal_items.meal_id
      and meals.user_id = auth.uid()
    )
  );

create policy "Users can insert items into own meals"
  on public.meal_items for insert
  with check (
    exists (
      select 1 from public.meals
      where meals.id = meal_items.meal_id
      and meals.user_id = auth.uid()
    )
  );

create policy "Users can update items in own meals"
  on public.meal_items for update
  using (
    exists (
      select 1 from public.meals
      where meals.id = meal_items.meal_id
      and meals.user_id = auth.uid()
    )
  );

create policy "Users can delete items from own meals"
  on public.meal_items for delete
  using (
    exists (
      select 1 from public.meals
      where meals.id = meal_items.meal_id
      and meals.user_id = auth.uid()
    )
  );

-- RECIPES & INGREDIENTS: Public read access
create policy "Anyone can view recipes"
  on public.recipes for select
  using (true);

create policy "Anyone can view recipe ingredients"
  on public.recipe_ingredients for select
  using (true);

-- WATER LOGS: Owner isolation
create policy "Users can view own water logs"
  on public.water_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert own water logs"
  on public.water_logs for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own water logs"
  on public.water_logs for delete
  using (auth.uid() = user_id);

-- WEIGHT LOGS: Owner isolation
create policy "Users can view own weight logs"
  on public.weight_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert own weight logs"
  on public.weight_logs for insert
  with check (auth.uid() = user_id);

create policy "Users can update own weight logs"
  on public.weight_logs for update
  using (auth.uid() = user_id);

create policy "Users can delete own weight logs"
  on public.weight_logs for delete
  using (auth.uid() = user_id);


-- ==============================================================================
-- DATABASE TRIGGERS FOR PROFILE AUTO-CREATION & UPDATED_AT
-- ==============================================================================

-- Function to handle new user registration
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  
  -- Create initial daily goal for today
  insert into public.daily_goals (user_id, target_date, calorie_target, protein_target_g, carbs_target_g, fat_target_g, water_target_ml)
  values (new.id, current_date, 2000, 75, 250, 65, 2500)
  on conflict (user_id, target_date) do nothing;

  return new;
end;
$$ language plpgsql security definer;

-- Trigger fired after user creation in auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Generic function for updating updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at_column();

create trigger update_meals_updated_at
  before update on public.meals
  for each row execute function public.update_updated_at_column();

create trigger update_daily_goals_updated_at
  before update on public.daily_goals
  for each row execute function public.update_updated_at_column();

