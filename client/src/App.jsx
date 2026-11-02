import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Layout
import AppLayout from './components/layout/AppLayout';

// Public Pages
import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AuthCallbackPage from './pages/AuthCallbackPage';

// App Pages
import DashboardPage from './pages/DashboardPage';
import PlansPage from './pages/PlansPage';
import ScannerPage from './pages/ScannerPage';
import ScanResultsPage from './pages/ScanResultsPage';
import DiaryPage from './pages/DiaryPage';
import RecipesPage from './pages/RecipesPage';
import RecipeDetailPage from './pages/RecipeDetailPage';
import ProgressPage from './pages/ProgressPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';

function RootRoute() {
  const { user, isGuest, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-[#ECFEF4] flex items-center justify-center text-sm font-bold text-[#006C4D]">
        Loading Nav AI...
      </div>
    );
  }
  if (user || isGuest) {
    return <Navigate to="/dashboard" replace />;
  }
  return <WelcomePage />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<RootRoute />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />

            {/* Application Routes wrapped with responsive Navbar & Layout */}
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/plans" element={<PlansPage />} />
              <Route path="/scanner" element={<ScannerPage />} />
              <Route path="/scan-results" element={<ScanResultsPage />} />
              <Route path="/diary" element={<DiaryPage />} />
              <Route path="/recipes" element={<RecipesPage />} />
              <Route path="/recipes/:id" element={<RecipeDetailPage />} />
              <Route path="/progress" element={<ProgressPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
