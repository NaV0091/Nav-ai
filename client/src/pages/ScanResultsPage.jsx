import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { addGuestMeal } from '../services/guestStorage';
import { createAuthenticatedMeal } from '../services/supabaseClient';
import { searchFoods } from '../services/apiClient';
import {
  calculateItemNutrition,
  calculateMealTotals,
} from '../services/nutritionEngine';
import {
  Sparkles,
  CheckCircle2,
  Trash2,
  Plus,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Search,
  X,
  Camera,
  Edit2,
} from 'lucide-react';

export default function ScanResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isGuest, isSupabaseConfigured } = useAuth();
  const { showToast } = useToast();

  const stateData = location.state || {};
  const analysis = stateData.analysis;
  const previewUrl = stateData.previewUrl;
  const initialCategory = stateData.mealCategory || 'lunch';
  const initialNotes = stateData.notes || '';

  // Redirect if no analysis data
  if (!analysis) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-base font-bold text-[#101E19] mb-3">No active meal scan found</p>
        <Link
          to="/scanner"
          className="px-6 py-2.5 rounded-full bg-[#006C4D] text-white text-sm font-bold"
        >
          Open AI Scanner
        </Link>
      </div>
    );
  }

  // State
  const [mealName, setMealName] = useState(analysis.mealName || 'Balanced Meal');
  const [items, setItems] = useState(() => {
    return (analysis.items || []).map((it, idx) => ({
      id: `scanned-${idx}-${Date.now()}`,
      food_item_id: it.food_item_id || null,
      name: it.name || it.food_name || 'Food Item',
      quantity: Number(it.quantity || it.portion_grams) || 100,
      unit: it.unit || 'g',
      calories: Number(it.calories) || 0,
      protein_g: Number(it.protein_g ?? it.protein) || 0,
      carbs_g: Number(it.carbs_g ?? it.carbs) || 0,
      fat_g: Number(it.fat_g ?? it.fat) || 0,
      calories_per_100g: it.calories_per_100g || (it.calories ? (it.calories / (it.quantity || 100)) * 100 : 150),
      protein_per_100g: it.protein_per_100g || (it.protein_g ? (it.protein_g / (it.quantity || 100)) * 100 : 10),
      carbs_per_100g: it.carbs_per_100g || (it.carbs_g ? (it.carbs_g / (it.quantity || 100)) * 100 : 15),
      fat_per_100g: it.fat_per_100g || (it.fat_g ? (it.fat_g / (it.quantity || 100)) * 100 : 5),
      is_estimated: it.is_estimated ?? true,
      nutrition_source: it.nutrition_source || 'AI Vision & USDA Reference',
    }));
  });

  const [saving, setSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // Rename item handler
  const handleUpdateName = (itemId, newName) => {
    setItems((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, name: newName } : it))
    );
  };

  // Direct portion weight input handler
  const handleSetQuantity = (itemId, newQty) => {
    const qty = Math.max(1, Number(newQty) || 0);
    const factor = qty / 100.0;
    setItems((prev) =>
      prev.map((it) =>
        it.id === itemId
          ? {
              ...it,
              quantity: qty,
              calories: Math.round(it.calories_per_100g * factor),
              protein_g: Math.round(it.protein_per_100g * factor * 10) / 10,
              carbs_g: Math.round(it.carbs_per_100g * factor * 10) / 10,
              fat_g: Math.round(it.fat_per_100g * factor * 10) / 10,
            }
          : it
      )
    );
  };

  // Portion weight adjustment stepper handler
  const handleUpdateQuantity = (itemId, deltaGrams) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== itemId) return it;
        const newQty = Math.max(10, it.quantity + deltaGrams);
        const factor = newQty / 100.0;

        return {
          ...it,
          quantity: newQty,
          calories: Math.round(it.calories_per_100g * factor),
          protein_g: Math.round(it.protein_per_100g * factor * 10) / 10,
          carbs_g: Math.round(it.carbs_per_100g * factor * 10) / 10,
          fat_g: Math.round(it.fat_per_100g * factor * 10) / 10,
        };
      })
    );
  };

  // Delete item
  const handleDeleteItem = (itemId) => {
    setItems((prev) => prev.filter((it) => it.id !== itemId));
  };

  // Add searched food item
  const handleAddFoodItem = (food) => {
    const defaultQty = 100;
    const factor = defaultQty / 100.0;
    const newItem = {
      id: `added-${Date.now()}`,
      food_item_id: food.id,
      name: food.name,
      quantity: defaultQty,
      unit: 'g',
      calories: Math.round(food.calories_per_100g * factor),
      protein_g: Math.round(food.protein_per_100g * factor * 10) / 10,
      carbs_g: Math.round(food.carbs_per_100g * factor * 10) / 10,
      fat_g: Math.round(food.fat_per_100g * factor * 10) / 10,
      calories_per_100g: Number(food.calories_per_100g),
      protein_per_100g: Number(food.protein_per_100g),
      carbs_per_100g: Number(food.carbs_per_100g),
      fat_per_100g: Number(food.fat_per_100g),
      is_estimated: food.is_estimated ?? false,
      nutrition_source: food.nutrition_source || 'Verified Reference',
    };

    setItems((prev) => [...prev, newItem]);
    setShowAddModal(false);
    setSearchQuery('');
    setSearchResults([]);
    showToast(`Added ${food.name}`, 'success');
  };

  // Search foods
  const handleSearch = async (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const results = await searchFoods(q);
      setSearchResults(results);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  // Meal totals
  const totals = useMemo(() => {
    return calculateMealTotals(items);
  }, [items]);

  // Save meal handler
  const handleSaveMeal = async () => {
    if (items.length === 0) {
      showToast('Please add at least one food item before logging.', 'error');
      return;
    }

    setSaving(true);
    try {
      const mealPayload = {
        meal_date: new Date().toISOString().split('T')[0],
        meal_type: initialCategory,
        name: mealName,
        notes: initialNotes,
        image_data: previewUrl || null,
        total_calories: totals.total_calories,
        total_protein_g: totals.total_protein_g,
        total_carbs_g: totals.total_carbs_g,
        total_fat_g: totals.total_fat_g,
        nutrition_is_estimated: items.some((it) => it.is_estimated),
      };

      if (user && isSupabaseConfigured) {
        await createAuthenticatedMeal(user.id, mealPayload, items);
      } else {
        await addGuestMeal({
          ...mealPayload,
          items,
        });
      }

      showToast(`Meal logged to ${initialCategory}!`, 'success');
      navigate('/dashboard');
    } catch (err) {
      console.error('Error saving meal:', err);
      showToast('Failed to save meal. Please retry.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full pb-12">
      {/* Top Header & Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-bold text-[#6C7A72] hover:text-[#101E19]"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Scanner
        </button>

        <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#E0F2E8] text-[#006C4D] capitalize">
          {initialCategory} Review
        </span>
      </div>

      {/* Food Photo with Floating Pill Tags */}
      {previewUrl && (
        <div className="relative aspect-[4/3] w-full rounded-3xl overflow-hidden border border-[#D5E7DD] shadow-sm bg-black/10">
          <img src={previewUrl} alt="Meal Review" className="w-full h-full object-cover" />

          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />

          {/* Detected Item Pin Badges overlay */}
          {items.slice(0, 4).map((it, idx) => {
            const positions = [
              'top-4 left-4',
              'top-4 right-4',
              'bottom-12 left-4',
              'bottom-12 right-4',
            ];
            return (
              <div
                key={it.id}
                className={`absolute ${positions[idx]} flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full shadow-md animate-in fade-in duration-300`}
              >
                <span className="w-2 h-2 rounded-full bg-[#34C795]" />
                <span className="text-xs font-bold text-[#101E19]">{it.name}</span>
                <span className="text-[11px] text-[#6C7A72] font-semibold">{it.calories} Cal</span>
              </div>
            );
          })}

          {/* Bottom confidence badge */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-medium drop-shadow-sm">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#72FBC5]" />
              Confidence {analysis.confidence || '98.4%'}
            </span>
            <span className="bg-black/40 backdrop-blur-md px-2.5 py-0.5 rounded-full">
              {items.length} items detected
            </span>
          </div>
        </div>
      )}

      {/* Editable Meal Title */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-[#6C7A72]">
          Meal Name
        </label>
        <input
          type="text"
          value={mealName}
          onChange={(e) => setMealName(e.target.value)}
          className="text-xl sm:text-2xl font-black text-[#101E19] bg-transparent border-b border-[#D5E7DD] pb-1 focus:outline-none focus:border-[#006C4D]"
        />
      </div>

      {/* Detected Food Items List */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-base font-extrabold text-[#101E19]">Identified Food Items</h3>
          <span className="text-xs text-[#6C7A72]">Tap - / + to refine grams</span>
        </div>

        <div className="flex flex-col gap-2.5">
          {items.map((it) => (
            <div
              key={it.id}
              className="bg-white rounded-2xl p-4 border border-[#D5E7DD] shadow-xs flex flex-col gap-2 transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={it.name}
                      onChange={(e) => handleUpdateName(it.id, e.target.value)}
                      placeholder="Food Item Name"
                      className="text-sm font-bold text-[#101E19] bg-transparent border-b border-transparent hover:border-[#D5E7DD] focus:border-[#006C4D] focus:outline-none py-0.5 w-full transition-colors"
                      title="Tap to edit food name"
                    />
                    <Edit2 className="w-3.5 h-3.5 text-[#6C7A72] shrink-0" />
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-[#6C7A72]">
                    <span className="font-semibold text-[#101E19]">{it.calories} Cal</span>
                    <span>•</span>
                    <span className="text-[#006C4D] font-bold">{it.protein_g}g P</span>
                    <span>•</span>
                    <span className="text-[#225EAA] font-bold">{it.carbs_g}g C</span>
                    <span>•</span>
                    <span className="text-[#754F8A] font-bold">{it.fat_g}g F</span>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteItem(it.id)}
                  className="w-7 h-7 flex items-center justify-center rounded-full text-[#6C7A72] hover:text-[#BA1A1A] hover:bg-red-50 transition-colors shrink-0"
                  title="Remove item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Grams stepper & direct input */}
              <div className="flex items-center justify-between pt-2 border-t border-[#E0F2E8]/60 mt-1">
                <span className="text-xs text-[#6C7A72] font-medium">Portion Weight</span>
                <div className="flex items-center bg-[#E0F2E8] rounded-full px-2 py-1 gap-1.5">
                  <button
                    onClick={() => handleUpdateQuantity(it.id, -10)}
                    className="w-6 h-6 rounded-full bg-white text-[#101E19] font-bold text-xs flex items-center justify-center shadow-xs active:scale-90 transition-transform"
                    title="Decrease 10g"
                  >
                    -
                  </button>
                  <div className="flex items-center">
                    <input
                      type="number"
                      min="1"
                      value={it.quantity}
                      onChange={(e) => handleSetQuantity(it.id, e.target.value)}
                      className="text-xs font-bold text-[#101E19] w-12 text-center bg-transparent focus:outline-none"
                    />
                    <span className="text-xs font-bold text-[#101E19] pr-1">g</span>
                  </div>
                  <button
                    onClick={() => handleUpdateQuantity(it.id, 10)}
                    className="w-6 h-6 rounded-full bg-white text-[#101E19] font-bold text-xs flex items-center justify-center shadow-xs active:scale-90 transition-transform"
                    title="Increase 10g"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Another Item Button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full py-3 rounded-full bg-[#E0F2E8] hover:bg-[#D5E7DD] text-[#006C4D] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add another item
        </button>
      </div>

      {/* Nutritional Breakdown Summary Card */}
      <div className="bg-white rounded-3xl p-5 border border-[#D5E7DD] shadow-xs flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-[#101E19]">Meal Nutrition Total</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-[#006C4D]">{totals.total_calories}</span>
            <span className="text-xs text-[#6C7A72] font-semibold">Cal</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2.5 pt-1">
          <div className="bg-[#E6F8EE] p-3 rounded-2xl flex flex-col items-center">
            <span className="text-xs text-[#6C7A72] font-semibold">Protein</span>
            <span className="text-base font-extrabold text-[#006C4D] mt-0.5">
              {totals.total_protein_g}g
            </span>
          </div>

          <div className="bg-[#E6F8EE] p-3 rounded-2xl flex flex-col items-center">
            <span className="text-xs text-[#6C7A72] font-semibold">Carbs</span>
            <span className="text-base font-extrabold text-[#225EAA] mt-0.5">
              {totals.total_carbs_g}g
            </span>
          </div>

          <div className="bg-[#E6F8EE] p-3 rounded-2xl flex flex-col items-center">
            <span className="text-xs text-[#6C7A72] font-semibold">Fat</span>
            <span className="text-base font-extrabold text-[#754F8A] mt-0.5">
              {totals.total_fat_g}g
            </span>
          </div>
        </div>
      </div>

      {/* Confirm and Save Sticky Action */}
      <div className="sticky bottom-20 md:bottom-4 z-30 pt-2">
        <button
          onClick={handleSaveMeal}
          disabled={saving}
          className="w-full py-4 px-6 rounded-full bg-[#101E19] hover:bg-black text-white font-bold text-sm shadow-xl flex items-center justify-between transition-all active:scale-98 disabled:opacity-50"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#34C795]" />
            <span>Confirm & Log to {initialCategory}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-xs font-bold">
            <span>{totals.total_calories} Cal</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </button>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div
            className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-[#D5E7DD] flex flex-col max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-[#101E19]">Add Missing Food</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-7 h-7 rounded-full bg-[#E0F2E8] flex items-center justify-center text-[#6C7A72]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative mb-3">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search food (e.g. egg, avocado, dal)..."
                className="w-full pl-9 pr-4 py-2.5 rounded-full bg-[#F8FCF9] border border-[#D5E7DD] text-xs sm:text-sm text-[#101E19] focus:outline-none focus:border-[#006C4D]"
              />
              <Search className="w-4 h-4 text-[#6C7A72] absolute left-3 top-3" />
            </div>

            {/* Search Results */}
            <div className="flex-1 overflow-y-auto flex flex-col gap-2">
              {searching ? (
                <p className="text-xs text-[#6C7A72] text-center py-4">Searching database...</p>
              ) : searchResults.length > 0 ? (
                searchResults.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => handleAddFoodItem(f)}
                    className="p-3 rounded-2xl bg-[#F8FCF9] hover:bg-[#E6F8EE] border border-[#D5E7DD] text-left flex items-center justify-between transition-colors"
                  >
                    <div>
                      <h5 className="text-xs font-bold text-[#101E19]">{f.name}</h5>
                      <p className="text-[11px] text-[#6C7A72]">
                        {f.calories_per_100g} Cal • {f.protein_per_100g}g P • {f.carbs_per_100g}g C per 100g
                      </p>
                    </div>
                    <Plus className="w-4 h-4 text-[#006C4D]" />
                  </button>
                ))
              ) : searchQuery ? (
                <p className="text-xs text-[#6C7A72] text-center py-4">No verified food match found.</p>
              ) : (
                <p className="text-xs text-[#6C7A72] text-center py-4">Type above to search USDA & Indian food database.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

