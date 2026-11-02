import { RECIPES_DATA } from './recipeController.js';

/**
 * GET /api/coach/insights
 * Generates personalized nutritional recommendations based on user's actual intake and targets.
 * Distinguishes recorded data from suggested recommendations.
 */
export async function getCoachInsights(req, res) {
  try {
    const {
      caloriesConsumed = 0,
      calorieTarget = 2000,
      proteinConsumed = 0,
      proteinTarget = 75,
      carbsConsumed = 0,
      carbsTarget = 250,
      fatConsumed = 0,
      fatTarget = 65,
      waterConsumed = 0,
      waterTarget = 2500,
      dietaryPreference = 'all',
    } = req.body;

    const calRatio = calorieTarget > 0 ? caloriesConsumed / calorieTarget : 0;
    const proteinRatio = proteinTarget > 0 ? proteinConsumed / proteinTarget : 0;
    const waterRatio = waterTarget > 0 ? waterConsumed / waterTarget : 0;

    const insights = [];

    // 1. Calorie Balance Insight
    if (caloriesConsumed === 0) {
      insights.push({
        id: 'no-meals',
        type: 'info',
        title: 'Start Your Day Mindfully',
        message: "You haven't logged any meals yet today. Snap a photo of your breakfast or log it manually to get tailored insights.",
        icon: 'sparkles',
      });
    } else if (calRatio < 0.6) {
      insights.push({
        id: 'cal-fuel',
        type: 'info',
        title: 'Calorie Fuel On Track',
        message: `You've consumed ${caloriesConsumed} Cal (${Math.round(calRatio * 100)}% of your ${calorieTarget} Cal target). You have plenty of room for a wholesome, nutrient-dense meal.`,
        icon: 'apple',
      });
    } else if (calRatio >= 0.9 && calRatio <= 1.05) {
      insights.push({
        id: 'cal-balanced',
        type: 'success',
        title: 'Calorie Target Hit',
        message: `Outstanding! You are right within your sweet spot (${caloriesConsumed} of ${calorieTarget} Cal). Great consistency today!`,
        icon: 'check',
      });
    } else if (calRatio > 1.05) {
      const overBy = Math.round(caloriesConsumed - calorieTarget);
      insights.push({
        id: 'cal-over',
        type: 'warning',
        title: 'Slightly Over Calorie Target',
        message: `You are ${overBy} Cal over your target. Focus on gentle movement (like an evening walk) and hydrate well.`,
        icon: 'flame',
      });
    }

    // 2. Protein Intake Insight
    if (caloriesConsumed > 0 && proteinRatio < 0.65) {
      const proteinRemaining = Math.max(0, Math.round(proteinTarget - proteinConsumed));
      insights.push({
        id: 'protein-boost',
        type: 'recommendation',
        title: 'Protein Opportunity',
        message: `Protein is currently at ${Math.round(proteinConsumed)}g (${proteinRemaining}g below your ${proteinTarget}g target). Consider pairing your next meal with paneer, tofu, eggs, or lentils.`,
        icon: 'dumbbell',
      });
    } else if (proteinRatio >= 0.9) {
      insights.push({
        id: 'protein-solid',
        type: 'success',
        title: 'Protein Goal Reached',
        message: `Superb! You reached ${Math.round(proteinConsumed)}g of protein today, supporting muscle recovery and satiety.`,
        icon: 'award',
      });
    }

    // 3. Hydration Insight
    if (waterRatio < 0.5) {
      const waterRemaining = Math.max(0, waterTarget - waterConsumed);
      insights.push({
        id: 'water-reminder',
        type: 'warning',
        title: 'Hydration Check-in',
        message: `You've logged ${waterConsumed}ml of water today (${waterRemaining}ml remaining). Grab a fresh glass to maintain energy and mental clarity.`,
        icon: 'droplet',
      });
    }

    // 4. Targeted Recipe Recommendation based on current deficit
    let matchingRecipes = RECIPES_DATA;
    if (dietaryPreference && dietaryPreference !== 'all') {
      matchingRecipes = matchingRecipes.filter(r =>
        r.dietaryTags.some(t => t.toLowerCase() === dietaryPreference.toLowerCase())
      );
    }
    // Pick highest protein or lighter recipe depending on need
    const recommendedRecipe = proteinRatio < 0.7 
      ? matchingRecipes.sort((a, b) => b.proteinPerServing - a.proteinPerServing)[0]
      : matchingRecipes[0];

    return res.json({
      success: true,
      insights,
      recommendedRecipe: recommendedRecipe || RECIPES_DATA[0],
      disclaimer: 'Nav AI suggestions are nutritional guidance estimates for informational purposes, not medical advice.',
    });
  } catch (err) {
    return res.status(500).json({ error: err.message, code: 'COACH_ERROR' });
  }
}

