import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[CampusRide ErrorBoundary] Uncaught rendering exception:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6 bg-canvas">
          <div className="max-w-md w-full p-8 rounded-3xl bg-paper border border-line-base shadow-xl text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
              <AlertOctagon className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-mono font-bold">
                Route Interrupted
              </div>
              <h2 className="text-xl font-display font-extrabold text-ink-primary">
                Something went off-route
              </h2>
              <p className="text-xs text-ink-muted leading-relaxed">
                An unexpected interface error occurred. Don't worry, your verified account and rides remain secure.
              </p>
            </div>

            {this.state.error && process.env.NODE_ENV !== 'production' && (
              <div className="text-left p-3 rounded-xl bg-slate-900 text-slate-200 text-[11px] font-mono overflow-auto max-h-32 border border-slate-800">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full py-3 px-4 rounded-xl bg-route text-white font-mono text-xs font-bold hover:bg-route-light transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Try Again</span>
              </button>

              <a
                href="/"
                className="w-full py-3 px-4 rounded-xl border border-line-base bg-surface hover:bg-canvas text-ink-primary font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-2xs"
              >
                <Home className="w-3.5 h-3.5 text-ink-muted" />
                <span>Return Home</span>
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

