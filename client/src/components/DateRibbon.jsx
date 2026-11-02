import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useNutrition } from '../context/NutritionContext.jsx';
import { getLocalDateString, isDateToday } from '../utils/dateUtils.js';

export function DateRibbon() {
  const { selectedDate, setSelectedDate } = useNutrition();

  const todayStr = getLocalDateString(new Date());

  // Split selectedDate into year, month, day to avoid any timezone offset
  const [year, month, day] = selectedDate.split('-').map(Number);
  const curr = new Date(year, month - 1, day);
  const dayOfWeek = curr.getDay(); // 0 is Sun

  // Compute Sunday of this week
  const sunday = new Date(curr);
  sunday.setDate(curr.getDate() - dayOfWeek);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    const dateStr = getLocalDateString(d);
    const dayNum = d.getDate();
    const dayName = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][i];
    days.push({
      dateStr,
      dayNum,
      dayName,
      isToday: dateStr === todayStr,
      isSelected: dateStr === selectedDate,
    });
  }

  const shiftDays = (delta) => {
    const next = new Date(curr);
    next.setDate(curr.getDate() + delta);
    setSelectedDate(getLocalDateString(next));
  };

  const jumpToToday = () => {
    setSelectedDate(todayStr);
  };

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-[#5f6f67]" />
          <span className="text-xs font-bold text-[#5f6f67] uppercase tracking-wider">
            {curr.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => shiftDays(-7)}
            className="p-1.5 rounded-full hover:bg-white text-[#5f6f67] hover:text-[#101e19] transition-colors"
            title="Previous Week"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={jumpToToday}
            className={`text-xs font-bold px-3 py-1 rounded-full transition-all ${
              selectedDate === todayStr
                ? 'bg-[#1b2a24] text-white shadow-xs'
                : 'bg-white hover:bg-emerald-50 text-[#006c4d] border border-[#d5e7dd]'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => shiftDays(7)}
            className="p-1.5 rounded-full hover:bg-white text-[#5f6f67] hover:text-[#101e19] transition-colors"
            title="Next Week"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 7-Day Pill Ribbon (Direct from reference image) */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5 bg-white/90 backdrop-blur-md p-2 sm:p-2.5 rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#e8ede9]">
        {days.map((item) => {
          if (item.isSelected) {
            return (
              <button
                key={item.dateStr}
                onClick={() => setSelectedDate(item.dateStr)}
                className="flex flex-col items-center justify-center py-2.5 sm:py-3 rounded-full bg-[#1b2a24] text-white shadow-md transform -translate-y-0.5 transition-all"
              >
                <span className="text-sm sm:text-base font-extrabold leading-tight">{item.dayNum}</span>
                <span className="text-[10px] sm:text-xs font-bold tracking-wider text-[#72fbc5] mt-0.5">
                  {item.dayName}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.dateStr}
              onClick={() => setSelectedDate(item.dateStr)}
              className="flex flex-col items-center justify-center py-2 sm:py-2.5 rounded-full text-[#5f6f67] hover:text-[#101e19] hover:bg-[#f1f6f2] transition-colors relative"
            >
              {item.isToday && (
                <span className="absolute top-1 w-1.5 h-1.5 rounded-full bg-[#10b981]" />
              )}
              <span className="text-xs sm:text-sm font-semibold leading-tight">{item.dayNum}</span>
              <span className="text-[10px] font-medium text-[#77887e] mt-0.5">{item.dayName}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
