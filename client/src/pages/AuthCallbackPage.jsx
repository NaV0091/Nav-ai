import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { Sparkles, Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    async function handleAuth() {
      try {
        if (supabase) {
          const { data, error } = await supabase.auth.getSession();
          if (error) throw error;
          if (data?.session) {
            sessionStorage.setItem('navai_prompt_install', 'true');
            navigate('/dashboard');
            return;
          }
        }
      } catch (err) {
        console.error('OAuth callback error:', err);
      }
      navigate('/login');
    }

    handleAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#ECFEF4] flex flex-col items-center justify-center p-4">
      <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#006C4D] to-[#34C795] flex items-center justify-center text-white shadow-xl mb-4 animate-bounce">
        <Sparkles className="w-8 h-8" />
      </div>
      <h2 className="text-xl font-bold text-[#101E19]">Authenticating with Nav AI...</h2>
      <p className="text-sm text-[#6C7A72] mt-1 flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-[#006C4D]" />
        Securing session and syncing profile
      </p>
    </div>
  );
}

