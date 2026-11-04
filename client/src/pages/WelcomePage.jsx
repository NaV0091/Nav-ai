import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Camera,
  Activity,
  Salad,
  Flame,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export default function WelcomePage() {
  const { enterGuestMode, loginGoogle, isSupabaseConfigured } = useAuth();
  const navigate = useNavigate();

  const handleContinueAsGuest = () => {
    enterGuestMode();
    sessionStorage.setItem('navai_prompt_install', 'true');
    navigate('/dashboard');
  };

  const handleGoogleLogin = async () => {
    try {
      await loginGoogle();
    } catch (err) {
      alert(err.message || 'Google OAuth is not configured on this Supabase instance.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#ECFEF4] via-[#F8FCF9] to-[#ECFEF4] text-[#101E19] flex flex-col justify-between p-4 sm:p-8">
      {/* Top Bar */}
      <header className="max-w-6xl mx-auto w-full flex items-center justify-between py-2">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#006C4D] to-[#34C795] flex items-center justify-center text-white shadow-md shadow-[#34C795]/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#006C4D]">Nav AI</span>
            <span className="text-base font-extrabold text-[#101E19] leading-tight">Nutrition</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleContinueAsGuest}
            className="text-sm font-semibold text-[#006C4D] hover:bg-[#E0F2E8] px-3.5 py-1.5 rounded-full transition-colors"
          >
            Guest Mode
          </button>
          <Link
            to="/login"
            className="text-sm font-bold bg-[#101E19] text-white hover:bg-black px-4 py-2 rounded-full transition-all shadow-sm"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto w-full py-8 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Vision & Actions */}
        <div className="lg:col-span-7 flex flex-col gap-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E6F8EE] border border-[#72FBC5]/60 text-[#006C4D] text-xs font-bold self-center lg:self-start shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#006C4D]" />
            <span>AI-Powered Food & Fitness Companion</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#101E19] tracking-tight leading-[1.12]">
            Photograph your meals.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#006C4D] to-[#34C795]">
              Master your nutrition.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[#6C7A72] leading-relaxed max-w-xl mx-auto lg:mx-0">
            Snap a photo of your breakfast, lunch, or dinner. Nav AI identifies ingredients, estimates portions, and maps nutrients in seconds.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 justify-center lg:justify-start">
            <button
              onClick={handleContinueAsGuest}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#006C4D] text-white font-bold text-base hover:bg-[#004E37] shadow-xl shadow-[#006C4D]/25 transition-all flex items-center justify-center gap-2 group active:scale-95"
            >
              <span>Continue as Guest</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <Link
              to="/register"
              className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white text-[#101E19] font-bold text-base border border-[#D5E7DD] hover:bg-[#E0F2E8] shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <span>Create Account</span>
            </Link>
          </div>

          {/* Social / OAuth Option */}
          <div className="flex items-center justify-center lg:justify-start gap-4 pt-1">
            <button
              onClick={handleGoogleLogin}
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#6C7A72] hover:text-[#101E19] transition-colors py-1.5 px-3 rounded-full hover:bg-white"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign in with Google</span>
            </button>

            <span className="text-xs text-[#6C7A72] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#006C4D]" />
              No credit card required
            </span>
          </div>
        </div>

        {/* Right Column: Visual Card Preview matching Stitch Design */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-[#D5E7DD] flex flex-col gap-5 overflow-hidden">
            {/* Ambient Pastel Glow */}
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#A8E8BD]/30 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-[#E0B3F6]/30 rounded-full blur-2xl pointer-events-none" />

            {/* Header in Card */}
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#6C7A72]">Today's Balance</span>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-[#E0F2E8] text-[#006C4D] rounded-full">
                Active Goal
              </span>
            </div>

            {/* Circular Calorie Gauge Replica */}
            <div className="flex items-center justify-between gap-4 py-1 relative z-10">
              <div className="flex flex-col gap-3">
                <div>
                  <span className="text-xs text-[#6C7A72] flex items-center gap-1 font-medium">
                    Eaten <Salad className="w-3.5 h-3.5 text-[#225EAA]" />
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-2xl font-bold text-[#101E19]">455</span>
                    <span className="text-xs text-[#6C7A72]">Cal</span>
                  </div>
                </div>

                <div>
                  <span className="text-xs text-[#6C7A72] flex items-center gap-1 font-medium">
                    Burned <Flame className="w-3.5 h-3.5 text-[#EA580C]" />
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-2xl font-bold text-[#101E19]">120</span>
                    <span className="text-xs text-[#6C7A72]">Cal</span>
                  </div>
                </div>
              </div>

              {/* Circular Gauge */}
              <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" fill="none" r="48" stroke="#E2EFE7" strokeWidth="8" />
                  <circle
                    cx="60"
                    cy="60"
                    fill="none"
                    r="48"
                    stroke="#34C795"
                    strokeWidth="8"
                    strokeDasharray="301.59"
                    strokeDashoffset="180"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-black text-[#101E19] leading-none">745</span>
                  <span className="text-[11px] font-semibold text-[#6C7A72] mt-0.5">Cal left</span>
                </div>
              </div>
            </div>

            {/* Macro Bars */}
            <div className="grid grid-cols-3 gap-2 relative z-10">
              <div className="bg-[#E6F8EE] p-2.5 rounded-2xl flex flex-col gap-1">
                <div className="flex justify-between text-[11px] font-semibold">
                  <span className="text-[#6C7A72]">Carb</span>
                  <span className="text-[#225EAA]">25%</span>
                </div>
                <div className="w-full bg-white h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#79ACFD] h-full rounded-full" style={{ width: '25%' }} />
                </div>
                <span className="text-xs font-bold text-[#101E19] mt-0.5">8.4 / 165g</span>
              </div>

              <div className="bg-[#E6F8EE] p-2.5 rounded-2xl flex flex-col gap-1">
                <div className="flex justify-between text-[11px] font-semibold">
                  <span className="text-[#6C7A72]">Protein</span>
                  <span className="text-[#006C4D]">90%</span>
                </div>
                <div className="w-full bg-white h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#34C795] h-full rounded-full" style={{ width: '90%' }} />
                </div>
                <span className="text-xs font-bold text-[#101E19] mt-0.5">58.4 / 65g</span>
              </div>

              <div className="bg-[#E6F8EE] p-2.5 rounded-2xl flex flex-col gap-1">
                <div className="flex justify-between text-[11px] font-semibold">
                  <span className="text-[#6C7A72]">Fat</span>
                  <span className="text-[#754F8A]">60%</span>
                </div>
                <div className="w-full bg-white h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#CDA1E2] h-full rounded-full" style={{ width: '60%' }} />
                </div>
                <span className="text-xs font-bold text-[#101E19] mt-0.5">20.9 / 35g</span>
              </div>
            </div>

            {/* Sample Meal Pill */}
            <div className="bg-[#F8FCF9] rounded-2xl p-3 border border-[#E0F2E8] flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E6F8EE] flex items-center justify-center text-[#006C4D]">
                  <Salad className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#101E19]">Herb Grilled Chicken</p>
                  <p className="text-[11px] text-[#6C7A72]">185 Cal • 31g Protein</p>
                </div>
              </div>
              <span className="text-xs font-bold text-[#006C4D] bg-[#E0F2E8] px-2 py-0.5 rounded-full">
                Logged
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* 3 Pillars Footer */}
      <footer className="max-w-5xl mx-auto w-full grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 border-t border-[#D5E7DD]/80">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/60">
          <div className="w-10 h-10 rounded-full bg-[#E6F8EE] text-[#006C4D] flex items-center justify-center shrink-0">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold">Instant AI Meal Vision</h4>
            <p className="text-xs text-[#6C7A72]">Snap photos & get real portion macros</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/60">
          <div className="w-10 h-10 rounded-full bg-[#D6E3FF] text-[#225EAA] flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold">First-Class Guest Mode</h4>
            <p className="text-xs text-[#6C7A72]">Works offline with IndexedDB</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/60">
          <div className="w-10 h-10 rounded-full bg-[#F5D9FF] text-[#754F8A] flex items-center justify-center shrink-0">
            <Salad className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold">Smart Scalable Recipes</h4>
            <p className="text-xs text-[#6C7A72]">Dynamic ingredients by serving size</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

