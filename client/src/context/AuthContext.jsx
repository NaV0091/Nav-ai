import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  supabase,
  isSupabaseConfigured,
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  signOutUser,
  getSession,
  onAuthStateChange,
  resendConfirmationEmail,
} from '../services/supabaseClient';
import { exportGuestData, clearAllGuestData } from '../services/guestStorage';
import { importGuestData as apiImportGuestData } from '../services/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isGuest, setIsGuest] = useState(() => {
    // Check if user previously chosen guest mode
    return localStorage.getItem('navai_mode') === 'guest';
  });
  const [loading, setLoading] = useState(true);

  // Initialize session and auth state listener
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        if (isSupabaseConfigured && supabase) {
          const currentSession = await getSession();
          if (mounted && currentSession) {
            setSession(currentSession);
            setUser(currentSession.user);
            setIsGuest(false);
            localStorage.removeItem('navai_mode');
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    const { data: authListener } = onAuthStateChange((event, newSession) => {
      if (!mounted) return;
      setSession(newSession);
      setUser(newSession?.user || null);

      if (newSession?.user) {
        setIsGuest(false);
        localStorage.removeItem('navai_mode');
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const enterGuestMode = useCallback(() => {
    setIsGuest(true);
    setUser(null);
    setSession(null);
    localStorage.setItem('navai_mode', 'guest');
  }, []);

  const exitGuestMode = useCallback(() => {
    setIsGuest(false);
    localStorage.removeItem('navai_mode');
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await signInWithEmail(email, password);
    setIsGuest(false);
    localStorage.removeItem('navai_mode');
    return data;
  }, []);

  const register = useCallback(async (email, password, displayName) => {
    const data = await signUpWithEmail(email, password, displayName);
    if (data?.session) {
      setSession(data.session);
      setUser(data.session.user);
      setIsGuest(false);
      localStorage.removeItem('navai_mode');
    }
    return data;
  }, []);

  const loginGoogle = useCallback(async () => {
    return signInWithGoogle();
  }, []);

  const logout = useCallback(async () => {
    await signOutUser();
    setUser(null);
    setSession(null);
    setIsGuest(false);
    localStorage.removeItem('navai_mode');
  }, []);

  // Safe migration of local guest data into authenticated Supabase account
  const migrateGuestData = useCallback(async () => {
    if (!session?.access_token) {
      throw new Error('Must be authenticated to import guest data.');
    }

    const localData = await exportGuestData();
    if (!localData.meals.length && !localData.weight_logs.length) {
      return { success: true, count: 0, message: 'No guest logs to migrate.' };
    }

    const result = await apiImportGuestData(localData, session.access_token);

    // Only clear local guest data once migration succeeds
    if (result.success) {
      await clearAllGuestData();
    }

    return result;
  }, [session]);

  const value = {
    user,
    session,
    isGuest,
    loading,
    isSupabaseConfigured,
    enterGuestMode,
    exitGuestMode,
    login,
    register,
    loginGoogle,
    logout,
    resendConfirmationEmail,
    migrateGuestData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

