import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  if (!message) return null;

  const bgColors = {
    success: 'bg-emerald-800 text-emerald-100 border-emerald-600',
    warning: 'bg-amber-800 text-amber-100 border-amber-600',
    error: 'bg-rose-800 text-rose-100 border-rose-600',
    info: 'bg-slate-800 text-slate-100 border-slate-600'
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400" />,
    error: <XCircle className="w-5 h-5 text-rose-400" />,
    info: <Info className="w-5 h-5 text-sky-400" />
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl border shadow-xl backdrop-blur-md transition-all transform animate-slide-up ${bgColors[type]}`}>
      {icons[type]}
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 text-slate-400 hover:text-white transition-colors"
      >
        ✕
      </button>
    </div>
  );
};
