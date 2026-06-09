'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { db, auth } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, updateDoc, query, orderBy } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
  { href: '/admin/clientes', label: 'Clientes', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg> },
  { href: '/admin/setters', label: 'Setters', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  { href: '/admin/proyectos', label: 'Proyectos', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg> },
  { href: '/admin/leads', label: 'Leads / CRM', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
  { href: '/admin/cursos', label: 'Cursos LMS', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg> },
  { href: '/admin/tickets', label: 'Soporte', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
];

export default function AdminClientes() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ nombre: '', email: '', password: '', whatsapp: '', empresa: '', pais: '', rol: 'cliente' });

  const load = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, 'usuarios'));
    const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    setClientes(all.filter((u: any) => u.rol === 'cliente'));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const createUser = async () => {
    setSaving(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await setDoc(doc(db, 'usuarios', cred.user.uid), {
        uid: cred.user.uid,
        nombre: form.nombre,
        email: form.email,
        whatsapp: form.whatsapp,
        empresa: form.empresa,
        pais: form.pais,
        rol: form.rol,
        activo: true,
        createdAt: new Date(),
      });
      setShowForm(false);
      setForm({ nombre: '', email: '', password: '', whatsapp: '', empresa: '', pais: '', rol: 'cliente' });
      await load();
    } catch (err: any) {
      alert(err.message);
    }
    setSaving(false);
  };

  const toggleActivo = async (id: string, activo: boolean) => {
    await updateDoc(doc(db, 'usuarios', id), { activo: !activo });
    await load();
  };

  return (
    <DashboardLayout navItems={navItems} title="Administrador" roleColor="#22C55E">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-syne font-black text-2xl text-white">Clientes</h1>
            <p className="font-dm text-white/40 text-sm">{clientes.length} clientes registrados</p>
          </div>
          <button onClick={() => setShowForm(true)} className="btn-primary px-5 py-2.5 rounded-xl font-syne font-bold text-sm">
            + Nuevo usuario
          </button>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg card space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-syne font-bold text-white text-xl">Crear usuario</h2>
                <button onClick={() => setShowForm(false)} className="text-white/40 hover:text-white text-xl">✕</button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { f: 'nombre', p: 'Nombre completo' },
                  { f: 'email', p: 'Email', t: 'email' },
                  { f: 'password', p: 'Contraseña', t: 'password' },
                  { f: 'whatsapp', p: 'WhatsApp' },
                  { f: 'empresa', p: 'Empresa' },
                  { f: 'pais', p: 'País' },
                ].map(({ f, p, t }) => (
                  <div key={f}>
                    <label className="block text-xs font-dm text-white/40 mb-1 uppercase tracking-wider">{p}</label>
                    <input type={t || 'text'} className="input-field text-sm py-2.5" placeholder={p}
                      value={(form as any)[f]} onChange={e => setForm({ ...form, [f]: e.target.value })} />
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-xs font-dm text-white/40 mb-1 uppercase tracking-wider">Rol</label>
                <select className="input-field text-sm" value={form.rol} onChange={e => setForm({ ...form, rol: e.target.value })}>
                  <option value="cliente">Cliente</option>
                  <option value="setter">Setter</option>
                  <option value="socio">Socio</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button onClick={createUser} disabled={saving} className="btn-primary flex-1 py-3 rounded-xl font-syne font-bold text-sm disabled:opacity-50">
                  {saving ? 'Creando...' : 'Crear usuario'}
                </button>
                <button onClick={() => setShowForm(false)} className="btn-outline px-6 py-3 rounded-xl font-dm text-sm">Cancelar</button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-white/30 font-dm">Cargando...</div>
        ) : clientes.length === 0 ? (
          <div className="card text-center py-16">
            <div className="text-4xl mb-3">👥</div>
            <p className="font-syne font-bold text-white text-lg mb-2">Sin clientes todavía</p>
            <p className="font-dm text-white/40 text-sm">Crea el primer cliente</p>
          </div>
        ) : (
          <div className="card overflow-hidden p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {['Cliente', 'Email', 'Empresa', 'País', 'Estado', 'Acciones'].map(h => (
                    <th key={h} className="text-left text-xs font-dm text-white/40 uppercase tracking-wider px-5 py-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clientes.map((c: any) => (
                  <tr key={c.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#22C55E] to-[#1A3A8F] flex items-center justify-center text-xs font-bold text-white">
                          {c.nombre?.charAt(0)}
                        </div>
                        <span className="font-dm text-white text-sm font-medium">{c.nombre}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-dm text-white/50 text-sm">{c.email}</td>
                    <td className="px-5 py-4 font-dm text-white/50 text-sm">{c.empresa || '—'}</td>
                    <td className="px-5 py-4 font-dm text-white/50 text-sm">{c.pais || '—'}</td>
                    <td className="px-5 py-4">
                      <span className={`badge ${c.activo ? 'badge-green' : 'badge-red'}`}>{c.activo ? 'Activo' : 'Inactivo'}</span>
                    </td>
                    <td className="px-5 py-4">
                      <button onClick={() => toggleActivo(c.id, c.activo)}
                        className="text-xs font-dm text-white/40 hover:text-white transition-colors border border-white/10 px-3 py-1.5 rounded-lg hover:border-white/20">
                        {c.activo ? 'Desactivar' : 'Activar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
