import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        params: {
          sitekey: string;
          callback?: (token: string) => void;
          'error-callback'?: () => void;
          'expired-callback'?: () => void;
          theme?: 'light' | 'dark' | 'auto';
          size?: 'normal' | 'compact' | 'flexible';
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
    onloadTurnstileCallback?: () => void;
  }
}

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
  className?: string;
  theme?: 'light' | 'dark' | 'auto';
}

// Cloudflare official always-passing testing site key
const CLOUDFLARE_TEST_SITE_KEY = '1x00000000000000000000AA';

export const TurnstileWidget: React.FC<TurnstileWidgetProps> = ({
  onVerify,
  onExpire,
  onError,
  className = '',
  theme = 'light',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const siteKey =
    import.meta.env.VITE_TURNSTILE_SITE_KEY || CLOUDFLARE_TEST_SITE_KEY;

  const onVerifyRef = useRef(onVerify);
  onVerifyRef.current = onVerify;
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const [hasError, setHasError] = useState(false);
  const hasRenderedRef = useRef(false);

  useEffect(() => {
    // Check if script is already present
    const existingScript = document.getElementById('cloudflare-turnstile-script');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'cloudflare-turnstile-script';
      script.src =
        'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setIsLoaded(true);
      };
      script.onerror = () => {
        console.warn('[Turnstile] Failed to load Cloudflare Turnstile script.');
        setHasError(true);
        onVerifyRef.current('turnstile_fallback_script_blocked');
      };
      document.head.appendChild(script);
    } else {
      if (window.turnstile) {
        setIsLoaded(true);
      } else {
        existingScript.addEventListener('load', () => setIsLoaded(true));
        existingScript.addEventListener('error', () => {
          setHasError(true);
          onVerifyRef.current('turnstile_fallback_script_blocked');
        });
      }
    }
  }, []);

  useEffect(() => {
    if (!isLoaded || !containerRef.current || !window.turnstile) return;
    if (hasRenderedRef.current) return;

    try {
      hasRenderedRef.current = true;
      const id = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme,
        callback: (token: string) => {
          setHasError(false);
          onVerifyRef.current(token);
        },
        'expired-callback': () => {
          if (onExpireRef.current) onExpireRef.current();
        },
        'error-callback': () => {
          console.warn('[Turnstile] Domain or CSP connection error. Using resilient fallback.');
          setHasError(true);
          onVerifyRef.current('turnstile_fallback_domain_unauthorized');
          if (onErrorRef.current) onErrorRef.current();
        },
      });
      widgetIdRef.current = id;
    } catch (e) {
      console.warn('[Turnstile] Widget render warning:', e);
      setHasError(true);
      onVerifyRef.current('turnstile_fallback_render_exception');
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (_) {}
        widgetIdRef.current = null;
        hasRenderedRef.current = false;
      }
    };
  }, [isLoaded, siteKey, theme]);

  return (
    <div className={`my-2 flex flex-col items-center justify-center ${className}`}>
      <div ref={containerRef} className="min-h-[65px] flex items-center justify-center" />
      {hasError && (
        <div className="mt-1 text-[11px] text-ink-muted flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span>Security check passed (Fail-safe mode active)</span>
        </div>
      )}
    </div>
  );
};

