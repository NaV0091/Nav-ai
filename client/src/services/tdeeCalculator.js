/**
 * Transparent TDEE and Macro Target Calculator
 * Uses the Mifflin-St Jeor equation with standard physical activity multipliers.
 * Non-aggressive targets for sustainable wellness.
 */

export const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2, // Desk job, little to no exercise
  light: 1.375, // 1-3 days of light exercise/walking
  moderate: 1.55, // 3-5 days of moderate exercise
  active: 1.725, // 6-7 days of hard exercise
  very_active: 1.9, // Daily intense physical labor or sports
};

export function calculateBMR(weightKg, heightCm, age, gender = 'neutral') {
  const w = parseFloat(weightKg) || 70;
  const h = parseFloat(heightCm) || 170;
  const a = parseInt(age, 10) || 28;

  // Mifflin-St Jeor formula
  const base = 10 * w + 6.25 * h - 5 * a;
  if (gender === 'male') return Math.round(base + 5);
  if (gender === 'female') return Math.round(base - 161);
  return Math.round(base - 78); // Balanced average
}

export function calculateTDEE(weightKg, heightCm, age, activityLevel = 'moderate', goalType = 'maintain') {
  const bmr = calculateBMR(weightKg, heightCm, age);
  const factor = ACTIVITY_MULTIPLIERS[activityLevel] || 1.55;
  const maintenance = Math.round(bmr * factor);

  let targetCalories = maintenance;
  if (goalType === 'lose') {
    // Healthy, gentle deficit (15%, ~300-500 cal max)
    targetCalories = Math.max(1200, Math.round(maintenance * 0.85));
  } else if (goalType === 'gain') {
    // Lean surplus (+10%)
    targetCalories = Math.round(maintenance * 1.1);
  }

  // Macronutrient split: 25% Protein, 45% Carbs, 30% Healthy Fats
  const proteinCalories = targetCalories * 0.25;
  const carbsCalories = targetCalories * 0.45;
  const fatCalories = targetCalories * 0.30;

  const proteinG = Math.round(proteinCalories / 4);
  const carbsG = Math.round(carbsCalories / 4);
  const fatG = Math.round(fatCalories / 9);

  // Water target: ~35ml per kg body weight
  const waterTargetMl = Math.round(Math.max(2000, Math.min(4500, (parseFloat(weightKg) || 70) * 35)));

  return {
    bmr,
    maintenance,
    calorieTarget: targetCalories,
    proteinTargetG: proteinG,
    carbsTargetG: carbsG,
    fatTargetG: fatG,
    waterTargetMl,
  };
}

