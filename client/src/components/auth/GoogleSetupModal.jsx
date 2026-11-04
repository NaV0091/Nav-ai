import React from 'react';
import { ExternalLink, ShieldAlert, ArrowRight, UserCheck, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function GoogleSetupModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { enterGuestMode } = useAuth();

  if (!isOpen) return null;

  const handleGuest = () => {
    enterGuestMode();
    onClose();
    navigate('/dashboard');
  };

  const handleEmailAuth = () => {
    onClose();
    navigate('/login');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#D5E7DD] p-6 sm:p-8 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF2E8] border border-[#FDBA8C] flex items-center justify-center text-[#EA580C] shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-[#101E19]">
              Google Sign-In Setup Required
            </h3>
            <span className="inline-block text-[11px] font-semibold text-[#EA580C] bg-[#FFF2E8] px-2 py-0.5 rounded-full mt-0.5">
              Supabase Provider Not Enabled
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-[#4A5568] leading-relaxed mb-4">
          The Google OAuth provider is not enabled yet in your Supabase project (
          <code className="text-xs bg-gray-100 px-1 py-0.5 rounded font-mono font-bold text-gray-800">
            pfejaswwzihrqdlntkeg
          </code>
          ).
        </p>

        {/* Step-by-Step Instructions */}
        <div className="bg-[#F8FCF9] border border-[#D5E7DD] rounded-2xl p-4 mb-5 text-xs text-[#101E19] space-y-2.5">
          <p className="font-bold text-[#006C4D] uppercase tracking-wider text-[11px]">
            How to enable Google Sign-In:
          </p>
          <ol className="list-decimal list-inside space-y-1.5 text-[#4A5568] font-medium leading-normal">
            <li>
              Open your Supabase dashboard at{' '}
              <a
                href="https://supabase.com/dashboard/project/pfejaswwzihrqdlntkeg/auth/providers"
                target="_blank"
                rel="noreferrer"
                className="text-[#006C4D] font-bold underline inline-flex items-center gap-1 hover:text-[#004E37]"
              >
                Authentication &gt; Providers
                <ExternalLink className="w-3 h-3" />
              </a>
            </li>
            <li>
              Find <strong>Google</strong> in the list and toggle <strong>Enable Google provider</strong> to ON.
            </li>
            <li>
              Paste your Google OAuth <strong>Client ID</strong> and <strong>Client Secret</strong> from Google Cloud Console.
            </li>
            <li>Click <strong>Save</strong>.</li>
          </ol>
        </div>

        {/* Immediate Alternatives */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={handleGuest}
            type="button"
            className="w-full py-3 px-4 rounded-full bg-[#006C4D] hover:bg-[#004E37] text-white font-bold text-sm shadow-md shadow-[#006C4D]/20 transition-all flex items-center justify-center gap-2"
          >
            <UserCheck className="w-4 h-4" />
            <span>Continue as Guest (100% Full Access)</span>
          </button>

          <button
            onClick={handleEmailAuth}
            type="button"
            className="w-full py-3 px-4 rounded-full bg-[#E6F8EE] text-[#006C4D] hover:bg-[#D5E7DD] font-bold text-sm transition-colors flex items-center justify-center gap-2"
          >
            <span>Sign In with Email & Password</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

