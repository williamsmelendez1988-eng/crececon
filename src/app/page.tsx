'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

function SplashScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 300);
    const t2 = setTimeout(() => setPhase(2), 900);
    const t3 = setTimeout(() => setPhase(3), 1600);
    const t4 = setTimeout(() => { setPhase(4); setTimeout(onDone, 600); }, 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [onDone]);
  return (
    <div style={{
      position:'fixed',inset:0,zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',
      background:'#050814',transition:'opacity 0.6s ease',opacity: phase===4?0:1,pointerEvents: phase===4?'none':'all'
    }}>
      <div style={{position:'absolute',inset:0,overflow:'hidden'}}>
        <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:600,height:600,borderRadius:'50%',background:'radial-gradient(circle,rgba(26,58,143,0.3) 0%,transparent 70%)',filter:'blur(60px)'}}/>
        <div style={{position:'absolute',bottom:'20%',right:'20%',width:300,height:300,borderRadius:'50%',background:'radial-gradient(circle,rgba(34,197,94,0.15) 0%,transparent 70%)',filter:'blur(40px)'}}/>
      </div>
      <div style={{position:'relative',zIndex:1,textAlign:'center'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:12,marginBottom:32,opacity:phase>=1?1:0,transform:phase>=1?'translateY(0)':'translateY(20px)',transition:'all 0.6s cubic-bezier(0.34,1.56,0.64,1)'}}>
          <div style={{width:48,height:48,borderRadius:14,background:'linear-gradient(135deg,#1A3A8F,#2563EB)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 8px 32px rgba(37,99,235,0.4)'}}>
            <span style={{color:'#fff',fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:24}}>C</span>
          </div>
          <span style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:32,color:'#fff',letterSpacing:'-0.03em'}}>
            Crece<span style={{color:'#22C55E'}}>Con</span>
          </span>
        </div>
        <div style={{overflow:'hidden',marginBottom:16}}>
          <div style={{opacity:phase>=2?1:0,transform:phase>=2?'translateY(0)':'translateY(100%)',transition:'all 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.1s',fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'clamp(2rem,5vw,3.5rem)',color:'#fff',letterSpacing:'-0.03em',lineHeight:1.1}}>
            Más crecimiento.
          </div>
        </div>
        <div style={{overflow:'hidden',marginBottom:16}}>
          <div style={{opacity:phase>=2?1:0,transform:phase>=2?'translateY(0)':'translateY(100%)',transition:'all 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.25s',fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'clamp(2rem,5vw,3.5rem)',background:'linear-gradient(135deg,#60A5FA,#22C55E)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',letterSpacing:'-0.03em',lineHeight:1.1}}>
            Más clientes.
          </div>
        </div>
        <div style={{overflow:'hidden',marginBottom:40}}>
          <div style={{opacity:phase>=2?1:0,transform:phase>=2?'translateY(0)':'translateY(100%)',transition:'all 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.4s',fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'clamp(2rem,5vw,3.5rem)',color:'rgba(255,255,255,0.5)',letterSpacing:'-0.03em',lineHeight:1.1}}>
            Más ventas.
          </div>
        </div>
        <div style={{opacity:phase>=3?1:0,transform:phase>=3?'translateY(0)':'translateY(10px)',transition:'all 0.5s ease',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
          <div style={{width:6,height:6,borderRadius:'50%',background:'#22C55E',animation:'pulse 1s ease-in-out infinite'}}/>
          <span style={{fontFamily:'DM Sans,sans-serif',fontSize:'0.875rem',color:'rgba(255,255,255,0.4)',letterSpacing:'0.1em',textTransform:'uppercase'}}>Cargando plataforma</span>
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
    <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:50,transition:'all 0.5s ease',background:scrolled?'rgba(5,8,20,0.9)':'transparent',backdropFilter:scrolled?'blur(20px)':'none',borderBottom:scrolled?'1px solid rgba(255,255,255,0.05)':'none',padding:'0 24px'}}>
      <div style={{maxWidth:1280,margin:'0 auto',height:72,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:32,height:32,borderRadius:10,background:'linear-gradient(135deg,#1A3A8F,#2563EB)',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <span style={{color:'#fff',fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:16}}>C</span>
          </div>
          <span style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:20,color:'#fff'}}>Crece<span style={{color:'#22C55E'}}>Con</span></span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8}} className="hidden md:flex">
          {['Servicios','Proceso','Casos de Éxito','FAQ'].map(item=>(
            <a key={item} href={`#${item.toLowerCase().replace(' ','-').replace('é','e')}`} style={{color:'rgba(255,255,255,0.6)',fontSize:'0.875rem',fontWeight:500,padding:'8px 14px',borderRadius:8,transition:'color 0.2s',fontFamily:'DM Sans,sans-serif',textDecoration:'none'}}
              onMouseEnter={e=>(e.target as HTMLAnchorElement).style.color='#fff'} onMouseLeave={e=>(e.target as HTMLAnchorElement).style.color='rgba(255,255,255,0.6)'}>{item}</a>
          ))}
        </div>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <Link href="/login" className="btn-outline hidden md:inline-flex" style={{fontSize:'0.875rem',padding:'10px 20px'}}>Iniciar sesión</Link>
          <a href="#contacto" className="btn-primary" style={{fontSize:'0.875rem',padding:'10px 20px'}}>Empezar ahora</a>
          <button className="md:hidden" onClick={()=>setMenuOpen(!menuOpen)} style={{color:'rgba(255,255,255,0.7)',background:'none',border:'none',cursor:'pointer',fontSize:'1.5rem'}}>{menuOpen?'✕':'☰'}</button>
        </div>
      </div>
      {menuOpen&&(
        <div style={{background:'rgba(5,8,20,0.98)',backdropFilter:'blur(20px)',borderTop:'1px solid rgba(255,255,255,0.05)',padding:'16px 24px 24px'}}>
          {['Servicios','Proceso','Casos de Éxito','FAQ'].map(item=>(
            <a key={item} href={`#${item.toLowerCase()}`} onClick={()=>setMenuOpen(false)} style={{display:'block',color:'rgba(255,255,255,0.7)',padding:'12px 0',borderBottom:'1px solid rgba(255,255,255,0.04)',fontFamily:'DM Sans,sans-serif',textDecoration:'none'}}>{item}</a>
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
    <section style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',position:'relative',overflow:'hidden',paddingTop:120,paddingBottom:80}} className="bg-gradient-mesh grid-pattern">
      <div style={{position:'absolute',inset:0,pointerEvents:'none'}}>
        <div style={{position:'absolute',top:'15%',left:'50%',transform:'translateX(-50%)',width:700,height:500,borderRadius:'50%',background:'radial-gradient(ellipse,rgba(26,58,143,0.2) 0%,transparent 70%)',filter:'blur(60px)'}}/>
        <div style={{position:'absolute',bottom:'10%',right:'10%',width:400,height:300,borderRadius:'50%',background:'radial-gradient(ellipse,rgba(34,197,94,0.1) 0%,transparent 70%)',filter:'blur(50px)'}}/>
      </div>
      <div style={{maxWidth:900,margin:'0 auto',padding:'0 24px',textAlign:'center',position:'relative',zIndex:1}}>
        <div style={{opacity:visible?1:0,transform:visible?'translateY(0)':'translateY(20px)',transition:'all 0.6s ease',display:'inline-flex',alignItems:'center',gap:8,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:9999,padding:'6px 16px',marginBottom:32}}>
          <span style={{width:6,height:6,borderRadius:'50%',background:'#22C55E',display:'inline-block'}}/>
          <span style={{fontFamily:'DM Sans,sans-serif',fontSize:'0.75rem',color:'rgba(255,255,255,0.6)',letterSpacing:'0.1em',textTransform:'uppercase'}}>Sistema de Crecimiento Digital</span>
        </div>
        <div style={{overflow:'hidden',marginBottom:8}}>
          <h1 style={{opacity:visible?1:0,transform:visible?'translateY(0)':'translateY(60px)',transition:'all 0.8s cubic-bezier(0.34,1.56,0.64,1) 0.1s',fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'clamp(2.8rem,6vw,5.5rem)',lineHeight:1.05,letterSpacing:'-0.03em',color:'#fff',margin:0}}>
            Construimos sistemas
          </h1>
        </div>
        <div style={{overflow:'hidden',marginBottom:8}}>
          <h1 style={{opacity:visible?1:0,transform:visible?'translateY(0)':'translateY(60px)',transition:'all 0.8s cubic-bezier(0.34,1.56,0.64,1) 0.25s',fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'clamp(2.8rem,6vw,5.5rem)',lineHeight:1.05,letterSpacing:'-0.03em',background:'linear-gradient(135deg,#60A5FA,#22C55E)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',margin:0}}>
            digitales que consiguen
          </h1>
        </div>
        <div style={{overflow:'hidden',marginBottom:32}}>
          <h1 style={{opacity:visible?1:0,transform:visible?'translateY(0)':'translateY(60px)',transition:'all 0.8s cubic-bezier(0.34,1.56,0.64,1) 0.4s',fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'clamp(2.8rem,6vw,5.5rem)',lineHeight:1.05,letterSpacing:'-0.03em',color:'rgba(255,255,255,0.5)',margin:0}}>
            clientes mientras duermes.
          </h1>
        </div>
        <p style={{opacity:visible?1:0,transform:visible?'translateY(0)':'translateY(20px)',transition:'all 0.6s ease 0.5s',fontFamily:'DM Sans,sans-serif',color:'rgba(255,255,255,0.5)',fontSize:'clamp(1rem,2vw,1.2rem)',maxWidth:560,margin:'0 auto 40px',lineHeight:1.7}}>
          Más crecimiento, más clientes, más ventas. Tu negocio en un sistema digital medible que trabaja 24/7 por ti.
        </p>
        <div style={{opacity:visible?1:0,transform:visible?'translateY(0)':'translateY(20px)',transition:'all 0.6s ease 0.6s',display:'flex',gap:16,justifyContent:'center',flexWrap:'wrap'}}>
          <a href={`https://wa.me/584128021091`} target="_blank" rel="noopener noreferrer" className="btn-primary glow-green-sm" style={{padding:'14px 32px',fontSize:'1rem'}}>
            💬 Agendar llamada
          </a>
          <a href="#contacto" className="btn-outline" style={{padding:'14px 32px',fontSize:'1rem'}}>
            Solicitar propuesta →
          </a>
        </div>
        <div style={{opacity:visible?1:0,transition:'opacity 0.6s ease 0.8s',marginTop:64,display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:24,maxWidth:480,marginLeft:'auto',marginRight:'auto'}}>
          {[{num:'100+',label:'Clientes activos'},{num:'3x',label:'Crecimiento promedio'},{num:'24/7',label:'Sistemas activos'}].map(s=>(
            <div key={s.label} style={{textAlign:'center'}}>
              <div style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'1.75rem',background:'linear-gradient(135deg,#60A5FA,#22C55E)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>{s.num}</div>
              <div style={{fontFamily:'DM Sans,sans-serif',fontSize:'0.8rem',color:'rgba(255,255,255,0.4)',marginTop:4}}>{s.label}</div>
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
    <section id="servicios" style={{padding:'100px 24px'}}>
      <div style={{maxWidth:1280,margin:'0 auto'}}>
        <div style={{textAlign:'center',marginBottom:64}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(34,197,94,0.1)',border:'1px solid rgba(34,197,94,0.2)',borderRadius:9999,padding:'6px 16px',marginBottom:20}}>
            <span style={{fontFamily:'DM Sans,sans-serif',fontSize:'0.75rem',color:'#22C55E',letterSpacing:'0.1em',textTransform:'uppercase'}}>Nuestros servicios</span>
          </div>
          <h2 style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'clamp(2rem,4vw,3rem)',color:'#fff',letterSpacing:'-0.02em',marginBottom:16}}>
            Todo lo que tu negocio<br/>necesita para crecer
          </h2>
          <p style={{fontFamily:'DM Sans,sans-serif',color:'rgba(255,255,255,0.5)',fontSize:'1.1rem',maxWidth:520,margin:'0 auto'}}>
            Un ecosistema completo de soluciones digitales para convertir y escalar.
          </p>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:20}}>
          {services.map((s,i)=>(
            <div key={s.title} className="card glass-hover" style={{animationDelay:`${i*0.05}s`}}>
              <div style={{fontSize:'2rem',marginBottom:16}}>{s.icon}</div>
              <h3 style={{fontFamily:'Syne,sans-serif',fontWeight:700,color:'#fff',fontSize:'1rem',marginBottom:8}}>{s.title}</h3>
              <p style={{fontFamily:'DM Sans,sans-serif',color:'rgba(255,255,255,0.45)',fontSize:'0.875rem',lineHeight:1.6,margin:0}}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const steps = [
  {num:'01',title:'Pago',desc:'Confirmas tu inversión y accedes al sistema.'},
  {num:'02',title:'Onboarding',desc:'Completamos tu perfil empresarial completo.'},
  {num:'03',title:'Diseño',desc:'Creamos la identidad visual de tu proyecto.'},
  {num:'04',title:'Desarrollo',desc:'Construimos tu solución digital.'},
  {num:'05',title:'Lanzamiento',desc:'Publicamos y activamos tu sistema.'},
  {num:'06',title:'Escalamiento',desc:'Optimizamos y hacemos crecer los resultados.'},
];

function Process() {
  return (
    <section id="proceso" style={{padding:'100px 24px',background:'rgba(255,255,255,0.01)'}}>
      <div style={{maxWidth:1280,margin:'0 auto'}}>
        <div style={{textAlign:'center',marginBottom:64}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(37,99,235,0.1)',border:'1px solid rgba(37,99,235,0.2)',borderRadius:9999,padding:'6px 16px',marginBottom:20}}>
            <span style={{fontFamily:'DM Sans,sans-serif',fontSize:'0.75rem',color:'#60A5FA',letterSpacing:'0.1em',textTransform:'uppercase'}}>Cómo trabajamos</span>
          </div>
          <h2 style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'clamp(2rem,4vw,3rem)',color:'#fff',letterSpacing:'-0.02em'}}>
            Proceso simple.<br/>Resultados extraordinarios.
          </h2>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:16}}>
          {steps.map(step=>(
            <div key={step.num} className="card glass-hover" style={{textAlign:'center',position:'relative'}}>
              <div style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'2.5rem',background:'linear-gradient(135deg,#60A5FA,#22C55E)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',marginBottom:12}}>{step.num}</div>
              <h3 style={{fontFamily:'Syne,sans-serif',fontWeight:700,color:'#fff',fontSize:'0.95rem',marginBottom:8}}>{step.title}</h3>
              <p style={{fontFamily:'DM Sans,sans-serif',color:'rgba(255,255,255,0.4)',fontSize:'0.8rem',lineHeight:1.6,margin:0}}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const cases = [
  {empresa:"Barbershop Walla's",tipo:'Desarrollo Web + PWA',resultado:'+340% reservas online',tag:'Barbería'},
  {empresa:'Clínica Dental Plus',tipo:'SEO + Google Ads',resultado:'+250% pacientes nuevos',tag:'Salud'},
  {empresa:'Tienda ModaVip',tipo:'E-commerce + Meta Ads',resultado:'+180% ventas mensuales',tag:'Retail'},
];

function Cases() {
  return (
    <section id="casos-de-exito" style={{padding:'100px 24px'}}>
      <div style={{maxWidth:1280,margin:'0 auto'}}>
        <div style={{textAlign:'center',marginBottom:64}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(168,85,247,0.1)',border:'1px solid rgba(168,85,247,0.2)',borderRadius:9999,padding:'6px 16px',marginBottom:20}}>
            <span style={{fontFamily:'DM Sans,sans-serif',fontSize:'0.75rem',color:'#C084FC',letterSpacing:'0.1em',textTransform:'uppercase'}}>Resultados reales</span>
          </div>
          <h2 style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'clamp(2rem,4vw,3rem)',color:'#fff',letterSpacing:'-0.02em'}}>
            Negocios que ya<br/>están creciendo
          </h2>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:24}}>
          {cases.map(c=>(
            <div key={c.empresa} className="card glass-hover" style={{position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:'linear-gradient(90deg,transparent,rgba(34,197,94,0.5),transparent)'}}/>
              <span className="badge-green" style={{display:'inline-flex',marginBottom:16,fontSize:'0.75rem'}}>{c.tag}</span>
              <h3 style={{fontFamily:'Syne,sans-serif',fontWeight:700,color:'#fff',fontSize:'1.2rem',marginBottom:8}}>{c.empresa}</h3>
              <p style={{fontFamily:'DM Sans,sans-serif',color:'rgba(255,255,255,0.4)',fontSize:'0.875rem',marginBottom:16}}>{c.tipo}</p>
              <div style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'1.75rem',background:'linear-gradient(135deg,#60A5FA,#22C55E)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>{c.resultado}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const faqs = [
  {q:'¿Cuánto tiempo tarda en desarrollarse mi proyecto?',a:'Depende del alcance. Un sitio web premium tarda 2-3 semanas. Una PWA completa entre 4-8 semanas.'},
  {q:'¿Cómo puedo ver el avance de mi proyecto?',a:'Tendrás acceso a tu panel personalizado donde verás el progreso en tiempo real y podrás comunicarte con tu equipo.'},
  {q:'¿Trabajan con clientes de cualquier país?',a:'Sí, operamos 100% digital con clientes de toda Latinoamérica, España y Estados Unidos.'},
  {q:'¿Qué incluye el sistema de crecimiento?',a:'Web, automatizaciones, campañas, métricas y soporte continuo. Un sistema completo que convierte de forma medible.'},
  {q:'¿Hay precios fijos?',a:'Cada proyecto es a medida. Analizamos tu negocio y enviamos una propuesta personalizada.'},
];

function FAQ() {
  const [open,setOpen]=useState<number|null>(null);
  return (
    <section id="faq" style={{padding:'100px 24px',background:'rgba(255,255,255,0.01)'}}>
      <div style={{maxWidth:720,margin:'0 auto'}}>
        <div style={{textAlign:'center',marginBottom:64}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(234,179,8,0.1)',border:'1px solid rgba(234,179,8,0.2)',borderRadius:9999,padding:'6px 16px',marginBottom:20}}>
            <span style={{fontFamily:'DM Sans,sans-serif',fontSize:'0.75rem',color:'#FDE047',letterSpacing:'0.1em',textTransform:'uppercase'}}>Preguntas frecuentes</span>
          </div>
          <h2 style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'clamp(2rem,4vw,3rem)',color:'#fff',letterSpacing:'-0.02em'}}>Todo lo que necesitas saber</h2>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {faqs.map((faq,i)=>(
            <div key={i} className="card" style={{cursor:'pointer',borderColor:open===i?'rgba(37,99,235,0.4)':'rgba(255,255,255,0.08)',transition:'border-color 0.2s'}} onClick={()=>setOpen(open===i?null:i)}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:16}}>
                <h3 style={{fontFamily:'Syne,sans-serif',fontWeight:600,color:'#fff',fontSize:'0.95rem',margin:0}}>{faq.q}</h3>
                <span style={{flexShrink:0,width:24,height:24,borderRadius:'50%',border:'1px solid rgba(255,255,255,0.15)',display:'flex',alignItems:'center',justifyContent:'center',color:'rgba(255,255,255,0.5)',fontSize:'1.1rem',transition:'transform 0.2s,background 0.2s',transform:open===i?'rotate(45deg)':'none',background:open===i?'#22C55E':'transparent'}}>+</span>
              </div>
              {open===i&&<p style={{fontFamily:'DM Sans,sans-serif',color:'rgba(255,255,255,0.5)',fontSize:'0.875rem',marginTop:16,paddingTop:16,borderTop:'1px solid rgba(255,255,255,0.05)',lineHeight:1.7,margin:'16px 0 0'}}>{faq.a}</p>}
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
    <section id="contacto" style={{padding:'100px 24px'}}>
      <div style={{maxWidth:560,margin:'0 auto',textAlign:'center'}}>
        <div className="card glow-green" style={{padding:48}}>
          <div style={{fontSize:'3rem',marginBottom:16}}>🎉</div>
          <h3 style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'1.5rem',background:'linear-gradient(135deg,#60A5FA,#22C55E)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',marginBottom:12}}>¡Mensaje recibido!</h3>
          <p style={{fontFamily:'DM Sans,sans-serif',color:'rgba(255,255,255,0.5)'}}>Te contactaremos en menos de 24 horas.</p>
        </div>
      </div>
    </section>
  );
  return (
    <section id="contacto" style={{padding:'100px 24px',position:'relative',overflow:'hidden'}}>
      <div className="bg-gradient-radial-green" style={{position:'absolute',inset:0}}/>
      <div style={{maxWidth:640,margin:'0 auto',position:'relative',zIndex:1}}>
        <div style={{textAlign:'center',marginBottom:48}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(34,197,94,0.1)',border:'1px solid rgba(34,197,94,0.2)',borderRadius:9999,padding:'6px 16px',marginBottom:20}}>
            <span style={{fontFamily:'DM Sans,sans-serif',fontSize:'0.75rem',color:'#22C55E',letterSpacing:'0.1em',textTransform:'uppercase'}}>Comenzar ahora</span>
          </div>
          <h2 style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'clamp(2rem,4vw,3rem)',color:'#fff',letterSpacing:'-0.02em',marginBottom:12}}>Solicita tu propuesta<br/>personalizada</h2>
          <p style={{fontFamily:'DM Sans,sans-serif',color:'rgba(255,255,255,0.5)'}}>Sin compromisos. Analizamos tu negocio y te enviamos una estrategia clara.</p>
        </div>
        <form onSubmit={handleSubmit} className="card" style={{display:'flex',flexDirection:'column',gap:16}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
            <div><label style={{display:'block',fontFamily:'DM Sans,sans-serif',fontSize:'0.75rem',color:'rgba(255,255,255,0.4)',marginBottom:8,textTransform:'uppercase',letterSpacing:'0.05em'}}>Nombre *</label><input required className="input-field" placeholder="Tu nombre completo" value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})}/></div>
            <div><label style={{display:'block',fontFamily:'DM Sans,sans-serif',fontSize:'0.75rem',color:'rgba(255,255,255,0.4)',marginBottom:8,textTransform:'uppercase',letterSpacing:'0.05em'}}>Email *</label><input required type="email" className="input-field" placeholder="tu@email.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
            <div><label style={{display:'block',fontFamily:'DM Sans,sans-serif',fontSize:'0.75rem',color:'rgba(255,255,255,0.4)',marginBottom:8,textTransform:'uppercase',letterSpacing:'0.05em'}}>WhatsApp</label><input className="input-field" placeholder="+58 412 000 0000" value={form.whatsapp} onChange={e=>setForm({...form,whatsapp:e.target.value})}/></div>
            <div><label style={{display:'block',fontFamily:'DM Sans,sans-serif',fontSize:'0.75rem',color:'rgba(255,255,255,0.4)',marginBottom:8,textTransform:'uppercase',letterSpacing:'0.05em'}}>Empresa</label><input className="input-field" placeholder="Nombre de tu empresa" value={form.empresa} onChange={e=>setForm({...form,empresa:e.target.value})}/></div>
          </div>
          <div><label style={{display:'block',fontFamily:'DM Sans,sans-serif',fontSize:'0.75rem',color:'rgba(255,255,255,0.4)',marginBottom:8,textTransform:'uppercase',letterSpacing:'0.05em'}}>Servicio de interés</label>
            <select className="input-field" value={form.servicio} onChange={e=>setForm({...form,servicio:e.target.value})}>
              <option value="">Selecciona un servicio</option>
              {services.map(s=><option key={s.title} value={s.title}>{s.title}</option>)}
              <option value="Sistema completo">Sistema de crecimiento completo</option>
            </select>
          </div>
          <div><label style={{display:'block',fontFamily:'DM Sans,sans-serif',fontSize:'0.75rem',color:'rgba(255,255,255,0.4)',marginBottom:8,textTransform:'uppercase',letterSpacing:'0.05em'}}>Cuéntanos sobre tu negocio</label><textarea rows={4} className="input-field" style={{resize:'none'}} placeholder="¿Qué hace tu empresa? ¿Cuál es tu mayor reto?" value={form.mensaje} onChange={e=>setForm({...form,mensaje:e.target.value})}/></div>
          <button type="submit" disabled={sending} className="btn-primary glow-green-sm" style={{width:'100%',justifyContent:'center',padding:'14px',fontSize:'1rem',opacity:sending?0.7:1}}>
            {sending?'Enviando...':'Enviar solicitud →'}
          </button>
          <p style={{textAlign:'center',fontFamily:'DM Sans,sans-serif',fontSize:'0.75rem',color:'rgba(255,255,255,0.3)',margin:0}}>Respuesta garantizada en menos de 24 horas</p>
        </form>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{borderTop:'1px solid rgba(255,255,255,0.05)',padding:'48px 24px',background:'rgba(255,255,255,0.01)'}}>
      <div style={{maxWidth:1280,margin:'0 auto',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:24}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:28,height:28,borderRadius:8,background:'linear-gradient(135deg,#1A3A8F,#2563EB)',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <span style={{color:'#fff',fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:14}}>C</span>
          </div>
          <span style={{fontFamily:'Syne,sans-serif',fontWeight:700,color:'#fff',fontSize:'1.1rem'}}>Crece<span style={{color:'#22C55E'}}>Con</span></span>
        </div>
        <p style={{fontFamily:'DM Sans,sans-serif',color:'rgba(255,255,255,0.3)',fontSize:'0.875rem',textAlign:'center',margin:0}}>
          Más crecimiento, más clientes. Más ventas — CRECECON nosotros
        </p>
        <div style={{display:'flex',gap:20}}>
          {['Instagram','Facebook','TikTok'].map(red=>(
            <a key={red} href={`https://${red.toLowerCase()}.com/crececon`} target="_blank" rel="noopener noreferrer" style={{fontFamily:'DM Sans,sans-serif',fontSize:'0.875rem',color:'rgba(255,255,255,0.3)',textDecoration:'none',transition:'color 0.2s'}}
              onMouseEnter={e=>(e.target as HTMLAnchorElement).style.color='#22C55E'} onMouseLeave={e=>(e.target as HTMLAnchorElement).style.color='rgba(255,255,255,0.3)'}>{red}</a>
          ))}
        </div>
      </div>
      <div style={{maxWidth:1280,margin:'32px auto 0',paddingTop:24,borderTop:'1px solid rgba(255,255,255,0.04)',textAlign:'center'}}>
        <p style={{fontFamily:'DM Sans,sans-serif',color:'rgba(255,255,255,0.2)',fontSize:'0.75rem',margin:0}}>© {new Date().getFullYear()} CreceCon. Todos los derechos reservados.</p>
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
