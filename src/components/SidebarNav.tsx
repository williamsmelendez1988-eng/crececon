'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface NavLink {
  href: string;
  label: string;
  icon: string;
}

interface SidebarNavProps {
  links: NavLink[];
  active: string;
}

export default function SidebarNav({ links, active }: SidebarNavProps) {
  const { logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const Logo = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: 34, height: 34, borderRadius: 10,
        background: 'linear-gradient(135deg, #1A3A8F, #2563EB)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <span style={{ color: '#fff', fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 17 }}>C</span>
      </div>
      <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, color: '#fff' }}>
        Crece<span style={{ color: '#22C55E' }}>Con</span>
      </span>
    </div>
  );

  return (
    <>
      {/* ===== SIDEBAR DESKTOP ===== */}
      <aside style={{
        width: 240,
        position: 'fixed', top: 0, left: 0,
        height: '100vh',
        display: 'flex', flexDirection: 'column',
        padding: '24px 16px',
        borderRight: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(5,8,20,0.98)',
        backdropFilter: 'blur(20px)',
        zIndex: 50, boxSizing: 'border-box',
      }} className="crececon-sidebar">
        <div style={{ marginBottom: 32, padding: '0 8px' }}>
          <Logo />
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          {links.map((link) => {
            const isActive = active === link.label;
            return (
              <div
                key={link.href}
                onClick={() => router.push(link.href)}
                className="glass-hover"
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px', borderRadius: 10,
                  fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.65)',
                  background: isActive ? 'rgba(34,197,94,0.12)' : 'transparent',
                  border: isActive ? '1px solid rgba(34,197,94,0.3)' : '1px solid transparent',
                  transition: 'all 0.2s ease',
                }}
              >
                <span style={{ fontSize: 16 }}>{link.icon}</span>
                {link.label}
              </div>
            );
          })}
        </nav>
        <button
          onClick={handleLogout}
          className="btn-outline"
          style={{ width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 8 }}
        >
          🚪 Cerrar sesión
        </button>
      </aside>

      {/* ===== TOPBAR MOBILE ===== */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(5,8,20,0.98)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '0 16px', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }} className="crececon-topbar">
        <Logo />
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8, color: '#fff',
            width: 38, height: 38,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: 18,
          }}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </header>

      {/* ===== MENU MOBILE DESPLEGABLE ===== */}
      {menuOpen && (
        <div style={{
          position: 'fixed', top: 60, left: 0, right: 0, zIndex: 49,
          background: 'rgba(5,8,20,0.99)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          padding: '12px 16px 20px',
        }} className="crececon-topbar">
          {links.map((link) => {
            const isActive = active === link.label;
            return (
              <div
                key={link.href}
                onClick={() => { router.push(link.href); setMenuOpen(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px', borderRadius: 10,
                  fontSize: 15, fontWeight: 600, cursor: 'pointer',
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.65)',
                  background: isActive ? 'rgba(34,197,94,0.12)' : 'transparent',
                  border: isActive ? '1px solid rgba(34,197,94,0.3)' : '1px solid transparent',
                  marginBottom: 4,
                }}
              >
                <span style={{ fontSize: 18 }}>{link.icon}</span>
                {link.label}
              </div>
            );
          })}
          <button
            onClick={handleLogout}
            style={{
              width: '100%', marginTop: 8, padding: '12px', borderRadius: 10,
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)',
              color: '#F87171', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 8,
            }}
          >
            🚪 Cerrar sesión
          </button>
        </div>
      )}

      <style>{`
        .crececon-sidebar { display: flex !important; }
        .crececon-topbar { display: none !important; }
        @media (max-width: 768px) {
          .crececon-sidebar { display: none !important; }
          .crececon-topbar { display: flex !important; }
        }
      `}</style>
    </>
  );
}