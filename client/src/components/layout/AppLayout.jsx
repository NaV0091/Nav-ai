import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Navbar from './Navbar';
import InstallAppModal from '../InstallAppModal';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, UserPlus } from 'lucide-react';

export default function AppLayout() {
  const { isGuest } = useAuth();

  return (
    <div className="min-h-screen bg-[#F8FCF9] text-[#101E19] flex flex-col font-sans selection:bg-[#34C795]/20 selection:text-[#006C4D]">
      {/* Install App Popup Modal */}
      <InstallAppModal />

      {/* Guest Mode Notification Bar */}
      {isGuest && (
        <div className="bg-gradient-to-r from-[#FFF7E8] via-[#FFF2EB] to-[#FFF7E8] border-b border-[#FDBA8C]/40 px-4 py-2 text-xs text-[#101E19] flex items-center justify-between z-30">
          <div className="flex items-center gap-2 max-w-2xl mx-auto w-full justify-between">
            <div className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#EA580C] shrink-0" />
              <span>
                <strong>Guest Mode:</strong> Your meals and water are stored locally in IndexedDB.
              </span>
            </div>
            <Link
              to="/register"
              className="inline-flex items-center gap-1 font-bold text-[#006C4D] hover:underline shrink-0"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Account</span>
            </Link>
          </div>
        </div>
      )}

      {/* Main Responsive Header and Bottom Navigation */}
      <Navbar />

      {/* Page Content Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-28 md:pb-12">
        <Outlet />
      </main>
    </div>
  );
}

