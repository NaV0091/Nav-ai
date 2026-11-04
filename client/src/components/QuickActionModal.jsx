import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, PlusCircle, Droplets, X } from 'lucide-react';

export function QuickActionModal({ isOpen, onClose, onOpenManualEntry }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-forest/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface rounded-4xl max-w-sm w-full p-6 shadow-soft-lg border border-forest-border/40 animate-in slide-in-from-bottom-8 duration-300">
        <div className="flex items-center justify-between pb-3 border-b border-forest-border/40 mb-4">
          <h3 className="text-base font-bold text-forest">Quick Action</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-surface-container text-forest-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => {
              onClose();
              navigate('/scanner');
            }}
            className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-primary-soft hover:bg-primary/10 border border-primary/20 text-left transition-all group"
          >
            <div className="w-11 h-11 rounded-2xl bg-primary text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Camera className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-forest group-hover:text-primary transition-colors">
                Scan Meal with AI
              </span>
              <span className="text-xs text-forest-muted">
                Analyze photo with Nav AI vision
              </span>
            </div>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenManualEntry('lunch');
            }}
            className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-surface-container-low hover:bg-surface-container border border-forest-border/40 text-left transition-all group"
          >
            <div className="w-11 h-11 rounded-2xl bg-forest-slate text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-forest">
                Add Food Manually
              </span>
              <span className="text-xs text-forest-muted">
                Search foods or enter custom macros
              </span>
            </div>
          </button>

          <button
            onClick={() => {
              onClose();
              navigate('/dashboard#water');
            }}
            className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-secondary-soft/70 hover:bg-secondary-soft border border-secondary/20 text-left transition-all group"
          >
            <div className="w-11 h-11 rounded-2xl bg-secondary text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Droplets className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-forest group-hover:text-secondary transition-colors">
                Log Water Intake
              </span>
              <span className="text-xs text-forest-muted">
                Track hydration balance
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

