import React from 'react';
import { useAuth } from '../components/AuthProvider';
import { Navigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';

export default function AdminLogin() {
  const { user, isAdmin, login, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-brand-cream">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-orange border-t-transparent"></div>
    </div>
  );

  if (user && isAdmin) return <Navigate to="/admin" />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-cream p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 border border-orange-100 flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-brand-orange rounded-3xl flex items-center justify-center text-white font-display text-4xl mb-6 shadow-xl rotate-3">
          S
        </div>
        <h1 className="text-3xl font-display font-bold text-brand-brown mb-2">Painel Administrativo</h1>
        <p className="text-brand-brown/60 mb-8">Bem-vindo de volta! Por favor, faça login com sua conta Google configurada para acessar o gerenciamento.</p>
        
        {user && !isAdmin && (
          <div className="w-full p-4 mb-6 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
            Acesso Negado: A conta {user.email} não tem permissões administrativas.
          </div>
        )}

        <button
          onClick={login}
          className="flex items-center justify-center gap-3 w-full py-4 bg-brand-brown text-white rounded-2xl font-bold transition-all hover:bg-brand-brown/90 hover:scale-[1.02] active:scale-[0.98] shadow-lg"
        >
          <LogIn size={20} />
          Entrar com Google
        </button>

        <p className="mt-8 text-xs text-brand-brown/40">
          Apenas e-mails autorizados podem acessar este painel.
          Entre em contato com o desenvolvedor se precisar de acesso.
        </p>
      </div>
    </div>
  );
}
