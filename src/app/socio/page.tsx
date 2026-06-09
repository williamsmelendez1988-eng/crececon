'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  { href: '/socio', label: 'Mi Panel', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
  { href: '/socio/clientes', label: 'Mis Clientes', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg> },
  { href: '/socio/ganancias', label: 'Ganancias', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
];

export default function SocioDashboard() {
  const { user } = useAuth();
  const [clientes, setClientes] = useState(0);
  const [ganancias, setGanancias] = useState(0);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const snap = await getDocs(query(collection(db, 'usuarios'), where('setterId', '==', user.uid)));
      setClientes(snap.size);
    };
    load();
  }, [user]);

  return (
    <DashboardLayout navItems={navItems} title="Socio" roleColor="#8B5CF6">
      <div className="space-y-8">
        <div>
          <h1 className="font-syne font-black text-2xl text-white mb-1">Panel de Socio 🏆</h1>
          <p className="font-dm text-white/40 text-sm">Bienvenido, {user?.nombre}. Has alcanzado el nivel más alto.</p>
        </div>

        {/* Trophy card */}
        <div className="card relative overflow-hidden text-center py-10">
          <div className="absolute inset-0 bg-gradient-to-br from-[#8B5CF6]/10 to-transparent" />
          <div className="relative z-10">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="font-syne font-black text-3xl text-white mb-2">Socio CreceCon</h2>
            <p className="font-dm text-white/40 text-sm">50+ ventas realizadas — Nivel máximo</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Clientes propios', value: clientes, icon: '👥', color: '#8B5CF6' },
            { label: 'Ganancias totales', value: `$${ganancias}`, icon: '💰', color: '#22C55E' },
            { label: 'Rendimiento', value: '—', icon: '📈', color: '#F59E0B' },
          ].map((stat) => (
            <div key={stat.label} className="card glass-hover text-center">
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="font-syne font-black text-2xl text-white mb-1" style={{ color: stat.color }}>{stat.value}</div>
              <div className="font-dm text-white/40 text-xs">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Benefits */}
        <div className="card">
          <h2 className="font-syne font-bold text-white text-lg mb-6">Tus beneficios como Socio</h2>
          <div className="space-y-3">
            {[
              { icon: '💵', title: 'Comisiones elevadas', desc: 'Mayor porcentaje por cada cliente que traes' },
              { icon: '📊', title: 'Panel exclusivo', desc: 'Acceso a métricas avanzadas y reportes de rendimiento' },
              { icon: '🤝', title: 'Ingresos compartidos', desc: 'Participación en las ganancias de tus clientes activos' },
              { icon: '🎓', title: 'Formación premium', desc: 'Acceso a todos los cursos avanzados y materiales exclusivos' },
            ].map((b) => (
              <div key={b.title} className="flex items-center gap-4 p-4 rounded-xl bg-white/2 border border-white/5">
                <span className="text-2xl">{b.icon}</span>
                <div>
                  <div className="font-syne font-semibold text-white text-sm">{b.title}</div>
                  <div className="font-dm text-white/40 text-xs mt-0.5">{b.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
