import React, { useState } from 'react';
import { Droplets, Plus, Undo2, ChevronDown } from 'lucide-react';
import { useNutrition } from '../context/NutritionContext.jsx';
import { isDateToday } from '../utils/dateUtils.js';

export function WaterTrackerCard() {
  const { waterProgress, waterLogs, addWater, deleteWater, selectedDate } = useNutrition();
  const [showOptions, setShowOptions] = useState(false);
  const [customMl, setCustomMl] = useState('');

  const isToday = isDateToday(selectedDate);

  // Convert ml to fl oz for display (1 ml ≈ 0.033814 fl oz)
  const consumedOz = Math.round(waterProgress.consumed * 0.033814);
  const targetOz = Math.round(waterProgress.target * 0.033814);

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    if (!isToday) return;
    addWater(250);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!isToday) return;
    const val = parseInt(customMl, 10);
    if (val > 0) {
      addWater(val);
      setCustomMl('');
      setShowOptions(false);
    }
  };

  const handleUndo = (e) => {
    e.stopPropagation();
    if (!isToday || waterLogs.length === 0) return;
    const last = waterLogs[waterLogs.length - 1];
    deleteWater(last.id);
  };

  return (
    <div className="flex flex-col justify-between p-4 sm:p-5 rounded-[2rem] bg-[#EEF5FE] border border-[#d6e7fc] shadow-[0_4px_20px_rgba(34,94,170,0.04)] transition-all">
      <div className="flex items-center justify-between gap-3">
        {/* Left Icon & Text */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-full bg-[#D8E9FD] text-[#225EAA] flex items-center justify-center flex-shrink-0 shadow-xs">
            <Droplets className="w-5 h-5 fill-[#225EAA]/20" />
          </div>
          <div className="flex flex-col min-w-0">
            <h3 className="text-xs sm:text-sm font-extrabold text-[#101E19] truncate leading-tight">
              Log your water intake
            </h3>
            <p className="text-[11px] sm:text-xs text-[#5F6F67] mt-0.5 truncate">
              You already drank <span className="font-bold text-[#225EAA]">{waterProgress.consumed}</span> / {waterProgress.target} ml ({consumedOz}/{targetOz} fl oz)
            </p>
          </div>
        </div>

        {/* Right Controls */}
        {isToday ? (
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {waterLogs.length > 0 && (
              <button
                type="button"
                onClick={handleUndo}
                className="w-7 h-7 rounded-full bg-white/80 hover:bg-white text-slate-500 hover:text-red-500 flex items-center justify-center shadow-xs transition-colors"
                title="Undo last water log"
              >
                <Undo2 className="w-3 h-3" />
              </button>
            )}

            <button
              type="button"
              onClick={handleQuickAdd}
              className="w-9 h-9 rounded-full bg-white text-[#225EAA] hover:bg-[#225EAA] hover:text-white flex items-center justify-center shadow-xs transition-all active:scale-95"
              title="Quick Add 250ml glass"
            >
              <Plus className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setShowOptions(!showOptions)}
              className="w-6 h-6 rounded-full bg-white/70 hover:bg-white text-[#225EAA] flex items-center justify-center shadow-xs transition-colors"
              title="More portion sizes"
            >
              <ChevronDown className={`w-3 h-3 transition-transform ${showOptions ? 'rotate-180' : ''}`} />
            </button>
          </div>
        ) : (
          <span className="text-[10px] font-semibold text-slate-400 bg-white/60 px-2.5 py-1 rounded-full flex-shrink-0">
            Past Log
          </span>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-white/70 rounded-full h-1.5 overflow-hidden mt-3 shadow-inner">
        <div
          className="bg-[#60A5FA] h-full rounded-full transition-all duration-500"
          style={{ width: `${waterProgress.percent}%` }}
        />
      </div>

      {/* Expandable Quick Presets Drawer */}
      {showOptions && isToday && (
        <div className="mt-3 pt-3 border-t border-[#d6e7fc] flex flex-col gap-2 animate-in fade-in duration-150">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => { addWater(250); setShowOptions(false); }}
              className="flex-1 py-1.5 px-2 rounded-xl bg-white hover:bg-[#225EAA] hover:text-white text-[#225EAA] text-[11px] font-extrabold shadow-xs transition-colors"
            >
              +250ml (Glass)
            </button>
            <button
              type="button"
              onClick={() => { addWater(500); setShowOptions(false); }}
              className="flex-1 py-1.5 px-2 rounded-xl bg-white hover:bg-[#225EAA] hover:text-white text-[#225EAA] text-[11px] font-extrabold shadow-xs transition-colors"
            >
              +500ml (Bottle)
            </button>
          </div>

          <form onSubmit={handleCustomSubmit} className="flex items-center gap-1.5 pt-0.5">
            <input
              type="number"
              min="10"
              max="2000"
              step="10"
              placeholder="Custom ml (e.g. 350)"
              value={customMl}
              onChange={(e) => setCustomMl(e.target.value)}
              className="flex-1 px-3 py-1 text-xs rounded-xl bg-white border border-[#c3daf9] text-[#101E19] focus:outline-none focus:ring-1 focus:ring-[#225EAA]"
            />
            <button
              type="submit"
              className="px-3 py-1 rounded-xl bg-[#225EAA] text-white text-xs font-bold hover:bg-[#1a4a85] transition-colors shadow-xs"
            >
              Add
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
