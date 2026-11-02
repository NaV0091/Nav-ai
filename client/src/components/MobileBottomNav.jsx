import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Activity, ClipboardList, Camera, UtensilsCrossed, User } from 'lucide-react';
import { QuickActionModal } from './QuickActionModal.jsx';

export function MobileBottomNav({ onOpenManualEntry }) {
  const [quickActionOpen, setQuickActionOpen] = useState(false);

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-[#dcebe1] pb-safe shadow-[0_-4px_24px_rgba(0,0,0,0.03)]">
        <div className="relative flex items-center justify-between h-16 px-4 max-w-md mx-auto">
          {/* 1. Tracker */}
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-12 py-1 transition-colors ${
                isActive ? 'text-[#006C4D] font-extrabold' : 'text-[#77887E] hover:text-[#101E19]'
              }`
            }
          >
            <Activity className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[10px] mt-1 font-semibold">Tracker</span>
          </NavLink>

          {/* 2. Plans */}
          <NavLink
            to="/plans"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-12 py-1 transition-colors ${
                isActive ? 'text-[#006C4D] font-extrabold' : 'text-[#77887E] hover:text-[#101E19]'
              }`
            }
          >
            <ClipboardList className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[10px] mt-1 font-semibold">Plans</span>
          </NavLink>

          {/* 3. Center Elevated Camera Action Button */}
          <div className="flex items-center justify-center relative -top-4">
            <button
              type="button"
              onClick={() => setQuickActionOpen(true)}
              aria-label="Scan or log meal"
              className="w-14 h-14 rounded-full bg-[#006C4D] text-white shadow-[0_8px_20px_rgba(0,108,77,0.35)] flex items-center justify-center active:scale-95 transition-transform hover:bg-[#005139]"
            >
              <Camera className="w-6 h-6" />
            </button>
          </div>

          {/* 4. Recipes */}
          <NavLink
            to="/recipes"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-12 py-1 transition-colors ${
                isActive ? 'text-[#006C4D] font-extrabold' : 'text-[#77887E] hover:text-[#101E19]'
              }`
            }
          >
            <UtensilsCrossed className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[10px] mt-1 font-semibold">Recipes</span>
          </NavLink>

          {/* 5. Profile */}
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-12 py-1 transition-colors ${
                isActive ? 'text-[#006C4D] font-extrabold' : 'text-[#77887E] hover:text-[#101E19]'
              }`
            }
          >
            <User className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[10px] mt-1 font-semibold">Profile</span>
          </NavLink>
        </div>
      </nav>

      {/* Quick Action Modal */}
      <QuickActionModal
        isOpen={quickActionOpen}
        onClose={() => setQuickActionOpen(false)}
        onOpenManualEntry={onOpenManualEntry}
      />
    </>
  );
}
