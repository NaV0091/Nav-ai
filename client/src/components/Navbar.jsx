import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Sparkles, Bell, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export function Navbar({ onOpenManualEntry }) {
  const { user, isGuest } = useAuth();
  const location = useLocation();

  // Dynamic screen title matching the reference images
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('plans')) return 'Plans';
    if (path.includes('recipes')) return 'Recipes';
    if (path.includes('profile')) return 'Profile';
    if (path.includes('scanner') || path.includes('scan-results')) return 'AI Camera Scanner';
    if (path.includes('diary')) return 'Food Diary';
    if (path.includes('progress')) return 'Progress';
    return 'Tracker';
  };

  const navLinks = [
    { to: '/dashboard', label: 'Tracker' },
    { to: '/plans', label: 'Plans' },
    { to: '/scanner', label: 'AI Scanner' },
    { to: '/diary', label: 'Diary' },
    { to: '/recipes', label: 'Recipes' },
    { to: '/progress', label: 'Progress' },
    { to: '/profile', label: 'Profile' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#EAF5EE]/90 backdrop-blur-xl border-b border-[#dcebe1]/80 shadow-[0_1px_8px_rgba(0,0,0,0.03)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Left: Brand / Screen Header */}
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-full bg-[#ecfdf5] border border-[#a7f3d0] flex items-center justify-center text-[#006C4D] shadow-xs group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4 text-[#34C795]" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[#5F6F67] uppercase tracking-wider leading-none">
              NAV AI
            </span>
            <span className="text-base font-extrabold text-[#101E19] leading-tight">
              {getPageTitle()}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-white/80 p-1 rounded-full border border-[#dcebe1] shadow-xs">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#1B2A24] text-white shadow-xs'
                    : 'text-[#5F6F67] hover:text-[#101E19] hover:bg-black/5'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Right: Notifications & Profile Avatar */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Notifications"
            className="w-9 h-9 rounded-full bg-white/80 hover:bg-white text-[#5F6F67] hover:text-[#101E19] flex items-center justify-center shadow-xs border border-[#dcebe1] transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#34C795]" />
          </button>

          <Link
            to="/profile"
            className="w-9 h-9 rounded-full overflow-hidden border-2 border-white shadow-xs block flex-shrink-0"
            title="Profile"
          >
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </Link>
        </div>
      </div>
    </header>
  );
}
