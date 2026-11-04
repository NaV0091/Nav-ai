import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  getGuestProfile,
  saveGuestProfile,
  getGuestDailyGoals,
  saveGuestDailyGoals,
} from '../services/guestStorage';
import {
  fetchUserProfile,
  updateUserProfile,
  fetchDailyGoals,
  upsertDailyGoals,
} from '../services/supabaseClient';
import {
  calculateSuggestedGoals,
  calculateMacroDistribution,
} from '../services/nutritionEngine';
import {
  User,
  Sparkles,
  Flame,
  Droplets,
  CheckCircle2,
  RefreshCw,
  Plus,
  X,
  UserPlus,
  ArrowRight,
  ShieldCheck,
  Scale,
  Activity,
} from 'lucide-react';

export default function ProfilePage() {
  const { user, isGuest, isSupabaseConfigured, migrateGuestData } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [migrating, setMigrating] = useState(false);

  // Profile Fields
  const [displayName, setDisplayName] = useState('Explorer');
  const [age, setAge] = useState(28);
  const [heightCm, setHeightCm] = useState(170);
  const [weightKg, setWeightKg] = useState(64.5);
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [goalType, setGoalType] = useState('maintain_weight');
  const [unitSystem, setUnitSystem] = useState('metric');
  const [dietaryTags, setDietaryTags] = useState(['Gluten-Free', 'High-Protein']);
  const [newTagInput, setNewTagInput] = useState('');
  const [showAddTag, setShowAddTag] = useState(false);

  // Nutrition Targets
  const [calories, setCalories] = useState(1850);
  const [proteinG, setProteinG] = useState(125);
  const [carbsG, setCarbsG] = useState(180);
  const [fatG, setFatG] = useState(60);
  const [waterMl, setWaterMl] = useState(2000);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        if (user && isSupabaseConfigured) {
          const [prof, goals] = await Promise.all([
            fetchUserProfile(user.id),
            fetchDailyGoals(user.id),
          ]);

          if (prof) {
            setDisplayName(prof.display_name || user.email?.split('@')[0] || 'User');
            if (prof.age) setAge(Number(prof.age));
            if (prof.height_cm) setHeightCm(Number(prof.height_cm));
            if (prof.current_weight_kg) setWeightKg(Number(prof.current_weight_kg));
            if (prof.activity_level) setActivityLevel(prof.activity_level);
            if (prof.goal_type) setGoalType(prof.goal_type);
            if (prof.unit_system) setUnitSystem(prof.unit_system);
            if (prof.dietary_tags) setDietaryTags(prof.dietary_tags);
          }

          if (goals) {
            setCalories(Number(goals.calorie_target));
            setProteinG(Number(goals.protein_target_g));
            setCarbsG(Number(goals.carbs_target_g));
            setFatG(Number(goals.fat_target_g));
            setWaterMl(Number(goals.water_target_ml));
          }
        } else {
          const [guestProf, guestGoals] = await Promise.all([
            getGuestProfile(),
            getGuestDailyGoals(),
          ]);

          if (guestProf) {
            setDisplayName(guestProf.display_name || 'Guest Explorer');
            setAge(guestProf.age || 28);
            setHeightCm(guestProf.height_cm || 170);
            setWeightKg(guestProf.current_weight_kg || 64.5);
            setActivityLevel(guestProf.activity_level || 'moderate');
            setGoalType(guestProf.goal_type || 'maintain_weight');
            setUnitSystem(guestProf.unit_system || 'metric');
            if (guestProf.dietary_tags) setDietaryTags(guestProf.dietary_tags);
          }

          if (guestGoals) {
            setCalories(Number(guestGoals.calorie_target));
            setProteinG(Number(guestGoals.protein_target_g));
            setCarbsG(Number(guestGoals.carbs_target_g));
            setFatG(Number(guestGoals.fat_target_g));
            setWaterMl(Number(guestGoals.water_target_ml));
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user, isSupabaseConfigured]);

  // Macro percentages calculation
  const macroDist = calculateMacroDistribution(proteinG, carbsG, fatG);

  // Automatically recalculate suggested realistic targets when user edits body metrics or objective
  const updateMetricsAndRecalculate = (updates) => {
    const newAge = updates.age !== undefined ? updates.age : age;
    const newHeight = updates.heightCm !== undefined ? updates.heightCm : heightCm;
    const newWeight = updates.weightKg !== undefined ? updates.weightKg : weightKg;
    const newActivity = updates.activityLevel !== undefined ? updates.activityLevel : activityLevel;
    const newGoal = updates.goalType !== undefined ? updates.goalType : goalType;

    if (updates.age !== undefined) setAge(newAge);
    if (updates.heightCm !== undefined) setHeightCm(newHeight);
    if (updates.weightKg !== undefined) setWeightKg(newWeight);
    if (updates.activityLevel !== undefined) setActivityLevel(newActivity);
    if (updates.goalType !== undefined) setGoalType(newGoal);

    if (newAge > 0 && newHeight > 0 && newWeight > 0) {
      const suggested = calculateSuggestedGoals({
        age: newAge,
        height_cm: newHeight,
        current_weight_kg: newWeight,
        activity_level: newActivity,
        goal_type: newGoal,
      });

      setCalories(suggested.calorie_target);
      setProteinG(suggested.protein_target_g);
      setCarbsG(suggested.carbs_target_g);
      setFatG(suggested.fat_target_g);
      setWaterMl(suggested.water_target_ml);
    }
  };

  // Auto-calculate suggested goals button using Mifflin-St Jeor formula
  const handleAutoSplit = () => {
    const suggested = calculateSuggestedGoals({
      age,
      height_cm: heightCm,
      current_weight_kg: weightKg,
      activity_level: activityLevel,
      goal_type: goalType,
    });

    setCalories(suggested.calorie_target);
    setProteinG(suggested.protein_target_g);
    setCarbsG(suggested.carbs_target_g);
    setFatG(suggested.fat_target_g);
    setWaterMl(suggested.water_target_ml);
    showToast('Suggested realistic targets applied based on your physical profile!', 'info');
  };

  // Stepper handlers: step calories up or down, rebalancing macros proportionally
  const handleCalorieStep = (delta) => {
    const newCal = Math.max(1200, Math.min(4500, calories + delta));
    setCalories(newCal);

    // Rebalance macronutrients realistically based on the new calorie target
    const proteinCalories = proteinG * 4;
    const fatCalories = Math.round(newCal * 0.25);
    const newFatG = Math.round(fatCalories / 9);
    const newCarbsG = Math.max(0, Math.round((newCal - proteinCalories - fatCalories) / 4));

    setFatG(newFatG);
    setCarbsG(newCarbsG);
  };

  // Add / Remove Dietary Tag
  const handleRemoveTag = (tag) => {
    setDietaryTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (newTagInput.trim() && !dietaryTags.includes(newTagInput.trim())) {
      setDietaryTags((prev) => [...prev, newTagInput.trim()]);
      setNewTagInput('');
      setShowAddTag(false);
    }
  };

  // Save changes
  const handleSave = async () => {
    setSaving(true);
    try {
      const profileData = {
        display_name: displayName,
        age: Number(age),
        height_cm: Number(heightCm),
        current_weight_kg: Number(weightKg),
        activity_level: activityLevel,
        goal_type: goalType,
        unit_system: unitSystem,
        dietary_tags: dietaryTags,
      };

      const goalsData = {
        calorie_target: Number(calories),
        protein_target_g: Number(proteinG),
        carbs_target_g: Number(carbsG),
        fat_target_g: Number(fatG),
        water_target_ml: Number(waterMl),
      };

      if (user && isSupabaseConfigured) {
        await Promise.all([
          updateUserProfile(user.id, profileData),
          upsertDailyGoals(user.id, goalsData),
        ]);
        // Mirror to guest profile as secondary fallback
        await Promise.all([
          saveGuestProfile(profileData),
          saveGuestDailyGoals(goalsData),
        ]).catch(() => {});
      } else {
        await Promise.all([
          saveGuestProfile(profileData),
          saveGuestDailyGoals(goalsData),
        ]);
      }

      showToast('Profile and nutrition targets saved successfully!', 'success');
    } catch (err) {
      console.error(err);
      // Even if network or unexpected error, persist to local storage
      try {
        await Promise.all([
          saveGuestProfile({
            display_name: displayName,
            age: Number(age),
            height_cm: Number(heightCm),
            current_weight_kg: Number(weightKg),
            activity_level: activityLevel,
            goal_type: goalType,
            unit_system: unitSystem,
            dietary_tags: dietaryTags,
          }),
          saveGuestDailyGoals({
            calorie_target: Number(calories),
            protein_target_g: Number(proteinG),
            carbs_target_g: Number(carbsG),
            fat_target_g: Number(fatG),
            water_target_ml: Number(waterMl),
          }),
        ]);
        showToast('Profile and targets saved locally!', 'success');
      } catch (_) {
        showToast('Failed to save profile. Please try again.', 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  // Migrate Guest Data into Authenticated Account
  const handleMigrate = async () => {
    setMigrating(true);
    try {
      const res = await migrateGuestData();
      showToast(res.message || 'Guest data successfully migrated to your account!', 'success');
    } catch (err) {
      showToast(err.message || 'Migration failed', 'error');
    } finally {
      setMigrating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full pb-16">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#101E19]">Profile & Nutrition Goals</h1>
        <p className="text-xs sm:text-sm text-[#6C7A72] font-medium mt-0.5">
          Personalize your biometrics, daily macro ceiling, and dietary filters
        </p>
      </div>

      {/* Guest Mode Migration Prompt */}
      {isGuest && (
        <div className="bg-[#FFF7E8] rounded-3xl p-5 border border-[#FDBA8C] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFE2D1] flex items-center justify-center text-[#EA580C] shrink-0">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#101E19]">Sync Guest Diary to Cloud</h4>
              <p className="text-xs text-[#6C7A72]">
                Create a free account and safely transfer all your logged meals and progress.
              </p>
            </div>
          </div>

          <Link
            to="/register"
            className="px-5 py-2.5 rounded-full bg-[#006C4D] text-white text-xs font-bold hover:bg-[#004E37] transition-all shrink-0 text-center"
          >
            Create Account & Sync
          </Link>
        </div>
      )}

      {/* Authenticated user sync prompt if local guest data exists */}
      {user && !isGuest && (
        <div className="bg-[#E6F8EE] rounded-3xl p-4 border border-[#72FBC5]/40 flex items-center justify-between">
          <span className="text-xs text-[#006C4D] font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Cloud Account Connected ({user.email})
          </span>
          <button
            onClick={handleMigrate}
            disabled={migrating}
            className="text-xs font-bold text-[#006C4D] underline hover:no-underline"
          >
            {migrating ? 'Importing...' : 'Import any offline guest logs'}
          </button>
        </div>
      )}

      {/* Profile Identity Card */}
      <div className="bg-white rounded-3xl p-6 border border-[#D5E7DD] shadow-xs flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-[#E6F8EE] border-2 border-[#34C795] flex items-center justify-center text-[#006C4D] font-extrabold text-xl shrink-0">
          {displayName.substring(0, 2).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <label className="text-[10px] font-bold uppercase tracking-wider text-[#6C7A72]">
            Display Name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="text-lg font-bold text-[#101E19] w-full bg-transparent border-b border-[#D5E7DD] focus:outline-none focus:border-[#006C4D] pb-0.5"
          />
          <span className="text-xs text-[#6C7A72] block mt-1">
            {isGuest ? 'Local Guest Profile' : 'Verified Member'}
          </span>
        </div>
      </div>

      {/* Physical Biometrics Bento Grid */}
      <div className="bg-white rounded-3xl p-6 border border-[#D5E7DD] shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-[#101E19]">Body Metrics</h3>
          <div className="flex items-center gap-1 bg-[#F8FCF9] p-1 rounded-full border border-[#D5E7DD]">
            <button
              onClick={() => setUnitSystem('metric')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                unitSystem === 'metric' ? 'bg-[#101E19] text-white shadow-xs' : 'text-[#6C7A72]'
              }`}
            >
              Metric
            </button>
            <button
              onClick={() => setUnitSystem('imperial')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                unitSystem === 'imperial' ? 'bg-[#101E19] text-white shadow-xs' : 'text-[#6C7A72]'
              }`}
            >
              Imperial
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-[#F8FCF9] p-3.5 rounded-2xl border border-[#D5E7DD]">
            <span className="text-xs font-semibold text-[#6C7A72] block mb-1">Age</span>
            <div className="flex items-baseline gap-1">
              <input
                type="number"
                value={age}
                onChange={(e) => updateMetricsAndRecalculate({ age: Number(e.target.value) })}
                className="w-16 bg-transparent text-xl font-black text-[#101E19] focus:outline-none"
              />
              <span className="text-xs text-[#6C7A72]">yrs</span>
            </div>
          </div>

          <div className="bg-[#F8FCF9] p-3.5 rounded-2xl border border-[#D5E7DD]">
            <span className="text-xs font-semibold text-[#6C7A72] block mb-1">Height</span>
            <div className="flex items-baseline gap-1">
              <input
                type="number"
                value={heightCm}
                onChange={(e) => updateMetricsAndRecalculate({ heightCm: Number(e.target.value) })}
                className="w-16 bg-transparent text-xl font-black text-[#101E19] focus:outline-none"
              />
              <span className="text-xs text-[#6C7A72]">
                cm {unitSystem === 'imperial' ? `(${Math.floor(heightCm / 30.48)}'${Math.round((heightCm % 30.48) / 2.54)}")` : ''}
              </span>
            </div>
          </div>

          <div className="bg-[#F8FCF9] p-3.5 rounded-2xl border border-[#D5E7DD]">
            <span className="text-xs font-semibold text-[#6C7A72] block mb-1">Weight</span>
            <div className="flex items-baseline gap-1">
              <input
                type="number"
                step="0.1"
                value={weightKg}
                onChange={(e) => updateMetricsAndRecalculate({ weightKg: Number(e.target.value) })}
                className="w-20 bg-transparent text-xl font-black text-[#101E19] focus:outline-none"
              />
              <span className="text-xs text-[#6C7A72]">
                kg {unitSystem === 'imperial' ? `(${Math.round(weightKg * 2.20462)} lbs)` : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Goal & Activity Pickers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#6C7A72] mb-1.5 block">
              Primary Objective
            </label>
            <select
              value={goalType}
              onChange={(e) => updateMetricsAndRecalculate({ goalType: e.target.value })}
              className="w-full px-4 py-2.5 rounded-2xl bg-[#F8FCF9] border border-[#D5E7DD] text-xs sm:text-sm font-semibold text-[#101E19] focus:outline-none"
            >
              <option value="lose_weight">Sustainable Fat Loss</option>
              <option value="maintain_weight">Maintain Weight & Muscle</option>
              <option value="gain_weight">Lean Muscle Gain</option>
              <option value="improve_consistency">Improve Consistency</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#6C7A72] mb-1.5 block">
              Activity Level
            </label>
            <select
              value={activityLevel}
              onChange={(e) => updateMetricsAndRecalculate({ activityLevel: e.target.value })}
              className="w-full px-4 py-2.5 rounded-2xl bg-[#F8FCF9] border border-[#D5E7DD] text-xs sm:text-sm font-semibold text-[#101E19] focus:outline-none"
            >
              <option value="sedentary">Sedentary (Desk work)</option>
              <option value="light">Lightly Active (1-3 workouts/wk)</option>
              <option value="moderate">Moderately Active (3-5 workouts/wk)</option>
              <option value="active">Active (6-7 intense days)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Dietary Rules & Allergens Tags */}
      <div className="bg-white rounded-3xl p-6 border border-[#D5E7DD] shadow-xs flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-[#101E19]">Dietary Rules & Allergens</h3>
          <button
            onClick={() => setShowAddTag(!showAddTag)}
            className="text-xs font-bold text-[#006C4D] flex items-center gap-1 hover:underline"
          >
            <Plus className="w-3.5 h-3.5" /> Add Filter
          </button>
        </div>

        {/* Tags Container */}
        <div className="flex flex-wrap gap-2 pt-1">
          {dietaryTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#E6F8EE] text-[#006C4D] text-xs font-bold"
            >
              <span>{tag}</span>
              <button
                onClick={() => handleRemoveTag(tag)}
                className="hover:text-red-500 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>

        {/* Add Tag Drawer */}
        {showAddTag && (
          <form onSubmit={handleAddTag} className="flex items-center gap-2 mt-2 pt-2 border-t border-[#E0F2E8]">
            <input
              type="text"
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              placeholder="e.g. Nut-Free, Dairy-Free, Vegan..."
              className="flex-1 px-4 py-1.5 rounded-full bg-[#F8FCF9] border border-[#D5E7DD] text-xs focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-1.5 rounded-full bg-[#006C4D] text-white text-xs font-bold"
            >
              Add
            </button>
          </form>
        )}
      </div>

      {/* Daily Nutrition Targets & Live Macro Calculator */}
      <div className="bg-white rounded-3xl p-6 border border-[#D5E7DD] shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-[#101E19]">Daily Nutrition Targets</h3>
            <p className="text-xs text-[#6C7A72]">Fine-tune daily calories and macronutrient ceiling</p>
          </div>

          <button
            onClick={handleAutoSplit}
            className="text-xs font-bold text-[#225EAA] flex items-center gap-1 hover:underline bg-[#D6E3FF]/40 px-3 py-1.5 rounded-full"
          >
            <RefreshCw className="w-3 h-3" /> Auto-calculate
          </button>
        </div>

        {/* Calorie Stepper */}
        <div className="bg-[#E6F8EE] p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#006C4D] uppercase tracking-wider flex items-center gap-1">
              <Flame className="w-3.5 h-3.5" /> Daily Calorie Target
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-3xl font-black text-[#101E19]">{calories}</span>
              <span className="text-xs text-[#6C7A72] font-semibold">kcal / day</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCalorieStep(-50)}
              className="w-9 h-9 rounded-full bg-white text-[#101E19] font-bold text-base flex items-center justify-center shadow-xs active:scale-95 transition-transform"
            >
              -
            </button>
            <button
              onClick={() => handleCalorieStep(50)}
              className="w-9 h-9 rounded-full bg-[#006C4D] text-white font-bold text-base flex items-center justify-center shadow-xs active:scale-95 transition-transform"
            >
              +
            </button>
          </div>
        </div>

        {/* Macro Rows */}
        <div className="flex flex-col gap-3.5 pt-1">
          {/* Protein */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#34C795]" />
                <span className="font-bold text-[#101E19]">Protein</span>
                <span className="text-[#6C7A72] font-semibold">{macroDist.proteinPct}%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-[#101E19] text-sm">{proteinG}g</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setProteinG((p) => Math.max(20, p - 5))}
                    className="w-6 h-6 rounded-full bg-[#F8FCF9] border border-[#D5E7DD] font-bold text-xs"
                  >
                    -
                  </button>
                  <button
                    onClick={() => setProteinG((p) => p + 5)}
                    className="w-6 h-6 rounded-full bg-[#F8FCF9] border border-[#D5E7DD] font-bold text-xs"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            <div className="w-full h-2 rounded-full bg-[#E0F2E8] overflow-hidden">
              <div
                className="h-full bg-[#34C795] rounded-full transition-all"
                style={{ width: `${macroDist.proteinPct}%` }}
              />
            </div>
          </div>

          {/* Carbs */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#79ACFD]" />
                <span className="font-bold text-[#101E19]">Carbohydrates</span>
                <span className="text-[#6C7A72] font-semibold">{macroDist.carbsPct}%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-[#101E19] text-sm">{carbsG}g</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCarbsG((c) => Math.max(20, c - 5))}
                    className="w-6 h-6 rounded-full bg-[#F8FCF9] border border-[#D5E7DD] font-bold text-xs"
                  >
                    -
                  </button>
                  <button
                    onClick={() => setCarbsG((c) => c + 5)}
                    className="w-6 h-6 rounded-full bg-[#F8FCF9] border border-[#D5E7DD] font-bold text-xs"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            <div className="w-full h-2 rounded-full bg-[#E0F2E8] overflow-hidden">
              <div
                className="h-full bg-[#79ACFD] rounded-full transition-all"
                style={{ width: `${macroDist.carbsPct}%` }}
              />
            </div>
          </div>

          {/* Fat */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#CDA1E2]" />
                <span className="font-bold text-[#101E19]">Healthy Fats</span>
                <span className="text-[#6C7A72] font-semibold">{macroDist.fatPct}%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-[#101E19] text-sm">{fatG}g</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setFatG((f) => Math.max(10, f - 2))}
                    className="w-6 h-6 rounded-full bg-[#F8FCF9] border border-[#D5E7DD] font-bold text-xs"
                  >
                    -
                  </button>
                  <button
                    onClick={() => setFatG((f) => f + 2)}
                    className="w-6 h-6 rounded-full bg-[#F8FCF9] border border-[#D5E7DD] font-bold text-xs"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            <div className="w-full h-2 rounded-full bg-[#E0F2E8] overflow-hidden">
              <div
                className="h-full bg-[#CDA1E2] rounded-full transition-all"
                style={{ width: `${macroDist.fatPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Water Target Input */}
        <div className="pt-2 border-t border-[#E0F2E8] flex items-center justify-between">
          <span className="text-xs font-bold text-[#101E19] flex items-center gap-1.5">
            <Droplets className="w-4 h-4 text-[#225EAA]" /> Daily Water Goal
          </span>
          <div className="flex items-center gap-1">
            <input
              type="number"
              step="50"
              value={waterMl}
              onChange={(e) => setWaterMl(Number(e.target.value))}
              className="w-20 px-3 py-1 rounded-xl bg-[#F8FCF9] border border-[#D5E7DD] text-xs font-bold text-[#101E19] text-right"
            />
            <span className="text-xs text-[#6C7A72]">ml</span>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-4 rounded-full bg-[#006C4D] hover:bg-[#004E37] text-white font-extrabold text-sm shadow-xl shadow-[#006C4D]/25 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
      >
        <CheckCircle2 className="w-5 h-5 text-[#72FBC5]" />
        <span>{saving ? 'Saving...' : 'Save Profile & Targets'}</span>
      </button>
    </div>
  );
}

