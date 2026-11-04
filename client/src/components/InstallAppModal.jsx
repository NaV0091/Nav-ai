import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { triggerAppInstall, isIosDevice } from '../utils/installShortcut';
import { Sparkles, Download, X, Share } from 'lucide-react';

export default function InstallAppModal() {
  const { user, isGuest } = useAuth();
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    if (!user && !isGuest) return;

    setIsIos(isIosDevice());

    const explicitlyTriggered = sessionStorage.getItem('navai_prompt_install') === 'true';
    const alreadyDismissed = sessionStorage.getItem('navai_install_dismissed') === 'true';
    const alreadyInstalled = localStorage.getItem('navai_app_installed') === 'true';

    if (explicitlyTriggered || (!alreadyDismissed && !alreadyInstalled)) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        sessionStorage.removeItem('navai_prompt_install');
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [user, isGuest]);

  const handleInstall = async () => {
    const res = await triggerAppInstall();
    if (res?.type === 'ios_guide') {
      showToast('Tap Share (⬆) in Safari, then select "Add to Home Screen".', 'info');
    } else {
      showToast('Nav AI shortcut added to your device!', 'success');
      sessionStorage.setItem('navai_install_dismissed', 'true');
      setIsOpen(false);
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem('navai_install_dismissed', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={handleDismiss}
    >
      <div
        className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-[#D5E7DD] flex flex-col items-center text-center relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 w-7 h-7 rounded-full bg-[#F8FCF9] border border-[#D5E7DD] flex items-center justify-center text-[#6C7A72] hover:text-[#101E19]"
          aria-label="Close"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#006C4D] to-[#34C795] flex items-center justify-center text-white shadow-lg shadow-[#006C4D]/20 mb-3 mt-1">
          <Sparkles className="w-7 h-7" />
        </div>

        {/* Title & Simple text */}
        <h3 className="text-xl font-extrabold text-[#101E19]">
          Install Nav AI
        </h3>
        
        <p className="text-xs text-[#6C7A72] font-medium mt-1.5 mb-5 px-3">
          Install the app on your device for fast 1-tap access and offline tracking.
        </p>

        {isIos && (
          <div className="w-full mb-4 p-2.5 rounded-xl bg-[#E0F2E8] text-[11px] text-[#006C4D] font-bold flex items-center justify-center gap-1.5">
            <Share className="w-3.5 h-3.5 shrink-0" />
            <span>Tap Share (↑) and tap "Add to Home Screen"</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col w-full gap-2">
          <button
            onClick={handleInstall}
            className="w-full py-3 rounded-full bg-[#006C4D] hover:bg-[#004E37] text-white font-bold text-xs shadow-md shadow-[#006C4D]/20 transition-all flex items-center justify-center gap-1.5 active:scale-98"
          >
            <Download className="w-4 h-4" />
            <span>Install App</span>
          </button>

          <button
            onClick={handleDismiss}
            className="w-full py-2 rounded-full text-xs font-semibold text-[#6C7A72] hover:text-[#101E19]"
          >
            Not Now
          </button>
        </div>
      </div>
    </div>
  );
}
