'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  { href: '/cliente', label: 'Mi Proyecto', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
  { href: '/cliente/onboarding', label: 'Onboarding', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> },
  { href: '/cliente/archivos', label: 'Centro de archivos', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg> },
  { href: '/cliente/facturas', label: 'Facturas', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
  { href: '/cliente/soporte', label: 'Soporte', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
];

const ETAPAS = [
  { key: 'informacion', label: 'Información recibida', icon: '📋' },
  { key: 'diseno', label: 'Diseño', icon: '🎨' },
  { key: 'desarrollo', label: 'Desarrollo', icon: '⚙️' },
  { key: 'seo', label: 'SEO', icon: '🔍' },
  { key: 'publicacion', label: 'Publicación', icon: '🚀' },
];

export default function ClienteDashboard() {
  const { user } = useAuth();
  const [proyecto, setProyecto] = useState<any>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        // Load project
        const clienteDoc = await getDoc(doc(db, 'usuarios', user.uid));
        const clienteData = clienteDoc.data();
        if (clienteData?.proyectoId) {
          const proyectoDoc = await getDoc(doc(db, 'proyectos', clienteData.proyectoId));
          if (proyectoDoc.exists()) setProyecto({ id: proyectoDoc.id, ...proyectoDoc.data() });
        }
        // Load recent tickets
        const ticketsSnap = await getDocs(query(collection(db, 'tickets'), where('clienteId', '==', user.uid)));
        setTickets(ticketsSnap.docs.map(d => ({ id: d.id, ...d.data() })).slice(0, 3));
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    load();
  }, [user]);

  return (
    <DashboardLayout navItems={navItems} title="Cliente" roleColor="#F59E0B">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-syne font-black text-2xl text-white mb-1">
            Bienvenido, {user?.nombre?.split(' ')[0]} 👋
          </h1>
          <p className="font-dm text-white/40 text-sm">Aquí puedes seguir el avance de tu proyecto en tiempo real</p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-white/30 font-dm">Cargando tu proyecto...</div>
        ) : !proyecto ? (
          <div className="card text-center py-16">
            <div className="text-5xl mb-4">🏗️</div>
            <h2 className="font-syne font-bold text-white text-xl mb-2">Tu proyecto está siendo configurado</h2>
            <p className="font-dm text-white/40 text-sm mb-6">Mientras tanto, completa tu onboarding para que podamos comenzar.</p>
            <a href="/cliente/onboarding" className="btn-primary px-8 py-3 rounded-xl font-syne font-bold text-sm inline-block">
              Completar onboarding →
            </a>
          </div>
        ) : (
          <>
            {/* Project card */}
            <div className="card relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#F59E0B]/50 to-transparent" />
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="font-syne font-bold text-white text-xl mb-1">{proyecto.nombre}</h2>
                  <p className="font-dm text-white/40 text-sm">{proyecto.descripcion}</p>
                </div>
                <span className={`badge ${proyecto.estado === 'activo' ? 'badge-green' : proyecto.estado === 'completado' ? 'badge-blue' : 'badge-yellow'}`}>
                  {proyecto.estado}
                </span>
              </div>

              {/* Progress stages */}
              <div className="space-y-4">
                {ETAPAS.map((etapa) => {
                  const pct = proyecto.progreso?.[etapa.key] ?? 0;
                  return (
                    <div key={etapa.key}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{etapa.icon}</span>
                          <span className="font-dm text-sm font-medium text-white">{etapa.label}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          {pct === 0 ? (
                            <span className="badge badge-gray">Pendiente</span>
                          ) : pct === 100 ? (
                            <span className="badge badge-green">✓ Completado</span>
                          ) : (
                            <span className="badge badge-yellow">En proceso</span>
                          )}
                          <span className="font-syne font-bold text-sm" style={{
                            color: pct === 100 ? '#22C55E' : pct > 0 ? '#F59E0B' : 'rgba(255,255,255,0.3)'
                          }}>{pct}%</span>
                        </div>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{
                          width: `${pct}%`,
                          background: pct === 100 ? 'linear-gradient(90deg, #22C55E, #16A34A)' :
                            pct > 0 ? 'linear-gradient(90deg, #F59E0B, #D97706)' : 'transparent'
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Recent tickets */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-syne font-bold text-white text-lg">Soporte reciente</h2>
            <a href="/cliente/soporte" className="text-xs font-dm text-[#F59E0B] hover:underline">Ver todos →</a>
          </div>
          {tickets.length === 0 ? (
            <div className="text-center py-8">
              <p className="font-dm text-white/30 text-sm">No hay tickets de soporte</p>
              <a href="/cliente/soporte" className="text-xs font-dm text-[#F59E0B] hover:underline mt-2 block">Crear ticket →</a>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket: any) => (
                <div key={ticket.id} className="flex items-center justify-between p-3 rounded-xl bg-white/2 border border-white/5">
                  <div>
                    <div className="font-dm text-sm text-white font-medium">{ticket.asunto}</div>
                    <div className="font-dm text-xs text-white/30 mt-0.5">{ticket.mensaje?.slice(0, 60)}...</div>
                  </div>
                  <span className={`badge flex-shrink-0 ${
                    ticket.estado === 'abierto' ? 'badge-yellow' :
                    ticket.estado === 'en_proceso' ? 'badge-blue' : 'badge-green'
                  }`}>{ticket.estado?.replace('_', ' ')}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Completar onboarding', href: '/cliente/onboarding', icon: '📝' },
            { label: 'Ver archivos', href: '/cliente/archivos', icon: '📁' },
            { label: 'Mis facturas', href: '/cliente/facturas', icon: '💳' },
            { label: 'Crear ticket', href: '/cliente/soporte', icon: '🎫' },
          ].map((a) => (
            <a key={a.label} href={a.href} className="card glass-hover text-center group block">
              <div className="text-2xl mb-2">{a.icon}</div>
              <div className="font-dm text-white/60 text-xs group-hover:text-white transition-colors">{a.label}</div>
            </a>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
