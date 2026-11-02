import express from 'express';
import multer from 'multer';
import { analyzeMealImage, getNutritionCoachAdvice } from '../services/geminiService.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Multer memory storage configuration with strict limits
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB max
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
    if (allowed.includes(file.mimetype) || file.originalname.match(/\.(jpg|jpeg|png|webp|heic)$/i)) {
      cb(null, true);
    } else {
      const err = new Error('Invalid file type. Please upload a JPEG, PNG, or WebP image.');
      err.status = 400;
      cb(err, false);
    }
  },
});

// Simple IP-based rate limiting map for guest requests (30 requests / hr)
const guestRateLimits = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX_GUEST = 30;

function checkRateLimit(req, res, next) {
  if (req.user) {
    // Authenticated users get higher allowance
    return next();
  }

  const ip = req.ip || req.connection.remoteAddress || 'unknown-client';
  const now = Date.now();
  const clientData = guestRateLimits.get(ip) || { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };

  if (now > clientData.resetAt) {
    clientData.count = 1;
    clientData.resetAt = now + RATE_LIMIT_WINDOW_MS;
  } else {
    clientData.count += 1;
  }

  guestRateLimits.set(ip, clientData);

  if (clientData.count > RATE_LIMIT_MAX_GUEST) {
    return res.status(429).json({
      error: 'Too Many Requests',
      message: 'Guest rate limit reached (30 scans per hour). Sign in to continue scanning.',
    });
  }

  next();
}

/**
 * POST /api/ai/analyze-meal
 * Primary feature: Accepts meal photo, validates file, executes Gemini vision model,
 * and matches foods to verified reference database.
 */
router.post('/analyze-meal', optionalAuth, checkRateLimit, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'No image file uploaded. Please provide a photo of your meal.',
      });
    }

    const mealCategory = req.body.meal_category || 'lunch';
    const notes = req.body.notes || '';

    const result = await analyzeMealImage(
      req.file.buffer,
      req.file.mimetype,
      mealCategory,
      notes
    );

    res.json(result);
  } catch (err) {
    if (err.missingApiKey) {
      return res.status(503).json({
        error: 'Service Configuration Required',
        message: 'Google Gemini API key has not been configured in server/.env.',
        missingApiKey: true,
      });
    }
    next(err);
  }
});

/**
 * POST /api/ai/coach
 * Provides personalized nutritional guidance based on real user logs
 */
router.post('/coach', optionalAuth, async (req, res, next) => {
  try {
    const userContext = req.body || {};
    const advice = await getNutritionCoachAdvice(userContext);
    res.json(advice);
  } catch (err) {
    next(err);
  }
});

export default router;

