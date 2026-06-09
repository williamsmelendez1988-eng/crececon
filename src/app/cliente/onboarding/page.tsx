'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  { href: '/cliente', label: 'Mi Proyecto', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
  { href: '/cliente/onboarding', label: 'Onboarding', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> },
  { href: '/cliente/soporte', label: 'Soporte', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
];

const STEPS = [
  { id: 'empresa', label: 'Datos empresariales', icon: '🏢' },
  { id: 'negocio', label: 'Tu negocio', icon: '💼' },
  { id: 'identidad', label: 'Identidad de marca', icon: '🎨' },
  { id: 'marketing', label: 'Marketing', icon: '📣' },
];

export default function ClienteOnboarding() {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState({
    // Empresa
    nombreEmpresa: '', direccion: '', telefono: '', correoEmpresa: '', ciudad: '', pais: '',
    // Negocio
    historia: '', servicios: '', productos: '', objetivos: '',
    // Identidad
    colores: '', mision: '', vision: '', valores: '',
    // Marketing
    instagram: '', facebook: '', tiktok: '', publicoObjetivo: '', competencia: '', referencias: '',
  });

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const snap = await getDoc(doc(db, 'onboarding', user.uid));
      if (snap.exists()) setData(snap.data() as typeof data);
    };
    load();
  }, [user]);

  const update = (field: string, val: string) => setData(prev => ({ ...prev, [field]: val }));

  const save = async () => {
    if (!user) return;
    setSaving(true);
    await setDoc(doc(db, 'onboarding', user.uid), { ...data, clienteId: user.uid, updatedAt: serverTimestamp() }, { merge: true });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const input = (field: keyof typeof data, placeholder: string, type = 'text') => (
    <input type={type} className="input-field" placeholder={placeholder}
      value={data[field]} onChange={e => update(field, e.target.value)} />
  );

  const textarea = (field: keyof typeof data, placeholder: string) => (
    <textarea rows={3} className="input-field resize-none" placeholder={placeholder}
      value={data[field]} onChange={e => update(field, e.target.value)} />
  );

  const label = (text: string) => (
    <label className="block text-xs font-dm text-white/40 mb-2 uppercase tracking-wider">{text}</label>
  );

  const steps = [
    // Step 0: Empresa
    <div key="empresa" className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>{label('Nombre de la empresa')}{input('nombreEmpresa', 'Tu empresa S.A.')}</div>
        <div>{label('País')}{input('pais', 'Venezuela')}</div>
        <div>{label('Ciudad')}{input('ciudad', 'Caracas')}</div>
        <div>{label('Dirección')}{input('direccion', 'Av. Principal...')}</div>
        <div>{label('Teléfono')}{input('telefono', '+58 412 000 0000')}</div>
        <div>{label('Correo empresarial')}{input('correoEmpresa', 'info@tuempresa.com', 'email')}</div>
      </div>
    </div>,

    // Step 1: Negocio
    <div key="negocio" className="space-y-4">
      <div>{label('Historia de tu empresa')}{textarea('historia', 'Cuéntanos cómo empezó tu negocio, cuánto tiempo llevas...')}</div>
      <div>{label('Servicios que ofreces')}{textarea('servicios', 'Describe detalladamente los servicios o productos que vendes...')}</div>
      <div>{label('Productos principales')}{textarea('productos', 'Lista tus productos o servicios más importantes...')}</div>
      <div>{label('Objetivos con CreceCon')}{textarea('objetivos', '¿Qué quieres lograr? ¿Cuántos clientes nuevos? ¿Qué ingresos?')}</div>
    </div>,

    // Step 2: Identidad
    <div key="identidad" className="space-y-4">
      <div>{label('Colores de tu marca (códigos hex o descripción)')}{input('colores', 'Ej: Azul #1A3A8F, Verde #22C55E')}</div>
      <div>{label('Misión')}{textarea('mision', '¿Por qué existe tu empresa? ¿A quién ayuda?')}</div>
      <div>{label('Visión')}{textarea('vision', '¿Dónde quieres estar en 5 años?')}</div>
      <div>{label('Valores de la empresa')}{textarea('valores', 'Ej: Honestidad, innovación, servicio al cliente...')}</div>
      <div className="bg-white/3 border border-white/10 rounded-xl p-4">
        <p className="font-dm text-white/50 text-sm mb-2">📎 Logos, fotos y archivos</p>
        <p className="font-dm text-white/30 text-xs">Envía tus archivos (logos, fotos, videos, PDFs) directamente por WhatsApp al <a href="https://wa.me/584128021091" className="text-[#22C55E] hover:underline" target="_blank" rel="noopener noreferrer">+58 412 802 1091</a> con tu nombre de empresa para que los agreguemos a tu proyecto.</p>
      </div>
    </div>,

    // Step 3: Marketing
    <div key="marketing" className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>{label('Instagram')}{input('instagram', '@tuempresa')}</div>
        <div>{label('Facebook')}{input('facebook', 'facebook.com/tuempresa')}</div>
        <div>{label('TikTok')}{input('tiktok', '@tuempresa')}</div>
      </div>
      <div>{label('Público objetivo')}{textarea('publicoObjetivo', '¿A quién le vendes? Edad, género, ubicación, intereses...')}</div>
      <div>{label('Competencia principal')}{textarea('competencia', '¿Quiénes son tus competidores directos?')}</div>
      <div>{label('Referencias visuales')}{textarea('referencias', 'Marcas o sitios web cuyo estilo te gusta (URLs o nombres)...')}</div>
    </div>,
  ];

  return (
    <DashboardLayout navItems={navItems} title="Cliente" roleColor="#F59E0B">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="font-syne font-black text-2xl text-white mb-1">Onboarding</h1>
          <p className="font-dm text-white/40 text-sm">Completa esta información para que podamos comenzar tu proyecto</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <button key={s.id} onClick={() => setStep(i)}
              className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-xl border transition-all text-xs font-dm ${
                i === step ? 'border-[#F59E0B]/40 bg-[#F59E0B]/10 text-[#F59E0B]' :
                i < step ? 'border-[#22C55E]/30 bg-[#22C55E]/5 text-[#22C55E]' :
                'border-white/5 text-white/30'
              }`}>
              <span className="text-lg">{i < step ? '✓' : s.icon}</span>
              <span className="hidden md:block text-center leading-tight">{s.label}</span>
            </button>
          ))}
        </div>

        {/* Step content */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">{STEPS[step].icon}</span>
            <h2 className="font-syne font-bold text-white text-lg">{STEPS[step].label}</h2>
          </div>
          {steps[step]}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}
            className="btn-outline px-6 py-3 rounded-xl font-dm text-sm disabled:opacity-30">
            ← Anterior
          </button>

          <button onClick={save} disabled={saving}
            className="btn-outline px-6 py-3 rounded-xl font-dm text-sm text-[#22C55E] border-[#22C55E]/30 hover:bg-[#22C55E]/10 disabled:opacity-50">
            {saving ? 'Guardando...' : saved ? '✓ Guardado' : 'Guardar progreso'}
          </button>

          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep(Math.min(STEPS.length - 1, step + 1))}
              className="btn-primary px-6 py-3 rounded-xl font-syne font-bold text-sm">
              Siguiente →
            </button>
          ) : (
            <button onClick={save} disabled={saving}
              className="btn-primary px-6 py-3 rounded-xl font-syne font-bold text-sm disabled:opacity-50">
              {saving ? 'Enviando...' : 'Enviar onboarding ✓'}
            </button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
