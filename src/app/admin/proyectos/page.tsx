'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
  { href: '/admin/clientes', label: 'Clientes', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg> },
  { href: '/admin/proyectos', label: 'Proyectos', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg> },
  { href: '/admin/leads', label: 'Leads / CRM', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
  { href: '/admin/cursos', label: 'Cursos LMS', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg> },
  { href: '/admin/tickets', label: 'Soporte', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
];

const ETAPAS = ['informacion', 'diseno', 'desarrollo', 'seo', 'publicacion'];
const ETAPAS_LABELS: Record<string, string> = {
  informacion: 'Información recibida', diseno: 'Diseño', desarrollo: 'Desarrollo', seo: 'SEO', publicacion: 'Publicación'
};

const emptyForm = () => ({
  nombre: '', descripcion: '', clienteId: '', estado: 'activo',
  progreso: { informacion: 0, diseno: 0, desarrollo: 0, seo: 0, publicacion: 0 }
});

export default function AdminProyectos() {
  const [proyectos, setProyectos] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const [proySnap, clientesSnap] = await Promise.all([
      getDocs(collection(db, 'proyectos')),
      getDocs(collection(db, 'usuarios')),
    ]);
    setProyectos(proySnap.docs.map(d => ({ id: d.id, ...d.data() })));
    setClientes(clientesSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter((u: any) => u.rol === 'cliente'));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true);
    try {
      if (editId) {
        await updateDoc(doc(db, 'proyectos', editId), { ...form, updatedAt: serverTimestamp() });
        // Update cliente's proyectoId
        if (form.clienteId) await updateDoc(doc(db, 'usuarios', form.clienteId), { proyectoId: editId });
      } else {
        const ref = await addDoc(collection(db, 'proyectos'), { ...form, createdAt: serverTimestamp() });
        if (form.clienteId) await updateDoc(doc(db, 'usuarios', form.clienteId), { proyectoId: ref.id });
      }
      setShowForm(false);
      setForm(emptyForm());
      setEditId(null);
      await load();
    } catch (err) { console.error(err); }
    setSaving(false);
  };

  const openEdit = (p: any) => {
    setForm({ nombre: p.nombre, descripcion: p.descripcion, clienteId: p.clienteId, estado: p.estado, progreso: p.progreso });
    setEditId(p.id);
    setShowForm(true);
  };

  const updateProgreso = (key: string, val: number) => {
    setForm(f => ({ ...f, progreso: { ...f.progreso, [key]: Math.min(100, Math.max(0, val)) } }));
  };

  const clienteNombre = (id: string) => clientes.find(c => c.id === id)?.nombre || '—';

  return (
    <DashboardLayout navItems={navItems} title="Administrador" roleColor="#22C55E">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-syne font-black text-2xl text-white">Proyectos</h1>
            <p className="font-dm text-white/40 text-sm">{proyectos.length} proyectos registrados</p>
          </div>
          <button onClick={() => { setForm(emptyForm()); setEditId(null); setShowForm(true); }}
            className="btn-primary px-5 py-2.5 rounded-xl font-syne font-bold text-sm">
            + Nuevo proyecto
          </button>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-start justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-2xl card my-8 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="font-syne font-bold text-white text-xl">{editId ? 'Editar proyecto' : 'Nuevo proyecto'}</h2>
                <button onClick={() => setShowForm(false)} className="text-white/40 hover:text-white text-xl">✕</button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-dm text-white/40 mb-2 uppercase tracking-wider">Nombre del proyecto</label>
                  <input className="input-field" placeholder="Ej: Sitio web Tu Empresa" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-dm text-white/40 mb-2 uppercase tracking-wider">Cliente</label>
                  <select className="input-field" value={form.clienteId} onChange={e => setForm({ ...form, clienteId: e.target.value })}>
                    <option value="">Seleccionar cliente</option>
                    {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-dm text-white/40 mb-2 uppercase tracking-wider">Estado</label>
                  <select className="input-field" value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })}>
                    <option value="activo">Activo</option>
                    <option value="pausado">Pausado</option>
                    <option value="completado">Completado</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-dm text-white/40 mb-2 uppercase tracking-wider">Descripción</label>
                  <textarea rows={2} className="input-field resize-none" placeholder="Descripción del proyecto..."
                    value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} />
                </div>
              </div>

              {/* Progress sliders */}
              <div>
                <h3 className="font-syne font-semibold text-white text-sm mb-4">Progreso del proyecto</h3>
                <div className="space-y-4">
                  {ETAPAS.map(etapa => (
                    <div key={etapa}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-dm text-sm text-white/70">{ETAPAS_LABELS[etapa]}</span>
                        <div className="flex items-center gap-2">
                          <input type="number" min="0" max="100"
                            className="w-16 input-field text-xs py-1.5 text-center"
                            value={form.progreso[etapa as keyof typeof form.progreso]}
                            onChange={e => updateProgreso(etapa, parseInt(e.target.value) || 0)} />
                          <span className="text-xs font-dm text-white/40">%</span>
                        </div>
                      </div>
                      <input type="range" min="0" max="100"
                        className="w-full accent-[#22C55E]"
                        value={form.progreso[etapa as keyof typeof form.progreso]}
                        onChange={e => updateProgreso(etapa, parseInt(e.target.value))} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={save} disabled={saving} className="btn-primary flex-1 py-3 rounded-xl font-syne font-bold text-sm disabled:opacity-50">
                  {saving ? 'Guardando...' : 'Guardar proyecto'}
                </button>
                <button onClick={() => setShowForm(false)} className="btn-outline px-6 py-3 rounded-xl font-dm text-sm">Cancelar</button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-white/30 font-dm">Cargando proyectos...</div>
        ) : proyectos.length === 0 ? (
          <div className="card text-center py-16">
            <div className="text-4xl mb-3">📁</div>
            <p className="font-syne font-bold text-white text-lg mb-2">Sin proyectos todavía</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {proyectos.map((p: any) => {
              const totalPct = Math.round(Object.values(p.progreso || {}).reduce((a: number, v: any) => a + v, 0) / 5);
              return (
                <div key={p.id} className="card glass-hover">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-syne font-bold text-white text-lg">{p.nombre}</h3>
                        <span className={`badge ${p.estado === 'activo' ? 'badge-green' : p.estado === 'completado' ? 'badge-blue' : 'badge-yellow'}`}>{p.estado}</span>
                      </div>
                      <p className="font-dm text-white/40 text-sm">Cliente: {clienteNombre(p.clienteId)}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-syne font-black text-2xl text-[#22C55E]">{totalPct}%</div>
                      <div className="text-xs font-dm text-white/30">general</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-5 gap-2 mb-4">
                    {ETAPAS.map(e => {
                      const pct = p.progreso?.[e] ?? 0;
                      return (
                        <div key={e} className="text-center">
                          <div className="progress-bar mb-1">
                            <div className="progress-fill" style={{ width: `${pct}%` }} />
                          </div>
                          <div className="text-xs font-dm text-white/30">{pct}%</div>
                        </div>
                      );
                    })}
                  </div>

                  <button onClick={() => openEdit(p)} className="btn-outline text-xs px-4 py-2 rounded-lg font-dm">
                    Actualizar progreso
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
