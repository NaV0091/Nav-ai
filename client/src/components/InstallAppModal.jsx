import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { downloadAppUrlShortcut } from '../utils/installShortcut';
import { Sparkles, Download, X, Laptop, Smartphone, CheckCircle2 } from 'lucide-react';

export default function InstallAppModal() {
  const { user, isGuest } = useAuth();
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Only show for active users (guest or logged-in)
    if (!user && !isGuest) return;

    // Check if explicitly triggered by login/guest action or first session startup
    const explicitlyTriggered = sessionStorage.getItem('navai_prompt_install') === 'true';
    const alreadyDismissedThisSession = sessionStorage.getItem('navai_install_dismissed') === 'true';
    const alreadyInstalled = localStorage.getItem('navai_app_installed') === 'true';

    if (explicitlyTriggered || (!alreadyDismissedThisSession && !alreadyInstalled)) {
      // Small timeout so page loads smoothly first
      const timer = setTimeout(() => {
        setIsOpen(true);
        sessionStorage.removeItem('navai_prompt_install');
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [user, isGuest]);

  const handleInstall = () => {
    try {
      downloadAppUrlShortcut('Nav AI');
      showToast('Nav AI shortcut (.url) downloaded to your device!', 'success');
      sessionStorage.setItem('navai_install_dismissed', 'true');
      setIsOpen(false);
    } catch (err) {
      showToast('Failed to download app shortcut.', 'error');
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem('navai_install_dismissed', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={handleDismiss}
    >
      <div
        className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-[#D5E7DD] flex flex-col relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#F8FCF9] border border-[#D5E7DD] flex items-center justify-center text-[#6C7A72] hover:text-[#101E19] hover:bg-[#E0F2E8] transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Icon & Heading */}
        <div className="flex flex-col items-center text-center mt-2">
          <div className="relative mb-4">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#006C4D] via-[#00875A] to-[#34C795] flex items-center justify-center text-white shadow-xl shadow-[#006C4D]/25 ring-4 ring-[#E0F2E8]">
              <Sparkles className="w-8 h-8" />
            </div>
            <span className="absolute -bottom-1 -right-1 bg-[#101E19] text-white text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-white shadow-xs">
              .URL
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-[#101E19]">
            Install Nav AI App
          </h2>
          <p className="text-xs sm:text-sm text-[#6C7A72] font-medium mt-1 max-w-xs">
            Add Nav AI to your computer or phone for instant 1-click access to meal tracking and nutrition coaching.
          </p>
        </div>

        {/* Highlights */}
        <div className="bg-[#F8FCF9] border border-[#E0F2E8] rounded-2xl p-4 my-5 flex flex-col gap-2.5">
          <div className="flex items-center gap-2.5 text-xs text-[#101E19]">
            <CheckCircle2 className="w-4 h-4 text-[#006C4D] shrink-0" />
            <span><strong>Instant 1-Click Launch</strong> right from your Desktop</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-[#101E19]">
            <CheckCircle2 className="w-4 h-4 text-[#006C4D] shrink-0" />
            <span><strong>Quick AI Meal Vision</strong> scanner & nutrition coach</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-[#101E19]">
            <CheckCircle2 className="w-4 h-4 text-[#006C4D] shrink-0" />
            <span><strong>Fast & Lightweight</strong> Internet Shortcut (.url format)</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={handleInstall}
            className="w-full py-3.5 px-5 rounded-full bg-[#006C4D] hover:bg-[#004E37] text-white font-extrabold text-sm shadow-md shadow-[#006C4D]/20 transition-all flex items-center justify-center gap-2 active:scale-98"
          >
            <Download className="w-4 h-4" />
            <span>Install App (.url)</span>
          </button>

          <button
            onClick={handleDismiss}
            className="w-full py-2.5 px-4 rounded-full text-xs font-bold text-[#6C7A72] hover:text-[#101E19] hover:bg-[#F8FCF9] transition-colors"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}
