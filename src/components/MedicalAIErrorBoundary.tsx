import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';

interface Props {
  children: ReactNode;
  onBack?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class MedicalAIErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Medora Medical AI] Runtime error encountered:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="bg-white border-2 border-red-200 rounded-3xl p-6 shadow-lg max-w-xl mx-auto my-6 space-y-4 text-center">
          <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto text-red-600">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">
              Medora Medical AI could not be opened.
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              An unexpected error occurred while loading the clinical reasoning system. Please retry or return to the previous screen.
            </p>
            {Boolean(import.meta.env?.DEV) && this.state.error && (
              <pre className="text-[10px] text-left bg-slate-900 text-red-300 p-3 rounded-xl mt-3 overflow-x-auto font-mono">
                {this.state.error.message}
              </pre>
            )}
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={this.state.error ? this.handleRetry : undefined}
              className="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
            <button
              onClick={() => {
                if (this.props.onBack) {
                  this.props.onBack();
                } else if (typeof window !== 'undefined' && window.history.length > 1) {
                  window.history.back();
                } else {
                  window.location.href = '/dashboard';
                }
              }}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
