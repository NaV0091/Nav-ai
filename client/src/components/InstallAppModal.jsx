import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { triggerAppInstall, isIosDevice, isStandaloneApp } from '../utils/installShortcut';
import { Sparkles, Download, X, Share, CheckCircle2, Monitor } from 'lucide-react';

export default function InstallAppModal() {
  const { user, isGuest } = useAuth();
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [guidance, setGuidance] = useState(null);

  useEffect(() => {
    if (!user && !isGuest) return;
    if (isStandaloneApp()) return;

    const explicitlyTriggered = sessionStorage.getItem('navai_prompt_install') === 'true';
    const alreadyDismissed = sessionStorage.getItem('navai_install_dismissed') === 'true';
    const alreadyInstalled = localStorage.getItem('navai_app_installed') === 'true';

    if (explicitlyTriggered || (!alreadyDismissed && !alreadyInstalled)) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        sessionStorage.removeItem('navai_prompt_install');
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [user, isGuest]);

  const handleInstall = async () => {
    const res = await triggerAppInstall();

    if (res?.outcome === 'accepted') {
      showToast('Nav AI installed successfully!', 'success');
      sessionStorage.setItem('navai_install_dismissed', 'true');
      setIsOpen(false);
      return;
    }

    if (res?.outcome === 'dismissed') {
      sessionStorage.setItem('navai_install_dismissed', 'true');
      setIsOpen(false);
      return;
    }

    if (res?.type === 'ios_guide') {
      setGuidance({
        icon: 'ios',
        text: 'Tap Share (↑) in Safari, then select "Add to Home Screen".'
      });
      return;
    }

    if (res?.type === 'mobile_guide') {
      setGuidance({
        icon: 'mobile',
        text: 'Tap the browser menu (⋮) at top right and select "Install app" or "Add to Home screen".'
      });
      return;
    }

    if (res?.type === 'desktop_guide') {
      setGuidance({
        icon: 'desktop',
        text: 'Click the Install icon (⊞) in your browser address bar (top right) to add to your desktop.'
      });
      return;
    }

    // Default close
    setIsOpen(false);
  };

  const handleDismiss = () => {
    sessionStorage.setItem('navai_install_dismissed', 'true');
    setIsOpen(false);
  };

  if (!isOpen || isStandaloneApp()) return null;

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

        {/* App Icon */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#006C4D] to-[#34C795] flex items-center justify-center text-white shadow-lg shadow-[#006C4D]/20 mb-3 mt-1">
          <Sparkles className="w-7 h-7" />
        </div>

        {/* Title */}
        <h3 className="text-xl font-extrabold text-[#101E19]">
          Install Nav AI
        </h3>
        
        {/* Simple subtitle */}
        <p className="text-xs text-[#6C7A72] font-medium mt-1.5 mb-4 px-2">
          Install the app on your device to track meals and work offline.
        </p>

        {/* Platform Guidance Banner (shown if browser requires manual action) */}
        {guidance && (
          <div className="w-full mb-4 p-3 rounded-2xl bg-[#E0F2E8] border border-[#BCE3CD] text-[12px] text-[#006C4D] font-bold flex items-center gap-2.5 text-left animate-in fade-in">
            {guidance.icon === 'ios' && <Share className="w-4 h-4 shrink-0" />}
            {guidance.icon === 'desktop' && <Monitor className="w-4 h-4 shrink-0" />}
            {guidance.icon === 'mobile' && <Sparkles className="w-4 h-4 shrink-0" />}
            <span className="leading-snug">{guidance.text}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col w-full gap-2 mt-1">
          {!guidance ? (
            <button
              onClick={handleInstall}
              className="w-full py-3 rounded-full bg-[#006C4D] hover:bg-[#004E37] text-white font-bold text-xs shadow-md shadow-[#006C4D]/20 transition-all flex items-center justify-center gap-1.5 active:scale-98"
            >
              <Download className="w-4 h-4" />
              <span>Install App</span>
            </button>
          ) : (
            <button
              onClick={handleDismiss}
              className="w-full py-3 rounded-full bg-[#006C4D] hover:bg-[#004E37] text-white font-bold text-xs shadow-md shadow-[#006C4D]/20 transition-all flex items-center justify-center gap-1.5 active:scale-98"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Got it</span>
            </button>
          )}

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
