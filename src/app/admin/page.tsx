'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import SidebarNav from '@/components/SidebarNav';

const NAV_LINKS = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/clientes', label: 'Clientes', icon: '👥' },
  { href: '/admin/proyectos', label: 'Proyectos', icon: '📁' },
  { href: '/admin/leads', label: 'CRM Leads', icon: '🎯' },
  { href: '/admin/cursos', label: 'Cursos LMS', icon: '🎓' },
  { href: '/admin/tickets', label: 'Soporte', icon: '🎧' },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState([
    { label:'Clientes activos', value:'—', color:'#22C55E', icon:'👥', sub:'Total registrados' },
    { label:'Leads nuevos', value:'—', color:'#2563EB', icon:'📊', sub:'Últimos registros' },
    { label:'Proyectos activos', value:'—', color:'#F59E0B', icon:'📁', sub:'En curso' },
    { label:'Setters', value:'—', color:'#8B5CF6', icon:'⚡', sub:'Equipo de ventas' },
  ]);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    if (user.rol !== 'admin') { router.push('/login'); return; }
    const load = async () => {
      try {
        const [usuariosSnap, leadsSnap, proyectosSnap] = await Promise.all([
          getDocs(collection(db,'usuarios')),
          getDocs(query(collection(db,'leads'),orderBy('createdAt','desc'),limit(6))),
          getDocs(collection(db,'proyectos')),
        ]);
        const usuarios = usuariosSnap.docs.map(d=>d.data());
        const clientes = usuarios.filter((u:any)=>u.rol==='cliente').length;
        const setters = usuarios.filter((u:any)=>u.rol==='setter').length;
        setStats([
          { label:'Clientes activos', value:String(clientes), color:'#22C55E', icon:'👥', sub:'Total registrados' },
          { label:'Leads nuevos', value:String(leadsSnap.size), color:'#2563EB', icon:'📊', sub:'Últimos registros' },
          { label:'Proyectos activos', value:String(proyectosSnap.size), color:'#F59E0B', icon:'📁', sub:'En curso' },
          { label:'Setters', value:String(setters), color:'#8B5CF6', icon:'⚡', sub:'Equipo de ventas' },
        ]);
        setLeads(leadsSnap.docs.map(d=>({id:d.id,...d.data()})));
      } catch(e){ console.error(e); }
      setLoading(false);
    };
    load();
  }, [user]);

  return (
    <div style={{display:'flex',minHeight:'100vh',background:'#050814'}}>
      <SidebarNav links={NAV_LINKS} active="Dashboard" />

      <main style={{marginLeft:240,flex:1,padding:'32px',minHeight:'100vh'}}>

        {/* CSS responsivo para el main */}
        <style>{`
          @media (max-width: 768px) {
            .admin-main { margin-left: 0 !important; padding: 80px 16px 24px !important; }
            .admin-stats { grid-template-columns: 1fr 1fr !important; }
            .admin-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>

        <div className="admin-main" style={{marginLeft:0}}>
          <div style={{marginBottom:32}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12}}>
              <div>
                <h1 style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'1.6rem',color:'#fff',margin:0,letterSpacing:'-0.02em'}}>Panel de Control</h1>
                <p style={{fontFamily:'DM Sans,sans-serif',color:'rgba(255,255,255,0.38)',fontSize:'0.875rem',margin:'4px 0 0'}}>Vista general de CreceCon en tiempo real</p>
              </div>
              <span style={{display:'inline-flex',alignItems:'center',gap:6,background:'rgba(34,197,94,0.1)',border:'1px solid rgba(34,197,94,0.2)',borderRadius:9999,padding:'5px 12px',fontFamily:'DM Sans,sans-serif',fontSize:'0.72rem',color:'#4ADE80'}}>
                <span style={{width:6,height:6,borderRadius:'50%',background:'#22C55E',display:'inline-block'}}/>
                Sistema activo
              </span>
            </div>
          </div>

          <div className="admin-stats" style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:16,marginBottom:32}}>
            {stats.map(stat=>(
              <div key={stat.label} style={{background:'rgba(13,20,38,0.7)',backdropFilter:'blur(20px)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:16,padding:'20px',position:'relative',overflow:'hidden'}}>
                <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${stat.color}50,transparent)`}}/>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
                  <span style={{fontSize:'1.4rem'}}>{stat.icon}</span>
                  <span style={{fontFamily:'DM Sans,sans-serif',fontSize:'0.7rem',color:'rgba(255,255,255,0.3)',textTransform:'uppercase',letterSpacing:'0.05em'}}>{stat.sub}</span>
                </div>
                <div style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'2rem',color:stat.color,lineHeight:1,marginBottom:6}}>{loading?'—':stat.value}</div>
                <div style={{fontFamily:'DM Sans,sans-serif',fontSize:'0.82rem',color:'rgba(255,255,255,0.5)'}}>{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="admin-grid" style={{display:'grid',gridTemplateColumns:'1fr 300px',gap:20}}>
            <div style={{background:'rgba(13,20,38,0.7)',backdropFilter:'blur(20px)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:16,padding:'24px'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
                <h2 style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'1rem',color:'#fff',margin:0}}>Leads recientes</h2>
                <Link href="/admin/leads" style={{fontFamily:'DM Sans,sans-serif',fontSize:'0.8rem',color:'#22C55E',textDecoration:'none'}}>Ver todos →</Link>
              </div>
              {loading?(
                <div style={{display:'flex',flexDirection:'column',gap:10}}>
                  {[1,2,3].map(i=><div key={i} style={{height:48,borderRadius:10,background:'rgba(255,255,255,0.04)'}}/>)}
                </div>
              ):leads.length===0?(
                <div style={{textAlign:'center',padding:'40px 0'}}>
                  <div style={{fontSize:'2rem',marginBottom:8}}>📭</div>
                  <p style={{fontFamily:'DM Sans,sans-serif',color:'rgba(255,255,255,0.28)',fontSize:'0.875rem',margin:0}}>Aún no hay leads registrados</p>
                </div>
              ):(
                <div style={{display:'flex',flexDirection:'column',gap:8}}>
                  {leads.map((lead:any)=>(
                    <div key={lead.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 14px',borderRadius:10,background:'rgba(255,255,255,0.025)',border:'1px solid rgba(255,255,255,0.05)'}}>
                      <div style={{display:'flex',alignItems:'center',gap:10}}>
                        <div style={{width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,#1A3A8F,#22C55E)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                          <span style={{color:'#fff',fontSize:12,fontWeight:700}}>{lead.nombre?.charAt(0)?.toUpperCase()||'?'}</span>
                        </div>
                        <div>
                          <div style={{fontFamily:'DM Sans,sans-serif',fontWeight:600,color:'#fff',fontSize:'0.875rem'}}>{lead.nombre||'Sin nombre'}</div>
                          <div style={{fontFamily:'DM Sans,sans-serif',color:'rgba(255,255,255,0.35)',fontSize:'0.75rem'}}>{lead.email||''}</div>
                        </div>
                      </div>
                      <span style={{display:'inline-flex',alignItems:'center',padding:'3px 10px',borderRadius:9999,fontSize:'0.7rem',fontWeight:600,background:lead.estado==='nuevo'?'rgba(34,197,94,0.12)':'rgba(37,99,235,0.12)',color:lead.estado==='nuevo'?'#4ADE80':'#60A5FA',border:`1px solid ${lead.estado==='nuevo'?'rgba(34,197,94,0.25)':'rgba(37,99,235,0.25)'}`}}>
                        {lead.estado||'nuevo'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{display:'flex',flexDirection:'column',gap:16}}>
              <div style={{background:'rgba(13,20,38,0.7)',backdropFilter:'blur(20px)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:16,padding:'20px'}}>
                <h2 style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'0.95rem',color:'#fff',margin:'0 0 14px'}}>Acciones rápidas</h2>
                <div style={{display:'flex',flexDirection:'column',gap:8}}>
                  {[
                    {label:'Nuevo cliente',href:'/admin/clientes',icon:'👤'},
                    {label:'Nuevo proyecto',href:'/admin/proyectos',icon:'📁'},
                    {label:'Nuevo curso',href:'/admin/cursos',icon:'🎓'},
                    {label:'Ver tickets',href:'/admin/tickets',icon:'🎫'},
                  ].map(a=>(
                    <Link key={a.label} href={a.href} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',borderRadius:10,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)',color:'rgba(255,255,255,0.6)',fontFamily:'DM Sans,sans-serif',fontSize:'0.85rem',fontWeight:500,textDecoration:'none'}}>
                      <span>{a.icon}</span>{a.label}<span style={{marginLeft:'auto',color:'rgba(255,255,255,0.25)'}}>→</span>
                    </Link>
                  ))}
                </div>
              </div>
              <div style={{background:'rgba(13,20,38,0.7)',backdropFilter:'blur(20px)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:16,padding:'20px'}}>
                <h2 style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'0.95rem',color:'#fff',margin:'0 0 14px'}}>Estado del sistema</h2>
                {[
                  {label:'Firebase',ok:true},
                  {label:'Cloudflare CDN',ok:true},
                  {label:'Cloudinary',ok:true},
                ].map(s=>(
                  <div key={s.label} style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
                    <span style={{fontFamily:'DM Sans,sans-serif',fontSize:'0.82rem',color:'rgba(255,255,255,0.5)'}}>{s.label}</span>
                    <span style={{display:'inline-flex',alignItems:'center',gap:5,fontFamily:'DM Sans,sans-serif',fontSize:'0.72rem',color:'#4ADE80'}}>
                      <span style={{width:5,height:5,borderRadius:'50%',background:'#22C55E',display:'inline-block'}}/>Operativo
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @media (max-width: 768px) {
          main { margin-left: 0 !important; padding: 80px 16px 32px !important; }
          .admin-stats { grid-template-columns: 1fr 1fr !important; }
          .admin-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}