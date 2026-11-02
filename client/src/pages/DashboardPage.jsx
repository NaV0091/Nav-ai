import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  getGuestMealsByDate,
  getGuestDailyGoals,
  saveGuestDailyGoals,
  getGuestWaterLogs,
  addGuestWaterLog,
  deleteGuestWaterLog,
  addGuestMeal,
  deleteGuestMeal,
  getTodayDateString,
  getGuestProfile,
} from '../services/guestStorage';
import {
  fetchMealsByDate,
  fetchDailyGoals,
  upsertDailyGoals,
  fetchWaterLogsByDate,
  createAuthenticatedWaterLog,
  deleteAuthenticatedWaterLog,
  createAuthenticatedMeal,
  deleteAuthenticatedMeal,
  fetchUserProfile,
} from '../services/supabaseClient';
import {
  calculateMealTotals,
  calculateRemainingCalories,
} from '../services/nutritionEngine';
import {
  Sparkles,
  Flame,
  Droplets,
  Plus,
  Trash2,
  ChevronRight,
  Utensils,
  Coffee,
  Sun,
  Moon,
  Cookie,
  Edit2,
  Footprints,
  PenTool,
  Info,
  X,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import AICoachModal from '../components/AICoachModal';
import { curatedRecipes } from '../data/curatedData';

export default function DashboardPage() {
  const { user, isGuest, isSupabaseConfigured } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // State
  const [selectedDate, setSelectedDate] = useState(() => getTodayDateString());
  const [meals, setMeals] = useState([]);
  const [goals, setGoals] = useState({
    calorie_target: 1200,
    protein_target_g: 65,
    carbs_target_g: 165,
    fat_target_g: 35,
    water_target_ml: 2000,
    steps_target: 4000,
  });
  const [waterLogs, setWaterLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCoach, setShowCoach] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0); // 0 = Calorie Ring, 1 = Heart Health
  const [profileName, setProfileName] = useState('Explorer');

  // Water & Steps Modal States
  const [showWaterModal, setShowWaterModal] = useState(false);
  const [customWaterInputL, setCustomWaterInputL] = useState('');
  const [editWaterGoalL, setEditWaterGoalL] = useState('2.0');

  const [showStepsModal, setShowStepsModal] = useState(false);
  const [customStepsInput, setCustomStepsInput] = useState('');
  const [editStepGoal, setEditStepGoal] = useState('4000');

  // Steps taken today (persisted per date in localStorage)
  const [stepsTaken, setStepsTaken] = useState(() => {
    try {
      const stored = localStorage.getItem(`navai_steps_${getTodayDateString()}`);
      return stored ? parseInt(stored, 10) : 0;
    } catch {
      return 0;
    }
  });

  // Sync steps when selected date changes
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`navai_steps_${selectedDate}`);
      setStepsTaken(stored ? parseInt(stored, 10) : 0);
    } catch {
      setStepsTaken(0);
    }
  }, [selectedDate]);

  // Load Dashboard Data
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      if (user && isSupabaseConfigured) {
        const [mealsData, goalsData, waterData, profileData] = await Promise.all([
          fetchMealsByDate(user.id, selectedDate),
          fetchDailyGoals(user.id),
          fetchWaterLogsByDate(user.id, selectedDate),
          fetchUserProfile(user.id),
        ]);

        setMeals(mealsData || []);
        if (goalsData) {
          setGoals((prev) => ({
            ...prev,
            ...goalsData,
            steps_target: goalsData.steps_target || prev.steps_target || 4000,
          }));
          setEditWaterGoalL(((goalsData.water_target_ml || 2000) / 1000).toFixed(1));
          setEditStepGoal(String(goalsData.steps_target || 4000));
        }
        setWaterLogs(waterData || []);
        if (profileData?.display_name) setProfileName(profileData.display_name);
      } else {
        const [guestMeals, guestGoals, guestWater, guestProf] = await Promise.all([
          getGuestMealsByDate(selectedDate),
          getGuestDailyGoals(),
          getGuestWaterLogs(selectedDate),
          getGuestProfile(),
        ]);

        setMeals(guestMeals || []);
        if (guestGoals) {
          setGoals((prev) => ({
            ...prev,
            ...guestGoals,
            steps_target: guestGoals.steps_target || prev.steps_target || 4000,
          }));
          setEditWaterGoalL(((guestGoals.water_target_ml || 2000) / 1000).toFixed(1));
          setEditStepGoal(String(guestGoals.steps_target || 4000));
        }
        setWaterLogs(guestWater || []);
        if (guestProf?.display_name) setProfileName(guestProf.display_name);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [user, isSupabaseConfigured, selectedDate]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Totals calculations
  const dailyNutrition = useMemo(() => calculateMealTotals(meals), [meals]);
  const calorieStats = useMemo(
    () => calculateRemainingCalories(goals.calorie_target, dailyNutrition.calories),
    [goals.calorie_target, dailyNutrition.calories]
  );

  // Water calculations in Litres
  const totalWaterMl = useMemo(
    () =>
      waterLogs.reduce(
        (acc, log) =>
          acc + (Number(log.quantity_ml ?? log.amount_ml ?? log.quantityMl) || 0),
        0
      ),
    [waterLogs]
  );
  const waterLoggedL = useMemo(() => (totalWaterMl / 1000).toFixed(1), [totalWaterMl]);
  const waterTargetL = useMemo(
    () => ((goals.water_target_ml || 2000) / 1000).toFixed(1),
    [goals.water_target_ml]
  );
  const waterProgressPct = useMemo(
    () => Math.min(100, Math.round((totalWaterMl / (goals.water_target_ml || 2000)) * 100)),
    [totalWaterMl, goals.water_target_ml]
  );

  // Steps calculations
  const stepTarget = goals.steps_target || 4000;
  const stepProgressPct = useMemo(
    () => Math.min(100, Math.round((stepsTaken / stepTarget) * 100)),
    [stepsTaken, stepTarget]
  );
  // Estimate calories burned from steps: approx 0.04 Cal/step
  const caloriesBurned = useMemo(() => Math.round(stepsTaken * 0.04), [stepsTaken]);

  // Add water helper
  const handleAddWaterMl = async (amountMl) => {
    try {
      if (user && isSupabaseConfigured) {
        const created = await createAuthenticatedWaterLog(user.id, amountMl, selectedDate);
        if (created) {
          setWaterLogs((prev) => [...prev, created]);
        }
      } else {
        const created = await addGuestWaterLog(amountMl, selectedDate);
        if (created) {
          setWaterLogs((prev) => [...prev, created]);
        }
      }
      showToast(`+${(amountMl / 1000).toFixed(2)} L water logged!`, 'success');
      loadDashboardData();
    } catch (err) {
      console.error(err);
      showToast('Failed to log water', 'error');
    }
  };

  // Undo water helper
  const handleUndoWater = async () => {
    if (!waterLogs.length) return;
    const lastLog = waterLogs[waterLogs.length - 1];
    try {
      if (user && isSupabaseConfigured) {
        await deleteAuthenticatedWaterLog(lastLog.id);
      } else {
        await deleteGuestWaterLog(lastLog.id);
      }
      setWaterLogs((prev) => prev.filter((l) => l.id !== lastLog.id));
      showToast('Removed last water log', 'info');
      loadDashboardData();
    } catch (err) {
      console.error(err);
      showToast('Failed to delete water log', 'error');
    }
  };

  // Update Daily Water Goal in Litres
  const handleSaveWaterGoal = async (targetInL) => {
    const valL = parseFloat(targetInL);
    if (!valL || valL <= 0) {
      showToast('Please enter a valid water goal', 'error');
      return;
    }
    const targetMl = Math.round(valL * 1000);
    const updatedGoals = { ...goals, water_target_ml: targetMl };
    setGoals(updatedGoals);
    try {
      if (user && isSupabaseConfigured) {
        await upsertDailyGoals(user.id, updatedGoals);
      } else {
        await saveGuestDailyGoals(updatedGoals);
      }
      showToast(`Water goal updated to ${valL.toFixed(1)} L!`, 'success');
    } catch (err) {
      showToast('Failed to update water goal', 'error');
    }
  };

  // Steps handler
  const handleAddSteps = (count) => {
    const updated = Math.max(0, stepsTaken + count);
    setStepsTaken(updated);
    try {
      localStorage.setItem(`navai_steps_${selectedDate}`, String(updated));
    } catch {}
    showToast(`+${count.toLocaleString()} steps logged!`, 'success');
  };

  const handleSetExactSteps = (exactCount) => {
    const parsed = parseInt(exactCount, 10);
    if (isNaN(parsed) || parsed < 0) {
      showToast('Please enter a valid step count', 'error');
      return;
    }
    setStepsTaken(parsed);
    try {
      localStorage.setItem(`navai_steps_${selectedDate}`, String(parsed));
    } catch {}
    showToast(`Steps set to ${parsed.toLocaleString()}!`, 'success');
  };

  // Update Daily Step Goal
  const handleSaveStepGoal = async (newGoalStr) => {
    const val = parseInt(newGoalStr, 10);
    if (!val || val <= 0) {
      showToast('Please enter a valid step goal', 'error');
      return;
    }
    const updatedGoals = { ...goals, steps_target: val };
    setGoals(updatedGoals);
    try {
      if (user && isSupabaseConfigured) {
        await upsertDailyGoals(user.id, updatedGoals);
      } else {
        await saveGuestDailyGoals(updatedGoals);
      }
      showToast(`Step goal updated to ${val.toLocaleString()} steps!`, 'success');
    } catch (err) {
      showToast('Failed to update step goal', 'error');
    }
  };

  // Delete meal
  const handleDeleteMeal = async (mealId) => {
    if (!window.confirm('Delete this meal from your diary?')) return;
    try {
      if (user && isSupabaseConfigured) {
        await deleteAuthenticatedMeal(mealId);
      } else {
        await deleteGuestMeal(mealId);
      }
      showToast('Meal removed', 'info');
      loadDashboardData();
    } catch (err) {
      showToast('Failed to delete meal', 'error');
    }
  };

  // Quick Track Curated Meal Helper (from the Pancake or Almonds cards)
  const handleQuickTrackMeal = async (curatedItem, e) => {
    e.stopPropagation();
    try {
      const mealRecord = {
        name: curatedItem.title,
        meal_type: curatedItem.category ? curatedItem.category.toLowerCase() : 'breakfast',
        date: selectedDate,
        total_calories: curatedItem.calories_per_serving,
        total_protein_g: curatedItem.protein_per_serving_g,
        total_carbs_g: curatedItem.carbs_per_serving_g,
        total_fat_g: curatedItem.fat_per_serving_g,
        image_data: curatedItem.image_url,
        notes: 'Tracked from curated recipes',
        items: [
          {
            food_name: curatedItem.title,
            portion_grams: 150,
            calories: curatedItem.calories_per_serving,
            protein_g: curatedItem.protein_per_serving_g,
            carbs_g: curatedItem.carbs_per_serving_g,
            fat_g: curatedItem.fat_per_serving_g,
          },
        ],
      };

      if (user && isSupabaseConfigured) {
        await createAuthenticatedMeal(user.id, mealRecord);
      } else {
        await addGuestMeal(mealRecord);
      }

      showToast(`Logged "${curatedItem.title}" to ${mealRecord.meal_type}!`, 'success');
      loadDashboardData();
    } catch (err) {
      showToast('Failed to track meal', 'error');
    }
  };

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

  // Meal categories grouping
  const mealSections = [
    {
      key: 'breakfast',
      label: 'Breakfast',
      icon: Coffee,
      targetCals: Math.round(goals.calorie_target * 0.25),
      bgClass: 'bg-[#EFF4FF] border-[#DBEAFE]',
    },
    {
      key: 'lunch',
      label: 'Lunch',
      icon: Sun,
      targetCals: Math.round(goals.calorie_target * 0.35),
      bgClass: 'bg-[#F4EFFE] border-[#E9D5FF]',
    },
    {
      key: 'dinner',
      label: 'Dinner',
      icon: Moon,
      targetCals: Math.round(goals.calorie_target * 0.30),
      bgClass: 'bg-[#EBFBF2] border-[#CEF6DF]',
    },
    {
      key: 'snack',
      label: 'Morning Snacks',
      icon: Cookie,
      targetCals: Math.round(goals.calorie_target * 0.10),
      bgClass: 'bg-[#FFF2E8] border-[#FED7AA]',
    },
  ];

  // SVG Gauge calculations
  const circumference = 2 * Math.PI * 46; // ~289.02
  const gaugePercent = Math.min(100, (dailyNutrition.calories / goals.calorie_target) * 100);
  const strokeDashoffset = circumference - (circumference * gaugePercent) / 100;

  // Curated meals preview items
  const pancakeRecipe = curatedRecipes[6]; // Banana Porridge Pancakes
  const almondsRecipe = curatedRecipes[7]; // Roasted California Almonds

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
      {/* ============================================================== */}
      {/* 1. MINT VIBRANT HEADER & TOP PILLS */}
      {/* ============================================================== */}
      <div className="-mx-4 -mt-4 sm:-mx-6 sm:-mt-6 lg:-mx-8 p-4 sm:p-6 lg:p-8 pt-3 pb-6 rounded-b-[2.5rem] bg-gradient-to-b from-[#A5F3C8] via-[#CEF6DF] via-40% to-[#F8FAF8] border-b border-[#CEF6DF]/60 shadow-[0_4px_24px_rgba(0,108,77,0.04)]">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          {/* Left Pill: Avatar + Ask Nav AI + Crown */}
          <button
            onClick={() => setShowCoach(true)}
            className="flex items-center gap-2.5 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-sm border border-white hover:border-[#34D399] transition-all group active:scale-95"
          >
            <div className="w-7 h-7 rounded-full bg-[#101418] text-white flex items-center justify-center font-bold text-xs ring-2 ring-[#34D399]">
              ✨
            </div>
            <span className="text-xs sm:text-sm font-extrabold text-[#18181B] tracking-tight">
              Ask Nav AI
            </span>
            <span className="text-sm">👑</span>
          </button>

          {/* Right Pill: Daily Flame Streak */}
          <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-sm border border-white">
            <Flame className="w-4 h-4 text-[#EA580C] fill-[#EA580C]" />
            <span className="text-xs sm:text-sm font-black text-[#18181B]">1</span>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 2. WEEKLY HORIZONTAL DATE STRIP */}
        {/* ============================================================== */}
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
      {/* 3. HERO NUTRITION CARD (Slide 1: Calorie Ring | Slide 2: Heart Health) */}
      {/* ============================================================== */}
      <div className="relative bg-white rounded-3xl p-6 sm:p-7 shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-[#E2EFE7] overflow-hidden">
        {/* Slide 1: Balanced Diet Calorie Ring */}
        {activeSlide === 0 ? (
          <div className="flex flex-col gap-5 animate-in fade-in duration-300">
            {/* Card Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-[#18181B]">
                  Balanced Diet : {goals.calorie_target} Cal
                </h2>
                <Link
                  to="/profile"
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[#8E8E93] hover:text-[#006C4D] hover:bg-[#E8FBF0] transition-colors"
                  title="Edit Targets"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </Link>
              </div>

              <span className="text-[11px] font-bold px-3 py-1 bg-[#E8FBF0] text-[#006C4D] rounded-full">
                {selectedDate === getTodayDateString() ? 'Today' : selectedDate}
              </span>
            </div>

            {/* Middle Section: Eaten/Burned + Radial Ring */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center py-1">
              {/* Left Column: Eaten & Burned Readout */}
              <div className="sm:col-span-5 flex flex-row sm:flex-col justify-around sm:justify-center gap-4">
                <div>
                  <span className="text-[11px] text-[#6C7A72] flex items-center gap-1 font-bold uppercase tracking-wider">
                    Eaten <Utensils className="w-3.5 h-3.5 text-[#225EAA]" />
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-2xl sm:text-3xl font-black text-[#18181B]">
                      {dailyNutrition.calories}
                    </span>
                    <span className="text-xs text-[#8E8E93] font-semibold">Cal</span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-[#6C7A72] flex items-center gap-1 font-bold uppercase tracking-wider">
                    Burned <Flame className="w-3.5 h-3.5 text-[#EA580C]" />
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-2xl sm:text-3xl font-black text-[#18181B]">
                      {caloriesBurned}
                    </span>
                    <span className="text-xs text-[#8E8E93] font-semibold">Cal</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Dark Circular Ring with Emerald Arc */}
              <div className="sm:col-span-7 flex justify-center sm:justify-end">
                <div className="relative w-40 h-40 sm:w-44 sm:h-44 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" fill="none" r="46" stroke="#182228" strokeWidth="10" />
                    <circle
                      cx="60"
                      cy="60"
                      fill="none"
                      r="46"
                      stroke={calorieStats.isOverTarget ? '#EA580C' : '#34D399'}
                      strokeWidth="10"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>

                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-3xl sm:text-4xl font-black text-[#18181B] tracking-tight leading-none">
                      {calorieStats.isOverTarget ? `+${calorieStats.overAmount}` : calorieStats.remaining}
                    </span>
                    <span className="text-[11px] font-bold text-[#8E8E93] mt-1">
                      {calorieStats.isOverTarget ? 'Cal over' : 'Cal left'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom 3 Macro Columns */}
            <div className="grid grid-cols-3 gap-2.5 pt-4 border-t border-[#E8FBF0]">
              {/* Carb */}
              <div className="flex flex-col">
                <div className="flex justify-between items-center text-[11px] font-bold text-[#6C7A72]">
                  <span>Carb</span>
                  <span className="text-[#225EAA]">
                    {Math.round((dailyNutrition.carbs / (goals.carbs_target_g || 1)) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-[#EBF3FE] rounded-full h-1.5 mt-1 overflow-hidden">
                  <div
                    className="bg-[#38BDF8] h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (dailyNutrition.carbs / (goals.carbs_target_g || 1)) * 100)}%`,
                    }}
                  />
                </div>
                <span className="text-xs font-black text-[#18181B] mt-1">
                  {dailyNutrition.carbs} <span className="text-[10px] font-medium text-[#8E8E93]">/ {goals.carbs_target_g}g</span>
                </span>
              </div>

              {/* Protein */}
              <div className="flex flex-col">
                <div className="flex justify-between items-center text-[11px] font-bold text-[#6C7A72]">
                  <span>Proteins</span>
                  <span className="text-[#006C4D]">
                    {Math.round((dailyNutrition.protein / (goals.protein_target_g || 1)) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-[#E8FBF0] rounded-full h-1.5 mt-1 overflow-hidden">
                  <div
                    className="bg-[#34D399] h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (dailyNutrition.protein / (goals.protein_target_g || 1)) * 100)}%`,
                    }}
                  />
                </div>
                <span className="text-xs font-black text-[#18181B] mt-1">
                  {dailyNutrition.protein} <span className="text-[10px] font-medium text-[#8E8E93]">/ {goals.protein_target_g}g</span>
                </span>
              </div>

              {/* Fat */}
              <div className="flex flex-col">
                <div className="flex justify-between items-center text-[11px] font-bold text-[#6C7A72]">
                  <span>Fat</span>
                  <span className="text-[#754F8A]">
                    {Math.round((dailyNutrition.fat / (goals.fat_target_g || 1)) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-[#F4EFFE] rounded-full h-1.5 mt-1 overflow-hidden">
                  <div
                    className="bg-[#C084FC] h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (dailyNutrition.fat / (goals.fat_target_g || 1)) * 100)}%`,
                    }}
                  />
                </div>
                <span className="text-xs font-black text-[#18181B] mt-1">
                  {dailyNutrition.fat} <span className="text-[10px] font-medium text-[#8E8E93]">/ {goals.fat_target_g}g</span>
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Slide 2: Heart Health (Screen 5 from reference image) */
          <div className="flex flex-col gap-4 animate-in fade-in duration-300 py-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-[#18181B]">Heart Health</h2>
                <Info className="w-4 h-4 text-[#8E8E93]" />
              </div>
              <span className="text-[11px] font-bold px-3 py-1 bg-[#E8FBF0] text-[#006C4D] rounded-full">
                Vascular Pacing
              </span>
            </div>

            <div className="flex flex-col gap-4 pt-2">
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-[#18181B]">Saturated Fat</span>
                  <span className="text-[#6C7A72]">5.3 / 20g</span>
                </div>
                <div className="w-full bg-[#E0F2FE] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#38BDF8] h-full rounded-full" style={{ width: '26%' }} />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-[#18181B]">Sodium</span>
                  <span className="text-[#6C7A72]">516.3 / 2300mg</span>
                </div>
                <div className="w-full bg-[#DCFCE7] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#22C55E] h-full rounded-full" style={{ width: '22%' }} />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-[#18181B]">Cholesterol</span>
                  <span className="text-[#6C7A72]">190.8 / 300mg</span>
                </div>
                <div className="w-full bg-[#FFEDD5] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#F97316] h-full rounded-full" style={{ width: '63%' }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Carousel Pagination Dots */}
        <div className="flex items-center justify-center gap-1.5 mt-4 pt-2">
          <button
            onClick={() => setActiveSlide(0)}
            className={`w-2 h-2 rounded-full transition-all ${
              activeSlide === 0 ? 'w-5 bg-[#18181B]' : 'bg-[#D1D5DB]'
            }`}
            aria-label="Calorie Ring Slide"
          />
          <button
            onClick={() => setActiveSlide(1)}
            className={`w-2 h-2 rounded-full transition-all ${
              activeSlide === 1 ? 'w-5 bg-[#18181B]' : 'bg-[#D1D5DB]'
            }`}
            aria-label="Heart Health Slide"
          />
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. THE 4 COLORFUL PASTEL ACTION TILES */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Tile 1: Violet Water Intake Card (Now fully in Litres with Edit Goal) */}
        <div
          onClick={() => setShowWaterModal(true)}
          className="flex flex-col p-4 rounded-3xl bg-[#EAE5FF] border border-[#DDD4FE] shadow-xs cursor-pointer hover:border-[#7C3AED] transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#7C3AED]/15 flex items-center justify-center text-[#7C3AED] shrink-0 group-hover:scale-105 transition-transform">
                <Droplets className="w-6 h-6 fill-current" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-extrabold text-[#1E1B4B]">Log your water intake</h3>
                  <Edit2 className="w-3 h-3 text-[#7C3AED] opacity-70 group-hover:opacity-100" />
                </div>
                <p className="text-xs text-[#5B21B6] font-medium">
                  You already drank {waterLoggedL} / {waterTargetL} L
                </p>
              </div>
            </div>

            <div className="w-8 h-8 rounded-full bg-white/80 group-hover:bg-white flex items-center justify-center text-[#7C3AED] shadow-xs transition-colors shrink-0">
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* Smooth Litre Progress Bar */}
          <div className="w-full bg-white/80 rounded-full h-1.5 mt-2.5 overflow-hidden">
            <div
              className="bg-[#7C3AED] h-full rounded-full transition-all duration-500"
              style={{ width: `${waterProgressPct}%` }}
            />
          </div>

          {/* Quick Water Add Row in Litres (No multiline wrapping, clean L removed from button) */}
          <div
            className="flex items-center gap-2 mt-3 pt-2 border-t border-[#DDD4FE]/60"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => handleAddWaterMl(250)}
              className="flex-1 py-1.5 px-2 rounded-xl bg-white text-[#7C3AED] text-xs font-bold shadow-xs hover:bg-[#7C3AED] hover:text-white transition-all flex items-center justify-center gap-1 active:scale-95 whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" /> 0.25
            </button>
            <button
              onClick={() => handleAddWaterMl(500)}
              className="flex-1 py-1.5 px-2 rounded-xl bg-white text-[#7C3AED] text-xs font-bold shadow-xs hover:bg-[#7C3AED] hover:text-white transition-all flex items-center justify-center gap-1 active:scale-95 whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" /> 0.5
            </button>
            <button
              onClick={() => handleAddWaterMl(1000)}
              className="flex-1 py-1.5 px-2 rounded-xl bg-white text-[#7C3AED] text-xs font-bold shadow-xs hover:bg-[#7C3AED] hover:text-white transition-all flex items-center justify-center gap-1 active:scale-95 whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" /> 1.0
            </button>
            {waterLogs.length > 0 && (
              <button
                onClick={handleUndoWater}
                className="px-2.5 py-1.5 rounded-xl bg-white/70 text-[#7C3AED] text-xs font-semibold hover:bg-white transition-all whitespace-nowrap"
                title="Undo last log"
              >
                Undo
              </button>
            )}
          </div>
        </div>

        {/* Tile 2: Sky Cyan Torch Those Cals Card */}
        <Link
          to="/progress"
          className="flex items-center justify-between p-4 rounded-3xl bg-[#D8F2FF] border border-[#BAE6FD] shadow-xs group hover:bg-[#CFEFFF] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#0284C7]/15 flex items-center justify-center text-[#0284C7] shrink-0 group-hover:scale-105 transition-transform">
              <Flame className="w-6 h-6 fill-current text-[#0284C7]" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#082F49]">Torch those Cals</h3>
              <p className="text-xs text-[#0369A1] font-medium">
                {caloriesBurned} Cal burned from steps today
              </p>
            </div>
          </div>

          <div className="w-8 h-8 rounded-full bg-white/80 group-hover:bg-white flex items-center justify-center text-[#0284C7] shadow-xs transition-colors shrink-0">
            <ChevronRight className="w-4 h-4" />
          </div>
        </Link>

        {/* Tile 3: Soft Peach Walks Steps Card (Fully working counter & goal editor) */}
        <div
          onClick={() => setShowStepsModal(true)}
          className="flex flex-col p-4 rounded-3xl bg-[#FFE8D6] border border-[#FED7AA] shadow-xs cursor-pointer hover:border-[#EA580C] transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#EA580C]/15 flex items-center justify-center text-[#EA580C] shrink-0 group-hover:scale-105 transition-transform">
                <Footprints className="w-6 h-6 text-[#EA580C]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-extrabold text-[#431407]">
                    Walks {stepTarget.toLocaleString()} steps
                  </h3>
                  <Edit2 className="w-3 h-3 text-[#EA580C] opacity-70 group-hover:opacity-100" />
                </div>
                <p className="text-xs text-[#C2410C] font-medium">
                  You already walked {stepsTaken.toLocaleString()} / {stepTarget.toLocaleString()} steps
                </p>
              </div>
            </div>

            <div className="w-8 h-8 rounded-full bg-white/80 group-hover:bg-white flex items-center justify-center text-[#EA580C] shadow-xs shrink-0">
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* Smooth Steps Progress Bar */}
          <div className="w-full bg-white/80 rounded-full h-1.5 mt-2.5 overflow-hidden">
            <div
              className="bg-[#EA580C] h-full rounded-full transition-all duration-500"
              style={{ width: `${stepProgressPct}%` }}
            />
          </div>

          {/* Quick Step Buttons */}
          <div
            className="flex items-center gap-2 mt-3 pt-2 border-t border-[#FED7AA]/60"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => handleAddSteps(1000)}
              className="flex-1 py-1.5 px-2 rounded-xl bg-white text-[#EA580C] text-xs font-bold shadow-xs hover:bg-[#EA580C] hover:text-white transition-all flex items-center justify-center gap-1 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" /> 1,000
            </button>
            <button
              onClick={() => handleAddSteps(2500)}
              className="flex-1 py-1.5 px-2 rounded-xl bg-white text-[#EA580C] text-xs font-bold shadow-xs hover:bg-[#EA580C] hover:text-white transition-all flex items-center justify-center gap-1 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" /> 2,500
            </button>
            <button
              onClick={() => setShowStepsModal(true)}
              className="px-3 py-1.5 rounded-xl bg-white/80 text-[#431407] text-xs font-bold hover:bg-white transition-all"
            >
              Edit Goal
            </button>
          </div>
        </div>

        {/* Tile 4: Custard Yellow Jot Down Meals Card */}
        <Link
          to="/diary?action=add"
          className="flex items-center justify-between p-4 rounded-3xl bg-[#FFF5D6] border border-[#FDE68A] shadow-xs group hover:bg-[#FFF0C2] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#D97706]/15 flex items-center justify-center text-[#D97706] shrink-0 group-hover:scale-105 transition-transform">
              <PenTool className="w-5 h-5 text-[#D97706]" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#451A03]">Jot down meals</h3>
              <p className="text-xs text-[#B45309] font-medium">Write your meals.</p>
            </div>
          </div>

          <div className="w-8 h-8 rounded-full bg-white/80 group-hover:bg-white flex items-center justify-center text-[#D97706] shadow-xs transition-colors shrink-0">
            <ChevronRight className="w-4 h-4" />
          </div>
        </Link>
      </div>

      {/* ============================================================== */}
      {/* 5. "MEALS" PHOTO CARDS SECTION (Clicking card opens recipe!) */}
      {/* ============================================================== */}
      <div className="flex flex-col gap-3.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-lg font-black text-[#18181B]">Meals</h3>
          <Link
            to="/recipes"
            className="text-xs font-bold text-[#006C4D] hover:underline flex items-center gap-0.5"
          >
            More recipes <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card 1: Breakfast Berry Pancakes */}
          <div className="bg-white rounded-3xl p-3.5 border border-[#E2EFE7] shadow-xs flex flex-col gap-3 group hover:border-[#34D399] transition-all">
            <Link
              to={`/recipes/${pancakeRecipe.id}`}
              className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-gray-100 block cursor-pointer"
              title="Click to view recipe details"
            >
              <img
                src={pancakeRecipe.image_url}
                alt={pancakeRecipe.title}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src =
                    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=800&q=80';
                }}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-[#6C7A72] group-hover:text-[#006C4D] transition-colors">
                <Edit2 className="w-3.5 h-3.5" />
              </div>
            </Link>

            {/* Tags: 299 Cal & 20 min */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FFF2EB] text-[#EA580C] text-[11px] font-bold">
                <Flame className="w-3 h-3 fill-current" /> {pancakeRecipe.calories_per_serving} Cal
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E8FBF0] text-[#006C4D] text-[11px] font-bold">
                ⏱ {pancakeRecipe.preparation_time_minutes} min
              </span>
            </div>

            <Link to={`/recipes/${pancakeRecipe.id}`} className="block">
              <h4 className="text-sm font-extrabold text-[#18181B] group-hover:text-[#006C4D] transition-colors">
                Breakfast
              </h4>
              <p className="text-xs text-[#6C7A72] truncate mt-0.5">{pancakeRecipe.title}</p>
            </Link>

            {/* Solid Dark Track Button */}
            <button
              onClick={(e) => handleQuickTrackMeal(pancakeRecipe, e)}
              className="w-full py-2.5 rounded-2xl bg-[#101418] hover:bg-[#27272A] text-white text-xs font-black flex items-center justify-center gap-1.5 transition-colors shadow-xs active:scale-98"
            >
              <Plus className="w-4 h-4 text-[#34D399]" /> Track
            </button>
          </div>

          {/* Card 2: Morning Snacks Almonds (With guaranteed 200 OK image & clickable recipe link!) */}
          <div className="bg-white rounded-3xl p-3.5 border border-[#E2EFE7] shadow-xs flex flex-col gap-3 group hover:border-[#34D399] transition-all">
            <Link
              to={`/recipes/${almondsRecipe.id}`}
              className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-gray-100 block cursor-pointer"
              title="Click to view recipe details"
            >
              <img
                src={almondsRecipe.image_url || '/almonds_bowl.jpg'}
                alt={almondsRecipe.title}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/almonds_bowl.jpg';
                }}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-[#6C7A72] group-hover:text-[#006C4D] transition-colors">
                <Edit2 className="w-3.5 h-3.5" />
              </div>
            </Link>

            {/* Tags: 166 Cal & 20 min */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FFF2EB] text-[#EA580C] text-[11px] font-bold">
                <Flame className="w-3 h-3 fill-current" /> {almondsRecipe.calories_per_serving} Cal
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E8FBF0] text-[#006C4D] text-[11px] font-bold">
                ⏱ {almondsRecipe.preparation_time_minutes} min
              </span>
            </div>

            <Link to={`/recipes/${almondsRecipe.id}`} className="block">
              <h4 className="text-sm font-extrabold text-[#18181B] group-hover:text-[#006C4D] transition-colors">
                Morning Snacks
              </h4>
              <p className="text-xs text-[#6C7A72] truncate mt-0.5">{almondsRecipe.title}</p>
            </Link>

            {/* Solid Dark Track Button */}
            <button
              onClick={(e) => handleQuickTrackMeal(almondsRecipe, e)}
              className="w-full py-2.5 rounded-2xl bg-[#101418] hover:bg-[#27272A] text-white text-xs font-black flex items-center justify-center gap-1.5 transition-colors shadow-xs active:scale-98"
            >
              <Plus className="w-4 h-4 text-[#34D399]" /> Track
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 6. "EATEN" (Meal Groups Accordion from Screen 1 & Screen 5) */}
      {/* ============================================================== */}
      <div className="flex flex-col gap-3.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-lg font-black text-[#18181B]">Eaten</h3>
          <Link
            to="/plans"
            className="text-xs font-bold text-[#006C4D] hover:underline flex items-center gap-0.5"
          >
            Choose a plan <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {mealSections.map((sec) => {
            const Icon = sec.icon;
            const categoryMeals = meals.filter(
              (m) => m.meal_type?.toLowerCase() === sec.key.toLowerCase()
            );
            const categoryCals = categoryMeals.reduce(
              (sum, m) => sum + (Number(m.total_calories) || 0),
              0
            );
            const categoryPct = Math.min(100, Math.round((categoryCals / sec.targetCals) * 100));

            return (
              <div
                key={sec.key}
                className={`rounded-3xl p-4 border ${sec.bgClass} shadow-xs flex flex-col gap-3`}
              >
                {/* Header & Progress */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-[#18181B] shadow-xs">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-[#18181B]">{sec.label}</h4>
                      <p className="text-[11px] text-[#6C7A72]">
                        {categoryCals} / {sec.targetCals} Cal
                      </p>
                    </div>
                  </div>

                  <Link
                    to={`/diary?action=add&meal_type=${sec.key}`}
                    className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-[#18181B] hover:bg-[#101418] hover:text-white transition-colors shadow-xs"
                    title={`Log food to ${sec.label}`}
                  >
                    <Plus className="w-4 h-4" />
                  </Link>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-white/80 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#34D399] h-full rounded-full transition-all"
                    style={{ width: `${categoryPct}%` }}
                  />
                </div>

                {/* Meals List for this Category */}
                <div className="flex flex-col gap-2 pt-1">
                  {categoryMeals.length === 0 ? (
                    <div className="text-center py-3 text-xs text-[#8E8E93] bg-white/40 rounded-2xl border border-dashed border-white">
                      No {sec.label.toLowerCase()} recorded yet
                    </div>
                  ) : (
                    categoryMeals.map((meal) => (
                      <div
                        key={meal.id}
                        className="flex items-center justify-between p-2.5 rounded-2xl bg-white border border-white/80 shadow-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {meal.image_data ? (
                            <img
                              src={meal.image_data}
                              alt={meal.name}
                              className="w-10 h-10 rounded-xl object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-[#E8FBF0] flex items-center justify-center text-[#006C4D] shrink-0 font-extrabold text-xs">
                              {meal.name.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-extrabold text-[#18181B] truncate">
                              {meal.name}
                            </span>
                            <span className="text-[11px] text-[#6C7A72] truncate">
                              {meal.total_calories} Cal • {meal.total_protein_g}g P
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteMeal(meal.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-full text-[#8E8E93] hover:text-[#BA1A1A] hover:bg-red-50 transition-colors shrink-0"
                          title="Delete meal"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 7. WATER GOAL & CONSUMPTION MODAL (Units in Litres) */}
      {/* ============================================================== */}
      {showWaterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div
            className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-[#DDD4FE] flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#EAE5FF]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[#7C3AED]/15 flex items-center justify-center text-[#7C3AED]">
                  <Droplets className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#1E1B4B]">Hydration Tracker</h3>
                  <p className="text-xs text-[#7C3AED] font-semibold">
                    Current: {waterLoggedL} L / {waterTargetL} L
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowWaterModal(false)}
                className="w-8 h-8 rounded-full bg-[#F4F4F5] hover:bg-[#E4E4E7] flex items-center justify-center text-[#18181B]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Add Water Section */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#6C7A72]">
                Quick Log Water (Litres)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[0.25, 0.5, 0.75, 1.0].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => handleAddWaterMl(Math.round(amt * 1000))}
                    className="py-2.5 rounded-xl bg-[#EAE5FF] hover:bg-[#7C3AED] hover:text-white text-[#7C3AED] text-xs font-black transition-colors"
                  >
                    +{amt.toFixed(2)} L
                  </button>
                ))}
                <button
                  onClick={handleUndoWater}
                  className="py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#18181B] text-xs font-bold transition-colors col-span-2 flex items-center justify-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Undo Last
                </button>
              </div>
            </div>

            {/* Custom Log Water Input */}
            <div className="flex flex-col gap-1.5 pt-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[#6C7A72]">
                Custom Water Amount
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  value={customWaterInputL}
                  onChange={(e) => setCustomWaterInputL(e.target.value)}
                  placeholder="e.g. 0.35 L"
                  className="flex-1 px-3.5 py-2 rounded-xl bg-[#F8FAF8] border border-[#DDD4FE] text-xs font-bold text-[#18181B] focus:outline-none focus:border-[#7C3AED]"
                />
                <button
                  onClick={() => {
                    const l = parseFloat(customWaterInputL);
                    if (l > 0) {
                      handleAddWaterMl(Math.round(l * 1000));
                      setCustomWaterInputL('');
                    }
                  }}
                  className="px-4 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-black rounded-xl"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Edit Daily Water Target (In Litres) */}
            <div className="flex flex-col gap-2 pt-2 border-t border-[#EAE5FF]">
              <label className="text-xs font-bold uppercase tracking-wider text-[#6C7A72]">
                Edit Daily Goal (Litres)
              </label>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                {['1.5', '2.0', '2.5', '3.0', '3.5'].map((g) => (
                  <button
                    key={g}
                    onClick={() => {
                      setEditWaterGoalL(g);
                      handleSaveWaterGoal(g);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-colors ${
                      editWaterGoalL === g
                        ? 'bg-[#18181B] text-white'
                        : 'bg-[#F4F4F5] text-[#18181B] hover:bg-[#EAE5FF]'
                    }`}
                  >
                    {g} L
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 mt-1">
                <input
                  type="number"
                  step="0.1"
                  value={editWaterGoalL}
                  onChange={(e) => setEditWaterGoalL(e.target.value)}
                  placeholder="Custom Litres (e.g. 2.5)"
                  className="flex-1 px-3.5 py-2 rounded-xl bg-[#F8FAF8] border border-[#DDD4FE] text-xs font-bold text-[#18181B] focus:outline-none focus:border-[#7C3AED]"
                />
                <button
                  onClick={() => handleSaveWaterGoal(editWaterGoalL)}
                  className="px-4 py-2 bg-[#18181B] hover:bg-black text-white text-xs font-black rounded-xl"
                >
                  Save Goal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 8. STEPS TRACKER & GOAL MODAL */}
      {/* ============================================================== */}
      {showStepsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div
            className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-[#FED7AA] flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#FFE8D6]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[#EA580C]/15 flex items-center justify-center text-[#EA580C]">
                  <Footprints className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#431407]">Step Tracker</h3>
                  <p className="text-xs text-[#EA580C] font-semibold">
                    {stepsTaken.toLocaleString()} / {stepTarget.toLocaleString()} steps (~{caloriesBurned} Cal)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowStepsModal(false)}
                className="w-8 h-8 rounded-full bg-[#F4F4F5] hover:bg-[#E4E4E7] flex items-center justify-center text-[#18181B]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Add Steps */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#6C7A72]">
                Log Steps Taken Today
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[500, 1000, 2500, 5000].map((s) => (
                  <button
                    key={s}
                    onClick={() => handleAddSteps(s)}
                    className="py-2.5 rounded-xl bg-[#FFE8D6] hover:bg-[#EA580C] hover:text-white text-[#EA580C] text-xs font-black transition-colors"
                  >
                    +{s.toLocaleString()} steps
                  </button>
                ))}
              </div>
            </div>

            {/* Set Exact Steps or Custom Input */}
            <div className="flex flex-col gap-1.5 pt-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[#6C7A72]">
                Or Set Exact Step Count
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={customStepsInput}
                  onChange={(e) => setCustomStepsInput(e.target.value)}
                  placeholder="e.g. 4500"
                  className="flex-1 px-3.5 py-2 rounded-xl bg-[#F8FAF8] border border-[#FED7AA] text-xs font-bold text-[#18181B] focus:outline-none focus:border-[#EA580C]"
                />
                <button
                  onClick={() => {
                    handleSetExactSteps(customStepsInput);
                    setCustomStepsInput('');
                  }}
                  className="px-4 py-2 bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-black rounded-xl"
                >
                  Set
                </button>
                <button
                  onClick={() => handleSetExactSteps(0)}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl"
                  title="Reset to 0"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Edit Daily Step Goal */}
            <div className="flex flex-col gap-2 pt-2 border-t border-[#FFE8D6]">
              <label className="text-xs font-bold uppercase tracking-wider text-[#6C7A72]">
                Edit Daily Goal (Steps)
              </label>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                {['4000', '6000', '8000', '10000', '12000'].map((g) => (
                  <button
                    key={g}
                    onClick={() => {
                      setEditStepGoal(g);
                      handleSaveStepGoal(g);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-colors ${
                      editStepGoal === g
                        ? 'bg-[#18181B] text-white'
                        : 'bg-[#F4F4F5] text-[#18181B] hover:bg-[#FFE8D6]'
                    }`}
                  >
                    {parseInt(g, 10).toLocaleString()}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 mt-1">
                <input
                  type="number"
                  value={editStepGoal}
                  onChange={(e) => setEditStepGoal(e.target.value)}
                  placeholder="Custom goal (e.g. 7500)"
                  className="flex-1 px-3.5 py-2 rounded-xl bg-[#F8FAF8] border border-[#FED7AA] text-xs font-bold text-[#18181B] focus:outline-none focus:border-[#EA580C]"
                />
                <button
                  onClick={() => handleSaveStepGoal(editStepGoal)}
                  className="px-4 py-2 bg-[#18181B] hover:bg-black text-white text-xs font-black rounded-xl"
                >
                  Save Goal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Coach Dialog */}
      {showCoach && (
        <AICoachModal
          onClose={() => setShowCoach(false)}
          currentMeals={meals}
          dailyGoals={goals}
          nutrition={dailyNutrition}
        />
      )}
    </div>
  );
}
