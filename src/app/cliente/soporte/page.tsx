'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, orderBy, doc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  { href: '/cliente', label: 'Mi Proyecto', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
  { href: '/cliente/onboarding', label: 'Onboarding', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/></svg> },
  { href: '/cliente/soporte', label: 'Soporte', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
];

export default function ClienteSoporte() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [activeTicket, setActiveTicket] = useState<any>(null);
  const [showNew, setShowNew] = useState(false);
  const [newTicket, setNewTicket] = useState({ asunto: '', mensaje: '' });
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const load = async () => {
    if (!user) return;
    const snap = await getDocs(query(collection(db, 'tickets'), where('clienteId', '==', user.uid), orderBy('createdAt', 'desc')));
    setTickets(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const createTicket = async () => {
    if (!user || !newTicket.asunto || !newTicket.mensaje) return;
    setSending(true);
    await addDoc(collection(db, 'tickets'), {
      clienteId: user.uid,
      clienteNombre: user.nombre,
      asunto: newTicket.asunto,
      mensaje: newTicket.mensaje,
      estado: 'abierto',
      respuestas: [],
      createdAt: serverTimestamp(),
    });
    setNewTicket({ asunto: '', mensaje: '' });
    setShowNew(false);
    setSending(false);
    await load();
  };

  const sendReply = async () => {
    if (!user || !reply.trim() || !activeTicket) return;
    setSending(true);
    const respuesta = {
      id: Date.now().toString(),
      autorId: user.uid,
      autorNombre: user.nombre,
      mensaje: reply,
      createdAt: new Date().toISOString(),
    };
    await updateDoc(doc(db, 'tickets', activeTicket.id), {
      respuestas: arrayUnion(respuesta),
    });
    setReply('');
    setActiveTicket((prev: any) => ({ ...prev, respuestas: [...(prev.respuestas || []), respuesta] }));
    setSending(false);
  };

  const statusColor = (estado: string) => {
    if (estado === 'abierto') return 'badge-yellow';
    if (estado === 'en_proceso') return 'badge-blue';
    return 'badge-green';
  };

  return (
    <DashboardLayout navItems={navItems} title="Cliente" roleColor="#F59E0B">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-syne font-black text-2xl text-white mb-1">Centro de Soporte</h1>
            <p className="font-dm text-white/40 text-sm">Crea tickets y comunícate con nuestro equipo</p>
          </div>
          <button onClick={() => setShowNew(true)} className="btn-primary px-5 py-2.5 rounded-xl font-syne font-bold text-sm">
            + Nuevo ticket
          </button>
        </div>

        {/* New ticket modal */}
        {showNew && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg card space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-syne font-bold text-white text-xl">Nuevo ticket</h2>
                <button onClick={() => setShowNew(false)} className="text-white/40 hover:text-white">✕</button>
              </div>
              <div>
                <label className="block text-xs font-dm text-white/40 mb-2 uppercase tracking-wider">Asunto</label>
                <input className="input-field" placeholder="Describe brevemente tu consulta"
                  value={newTicket.asunto} onChange={e => setNewTicket({ ...newTicket, asunto: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-dm text-white/40 mb-2 uppercase tracking-wider">Mensaje</label>
                <textarea rows={4} className="input-field resize-none" placeholder="Explica en detalle tu consulta o problema..."
                  value={newTicket.mensaje} onChange={e => setNewTicket({ ...newTicket, mensaje: e.target.value })} />
              </div>
              <div className="flex gap-3">
                <button onClick={createTicket} disabled={sending} className="btn-primary flex-1 py-3 rounded-xl font-syne font-bold text-sm disabled:opacity-50">
                  {sending ? 'Enviando...' : 'Crear ticket'}
                </button>
                <button onClick={() => setShowNew(false)} className="btn-outline px-6 py-3 rounded-xl font-dm text-sm">Cancelar</button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ticket list */}
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-12 text-white/30 font-dm">Cargando tickets...</div>
            ) : tickets.length === 0 ? (
              <div className="card text-center py-12">
                <div className="text-4xl mb-3">🎫</div>
                <p className="font-dm text-white/40 text-sm">No tienes tickets aún</p>
              </div>
            ) : tickets.map((ticket: any) => (
              <div key={ticket.id}
                onClick={() => setActiveTicket(ticket)}
                className={`card cursor-pointer transition-all glass-hover ${activeTicket?.id === ticket.id ? 'border-[#F59E0B]/30' : ''}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-syne font-semibold text-white text-sm mb-1 truncate">{ticket.asunto}</div>
                    <div className="font-dm text-white/40 text-xs truncate">{ticket.mensaje}</div>
                  </div>
                  <span className={`badge flex-shrink-0 ${statusColor(ticket.estado)}`}>
                    {ticket.estado?.replace('_', ' ')}
                  </span>
                </div>
                <div className="mt-2 text-xs font-dm text-white/20">
                  {ticket.respuestas?.length || 0} respuestas
                </div>
              </div>
            ))}
          </div>

          {/* Chat view */}
          {activeTicket && (
            <div className="card flex flex-col" style={{ minHeight: '400px' }}>
              <div className="flex items-start justify-between mb-4 pb-4 border-b border-white/5">
                <div>
                  <h3 className="font-syne font-bold text-white">{activeTicket.asunto}</h3>
                  <span className={`badge mt-1 ${statusColor(activeTicket.estado)}`}>{activeTicket.estado?.replace('_', ' ')}</span>
                </div>
                <button onClick={() => setActiveTicket(null)} className="text-white/30 hover:text-white text-lg">✕</button>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto mb-4" style={{ maxHeight: '300px' }}>
                {/* Original message */}
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#F59E0B] flex items-center justify-center text-xs font-bold text-black flex-shrink-0">
                    {user?.nombre?.charAt(0)}
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 flex-1">
                    <div className="font-dm text-xs text-white/40 mb-1">{user?.nombre} — mensaje original</div>
                    <div className="font-dm text-sm text-white">{activeTicket.mensaje}</div>
                  </div>
                </div>

                {/* Replies */}
                {activeTicket.respuestas?.map((r: any) => (
                  <div key={r.id} className={`flex gap-3 ${r.autorId === user?.uid ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      r.autorId === user?.uid ? 'bg-[#F59E0B] text-black' : 'bg-[#22C55E] text-white'
                    }`}>
                      {r.autorNombre?.charAt(0)}
                    </div>
                    <div className={`rounded-xl p-3 max-w-xs ${r.autorId === user?.uid ? 'bg-[#F59E0B]/10 border border-[#F59E0B]/20' : 'bg-white/5'}`}>
                      <div className="font-dm text-xs text-white/40 mb-1">{r.autorNombre}</div>
                      <div className="font-dm text-sm text-white">{r.mensaje}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply input */}
              {activeTicket.estado !== 'resuelto' && (
                <div className="flex gap-2 border-t border-white/5 pt-4">
                  <input className="input-field flex-1 text-sm py-2.5" placeholder="Escribe tu respuesta..."
                    value={reply} onChange={e => setReply(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendReply()} />
                  <button onClick={sendReply} disabled={sending || !reply.trim()}
                    className="btn-primary px-4 py-2.5 rounded-xl font-syne font-bold text-sm disabled:opacity-50">
                    →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
