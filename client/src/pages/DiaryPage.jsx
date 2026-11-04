import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  getGuestMealsByDate,
  addGuestMeal,
  deleteGuestMeal,
  getTodayDateString,
} from '../services/guestStorage';
import {
  fetchMealsByDate,
  createAuthenticatedMeal,
  deleteAuthenticatedMeal,
} from '../services/supabaseClient';
import { searchFoods } from '../services/apiClient';
import {
  calculateMealTotals,
  calculateItemNutrition,
} from '../services/nutritionEngine';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Utensils,
  Search,
  X,
  Coffee,
  Sun,
  Moon,
  Cookie,
  Camera,
} from 'lucide-react';

export default function DiaryPage() {
  const [searchParams] = useSearchParams();
  const { user, isGuest, isSupabaseConfigured } = useAuth();
  const { showToast } = useToast();

  const [currentDate, setCurrentDate] = useState(() => getTodayDateString());
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Manual Add Modal State
  const [showAddModal, setShowAddModal] = useState(() => searchParams.get('action') === 'add');
  const [addCategory, setAddCategory] = useState(() => searchParams.get('meal_type') || 'lunch');
  const [foodSearchQuery, setFoodSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [customFoodName, setCustomFoodName] = useState('');
  const [portionGrams, setPortionGrams] = useState(100);
  const [customCalories, setCustomCalories] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFat, setCustomFat] = useState('');
  const [searching, setSearching] = useState(false);

  // Load Meals for current date
  const loadMeals = useCallback(async () => {
    try {
      setLoading(true);
      if (user && isSupabaseConfigured) {
        const data = await fetchMealsByDate(user.id, currentDate);
        setMeals(data || []);
      } else {
        const data = await getGuestMealsByDate(currentDate);
        setMeals(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user, isSupabaseConfigured, currentDate]);

  useEffect(() => {
    loadMeals();
  }, [loadMeals]);

  // Date Navigation
  const changeDate = (days) => {
    const parts = currentDate.split('-');
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    d.setDate(d.getDate() + days);
    setCurrentDate(getTodayDateString(d));
  };

  // Search food items
  const handleSearchFoods = async (e) => {
    const q = e.target.value;
    setFoodSearchQuery(q);
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const list = await searchFoods(q);
      setSearchResults(list);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  // Select food from search
  const handleSelectFood = (food) => {
    setSelectedFood(food);
    setFoodSearchQuery(food.name);
    setSearchResults([]);
  };

  // Submit manual food item
  const handleAddManualMeal = async (e) => {
    e.preventDefault();
    let itemPayload;

    if (selectedFood) {
      const calculated = calculateItemNutrition(selectedFood, portionGrams);
      itemPayload = {
        name: selectedFood.name,
        quantity: portionGrams,
        unit: 'g',
        calories: calculated.calories,
        protein_g: calculated.protein_g,
        carbs_g: calculated.carbs_g,
        fat_g: calculated.fat_g,
        nutrition_source: selectedFood.nutrition_source,
        is_estimated: selectedFood.is_estimated ?? false,
      };
    } else if (customFoodName) {
      itemPayload = {
        name: customFoodName,
        quantity: portionGrams,
        unit: 'g',
        calories: Number(customCalories) || 150,
        protein_g: Number(customProtein) || 5,
        carbs_g: Number(customCarbs) || 20,
        fat_g: Number(customFat) || 5,
        nutrition_source: 'User Estimate',
        is_estimated: true,
      };
    } else {
      showToast('Please search or enter a food name', 'error');
      return;
    }

    const mealData = {
      meal_date: currentDate,
      meal_type: addCategory,
      name: itemPayload.name,
      notes: 'Logged manually',
      image_data: null,
      total_calories: itemPayload.calories,
      total_protein_g: itemPayload.protein_g,
      total_carbs_g: itemPayload.carbs_g,
      total_fat_g: itemPayload.fat_g,
      nutrition_is_estimated: itemPayload.is_estimated,
    };

    try {
      if (user && isSupabaseConfigured) {
        await createAuthenticatedMeal(user.id, mealData, [itemPayload]);
      } else {
        await addGuestMeal({
          ...mealData,
          items: [itemPayload],
        });
      }

      showToast(`Added ${itemPayload.name} to ${addCategory}!`, 'success');
      setShowAddModal(false);
      setSelectedFood(null);
      setCustomFoodName('');
      setFoodSearchQuery('');
      setPortionGrams(100);
      loadMeals();
    } catch (err) {
      console.error(err);
      showToast('Failed to add meal', 'error');
    }
  };

  // Delete meal
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this meal entry?')) return;
    try {
      if (user && isSupabaseConfigured) {
        await deleteAuthenticatedMeal(id);
      } else {
        await deleteGuestMeal(id);
      }
      showToast('Meal removed', 'info');
      loadMeals();
    } catch (err) {
      showToast('Failed to delete meal', 'error');
    }
  };

  // Total daily intake from meals
  const dayTotals = React.useMemo(() => {
    return meals.reduce(
      (acc, m) => {
        acc.calories += Number(m.total_calories) || 0;
        acc.protein += Number(m.total_protein_g) || 0;
        acc.carbs += Number(m.total_carbs_g) || 0;
        acc.fat += Number(m.total_fat_g) || 0;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [meals]);

  const categories = [
    { key: 'breakfast', label: 'Breakfast', icon: Coffee, bgClass: 'bg-[#EFF4FF] border-[#DBEAFE]' },
    { key: 'lunch', label: 'Lunch', icon: Sun, bgClass: 'bg-[#F4EFFE] border-[#E9D5FF]' },
    { key: 'dinner', label: 'Dinner', icon: Moon, bgClass: 'bg-[#EBFBF2] border-[#CEF6DF]' },
    { key: 'snack', label: 'Snacks', icon: Cookie, bgClass: 'bg-[#FFF2E8] border-[#FED7AA]' },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full pb-12">
      {/* Date Navigation Bar */}
      <div className="flex items-center justify-between bg-white rounded-3xl p-3 sm:p-4 border border-[#D5E7DD] shadow-xs">
        <button
          onClick={() => changeDate(-1)}
          className="w-9 h-9 rounded-full bg-[#F8FCF9] border border-[#D5E7DD] flex items-center justify-center text-[#101E19] hover:bg-[#E0F2E8] transition-colors"
          aria-label="Previous day"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#006C4D]" />
          <span className="text-sm sm:text-base font-extrabold text-[#101E19]">
            {currentDate === getTodayDateString() ? 'Today, ' : ''}
            {new Date(currentDate + 'T00:00:00').toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>

        <button
          onClick={() => changeDate(1)}
          className="w-9 h-9 rounded-full bg-[#F8FCF9] border border-[#D5E7DD] flex items-center justify-center text-[#101E19] hover:bg-[#E0F2E8] transition-colors"
          aria-label="Next day"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Daily Nutrition Summary Bar */}
      <div className="grid grid-cols-4 gap-2 bg-[#E6F8EE] p-4 rounded-3xl border border-[#72FBC5]/40 text-center">
        <div>
          <span className="text-[11px] font-semibold text-[#6C7A72]">Calories</span>
          <p className="text-base sm:text-lg font-black text-[#101E19] mt-0.5">
            {Math.round(dayTotals.calories)}
          </p>
        </div>
        <div>
          <span className="text-[11px] font-semibold text-[#6C7A72]">Protein</span>
          <p className="text-base sm:text-lg font-black text-[#006C4D] mt-0.5">
            {Math.round(dayTotals.protein * 10) / 10}g
          </p>
        </div>
        <div>
          <span className="text-[11px] font-semibold text-[#6C7A72]">Carbs</span>
          <p className="text-base sm:text-lg font-black text-[#225EAA] mt-0.5">
            {Math.round(dayTotals.carbs * 10) / 10}g
          </p>
        </div>
        <div>
          <span className="text-[11px] font-semibold text-[#6C7A72]">Fat</span>
          <p className="text-base sm:text-lg font-black text-[#754F8A] mt-0.5">
            {Math.round(dayTotals.fat * 10) / 10}g
          </p>
        </div>
      </div>

      {/* Meal Categories Breakdown */}
      <div className="flex flex-col gap-4">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const catMeals = meals.filter(
            (m) => m.meal_type?.toLowerCase() === cat.key.toLowerCase()
          );
          const catCals = catMeals.reduce(
            (sum, m) => sum + (Number(m.total_calories) || 0),
            0
          );

          return (
            <div
              key={cat.key}
              className={`rounded-3xl p-5 border ${cat.bgClass} shadow-xs flex flex-col gap-3`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-[#E6F8EE] flex items-center justify-center text-[#006C4D]">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#101E19]">{cat.label}</h4>
                    <span className="text-xs text-[#6C7A72] font-semibold">{catCals} Cal</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setAddCategory(cat.key);
                    setShowAddModal(true);
                  }}
                  className="px-3 py-1.5 rounded-full bg-[#E0F2E8] hover:bg-[#006C4D] hover:text-white text-[#006C4D] text-xs font-bold transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Log
                </button>
              </div>

              {/* Meals inside Category */}
              <div className="flex flex-col gap-2 pt-1">
                {catMeals.length === 0 ? (
                  <p className="text-xs text-[#6C7A72] py-2 px-1 italic">
                    No items recorded for {cat.label.toLowerCase()}
                  </p>
                ) : (
                  catMeals.map((meal) => (
                    <div
                      key={meal.id}
                      className="flex items-center justify-between p-3 rounded-2xl bg-[#F8FCF9] border border-[#E0F2E8] hover:bg-[#E6F8EE]/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {meal.image_data ? (
                          <img
                            src={meal.image_data}
                            alt={meal.name}
                            className="w-10 h-10 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-[#E6F8EE] flex items-center justify-center text-[#006C4D] font-bold text-xs">
                            {meal.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <h5 className="text-xs sm:text-sm font-bold text-[#101E19]">{meal.name}</h5>
                          <span className="text-[11px] text-[#6C7A72]">
                            {meal.total_calories} Cal • {meal.total_protein_g}g P • {meal.total_carbs_g}g C • {meal.total_fat_g}g F
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDelete(meal.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-full text-[#6C7A72] hover:text-[#BA1A1A] hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Manual Add Food Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div
            className="w-full max-w-lg bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-[#D5E7DD] flex flex-col max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-extrabold text-[#101E19]">
                Log Food to {addCategory.toUpperCase()}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-[#E0F2E8] flex items-center justify-center text-[#6C7A72]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Food Search Bar */}
            <div className="relative mb-2.5">
              <input
                type="text"
                value={foodSearchQuery}
                onChange={handleSearchFoods}
                placeholder="Search food (e.g. rice, paneer, dal, roti, chicken)..."
                autoComplete="off"
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#F8FCF9] border border-[#D5E7DD] text-sm text-[#101E19] focus:outline-none focus:border-[#006C4D]"
              />
              <Search className="w-4 h-4 text-[#6C7A72] absolute left-3.5 top-3.5" />
            </div>

            {/* Selected Food Banner */}
            {selectedFood && (
              <div className="p-3 rounded-2xl bg-[#E6F8EE] border border-[#72FBC5] flex items-center justify-between mb-3 animate-in fade-in duration-150">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#006C4D]" />
                    <span className="text-xs font-bold text-[#101E19]">{selectedFood.name}</span>
                  </div>
                  <p className="text-[11px] text-[#006C4D] font-semibold mt-0.5">
                    For {portionGrams}g: {Math.round(((selectedFood.calories_per_100g || 0) * portionGrams) / 100)} Cal • {Math.round(((selectedFood.protein_per_100g || 0) * portionGrams) / 10) / 10}g P • {Math.round(((selectedFood.carbs_per_100g || 0) * portionGrams) / 10) / 10}g C • {Math.round(((selectedFood.fat_per_100g || 0) * portionGrams) / 10) / 10}g F
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFood(null);
                    setFoodSearchQuery('');
                  }}
                  className="text-xs text-[#BA1A1A] font-bold px-2 py-1 rounded-lg hover:bg-red-50"
                >
                  Change
                </button>
              </div>
            )}

            {/* Quick Staples Chips */}
            {!selectedFood && searchResults.length === 0 && !foodSearchQuery.trim() && (
              <div className="flex flex-col gap-1.5 mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6C7A72]">
                  Quick Pick Indian Staples:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {['Roti', 'White Rice', 'Dal Tadka', 'Paneer', 'Boiled Egg', 'Poha', 'Khichdi', 'Curd'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handleSearchFoods({ target: { value: item } })}
                      className="px-2.5 py-1 rounded-full bg-[#F1F6F3] hover:bg-[#E0F2E8] text-xs font-semibold text-[#101E19] border border-[#D5E7DD] transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Search Results Dropdown List */}
            {!selectedFood && searchResults.length > 0 && (
              <div className="max-h-52 overflow-y-auto mb-3 border border-[#D5E7DD] rounded-2xl p-2 bg-[#F8FCF9] flex flex-col gap-1.5 shadow-inner">
                {searchResults.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => handleSelectFood(f)}
                    className="p-2.5 rounded-xl bg-white hover:bg-[#E6F8EE] text-left flex items-center justify-between border border-[#E0F2E8] transition-colors active:scale-98"
                  >
                    <div className="flex-1 pr-2">
                      <p className="text-xs font-bold text-[#101E19]">{f.name}</p>
                      <p className="text-[11px] text-[#6C7A72] mt-0.5">
                        {f.calories_per_100g} Cal • {f.protein_per_100g}g P • {f.carbs_per_100g}g C per 100g
                      </p>
                    </div>
                    <span className="text-xs font-bold text-[#006C4D] bg-[#E0F2E8] px-2.5 py-1 rounded-full shrink-0">
                      Select
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* No Search Results Notice */}
            {!selectedFood && foodSearchQuery.trim() && searchResults.length === 0 && (
              <div className="p-2.5 rounded-xl bg-[#FFF9F2] border border-[#FDBA8C] text-xs text-[#EA580C] mb-3">
                No standard food found for "{foodSearchQuery}". Enter custom details below.
              </div>
            )}

            {/* Portion Grams & Nutrient Preview */}
            <form onSubmit={handleAddManualMeal} className="flex flex-col gap-3 mt-1">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6C7A72] mb-1.5">
                  Portion Quantity (Grams)
                </label>
                <input
                  type="number"
                  min="1"
                  value={portionGrams}
                  onChange={(e) => setPortionGrams(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#F8FCF9] border border-[#D5E7DD] text-sm font-bold text-[#101E19] focus:outline-none focus:border-[#006C4D]"
                />
              </div>

              {/* If no selected food, allow custom name & estimate inputs */}
              {!selectedFood && (
                <div className="flex flex-col gap-3 pt-2 border-t border-[#D5E7DD]">
                  <span className="text-xs font-bold text-[#6C7A72]">Or Custom Quick Food</span>
                  <input
                    type="text"
                    value={customFoodName}
                    onChange={(e) => setCustomFoodName(e.target.value)}
                    placeholder="Food name (e.g. Homemade Poha)"
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#F8FCF9] border border-[#D5E7DD] text-sm text-[#101E19] focus:outline-none"
                  />

                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <span className="text-[10px] text-[#6C7A72] font-semibold">Calories</span>
                      <input
                        type="number"
                        value={customCalories}
                        onChange={(e) => setCustomCalories(e.target.value)}
                        placeholder="Cal"
                        className="w-full px-2 py-1.5 rounded-xl border border-[#D5E7DD] text-xs"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-[#6C7A72] font-semibold">Protein</span>
                      <input
                        type="number"
                        value={customProtein}
                        onChange={(e) => setCustomProtein(e.target.value)}
                        placeholder="g"
                        className="w-full px-2 py-1.5 rounded-xl border border-[#D5E7DD] text-xs"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-[#6C7A72] font-semibold">Carbs</span>
                      <input
                        type="number"
                        value={customCarbs}
                        onChange={(e) => setCustomCarbs(e.target.value)}
                        placeholder="g"
                        className="w-full px-2 py-1.5 rounded-xl border border-[#D5E7DD] text-xs"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-[#6C7A72] font-semibold">Fat</span>
                      <input
                        type="number"
                        value={customFat}
                        onChange={(e) => setCustomFat(e.target.value)}
                        placeholder="g"
                        className="w-full px-2 py-1.5 rounded-xl border border-[#D5E7DD] text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full mt-2 py-3.5 rounded-full bg-[#006C4D] text-white font-bold text-sm shadow-md hover:bg-[#004E37] transition-all"
              >
                Log to Food Diary
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

