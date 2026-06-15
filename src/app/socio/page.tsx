'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import SidebarNav from '@/components/SidebarNav';

const NAV_LINKS = [
  { href: '/socio', label: 'Dashboard', icon: '📊' },
];

interface SocioData {
  nombre?: string;
  porcentajeParticipacion?: number;
  ingresosTotales?: number;
  ingresosMes?: number;
  clientesReferidos?: number;
}

export default function SocioDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<SocioData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    if (user.rol !== 'socio') { router.push('/login'); return; }
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, 'usuarios', user.uid));
        if (snap.exists()) setData(snap.data() as SocioData);
      } catch(e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, [user]);

  return (
    <div style={{display:'flex',minHeight:'100vh',background:'#050814'}}>
      <style>{`
        @media (max-width: 768px) {
          .panel-main { margin-left: 0 !important; padding: 80px 16px 32px !important; }
        }
      `}</style>

      <SidebarNav links={NAV_LINKS} active="Dashboard" />

      <main className="panel-main" style={{marginLeft:240,flex:1,padding:'32px',minHeight:'100vh'}}>

        <div style={{marginBottom:32}}>
          <h1 style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'1.6rem',color:'#fff',margin:0,letterSpacing:'-0.02em'}}>
            Bienvenido, {data.nombre?.split(' ')[0]||'Socio'} 🤝
          </h1>
          <p style={{fontFamily:'DM Sans,sans-serif',color:'rgba(255,255,255,0.38)',fontSize:'0.875rem',margin:'4px 0 0'}}>
            Resumen de tu participación en CreceCon
          </p>
        </div>

        <div style={{background:'linear-gradient(135deg,rgba(139,92,246,0.15),rgba(34,197,94,0.08))',border:'1px solid rgba(168,85,247,0.2)',borderRadius:20,padding:'32px',marginBottom:24,position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',top:-60,right:-60,width:200,height:200,borderRadius:'50%',background:'radial-gradient(circle,rgba(168,85,247,0.15) 0%,transparent 70%)'}}/>
          <div style={{position:'relative',textAlign:'center'}}>
            <div style={{fontFamily:'DM Sans,sans-serif',fontSize:'0.78rem',color:'rgba(255,255,255,0.4)',textTransform:'uppercase',letterSpacing:'0.12em',marginBottom:8}}>Tu participación</div>
            <div style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'4rem',background:'linear-gradient(135deg,#C084FC,#22C55E)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',lineHeight:1}}>
              {loading ? '—' : `${data.porcentajeParticipacion||0}%`}
            </div>
            <div style={{fontFamily:'DM Sans,sans-serif',fontSize:'0.85rem',color:'rgba(255,255,255,0.45)',marginTop:8}}>del negocio CreceCon</div>
          </div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:16,marginBottom:24}}>
          {[
            {label:'Ingresos totales',value:`$${(data.ingresosTotales||0).toLocaleString()}`,icon:'💼',color:'#22C55E'},
            {label:'Ingresos este mes',value:`$${(data.ingresosMes||0).toLocaleString()}`,icon:'📈',color:'#60A5FA'},
            {label:'Clientes referidos',value:data.clientesReferidos||0,icon:'🤝',color:'#C084FC'},
          ].map(stat=>(
            <div key={stat.label} style={{background:'rgba(13,20,38,0.7)',backdropFilter:'blur(20px)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:16,padding:'24px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:14}}>
                <span style={{fontSize:'1.6rem'}}>{stat.icon}</span>
              </div>
              <div style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'1.9rem',color:stat.color,lineHeight:1,marginBottom:6}}>
                {loading ? '—' : stat.value}
              </div>
              <div style={{fontFamily:'DM Sans,sans-serif',fontSize:'0.85rem',color:'rgba(255,255,255,0.5)'}}>{stat.label}</div>
            </div>
          ))}
        </div>

        <div style={{background:'rgba(13,20,38,0.7)',backdropFilter:'blur(20px)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:16,padding:'28px'}}>
          <h2 style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'1rem',color:'#fff',margin:'0 0 16px'}}>Sobre tu participación</h2>
          <p style={{fontFamily:'DM Sans,sans-serif',color:'rgba(255,255,255,0.45)',fontSize:'0.9rem',lineHeight:1.8,margin:0}}>
            Como socio de CreceCon, tu participación se actualiza mensualmente con base en los ingresos generados por la plataforma.
            Los datos mostrados se sincronizan en tiempo real desde nuestro sistema financiero. Para más detalles o reportes específicos,
            contacta directamente al administrador a través de WhatsApp.
          </p>
          <a href="https://wa.me/584128021091" target="_blank" rel="noopener noreferrer" className="btn-primary glow-green-sm" style={{display:'inline-flex',marginTop:20,padding:'12px 24px',fontSize:'0.9rem'}}>💬 Contactar administración</a>
        </div>

      </main>
    </div>
  );
}