'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// ── Navbar ──────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled ? 'glass border-b border-white/5 py-3' : 'py-6'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#22C55E] to-[#1A3A8F] flex items-center justify-center">
            <span className="font-syne font-black text-white text-sm">C</span>
          </div>
          <span className="font-syne font-bold text-white text-xl">CreceCon</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {['Servicios', 'Proceso', 'Casos de Éxito', 'FAQ'].map((item) => (
            <a key={item} href={`#${item.toLowerCase().replace(' ', '-').replace('é', 'e')}`}
              className="text-sm text-white/60 hover:text-white transition-colors font-dm">
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden md:block btn-outline text-sm px-5 py-2.5 rounded-xl font-dm font-medium">
            Iniciar sesión
          </Link>
          <a href="#contacto" className="btn-primary text-sm px-5 py-2.5 rounded-xl font-dm font-semibold">
            Empezar ahora
          </a>
          <button className="md:hidden text-white/70" onClick={() => setMenuOpen(!menuOpen)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {menuOpen ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></> : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>}
            </svg>
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="md:hidden glass border-t border-white/5 px-6 py-4 flex flex-col gap-4">
          {['Servicios', 'Proceso', 'Casos de Éxito', 'FAQ'].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="text-sm text-white/70 font-dm" onClick={() => setMenuOpen(false)}>{item}</a>
          ))}
          <Link href="/login" className="text-sm text-white/70 font-dm">Iniciar sesión</Link>
        </div>
      )}
    </nav>
  );
}

// ── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-mesh grid-pattern">
      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#22C55E]/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] rounded-full bg-[#1A3A8F]/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-[#22C55E]/8 blur-[80px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-8 animate-fade-up">
          <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
          <span className="text-xs font-dm text-white/60 uppercase tracking-widest">Sistema de Crecimiento Digital</span>
        </div>

        {/* Headline */}
        <h1 className="font-syne font-black text-5xl md:text-7xl lg:text-8xl leading-[0.95] mb-6 animate-fade-up delay-100">
          <span className="gradient-text-white">Construimos sistemas</span>
          <br />
          <span className="gradient-text">digitales que consiguen</span>
          <br />
          <span className="gradient-text-white">clientes mientras duermes.</span>
        </h1>

        {/* Subheadline */}
        <p className="font-dm text-white/50 text-lg md:text-xl max-w-2xl mx-auto mb-10 animate-fade-up delay-200 leading-relaxed">
          Más crecimiento, más clientes, más ventas. Transformamos tu negocio en un sistema digital medible y escalable que trabaja 24/7 por ti.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up delay-300">
          <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP?.replace('+','')}`} target="_blank" rel="noopener noreferrer"
            className="btn-primary px-8 py-4 rounded-2xl font-syne font-bold text-base flex items-center gap-3 glow-green-sm">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.137.564 4.14 1.543 5.873L0 24l6.324-1.524A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.652-.49-5.187-1.348l-.371-.22-3.754.904.935-3.647-.242-.382A9.944 9.944 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/></svg>
            Agendar llamada
          </a>
          <a href="#contacto"
            className="btn-outline px-8 py-4 rounded-2xl font-syne font-bold text-base flex items-center gap-3">
            Solicitar propuesta
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-3 gap-8 max-w-lg mx-auto animate-fade-up delay-400">
          {[
            { num: '100+', label: 'Clientes activos' },
            { num: '3x', label: 'Promedio de crecimiento' },
            { num: '24/7', label: 'Sistemas activos' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-syne font-black text-2xl gradient-text">{stat.num}</div>
              <div className="text-xs font-dm text-white/40 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-float">
        <span className="text-xs font-dm text-white/30 tracking-widest uppercase">Scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-white/20 to-transparent" />
      </div>
    </section>
  );
}

// ── Services ─────────────────────────────────────────────────────────────────
const services = [
  { icon: '🌐', title: 'Desarrollo Web Premium', desc: 'Sitios web de alto rendimiento, veloces y optimizados que convierten visitantes en clientes.' },
  { icon: '📱', title: 'Aplicaciones PWA', desc: 'Apps progresivas que funcionan como nativas en cualquier dispositivo sin costos de App Store.' },
  { icon: '🔍', title: 'SEO Avanzado', desc: 'Estrategias de posicionamiento que llevan tu negocio a la primera página de Google.' },
  { icon: '📣', title: 'Meta Ads', desc: 'Campañas de Facebook e Instagram con segmentación precisa para maximizar tu ROI.' },
  { icon: '🎯', title: 'Google Ads', desc: 'Anuncios de búsqueda y display que capturan clientes en el momento exacto de compra.' },
  { icon: '⚡', title: 'Automatización', desc: 'Sistemas que trabajan solos: emails, seguimientos, reportes y procesos automatizados.' },
  { icon: '🤖', title: 'Bots de WhatsApp', desc: 'Atención al cliente 24/7 con bots inteligentes que califican y convierten leads.' },
  { icon: '✨', title: 'Branding Digital', desc: 'Identidad visual premium que diferencia tu marca y genera confianza instantánea.' },
];

function Services() {
  return (
    <section id="servicios" className="py-32 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-6">
            <span className="text-xs font-dm text-[#22C55E] uppercase tracking-widest">Nuestros servicios</span>
          </div>
          <h2 className="font-syne font-black text-4xl md:text-6xl gradient-text-white mb-4">
            Todo lo que tu negocio<br />necesita para crecer
          </h2>
          <p className="font-dm text-white/50 text-lg max-w-xl mx-auto">
            Un ecosistema completo de soluciones digitales diseñado para convertir y escalar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map((s, i) => (
            <div key={s.title} className="card glass-hover group cursor-pointer" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="text-3xl mb-4">{s.icon}</div>
              <h3 className="font-syne font-bold text-white text-base mb-2 group-hover:text-[#22C55E] transition-colors">{s.title}</h3>
              <p className="font-dm text-white/40 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Process ───────────────────────────────────────────────────────────────────
const steps = [
  { num: '01', title: 'Pago', desc: 'Confirmas tu inversión y accedes al sistema.' },
  { num: '02', title: 'Onboarding', desc: 'Completamos tu perfil empresarial completo.' },
  { num: '03', title: 'Diseño', desc: 'Creamos la identidad visual de tu proyecto.' },
  { num: '04', title: 'Desarrollo', desc: 'Construimos tu solución digital.' },
  { num: '05', title: 'Lanzamiento', desc: 'Publicamos y activamos tu sistema.' },
  { num: '06', title: 'Escalamiento', desc: 'Optimizamos y hacemos crecer los resultados.' },
];

function Process() {
  return (
    <section id="proceso" className="py-32 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-mesh opacity-50" />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-6">
            <span className="text-xs font-dm text-[#22C55E] uppercase tracking-widest">Cómo trabajamos</span>
          </div>
          <h2 className="font-syne font-black text-4xl md:text-6xl gradient-text-white mb-4">
            Proceso simple.<br />Resultados extraordinarios.
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {steps.map((step, i) => (
            <div key={step.num} className="relative">
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-white/10 to-transparent z-0" />
              )}
              <div className="card glass-hover text-center relative z-10">
                <div className="font-syne font-black text-4xl gradient-text mb-3">{step.num}</div>
                <h3 className="font-syne font-bold text-white text-sm mb-2">{step.title}</h3>
                <p className="font-dm text-white/40 text-xs leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Cases ─────────────────────────────────────────────────────────────────────
const cases = [
  { empresa: 'Barbershop Walla\'s', tipo: 'Desarrollo Web + PWA', resultado: '+340% reservas online', tag: 'Barbería' },
  { empresa: 'Clínica Dental Plus', tipo: 'SEO + Google Ads', resultado: '+250% pacientes nuevos', tag: 'Salud' },
  { empresa: 'Tienda ModaVip', tipo: 'E-commerce + Meta Ads', resultado: '+180% ventas mensuales', tag: 'Retail' },
];

function Cases() {
  return (
    <section id="casos-de-exito" className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-6">
            <span className="text-xs font-dm text-[#22C55E] uppercase tracking-widest">Resultados reales</span>
          </div>
          <h2 className="font-syne font-black text-4xl md:text-6xl gradient-text-white mb-4">
            Negocios que ya<br />están creciendo
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cases.map((c) => (
            <div key={c.empresa} className="card glass-hover group relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#22C55E]/50 to-transparent" />
              <span className="badge badge-green mb-4 inline-block">{c.tag}</span>
              <h3 className="font-syne font-bold text-white text-xl mb-2">{c.empresa}</h3>
              <p className="font-dm text-white/40 text-sm mb-4">{c.tipo}</p>
              <div className="font-syne font-black text-2xl gradient-text">{c.resultado}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── FAQ ───────────────────────────────────────────────────────────────────────
const faqs = [
  { q: '¿Cuánto tiempo tarda en desarrollarse mi proyecto?', a: 'Depende del alcance. Un sitio web premium tarda 2-3 semanas. Una PWA completa entre 4-8 semanas. Te damos un cronograma detallado en la propuesta.' },
  { q: '¿Cómo puedo ver el avance de mi proyecto?', a: 'Tendrás acceso a tu panel personalizado donde verás el progreso en tiempo real, podrás aprobar diseños y comunicarte directamente con tu equipo.' },
  { q: '¿Trabajan con clientes de cualquier país?', a: 'Sí, operamos 100% en digital y trabajamos con clientes de toda Latinoamérica, España y Estados Unidos.' },
  { q: '¿Qué incluye el sistema de crecimiento?', a: 'Es un ecosistema completo: web, automatizaciones, campañas, métricas y soporte continuo. No es solo un desarrollo, es un sistema que convierte de forma medible.' },
  { q: '¿Hay precios fijos?', a: 'Cada proyecto es a medida. Analizamos tu negocio y te enviamos una propuesta personalizada con el mejor plan para tus objetivos y presupuesto.' },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="py-32 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-6">
            <span className="text-xs font-dm text-[#22C55E] uppercase tracking-widest">Preguntas frecuentes</span>
          </div>
          <h2 className="font-syne font-black text-4xl md:text-5xl gradient-text-white">
            Todo lo que necesitas saber
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className={`card glass-hover cursor-pointer transition-all duration-300 ${open === i ? 'border-[#22C55E]/30' : ''}`}
              onClick={() => setOpen(open === i ? null : i)}>
              <div className="flex items-center justify-between gap-4">
                <h3 className="font-syne font-semibold text-white text-sm">{faq.q}</h3>
                <div className={`w-5 h-5 rounded-full border border-white/20 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${open === i ? 'bg-[#22C55E] border-[#22C55E] rotate-45' : ''}`}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                </div>
              </div>
              {open === i && (
                <p className="font-dm text-white/50 text-sm mt-4 leading-relaxed border-t border-white/5 pt-4">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Contact Form ──────────────────────────────────────────────────────────────
function ContactForm() {
  const [form, setForm] = useState({ nombre: '', email: '', whatsapp: '', empresa: '', servicio: '', mensaje: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    // Save to Firestore
    try {
      const { db } = await import('@/lib/firebase');
      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
      await addDoc(collection(db, 'leads'), { ...form, estado: 'nuevo', createdAt: serverTimestamp() });
      setSent(true);
    } catch (err) {
      console.error(err);
    }
    setSending(false);
  };

  if (sent) {
    return (
      <section id="contacto" className="py-32 px-6">
        <div className="max-w-xl mx-auto text-center">
          <div className="card glow-green">
            <div className="text-5xl mb-4">🎉</div>
            <h3 className="font-syne font-black text-2xl gradient-text mb-3">¡Mensaje recibido!</h3>
            <p className="font-dm text-white/50">Te contactaremos en menos de 24 horas para agendar tu llamada estratégica.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="contacto" className="py-32 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial-green" />
      <div className="max-w-2xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-6">
            <span className="text-xs font-dm text-[#22C55E] uppercase tracking-widest">Comenzar ahora</span>
          </div>
          <h2 className="font-syne font-black text-4xl md:text-5xl gradient-text-white mb-4">
            Solicita tu propuesta<br />personalizada
          </h2>
          <p className="font-dm text-white/50">Sin compromisos. Analizamos tu negocio y te enviamos una estrategia clara.</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-dm text-white/40 mb-2 uppercase tracking-wider">Nombre *</label>
              <input required className="input-field" placeholder="Tu nombre completo" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-dm text-white/40 mb-2 uppercase tracking-wider">Email *</label>
              <input required type="email" className="input-field" placeholder="tu@email.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-dm text-white/40 mb-2 uppercase tracking-wider">WhatsApp</label>
              <input className="input-field" placeholder="+58 412 000 0000" value={form.whatsapp} onChange={e => setForm({...form, whatsapp: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-dm text-white/40 mb-2 uppercase tracking-wider">Empresa</label>
              <input className="input-field" placeholder="Nombre de tu empresa" value={form.empresa} onChange={e => setForm({...form, empresa: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-dm text-white/40 mb-2 uppercase tracking-wider">Servicio de interés</label>
            <select className="input-field" value={form.servicio} onChange={e => setForm({...form, servicio: e.target.value})}>
              <option value="">Selecciona un servicio</option>
              {services.map(s => <option key={s.title} value={s.title}>{s.title}</option>)}
              <option value="Todo el sistema">Sistema de crecimiento completo</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-dm text-white/40 mb-2 uppercase tracking-wider">Cuéntanos sobre tu negocio</label>
            <textarea rows={4} className="input-field resize-none" placeholder="¿Qué hace tu empresa? ¿Cuál es tu mayor reto ahora mismo?" value={form.mensaje} onChange={e => setForm({...form, mensaje: e.target.value})} />
          </div>
          <button type="submit" disabled={sending} className="btn-primary w-full py-4 rounded-xl font-syne font-bold text-base glow-green-sm disabled:opacity-50">
            {sending ? 'Enviando...' : 'Enviar solicitud →'}
          </button>
          <p className="text-center text-xs font-dm text-white/30">Respuesta garantizada en menos de 24 horas</p>
        </form>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t border-white/5 py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#22C55E] to-[#1A3A8F] flex items-center justify-center">
            <span className="font-syne font-black text-white text-xs">C</span>
          </div>
          <span className="font-syne font-bold text-white">CreceCon</span>
        </div>
        <p className="font-dm text-white/30 text-sm text-center">
          Más crecimiento, más clientes. Más ventas — CRECECON nosotros
        </p>
        <div className="flex items-center gap-4">
          {['Instagram', 'Facebook', 'TikTok'].map((red) => (
            <a key={red} href={`https://${red.toLowerCase()}.com/crececon`} target="_blank" rel="noopener noreferrer"
              className="text-xs font-dm text-white/30 hover:text-[#22C55E] transition-colors">
              {red}
            </a>
          ))}
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-white/5 text-center">
        <p className="font-dm text-white/20 text-xs">© {new Date().getFullYear()} CreceCon. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <main className="noise">
      <Navbar />
      <Hero />
      <Services />
      <Process />
      <Cases />
      <FAQ />
      <ContactForm />
      <Footer />
    </main>
  );
}
