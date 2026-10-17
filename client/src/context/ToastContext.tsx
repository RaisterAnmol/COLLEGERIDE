import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toast: {
    success: (message: string, title?: string, duration?: number) => void;
    error: (message: string, title?: string, duration?: number) => void;
    warning: (message: string, title?: string, duration?: number) => void;
    info: (message: string, title?: string, duration?: number) => void;
  };
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, message: string, title?: string, duration = 4000) => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: ToastItem = { id, type, title, message, duration };
    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const toast = {
    success: (message: string, title?: string, duration?: number) => addToast('success', message, title, duration),
    error: (message: string, title?: string, duration?: number) => addToast('error', message, title, duration),
    warning: (message: string, title?: string, duration?: number) => addToast('warning', message, title, duration),
    info: (message: string, title?: string, duration?: number) => addToast('info', message, title, duration),
  };

  return (
    <ToastContext.Provider value={{ toast, removeToast }}>
      {children}
      {/* Toast Render Portal Container */}
      <div 
        aria-live="polite"
        className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        <AnimatePresence>
          {toasts.map((t) => {
            const isSuccess = t.type === 'success';
            const isError = t.type === 'error';
            const isWarning = t.type === 'warning';

            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                className={`pointer-events-auto rounded-2xl p-4 shadow-xl border flex items-start gap-3 text-sm backdrop-blur-md ${
                  isSuccess
                    ? 'bg-[#143D32] text-white border-emerald-500/40 shadow-emerald-950/20'
                    : isError
                    ? 'bg-[#7F1D1D] text-white border-red-400/40 shadow-red-950/20'
                    : isWarning
                    ? 'bg-[#78350F] text-white border-amber-400/40 shadow-amber-950/20'
                    : 'bg-[#0F172A] text-white border-slate-700 shadow-slate-950/20'
                }`}
                role="status"
              >
                <div className="shrink-0 mt-0.5">
                  {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-300" />}
                  {isError && <AlertCircle className="w-5 h-5 text-red-300" />}
                  {isWarning && <AlertTriangle className="w-5 h-5 text-amber-300" />}
                  {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-sky-300" />}
                </div>

                <div className="flex-1 min-w-0 pr-1">
                  {t.title && (
                    <h5 className="font-bold text-xs uppercase tracking-wider font-mono opacity-90 mb-0.5">
                      {t.title}
                    </h5>
                  )}
                  <p className="text-xs leading-relaxed text-slate-100 font-sans">
                    {t.message}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => removeToast(t.id)}
                  className="shrink-0 p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Dismiss notification"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType['toast'] => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context.toast;
};

