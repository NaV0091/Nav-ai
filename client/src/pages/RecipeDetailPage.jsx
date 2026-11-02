import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getRecipeById } from '../services/apiClient';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { addGuestMeal } from '../services/guestStorage';
import { createAuthenticatedMeal } from '../services/supabaseClient';
import { adjustRecipeServing } from '../services/nutritionEngine';
import { curatedRecipes } from '../data/curatedData';
import {
  ArrowLeft,
  Clock,
  Users,
  Flame,
  Plus,
  CheckCircle2,
  UtensilsCrossed,
  ChefHat,
  Bookmark,
  Share2,
} from 'lucide-react';

export default function RecipeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isGuest, isSupabaseConfigured } = useAuth();
  const { showToast } = useToast();

  const [recipe, setRecipe] = useState(null);
  const [servings, setServings] = useState(2);
  const [loading, setLoading] = useState(true);
  const [logging, setLogging] = useState(false);

  // Fallback initial seeded recipes
  const sampleRecipes = {
    '00000000-0000-0000-0000-000000000001': {
      id: '00000000-0000-0000-0000-000000000001',
      title: 'High-Protein Paneer Bhurji with Mint',
      description: 'Scrambled fresh paneer spiced with cumin, turmeric, green chillies, diced red onions, and fresh garden mint. High-protein, satisfying vegetarian classic.',
      image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
      preparation_time_minutes: 15,
      servings: 2,
      dietary_tags: ['Vegetarian', 'High-Protein', 'Gluten-Free', 'Under 20m'],
      calories_per_serving: 310,
      protein_per_serving_g: 22,
      carbs_per_serving_g: 8,
      fat_per_serving_g: 21,
      ingredients: [
        { ingredient_name: 'Fresh Paneer', quantity: 200, unit: 'g', notes: 'Crumbled finely' },
        { ingredient_name: 'Red Onion', quantity: 80, unit: 'g', notes: 'Finely chopped' },
        { ingredient_name: 'Tomatoes', quantity: 80, unit: 'g', notes: 'Diced' },
        { ingredient_name: 'Olive Oil or Ghee', quantity: 10, unit: 'g', notes: 'For tempering' },
        { ingredient_name: 'Fresh Mint & Cilantro', quantity: 15, unit: 'g', notes: 'Chopped' },
      ],
      instructions: [
        'Heat 1 tsp olive oil or ghee in a pan over medium heat, add cumin seeds and sauté until fragrant.',
        'Add finely chopped onions, ginger, and green chillies. Sauté until light golden brown.',
        'Add diced tomatoes, turmeric, garam masala, and salt. Cook until soft.',
        'Crumble fresh paneer into the skillet and toss gently for 3-4 minutes.',
        'Garnish with freshly chopped cilantro and mint leaves. Serve hot with warm chapati or multigrain toast.',
      ],
    },
    '00000000-0000-0000-0000-000000000006': {
      id: '00000000-0000-0000-0000-000000000006',
      title: 'Rosemary Lemon Herb Grilled Chicken Bowl',
      description: 'Tender herb-marinated grilled chicken breast over fluffy cooked quinoa, roasted asparagus, and ruby cherry tomatoes with avocado slices.',
      image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      preparation_time_minutes: 20,
      servings: 1,
      dietary_tags: ['High-Protein', 'Gluten-Free', 'Dinner'],
      calories_per_serving: 465,
      protein_per_serving_g: 48,
      carbs_per_serving_g: 24,
      fat_per_serving_g: 19,
      ingredients: [
        { ingredient_name: 'Grilled Chicken Breast', quantity: 160, unit: 'g', notes: 'Skinless breast' },
        { ingredient_name: 'Cooked Quinoa', quantity: 100, unit: 'g', notes: 'Fluffy' },
        { ingredient_name: 'Hass Avocado', quantity: 50, unit: 'g', notes: 'Sliced' },
        { ingredient_name: 'Cherry Tomatoes', quantity: 60, unit: 'g', notes: 'Fresh' },
        { ingredient_name: 'Mixed Salad Greens', quantity: 50, unit: 'g', notes: 'Baby greens' },
      ],
      instructions: [
        'Season chicken breast with minced garlic, fresh rosemary, lemon zest, olive oil, salt, and black pepper.',
        'Grill over medium-high heat for 6-7 minutes per side until internal temperature reaches 165°F (74°C). Let rest 5 minutes, then slice.',
        'Warm pre-cooked quinoa and place at the base of the bowl.',
        'Arrange sliced grilled chicken, halved cherry tomatoes, steamed vegetables, and sliced avocado.',
        'Drizzle with lemon vinaigrette and enjoy warm.',
      ],
    },
  };

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getRecipeById(id);
        const match = data || curatedRecipes.find((r) => r.id === id) || curatedRecipes[0];
        setRecipe(match);
        setServings(match.servings || 2);
      } catch (err) {
        const fallback = curatedRecipes.find((r) => r.id === id) || curatedRecipes[0];
        setRecipe(fallback);
        setServings(fallback.servings || 2);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading || !recipe) {
    return (
      <div className="flex items-center justify-center py-20 text-xs text-[#6C7A72]">
        Loading recipe details...
      </div>
    );
  }

  // Adjusted recipe with dynamic scaling
  const scaled = adjustRecipeServing(recipe, servings);

  // Log 1 serving of this recipe directly to diary
  const handleLogToDiary = async () => {
    setLogging(true);
    try {
      const mealData = {
        meal_date: new Date().toISOString().split('T')[0],
        meal_type: 'lunch',
        name: recipe.title,
        notes: `Prepared recipe: 1 serving`,
        image_data: recipe.image_url,
        total_calories: Number(recipe.calories_per_serving),
        total_protein_g: Number(recipe.protein_per_serving_g),
        total_carbs_g: Number(recipe.carbs_per_serving_g),
        total_fat_g: Number(recipe.fat_per_serving_g),
        nutrition_is_estimated: false,
      };

      const items = (recipe.ingredients || []).map((ing) => ({
        name: ing.ingredient_name,
        quantity: Math.round(Number(ing.quantity) / (recipe.servings || 1)),
        unit: ing.unit || 'g',
        calories: Math.round(recipe.calories_per_serving / (recipe.ingredients.length || 1)),
        protein_g: Math.round((recipe.protein_per_serving_g / (recipe.ingredients.length || 1)) * 10) / 10,
        carbs_g: Math.round((recipe.carbs_per_serving_g / (recipe.ingredients.length || 1)) * 10) / 10,
        fat_g: Math.round((recipe.fat_per_serving_g / (recipe.ingredients.length || 1)) * 10) / 10,
        nutrition_source: 'Seeded Recipe Ingredient',
        is_estimated: false,
      }));

      if (user && isSupabaseConfigured) {
        await createAuthenticatedMeal(user.id, mealData, items);
      } else {
        await addGuestMeal({
          ...mealData,
          items,
        });
      }

      showToast(`Logged 1 serving of ${recipe.title}!`, 'success');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      showToast('Failed to log recipe', 'error');
    } finally {
      setLogging(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full pb-16">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-bold text-[#6C7A72] hover:text-[#101E19]"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Recipes
        </button>

        <button
          onClick={() => {
            navigator.clipboard?.writeText(window.location.href);
            showToast('Recipe link copied to clipboard!', 'info');
          }}
          className="w-9 h-9 rounded-full bg-white border border-[#D5E7DD] flex items-center justify-center text-[#6C7A72] hover:text-[#101E19]"
          title="Share Recipe"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Hero Photograph */}
      <div className="relative aspect-[16/9] w-full rounded-3xl overflow-hidden border border-[#D5E7DD] shadow-sm">
        <img
          src={recipe.image_url}
          alt={recipe.title}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src =
              'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';
          }}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />

        <div className="absolute bottom-5 left-5 right-5 text-white flex flex-col gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            {(recipe.dietary_tags || []).map((t, idx) => (
              <span
                key={idx}
                className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold"
              >
                {t}
              </span>
            ))}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">{recipe.title}</h1>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-4 gap-2 bg-white rounded-3xl p-4 border border-[#D5E7DD] shadow-xs text-center">
        <div>
          <span className="text-[11px] text-[#6C7A72] font-semibold flex items-center justify-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#006C4D]" /> Prep Time
          </span>
          <p className="text-sm sm:text-base font-extrabold text-[#101E19] mt-0.5">
            {recipe.preparation_time_minutes} min
          </p>
        </div>

        <div>
          <span className="text-[11px] text-[#6C7A72] font-semibold flex items-center justify-center gap-1">
            <Flame className="w-3.5 h-3.5 text-[#EA580C]" /> Calories
          </span>
          <p className="text-sm sm:text-base font-extrabold text-[#101E19] mt-0.5">
            {recipe.calories_per_serving} Cal
          </p>
        </div>

        <div>
          <span className="text-[11px] text-[#6C7A72] font-semibold">Protein</span>
          <p className="text-sm sm:text-base font-extrabold text-[#006C4D] mt-0.5">
            {recipe.protein_per_serving_g}g
          </p>
        </div>

        <div>
          <span className="text-[11px] text-[#6C7A72] font-semibold">Carbs</span>
          <p className="text-sm sm:text-base font-extrabold text-[#225EAA] mt-0.5">
            {recipe.carbs_per_serving_g}g
          </p>
        </div>
      </div>

      {/* Recipe Description */}
      <p className="text-sm text-[#6C7A72] leading-relaxed px-1">
        {recipe.description}
      </p>

      {/* Dynamic Serving Size Stepper */}
      <div className="bg-[#E6F8EE] rounded-3xl p-5 border border-[#72FBC5]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-[#101E19]">Serving Size Adjuster</h3>
          <p className="text-xs text-[#6C7A72]">
            Scales ingredients and total batch nutrients in real-time
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto bg-white px-3 py-1.5 rounded-full border border-[#D5E7DD] shadow-xs">
          <button
            onClick={() => setServings((s) => Math.max(1, s - 1))}
            className="w-7 h-7 rounded-full bg-[#E0F2E8] text-[#101E19] font-bold text-xs flex items-center justify-center active:scale-90 transition-transform"
          >
            -
          </button>
          <span className="text-xs font-bold text-[#101E19] min-w-[70px] text-center">
            {servings} {servings === 1 ? 'Serving' : 'Servings'}
          </span>
          <button
            onClick={() => setServings((s) => s + 1)}
            className="w-7 h-7 rounded-full bg-[#E0F2E8] text-[#101E19] font-bold text-xs flex items-center justify-center active:scale-90 transition-transform"
          >
            +
          </button>
        </div>
      </div>

      {/* Scaled Ingredients Checklist */}
      <div className="bg-white rounded-3xl p-6 border border-[#D5E7DD] shadow-xs flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-[#101E19]">Ingredients</h3>
          <span className="text-xs font-bold text-[#006C4D]">
            Total Batch: {scaled.total_recipe_calories} Cal
          </span>
        </div>

        <div className="divide-y divide-[#E0F2E8]">
          {(scaled.adjusted_ingredients || []).map((ing, idx) => (
            <div key={idx} className="py-2.5 flex items-center justify-between text-xs sm:text-sm">
              <span className="text-[#101E19] font-medium">{ing.ingredient_name}</span>
              <span className="font-extrabold text-[#006C4D]">
                {ing.quantity} {ing.unit}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Step-by-Step Cooking Instructions */}
      <div className="bg-white rounded-3xl p-6 border border-[#D5E7DD] shadow-xs flex flex-col gap-4">
        <h3 className="text-base font-extrabold text-[#101E19] flex items-center gap-2">
          <ChefHat className="w-5 h-5 text-[#006C4D]" /> Instructions
        </h3>

        <div className="flex flex-col gap-3.5">
          {(recipe.instructions || []).map((step, idx) => (
            <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm leading-relaxed">
              <span className="w-6 h-6 rounded-full bg-[#E6F8EE] text-[#006C4D] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <p className="text-[#101E19] flex-1">{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Log to Diary Sticky CTA */}
      <div className="sticky bottom-20 md:bottom-4 z-30 pt-2">
        <button
          onClick={handleLogToDiary}
          disabled={logging}
          className="w-full py-4 px-6 rounded-full bg-[#006C4D] hover:bg-[#004E37] text-white font-bold text-sm shadow-xl shadow-[#006C4D]/25 flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-50"
        >
          <UtensilsCrossed className="w-4 h-4 text-[#72FBC5]" />
          <span>{logging ? 'Logging...' : `Log 1 Serving (${recipe.calories_per_serving} Cal) to Diary`}</span>
        </button>
      </div>
    </div>
  );
}

