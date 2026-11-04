import React, { useState, useEffect } from 'react';
import { X, Search, Sparkles, Check, Plus } from 'lucide-react';
import { apiClient } from '../services/apiClient.js';
import { calculateItemNutrients } from '../services/nutritionEngine.js';
import { useNutrition } from '../context/NutritionContext.jsx';

export function ManualMealModal({ isOpen, onClose, initialMealType = 'breakfast' }) {
  const { addMeal, selectedDate } = useNutrition();

  const [mealType, setMealType] = useState(initialMealType);
  const [mealName, setMealName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [quantity, setQuantity] = useState(150);
  const [unit, setUnit] = useState('g');
  const [notes, setNotes] = useState('');

  // Custom manual macro overrides if not selecting from database
  const [customCalories, setCustomCalories] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFat, setCustomFat] = useState('');

  useEffect(() => {
    if (initialMealType) setMealType(initialMealType);
  }, [initialMealType]);

  // Search reference food database
  useEffect(() => {
    let active = true;
    async function fetchFoods() {
      try {
        const res = await apiClient.searchFoods(searchQuery);
        if (active && res) {
          setSearchResults(Array.isArray(res) ? res : res.foods || []);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchFoods();
    return () => { active = false; };
  }, [searchQuery]);

  if (!isOpen) return null;

  // Compute live nutritional preview
  let previewNutrients = { calories: 0, protein: 0, carbs: 0, fat: 0 };
  if (selectedFood) {
    previewNutrients = calculateItemNutrients({ quantity, unit }, selectedFood);
  } else if (customCalories) {
    previewNutrients = {
      calories: parseInt(customCalories, 10) || 0,
      protein: parseFloat(customProtein) || 0,
      carbs: parseFloat(customCarbs) || 0,
      fat: parseFloat(customFat) || 0,
    };
  }

  const handleSelectFood = (food) => {
    setSelectedFood(food);
    setMealName(food.name);
    setCustomCalories('');
    setCustomProtein('');
    setCustomCarbs('');
    setCustomFat('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalName = mealName.trim() || selectedFood?.name || 'Quick Meal';

    const item = selectedFood
      ? {
          name: selectedFood.name,
          quantity: parseFloat(quantity) || 100,
          unit,
          calories: previewNutrients.calories,
          protein: previewNutrients.protein,
          carbs: previewNutrients.carbs,
          fat: previewNutrients.fat,
          nutritionSource: selectedFood.nutritionSource || 'USDA Reference',
          isEstimated: false,
        }
      : {
          name: finalName,
          quantity: parseFloat(quantity) || 100,
          unit,
          calories: parseInt(customCalories, 10) || 150,
          protein: parseFloat(customProtein) || 5,
          carbs: parseFloat(customCarbs) || 20,
          fat: parseFloat(customFat) || 5,
          nutritionSource: 'Manual Custom Entry',
          isEstimated: true,
        };

    const payload = {
      name: finalName,
      mealType,
      mealDate: selectedDate,
      notes: notes.trim() || null,
      totalCalories: item.calories,
      totalProtein: item.protein,
      totalCarbs: item.carbs,
      totalFat: item.fat,
      nutritionIsEstimated: item.isEstimated,
      items: [item],
    };

    await addMeal(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface rounded-4xl max-w-lg w-full p-6 shadow-soft-lg border border-forest-border/40 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-forest-border/40">
          <h2 className="text-lg font-bold text-forest">Add Food Manually</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-surface-container text-forest-muted hover:text-forest transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-4">
          {/* Meal Type Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-forest-muted">Meal Category</label>
            <div className="grid grid-cols-4 gap-2">
              {['breakfast', 'lunch', 'dinner', 'snack'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setMealType(type)}
                  className={`py-2 px-1 rounded-xl text-xs font-semibold capitalize transition-all ${
                    mealType === type
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-surface-container-low text-forest-muted hover:text-forest'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Search Reference Food */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-forest-muted">Search Foods or Type Custom Name</label>
            <div className="relative">
              <Search className="w-4 h-4 text-forest-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="e.g. Paneer, Chicken, Rice, Poha..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setMealName(e.target.value);
                }}
                className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-surface-container-low/70 border border-forest-border/60 text-sm text-forest placeholder:text-forest-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Quick Suggestions pill list */}
            {searchResults.length > 0 && !selectedFood && (
              <div className="flex flex-wrap gap-1.5 pt-1 max-h-32 overflow-y-auto">
                {searchResults.slice(0, 8).map((food) => (
                  <button
                    key={food.id}
                    type="button"
                    onClick={() => handleSelectFood(food)}
                    className="px-2.5 py-1 rounded-full text-xs bg-surface-container hover:bg-primary-soft hover:text-primary transition-colors text-forest font-medium flex items-center gap-1"
                  >
                    <span>{food.name}</span>
                    <span className="text-[10px] text-forest-muted">({food.caloriesPer100g} Cal/100g)</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedFood && (
            <div className="p-3 rounded-2xl bg-primary-soft/60 border border-primary/20 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-primary flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Matched with Database
                </span>
                <span className="text-sm font-semibold text-forest">{selectedFood.name}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFood(null)}
                className="text-xs text-forest-muted hover:text-red-500 underline"
              >
                Change
              </button>
            </div>
          )}

          {/* Portion input */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-forest-muted">Portion Quantity</label>
              <input
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="px-3 py-2 rounded-xl bg-surface-container-low/70 border border-forest-border/60 text-sm text-forest font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-forest-muted">Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="px-3 py-2 rounded-xl bg-surface-container-low/70 border border-forest-border/60 text-sm text-forest font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="g">grams (g)</option>
                <option value="ml">milliliters (ml)</option>
                <option value="cup">cup</option>
                <option value="tbsp">tablespoon (tbsp)</option>
                <option value="piece">piece</option>
                <option value="serving">serving</option>
              </select>
            </div>
          </div>

          {/* If custom food without DB match, manual macro fields */}
          {!selectedFood && (
            <div className="p-3 rounded-2xl bg-surface-container-low/60 border border-forest-border/40 flex flex-col gap-2">
              <span className="text-xs font-semibold text-forest-muted flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-primary" /> Custom Nutrition Estimate
              </span>
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="text-[10px] text-forest-muted">Calories</label>
                  <input
                    type="number"
                    placeholder="Cal"
                    value={customCalories}
                    onChange={(e) => setCustomCalories(e.target.value)}
                    className="w-full px-2 py-1 text-xs rounded-lg bg-white border border-forest-border/60 font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-forest-muted">Protein (g)</label>
                  <input
                    type="number"
                    placeholder="g"
                    value={customProtein}
                    onChange={(e) => setCustomProtein(e.target.value)}
                    className="w-full px-2 py-1 text-xs rounded-lg bg-white border border-forest-border/60 font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-forest-muted">Carbs (g)</label>
                  <input
                    type="number"
                    placeholder="g"
                    value={customCarbs}
                    onChange={(e) => setCustomCarbs(e.target.value)}
                    className="w-full px-2 py-1 text-xs rounded-lg bg-white border border-forest-border/60 font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-forest-muted">Fat (g)</label>
                  <input
                    type="number"
                    placeholder="g"
                    value={customFat}
                    onChange={(e) => setCustomFat(e.target.value)}
                    className="w-full px-2 py-1 text-xs rounded-lg bg-white border border-forest-border/60 font-semibold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Live Nutrition Summary Box */}
          <div className="p-3.5 rounded-2xl bg-surface-container flex items-center justify-between">
            <span className="text-xs font-bold text-forest">Calculated Intake</span>
            <div className="flex items-center gap-3 text-xs">
              <span className="font-extrabold text-primary">{previewNutrients.calories} Cal</span>
              <span className="text-forest-muted">{previewNutrients.protein}g P</span>
              <span className="text-forest-muted">{previewNutrients.carbs}g C</span>
              <span className="text-forest-muted">{previewNutrients.fat}g F</span>
            </div>
          </div>

          {/* Notes */}
          <input
            type="text"
            placeholder="Optional notes (e.g. olive oil dressing, cooked with ghee)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-surface-container-low/70 border border-forest-border/60 text-xs text-forest placeholder:text-forest-muted focus:outline-none"
          />

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full text-xs font-semibold text-forest-muted hover:text-forest transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-full bg-forest text-white text-xs font-bold hover:bg-forest/90 transition-all flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" /> Save to Diary
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

