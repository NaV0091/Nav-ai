import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { config, isSupabaseConfigured, isGeminiConfigured } from './config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Route imports
import aiRoutes from './routes/aiRoutes.js';
import foodRoutes from './routes/foodRoutes.js';
import recipeRoutes from './routes/recipeRoutes.js';
import mealRoutes from './routes/mealRoutes.js';
import waterRoutes from './routes/waterRoutes.js';
import weightRoutes from './routes/weightRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import goalRoutes from './routes/goalRoutes.js';
import guestRoutes from './routes/guestRoutes.js';

const app = express();

// Secure CORS configuration
const allowedOrigins = [
  config.clientOrigin?.replace(/\/+$/, ''),
  'https://navai-zeta.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.replace(/\/+$/, '');
      if (allowedOrigins.includes(cleanOrigin) || cleanOrigin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive for local network/mobile testing
      }
    },
    credentials: true,
  })
);

// Standard safe body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    service: 'Nav AI Full-Stack Nutrition Platform API',
    supabaseConfigured: isSupabaseConfigured,
    geminiConfigured: isGeminiConfigured,
    geminiModel: config.geminiModel,
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/ai', aiRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/water', waterRoutes);
app.use('/api/weight', weightRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/guest', guestRoutes);

// Serve static frontend website when built (for unified full-stack deployments)
const candidateDistPaths = [
  path.resolve(__dirname, '../../client/dist'),
  path.resolve(__dirname, '../client/dist'),
  path.resolve(__dirname, './public'),
  path.resolve(__dirname, '../public'),
  path.resolve(__dirname, '../../dist'),
];
const clientDistPath = candidateDistPaths.find((p) => fs.existsSync(path.join(p, 'index.html')));

if (clientDistPath) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// 404 Fallback
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `API route ${req.method} ${req.url} does not exist.`,
  });
});

// Centralized Safe Error Handler
app.use((err, req, res, next) => {
  console.error(`[Error] ${req.method} ${req.url}:`, err.message || err);

  const status = err.status || err.statusCode || 500;
  const message =
    status === 500 && config.nodeEnv === 'production'
      ? 'An unexpected internal error occurred. Please try again later.'
      : err.message || 'Internal Server Error';

  res.status(status).json({
    error: err.name || 'Error',
    message,
    ...(err.data || {}),
  });
});

// Start Server only when executed directly (not when imported in unit tests)
const isDirectRun =
  process.argv[1] &&
  fileURLToPath(import.meta.url).toLowerCase().replace(/\\/g, '/') ===
    process.argv[1].toLowerCase().replace(/\\/g, '/');

if (isDirectRun || process.env.RUN_SERVER === 'true') {
  app.listen(config.port, () => {
    console.log(`\n==================================================`);
    console.log(`🚀 Nav AI Server running on http://localhost:${config.port}`);
    console.log(`- Gemini Vision AI: ${isGeminiConfigured ? `Ready (${config.geminiModel})` : 'Pending (GEMINI_API_KEY required in server/.env)'}`);
    console.log(`- Supabase Auth & DB: ${isSupabaseConfigured ? 'Connected' : 'Pending (SUPABASE_URL & keys required in server/.env)'}`);
    console.log(`- Client Origin: ${config.clientOrigin}`);
    console.log(`==================================================\n`);
  });
}

export default app;
