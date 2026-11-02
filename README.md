# Nav AI — Full-Stack AI Nutrition & Fitness Platform

Nav AI is an AI-powered nutrition tracking and fitness companion built for everyday mindful wellness. Users can photograph meals, identify foods using Google Gemini vision models, estimate portions, track daily calories and macronutrients, record manual foods, browse scalable recipes, log hydration and body weight, and receive personalized nutrition guidance.

---

## 🌟 Key Differentiators & Highlights

1. **AI Meal Vision Scanner:**
   - Snap or upload food photographs on desktop, tablet, or mobile.
   - Powered by the official Google GenAI SDK (`@google/genai`) using `gemini-2.5-flash`.
   - Structured JSON response validated with Zod, cross-referenced against USDA FoodData Central and Indian food databases.
   - Refine portion weights with interactive steppers (`[-10g] [150g] [+10g]`) with dynamic macro recalculation.

2. **First-Class Guest Mode with IndexedDB:**
   - 1-click instant access without forced registration.
   - Persists all logged meals, daily goals, water entries, and weight logs in browser IndexedDB.
   - Survives page refreshes and browser restarts.
   - Safe, retryable 1-click migration into an authenticated Supabase account upon signup.

3. **Tactile Pastel Design System (Stitch Design Integration):**
   - Soft mint, lavender, and sky-blue botanical washes on crisp white pill cards.
   - Circular radial calorie gauge with active arc, eaten/burned readouts, and remaining calories.
   - Horizontal date ribbon for 7-day tracking.
   - Responsive multi-column layout on desktop, fixed bottom navigation bar with floating camera action button on mobile.

4. **Interactive Scalable Recipes:**
   - Curated high-protein, vegetarian, gluten-free, and quick recipes (Paneer Bhurji, Dal Tadka, Chickpea Salad, Overnight Oats, Salmon, Fajitas).
   - Dynamic serving size adjuster (`[-] [2 Servings] [+]`) that recalculates ingredient quantities and batch nutrition.
   - 1-click "Log to Diary" action.

5. **Progress & Analytics:**
   - Real interactive charts powered by Recharts (Calorie Area chart, Macro Multi-Bar chart, Weight trend).
   - 7-day, 30-day, and 90-day timeframes.
   - Goal consistency metrics and weekly averages.

6. **Centralized Nutrition Engine:**
   - Shared between frontend and backend.
   - Accurate per-100g and per-serving conversions, calorie remainders, macro percentages, and Mifflin-St Jeor BMR/TDEE goal estimations.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite 8, JavaScript (ES modules & JSX), Tailwind CSS v4, React Router v7, Lucide React, Recharts, IndexedDB |
| **Backend** | Node.js (v20+), Express.js (ES modules), Zod, Multer, `@google/genai` (Google GenAI JavaScript SDK) |
| **Database & Auth** | Supabase Auth, PostgreSQL, Row Level Security (RLS), Supabase Storage |
| **Testing** | Node.js native test runner (`node:test`, `node:assert`), Vite production build runner |

---

## 📁 Project Folder Structure

```
nav-ai/
├── client/                          # React + Vite Frontend
│   ├── public/                      # Static assets & favicons
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.jsx       # Responsive desktop header & mobile bottom bar
│   │   │   │   └── AppLayout.jsx    # Main layout shell with guest indicator
│   │   │   └── AICoachModal.jsx     # Conversational AI coach modal
│   │   ├── context/
│   │   │   ├── AuthContext.jsx      # Supabase auth + Guest mode state
│   │   │   └── ToastContext.jsx     # Floating notification toasts
│   │   ├── pages/
│   │   │   ├── WelcomePage.jsx      # Landing screen with 1-click guest entry
│   │   │   ├── LoginPage.jsx        # Email/password & Google sign-in
│   │   │   ├── RegisterPage.jsx     # Account creation form
│   │   │   ├── AuthCallbackPage.jsx # OAuth redirect handler
│   │   │   ├── DashboardPage.jsx    # Hero calorie gauge, macros, date ribbon, meals
│   │   │   ├── ScannerPage.jsx      # Camera capture & file upload
│   │   │   ├── ScanResultsPage.jsx  # Portion refinement, macro breakdown, confirm
│   │   │   ├── DiaryPage.jsx        # Food diary with date navigation & manual food search
│   │   │   ├── RecipesPage.jsx      # Recipe directory with search & filters
│   │   │   ├── RecipeDetailPage.jsx # Serving adjustment stepper & instructions
│   │   │   ├── ProgressPage.jsx     # Recharts analytics (7d/30d/90d) & weight logs
│   │   │   ├── ProfilePage.jsx      # Body metrics, primary goals, live macro split
│   │   │   └── SettingsPage.jsx     # Data backup, IndexedDB clear, health checks
│   │   ├── services/
│   │   │   ├── apiClient.js         # Fetch client for Express backend
│   │   │   ├── guestStorage.js      # IndexedDB guest persistence service
│   │   │   ├── nutritionEngine.js   # Centralized nutrition calculation library
│   │   │   └── supabaseClient.js    # Supabase browser SDK client
│   │   ├── App.jsx                  # React Router routes
│   │   ├── index.css                # Tailwind CSS v4 design tokens
│   │   └── main.jsx                 # Client entry point
│   ├── .env.example                 # Frontend environment template
│   ├── package.json
│   └── vite.config.js
├── server/                          # Express.js Backend API
│   ├── src/
│   │   ├── config/
│   │   │   └── env.js               # Environment variables validation
│   │   ├── data/
│   │   │   └── nutritionDatabase.js # USDA & Indian food composition dataset
│   │   ├── middleware/
│   │   │   └── authMiddleware.js    # Supabase token validation & optional guest auth
│   │   ├── routes/
│   │   │   ├── aiRoutes.js          # /api/ai/analyze-meal & /api/ai/coach
│   │   │   ├── foodRoutes.js        # /api/foods/search & /api/foods/:id
│   │   │   ├── recipeRoutes.js      # /api/recipes & /api/recipes/:id
│   │   │   ├── mealRoutes.js        # /api/meals CRUD
│   │   │   ├── waterRoutes.js       # /api/water CRUD
│   │   │   ├── weightRoutes.js      # /api/weight CRUD
│   │   │   ├── profileRoutes.js     # /api/profile
│   │   │   ├── goalRoutes.js        # /api/goals
│   │   │   └── guestRoutes.js       # /api/guest/import batch migration
│   │   ├── services/
│   │   │   ├── geminiService.js     # Google GenAI SDK integration & Zod validation
│   │   │   └── nutritionEngine.js   # Centralized backend nutrition calculation
│   │   └── server.js                # Express app entry & HTTP listener
│   ├── test/
│   │   ├── api.test.js              # API route & schema tests
│   │   └── nutrition.test.js        # Nutrition engine unit tests
│   ├── .env.example                 # Backend environment template
│   └── package.json
├── supabase/
│   ├── migrations/
│   │   └── 20261102000000_init_nav_ai.sql # Complete PostgreSQL schema, triggers & RLS
│   ├── seed.sql                     # Verified food database and recipe seeds
│   └── storage.md                   # Private storage bucket configuration guide
├── .gitignore
├── package.json                     # Root orchestrator scripts
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v20 or higher (`node -v`)
- **npm**: v9 or higher (`npm -v`)

### 1. Installation
Install dependencies in both client and server:
```bash
# In the project root:
npm --prefix client install
npm --prefix server install
```

### 2. Local Environment Setup

#### Client Configuration
Copy the template in `client/`:
```bash
cp client/.env.example client/.env
```
Default `client/.env`:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-publishable-key
VITE_API_BASE_URL=http://localhost:5000
```
> **Note on Guest Mode:** You can start and use Nav AI completely in **Guest Mode** even if Supabase keys are empty!

#### Server Configuration
Copy the template in `server/`:
```bash
cp server/.env.example server/.env
```
Default `server/.env`:
```env
PORT=5000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173

SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_PUBLISHABLE_KEY=your-anon-publishable-key
SUPABASE_SECRET_KEY=your-supabase-service-role-secret-key

GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.5-flash
```

### 3. Run Development Servers

**Run the Express Backend:**
```bash
npm --prefix server run dev
# Running on http://localhost:5000
```

**Run the Vite Frontend:**
```bash
npm --prefix client run dev
# Running on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser!

---

## 🧪 Running Tests & Checks

### 1. Backend Unit Tests
Run the comprehensive suite covering the Nutrition Engine, BMR/TDEE calculations, serving scalers, search tokenizers, and Zod schemas:
```bash
npm --prefix server test
```
*Expected Output: 9 tests passing (100% pass rate).*

### 2. Frontend Production Build Check
Verify compilation and bundle creation:
```bash
npm --prefix client run build
```

---

## 🗄️ Supabase Database & Auth Setup

### 1. Apply Migrations
Navigate to the Supabase SQL Editor for your project and execute:
```sql
supabase/migrations/20261102000000_init_nav_ai.sql
```
This creates:
- `profiles` with automatic signup trigger `handle_new_user()`
- `daily_goals`
- `food_items` with verified USDA & Indian food composition
- `meals` & `meal_items`
- `recipes` & `recipe_ingredients`
- `water_logs` & `weight_logs`
- Strict Row Level Security (RLS) policies ensuring users can only read and mutate their own records.

### 2. Apply Seed Data
Run:
```sql
supabase/seed.sql
```
Populates verified food items and realistic recipes (Paneer Bhurji, Dal Tadka, Chickpea Salad, Poha, Overnight Oats, Salmon, Fajitas).

### 3. Private Storage Bucket (`meal-images`)
Refer to `supabase/storage.md` to initialize the private `meal-images` bucket with owner-scoped policies (`<user_id>/<meal_id>/<filename>`).

---

## 🤖 Google Gemini AI Setup

1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Create an API Key.
3. Paste it into `server/.env` under `GEMINI_API_KEY`.
4. The default model is `gemini-2.5-flash` (or `gemini-1.5-flash`), configurable via `GEMINI_MODEL`.
5. The scanner supports camera capture on mobile (`capture="environment"`) and gallery/file upload on desktop.

---

## 🔒 Security Architecture

- **No Browser Leakage:** `GEMINI_API_KEY` and `SUPABASE_SECRET_KEY` are stored strictly in `server/.env` and never bundled or exposed to frontend code.
- **Request Validation:** Every incoming API payload is validated with strict Zod schemas.
- **Multer Memory Uploads:** File size limits are capped at 10 MB with MIME-type allowlists (`image/jpeg`, `image/png`, `image/webp`).
- **Guest Rate Limiting:** In-memory IP rate limiter guards the AI meal scanner against spam (30 scans per hour).
- **Row Level Security:** Supabase PostgreSQL tables enforce user isolation based on `auth.uid()`.

---

## 📱 Responsive Breakpoints

- **Desktop (>= 1024px):** Horizontal navigation bar with brand icon, quick meal scan CTA, guest indicator, multi-column dashboard grid.
- **Tablet (768px - 1023px):** Adaptive 2-column layout with compact headers.
- **Mobile (< 768px):** Fixed frosted glass bottom navigation bar with raised central camera button, safe-area inset protection (`pb-safe`), and touch-optimized action sheets.

