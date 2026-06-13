'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, query, orderBy } from 'firebase/firestore';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

function Sidebar({ active }: { active: string }) {
  const { logout } = useAuth();
  const router = useRouter();
  const nav = [
    { href: '/admin', label: 'Dashboard', icon: '⊞' },
    { href: '/admin/clientes', label: 'Clientes', icon: '👥' },
    { href: '/admin/proyectos', label: 'Proyectos', icon: '📁' },
    { href: '/admin/leads', label: 'CRM Leads', icon: '📊' },
    { href: '/admin/cursos', label: 'Cursos LMS', icon: '🎓' },
    { href: '/admin/tickets', label: 'Soporte', icon: '💬' },
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
            <div style={{fontFamily:'DM Sans,sans-serif',fontSize:10,color:'rgba(255,255,255,0.3)',marginTop:2}}>Admin Panel</div>
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

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY||'',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN||'',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID||'',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET||'',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID||'',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID||'',
};

// ============ ETIQUETAS PARA MOSTRAR EL ONBOARDING ============
const SERVICIOS_LABELS: Record<string,string> = {
  web: 'Página web',
  app: 'Aplicación móvil',
  meta_ads: 'Campañas en Meta Ads',
  google_ads: 'Campañas en Google Ads',
  seo: 'SEO / Posicionamiento en Google',
  diseno: 'Diseño gráfico',
  video: 'Producción de video',
  redes_mensual: 'Gestión mensual de redes sociales',
};

// ============ MODAL DE ONBOARDING ============
function OnboardingModal({ usuario, onClose }: { usuario: any; onClose: () => void }) {
  const ob = usuario.onboarding;

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div style={{ marginBottom: 20 }}>
      <h4 style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:13, color:'#22C55E', textTransform:'uppercase', letterSpacing:0.5, marginBottom:10 }}>
        {title}
      </h4>
      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>{children}</div>
    </div>
  );

  const Field = ({ label, value }: { label: string; value: any }) => {
    if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) return null;
    const display = Array.isArray(value) ? value.join(', ') : (value === true ? 'Sí' : value === false ? '' : value);
    if (!display) return null;
    return (
      <div style={{ fontSize:13, color:'rgba(255,255,255,0.8)' }}>
        <span style={{ color:'rgba(255,255,255,0.45)' }}>{label}: </span>
        <span style={{ color:'#fff', fontWeight:500 }}>{display}</span>
      </div>
    );
  };

  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',backdropFilter:'blur(4px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:100,padding:16}}>
      <div onClick={(e)=>e.stopPropagation()} className="card" style={{maxWidth:560,width:'100%',maxHeight:'85vh',overflowY:'auto',padding:28}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20}}>
          <div>
            <h3 style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:20,color:'#fff',margin:0}}>
              {usuario.nombre || 'Cliente'}
            </h3>
            <p style={{fontSize:13,color:'rgba(255,255,255,0.45)',margin:'4px 0 0'}}>{usuario.email}</p>
          </div>
          <button onClick={onClose} className="btn-outline" style={{padding:'6px 14px',fontSize:13}}>✕ Cerrar</button>
        </div>

        {!ob ? (
          <div style={{textAlign:'center',padding:'30px 0',color:'rgba(255,255,255,0.4)',fontSize:14}}>
            Este cliente aún no ha completado el onboarding.
          </div>
        ) : (
          <>
            <Section title="Negocio">
              <Field label="Cliente" value={ob.nombreCliente} />
              <Field label="Empresa" value={ob.empresaPorCrear ? '(CreceCon debe crear el nombre)' : ob.nombreEmpresa} />
              <Field label="Rubro" value={ob.rubro === 'Otro' ? ob.rubroOtro : ob.rubro} />
              <Field label="Descripción" value={ob.descripcionNegocio} />
              <Field label="Ubicación" value={ob.ubicacion} />
              <Field label="Horario" value={ob.sinHorarioFijo ? 'No tiene horario fijo' : ob.horario} />
            </Section>

            <Section title="Contacto y redes">
              <Field label="WhatsApp empresa" value={ob.whatsappEmpresa} />
              <Field label="WhatsApp cliente" value={ob.whatsappCliente} />
              {ob.redesActuales && Object.entries(ob.redesActuales).map(([red,val])=> (
                <Field key={red} label={red} value={val as string} />
              ))}
              <Field label="Redes por crear" value={ob.redesPorCrear} />
              <Field label="Email de contacto" value={ob.emailContacto} />
              <Field label="Correos a crear" value={ob.correosPorCrear} />
            </Section>

            <Section title="Servicios solicitados">
              <Field label="Servicios" value={(ob.servicios||[]).map((s:string)=>SERVICIOS_LABELS[s]||s)} />
              <Field label="Otro servicio" value={ob.servicioOtro} />
            </Section>

            <Section title="Branding">
              <Field label="Logo" value={ob.logoEstado === 'tiene' ? 'El cliente ya tiene logo (lo enviará por WhatsApp)' : ob.logoEstado === 'crear' ? 'CreceCon debe crear el logo' : ''} />
              <Field label="Colores" value={ob.coloresSugerencia ? 'Que los especialistas sugieran los colores' : ob.coloresMarca} />
              <Field label="Referencia 1" value={ob.referencia1} />
              <Field label="Referencia 2" value={ob.referencia2} />
              <Field label="Fotos disponibles" value={ob.fotosDisponibles ? 'Sí, el cliente las enviará' : ''} />
            </Section>

            <Section title="Objetivos y notas">
              <Field label="Objetivos" value={(ob.objetivos||[]).includes('Otro') ? [...ob.objetivos.filter((o:string)=>o!=='Otro'), ob.objetivoOtro].filter(Boolean) : ob.objetivos} />
              <Field label="Sitio web actual" value={ob.sitioWebActual} />
              <Field label="Notas adicionales" value={ob.notasAdicionales} />
              <Field label="Confía en CreceCon" value={ob.dejarEnManosCreceCon ? 'Sí, para decisiones no especificadas' : ''} />
            </Section>
          </>
        )}
      </div>
    </div>
  );
}

export default function ClientesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nombre:'', email:'', password:'', rol:'cliente', empresa:'' });
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState<{type:string,text:string}|null>(null);
  const [onboardingCliente, setOnboardingCliente] = useState<any|null>(null);

  useEffect(() => {
    if (!user) return;
    if (user.rol !== 'admin') { router.push('/login'); return; }
    load();
  }, [user]);

  const load = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db,'usuarios'),orderBy('createdAt','desc')));
      setUsuarios(snap.docs.map(d=>({id:d.id,...d.data()})));
    } catch(e){ console.error(e); }
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setMsg(null);
    const secondaryApp = initializeApp(firebaseConfig, 'Secondary-'+Date.now());
    try {
      const secondaryAuth = getAuth(secondaryApp);
      const cred = await createUserWithEmailAndPassword(secondaryAuth, form.email, form.password);
      await setDoc(doc(db,'usuarios',cred.user.uid), {
        nombre: form.nombre,
        email: form.email,
        rol: form.rol,
        empresa: form.empresa||'',
        createdAt: new Date(),
        ...(form.rol==='setter'?{puntos:0,nivel:1,leadsConvertidos:0,comisionMes:0,ranking:0}:{}),
        ...(form.rol==='socio'?{porcentajeParticipacion:0,ingresosTotales:0,ingresosMes:0,clientesReferidos:0}:{}),
        ...(form.rol==='cliente'?{progreso:0,fase:'Pago',onboardingCompleto:false,proyectoNombre:form.empresa||'Proyecto'}:{}),
      });
      setMsg({type:'ok',text:`Usuario ${form.nombre} creado exitosamente como ${form.rol}`});
      setForm({nombre:'',email:'',password:'',rol:'cliente',empresa:''});
      setShowForm(false);
      load();
    } catch(err:any) {
      const messages:Record<string,string> = {
        'auth/email-already-in-use':'Este correo ya está registrado.',
        'auth/weak-password':'La contraseña debe tener al menos 6 caracteres.',
        'auth/invalid-email':'Correo inválido.',
      };
      setMsg({type:'error',text:messages[err.code]||'Error al crear usuario.'});
    } finally {
      await deleteApp(secondaryApp);
      setCreating(false);
    }
  };

  const roleColors:Record<string,string> = { admin:'#22C55E', setter:'#8B5CF6', socio:'#C084FC', cliente:'#60A5FA' };
  const roleLabels:Record<string,string> = { admin:'Admin', setter:'Setter', socio:'Socio', cliente:'Cliente' };

  return (
    <div style={{display:'flex',minHeight:'100vh',background:'#050814'}}>
      <Sidebar active="/admin/clientes"/>
      <main style={{marginLeft:240,flex:1,padding:'32px',minHeight:'100vh'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:32,flexWrap:'wrap',gap:12}}>
          <div>
            <h1 style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'1.6rem',color:'#fff',margin:0,letterSpacing:'-0.02em'}}>Usuarios</h1>
            <p style={{fontFamily:'DM Sans,sans-serif',color:'rgba(255,255,255,0.38)',fontSize:'0.875rem',margin:'4px 0 0'}}>Gestiona clientes, setters y socios</p>
          </div>
          <button onClick={()=>{setShowForm(!showForm);setMsg(null);}} className="btn-primary" style={{padding:'11px 22px',fontSize:'0.9rem'}}>
            {showForm?'✕ Cancelar':'+ Nuevo usuario'}
          </button>
        </div>

        {msg && (
          <div style={{padding:'12px 16px',borderRadius:10,marginBottom:20,fontFamily:'DM Sans,sans-serif',fontSize:'0.875rem',background:msg.type==='ok'?'rgba(34,197,94,0.1)':'rgba(239,68,68,0.1)',border:`1px solid ${msg.type==='ok'?'rgba(34,197,94,0.3)':'rgba(239,68,68,0.3)'}`,color:msg.type==='ok'?'#4ADE80':'#F87171'}}>
            {msg.text}
          </div>
        )}

        {showForm && (
          <form onSubmit={handleCreate} className="card" style={{marginBottom:24,display:'flex',flexDirection:'column',gap:14}}>
            <h2 style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:'1rem',color:'#fff',margin:0}}>Crear nuevo usuario</h2>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
              <div>
                <label style={{display:'block',fontFamily:'DM Sans,sans-serif',fontSize:'0.72rem',color:'rgba(255,255,255,0.4)',marginBottom:6,textTransform:'uppercase'}}>Nombre completo *</label>
                <input required className="input-field" value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})} placeholder="Nombre y apellido"/>
              </div>
              <div>
                <label style={{display:'block',fontFamily:'DM Sans,sans-serif',fontSize:'0.72rem',color:'rgba(255,255,255,0.4)',marginBottom:6,textTransform:'uppercase'}}>Rol *</label>
                <select required className="input-field" value={form.rol} onChange={e=>setForm({...form,rol:e.target.value})}>
                  <option value="cliente">Cliente</option>
                  <option value="setter">Setter</option>
                  <option value="socio">Socio</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
              <div>
                <label style={{display:'block',fontFamily:'DM Sans,sans-serif',fontSize:'0.72rem',color:'rgba(255,255,255,0.4)',marginBottom:6,textTransform:'uppercase'}}>Email *</label>
                <input required type="email" className="input-field" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="correo@ejemplo.com"/>
              </div>
              <div>
                <label style={{display:'block',fontFamily:'DM Sans,sans-serif',fontSize:'0.72rem',color:'rgba(255,255,255,0.4)',marginBottom:6,textTransform:'uppercase'}}>Contraseña *</label>
                <input required type="text" minLength={6} className="input-field" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="Mínimo 6 caracteres"/>
              </div>
            </div>
            {form.rol==='cliente'&&(
              <div>
                <label style={{display:'block',fontFamily:'DM Sans,sans-serif',fontSize:'0.72rem',color:'rgba(255,255,255,0.4)',marginBottom:6,textTransform:'uppercase'}}>Empresa / Proyecto</label>
                <input className="input-field" value={form.empresa} onChange={e=>setForm({...form,empresa:e.target.value})} placeholder="Nombre de la empresa"/>
              </div>
            )}
            <button type="submit" disabled={creating} className="btn-primary glow-green-sm" style={{padding:'12px',fontSize:'0.9rem',opacity:creating?0.7:1}}>
              {creating?'Creando...':'Crear usuario'}
            </button>
          </form>
        )}

        <div style={{background:'rgba(13,20,38,0.7)',backdropFilter:'blur(20px)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:16,padding:'8px'}}>
          {loading?(
            <div style={{padding:'40px',textAlign:'center'}}>
              <div className="spinner" style={{margin:'0 auto'}}/>
            </div>
          ):usuarios.length===0?(
            <div style={{textAlign:'center',padding:'48px 0'}}>
              <div style={{fontSize:'2rem',marginBottom:8}}>👥</div>
              <p style={{fontFamily:'DM Sans,sans-serif',color:'rgba(255,255,255,0.28)',fontSize:'0.9rem',margin:0}}>No hay usuarios registrados aún</p>
            </div>
          ):(
            <div>
              {usuarios.map(u=>(
                <div key={u.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 16px',borderRadius:10,transition:'background 0.15s'}}
                  onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background='rgba(255,255,255,0.025)'}
                  onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background='transparent'}>
                  <div style={{display:'flex',alignItems:'center',gap:12}}>
                    <div style={{width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,#1A3A8F,#22C55E)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                      <span style={{color:'#fff',fontSize:13,fontWeight:700}}>{u.nombre?.charAt(0)?.toUpperCase()||'?'}</span>
                    </div>
                    <div>
                      <div style={{fontFamily:'DM Sans,sans-serif',fontWeight:600,color:'#fff',fontSize:'0.9rem'}}>{u.nombre||'Sin nombre'}</div>
                      <div style={{fontFamily:'DM Sans,sans-serif',color:'rgba(255,255,255,0.35)',fontSize:'0.78rem'}}>{u.email}</div>
                    </div>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    {u.rol==='cliente' && (
                      <>
                        <span style={{display:'inline-flex',alignItems:'center',padding:'4px 10px',borderRadius:9999,fontSize:'0.7rem',fontWeight:600,background:u.onboardingCompleto?'rgba(34,197,94,0.12)':'rgba(245,158,11,0.12)',color:u.onboardingCompleto?'#4ADE80':'#FBBF24',border:`1px solid ${u.onboardingCompleto?'rgba(34,197,94,0.3)':'rgba(245,158,11,0.3)'}`}}>
                          {u.onboardingCompleto?'✓ Onboarding completo':'⏳ Onboarding pendiente'}
                        </span>
                        <button onClick={()=>setOnboardingCliente(u)} className="btn-outline" style={{padding:'5px 14px',fontSize:'0.78rem'}}>
                          Ver info
                        </button>
                      </>
                    )}
                    <span style={{display:'inline-flex',alignItems:'center',padding:'4px 12px',borderRadius:9999,fontSize:'0.72rem',fontWeight:600,background:`${roleColors[u.rol]}20`,color:roleColors[u.rol],border:`1px solid ${roleColors[u.rol]}40`}}>
                      {roleLabels[u.rol]||u.rol}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {onboardingCliente && (
        <OnboardingModal usuario={onboardingCliente} onClose={()=>setOnboardingCliente(null)} />
      )}
    </div>
  );
}
