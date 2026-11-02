import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export function Toast({ message, type = 'success', onClose }) {
  if (!message) return null;

  const bgStyles = {
    success: 'bg-forest text-white border-primary-light/40 shadow-glow-primary',
    error: 'bg-red-900 text-white border-red-500/50 shadow-lg',
    info: 'bg-slate-900 text-white border-slate-600/50 shadow-lg',
  }[type] || 'bg-forest text-white';

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 max-w-md w-11/12 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className={`flex items-center justify-between px-4 py-3 rounded-full border shadow-xl backdrop-blur-md ${bgStyles}`}>
        <div className="flex items-center gap-2.5 min-w-0 pr-2">
          {type === 'success' && <CheckCircle2 className="w-5 h-5 text-primary-light flex-shrink-0" />}
          {type === 'error' && <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0" />}
          {type === 'info' && <Info className="w-5 h-5 text-blue-300 flex-shrink-0" />}
          <span className="text-sm font-medium truncate">{message}</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

