import React from 'react';
import { useNutrition } from '../context/NutritionContext.jsx';

export function MacroCards() {
  const { proteinProgress, carbsProgress, fatProgress } = useNutrition();

  const macros = [
    {
      name: 'Carb',
      current: carbsProgress.current,
      target: carbsProgress.target,
      percent: Math.min(100, carbsProgress.percent),
      color: 'bg-[#60a5fa]',
      textColor: 'text-[#2563eb]',
      bgColor: 'bg-[#EFF6FF] border-[#dbeafe]',
      trackColor: 'bg-[#dbeafe]',
    },
    {
      name: 'Proteins',
      current: proteinProgress.current,
      target: proteinProgress.target,
      percent: Math.min(100, proteinProgress.percent),
      color: 'bg-[#34d399]',
      textColor: 'text-[#059669]',
      bgColor: 'bg-[#ECFDF5] border-[#a7f3d0]',
      trackColor: 'bg-[#d1fae5]',
    },
    {
      name: 'Fat',
      current: fatProgress.current,
      target: fatProgress.target,
      percent: Math.min(100, fatProgress.percent),
      color: 'bg-[#fb923c]',
      textColor: 'text-[#ea580c]',
      bgColor: 'bg-[#FFF7ED] border-[#fed7aa]',
      trackColor: 'bg-[#ffedd5]',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5">
      {macros.map((m) => (
        <div
          key={m.name}
          className={`flex flex-col gap-1.5 p-3.5 sm:p-4 rounded-[1.75rem] ${m.bgColor} border shadow-xs transition-all`}
        >
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-[#475569]">{m.name}</span>
            <span className={`font-black ${m.textColor}`}>{m.percent}%</span>
          </div>

          <div className={`w-full ${m.trackColor} rounded-full h-2 overflow-hidden my-0.5`}>
            <div
              className={`h-full rounded-full transition-all duration-500 ${m.color}`}
              style={{ width: `${m.percent}%` }}
            />
          </div>

          <div className="flex items-baseline gap-0.5 mt-0.5">
            <span className="text-xs sm:text-sm font-black text-[#101e19]">{m.current}</span>
            <span className="text-[10px] sm:text-xs font-semibold text-[#64748b]">/ {m.target}g</span>
          </div>
        </div>
      ))}
    </div>
  );
}
