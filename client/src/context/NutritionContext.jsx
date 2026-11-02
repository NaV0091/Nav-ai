import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext.jsx';
import { guestStorage } from '../services/guestStorage.js';
import { apiClient } from '../services/apiClient.js';
import { supabase } from '../services/supabaseClient.js';
import {
  calculateDailyCalorieBalance,
  calculateMacroProgress,
} from '../services/nutritionEngine.js';

const NutritionContext = createContext(null);

export function NutritionProvider({ children }) {
  const { user, isGuest } = useAuth();

  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [meals, setMeals] = useState([]);
  const [waterLogs, setWaterLogs] = useState([]);
  const [weightLogs, setWeightLogs] = useState([]);
  const [goals, setGoals] = useState({
    calorieTarget: 2000,
    proteinTargetG: 75,
    carbsTargetG: 250,
    fatTargetG: 65,
    waterTargetMl: 2500,
  });
  const [profile, setProfile] = useState({
    displayName: 'Wellness Explorer',
    age: 26,
    heightCm: 172,
    currentWeightKg: 68,
    activityLevel: 'moderate',
    goalType: 'maintain',
    dietaryPreference: 'all',
  });
  const [loading, setLoading] = useState(true);

  // Load data for selectedDate based on Guest vs Authenticated mode
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (isGuest || !user || !supabase) {
        // GUEST MODE: IndexedDB
        const [p, g, m, w, wt] = await Promise.all([
          guestStorage.getProfile(),
          guestStorage.getDailyGoals(selectedDate),
          guestStorage.getMealsByDate(selectedDate),
          guestStorage.getWaterLogsByDate(selectedDate),
          guestStorage.getWeightLogs(),
        ]);
        if (p) setProfile(p);
        if (g) setGoals(g);
        setMeals(m || []);
        setWaterLogs(w || []);
        setWeightLogs(wt || []);
      } else {
        // AUTHENTICATED MODE: Supabase
        const [profRes, goalsRes, mealsRes, waterRes, weightRes] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
          supabase.from('daily_goals').select('*').eq('user_id', user.id).eq('target_date', selectedDate).maybeSingle(),
          supabase.from('meals').select('*, meal_items(*)').eq('user_id', user.id).eq('meal_date', selectedDate).order('created_at', { ascending: true }),
          supabase.from('water_logs').select('*').eq('user_id', user.id).gte('logged_at', `${selectedDate}T00:00:00Z`).lte('logged_at', `${selectedDate}T23:59:59Z`),
          supabase.from('weight_logs').select('*').eq('user_id', user.id).order('recorded_at', { ascending: true }),
        ]);

        if (profRes.data) {
          setProfile({
            displayName: profRes.data.display_name || user.email?.split('@')[0],
            age: profRes.data.age || 26,
            heightCm: profRes.data.height_cm || 172,
            currentWeightKg: profRes.data.current_weight_kg || 68,
            activityLevel: profRes.data.activity_level || 'moderate',
            goalType: profRes.data.goal_type || 'maintain',
            dietaryPreference: profRes.data.dietary_preference || 'all',
          });
        }

        if (goalsRes.data) {
          setGoals({
            calorieTarget: goalsRes.data.calorie_target,
            proteinTargetG: Number(goalsRes.data.protein_target_g),
            carbsTargetG: Number(goalsRes.data.carbs_target_g),
            fatTargetG: Number(goalsRes.data.fat_target_g),
            waterTargetMl: goalsRes.data.water_target_ml,
          });
        }

        // Normalize meal rows
        const normalizedMeals = (mealsRes.data || []).map(m => ({
          id: m.id,
          name: m.name,
          mealType: m.meal_type,
          mealDate: m.meal_date,
          notes: m.notes,
          imagePath: m.image_path,
          totalCalories: m.total_calories,
          totalProtein: Number(m.total_protein_g),
          totalCarbs: Number(m.total_carbs_g),
          totalFat: Number(m.total_fat_g),
          nutritionIsEstimated: m.nutrition_is_estimated,
          items: (m.meal_items || []).map(item => ({
            id: item.id,
            name: item.name,
            quantity: Number(item.quantity),
            unit: item.unit,
            calories: Number(item.calories),
            protein: Number(item.protein_g),
            carbs: Number(item.carbs_g),
            fat: Number(item.fat_g),
            nutritionSource: item.nutrition_source,
            isEstimated: item.is_estimated,
          })),
        }));

        setMeals(normalizedMeals);
        setWaterLogs(waterRes.data || []);
        setWeightLogs(weightRes.data || []);
      }
    } catch (err) {
      console.error('Failed to load nutrition records:', err);
    } finally {
      setLoading(false);
    }
  }, [isGuest, user, selectedDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // -------------------------------------------------------------
  // MUTATIONS
  // -------------------------------------------------------------
  const addMeal = async (mealPayload) => {
    const mealWithDate = {
      ...mealPayload,
      mealDate: mealPayload.mealDate || selectedDate,
    };

    if (isGuest || !user || !supabase) {
      const saved = await guestStorage.saveMeal(mealWithDate);
      if (saved.mealDate === selectedDate) {
        setMeals(prev => [...prev, saved]);
      }
      return saved;
    } else {
      const result = await apiClient.saveMeal(mealWithDate);
      await loadData();
      return result.meal;
    }
  };

  const deleteMeal = async (mealId) => {
    if (isGuest || !user || !supabase) {
      await guestStorage.deleteMeal(mealId);
      setMeals(prev => prev.filter(m => m.id !== mealId));
    } else {
      await apiClient.deleteMeal(mealId);
      setMeals(prev => prev.filter(m => m.id !== mealId));
    }
  };

  const addWater = async (quantityMl) => {
    const qty = parseInt(quantityMl, 10);
    if (qty <= 0) return;

    if (isGuest || !user || !supabase) {
      const log = await guestStorage.addWaterLog(qty, selectedDate);
      setWaterLogs(prev => [...prev, log]);
    } else {
      const { data, error } = await supabase.from('water_logs').insert({
        user_id: user.id,
        quantity_ml: qty,
      }).select().single();
      if (!error && data) {
        setWaterLogs(prev => [...prev, data]);
      }
    }
  };

  const deleteWater = async (logId) => {
    if (isGuest || !user || !supabase) {
      await guestStorage.deleteWaterLog(logId);
      setWaterLogs(prev => prev.filter(w => w.id !== logId));
    } else {
      await supabase.from('water_logs').delete().eq('id', logId).eq('user_id', user.id);
      setWaterLogs(prev => prev.filter(w => w.id !== logId));
    }
  };

  const addWeight = async (weightKg, recordedAt = null, notes = '') => {
    const date = recordedAt || selectedDate;
    if (isGuest || !user || !supabase) {
      const entry = await guestStorage.addWeightLog(weightKg, date, notes);
      setWeightLogs(prev => [...prev.filter(w => w.id !== entry.id), entry].sort((a,b) => new Date(a.recordedAt) - new Date(b.recordedAt)));
      // Also update profile currentWeightKg
      const updatedProfile = { ...profile, currentWeightKg: parseFloat(weightKg) };
      await guestStorage.saveProfile(updatedProfile);
      setProfile(updatedProfile);
    } else {
      const { data, error } = await supabase.from('weight_logs').insert({
        user_id: user.id,
        weight_kg: parseFloat(weightKg),
        recorded_at: date,
        notes,
      }).select().single();

      if (!error && data) {
        setWeightLogs(prev => [...prev, data].sort((a,b) => new Date(a.recorded_at) - new Date(b.recorded_at)));
        await supabase.from('profiles').update({ current_weight_kg: parseFloat(weightKg) }).eq('id', user.id);
        setProfile(prev => ({ ...prev, currentWeightKg: parseFloat(weightKg) }));
      }
    }
  };

  const updateDailyGoals = async (newGoals) => {
    const updated = { ...goals, ...newGoals, targetDate: selectedDate };
    if (isGuest || !user || !supabase) {
      await guestStorage.saveDailyGoals(updated);
      setGoals(updated);
    } else {
      await supabase.from('daily_goals').upsert({
        user_id: user.id,
        target_date: selectedDate,
        calorie_target: updated.calorieTarget,
        protein_target_g: updated.proteinTargetG,
        carbs_target_g: updated.carbsTargetG,
        fat_target_g: updated.fatTargetG,
        water_target_ml: updated.waterTargetMl,
      });
      setGoals(updated);
    }
  };

  const updateProfile = async (newProfile) => {
    const updated = { ...profile, ...newProfile };
    if (isGuest || !user || !supabase) {
      await guestStorage.saveProfile(updated);
      setProfile(updated);
    } else {
      await supabase.from('profiles').upsert({
        id: user.id,
        display_name: updated.displayName,
        age: updated.age,
        height_cm: updated.heightCm,
        current_weight_kg: updated.currentWeightKg,
        activity_level: updated.activityLevel,
        goal_type: updated.goalType,
        dietary_preference: updated.dietaryPreference,
      });
      setProfile(updated);
    }
  };

  const importGuestHistory = async () => {
    if (!user) throw new Error('You must be signed in to import local data.');
    const fullData = await guestStorage.exportAllData();
    const result = await apiClient.importGuestData(fullData);
    await loadData();
    return result;
  };

  // -------------------------------------------------------------
  // AGGREGATED DAILY NUTRITION METRICS
  // -------------------------------------------------------------
  const consumedCalories = meals.reduce((sum, m) => sum + (m.totalCalories || 0), 0);
  const consumedProtein = Number(meals.reduce((sum, m) => sum + (m.totalProtein || 0), 0).toFixed(1));
  const consumedCarbs = Number(meals.reduce((sum, m) => sum + (m.totalCarbs || 0), 0).toFixed(1));
  const consumedFat = Number(meals.reduce((sum, m) => sum + (m.totalFat || 0), 0).toFixed(1));

  const consumedWater = waterLogs.reduce((sum, w) => sum + (w.quantity_ml || w.quantityMl || 0), 0);

  const calorieBalance = calculateDailyCalorieBalance(consumedCalories, goals.calorieTarget);
  const proteinProgress = calculateMacroProgress(consumedProtein, goals.proteinTargetG);
  const carbsProgress = calculateMacroProgress(consumedCarbs, goals.carbsTargetG);
  const fatProgress = calculateMacroProgress(consumedFat, goals.fatTargetG);
  const waterProgress = {
    consumed: consumedWater,
    target: goals.waterTargetMl,
    percent: Math.min(100, Math.round((consumedWater / goals.waterTargetMl) * 100)),
    remaining: Math.max(0, goals.waterTargetMl - consumedWater),
  };

  const value = {
    selectedDate,
    setSelectedDate,
    meals,
    waterLogs,
    weightLogs,
    goals,
    profile,
    loading,
    // Metrics
    consumedCalories,
    consumedProtein,
    consumedCarbs,
    consumedFat,
    consumedWater,
    calorieBalance,
    proteinProgress,
    carbsProgress,
    fatProgress,
    waterProgress,
    // Methods
    addMeal,
    deleteMeal,
    addWater,
    deleteWater,
    addWeight,
    updateDailyGoals,
    updateProfile,
    importGuestHistory,
    refreshData: loadData,
  };

  return <NutritionContext.Provider value={value}>{children}</NutritionContext.Provider>;
}

export function useNutrition() {
  const context = useContext(NutritionContext);
  if (!context) {
    throw new Error('useNutrition must be used within a NutritionProvider');
  }
  return context;
}

