'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  { href: '/setter', label: 'Mi Panel', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
  { href: '/setter/cursos', label: 'Mi Formación', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg> },
  { href: '/setter/clientes', label: 'Mis Clientes', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg> },
  { href: '/setter/ranking', label: 'Ranking', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 20 18 10"/><polyline points="12 20 12 4"/><polyline points="6 20 6 14"/></svg> },
];

const NIVEL_THRESHOLDS = { junior: 0, senior: 20, socio: 50 };

export default function SetterDashboard() {
  const { user } = useAuth();
  const [ventas, setVentas] = useState(0);
  const [comisiones, setComisiones] = useState(0);
  const [clientes, setClientes] = useState(0);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const snap = await getDocs(query(collection(db, 'usuarios'), where('setterId', '==', user.uid)));
        setClientes(snap.size);
      } catch (err) { console.error(err); }
    };
    load();
  }, [user]);

  const nivel = ventas >= 50 ? 'Socio' : ventas >= 20 ? 'Setter Senior' : 'Setter Junior';
  const nextLevel = ventas >= 50 ? null : ventas >= 20 ? { name: 'Socio', at: 50 } : { name: 'Setter Senior', at: 20 };
  const progress = nextLevel ? Math.min((ventas / nextLevel.at) * 100, 100) : 100;

  return (
    <DashboardLayout navItems={navItems} title="Setter" roleColor="#2563EB">
      <div className="space-y-8">
        <div>
          <h1 className="font-syne font-black text-2xl text-white mb-1">Mi Panel</h1>
          <p className="font-dm text-white/40 text-sm">Hola {user?.nombre}, aquí está tu rendimiento</p>
        </div>

        {/* Nivel card */}
        <div className="card relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#2563EB]/50 to-transparent" />
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-syne font-black text-3xl text-white mb-1">{nivel}</div>
              <div className="font-dm text-white/40 text-sm">{ventas} ventas realizadas</div>
            </div>
            <div className="text-5xl">
              {ventas >= 50 ? '🏆' : ventas >= 20 ? '⭐' : '🚀'}
            </div>
          </div>
          {nextLevel && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-dm text-white/40">Progreso hacia {nextLevel.name}</span>
                <span className="text-xs font-dm text-[#2563EB]">{ventas}/{nextLevel.at} ventas</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #2563EB, #22C55E)' }} />
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Ventas', value: ventas, icon: '💰', color: '#22C55E' },
            { label: 'Clientes captados', value: clientes, icon: '👥', color: '#2563EB' },
            { label: 'Comisiones ($)', value: `$${comisiones}`, icon: '📈', color: '#F59E0B' },
          ].map((stat) => (
            <div key={stat.label} className="card glass-hover text-center">
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="font-syne font-black text-2xl text-white mb-1" style={{ color: stat.color }}>{stat.value}</div>
              <div className="font-dm text-white/40 text-xs">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Ascenso milestones */}
        <div className="card">
          <h2 className="font-syne font-bold text-white text-lg mb-6">Sistema de Ascensos</h2>
          <div className="space-y-4">
            {[
              { nivel: 'Setter Junior', ventas: 0, desc: 'Nivel de entrada — acceso a cursos base', icon: '🚀' },
              { nivel: 'Setter Senior', ventas: 20, desc: 'Acceso a materiales avanzados y mayores comisiones', icon: '⭐' },
              { nivel: 'Socio', ventas: 50, desc: 'Panel de socio, ingresos compartidos y beneficios exclusivos', icon: '🏆' },
            ].map((milestone) => (
              <div key={milestone.nivel} className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                ventas >= milestone.ventas
                  ? 'border-[#22C55E]/30 bg-[#22C55E]/5'
                  : 'border-white/5 bg-white/2'
              }`}>
                <div className="text-2xl">{milestone.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-syne font-bold text-white text-sm">{milestone.nivel}</span>
                    {ventas >= milestone.ventas && <span className="badge badge-green text-xs">✓ Alcanzado</span>}
                  </div>
                  <div className="font-dm text-white/40 text-xs">{milestone.desc}</div>
                </div>
                <div className="font-syne font-bold text-white/30 text-sm">{milestone.ventas} ventas</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
