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
      document.head.appendChild(script);
    } else {
      if (window.turnstile) {
        setIsLoaded(true);
      } else {
        existingScript.addEventListener('load', () => setIsLoaded(true));
      }
    }
  }, []);

  useEffect(() => {
    if (!isLoaded || !containerRef.current || !window.turnstile) return;

    // Clean up previous widget instance if re-rendering
    if (widgetIdRef.current) {
      try {
        window.turnstile.remove(widgetIdRef.current);
      } catch (_) {}
      widgetIdRef.current = null;
    }

    try {
      const id = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme,
        callback: (token: string) => {
          onVerify(token);
        },
        'expired-callback': () => {
          if (onExpire) onExpire();
        },
        'error-callback': () => {
          if (onError) onError();
        },
      });
      widgetIdRef.current = id;
    } catch (e) {
      console.warn('[Turnstile] Widget render warning:', e);
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (_) {}
        widgetIdRef.current = null;
      }
    };
  }, [isLoaded, siteKey, theme, onVerify, onExpire, onError]);

  return (
    <div className={`my-2 flex justify-center ${className}`}>
      <div ref={containerRef} className="min-h-[65px] flex items-center justify-center" />
    </div>
  );
};

