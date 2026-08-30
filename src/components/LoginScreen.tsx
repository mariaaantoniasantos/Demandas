import React, { useState } from 'react';
import { Layers, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginScreen: React.FC = () => {
  const { login } = useAuth();

  const isDark = (() => {
    try {
      return localStorage.getItem('agencia_theme_v1') !== 'light';
    } catch {
      return true;
    }
  })();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !senha) {
      setError('Preencha email e senha para continuar.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    const result = await login(email.trim(), senha);
    setIsSubmitting(false);
    if (!result.ok) {
      setError(result.error || 'Não foi possível entrar.');
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-200 ${
        isDark ? 'bg-[#0a0a0c] text-slate-100' : 'bg-slate-100/90 text-slate-900'
      }`}
    >
      <div
        className={`fixed top-[-10%] left-[15%] w-[450px] h-[450px] rounded-full blur-[120px] pointer-events-none -z-10 ${
          isDark ? 'bg-indigo-600/12' : 'bg-indigo-300/25'
        }`}
      />
      <div
        className={`fixed bottom-[-10%] right-[15%] w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none -z-10 ${
          isDark ? 'bg-purple-600/10' : 'bg-purple-300/20'
        }`}
      />

      <div
        className={`w-full max-w-sm rounded-2xl shadow-2xl border p-6 sm:p-8 backdrop-blur-2xl ${
          isDark ? 'bg-[#0e1017]/95 border-white/10' : 'bg-white/95 border-slate-200 shadow-slate-900/10'
        }`}
      >
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 border border-white/20 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 mb-3">
            <Layers className="w-6 h-6" />
          </div>
          <div className="flex items-center gap-2">
            <h1 className={`font-bold text-lg tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>StudioFlow</h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-500 dark:text-indigo-300 border border-indigo-500/30">
              Agência
            </span>
          </div>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Entre com seu email e senha para acessar a gestão de demandas
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className={`text-xs font-semibold block mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Email</label>
            <div className="relative">
              <Mail className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
              <input
                type="email"
                autoComplete="email"
                autoFocus
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@agencia.com"
                className={`w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-400/50 transition-all ${
                  isDark
                    ? 'bg-white/[0.05] border-white/10 text-slate-100 placeholder-slate-500 focus:bg-white/[0.08]'
                    : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>
          </div>

          <div>
            <label className={`text-xs font-semibold block mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Senha</label>
            <div className="relative">
              <Lock className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
              <input
                type="password"
                autoComplete="current-password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                className={`w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-400/50 transition-all ${
                  isDark
                    ? 'bg-white/[0.05] border-white/10 text-slate-100 placeholder-slate-500 focus:bg-white/[0.08]'
                    : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>
          </div>

          {error && (
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border ${
                isDark ? 'bg-rose-500/15 border-rose-500/30 text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-700'
              }`}
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-60 text-white text-sm font-bold shadow-lg shadow-indigo-600/30 border border-indigo-400/30 transition-all cursor-pointer"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            <span>{isSubmitting ? 'Entrando...' : 'Entrar'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
