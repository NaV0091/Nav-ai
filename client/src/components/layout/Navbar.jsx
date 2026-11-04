import React, { useState } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarCheck,
  UtensilsCrossed,
  BookOpen,
  LineChart,
  User,
  Camera,
  Plus,
  Sparkles,
  LogOut,
  UserPlus,
  Flame,
  X,
  PlusCircle,
  FileText,
  Download,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { downloadAppUrlShortcut } from '../../utils/installShortcut';

export default function Navbar() {
  const { user, isGuest, isSupabaseConfigured, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [showMobileActionSheet, setShowMobileActionSheet] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const desktopNavLinks = [
    { to: '/dashboard', label: 'Tracker', icon: LayoutDashboard },
    { to: '/plans', label: 'Plans', icon: CalendarCheck },
    { to: '/recipes', label: 'Recipes', icon: BookOpen },
    { to: '/scanner', label: 'AI Scanner', icon: Camera },
    { to: '/diary', label: 'Food Diary', icon: UtensilsCrossed },
    { to: '/progress', label: 'Progress', icon: LineChart },
  ];

  return (
    <>
      {/* ============================================================== */}
      {/* DESKTOP & TABLET HEADER */}
      {/* ============================================================== */}
      <header className="sticky top-0 w-full z-40 bg-[#E8FBF0]/90 backdrop-blur-xl border-b border-[#CEF6DF]/80 shadow-[0_2px_12px_rgba(0,108,77,0.03)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left: Brand Logo */}
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-[#101418] flex items-center justify-center text-white shadow-md shadow-black/10 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-[#34D399]" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#006C4D]">Nav AI</span>
              <span className="text-base font-black text-[#101E19] leading-tight">Vitality Mint</span>
            </div>
          </Link>

          {/* Center: Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-white/80 backdrop-blur-md p-1.5 rounded-full border border-[#D5E7DD]/90 shadow-xs">
            {desktopNavLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#18181B] text-white shadow-sm'
                      : 'text-[#6C7A72] hover:text-[#101E19] hover:bg-[#E0F2E8]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </NavLink>
              );
            })}
          </nav>

          {/* Right: Actions, Guest Status & Profile */}
          <div className="flex items-center gap-2.5">
            {/* Desktop Scan Meal Button */}
            <Link
              to="/scanner"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#18181B] text-white text-xs font-bold hover:bg-[#27272A] transition-all shadow-md active:scale-95"
            >
              <Camera className="w-3.5 h-3.5 text-[#34D399]" />
              <span>Scan Meal</span>
            </Link>

            {/* Daily Streak Indicator */}
            <div className="hidden sm:flex items-center gap-1.5 bg-white/90 px-3 py-1.5 rounded-full border border-[#D5E7DD] shadow-xs">
              <Flame className="w-4 h-4 text-[#EA580C] fill-[#EA580C]" />
              <span className="text-xs font-black text-[#101E19]">1</span>
            </div>

            {/* Profile Avatar & Menu Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-full bg-white/90 border border-[#D5E7DD] hover:border-[#34C795] transition-all shadow-xs"
                aria-label="User Account Menu"
              >
                <div className="w-7 h-7 rounded-full bg-[#D1FAE5] text-[#006C4D] flex items-center justify-center font-bold text-xs ring-2 ring-white">
                  {user?.email ? user.email.substring(0, 1).toUpperCase() : 'N'}
                </div>
                <span className="hidden sm:inline text-xs font-bold text-[#101E19]">
                  {user ? 'Account' : 'Guest'}
                </span>
              </button>

              {/* Dropdown Menu */}
              {showProfileDropdown && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#D5E7DD] p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  onClick={() => setShowProfileDropdown(false)}
                >
                  <div className="px-3 py-2 border-b border-[#E0F2E8] mb-1">
                    <p className="text-xs font-bold text-[#101E19] truncate">
                      {user?.email || 'Guest Explorer'}
                    </p>
                    <p className="text-[10px] text-[#6C7A72]">
                      {isGuest ? 'Local IndexedDB storage' : 'Cloud synchronized'}
                    </p>
                  </div>

                  <Link
                    to="/profile"
                    className="flex items-center gap-2.5 px-3 py-2 text-xs text-[#101E19] hover:bg-[#E0F2E8] rounded-xl transition-colors font-semibold"
                  >
                    <User className="w-4 h-4 text-[#006C4D]" />
                    Profile & Goals
                  </Link>
                  <Link
                    to="/plans"
                    className="flex items-center gap-2.5 px-3 py-2 text-xs text-[#101E19] hover:bg-[#E0F2E8] rounded-xl transition-colors font-semibold"
                  >
                    <CalendarCheck className="w-4 h-4 text-[#006C4D]" />
                    My Diet Plans
                  </Link>

                  <button
                    onClick={() => {
                      downloadAppUrlShortcut('Nav AI');
                      showToast('Nav AI app shortcut (.url) downloaded to your device!', 'success');
                      setShowProfileDropdown(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#006C4D] hover:bg-[#E0F2E8] rounded-xl transition-colors font-semibold text-left"
                  >
                    <Download className="w-4 h-4 text-[#006C4D]" />
                    Install App (.url)
                  </button>

                  <div className="pt-1 border-t border-[#E0F2E8] mt-1">
                    {user ? (
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#BA1A1A] hover:bg-red-50 rounded-xl transition-colors font-bold"
                      >
                        <LogOut className="w-4 h-4" />
                        Log Out
                      </button>
                    ) : (
                      <Link
                        to="/login"
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#006C4D] hover:bg-[#E0F2E8] rounded-xl transition-colors font-bold"
                      >
                        <UserPlus className="w-4 h-4" />
                        Log In / Register
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* MOBILE BOTTOM NAVIGATION BAR (Matches screenshot exactly) */}
      {/* ============================================================== */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-[#E2E8F0] pb-safe shadow-[0_-6px_20px_rgba(0,0,0,0.06)]"
        aria-label="Mobile Navigation"
      >
        <div className="relative flex items-center justify-around h-16 px-2">
          {/* 1. Tracker (Home) */}
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-14 py-1 text-[11px] font-bold transition-all ${
                isActive ? 'text-[#18181B]' : 'text-[#8E8E93] hover:text-[#18181B]'
              }`
            }
          >
            <LayoutDashboard className="w-5 h-5 mb-0.5" />
            <span>Tracker</span>
          </NavLink>

          {/* 2. Plans */}
          <NavLink
            to="/plans"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-14 py-1 text-[11px] font-bold transition-all ${
                isActive ? 'text-[#18181B]' : 'text-[#8E8E93] hover:text-[#18181B]'
              }`
            }
          >
            <CalendarCheck className="w-5 h-5 mb-0.5" />
            <span>Plans</span>
          </NavLink>

          {/* 3. Center Solid Black Floating Camera Button */}
          <div className="flex items-center justify-center -top-3.5 relative">
            <button
              onClick={() => setShowMobileActionSheet(true)}
              aria-label="Add or Scan Meal"
              className="w-12 h-12 rounded-full bg-[#101418] text-white shadow-xl flex items-center justify-center active:scale-90 transition-transform hover:bg-[#1f2937]"
            >
              <Camera className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* 4. Recipes */}
          <NavLink
            to="/recipes"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-14 py-1 text-[11px] font-bold transition-all ${
                isActive ? 'text-[#18181B]' : 'text-[#8E8E93] hover:text-[#18181B]'
              }`
            }
          >
            <BookOpen className="w-5 h-5 mb-0.5" />
            <span>Recipes</span>
          </NavLink>

          {/* 5. Profile */}
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-14 py-1 text-[11px] font-bold transition-all ${
                isActive ? 'text-[#18181B]' : 'text-[#8E8E93] hover:text-[#18181B]'
              }`
            }
          >
            <User className="w-5 h-5 mb-0.5" />
            <span>Profile</span>
          </NavLink>
        </div>
      </nav>

      {/* ============================================================== */}
      {/* MOBILE ACTION SHEET MODAL */}
      {/* ============================================================== */}
      {showMobileActionSheet && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div
            className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-[#D5E7DD] animate-in slide-in-from-bottom duration-300 flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#E0F2E8]">
              <h3 className="text-base font-extrabold text-[#101E19]">Track Your Nutrition</h3>
              <button
                onClick={() => setShowMobileActionSheet(false)}
                className="w-8 h-8 rounded-full bg-[#E0F2E8] flex items-center justify-center text-[#6C7A72] hover:text-[#101E19]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              <button
                onClick={() => {
                  setShowMobileActionSheet(false);
                  navigate('/scanner');
                }}
                className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#E8FBF0] hover:bg-[#D5F9E4] transition-colors text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#101418] flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
                  <Camera className="w-5 h-5 text-[#34D399]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#101E19]">Scan with AI Camera</h4>
                  <p className="text-xs text-[#6C7A72]">Snap plate for instant portion & calories</p>
                </div>
              </button>

              <button
                onClick={() => {
                  setShowMobileActionSheet(false);
                  navigate('/diary?action=add');
                }}
                className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#EAE4FF] hover:bg-[#DDD4FE] transition-colors text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#7C3AED] flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#101E19]">Log Food Manually</h4>
                  <p className="text-xs text-[#6C7A72]">Search USDA & Indian food database</p>
                </div>
              </button>

              <button
                onClick={() => {
                  setShowMobileActionSheet(false);
                  navigate('/recipes');
                }}
                className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#FFE8D6] hover:bg-[#FED7AA] transition-colors text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#EA580C] flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#101E19]">Browse Diet Recipes</h4>
                  <p className="text-xs text-[#6C7A72]">Log curated dietitian meals with 1-click</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
