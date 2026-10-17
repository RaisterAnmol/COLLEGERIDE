import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, Shield, Check, X, ChevronDown, ChevronUp } from 'lucide-react';

const COOKIE_CONSENT_KEY = 'campusride_cookie_consent_v1';

export const CookieBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (!consent) {
        // Small delay to let page settle before showing
        const timer = setTimeout(() => setIsVisible(true), 800);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, []);

  const handleAcceptAll = () => {
    try {
      localStorage.setItem(
        COOKIE_CONSENT_KEY,
        JSON.stringify({ essential: true, analytics: true, functional: true, timestamp: Date.now() })
      );
    } catch {}
    setIsVisible(false);
  };

  const handleAcceptNecessary = () => {
    try {
      localStorage.setItem(
        COOKIE_CONSENT_KEY,
        JSON.stringify({ essential: true, analytics: false, functional: false, timestamp: Date.now() })
      );
    } catch {}
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.aside
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        aria-label="Cookie consent banner"
        role="region"
        className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-xl z-[9990] pointer-events-auto"
      >
        <div className="bg-paper/95 backdrop-blur-md border border-line-base rounded-3xl p-5 sm:p-6 shadow-2xl shadow-slate-900/15 text-ink-primary">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center shrink-0">
              <Cookie className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-display font-bold text-sm text-ink-primary">
                    Campus Cookie & Privacy Notice
                  </h4>
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <Shield className="w-3 h-3 text-emerald-600" />
                    <span>Zero Data Selling</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAcceptNecessary}
                  className="p-1 text-ink-faint hover:text-ink-primary rounded-lg hover:bg-canvas transition-colors sm:hidden"
                  aria-label="Close cookie banner"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-ink-muted leading-relaxed">
                CampusRide uses strictly essential cookies and local session caching for secure authentication, 
                real-time ride match dispatch, and offline corridor route navigation. We never sell student data or track across external sites.
              </p>

              {/* Expandable Details Accordion */}
              {showDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="pt-2 pb-1 space-y-2 text-[11px] text-ink-muted border-t border-line-subtle mt-3 font-mono"
                >
                  <div className="flex items-center justify-between p-2 rounded-xl bg-canvas border border-line-subtle">
                    <div>
                      <span className="font-bold text-ink-primary">Essential Session Cookies</span>
                      <p className="text-[10px] text-ink-faint font-sans">JWT token, driver security context, SOS dispatch token</p>
                    </div>
                    <span className="text-emerald-700 font-bold text-[10px]">Always Active</span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-canvas border border-line-subtle">
                    <div>
                      <span className="font-bold text-ink-primary">Transit Route Caching</span>
                      <p className="text-[10px] text-ink-faint font-sans">Dehradun corridor stops, offline map polylines & hubs</p>
                    </div>
                    <span className="text-emerald-700 font-bold text-[10px]">Always Active</span>
                  </div>
                </motion.div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-[11px] font-mono font-semibold text-route hover:text-route-light flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>{showDetails ? 'Hide details' : 'Cookie details'}</span>
                  {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={handleAcceptNecessary}
                    className="px-3.5 py-1.5 rounded-xl border border-line-base bg-surface hover:bg-canvas text-xs font-mono font-bold text-ink-primary transition-all cursor-pointer shadow-2xs"
                  >
                    Necessary Only
                  </button>
                  <button
                    type="button"
                    onClick={handleAcceptAll}
                    className="px-4 py-1.5 rounded-xl bg-route text-white text-xs font-mono font-bold hover:bg-route-light transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Accept All</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
};

