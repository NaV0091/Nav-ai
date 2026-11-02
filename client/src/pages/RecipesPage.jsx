import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getRecipes } from '../services/apiClient';
import {
  Search,
  Sparkles,
  Clock,
  Flame,
  Bookmark,
  Heart,
  ChevronRight,
  SlidersHorizontal,
  ArrowLeft,
  Star,
  Plus,
} from 'lucide-react';
import { curatedRecipes } from '../data/curatedData';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { addGuestMeal, getTodayDateString } from '../services/guestStorage';
import { createAuthenticatedMeal } from '../services/supabaseClient';

export default function RecipesPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user, isSupabaseConfigured } = useAuth();

  const [recipes, setRecipes] = useState(curatedRecipes);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All'); // 'All' option available and active by default to show all recipes
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('navai_fav_recipes') || '[]');
    } catch {
      return [];
    }
  });
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getRecipes();
        if (data && data.length > 0) {
          setRecipes(data);
        }
      } catch (err) {
        // Fall back to curatedRecipes
      }
    }
    load();
  }, []);

  const toggleFavorite = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = favorites.includes(id)
      ? favorites.filter((f) => f !== id)
      : [...favorites, id];
    setFavorites(updated);
    localStorage.setItem('navai_fav_recipes', JSON.stringify(updated));
    showToast(favorites.includes(id) ? 'Removed from favorites' : 'Saved to favorites ❤️', 'info');
  };

  // Quick 1-click log to today's diary
  const handleQuickLog = async (recipe, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const mealRecord = {
        name: recipe.title,
        meal_type: recipe.category ? recipe.category.toLowerCase() : 'lunch',
        date: getTodayDateString(),
        total_calories: recipe.calories_per_serving,
        total_protein_g: recipe.protein_per_serving_g,
        total_carbs_g: recipe.carbs_per_serving_g,
        total_fat_g: recipe.fat_per_serving_g,
        image_data: recipe.image_url,
        notes: `Logged from ${recipe.title}`,
        items: [
          {
            food_name: recipe.title,
            portion_grams: 150,
            calories: recipe.calories_per_serving,
            protein_g: recipe.protein_per_serving_g,
            carbs_g: recipe.carbs_per_serving_g,
            fat_g: recipe.fat_per_serving_g,
          },
        ],
      };

      if (user && isSupabaseConfigured) {
        await createAuthenticatedMeal(user.id, mealRecord);
      } else {
        await addGuestMeal(mealRecord);
      }

      showToast(`Added "${recipe.title}" to today's diary!`, 'success');
    } catch (err) {
      showToast('Failed to log recipe', 'error');
    }
  };

  const categories = [
    { key: 'All', label: 'All' },
    { key: 'Dinner', label: 'Dinner' },
    { key: 'Breakfast', label: 'Breakfast' },
    { key: 'Lunch', label: 'Lunch' },
    { key: 'Snacks', label: 'Snacks' },
    { key: 'Cooking', label: 'Cooking' },
    { key: 'Quick & Easy', label: 'Quick & Easy' },
    { key: 'High-Protein', label: 'High-Protein' },
    { key: 'Gluten-Free', label: 'Gluten-Free' },
    { key: 'Preference', label: 'Preference' },
  ];

  // Filtering
  const filteredRecipes = recipes.filter((r) => {
    if (showOnlyFavorites && !favorites.includes(r.id)) return false;

    if (activeCategory && activeCategory !== 'All' && activeCategory !== 'Preference') {
      const tags = (r.dietary_tags || []).map((t) => t.toLowerCase());
      const cat = (r.category || '').toLowerCase();
      const target = activeCategory.toLowerCase();
      if (!tags.includes(target) && cat !== target) {
        return false;
      }
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = r.title.toLowerCase().includes(q);
      const matchDesc = (r.description || '').toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }

    return true;
  });

  // Category subsets for curated sections
  const breakfastRecipes = recipes.filter(
    (r) =>
      r.category?.toLowerCase() === 'breakfast' ||
      r.dietary_tags?.some((t) => t.toLowerCase() === 'breakfast')
  );

  return (
    <div className="flex flex-col gap-5 max-w-5xl mx-auto w-full pb-16">
      {/* ============================================================== */}
      {/* 1. MINT VIBRANT HEADER & SEARCH BAR (Screens 6 & 8) */}
      {/* ============================================================== */}
      <div className="-mx-4 -mt-4 sm:-mx-6 sm:-mt-6 lg:-mx-8 p-4 sm:p-6 lg:p-8 pt-3 pb-6 rounded-b-[2.5rem] bg-gradient-to-b from-[#A5F3C8] via-[#CEF6DF] via-40% to-[#F8FAF8] border-b border-[#CEF6DF]/60 shadow-[0_4px_24px_rgba(0,108,77,0.04)]">
        {/* Top Navigation Row */}
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md shadow-xs border border-white flex items-center justify-center text-[#18181B] hover:bg-white transition-all active:scale-95"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <h1 className="text-xl sm:text-2xl font-black text-[#18181B] tracking-tight">Recipes</h1>

          <button
            onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
            className={`w-10 h-10 rounded-full backdrop-blur-md shadow-xs border flex items-center justify-center transition-all active:scale-95 ${
              showOnlyFavorites
                ? 'bg-[#18181B] text-yellow-400 border-[#18181B]'
                : 'bg-white/90 text-[#18181B] border-white hover:bg-white'
            }`}
            title="Saved Recipes"
          >
            <Star className={`w-5 h-5 ${showOnlyFavorites ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Search Input Bar with Filter Slider Button */}
        <div className="max-w-5xl mx-auto mt-4">
          <div className="relative flex items-center bg-white rounded-2xl px-4 py-3 shadow-sm border border-white">
            <Search className="w-4 h-4 text-[#8E8E93] mr-2.5 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for recipes"
              className="w-full bg-transparent text-sm font-semibold text-[#18181B] placeholder:text-[#8E8E93] focus:outline-none"
            />
            <button
              onClick={() => setActiveCategory(activeCategory === 'Dinner' ? 'Preference' : 'Dinner')}
              className="w-8 h-8 rounded-xl bg-[#F4F4F5] hover:bg-[#E4E4E7] flex items-center justify-center text-[#18181B] transition-colors shrink-0 ml-2"
              title="Toggle Filter"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category Filter Pills (Screen 6 & 8) */}
        <div className="max-w-5xl mx-auto flex items-center gap-2 mt-4 overflow-x-auto no-scrollbar py-1">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-4 py-2 rounded-full text-xs font-black whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#18181B] text-white shadow-md transform -translate-y-0.5'
                    : 'bg-white/90 backdrop-blur-xs text-[#6C7A72] border border-white hover:bg-white hover:text-[#18181B]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. FEATURED BANNER: GLUTEN-FREE WEEKLY SELECTED (Screen 8) */}
      {/* ============================================================== */}
      {!search && (activeCategory === 'All' || activeCategory === 'Dinner') && !showOnlyFavorites && (
        <div className="relative w-full rounded-3xl overflow-hidden shadow-md group border border-[#E2EFE7] bg-amber-950">
          <div className="relative h-44 sm:h-52 w-full overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80"
              alt="Gluten-Free Banner"
              className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex flex-col justify-end p-5">
              <span className="text-[11px] font-black uppercase tracking-widest text-[#FCD34D]">
                Weekly Selected
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                Gluten-Free & Losing Weight
              </h2>
              <p className="text-xs text-white/80 line-clamp-2 mt-1 font-medium max-w-xl">
                This gluten-free diet includes fresh vegetables, lean proteins, berries, and ancient
                wholesome grains like millet and quinoa.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. BREAKFAST SHOWCASE ROW (Screen 8 from screenshot) */}
      {/* ============================================================== */}
      {!search && (activeCategory === 'All' || activeCategory === 'Dinner') && !showOnlyFavorites && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-base font-black text-[#18181B]">Breakfast</h3>
            <button
              onClick={() => setActiveCategory('Breakfast')}
              className="text-xs font-bold text-[#006C4D] hover:underline flex items-center gap-0.5"
            >
              More <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {breakfastRecipes.slice(0, 3).map((item) => (
              <Link
                key={item.id}
                to={`/recipes/${item.id}`}
                className="bg-white rounded-3xl p-3 border border-[#E2EFE7] shadow-xs flex flex-col gap-2 group hover:border-[#34D399] transition-all"
              >
                <div className="relative rounded-2xl overflow-hidden aspect-square bg-gray-100">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <button
                    onClick={(e) => toggleFavorite(item.id, e)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-[#6C7A72] hover:text-[#EA580C] shadow-xs"
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        favorites.includes(item.id) ? 'fill-[#EA580C] text-[#EA580C]' : ''
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#FFF2EB] text-[#EA580C] text-[10px] font-bold">
                    <Flame className="w-2.5 h-2.5 fill-current" /> {item.calories_per_serving} Cal
                  </span>
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#E8FBF0] text-[#006C4D] text-[10px] font-bold">
                    ⏱ {item.preparation_time_minutes} min
                  </span>
                </div>

                <h4 className="text-xs font-extrabold text-[#18181B] line-clamp-1 group-hover:text-[#006C4D] transition-colors">
                  {item.title}
                </h4>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. RECIPE LIST CARDS (Screen 6 from screenshot) */}
      {/* ============================================================== */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-base font-black text-[#18181B]">
            {activeCategory} Recipes ({filteredRecipes.length})
          </h3>
          <span className="text-xs font-semibold text-[#8E8E93]">Tap to view & scale</span>
        </div>

        <div className="flex flex-col gap-2.5">
          {filteredRecipes.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-[#D5E7DD] p-6">
              <Sparkles className="w-8 h-8 text-[#34D399] mx-auto mb-2" />
              <h4 className="text-sm font-bold text-[#18181B]">No matching recipes found</h4>
              <p className="text-xs text-[#6C7A72] mt-1">Try another category or clear your search.</p>
              <button
                onClick={() => {
                  setSearch('');
                  setActiveCategory('Dinner');
                  setShowOnlyFavorites(false);
                }}
                className="mt-3 px-4 py-2 bg-[#18181B] text-white text-xs font-bold rounded-xl"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredRecipes.map((r) => (
              <Link
                key={r.id}
                to={`/recipes/${r.id}`}
                className="flex items-center justify-between p-3.5 rounded-3xl bg-white border border-[#E2EFE7] hover:border-[#34D399] shadow-xs group transition-all"
              >
                {/* Left: Thumbnail & Details */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden bg-gray-100 shrink-0">
                    <img
                      src={r.image_url}
                      alt={r.title}
                      onError={(e) => {
                        e.currentTarget.src =
                          'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>

                  <div className="flex flex-col min-w-0">
                    <h4 className="text-sm font-extrabold text-[#18181B] group-hover:text-[#006C4D] transition-colors truncate">
                      {r.title}
                    </h4>

                    {/* Calories & Preparation Time */}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#EA580C]">
                        <Flame className="w-3.5 h-3.5 fill-current" /> {r.calories_per_serving} Cal
                      </span>
                      <span className="text-[#D1D5DB]">•</span>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#6C7A72]">
                        <Clock className="w-3.5 h-3.5" /> {r.preparation_time_minutes} min
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Quick Action & Arrow */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => handleQuickLog(r, e)}
                    className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#E8FBF0] hover:bg-[#006C4D] text-[#006C4D] hover:text-white text-xs font-bold transition-all shadow-xs"
                    title="Quick log to diary"
                  >
                    <Plus className="w-3.5 h-3.5" /> Track
                  </button>

                  <div className="w-8 h-8 rounded-full bg-[#F4F4F5] group-hover:bg-[#18181B] group-hover:text-white text-[#8E8E93] flex items-center justify-center transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
