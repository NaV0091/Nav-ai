import React, { useState } from 'react';
import { 
  Coffee, 
  Sun, 
  Moon, 
  Apple, 
  Plus, 
  Trash2, 
  Utensils, 
  MoreHorizontal,
  Flame,
  Check
} from 'lucide-react';
import { useNutrition } from '../context/NutritionContext.jsx';
import { isDateToday } from '../utils/dateUtils.js';

const MEAL_CONFIGS = {
  breakfast: {
    label: 'Breakfast',
    icon: Coffee,
    iconColor: 'text-[#006C4D]',
    iconBg: 'bg-[#EAF5EE]',
    barColor: 'bg-[#34C795]',
    targetCal: 300,
  },
  lunch: {
    label: 'Lunch',
    icon: Sun,
    iconColor: 'text-[#225EAA]',
    iconBg: 'bg-[#EBF3FE]',
    barColor: 'bg-[#79ACFD]',
    targetCal: 360,
  },
  dinner: {
    label: 'Evening Snacks & Dinner',
    icon: Moon,
    iconColor: 'text-[#754F8A]',
    iconBg: 'bg-[#F5EDFA]',
    barColor: 'bg-[#CDA1E2]',
    targetCal: 450,
  },
  snack: {
    label: 'Snacks',
    icon: Apple,
    iconColor: 'text-[#EA580C]',
    iconBg: 'bg-[#FFF4ED]',
    barColor: 'bg-[#FDBA8C]',
    targetCal: 150,
  },
};

export function MealSectionCard({ mealType, onAddMeal }) {
  const { meals, deleteMeal, selectedDate } = useNutrition();
  const [activeMenuId, setActiveMenuId] = useState(null);

  const isToday = isDateToday(selectedDate);
  const cfg = MEAL_CONFIGS[mealType] || MEAL_CONFIGS.lunch;
  const IconComponent = cfg.icon;

  const typeMeals = meals.filter((m) => m.mealType === mealType);
  const totalCals = typeMeals.reduce((sum, m) => sum + (m.totalCalories || 0), 0);
  const percentOfTarget = Math.min(100, Math.round((totalCals / cfg.targetCal) * 100));

  return (
    <div className="bg-white rounded-[2rem] p-4 sm:p-5 shadow-[0_4px_24px_rgba(27,42,36,0.04)] border border-[#dcebe1] flex flex-col gap-3 transition-all">
      {/* Section Header with Micro Progress Bar & Quick Action */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-8 h-8 rounded-full ${cfg.iconBg} ${cfg.iconColor} flex items-center justify-center flex-shrink-0 shadow-xs`}>
              <IconComponent className="w-4 h-4" />
            </div>
            <div className="flex items-baseline gap-2 truncate">
              <h3 className="text-sm sm:text-base font-extrabold text-[#101E19]">
                {cfg.label}
              </h3>
              <span className="text-xs text-[#5F6F67] font-semibold">
                {totalCals} / {cfg.targetCal} Cal
              </span>
            </div>
          </div>

          {/* Action Button: only active on Today */}
          {isToday ? (
            <button
              onClick={() => onAddMeal(mealType)}
              className="w-8 h-8 rounded-full bg-[#EAF5EE] text-[#006C4D] hover:bg-[#006C4D] hover:text-white flex items-center justify-center shadow-xs transition-all active:scale-95 flex-shrink-0"
              title={`Add food to ${cfg.label}`}
            >
              <Plus className="w-4 h-4" />
            </button>
          ) : (
            <span className="text-[10px] font-semibold text-[#77887E] px-2 py-0.5 bg-[#f8fafc] rounded-full border border-slate-100 flex-shrink-0">
              Read-only
            </span>
          )}
        </div>

        {/* Micro progress indicator */}
        <div className="w-full bg-[#f1f5f9] rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${cfg.barColor}`}
            style={{ width: `${percentOfTarget}%` }}
          />
        </div>
      </div>

      {/* Items list or empty state */}
      {typeMeals.length === 0 ? (
        <div className="py-2.5 px-3 rounded-2xl bg-[#f8fafc] border border-dashed border-[#e2e8f0] text-center">
          <p className="text-xs text-[#77887E] font-medium">
            {isToday ? `No ${cfg.label.toLowerCase()} logged yet. Tap + to log.` : `No items recorded for this date.`}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {typeMeals.map((meal) => (
            <div
              key={meal.id}
              className="flex items-center justify-between p-2.5 sm:p-3 rounded-2xl bg-[#EAF5EE]/40 hover:bg-[#EAF5EE]/70 border border-[#dcebe1]/60 transition-colors group relative"
            >
              <div className="flex items-center gap-3 min-w-0">
                {meal.imagePath ? (
                  <img
                    src={meal.imagePath}
                    alt={meal.name}
                    className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-white shadow-xs"
                  />
                ) : (
                  <div className={`w-12 h-12 rounded-xl ${cfg.iconBg} ${cfg.iconColor} flex items-center justify-center flex-shrink-0 shadow-xs`}>
                    <Utensils className="w-5 h-5 opacity-70" />
                  </div>
                )}
                <div className="flex flex-col min-w-0">
                  <span className="text-xs sm:text-sm font-extrabold text-[#101E19] truncate">{meal.name}</span>
                  <div className="flex items-center gap-1.5 text-[11px] text-[#5F6F67] mt-0.5">
                    <span className="font-extrabold text-[#006C4D]">{meal.totalCalories} Cal</span>
                    {meal.notes && (
                      <>
                        <span>•</span>
                        <span className="truncate">{meal.notes}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Menu (Only enabled for today) */}
              {isToday ? (
                <div className="relative flex-shrink-0">
                  <button
                    onClick={() => setActiveMenuId(activeMenuId === meal.id ? null : meal.id)}
                    className="w-8 h-8 rounded-full text-[#77887E] hover:text-[#101E19] hover:bg-white flex items-center justify-center transition-all shadow-xs"
                    title="Meal options"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>

                  {/* Popover Menu */}
                  {activeMenuId === meal.id && (
                    <div className="absolute right-0 top-9 z-30 bg-white rounded-2xl shadow-lg border border-[#dcebe1] p-1.5 w-32 flex flex-col gap-1 animate-in fade-in duration-150">
                      <button
                        onClick={() => {
                          deleteMeal(meal.id);
                          setActiveMenuId(null);
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 font-bold hover:bg-red-50 rounded-xl transition-colors w-full text-left"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <span className="w-2 h-2 rounded-full bg-slate-300 mr-2" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
