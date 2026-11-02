import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { config } from './config/env.js';
import { requireAuth, optionalAuth } from './middleware/auth.js';
import { analyzeMeal, uploadMealMiddleware } from './controllers/aiController.js';
import { getFoodList, getFoodById } from './controllers/foodController.js';
import { getRecipes, getRecipeById } from './controllers/recipeController.js';
import { getMeals, createMeal, deleteMeal } from './controllers/mealController.js';
import { importGuestData } from './controllers/guestController.js';
import { getCoachInsights } from './controllers/coachController.js';

const app = express();

// Security & CORS configuration
const allowedOrigins = [
  config.clientOrigin,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Dev flexible fallback
    },
    credentials: true,
  })
);

// Standard JSON parser for non-multipart requests
app.use(express.json({ limit: '2mb' }));

// Rate Limiters
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.', code: 'RATE_LIMIT_EXCEEDED' },
});
app.use('/api/', generalLimiter);

// Specific stricter rate limiter for Gemini AI scanning
const aiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // 30 analyses per 15 minutes
  message: {
    error: 'AI scan rate limit reached for this IP. Please wait a few minutes before scanning again.',
    code: 'AI_RATE_LIMIT',
  },
});

// ==============================================================================
// ROUTES
// ==============================================================================

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      supabase: config.supabase.isConfigured ? 'configured' : 'unconfigured (guest mode active)',
      gemini: config.gemini.isConfigured ? 'configured' : 'unconfigured (API key needed in .env)',
    },
    environment: config.nodeEnv,
  });
});

// AI Meal Scanner
app.post(
  '/api/ai/analyze-meal',
  aiRateLimiter,
  optionalAuth,
  uploadMealMiddleware,
  analyzeMeal
);

// Food Reference Database
app.get('/api/foods/search', getFoodList);
app.get('/api/foods/:id', getFoodById);

// Recipes Directory & Servings
app.get('/api/recipes', getRecipes);
app.get('/api/recipes/:id', getRecipeById);

// Meals (Authenticated / Guest Helper)
app.get('/api/meals', optionalAuth, getMeals);
app.post('/api/meals', optionalAuth, createMeal);
app.delete('/api/meals/:id', requireAuth, deleteMeal);

// Guest Data Migration
app.post('/api/guest/import', requireAuth, importGuestData);

// AI Nutrition Coach Insights
app.post('/api/coach/insights', optionalAuth, getCoachInsights);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found', code: 'NOT_FOUND' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'An unexpected internal server error occurred.',
    code: err.code || 'INTERNAL_ERROR',
  });
});

// Start listening
app.listen(config.port, () => {
  console.log(`🚀 Nav AI Server running on port ${config.port} (${config.nodeEnv})`);
  console.log(`📡 Gemini Vision: ${config.gemini.isConfigured ? 'Active' : 'Unconfigured (Add GEMINI_API_KEY in .env)'}`);
  console.log(`🔐 Supabase Auth: ${config.supabase.isConfigured ? 'Active' : 'Unconfigured (Guest mode active)'}`);
});

