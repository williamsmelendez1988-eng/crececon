'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

function Sidebar({ active }: { active: string }) {
  const { logout } = useAuth();
  const router = useRouter();
  const nav = [
    { href: '/cliente', label: 'Dashboard', icon: '⊞' },
    { href: '/cliente/onboarding', label: 'Onboarding', icon: '🚀' },
    { href: '/cliente/soporte', label: 'Soporte', icon: '💬' },
  ];
  return (
    <aside style={{width:240,minHeight:'100vh',background:'rgba(5,8,20,0.98)',borderRight:'1px solid rgba(255,255,255,0.06)',display:'flex',flexDirection:'column',position:'fixed',top:0,left:0,zIndex:40}}>
      <div style={{padding:'20px 16px',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:32,height:32,borderRadius:10,background:'linear-gradient(135deg,#1A3A8F,#2563EB)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
            <span style={{color:'#fff',fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:16}}>C</span>
          </div>
          <div>
            <div style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:15,color:'#fff',lineHeight:1}}>Crece<span style={{color:'#22C55E'}}>Con</span></div>
            <div style={{fontFamily:'DM Sans,sans-serif',fontSize:10,color:'rgba(255,255,255,0.3)',marginTop:2}}>Panel Cliente</div>
          </div>
        </div>
      </div>
      <nav style={{padding:'12px 8px',flex:1}}>
        {nav.map(item=>(
          <Link key={item.href} href={item.href} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',borderRadius:8,marginBottom:2,color:active===item.href?'#60A5FA':'rgba(255,255,255,0.55)',background:active===item.href?'rgba(37,99,235,0.12)':'transparent',borderLeft:active===item.href?'2px solid #2563EB':'2px solid transparent',fontFamily:'DM Sans,sans-serif',fontSize:13,fontWeight:500,textDecoration:'none',transition:'all 0.15s'}}>
            <span style={{fontSize:15}}>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
      <div style={{padding:'12px 8px',borderTop:'1px solid rgba(255,255,255,0.06)'}}>
        <button onClick={()=>{logout();router.push('/login');}} style={{display:'flex',alignItems:'center',gap:8,width:'100%',padding:'9px 12px',borderRadius:8,background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.15)',color:'#F87171',fontFamily:'DM Sans,sans-serif',fontSize:12,fontWeight:500,cursor:'pointer'}}>
          <span>→</span> Cerrar sesión
        </button>
      </div>
    </aside>
  );
}

interface ClienteData {
  nombre?: string;
  empresa?: string;
  proyectoNombre?: string;
  progreso?: number;
  fase?: string;
  onboardingCompleto?: boolean;
}

const fases = ['Pago','Onboarding','Diseño','Desarrollo','Lanzamiento','Escalamiento'];

export default function ClienteDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<ClienteData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    if (user.rol !== 'cliente') { router.push('/login'); return; }
    const load = async () => {
      try {
        const snap = await getDoc(doc(db,'usuarios',user.uid));
        if (snap.exists()) setData(snap.data() as ClienteData);
      } catch(e){ console.error(e); }
      setLoading(false);
    };
    load();
  }, [user]);

  const progreso = data.progreso || 0;
  const faseActualIndex = fases.indexOf(data.fase||'Pago');

  return (
    <div style={{display:'flex',minHeight:'100vh',background:'#050814'}}>
      <Sidebar active="/cliente"/>
      <main style={{marginLeft:240,flex:1,padding:'32px',minHeight:'100vh'}}>
        <div style={{marginBottom:32}}>
          <h1 style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'1.6rem',color:'#fff',margin:0,letterSpacing:'-0.02em'}}>
            Hola, {data.nombre?.split(' ')[0]||'Cliente'} 👋
          </h1>
          <p style={{fontFamily:'DM Sans,sans-serif',color:'rgba(255,255,255,0.38)',fontSize:'0.875rem',margin:'4px 0 0'}}>
            {data.empresa?`Proyecto para ${data.empresa}`:'Tu proyecto con CreceCon'}
          </p>
        </div>

        {/* Onboarding banner */}
        {!loading && !data.onboardingCompleto && (
          <Link href="/cliente/onboarding" style={{display:'block',background:'linear-gradient(135deg,rgba(34,197,94,0.15),rgba(37,99,235,0.08))',border:'1px solid rgba(34,197,94,0.25)',borderRadius:16,padding:'20px 24px',marginBottom:24,textDecoration:'none'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
              <div style={{display:'flex',alignItems:'center',gap:14}}>
                <span style={{fontSize:'1.6rem'}}>🚀</span>
                <div>
                  <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,color:'#fff',fontSize:'0.95rem'}}>Completa tu onboarding</div>
                  <div style={{fontFamily:'DM Sans,sans-serif',color:'rgba(255,255,255,0.45)',fontSize:'0.8rem'}}>4 pasos rápidos para comenzar tu proyecto</div>
                </div>
              </div>
              <span style={{color:'#22C55E',fontFamily:'DM Sans,sans-serif',fontSize:'0.85rem',fontWeight:600}}>Comenzar →</span>
            </div>
          </Link>
        )}

        {/* Progreso del proyecto */}
        <div style={{background:'rgba(13,20,38,0.7)',backdropFilter:'blur(20px)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:16,padding:'28px',marginBottom:24}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24,flexWrap:'wrap',gap:8}}>
            <div>
              <h2 style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'1.1rem',color:'#fff',margin:0}}>{data.proyectoNombre||'Tu proyecto'}</h2>
              <p style={{fontFamily:'DM Sans,sans-serif',color:'rgba(255,255,255,0.4)',fontSize:'0.82rem',margin:'4px 0 0'}}>Fase actual: {data.fase||'Pago'}</p>
            </div>
            <div style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'2rem',background:'linear-gradient(135deg,#60A5FA,#22C55E)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>
              {loading?'—':`${progreso}%`}
            </div>
          </div>
          <div style={{width:'100%',height:8,background:'rgba(255,255,255,0.06)',borderRadius:9999,overflow:'hidden',marginBottom:24}}>
            <div style={{height:'100%',width:`${progreso}%`,background:'linear-gradient(90deg,#1A3A8F,#22C55E)',borderRadius:9999,transition:'width 1s cubic-bezier(0.34,1.56,0.64,1)'}}/>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(90px,1fr))',gap:8}}>
            {fases.map((fase,i)=>{
              const completado = i < faseActualIndex;
              const actual = i === faseActualIndex;
              return (
                <div key={fase} style={{textAlign:'center',padding:'12px 8px',borderRadius:10,background:actual?'rgba(34,197,94,0.1)':completado?'rgba(255,255,255,0.03)':'rgba(255,255,255,0.015)',border:actual?'1px solid rgba(34,197,94,0.3)':'1px solid rgba(255,255,255,0.05)'}}>
                  <div style={{fontSize:'1.2rem',marginBottom:4}}>{completado?'✅':actual?'🔵':'⚪'}</div>
                  <div style={{fontFamily:'DM Sans,sans-serif',fontSize:'0.7rem',color:actual?'#4ADE80':'rgba(255,255,255,0.4)',fontWeight:actual?600:400}}>{fase}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Acciones */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:16}}>
          <Link href="/cliente/soporte" style={{display:'block',background:'rgba(13,20,38,0.7)',backdropFilter:'blur(20px)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:16,padding:'24px',textDecoration:'none',transition:'border-color 0.2s'}}>
            <div style={{fontSize:'1.8rem',marginBottom:12}}>💬</div>
            <h3 style={{fontFamily:'Syne,sans-serif',fontWeight:700,color:'#fff',fontSize:'1rem',margin:'0 0 6px'}}>Soporte y tickets</h3>
            <p style={{fontFamily:'DM Sans,sans-serif',color:'rgba(255,255,255,0.42)',fontSize:'0.85rem',margin:0}}>Chatea con tu equipo y revisa tus tickets</p>
          </Link>
          <a href="https://wa.me/584128021091" target="_blank" rel="noopener noreferrer" style={{display:'block',background:'rgba(13,20,38,0.7)',backdropFilter:'blur(20px)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:16,padding:'24px',textDecoration:'none',transition:'border-color 0.2s'}}>
            <div style={{fontSize:'1.8rem',marginBottom:12}}>📱</div>
            <h3 style={{fontFamily:'Syne,sans-serif',fontWeight:700,color:'#fff',fontSize:'1rem',margin:'0 0 6px'}}>WhatsApp directo</h3>
            <p style={{fontFamily:'DM Sans,sans-serif',color:'rgba(255,255,255,0.42)',fontSize:'0.85rem',margin:0}}>Contacta a tu equipo de proyecto al instante</p>
          </a>
        </div>
      </main>
    </div>
  );
}
