'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

function SplashScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 400);
    const t2 = setTimeout(() => setPhase(2), 1200);
    const t3 = setTimeout(() => setPhase(3), 2200);
    const t4 = setTimeout(() => { setPhase(4); setTimeout(onDone, 800); }, 3800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [onDone]);
  return (
    <div style={{position:'fixed',inset:0,zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',background:'#050814',transition:'opacity 0.8s ease',opacity:phase===4?0:1,pointerEvents:phase===4?'none':'all'}}>
      <div style={{position:'absolute',inset:0,overflow:'hidden'}}>
        <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:600,height:600,borderRadius:'50%',background:'radial-gradient(circle,rgba(26,58,143,0.3) 0%,transparent 70%)',filter:'blur(60px)'}}/>
        <div style={{position:'absolute',bottom:'20%',right:'20%',width:300,height:300,borderRadius:'50%',background:'radial-gradient(circle,rgba(34,197,94,0.15) 0%,transparent 70%)',filter:'blur(40px)'}}/>
        <div style={{position:'absolute',inset:0,opacity:0.04,backgroundImage:'linear-gradient(rgba(255,255,255,0.8) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.8) 1px,transparent 1px)',backgroundSize:'50px 50px'}}/>
      </div>
      <div style={{position:'relative',zIndex:1,textAlign:'center',padding:'0 24px'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:14,marginBottom:48,opacity:phase>=1?1:0,transform:phase>=1?'translateY(0)':'translateY(24px)',transition:'all 0.7s cubic-bezier(0.34,1.56,0.64,1)'}}>
          <div style={{width:52,height:52,borderRadius:16,background:'linear-gradient(135deg,#1A3A8F,#2563EB)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 8px 32px rgba(37,99,235,0.5)'}}>
            <span style={{color:'#fff',fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:26}}>C</span>
          </div>
          <span style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:36,color:'#fff',letterSpacing:'-0.03em'}}>Crece<span style={{color:'#22C55E'}}>Con</span></span>
        </div>
        <div style={{overflow:'hidden',marginBottom:12}}>
          <div style={{opacity:phase>=2?1:0,transform:phase>=2?'translateY(0)':'translateY(100%)',transition:'all 0.8s cubic-bezier(0.34,1.56,0.64,1) 0.05s',fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'clamp(1.8rem,4vw,3rem)',color:'#fff',letterSpacing:'-0.03em',lineHeight:1.15}}>
            Más crecimiento.
          </div>
        </div>
        <div style={{overflow:'hidden',marginBottom:12}}>
          <div style={{opacity:phase>=2?1:0,transform:phase>=2?'translateY(0)':'translateY(100%)',transition:'all 0.8s cubic-bezier(0.34,1.56,0.64,1) 0.2s',fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'clamp(1.8rem,4vw,3rem)',background:'linear-gradient(135deg,#60A5FA,#22C55E)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',letterSpacing:'-0.03em',lineHeight:1.15}}>
            Más clientes.
          </div>
        </div>
        <div style={{overflow:'hidden',marginBottom:48}}>
          <div style={{opacity:phase>=2?1:0,transform:phase>=2?'translateY(0)':'translateY(100%)',transition:'all 0.8s cubic-bezier(0.34,1.56,0.64,1) 0.35s',fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'clamp(1.8rem,4vw,3rem)',color:'rgba(255,255,255,0.45)',letterSpacing:'-0.03em',lineHeight:1.15}}>
            Más ventas.
          </div>
        </div>
        <div style={{opacity:phase>=3?1:0,transform:phase>=3?'translateY(0)':'translateY(10px)',transition:'all 0.6s ease',display:'flex',alignItems:'center',justifyContent:'center',gap:10}}>
          <div style={{width:8,height:8,borderRadius:'50%',background:'#22C55E',animation:'pulse 1.2s ease-in-out infinite'}}/>
          <span style={{fontFamily:'DM Sans,sans-serif',fontSize:'0.8rem',color:'rgba(255,255,255,0.4)',letterSpacing:'0.12em',textTransform:'uppercase'}}>Cargando plataforma</span>
        </div>
      </div>
    </div>
  );
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);
  return (
    <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:50,transition:'all 0.5s ease',background:scrolled?'rgba(5,8,20,0.92)':'transparent',backdropFilter:scrolled?'blur(20px)':'none',borderBottom:scrolled?'1px solid rgba(255,255,255,0.05)':'none',padding:'0 24px'}}>
      <div style={{maxWidth:1280,margin:'0 auto',height:72,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:34,height:34,borderRadius:10,background:'linear-gradient(135deg,#1A3A8F,#2563EB)',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <span style={{color:'#fff',fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:17}}>C</span>
          </div>
          <span style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:20,color:'#fff',letterSpacing:'-0.01em'}}>Crece<span style={{color:'#22C55E'}}>Con</span></span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:4}} className="hidden md:flex">
          {['Servicios','Proceso','Casos de Éxito','FAQ'].map(item=>(
            <a key={item} href={`#${item.toLowerCase().replace(' ','-').replace('é','e')}`} style={{color:'rgba(255,255,255,0.55)',fontSize:'0.875rem',fontWeight:500,padding:'8px 14px',borderRadius:8,transition:'all 0.2s',fontFamily:'DM Sans,sans-serif',textDecoration:'none'}}
              onMouseEnter={e=>{(e.target as HTMLAnchorElement).style.color='#fff';(e.target as HTMLAnchorElement).style.background='rgba(255,255,255,0.06)'}}
              onMouseLeave={e=>{(e.target as HTMLAnchorElement).style.color='rgba(255,255,255,0.55)';(e.target as HTMLAnchorElement).style.background='transparent'}}>{item}</a>
          ))}
        </div>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <Link href="/login" className="btn-outline hidden md:inline-flex" style={{fontSize:'0.85rem',padding:'9px 18px'}}>Iniciar sesión</Link>
          <a href="#contacto" className="btn-primary" style={{fontSize:'0.85rem',padding:'9px 18px'}}>Empezar ahora</a>
          <button className="md:hidden" onClick={()=>setMenuOpen(!menuOpen)} style={{color:'rgba(255,255,255,0.7)',background:'none',border:'none',cursor:'pointer',fontSize:'1.4rem',padding:'4px'}}>{menuOpen?'✕':'☰'}</button>
        </div>
      </div>
      {menuOpen&&(
        <div style={{background:'rgba(5,8,20,0.98)',backdropFilter:'blur(20px)',borderTop:'1px solid rgba(255,255,255,0.05)',padding:'16px 24px 24px'}}>
          {['Servicios','Proceso','Casos de Éxito','FAQ'].map(item=>(
            <a key={item} href={`#${item.toLowerCase()}`} onClick={()=>setMenuOpen(false)} style={{display:'block',color:'rgba(255,255,255,0.7)',padding:'12px 0',borderBottom:'1px solid rgba(255,255,255,0.04)',fontFamily:'DM Sans,sans-serif',textDecoration:'none',fontSize:'0.95rem'}}>{item}</a>
          ))}
          <Link href="/login" style={{display:'block',color:'#60A5FA',padding:'12px 0',fontFamily:'DM Sans,sans-serif',textDecoration:'none'}}>Iniciar sesión →</Link>
        </div>
      )}
    </nav>
  );
}

function Hero() {
  const [visible, setVisible] = useState(false);
  useEffect(()=>{ const t=setTimeout(()=>setVisible(true),100); return ()=>clearTimeout(t); },[]);
  return (
    <section style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',position:'relative',overflow:'hidden',paddingTop:100,paddingBottom:80}} className="bg-gradient-mesh grid-pattern">
      <div style={{position:'absolute',inset:0,pointerEvents:'none'}}>
        <div style={{position:'absolute',top:'15%',left:'50%',transform:'translateX(-50%)',width:600,height:400,borderRadius:'50%',background:'radial-gradient(ellipse,rgba(26,58,143,0.2) 0%,transparent 70%)',filter:'blur(60px)'}}/>
        <div style={{position:'absolute',bottom:'10%',right:'5%',width:350,height:280,borderRadius:'50%',background:'radial-gradient(ellipse,rgba(34,197,94,0.1) 0%,transparent 70%)',filter:'blur(50px)'}}/>
      </div>
      <div style={{maxWidth:860,margin:'0 auto',padding:'0 24px',textAlign:'center',position:'relative',zIndex:1}}>
        <div style={{opacity:visible?1:0,transform:visible?'translateY(0)':'translateY(16px)',transition:'all 0.6s ease',display:'inline-flex',alignItems:'center',gap:8,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:9999,padding:'6px 16px',marginBottom:28}}>
          <span style={{width:6,height:6,borderRadius:'50%',background:'#22C55E',display:'inline-block'}}/>
          <span style={{fontFamily:'DM Sans,sans-serif',fontSize:'0.72rem',color:'rgba(255,255,255,0.55)',letterSpacing:'0.12em',textTransform:'uppercase'}}>Sistema de Crecimiento Digital</span>
        </div>
        <div style={{overflow:'hidden',marginBottom:6}}>
          <h1 style={{opacity:visible?1:0,transform:visible?'translateY(0)':'translateY(50px)',transition:'all 0.8s cubic-bezier(0.34,1.56,0.64,1) 0.1s',fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'clamp(1.8rem,3.5vw,3.2rem)',lineHeight:1.1,letterSpacing:'-0.03em',color:'#fff',margin:0}}>
            Construimos sistemas
          </h1>
        </div>
        <div style={{overflow:'hidden',marginBottom:6}}>
          <h1 style={{opacity:visible?1:0,transform:visible?'translateY(0)':'translateY(50px)',transition:'all 0.8s cubic-bezier(0.34,1.56,0.64,1) 0.22s',fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'clamp(1.8rem,3.5vw,3.2rem)',lineHeight:1.1,letterSpacing:'-0.03em',background:'linear-gradient(135deg,#60A5FA,#22C55E)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',margin:0}}>
            digitales que consiguen
          </h1>
        </div>
        <div style={{overflow:'hidden',marginBottom:28}}>
          <h1 style={{opacity:visible?1:0,transform:visible?'translateY(0)':'translateY(50px)',transition:'all 0.8s cubic-bezier(0.34,1.56,0.64,1) 0.34s',fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'clamp(1.8rem,3.5vw,3.2rem)',lineHeight:1.1,letterSpacing:'-0.03em',color:'rgba(255,255,255,0.45)',margin:0}}>
            clientes mientras duermes.
          </h1>
        </div>
        <p style={{opacity:visible?1:0,transform:visible?'translateY(0)':'translateY(16px)',transition:'all 0.6s ease 0.45s',fontFamily:'DM Sans,sans-serif',color:'rgba(255,255,255,0.5)',fontSize:'clamp(0.9rem,1.8vw,1.1rem)',maxWidth:520,margin:'0 auto 36px',lineHeight:1.75}}>
          Más crecimiento, más clientes, más ventas. Tu negocio en un sistema digital medible que trabaja 24/7 por ti.
        </p>
        <div style={{opacity:visible?1:0,transform:visible?'translateY(0)':'translateY(16px)',transition:'all 0.6s ease 0.55s',display:'flex',gap:14,justifyContent:'center',flexWrap:'wrap'}}>
          <a href="https://wa.me/584128021091" target="_blank" rel="noopener noreferrer" className="btn-primary glow-green-sm" style={{padding:'13px 28px',fontSize:'0.95rem'}}>
            💬 Agendar llamada
          </a>
          <a href="#contacto" className="btn-outline" style={{padding:'13px 28px',fontSize:'0.95rem'}}>
            Solicitar propuesta →
          </a>
        </div>
        <div style={{opacity:visible?1:0,transition:'opacity 0.6s ease 0.7s',marginTop:56,display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:20,maxWidth:420,marginLeft:'auto',marginRight:'auto'}}>
          {[{num:'100+',label:'Clientes activos'},{num:'3x',label:'Crecimiento promedio'},{num:'24/7',label:'Sistemas activos'}].map(s=>(
            <div key={s.label} style={{textAlign:'center'}}>
              <div style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'1.6rem',background:'linear-gradient(135deg,#60A5FA,#22C55E)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>{s.num}</div>
              <div style={{fontFamily:'DM Sans,sans-serif',fontSize:'0.75rem',color:'rgba(255,255,255,0.38)',marginTop:3}}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const services = [
  {icon:'🌐',title:'Desarrollo Web Premium',desc:'Sitios de alto rendimiento que convierten visitantes en clientes.'},
  {icon:'📱',title:'Aplicaciones PWA',desc:'Apps progresivas que funcionan como nativas sin costos de App Store.'},
  {icon:'🔍',title:'SEO Avanzado',desc:'Posicionamiento que lleva tu negocio a la primera página de Google.'},
  {icon:'📣',title:'Meta Ads',desc:'Campañas de Facebook e Instagram con segmentación precisa.'},
  {icon:'🎯',title:'Google Ads',desc:'Anuncios que capturan clientes en el momento exacto de compra.'},
  {icon:'⚡',title:'Automatización',desc:'Sistemas que trabajan solos: emails, seguimientos y procesos.'},
  {icon:'🤖',title:'Bots de WhatsApp',desc:'Atención al cliente 24/7 que califica y convierte leads.'},
  {icon:'✨',title:'Branding Digital',desc:'Identidad visual premium que genera confianza instantánea.'},
];

function Services() {
  return (
    <section id="servicios" style={{padding:'96px 24px'}}>
      <div style={{maxWidth:1280,margin:'0 auto'}}>
        <div style={{textAlign:'center',marginBottom:56}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(34,197,94,0.08)',border:'1px solid rgba(34,197,94,0.2)',borderRadius:9999,padding:'6px 16px',marginBottom:18}}>
            <span style={{fontFamily:'DM Sans,sans-serif',fontSize:'0.72rem',color:'#22C55E',letterSpacing:'0.12em',textTransform:'uppercase'}}>Nuestros servicios</span>
          </div>
          <h2 style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'clamp(1.6rem,3vw,2.5rem)',color:'#fff',letterSpacing:'-0.02em',marginBottom:14,lineHeight:1.2}}>
            Todo lo que tu negocio<br/>necesita para crecer
          </h2>
          <p style={{fontFamily:'DM Sans,sans-serif',color:'rgba(255,255,255,0.45)',fontSize:'1rem',maxWidth:480,margin:'0 auto',lineHeight:1.7}}>
            Un ecosistema completo de soluciones digitales para convertir y escalar.
          </p>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:16}}>
          {services.map((s,i)=>(
            <div key={s.title} className="card glass-hover" style={{animationDelay:`${i*0.05}s`}}>
              <div style={{fontSize:'1.8rem',marginBottom:14}}>{s.icon}</div>
              <h3 style={{fontFamily:'Syne,sans-serif',fontWeight:700,color:'#fff',fontSize:'0.95rem',marginBottom:8,lineHeight:1.3}}>{s.title}</h3>
              <p style={{fontFamily:'DM Sans,sans-serif',color:'rgba(255,255,255,0.42)',fontSize:'0.85rem',lineHeight:1.6,margin:0}}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const steps=[
  {num:'01',title:'Pago',desc:'Confirmas tu inversión y accedes al sistema.'},
  {num:'02',title:'Onboarding',desc:'Completamos tu perfil empresarial completo.'},
  {num:'03',title:'Diseño',desc:'Creamos la identidad visual de tu proyecto.'},
  {num:'04',title:'Desarrollo',desc:'Construimos tu solución digital.'},
  {num:'05',title:'Lanzamiento',desc:'Publicamos y activamos tu sistema.'},
  {num:'06',title:'Escalamiento',desc:'Optimizamos y hacemos crecer los resultados.'},
];

function Process() {
  return (
    <section id="proceso" style={{padding:'96px 24px',background:'rgba(255,255,255,0.015)'}}>
      <div style={{maxWidth:1280,margin:'0 auto'}}>
        <div style={{textAlign:'center',marginBottom:56}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(37,99,235,0.08)',border:'1px solid rgba(37,99,235,0.2)',borderRadius:9999,padding:'6px 16px',marginBottom:18}}>
            <span style={{fontFamily:'DM Sans,sans-serif',fontSize:'0.72rem',color:'#60A5FA',letterSpacing:'0.12em',textTransform:'uppercase'}}>Cómo trabajamos</span>
          </div>
          <h2 style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'clamp(1.6rem,3vw,2.5rem)',color:'#fff',letterSpacing:'-0.02em',lineHeight:1.2}}>
            Proceso simple.<br/>Resultados extraordinarios.
          </h2>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:14}}>
          {steps.map(step=>(
            <div key={step.num} className="card glass-hover" style={{textAlign:'center'}}>
              <div style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'2rem',background:'linear-gradient(135deg,#60A5FA,#22C55E)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',marginBottom:10}}>{step.num}</div>
              <h3 style={{fontFamily:'Syne,sans-serif',fontWeight:700,color:'#fff',fontSize:'0.9rem',marginBottom:6}}>{step.title}</h3>
              <p style={{fontFamily:'DM Sans,sans-serif',color:'rgba(255,255,255,0.38)',fontSize:'0.78rem',lineHeight:1.6,margin:0}}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const cases=[
  {empresa:"Barbershop Walla's",tipo:'Desarrollo Web + PWA',resultado:'+340% reservas online',tag:'Barbería'},
  {empresa:'Clínica Dental Plus',tipo:'SEO + Google Ads',resultado:'+250% pacientes nuevos',tag:'Salud'},
  {empresa:'Tienda ModaVip',tipo:'E-commerce + Meta Ads',resultado:'+180% ventas mensuales',tag:'Retail'},
];

function Cases() {
  return (
    <section id="casos-de-exito" style={{padding:'96px 24px'}}>
      <div style={{maxWidth:1280,margin:'0 auto'}}>
        <div style={{textAlign:'center',marginBottom:56}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(168,85,247,0.08)',border:'1px solid rgba(168,85,247,0.2)',borderRadius:9999,padding:'6px 16px',marginBottom:18}}>
            <span style={{fontFamily:'DM Sans,sans-serif',fontSize:'0.72rem',color:'#C084FC',letterSpacing:'0.12em',textTransform:'uppercase'}}>Resultados reales</span>
          </div>
          <h2 style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'clamp(1.6rem,3vw,2.5rem)',color:'#fff',letterSpacing:'-0.02em',lineHeight:1.2}}>
            Negocios que ya<br/>están creciendo
          </h2>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:20}}>
          {cases.map(c=>(
            <div key={c.empresa} className="card glass-hover" style={{position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:'linear-gradient(90deg,transparent,rgba(34,197,94,0.5),transparent)'}}/>
              <span className="badge-green" style={{display:'inline-flex',marginBottom:14,fontSize:'0.72rem'}}>{c.tag}</span>
              <h3 style={{fontFamily:'Syne,sans-serif',fontWeight:700,color:'#fff',fontSize:'1.1rem',marginBottom:6}}>{c.empresa}</h3>
              <p style={{fontFamily:'DM Sans,sans-serif',color:'rgba(255,255,255,0.38)',fontSize:'0.85rem',marginBottom:14}}>{c.tipo}</p>
              <div style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'1.6rem',background:'linear-gradient(135deg,#60A5FA,#22C55E)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>{c.resultado}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const faqs=[
  {q:'¿Cuánto tiempo tarda en desarrollarse mi proyecto?',a:'Depende del alcance. Un sitio web premium tarda 2-3 semanas. Una PWA completa entre 4-8 semanas.'},
  {q:'¿Cómo puedo ver el avance de mi proyecto?',a:'Tendrás acceso a tu panel personalizado donde verás el progreso en tiempo real y podrás comunicarte con tu equipo.'},
  {q:'¿Trabajan con clientes de cualquier país?',a:'Sí, operamos 100% digital con clientes de toda Latinoamérica, España y Estados Unidos.'},
  {q:'¿Qué incluye el sistema de crecimiento?',a:'Web, automatizaciones, campañas, métricas y soporte continuo. Un sistema completo que convierte de forma medible.'},
  {q:'¿Hay precios fijos?',a:'Cada proyecto es a medida. Analizamos tu negocio y enviamos una propuesta personalizada.'},
];

function FAQ() {
  const [open,setOpen]=useState<number|null>(null);
  return (
    <section id="faq" style={{padding:'96px 24px',background:'rgba(255,255,255,0.015)'}}>
      <div style={{maxWidth:680,margin:'0 auto'}}>
        <div style={{textAlign:'center',marginBottom:56}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(234,179,8,0.08)',border:'1px solid rgba(234,179,8,0.2)',borderRadius:9999,padding:'6px 16px',marginBottom:18}}>
            <span style={{fontFamily:'DM Sans,sans-serif',fontSize:'0.72rem',color:'#FDE047',letterSpacing:'0.12em',textTransform:'uppercase'}}>Preguntas frecuentes</span>
          </div>
          <h2 style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'clamp(1.6rem,3vw,2.5rem)',color:'#fff',letterSpacing:'-0.02em'}}>Todo lo que necesitas saber</h2>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {faqs.map((faq,i)=>(
            <div key={i} className="card" style={{cursor:'pointer',borderColor:open===i?'rgba(37,99,235,0.4)':'rgba(255,255,255,0.08)',transition:'border-color 0.2s'}} onClick={()=>setOpen(open===i?null:i)}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:16}}>
                <h3 style={{fontFamily:'Syne,sans-serif',fontWeight:600,color:'#fff',fontSize:'0.9rem',margin:0,lineHeight:1.4}}>{faq.q}</h3>
                <span style={{flexShrink:0,width:22,height:22,borderRadius:'50%',border:'1px solid rgba(255,255,255,0.15)',display:'flex',alignItems:'center',justifyContent:'center',color:'rgba(255,255,255,0.5)',fontSize:'1rem',transition:'transform 0.2s,background 0.2s',transform:open===i?'rotate(45deg)':'none',background:open===i?'#22C55E':'transparent'}}>+</span>
              </div>
              {open===i&&<p style={{fontFamily:'DM Sans,sans-serif',color:'rgba(255,255,255,0.5)',fontSize:'0.85rem',marginTop:14,paddingTop:14,borderTop:'1px solid rgba(255,255,255,0.05)',lineHeight:1.7,margin:'14px 0 0'}}>{faq.a}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactForm() {
  const [form,setForm]=useState({nombre:'',email:'',whatsapp:'',empresa:'',servicio:'',mensaje:''});
  const [sending,setSending]=useState(false);
  const [sent,setSent]=useState(false);
  const handleSubmit=async(e:React.FormEvent)=>{
    e.preventDefault();setSending(true);
    try {
      const {db}=await import('@/lib/firebase');
      const {collection,addDoc,serverTimestamp}=await import('firebase/firestore');
      await addDoc(collection(db,'leads'),{...form,estado:'nuevo',createdAt:serverTimestamp()});
      setSent(true);
    } catch(err){console.error(err);}
    setSending(false);
  };
  if(sent) return (
    <section id="contacto" style={{padding:'96px 24px'}}>
      <div style={{maxWidth:520,margin:'0 auto',textAlign:'center'}}>
        <div className="card glow-green" style={{padding:48}}>
          <div style={{fontSize:'2.5rem',marginBottom:14}}>🎉</div>
          <h3 style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'1.4rem',background:'linear-gradient(135deg,#60A5FA,#22C55E)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',marginBottom:10}}>¡Mensaje recibido!</h3>
          <p style={{fontFamily:'DM Sans,sans-serif',color:'rgba(255,255,255,0.5)',fontSize:'0.9rem'}}>Te contactaremos en menos de 24 horas.</p>
        </div>
      </div>
    </section>
  );
  return (
    <section id="contacto" style={{padding:'96px 24px',position:'relative',overflow:'hidden'}}>
      <div className="bg-gradient-radial-green" style={{position:'absolute',inset:0}}/>
      <div style={{maxWidth:600,margin:'0 auto',position:'relative',zIndex:1}}>
        <div style={{textAlign:'center',marginBottom:44}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(34,197,94,0.08)',border:'1px solid rgba(34,197,94,0.2)',borderRadius:9999,padding:'6px 16px',marginBottom:18}}>
            <span style={{fontFamily:'DM Sans,sans-serif',fontSize:'0.72rem',color:'#22C55E',letterSpacing:'0.12em',textTransform:'uppercase'}}>Comenzar ahora</span>
          </div>
          <h2 style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'clamp(1.6rem,3vw,2.5rem)',color:'#fff',letterSpacing:'-0.02em',marginBottom:10,lineHeight:1.2}}>Solicita tu propuesta<br/>personalizada</h2>
          <p style={{fontFamily:'DM Sans,sans-serif',color:'rgba(255,255,255,0.45)',fontSize:'0.95rem'}}>Sin compromisos. Analizamos tu negocio y te enviamos una estrategia clara.</p>
        </div>
        <form onSubmit={handleSubmit} className="card" style={{display:'flex',flexDirection:'column',gap:14}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
            <div><label style={{display:'block',fontFamily:'DM Sans,sans-serif',fontSize:'0.72rem',color:'rgba(255,255,255,0.38)',marginBottom:7,textTransform:'uppercase',letterSpacing:'0.05em'}}>Nombre *</label><input required className="input-field" placeholder="Tu nombre completo" value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})}/></div>
            <div><label style={{display:'block',fontFamily:'DM Sans,sans-serif',fontSize:'0.72rem',color:'rgba(255,255,255,0.38)',marginBottom:7,textTransform:'uppercase',letterSpacing:'0.05em'}}>Email *</label><input required type="email" className="input-field" placeholder="tu@email.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
            <div><label style={{display:'block',fontFamily:'DM Sans,sans-serif',fontSize:'0.72rem',color:'rgba(255,255,255,0.38)',marginBottom:7,textTransform:'uppercase',letterSpacing:'0.05em'}}>WhatsApp</label><input className="input-field" placeholder="+58 412 000 0000" value={form.whatsapp} onChange={e=>setForm({...form,whatsapp:e.target.value})}/></div>
            <div><label style={{display:'block',fontFamily:'DM Sans,sans-serif',fontSize:'0.72rem',color:'rgba(255,255,255,0.38)',marginBottom:7,textTransform:'uppercase',letterSpacing:'0.05em'}}>Empresa</label><input className="input-field" placeholder="Nombre de tu empresa" value={form.empresa} onChange={e=>setForm({...form,empresa:e.target.value})}/></div>
          </div>
          <div><label style={{display:'block',fontFamily:'DM Sans,sans-serif',fontSize:'0.72rem',color:'rgba(255,255,255,0.38)',marginBottom:7,textTransform:'uppercase',letterSpacing:'0.05em'}}>Servicio de interés</label>
            <select className="input-field" value={form.servicio} onChange={e=>setForm({...form,servicio:e.target.value})}>
              <option value="">Selecciona un servicio</option>
              {services.map(s=><option key={s.title} value={s.title}>{s.title}</option>)}
              <option value="Sistema completo">Sistema de crecimiento completo</option>
            </select>
          </div>
          <div><label style={{display:'block',fontFamily:'DM Sans,sans-serif',fontSize:'0.72rem',color:'rgba(255,255,255,0.38)',marginBottom:7,textTransform:'uppercase',letterSpacing:'0.05em'}}>Cuéntanos sobre tu negocio</label><textarea rows={4} className="input-field" style={{resize:'none'}} placeholder="¿Qué hace tu empresa? ¿Cuál es tu mayor reto?" value={form.mensaje} onChange={e=>setForm({...form,mensaje:e.target.value})}/></div>
          <button type="submit" disabled={sending} className="btn-primary glow-green-sm" style={{width:'100%',justifyContent:'center',padding:'13px',fontSize:'0.95rem',opacity:sending?0.7:1}}>
            {sending?'Enviando...':'Enviar solicitud →'}
          </button>
          <p style={{textAlign:'center',fontFamily:'DM Sans,sans-serif',fontSize:'0.72rem',color:'rgba(255,255,255,0.28)',margin:0}}>Respuesta garantizada en menos de 24 horas</p>
        </form>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{borderTop:'1px solid rgba(255,255,255,0.05)',padding:'44px 24px',background:'rgba(255,255,255,0.01)'}}>
      <div style={{maxWidth:1280,margin:'0 auto',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:20}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:28,height:28,borderRadius:8,background:'linear-gradient(135deg,#1A3A8F,#2563EB)',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <span style={{color:'#fff',fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:13}}>C</span>
          </div>
          <span style={{fontFamily:'Syne,sans-serif',fontWeight:700,color:'#fff',fontSize:'1rem'}}>Crece<span style={{color:'#22C55E'}}>Con</span></span>
        </div>
        <p style={{fontFamily:'DM Sans,sans-serif',color:'rgba(255,255,255,0.28)',fontSize:'0.82rem',textAlign:'center',margin:0}}>
          Más crecimiento, más clientes. Más ventas — CRECECON nosotros
        </p>
        <div style={{display:'flex',gap:18}}>
          {['Instagram','Facebook','TikTok'].map(red=>(
            <a key={red} href={`https://${red.toLowerCase()}.com/crececon`} target="_blank" rel="noopener noreferrer" style={{fontFamily:'DM Sans,sans-serif',fontSize:'0.82rem',color:'rgba(255,255,255,0.28)',textDecoration:'none',transition:'color 0.2s'}}
              onMouseEnter={e=>(e.target as HTMLAnchorElement).style.color='#22C55E'} onMouseLeave={e=>(e.target as HTMLAnchorElement).style.color='rgba(255,255,255,0.28)'}>{red}</a>
          ))}
        </div>
      </div>
      <div style={{maxWidth:1280,margin:'28px auto 0',paddingTop:20,borderTop:'1px solid rgba(255,255,255,0.04)',textAlign:'center'}}>
        <p style={{fontFamily:'DM Sans,sans-serif',color:'rgba(255,255,255,0.18)',fontSize:'0.72rem',margin:0}}>© {new Date().getFullYear()} CreceCon. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}

export default function HomePage() {
  const [showSplash,setShowSplash]=useState(true);
  return (
    <>
      {showSplash&&<SplashScreen onDone={()=>setShowSplash(false)}/>}
      <main className="noise" style={{opacity:showSplash?0:1,transition:'opacity 0.8s ease'}}>
        <Navbar/>
        <Hero/>
        <Services/>
        <Process/>
        <Cases/>
        <FAQ/>
        <ContactForm/>
        <Footer/>
      </main>
    </>
  );
}

