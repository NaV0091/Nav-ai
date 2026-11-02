import React, { useState } from 'react';
import { Utensils, Flame, Edit2, Heart, Activity } from 'lucide-react';
import { useNutrition } from '../context/NutritionContext.jsx';
import { isDateToday } from '../utils/dateUtils.js';

export function CalorieRing({ onEditGoals }) {
  const { calorieBalance, goals, proteinProgress, carbsProgress, fatProgress, selectedDate } = useNutrition();
  const isToday = isDateToday(selectedDate);
  const [activeSlide, setActiveSlide] = useState(0); // 0: Macros, 1: Heart Health

  const { consumed, target, remaining, isOverTarget, overAmount } = calorieBalance;

  // Circumference of circle with r=50 is 2 * PI * 50 = 314.159
  const circumference = 314.16;
  const progressRatio = Math.min(1, consumed / (target || 1));
  const strokeDashoffset = circumference - (circumference * progressRatio);

  const ringColor = isOverTarget ? '#ea580c' : '#34C795';

  const macros = [
    {
      name: 'Carb',
      percent: Math.min(100, carbsProgress.percent),
      current: carbsProgress.current,
      target: carbsProgress.target,
      color: 'bg-[#60a5fa]',
      textColor: 'text-[#2563eb]',
      trackColor: 'bg-[#dbeafe]',
      bgBadge: 'bg-[#EFF6FF]',
    },
    {
      name: 'Proteins',
      percent: Math.min(100, proteinProgress.percent),
      current: proteinProgress.current,
      target: proteinProgress.target,
      color: 'bg-[#34d399]',
      textColor: 'text-[#059669]',
      trackColor: 'bg-[#d1fae5]',
      bgBadge: 'bg-[#ECFDF5]',
    },
    {
      name: 'Fat',
      percent: Math.min(100, fatProgress.percent),
      current: fatProgress.current,
      target: fatProgress.target,
      color: 'bg-[#fb923c]',
      textColor: 'text-[#ea580c]',
      trackColor: 'bg-[#ffedd5]',
      bgBadge: 'bg-[#FFF7ED]',
    },
  ];

  return (
    <div className="relative bg-white p-5 sm:p-7 rounded-[2.5rem] shadow-[0_4px_24px_rgba(27,42,36,0.04)] border border-[#dcebe1] overflow-hidden">
      {/* Background organic pastel glow washes (vitality mint aesthetic) */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#d1fae5]/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#fef3c7]/40 rounded-full blur-3xl pointer-events-none" />

      {/* Header Row: Balanced Diet & Day Tag */}
      <div className="flex items-center justify-between relative z-10 mb-2">
        <div className="flex items-center gap-2">
          <h2 className="text-base sm:text-lg font-black text-[#101E19]">
            Balanced Diet : {target} Cal
          </h2>
          {isToday && onEditGoals && (
            <button
              onClick={onEditGoals}
              className="w-7 h-7 rounded-full text-[#77887E] hover:text-[#006C4D] hover:bg-[#EAF5EE] flex items-center justify-center transition-colors"
              title="Edit Calorie Target"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-[#f1f6f2] text-[#5F6F67] border border-[#dcebe1]">
          Day 4
        </span>
      </div>

      {/* Main Gauge Ring Area */}
      <div className="flex items-center justify-between relative z-10 gap-4 py-2">
        {/* Left Stats: Eaten & Target */}
        <div className="flex flex-col gap-4 flex-1 min-w-0">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#5F6F67] flex items-center gap-1.5">
              Eaten <Utensils className="w-3.5 h-3.5 text-[#2563eb]" />
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-3xl sm:text-4xl font-black text-[#101E19]">{consumed}</span>
              <span className="text-xs text-[#77887E] font-semibold">Cal</span>
            </div>
          </div>

          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#5F6F67] flex items-center gap-1.5">
              Burned <Flame className="w-3.5 h-3.5 text-[#ea580c] fill-[#ea580c]" />
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl sm:text-3xl font-black text-[#101E19]">0</span>
              <span className="text-xs text-[#77887E] font-semibold">Cal</span>
            </div>
          </div>
        </div>

        {/* Circular SVG Gauge */}
        <div className="relative w-36 h-36 sm:w-40 sm:h-40 flex items-center justify-center flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90 drop-shadow-sm" viewBox="0 0 120 120">
            {/* Background track */}
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="#E2EFE7"
              strokeWidth="10"
              strokeLinecap="round"
            />
            {/* Active arc */}
            <circle
              className="transition-all duration-700 ease-out"
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke={ringColor}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>

          {/* Centered Readout (Matching reference image) */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-1">
            {isOverTarget ? (
              <>
                <span className="text-2xl sm:text-3xl font-black text-[#ea580c] leading-none">
                  +{overAmount}
                </span>
                <span className="text-xs font-bold text-[#ea580c] mt-1">
                  Cal over
                </span>
              </>
            ) : (
              <>
                <span className="text-3xl sm:text-4xl font-black text-[#101E19] tracking-tight leading-none">
                  {remaining}
                </span>
                <span className="text-xs font-bold text-[#77887E] mt-1">
                  Cal left
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Slide 0: Macronutrients Cards (Inside same hero card, exactly like Screen 1) */}
      {activeSlide === 0 ? (
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5 mt-3 pt-3 border-t border-[#f1f6f2] relative z-10 animate-in fade-in duration-200">
          {macros.map((m) => (
            <div
              key={m.name}
              className={`flex flex-col gap-1 p-2.5 sm:p-3 rounded-2xl ${m.bgBadge} border border-black/5 shadow-xs`}
            >
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-bold text-[#5F6F67]">{m.name}</span>
                <span className={`font-black ${m.textColor}`}>{m.percent}%</span>
              </div>

              <div className={`w-full ${m.trackColor} rounded-full h-1.5 overflow-hidden my-0.5`}>
                <div
                  className={`h-full rounded-full transition-all duration-500 ${m.color}`}
                  style={{ width: `${m.percent}%` }}
                />
              </div>

              <div className="flex items-baseline gap-0.5">
                <span className="text-xs font-black text-[#101E19]">{m.current}</span>
                <span className="text-[10px] font-semibold text-[#77887E]">/ {m.target}g</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Slide 1: Heart Health & Micronutrients (From screenshot inset) */
        <div className="flex flex-col gap-2.5 mt-3 pt-3 border-t border-[#f1f6f2] relative z-10 animate-in fade-in duration-200">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#101E19]">
            <Heart className="w-3.5 h-3.5 text-[#ef4444] fill-[#ef4444]" /> Heart Health &amp; Micronutrients
          </div>
          <div className="flex flex-col gap-2 text-[11px]">
            <div>
              <div className="flex justify-between font-bold text-[#5F6F67]">
                <span>Saturated Fat</span>
                <span className="text-[#101E19] font-black">5.3 / 20g</span>
              </div>
              <div className="w-full bg-[#f1f5f9] rounded-full h-1.5 overflow-hidden mt-0.5">
                <div className="bg-[#60a5fa] h-full rounded-full" style={{ width: '26%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between font-bold text-[#5F6F67]">
                <span>Sodium</span>
                <span className="text-[#101E19] font-black">516.3 / 2300mg</span>
              </div>
              <div className="w-full bg-[#f1f5f9] rounded-full h-1.5 overflow-hidden mt-0.5">
                <div className="bg-[#34d399] h-full rounded-full" style={{ width: '22%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between font-bold text-[#5F6F67]">
                <span>Cholesterol</span>
                <span className="text-[#101E19] font-black">190.8 / 300mg</span>
              </div>
              <div className="w-full bg-[#f1f5f9] rounded-full h-1.5 overflow-hidden mt-0.5">
                <div className="bg-[#fb923c] h-full rounded-full" style={{ width: '63%' }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Carousel Pagination Dots (Matching reference design dots at bottom) */}
      <div className="flex items-center justify-center gap-1.5 pt-3 relative z-10">
        <button
          type="button"
          onClick={() => setActiveSlide(0)}
          className={`h-1.5 rounded-full transition-all ${
            activeSlide === 0 ? 'w-5 bg-[#1B2A24]' : 'w-1.5 bg-[#CBD5E1] hover:bg-[#94A3B8]'
          }`}
          title="Macronutrients"
        />
        <button
          type="button"
          onClick={() => setActiveSlide(1)}
          className={`h-1.5 rounded-full transition-all ${
            activeSlide === 1 ? 'w-5 bg-[#1B2A24]' : 'w-1.5 bg-[#CBD5E1] hover:bg-[#94A3B8]'
          }`}
          title="Micronutrients"
        />
      </div>
    </div>
  );
}
