import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { exportGuestData, clearAllGuestData } from '../services/guestStorage';
import { checkServerHealth } from '../services/apiClient';
import {
  Settings,
  Database,
  Trash2,
  Download,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  LogOut,
  Sparkles,
  Server,
} from 'lucide-react';

export default function SettingsPage() {
  const { user, isGuest, isSupabaseConfigured, logout } = useAuth();
  const { showToast } = useToast();

  const [healthStatus, setHealthStatus] = useState(null);
  const [checkingHealth, setCheckingHealth] = useState(false);

  const checkHealth = async () => {
    setCheckingHealth(true);
    try {
      const res = await checkServerHealth();
      setHealthStatus(res);
    } catch (err) {
      setHealthStatus({ status: 'offline', error: err.message });
    } finally {
      setCheckingHealth(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const handleExportData = async () => {
    try {
      const data = await exportGuestData();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nav-ai-guest-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Export downloaded successfully!', 'success');
    } catch (err) {
      showToast('Failed to export data', 'error');
    }
  };

  const handleClearGuest = async () => {
    if (
      !window.confirm(
        'Are you sure you want to delete all local guest data? This will clear all recorded meals, weight logs, and water history from IndexedDB.'
      )
    ) {
      return;
    }

    try {
      await clearAllGuestData();
      showToast('Local guest data cleared', 'info');
      setTimeout(() => window.location.reload(), 800);
    } catch (err) {
      showToast('Failed to clear guest data', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full pb-16">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#101E19]">Settings & Storage</h1>
        <p className="text-xs sm:text-sm text-[#6C7A72] font-medium mt-0.5">
          Manage local IndexedDB storage, credentials, and system connectivity
        </p>
      </div>

      {/* Account Identity */}
      <div className="bg-white rounded-3xl p-6 border border-[#D5E7DD] shadow-xs flex flex-col gap-3">
        <h3 className="text-base font-extrabold text-[#101E19]">Account Identity</h3>

        <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F8FCF9] border border-[#E0F2E8]">
          <div>
            <p className="text-xs font-semibold text-[#6C7A72]">Current Session</p>
            <p className="text-sm font-bold text-[#101E19]">
              {user ? user.email : 'Guest Explorer (Local Browser Mode)'}
            </p>
          </div>

          {user && (
            <button
              onClick={logout}
              className="px-4 py-1.5 rounded-full bg-red-50 text-[#BA1A1A] hover:bg-red-100 text-xs font-bold transition-colors"
            >
              Sign Out
            </button>
          )}
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white rounded-3xl p-6 border border-[#D5E7DD] shadow-xs flex flex-col gap-4">
        <div>
          <h3 className="text-base font-extrabold text-[#101E19]">Data Management</h3>
          <p className="text-xs text-[#6C7A72]">
            Export or erase offline IndexedDB records
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={handleExportData}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#E6F8EE] text-[#006C4D] hover:bg-[#D5E7DD] text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" /> Export Offline Backup (JSON)
          </button>

          <button
            onClick={handleClearGuest}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-red-50 text-[#BA1A1A] hover:bg-red-100 text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" /> Clear All Local Guest Data
          </button>
        </div>
      </div>

      {/* System Status & Environment Readiness */}
      <div className="bg-white rounded-3xl p-6 border border-[#D5E7DD] shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-[#101E19]">System Status</h3>
            <p className="text-xs text-[#6C7A72]">Live health check of Express backend and external APIs</p>
          </div>

          <button
            onClick={checkHealth}
            disabled={checkingHealth}
            className="w-8 h-8 rounded-full bg-[#F8FCF9] border border-[#D5E7DD] flex items-center justify-center text-[#006C4D] hover:bg-[#E0F2E8]"
            title="Ping health check"
          >
            <RefreshCw className={`w-4 h-4 ${checkingHealth ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="divide-y divide-[#E0F2E8]">
          {/* Supabase Status */}
          <div className="py-3 flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-2.5">
              <Database className="w-4 h-4 text-[#006C4D]" />
              <span className="font-bold text-[#101E19]">Supabase Database & Auth</span>
            </div>
            {isSupabaseConfigured ? (
              <span className="inline-flex items-center gap-1 text-[#006C4D] font-bold text-xs">
                <CheckCircle2 className="w-4 h-4" /> Configured
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[#EA580C] font-semibold text-xs">
                <AlertCircle className="w-4 h-4" /> Credentials Pending
              </span>
            )}
          </div>

          {/* Express Backend Status */}
          <div className="py-3 flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-2.5">
              <Server className="w-4 h-4 text-[#225EAA]" />
              <div>
                <span className="font-bold text-[#101E19] block">Express Backend API</span>
                <span className="text-[11px] text-[#6C7A72]">
                  {healthStatus?.backendOnline ? 'Cloud / local REST server' : 'Serverless Client-First mode'}
                </span>
              </div>
            </div>
            {healthStatus?.backendOnline ? (
              <span className="inline-flex items-center gap-1 text-[#006C4D] font-bold text-xs">
                <CheckCircle2 className="w-4 h-4" /> Online (v{healthStatus?.version || '1.0'})
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[#006C4D] font-bold text-xs bg-[#E0F2E8] px-2.5 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" /> Standalone Mode (Active)
              </span>
            )}
          </div>

          {/* Gemini AI Status */}
          <div className="py-3 flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-[#754F8A]" />
              <div>
                <span className="font-bold text-[#101E19] block">Google Gemini AI Model</span>
                <span className="text-[11px] text-[#6C7A72]">Powers meal scanner, food vision & coaching</span>
              </div>
            </div>
            {healthStatus?.geminiConfigured ? (
              <span className="inline-flex items-center gap-1 text-[#006C4D] font-bold text-xs bg-[#E0F2E8] px-2.5 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" /> {healthStatus?.geminiModel || 'gemini-3.8-flash'} Ready
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[#EA580C] font-semibold text-xs">
                <AlertCircle className="w-4 h-4" /> GEMINI_API_KEY Pending
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

