'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { db } from '@/lib/firebase';
import { collection, getDocs, updateDoc, doc, orderBy, query } from 'firebase/firestore';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
  { href: '/admin/clientes', label: 'Clientes', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg> },
  { href: '/admin/leads', label: 'Leads / CRM', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
  { href: '/admin/cursos', label: 'Cursos LMS', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg> },
  { href: '/admin/tickets', label: 'Soporte', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
];

const COLUMNAS = [
  { id: 'nuevo', label: 'Nuevo', color: '#22C55E', badgeClass: 'badge-green' },
  { id: 'contactado', label: 'Contactado', color: '#2563EB', badgeClass: 'badge-blue' },
  { id: 'propuesta', label: 'Propuesta enviada', color: '#F59E0B', badgeClass: 'badge-yellow' },
  { id: 'cerrado', label: 'Cerrado ✓', color: '#22C55E', badgeClass: 'badge-green' },
  { id: 'perdido', label: 'Perdido', color: '#EF4444', badgeClass: 'badge-red' },
];

export default function AdminLeads() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);

  const load = async () => {
    setLoading(true);
    const snap = await getDocs(query(collection(db, 'leads'), orderBy('createdAt', 'desc')));
    setLeads(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const changeStatus = async (id: string, estado: string) => {
    await updateDoc(doc(db, 'leads', id), { estado });
    setLeads(prev => prev.map(l => l.id === id ? { ...l, estado } : l));
    if (selected?.id === id) setSelected((p: any) => ({ ...p, estado }));
  };

  return (
    <DashboardLayout navItems={navItems} title="Administrador" roleColor="#22C55E">
      <div className="space-y-6">
        <div>
          <h1 className="font-syne font-black text-2xl text-white">CRM — Pipeline de Leads</h1>
          <p className="font-dm text-white/40 text-sm">{leads.length} leads en total</p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-white/30 font-dm">Cargando leads...</div>
        ) : (
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-4" style={{ minWidth: `${COLUMNAS.length * 280}px` }}>
              {COLUMNAS.map(col => {
                const colLeads = leads.filter(l => l.estado === col.id);
                return (
                  <div key={col.id} className="flex-1" style={{ minWidth: '260px' }}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: col.color }} />
                        <span className="font-syne font-semibold text-white text-sm">{col.label}</span>
                      </div>
                      <span className="font-syne font-bold text-white/30 text-sm">{colLeads.length}</span>
                    </div>
                    <div className="space-y-3">
                      {colLeads.length === 0 ? (
                        <div className="border border-dashed border-white/5 rounded-xl p-6 text-center">
                          <p className="font-dm text-white/20 text-xs">Sin leads</p>
                        </div>
                      ) : colLeads.map((lead: any) => (
                        <div key={lead.id}
                          onClick={() => setSelected(lead)}
                          className="card glass-hover cursor-pointer group">
                          <div className="font-syne font-semibold text-white text-sm mb-1 group-hover:text-[#22C55E] transition-colors">
                            {lead.nombre}
                          </div>
                          <div className="font-dm text-white/40 text-xs mb-2">{lead.email}</div>
                          {lead.servicio && (
                            <div className="font-dm text-white/30 text-xs truncate">{lead.servicio}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Lead detail modal */}
        {selected && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg card space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-syne font-bold text-white text-xl">{selected.nombre}</h2>
                  <p className="font-dm text-white/40 text-sm">{selected.email}</p>
                </div>
                <button onClick={() => setSelected(null)} className="text-white/40 hover:text-white text-xl">✕</button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: 'WhatsApp', val: selected.whatsapp },
                  { label: 'Empresa', val: selected.empresa },
                  { label: 'Servicio', val: selected.servicio },
                ].map(({ label, val }) => val ? (
                  <div key={label}>
                    <div className="text-xs font-dm text-white/30 uppercase tracking-wider mb-1">{label}</div>
                    <div className="font-dm text-white">{val}</div>
                  </div>
                ) : null)}
              </div>

              {selected.mensaje && (
                <div>
                  <div className="text-xs font-dm text-white/30 uppercase tracking-wider mb-2">Mensaje</div>
                  <div className="bg-white/3 rounded-xl p-3 font-dm text-white/70 text-sm leading-relaxed">{selected.mensaje}</div>
                </div>
              )}

              <div>
                <div className="text-xs font-dm text-white/30 uppercase tracking-wider mb-3">Cambiar estado</div>
                <div className="flex flex-wrap gap-2">
                  {COLUMNAS.map(col => (
                    <button key={col.id}
                      onClick={() => changeStatus(selected.id, col.id)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-dm border transition-all ${
                        selected.estado === col.id
                          ? 'text-white border-white/30 bg-white/10'
                          : 'text-white/40 border-white/10 hover:border-white/20 hover:text-white'
                      }`}>
                      {col.label}
                    </button>
                  ))}
                </div>
              </div>

              {selected.whatsapp && (
                <a href={`https://wa.me/${selected.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                  className="btn-primary w-full py-3 rounded-xl font-syne font-bold text-sm text-center flex items-center justify-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.137.564 4.14 1.543 5.873L0 24l6.324-1.524A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.652-.49-5.187-1.348l-.371-.22-3.754.904.935-3.647-.242-.382A9.944 9.944 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/></svg>
                  Contactar por WhatsApp
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
