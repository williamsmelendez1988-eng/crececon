'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { login, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch {
      setError('Correo o contraseña incorrectos.');
    }
    setLoading(false);
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await resetPassword(email);
      setResetSent(true);
    } catch {
      setError('No se pudo enviar el correo. Verifica el email.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#050508] grid-pattern flex items-center justify-center px-4 relative overflow-hidden">
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#22C55E]/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#22C55E] to-[#1A3A8F] flex items-center justify-center">
              <span className="font-syne font-black text-white text-lg">C</span>
            </div>
            <span className="font-syne font-bold text-white text-2xl">CreceCon</span>
          </Link>
          <h1 className="font-syne font-black text-2xl text-white mb-2">
            {resetMode ? 'Recuperar contraseña' : 'Bienvenido de vuelta'}
          </h1>
          <p className="font-dm text-white/40 text-sm">
            {resetMode ? 'Te enviaremos un enlace a tu correo' : 'Accede a tu panel personalizado'}
          </p>
        </div>

        {/* Card */}
        <div className="card">
          {resetSent ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-4">📧</div>
              <h3 className="font-syne font-bold text-white text-lg mb-2">Correo enviado</h3>
              <p className="font-dm text-white/50 text-sm mb-6">Revisa tu bandeja de entrada y sigue las instrucciones.</p>
              <button onClick={() => { setResetMode(false); setResetSent(false); }} className="btn-outline px-6 py-2.5 rounded-xl text-sm font-dm">
                Volver al login
              </button>
            </div>
          ) : (
            <form onSubmit={resetMode ? handleReset : handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-dm text-white/40 mb-2 uppercase tracking-wider">Correo electrónico</label>
                <input type="email" required className="input-field" placeholder="tu@email.com"
                  value={email} onChange={e => setEmail(e.target.value)} />
              </div>

              {!resetMode && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-dm text-white/40 uppercase tracking-wider">Contraseña</label>
                    <button type="button" onClick={() => setResetMode(true)} className="text-xs font-dm text-[#22C55E] hover:underline">
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                  <input type="password" required className="input-field" placeholder="••••••••"
                    value={password} onChange={e => setPassword(e.target.value)} />
                </div>
              )}

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                  <p className="text-red-400 text-sm font-dm">{error}</p>
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 rounded-xl font-syne font-bold text-sm disabled:opacity-50">
                {loading ? 'Procesando...' : resetMode ? 'Enviar correo de recuperación' : 'Iniciar sesión →'}
              </button>

              {resetMode && (
                <button type="button" onClick={() => setResetMode(false)} className="w-full text-center text-sm font-dm text-white/40 hover:text-white transition-colors">
                  ← Volver al login
                </button>
              )}
            </form>
          )}
        </div>

        <p className="text-center mt-6 text-xs font-dm text-white/30">
          © {new Date().getFullYear()} CreceCon — Sistema de crecimiento digital
        </p>
      </div>
    </div>
  );
}
