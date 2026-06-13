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
    <div
      className="grid-pattern"
      style={{
        minHeight: '100dvh',
        background: '#050508',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px 60px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Glow */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 500,
        height: 500,
        borderRadius: '50%',
        background: 'rgba(34,197,94,0.05)',
        filter: 'blur(120px)',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 10 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 24, textDecoration: 'none' }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #22C55E, #1A3A8F)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, color: '#fff', fontSize: 18 }}>C</span>
            </div>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#fff', fontSize: 24 }}>CreceCon</span>
          </Link>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 24, color: '#fff', margin: '0 0 8px' }}>
            {resetMode ? 'Recuperar contraseña' : 'Bienvenido de vuelta'}
          </h1>
          <p style={{ fontFamily: 'DM Sans, sans-serif', color: 'rgba(255,255,255,0.4)', fontSize: 14, margin: 0 }}>
            {resetMode ? 'Te enviaremos un enlace a tu correo' : 'Accede a tu panel personalizado'}
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '28px 24px' }}>
          {resetSent ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>📧</div>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#fff', fontSize: 18, marginBottom: 8 }}>
                Correo enviado
              </h3>
              <p style={{ fontFamily: 'DM Sans, sans-serif', color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 24 }}>
                Revisa tu bandeja de entrada y sigue las instrucciones.
              </p>
              <button
                onClick={() => { setResetMode(false); setResetSent(false); }}
                className="btn-outline"
                style={{ padding: '10px 24px', fontSize: 14 }}
              >
                Volver al login
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Correo electrónico
                </label>
                <input
                  type="email"
                  required
                  className="input-field"
                  style={{ width: '100%', fontSize: 16 }}
                  placeholder="tu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>

              {!resetMode && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <label style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1 }}>
                      Contraseña
                    </label>
                    <button
                      type="button"
                      onClick={() => setResetMode(true)}
                      style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#22C55E', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                  <input
                    type="password"
                    required
                    className="input-field"
                    style={{ width: '100%', fontSize: 16 }}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
              )}

              {error && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '12px 14px' }}>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#F87171', fontSize: 14, margin: 0 }}>{error}</p>
                </div>
              )}

              <button
                onClick={resetMode ? handleReset : handleLogin}
                disabled={loading}
                className="btn-primary"
                style={{ width: '100%', padding: '14px', fontSize: 15, fontFamily: 'Syne, sans-serif', fontWeight: 700, opacity: loading ? 0.6 : 1, marginTop: 4 }}
              >
                {loading ? 'Procesando...' : resetMode ? 'Enviar correo de recuperación' : 'Iniciar sesión →'}
              </button>

              {resetMode && (
                <button
                  type="button"
                  onClick={() => setResetMode(false)}
                  style={{ width: '100%', textAlign: 'center', fontSize: 14, fontFamily: 'DM Sans, sans-serif', color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0' }}
                >
                  ← Volver al login
                </button>
              )}
            </div>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 12, fontFamily: 'DM Sans, sans-serif', color: 'rgba(255,255,255,0.3)' }}>
          © {new Date().getFullYear()} CreceCon — Sistema de crecimiento digital
        </p>
      </div>
    </div>
  );
}