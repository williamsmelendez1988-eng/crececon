'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { db } from '@/lib/firebase';
import { collection, getDocs, updateDoc, doc, arrayUnion, orderBy, query } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
  { href: '/admin/clientes', label: 'Clientes', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg> },
  { href: '/admin/leads', label: 'Leads / CRM', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
  { href: '/admin/cursos', label: 'Cursos LMS', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg> },
  { href: '/admin/tickets', label: 'Soporte', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
];

export default function AdminTickets() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [active, setActive] = useState<any>(null);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState('todos');

  const load = async () => {
    setLoading(true);
    const snap = await getDocs(query(collection(db, 'tickets'), orderBy('createdAt', 'desc')));
    setTickets(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const changeEstado = async (id: string, estado: string) => {
    await updateDoc(doc(db, 'tickets', id), { estado });
    setTickets(prev => prev.map(t => t.id === id ? { ...t, estado } : t));
    if (active?.id === id) setActive((p: any) => ({ ...p, estado }));
  };

  const sendReply = async () => {
    if (!user || !reply.trim() || !active) return;
    setSending(true);
    const respuesta = {
      id: Date.now().toString(),
      autorId: user.uid,
      autorNombre: user.nombre,
      mensaje: reply,
      esAdmin: true,
      createdAt: new Date().toISOString(),
    };
    await updateDoc(doc(db, 'tickets', active.id), { respuestas: arrayUnion(respuesta), estado: 'en_proceso' });
    setReply('');
    setActive((p: any) => ({ ...p, respuestas: [...(p.respuestas || []), respuesta], estado: 'en_proceso' }));
    setTickets(prev => prev.map(t => t.id === active.id ? { ...t, estado: 'en_proceso' } : t));
    setSending(false);
  };

  const filtered = filter === 'todos' ? tickets : tickets.filter(t => t.estado === filter);

  const statusColor = (e: string) => e === 'abierto' ? 'badge-yellow' : e === 'en_proceso' ? 'badge-blue' : 'badge-green';

  return (
    <DashboardLayout navItems={navItems} title="Administrador" roleColor="#22C55E">
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-syne font-black text-2xl text-white">Centro de Soporte</h1>
            <p className="font-dm text-white/40 text-sm">{tickets.length} tickets en total</p>
          </div>
          <div className="flex gap-2">
            {['todos', 'abierto', 'en_proceso', 'resuelto'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`text-xs px-3 py-1.5 rounded-lg font-dm border transition-all capitalize ${
                  filter === f ? 'border-[#22C55E]/40 bg-[#22C55E]/10 text-[#22C55E]' : 'border-white/10 text-white/40 hover:text-white'
                }`}>
                {f.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ticket list */}
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-12 text-white/30 font-dm">Cargando...</div>
            ) : filtered.length === 0 ? (
              <div className="card text-center py-12">
                <div className="text-4xl mb-3">🎫</div>
                <p className="font-dm text-white/40 text-sm">No hay tickets</p>
              </div>
            ) : filtered.map((t: any) => (
              <div key={t.id} onClick={() => setActive(t)}
                className={`card cursor-pointer glass-hover transition-all ${active?.id === t.id ? 'border-[#22C55E]/30' : ''}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-syne font-semibold text-white text-sm mb-1 truncate">{t.asunto}</div>
                    <div className="font-dm text-white/40 text-xs">{t.clienteNombre}</div>
                  </div>
                  <span className={`badge flex-shrink-0 ${statusColor(t.estado)}`}>{t.estado?.replace('_', ' ')}</span>
                </div>
                <div className="mt-2 font-dm text-white/20 text-xs">{t.respuestas?.length || 0} respuestas</div>
              </div>
            ))}
          </div>

          {/* Chat */}
          {active && (
            <div className="card flex flex-col" style={{ minHeight: '450px' }}>
              <div className="flex items-start justify-between mb-4 pb-4 border-b border-white/5">
                <div>
                  <h3 className="font-syne font-bold text-white">{active.asunto}</h3>
                  <p className="font-dm text-white/40 text-xs mt-1">Cliente: {active.clienteNombre}</p>
                </div>
                <div className="flex items-center gap-2">
                  {active.estado !== 'resuelto' && (
                    <button onClick={() => changeEstado(active.id, 'resuelto')}
                      className="text-xs font-dm text-[#22C55E] border border-[#22C55E]/30 px-3 py-1.5 rounded-lg hover:bg-[#22C55E]/10 transition-colors">
                      Marcar resuelto
                    </button>
                  )}
                  <button onClick={() => setActive(null)} className="text-white/30 hover:text-white">✕</button>
                </div>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto mb-4" style={{ maxHeight: '280px' }}>
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#F59E0B] flex items-center justify-center text-xs font-bold text-black flex-shrink-0">
                    {active.clienteNombre?.charAt(0)}
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 flex-1">
                    <div className="font-dm text-xs text-white/40 mb-1">{active.clienteNombre}</div>
                    <div className="font-dm text-sm text-white">{active.mensaje}</div>
                  </div>
                </div>
                {active.respuestas?.map((r: any) => (
                  <div key={r.id} className={`flex gap-3 ${r.esAdmin ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${r.esAdmin ? 'bg-[#22C55E] text-white' : 'bg-[#F59E0B] text-black'}`}>
                      {r.autorNombre?.charAt(0)}
                    </div>
                    <div className={`rounded-xl p-3 max-w-xs ${r.esAdmin ? 'bg-[#22C55E]/10 border border-[#22C55E]/20' : 'bg-white/5'}`}>
                      <div className="font-dm text-xs text-white/40 mb-1">{r.autorNombre}</div>
                      <div className="font-dm text-sm text-white">{r.mensaje}</div>
                    </div>
                  </div>
                ))}
              </div>

              {active.estado !== 'resuelto' && (
                <div className="flex gap-2 border-t border-white/5 pt-4">
                  <input className="input-field flex-1 text-sm py-2.5" placeholder="Responder al cliente..."
                    value={reply} onChange={e => setReply(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendReply()} />
                  <button onClick={sendReply} disabled={sending || !reply.trim()}
                    className="btn-primary px-4 py-2.5 rounded-xl font-syne font-bold text-sm disabled:opacity-50">→</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
