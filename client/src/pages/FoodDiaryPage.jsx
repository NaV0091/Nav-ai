import React, { useState } from 'react';
import { Plus, Calendar, ArrowLeft, ArrowRight, Utensils, RotateCcw } from 'lucide-react';
import { useNutrition } from '../context/NutritionContext.jsx';
import { MealSectionCard } from '../components/MealSectionCard.jsx';
import { ManualMealModal } from '../components/ManualMealModal.jsx';
import { isDateToday, getLocalDateString, formatDisplayDate } from '../utils/dateUtils.js';

export function FoodDiaryPage() {
  const { selectedDate, setSelectedDate, meals, goals, calorieBalance } = useNutrition();
  const [modalOpen, setModalOpen] = useState(false);
  const [activeMealType, setActiveMealType] = useState('breakfast');

  const isToday = isDateToday(selectedDate);
  const todayStr = getLocalDateString(new Date());

  const shiftDate = (days) => {
    const [year, month, day] = selectedDate.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    d.setDate(d.getDate() + days);
    setSelectedDate(getLocalDateString(d));
  };

  const handleOpenAdd = (type) => {
    if (!isToday) return;
    setActiveMealType(type);
    setModalOpen(true);
  };

  const formattedDate = formatDisplayDate(selectedDate);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6">
      {/* Date Header Strip */}
      <div className="flex items-center justify-between bg-white p-4 sm:p-5 rounded-[2rem] shadow-soft border border-[#e8ede9]">
        <button
          onClick={() => shiftDate(-1)}
          className="p-2.5 rounded-full hover:bg-[#f1f6f2] text-[#6c7a72] hover:text-[#101e19] transition-colors"
          title="Previous Day"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <span className="text-xs font-bold text-[#006c4d] uppercase tracking-wider">Food Diary</span>
          <h1 className="text-base sm:text-lg font-black text-[#101e19]">{formattedDate}</h1>
          {!isToday && (
            <button
              onClick={() => setSelectedDate(todayStr)}
              className="text-[11px] font-bold text-[#2563eb] hover:underline mt-0.5 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Jump to Today
            </button>
          )}
        </div>

        <button
          onClick={() => shiftDate(1)}
          className="p-2.5 rounded-full hover:bg-[#f1f6f2] text-[#6c7a72] hover:text-[#101e19] transition-colors"
          title="Next Day"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Historical Lock Notice */}
      {!isToday && (
        <div className="p-3.5 rounded-2xl bg-[#eff6ff] border border-[#bfdbfe] text-xs text-[#1e40af] flex items-center justify-between gap-2 shadow-xs">
          <span>Viewing historical log for {formattedDate} (Read-only).</span>
          <button
            onClick={() => setSelectedDate(todayStr)}
            className="px-3 py-1 rounded-full bg-[#1e40af] text-white font-bold text-xs"
          >
            Today
          </button>
        </div>
      )}

      {/* Daily Progress Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-5 rounded-[2rem] shadow-soft border border-[#e8ede9] text-center">
        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-[#64748b]">Calories</span>
          <span className="text-base sm:text-lg font-black text-[#101e19]">
            {calorieBalance.consumed} <span className="text-xs font-medium text-[#94a3b8]">/ {calorieBalance.target}</span>
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-[#059669]">Protein</span>
          <span className="text-base sm:text-lg font-black text-[#059669]">
            {meals.reduce((sum, m) => sum + (m.totalProtein || 0), 0).toFixed(0)}g
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-[#2563eb]">Carbs</span>
          <span className="text-base sm:text-lg font-black text-[#2563eb]">
            {meals.reduce((sum, m) => sum + (m.totalCarbs || 0), 0).toFixed(0)}g
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-[#ea580c]">Fat</span>
          <span className="text-base sm:text-lg font-black text-[#ea580c]">
            {meals.reduce((sum, m) => sum + (m.totalFat || 0), 0).toFixed(0)}g
          </span>
        </div>
      </div>

      {/* Meal Groups */}
      <div className="flex flex-col gap-4">
        <MealSectionCard mealType="breakfast" onAddMeal={handleOpenAdd} />
        <MealSectionCard mealType="lunch" onAddMeal={handleOpenAdd} />
        <MealSectionCard mealType="dinner" onAddMeal={handleOpenAdd} />
        <MealSectionCard mealType="snack" onAddMeal={handleOpenAdd} />
      </div>

      {/* Manual Entry Modal */}
      <ManualMealModal
        isOpen={modalOpen && isToday}
        onClose={() => setModalOpen(false)}
        initialMealType={activeMealType}
      />
    </div>
  );
}
