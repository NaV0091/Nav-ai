import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Sparkles, ArrowRight, Lock, Mail, AlertCircle, Info, RefreshCw, CheckCircle2 } from 'lucide-react';
import GoogleSetupModal from '../components/auth/GoogleSetupModal';

export default function LoginPage() {
  const { login, loginGoogle, enterGuestMode, isSupabaseConfigured, resendConfirmationEmail } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isEmailUnconfirmed, setIsEmailUnconfirmed] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [resendSent, setResendSent] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsEmailUnconfirmed(false);
    setResendSent(false);

    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      showToast('Welcome back to Nav AI!', 'success');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.message || '';
      if (
        err.isGoogleDisabled ||
        err.code === 'GOOGLE_PROVIDER_DISABLED' ||
        msg.toLowerCase().includes('not enabled') ||
        msg.toLowerCase().includes('validation_failed')
      ) {
        setShowGoogleModal(true);
      } else if (msg.toLowerCase().includes('email not confirmed')) {
        setIsEmailUnconfirmed(true);
        setErrorMessage(
          'Your email address has not been confirmed yet. Please check your inbox (and spam folder) or resend the link below.'
        );
      } else if (msg.toLowerCase().includes('invalid login credentials')) {
        setErrorMessage('Incorrect email or password. Please verify your credentials or register a new account.');
      } else {
        setErrorMessage(msg || 'Failed to sign in. Please verify your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    try {
      setResendingEmail(true);
      await resendConfirmationEmail(email);
      setResendSent(true);
      showToast('Confirmation email resent! Check your inbox.', 'info');
    } catch (err) {
      showToast(err.message || 'Failed to resend confirmation email.', 'error');
    } finally {
      setResendingEmail(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    try {
      await loginGoogle();
    } catch (err) {
      if (
        err.isGoogleDisabled ||
        err.code === 'GOOGLE_PROVIDER_DISABLED' ||
        err.message?.toLowerCase().includes('not enabled') ||
        err.message?.toLowerCase().includes('validation_failed')
      ) {
        setShowGoogleModal(true);
      } else {
        setErrorMessage(err.message || 'Google sign-in is not configured.');
      }
    }
  };

  const handleGuest = () => {
    enterGuestMode();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#ECFEF4] to-[#F8FCF9] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl border border-[#D5E7DD]">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <Link
            to="/"
            className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#006C4D] to-[#34C795] flex items-center justify-center text-white shadow-md shadow-[#34C795]/20 mb-3"
          >
            <Sparkles className="w-6 h-6" />
          </Link>
          <h2 className="text-2xl font-extrabold text-[#101E19]">Welcome Back</h2>
          <p className="text-sm text-[#6C7A72] mt-1">Sign in to sync your nutrition diary & AI scans</p>
        </div>

        {/* Configuration Notice if Supabase is unconfigured */}
        {!isSupabaseConfigured && (
          <div className="mb-6 p-4 rounded-2xl bg-[#FFF7E8] border border-[#FDBA8C] text-xs text-[#101E19] flex items-start gap-2.5">
            <Info className="w-4 h-4 text-[#EA580C] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[#EA580C]">Supabase Credentials Pending</p>
              <p className="text-[#6C7A72] mt-0.5">
                Set <code className="bg-white/80 px-1 py-0.5 rounded font-mono">VITE_SUPABASE_URL</code> in client/.env.
                You can use all features right now with <strong>Guest Mode</strong>!
              </p>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-[#BA1A1A] space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span>{errorMessage}</span>
              </div>
            </div>

            {isEmailUnconfirmed && (
              <div className="pt-2 border-t border-red-100 flex items-center justify-between">
                <button
                  type="button"
                  disabled={resendingEmail || resendSent}
                  onClick={handleResend}
                  className="font-bold underline text-[#006C4D] hover:text-[#004E37] flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${resendingEmail ? 'animate-spin' : ''}`} />
                  <span>{resendSent ? 'Email Resent!' : resendingEmail ? 'Sending...' : 'Resend confirmation email'}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6C7A72] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#F8FCF9] border border-[#D5E7DD] text-sm text-[#101E19] placeholder:text-[#6C7A72] focus:outline-none focus:border-[#006C4D] focus:ring-2 focus:ring-[#006C4D]/20 transition-all"
              />
              <Mail className="w-4 h-4 text-[#6C7A72] absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6C7A72] mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#F8FCF9] border border-[#D5E7DD] text-sm text-[#101E19] placeholder:text-[#6C7A72] focus:outline-none focus:border-[#006C4D] focus:ring-2 focus:ring-[#006C4D]/20 transition-all"
              />
              <Lock className="w-4 h-4 text-[#6C7A72] absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 rounded-full bg-[#006C4D] hover:bg-[#004E37] text-white font-bold text-sm shadow-md shadow-[#006C4D]/20 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
          >
            {loading ? 'Signing In...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#D5E7DD]" />
          </div>
          <span className="relative bg-white px-3 text-xs text-[#6C7A72] font-semibold uppercase tracking-wider">
            or
          </span>
        </div>

        {/* Social / Guest Fallback */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleGoogleSignIn}
            type="button"
            className="w-full py-3 rounded-full bg-white border border-[#D5E7DD] hover:bg-[#F8FCF9] text-sm font-semibold text-[#101E19] flex items-center justify-center gap-2.5 transition-colors shadow-xs"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <button
            onClick={handleGuest}
            type="button"
            className="w-full py-3 rounded-full bg-[#E6F8EE] text-[#006C4D] hover:bg-[#D5E7DD] text-sm font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <span>Continue as Guest</span>
          </button>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-[#6C7A72] mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-[#006C4D] hover:underline">
            Register now
          </Link>
        </p>
      </div>

      {/* Google Setup Guide Modal */}
      <GoogleSetupModal isOpen={showGoogleModal} onClose={() => setShowGoogleModal(false)} />
    </div>
  );
}
