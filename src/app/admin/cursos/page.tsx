'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, doc, serverTimestamp, deleteDoc } from 'firebase/firestore';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
  { href: '/admin/clientes', label: 'Clientes', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg> },
  { href: '/admin/cursos', label: 'Cursos LMS', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg> },
  { href: '/admin/leads', label: 'Leads / CRM', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
  { href: '/admin/tickets', label: 'Soporte', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
];

interface Leccion { id?: string; titulo: string; descripcion: string; videoUrl: string; duracion: number; orden: number; }
interface Modulo { id?: string; titulo: string; orden: number; lecciones: Leccion[]; }
interface Curso { id?: string; titulo: string; descripcion: string; activo: boolean; modulos: Modulo[]; }

const emptyLeccion = (): Leccion => ({ titulo: '', descripcion: '', videoUrl: '', duracion: 10, orden: 0 });
const emptyModulo = (): Modulo => ({ titulo: '', orden: 0, lecciones: [emptyLeccion()] });
const emptyCurso = (): Curso => ({ titulo: '', descripcion: '', activo: true, modulos: [emptyModulo()] });

export default function AdminCursos() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Curso>(emptyCurso());
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, 'cursos'));
    setCursos(snap.docs.map(d => ({ id: d.id, ...d.data() } as Curso)));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true);
    try {
      if (editId) {
        await updateDoc(doc(db, 'cursos', editId), { ...form, updatedAt: serverTimestamp() });
      } else {
        await addDoc(collection(db, 'cursos'), { ...form, createdAt: serverTimestamp() });
      }
      setShowForm(false);
      setForm(emptyCurso());
      setEditId(null);
      await load();
    } catch (err) { console.error(err); }
    setSaving(false);
  };

  const deleteCurso = async (id: string) => {
    if (!confirm('¿Eliminar este curso?')) return;
    await deleteDoc(doc(db, 'cursos', id));
    await load();
  };

  const editCurso = (curso: Curso) => {
    setForm(curso);
    setEditId(curso.id || null);
    setShowForm(true);
  };

  const addModulo = () => setForm({ ...form, modulos: [...form.modulos, { ...emptyModulo(), orden: form.modulos.length }] });
  const addLeccion = (mi: number) => {
    const mods = [...form.modulos];
    mods[mi].lecciones.push({ ...emptyLeccion(), orden: mods[mi].lecciones.length });
    setForm({ ...form, modulos: mods });
  };
  const updateModulo = (mi: number, field: string, val: any) => {
    const mods = [...form.modulos];
    (mods[mi] as any)[field] = val;
    setForm({ ...form, modulos: mods });
  };
  const updateLeccion = (mi: number, li: number, field: string, val: any) => {
    const mods = [...form.modulos];
    (mods[mi].lecciones[li] as any)[field] = val;
    setForm({ ...form, modulos: mods });
  };

  return (
    <DashboardLayout navItems={navItems} title="Administrador" roleColor="#22C55E">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-syne font-black text-2xl text-white">Cursos LMS</h1>
            <p className="font-dm text-white/40 text-sm">Gestiona los cursos de formación para setters</p>
          </div>
          <button onClick={() => { setForm(emptyCurso()); setEditId(null); setShowForm(true); }}
            className="btn-primary px-5 py-2.5 rounded-xl font-syne font-bold text-sm">
            + Nuevo curso
          </button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-start justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-3xl card my-8 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-syne font-bold text-white text-xl">{editId ? 'Editar curso' : 'Nuevo curso'}</h2>
                <button onClick={() => setShowForm(false)} className="text-white/40 hover:text-white text-xl">✕</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-dm text-white/40 mb-2 uppercase tracking-wider">Título del curso</label>
                  <input className="input-field" placeholder="Ej: Formación para Setters Nivel 1" value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} />
                </div>
                <div className="flex items-end gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.activo} onChange={e => setForm({ ...form, activo: e.target.checked })} className="w-4 h-4 accent-[#22C55E]" />
                    <span className="text-sm font-dm text-white/60">Curso activo</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-dm text-white/40 mb-2 uppercase tracking-wider">Descripción</label>
                <textarea rows={2} className="input-field resize-none" placeholder="Descripción del curso..." value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} />
              </div>

              {/* Módulos */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-syne font-semibold text-white">Módulos</h3>
                  <button onClick={addModulo} className="btn-outline text-xs px-3 py-1.5 rounded-lg font-dm">+ Módulo</button>
                </div>

                {form.modulos.map((mod, mi) => (
                  <div key={mi} className="border border-white/10 rounded-xl p-4 space-y-3 bg-white/2">
                    <div className="flex items-center gap-3">
                      <span className="font-syne font-bold text-[#22C55E] text-sm">Módulo {mi + 1}</span>
                      <input className="input-field flex-1" placeholder="Título del módulo" value={mod.titulo} onChange={e => updateModulo(mi, 'titulo', e.target.value)} />
                    </div>

                    {mod.lecciones.map((lec, li) => (
                      <div key={li} className="border border-white/5 rounded-lg p-3 space-y-2 bg-white/2 ml-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-dm text-white/30">{mi + 1}.{li + 1}</span>
                          <input className="input-field flex-1 text-sm py-2" placeholder="Título de la lección" value={lec.titulo} onChange={e => updateLeccion(mi, li, 'titulo', e.target.value)} />
                        </div>
                        <input className="input-field text-sm py-2" placeholder="URL del video de YouTube (puede ser oculto)" value={lec.videoUrl} onChange={e => updateLeccion(mi, li, 'videoUrl', e.target.value)} />
                        <div className="grid grid-cols-2 gap-2">
                          <input className="input-field text-sm py-2" placeholder="Descripción breve" value={lec.descripcion} onChange={e => updateLeccion(mi, li, 'descripcion', e.target.value)} />
                          <input type="number" className="input-field text-sm py-2" placeholder="Duración (min)" value={lec.duracion} onChange={e => updateLeccion(mi, li, 'duracion', parseInt(e.target.value))} />
                        </div>
                      </div>
                    ))}
                    <button onClick={() => addLeccion(mi)} className="text-xs font-dm text-[#22C55E] hover:underline ml-4">+ Agregar lección</button>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={save} disabled={saving} className="btn-primary flex-1 py-3 rounded-xl font-syne font-bold text-sm disabled:opacity-50">
                  {saving ? 'Guardando...' : 'Guardar curso'}
                </button>
                <button onClick={() => setShowForm(false)} className="btn-outline px-6 py-3 rounded-xl font-dm text-sm">Cancelar</button>
              </div>
            </div>
          </div>
        )}

        {/* Courses List */}
        {loading ? (
          <div className="text-center py-20 text-white/30 font-dm">Cargando cursos...</div>
        ) : cursos.length === 0 ? (
          <div className="card text-center py-16">
            <div className="text-4xl mb-3">🎓</div>
            <p className="font-syne font-bold text-white text-lg mb-2">Sin cursos todavía</p>
            <p className="font-dm text-white/40 text-sm">Crea tu primer curso para los setters</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {cursos.map((curso) => (
              <div key={curso.id} className="card glass-hover">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-syne font-bold text-white text-lg">{curso.titulo}</h3>
                      <span className={`badge ${curso.activo ? 'badge-green' : 'badge-gray'}`}>{curso.activo ? 'Activo' : 'Inactivo'}</span>
                    </div>
                    <p className="font-dm text-white/40 text-sm mb-3">{curso.descripcion}</p>
                    <div className="flex items-center gap-4 text-xs font-dm text-white/30">
                      <span>📚 {curso.modulos?.length || 0} módulos</span>
                      <span>🎬 {curso.modulos?.reduce((acc, m) => acc + (m.lecciones?.length || 0), 0)} lecciones</span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => editCurso(curso)} className="btn-outline text-xs px-3 py-2 rounded-lg font-dm">Editar</button>
                    <button onClick={() => deleteCurso(curso.id!)} className="text-xs px-3 py-2 rounded-lg font-dm text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-colors">Eliminar</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
