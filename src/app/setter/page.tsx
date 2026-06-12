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
    { href: '/setter', label: 'Dashboard', icon: '⊞' },
    { href: '/setter/cursos', label: 'Cursos LMS', icon: '🎓' },
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
            <div style={{fontFamily:'DM Sans,sans-serif',fontSize:10,color:'rgba(255,255,255,0.3)',marginTop:2}}>Setter Panel</div>
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

interface SetterData {
  nombre?: string;
  puntos?: number;
  nivel?: number;
  leadsConvertidos?: number;
  comisionMes?: number;
  ranking?: number;
}

export default function SetterDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<SetterData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    if (user.rol !== 'setter') { router.push('/login'); return; }
    const load = async () => {
      try {
        const snap = await getDoc(doc(db,'usuarios',user.uid));
        if (snap.exists()) setData(snap.data() as SetterData);
      } catch(e){ console.error(e); }
      setLoading(false);
    };
    load();
  }, [user]);

  const puntos = data.puntos || 0;
  const nivel = data.nivel || 1;
  const puntosParaSiguienteNivel = nivel * 500;
  const progreso = Math.min(100, (puntos / puntosParaSiguienteNivel) * 100);

  const niveles = [
    { nivel:1, nombre:'Iniciado', icon:'🌱', minPuntos:0 },
    { nivel:2, nombre:'Explorador', icon:'⚡', minPuntos:500 },
    { nivel:3, nombre:'Estratega', icon:'🎯', minPuntos:1000 },
    { nivel:4, nombre:'Experto', icon:'🔥', minPuntos:1500 },
    { nivel:5, nombre:'Maestro', icon:'👑', minPuntos:2000 },
  ];

  return (
    <div style={{display:'flex',minHeight:'100vh',background:'#050814'}}>
      <Sidebar active="/setter"/>
      <main style={{marginLeft:240,flex:1,padding:'32px',minHeight:'100vh'}}>
        <div style={{marginBottom:32}}>
          <h1 style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'1.6rem',color:'#fff',margin:0,letterSpacing:'-0.02em'}}>
            ¡Hola, {data.nombre?.split(' ')[0]||'Setter'}! 👋
          </h1>
          <p style={{fontFamily:'DM Sans,sans-serif',color:'rgba(255,255,255,0.38)',fontSize:'0.875rem',margin:'4px 0 0'}}>Tu progreso y resultados de hoy</p>
        </div>

        {/* Gamification card */}
        <div style={{background:'linear-gradient(135deg,rgba(26,58,143,0.15),rgba(34,197,94,0.08))',border:'1px solid rgba(96,165,250,0.2)',borderRadius:20,padding:'28px',marginBottom:24,position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',top:-40,right:-40,width:160,height:160,borderRadius:'50%',background:'radial-gradient(circle,rgba(34,197,94,0.15) 0%,transparent 70%)'}}/>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:20,position:'relative'}}>
            <div style={{display:'flex',alignItems:'center',gap:16}}>
              <div style={{width:64,height:64,borderRadius:18,background:'linear-gradient(135deg,#1A3A8F,#22C55E)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'2rem',boxShadow:'0 8px 32px rgba(34,197,94,0.3)'}}>
                {niveles[nivel-1]?.icon||'🌱'}
              </div>
              <div>
                <div style={{fontFamily:'DM Sans,sans-serif',fontSize:'0.75rem',color:'rgba(255,255,255,0.4)',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:4}}>Nivel {nivel}</div>
                <div style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'1.5rem',color:'#fff'}}>{niveles[nivel-1]?.nombre||'Iniciado'}</div>
              </div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'2.2rem',background:'linear-gradient(135deg,#60A5FA,#22C55E)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',lineHeight:1}}>{loading?'—':puntos}</div>
              <div style={{fontFamily:'DM Sans,sans-serif',fontSize:'0.75rem',color:'rgba(255,255,255,0.4)'}}>puntos totales</div>
            </div>
          </div>
          <div style={{marginTop:24}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
              <span style={{fontFamily:'DM Sans,sans-serif',fontSize:'0.78rem',color:'rgba(255,255,255,0.45)'}}>Progreso al nivel {nivel+1}</span>
              <span style={{fontFamily:'DM Sans,sans-serif',fontSize:'0.78rem',color:'rgba(255,255,255,0.45)'}}>{puntos} / {puntosParaSiguienteNivel}</span>
            </div>
            <div style={{width:'100%',height:8,background:'rgba(255,255,255,0.06)',borderRadius:9999,overflow:'hidden'}}>
              <div style={{height:'100%',width:`${progreso}%`,background:'linear-gradient(90deg,#1A3A8F,#22C55E)',borderRadius:9999,transition:'width 1s cubic-bezier(0.34,1.56,0.64,1)'}}/>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:16,marginBottom:32}}>
          {[
            {label:'Leads convertidos',value:data.leadsConvertidos||0,icon:'🎯',color:'#22C55E'},
            {label:'Comisión del mes',value:`$${data.comisionMes||0}`,icon:'💰',color:'#F59E0B'},
            {label:'Ranking general',value:`#${data.ranking||'—'}`,icon:'🏆',color:'#8B5CF6'},
          ].map(stat=>(
            <div key={stat.label} style={{background:'rgba(13,20,38,0.7)',backdropFilter:'blur(20px)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:16,padding:'20px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
                <span style={{fontSize:'1.4rem'}}>{stat.icon}</span>
              </div>
              <div style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'1.8rem',color:stat.color,lineHeight:1,marginBottom:6}}>{loading?'—':stat.value}</div>
              <div style={{fontFamily:'DM Sans,sans-serif',fontSize:'0.82rem',color:'rgba(255,255,255,0.5)'}}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Niveles roadmap */}
        <div style={{background:'rgba(13,20,38,0.7)',backdropFilter:'blur(20px)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:16,padding:'24px',marginBottom:24}}>
          <h2 style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'1rem',color:'#fff',margin:'0 0 20px'}}>Ruta de niveles</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))',gap:12}}>
            {niveles.map(n=>{
              const alcanzado = nivel >= n.nivel;
              const actual = nivel === n.nivel;
              return (
                <div key={n.nivel} style={{textAlign:'center',padding:'16px 12px',borderRadius:12,background:actual?'rgba(34,197,94,0.1)':'rgba(255,255,255,0.02)',border:actual?'1px solid rgba(34,197,94,0.3)':'1px solid rgba(255,255,255,0.05)',opacity:alcanzado?1:0.4}}>
                  <div style={{fontSize:'1.8rem',marginBottom:6}}>{n.icon}</div>
                  <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,color:'#fff',fontSize:'0.85rem'}}>{n.nombre}</div>
                  <div style={{fontFamily:'DM Sans,sans-serif',color:'rgba(255,255,255,0.35)',fontSize:'0.7rem',marginTop:2}}>Nivel {n.nivel}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA cursos */}
        <Link href="/setter/cursos" style={{display:'block',background:'linear-gradient(135deg,rgba(37,99,235,0.12),rgba(34,197,94,0.08))',border:'1px solid rgba(96,165,250,0.2)',borderRadius:16,padding:'24px',textDecoration:'none',transition:'border-color 0.2s'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:16}}>
            <div style={{display:'flex',alignItems:'center',gap:16}}>
              <div style={{fontSize:'2.2rem'}}>🎓</div>
              <div>
                <h3 style={{fontFamily:'Syne,sans-serif',fontWeight:700,color:'#fff',fontSize:'1rem',margin:0}}>Continúa tu capacitación</h3>
                <p style={{fontFamily:'DM Sans,sans-serif',color:'rgba(255,255,255,0.45)',fontSize:'0.82rem',margin:'4px 0 0'}}>Desbloquea más cursos subiendo de nivel</p>
              </div>
            </div>
            <span style={{color:'#22C55E',fontFamily:'DM Sans,sans-serif',fontSize:'0.9rem',fontWeight:600}}>Ver cursos →</span>
          </div>
        </Link>
      </main>
    </div>
  );
}
