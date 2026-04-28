"use client";

import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

type Props = { children: ReactNode };
type State = { hasError: boolean; message: string };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(err: Error): State {
    return { hasError: true, message: err.message || "Unexpected error" };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Triya UI error boundary:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-950 text-slate-200 p-8">
          <AlertTriangle className="text-amber-500" size={48} />
          <h1 className="text-xl font-bold">Something went wrong</h1>
          <p className="text-sm text-slate-400 max-w-md text-center">{this.state.message}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-500"
          >
            Reload application
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
