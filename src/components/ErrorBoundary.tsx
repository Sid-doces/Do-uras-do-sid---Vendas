import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-brand-cream flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-[40px] shadow-2xl p-12 text-center space-y-6 border border-orange-100">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={40} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Algo deu errado</h1>
            <p className="text-gray-500 text-lg">
              Desculpe o transtorno. O aplicativo encontrou um erro inesperado. Estamos trabalhando para resolver.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-brand-brown text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-105 transition-all shadow-xl"
            >
              <RefreshCcw size={20} /> Recarregar Página
            </button>
            {this.state.error && (
              <div className="pt-6 border-t border-gray-100">
                <p className="text-[10px] text-gray-400 font-mono italic break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
