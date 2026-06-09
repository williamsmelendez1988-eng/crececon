'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
  { href: '/admin/clientes', label: 'Clientes', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { href: '/admin/setters', label: 'Setters', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  { href: '/admin/proyectos', label: 'Proyectos', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg> },
  { href: '/admin/leads', label: 'Leads / CRM', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
  { href: '/admin/cursos', label: 'Cursos LMS', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg> },
  { href: '/admin/tickets', label: 'Soporte', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
  { href: '/admin/facturacion', label: 'Facturación', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
];

interface Stat { label: string; value: string | number; change: string; color: string; }

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stat[]>([
    { label: 'Clientes activos', value: '—', change: '', color: '#22C55E' },
    { label: 'Leads nuevos', value: '—', change: '', color: '#2563EB' },
    { label: 'Proyectos activos', value: '—', change: '', color: '#F59E0B' },
    { label: 'Setters', value: '—', change: '', color: '#8B5CF6' },
  ]);
  const [leads, setLeads] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [clientesSnap, leadsSnap, proyectosSnap, settersSnap] = await Promise.all([
          getDocs(query(collection(db, 'usuarios'), limit(100))),
          getDocs(query(collection(db, 'leads'), orderBy('createdAt', 'desc'), limit(5))),
          getDocs(collection(db, 'proyectos')),
          getDocs(collection(db, 'usuarios')),
        ]);

        const usuarios = clientesSnap.docs.map(d => d.data());
        const clientes = usuarios.filter((u: any) => u.rol === 'cliente').length;
        const settersCount = usuarios.filter((u: any) => u.rol === 'setter').length;

        setStats([
          { label: 'Clientes activos', value: clientes, change: 'Total registrados', color: '#22C55E' },
          { label: 'Leads nuevos', value: leadsSnap.size, change: 'Últimos registros', color: '#2563EB' },
          { label: 'Proyectos activos', value: proyectosSnap.size, change: 'En curso', color: '#F59E0B' },
          { label: 'Setters', value: settersCount, change: 'Equipo de ventas', color: '#8B5CF6' },
        ]);

        setLeads(leadsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  return (
    <DashboardLayout navItems={navItems} title="Administrador" roleColor="#22C55E">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-syne font-black text-2xl text-white mb-1">Panel de Control</h1>
          <p className="font-dm text-white/40 text-sm">Vista general de CreceCon en tiempo real</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="card glass-hover">
              <div className="flex items-start justify-between mb-3">
                <div className="w-2 h-2 rounded-full mt-1" style={{ background: stat.color }} />
                <div className="text-xs font-dm text-white/30 uppercase tracking-wider">{stat.change}</div>
              </div>
              <div className="font-syne font-black text-3xl text-white mb-1" style={{ color: stat.color }}>{stat.value}</div>
              <div className="font-dm text-white/50 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Recent Leads */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-syne font-bold text-white text-lg">Leads recientes</h2>
            <a href="/admin/leads" className="text-xs font-dm text-[#22C55E] hover:underline">Ver todos →</a>
          </div>
          {leads.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">📭</div>
              <p className="font-dm text-white/30 text-sm">Aún no hay leads registrados</p>
            </div>
          ) : (
            <div className="space-y-3">
              {leads.map((lead: any) => (
                <div key={lead.id} className="flex items-center justify-between p-4 rounded-xl bg-white/2 border border-white/5 hover:bg-white/4 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#22C55E] to-[#1A3A8F] flex items-center justify-center">
                      <span className="text-xs font-syne font-bold text-white">{lead.nombre?.charAt(0) || '?'}</span>
                    </div>
                    <div>
                      <div className="font-dm font-medium text-white text-sm">{lead.nombre}</div>
                      <div className="font-dm text-white/40 text-xs">{lead.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-dm text-white/40 text-xs hidden md:block">{lead.servicio}</span>
                    <span className={`badge ${lead.estado === 'nuevo' ? 'badge-green' : lead.estado === 'contactado' ? 'badge-blue' : 'badge-gray'}`}>
                      {lead.estado}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Nuevo cliente', href: '/admin/clientes/nuevo', icon: '👤', color: '#22C55E' },
            { label: 'Nuevo proyecto', href: '/admin/proyectos/nuevo', icon: '📁', color: '#2563EB' },
            { label: 'Nuevo curso', href: '/admin/cursos/nuevo', icon: '🎓', color: '#F59E0B' },
            { label: 'Ver tickets', href: '/admin/tickets', icon: '🎫', color: '#8B5CF6' },
          ].map((action) => (
            <a key={action.label} href={action.href}
              className="card glass-hover text-center group cursor-pointer block">
              <div className="text-2xl mb-2">{action.icon}</div>
              <div className="font-dm text-white/60 text-xs group-hover:text-white transition-colors">{action.label}</div>
            </a>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
