import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CalendarCheck,
  ChevronRight,
  Flame,
  Droplets,
  Footprints,
  PenTool,
  Clock,
  User,
  Sparkles,
  CheckCircle,
  Plus,
  ArrowLeft,
  Award,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { curatedPlans, curatedRecipes } from '../data/curatedData';
import { getTodayDateString } from '../services/guestStorage';

export default function PlansPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [selectedPlanId, setSelectedPlanId] = useState(null); // null = overview, or plan ID
  const [activePlan, setActivePlan] = useState(curatedPlans[0]); // Default "Clean Eating Diet"
  const [selectedDate, setSelectedDate] = useState(() => getTodayDateString());

  // Generate 7-day date strip centered around today
  const weekDays = useMemo(() => {
    const list = [];
    const base = new Date();
    for (let i = -3; i <= 3; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const str = getTodayDateString(d);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
      const dayNum = d.getDate();
      list.push({ dateStr: str, dayName, dayNum });
    }
    return list;
  }, []);

  const handleStartPlan = (plan) => {
    setActivePlan(plan);
    setSelectedPlanId(null);
    showToast(`Enrolled in "${plan.title}"!`, 'success');
  };

  // If a specific plan is opened in detail view (matches Screen 4 in screenshot)
  if (selectedPlanId) {
    const plan = curatedPlans.find((p) => p.id === selectedPlanId) || activePlan;
    return (
      <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full pb-16 animate-in fade-in duration-200">
        {/* Top Back Nav */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedPlanId(null)}
            className="w-10 h-10 rounded-full bg-white border border-[#E2EFE7] shadow-xs flex items-center justify-center text-[#18181B] hover:bg-[#E8FBF0] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-extrabold text-[#18181B]">{plan.title}</span>
          <div className="w-10" />
        </div>

        {/* Hero Photo with Nutritionist / Healthy Salad */}
        <div className="relative rounded-3xl overflow-hidden aspect-[16/10] bg-gray-100 shadow-md">
          <img
            src={plan.hero_image}
            alt={plan.title}
            className="w-full h-full object-cover"
          />
          {/* Tag Badges Overlay */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-bold">
                ⏱ {plan.duration}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-bold">
                👤 {plan.level}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-bold">
                ⭐ {plan.effectiveness}
              </span>
            </div>

            {/* Red APPROVED Stamp Seal Badge */}
            <div className="px-3 py-1 bg-[#D9534F] text-white rounded-full text-[10px] font-black tracking-wider uppercase shadow-md transform rotate-2">
              APPROVED
            </div>
          </div>
        </div>

        {/* Plan Header & Subtitle */}
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-black text-[#18181B] tracking-tight">{plan.title}</h1>
          <div className="flex items-center gap-2.5 mt-1">
            <div className="w-8 h-8 rounded-full bg-[#101418] text-white flex items-center justify-center text-xs font-bold ring-2 ring-[#34D399]">
              🌱
            </div>
            <p className="text-xs sm:text-sm text-[#6C7A72] font-semibold">{plan.tagline}</p>
          </div>
        </div>

        {/* Introduction */}
        <div className="flex flex-col gap-2">
          <h2 className="text-base font-black text-[#18181B]">Introduction</h2>
          <p className="text-sm text-[#6C7A72] leading-relaxed font-medium bg-white p-4 rounded-2xl border border-[#E2EFE7] shadow-xs">
            {plan.intro}
          </p>
        </div>

        {/* Meals Previews (Screenshots 4 & 7) */}
        <div className="flex flex-col gap-3.5">
          <h2 className="text-base font-black text-[#18181B]">Meals previews</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {plan.meals_preview?.map((m, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-3 border border-[#E2EFE7] shadow-xs flex flex-col gap-2.5"
              >
                <div className="relative rounded-xl overflow-hidden aspect-[16/10] bg-gray-100">
                  <img src={m.image} alt={m.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FFF2EB] text-[#EA580C] text-[10px] font-bold">
                    <Flame className="w-3 h-3 fill-current" /> {m.calories} Cal
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E8FBF0] text-[#006C4D] text-[10px] font-bold">
                    ⏱ {m.time}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-[#18181B]">{m.meal_type}</h4>
                  <p className="text-[11px] text-[#6C7A72] truncate">{m.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Start Plan Action Button */}
        <button
          onClick={() => handleStartPlan(plan)}
          className="w-full py-3.5 rounded-2xl bg-[#101418] hover:bg-[#27272A] text-white text-sm font-black flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-98"
        >
          <span>Start This Plan</span>
          <ChevronRight className="w-4 h-4 text-[#34D399]" />
        </button>
      </div>
    );
  }

  // Plan Overview / "My Plan" Screen (Screen 3 in screenshot)
  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full pb-16">
      {/* ============================================================== */}
      {/* 1. MINT VIBRANT HEADER & DATE STRIP */}
      {/* ============================================================== */}
      <div className="-mx-4 -mt-4 sm:-mx-6 sm:-mt-6 lg:-mx-8 p-4 sm:p-6 lg:p-8 pt-3 pb-6 rounded-b-[2.5rem] bg-gradient-to-b from-[#A5F3C8] via-[#CEF6DF] via-40% to-[#F8FAF8] border-b border-[#CEF6DF]/60 shadow-[0_4px_24px_rgba(0,108,77,0.04)]">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-black text-[#18181B] tracking-tight">My Plan</h1>
          <button
            onClick={() => setSelectedPlanId(curatedPlans[1].id)}
            className="text-xs font-bold text-[#006C4D] hover:underline flex items-center gap-0.5"
          >
            More plans <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Date Strip */}
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-1.5 sm:gap-2 mt-5 overflow-x-auto no-scrollbar py-1">
          {weekDays.map((item) => {
            const isSelected = item.dateStr === selectedDate;
            return (
              <button
                key={item.dateStr}
                onClick={() => setSelectedDate(item.dateStr)}
                className={`flex flex-col items-center justify-center flex-1 min-w-[46px] h-16 rounded-2xl transition-all ${
                  isSelected
                    ? 'bg-[#18181B] text-white shadow-lg transform -translate-y-0.5'
                    : 'bg-white/80 backdrop-blur-xs text-[#6C7A72] border border-white/60 hover:bg-white hover:text-[#18181B]'
                }`}
              >
                <span className={`text-[13px] font-black ${isSelected ? 'text-white' : 'text-[#18181B]'}`}>
                  {item.dayNum}
                </span>
                <span
                  className={`text-[10px] font-bold tracking-wider uppercase mt-0.5 ${
                    isSelected ? 'text-[#34D399]' : 'text-[#8E8E93]'
                  }`}
                >
                  {item.dayName}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. ACTIVE ENROLLED PLAN CARD */}
      {/* ============================================================== */}
      <div
        onClick={() => setSelectedPlanId(activePlan.id)}
        className="bg-white rounded-3xl p-5 border border-[#E2EFE7] shadow-sm flex flex-col gap-3 cursor-pointer hover:border-[#34D399] transition-all group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#101418] text-white flex items-center justify-center shadow-xs">
              <CalendarCheck className="w-5 h-5 text-[#34D399]" />
            </div>
            <div>
              <h2 className="text-base font-black text-[#18181B] group-hover:text-[#006C4D] transition-colors">
                {activePlan.title}
              </h2>
              <p className="text-xs text-[#6C7A72] font-semibold">
                {activePlan.progress_days}/{activePlan.total_days} days
              </p>
            </div>
          </div>

          <div className="w-8 h-8 rounded-full bg-[#E8FBF0] flex items-center justify-center text-[#006C4D] group-hover:bg-[#006C4D] group-hover:text-white transition-colors">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* Smooth blue/cyan progress bar */}
        <div className="w-full bg-[#E0F2FE] h-2 rounded-full overflow-hidden">
          <div
            className="bg-[#0284C7] h-full rounded-full transition-all duration-700"
            style={{ width: `${(activePlan.progress_days / activePlan.total_days) * 100}%` }}
          />
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. THE 4 COLORFUL PASTEL ACTION CARDS */}
      {/* ============================================================== */}
      <div className="flex flex-col gap-3">
        {/* Violet: Water */}
        <Link
          to="/dashboard"
          className="flex items-center justify-between p-4 rounded-3xl bg-[#EAE5FF] border border-[#DDD4FE] shadow-xs hover:bg-[#E3DCFC] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#7C3AED]/15 flex items-center justify-center text-[#7C3AED] shrink-0">
              <Droplets className="w-6 h-6 fill-current" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#1E1B4B]">Log your water intake</h3>
              <p className="text-xs text-[#5B21B6] font-medium">Log hydration in Litres (L)</p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center text-[#7C3AED]">
            <ChevronRight className="w-4 h-4" />
          </div>
        </Link>

        {/* Cyan: Torch those Cals */}
        <Link
          to="/progress"
          className="flex items-center justify-between p-4 rounded-3xl bg-[#D8F2FF] border border-[#BAE6FD] shadow-xs hover:bg-[#CFEFFF] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#0284C7]/15 flex items-center justify-center text-[#0284C7] shrink-0">
              <Flame className="w-6 h-6 fill-current text-[#0284C7]" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#082F49]">Torch those Cals</h3>
              <p className="text-xs text-[#0369A1] font-medium">Track active calories burned</p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center text-[#0284C7]">
            <ChevronRight className="w-4 h-4" />
          </div>
        </Link>

        {/* Peach: Walks 4000 steps */}
        <Link
          to="/dashboard"
          className="flex items-center justify-between p-4 rounded-3xl bg-[#FFE8D6] border border-[#FED7AA] shadow-xs hover:bg-[#FED7AA]/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#EA580C]/15 flex items-center justify-center text-[#EA580C] shrink-0">
              <Footprints className="w-6 h-6 text-[#EA580C]" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#431407]">Walks 4,000 steps</h3>
              <p className="text-xs text-[#C2410C] font-medium">Daily step goal & active pacing</p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center text-[#EA580C]">
            <ChevronRight className="w-4 h-4" />
          </div>
        </Link>

        {/* Custard Yellow: Jot down meals */}
        <Link
          to="/diary?action=add"
          className="flex items-center justify-between p-4 rounded-3xl bg-[#FFF5D6] border border-[#FDE68A] shadow-xs hover:bg-[#FFF0C2] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#D97706]/15 flex items-center justify-center text-[#D97706] shrink-0">
              <PenTool className="w-5 h-5 text-[#D97706]" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#451A03]">Jot down meals</h3>
              <p className="text-xs text-[#B45309] font-medium">Write your meals.</p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center text-[#D97706]">
            <ChevronRight className="w-4 h-4" />
          </div>
        </Link>
      </div>

      {/* ============================================================== */}
      {/* 4. DISCOVER MORE DIET PLANS */}
      {/* ============================================================== */}
      <div className="flex flex-col gap-3 pt-2">
        <h3 className="text-lg font-black text-[#18181B]">Explore Evidence-Based Plans</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {curatedPlans.slice(1).map((plan) => (
            <div
              key={plan.id}
              className="bg-white rounded-3xl p-4 border border-[#E2EFE7] shadow-xs flex flex-col gap-3 group"
            >
              <div className="relative rounded-2xl overflow-hidden aspect-[16/9] bg-gray-100">
                <img
                  src={plan.hero_image}
                  alt={plan.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur text-white text-[10px] font-bold">
                  {plan.duration}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-black text-[#18181B]">{plan.title}</h4>
                <p className="text-xs text-[#6C7A72] line-clamp-2 mt-0.5 leading-relaxed font-medium">
                  {plan.tagline}
                </p>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => setSelectedPlanId(plan.id)}
                  className="text-xs font-bold text-[#006C4D] hover:underline"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleStartPlan(plan)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#101418] hover:bg-[#27272A] text-white text-xs font-black flex items-center gap-1 shadow-xs active:scale-95 transition-all"
                >
                  <span>Start</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#34D399]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

