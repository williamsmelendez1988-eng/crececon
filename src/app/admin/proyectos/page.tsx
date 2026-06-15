"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, doc, updateDoc, query, where } from "firebase/firestore";
import SidebarNav from "@/components/SidebarNav";

const NAV_LINKS = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/clientes", label: "Clientes", icon: "👥" },
  { href: "/admin/proyectos", label: "Proyectos", icon: "📁" },
  { href: "/admin/leads", label: "CRM Leads", icon: "🎯" },
  { href: "/admin/cursos", label: "Cursos LMS", icon: "🎓" },
  { href: "/admin/tickets", label: "Soporte", icon: "🎧" },
];

interface ClienteProyecto {
  id: string;
  nombre?: string;
  email?: string;
  empresa?: string;
  proyectoNombre?: string;
  fase?: string;
  progreso?: number;
  onboardingCompleto?: boolean;
}

const FASES = ["Pago", "Onboarding", "Diseño", "Desarrollo", "Lanzamiento", "Escalamiento"] as const;

const FASE_COLOR: Record<string, string> = {
  Pago: "#F59E0B", Onboarding: "#2563EB", Diseño: "#A855F7",
  Desarrollo: "#22C55E", Lanzamiento: "#16A34A", Escalamiento: "#1A3A8F",
};

function EditarProyectoModal({ cliente, onClose, onSave }: { cliente: ClienteProyecto; onClose: () => void; onSave: (id: string, data: Partial<ClienteProyecto>) => Promise<void> }) {
  const [proyectoNombre, setProyectoNombre] = useState(cliente.proyectoNombre || "");
  const [fase, setFase] = useState(cliente.fase || "Pago");
  const [progreso, setProgreso] = useState(cliente.progreso ?? 0);
  const [onboardingCompleto, setOnboardingCompleto] = useState(cliente.onboardingCompleto || false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await onSave(cliente.id, { proyectoNombre, fase, progreso: Number(progreso), onboardingCompleto });
      onClose();
    } catch (err) { alert("Error al guardar."); }
    finally { setSaving(false); }
  };

  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',backdropFilter:'blur(4px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:100,padding:16}}>
      <div onClick={(e)=>e.stopPropagation()} className="card" style={{maxWidth:480,width:'100%',padding:28}}>
        <h3 style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:20,color:'#fff',marginBottom:4}}>{cliente.nombre||'Cliente'}</h3>
        <p style={{fontSize:13,color:'rgba(255,255,255,0.45)',marginBottom:20}}>{cliente.empresa||cliente.email}</p>
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          <div>
            <label style={{fontSize:13,fontWeight:600,color:'rgba(255,255,255,0.7)',display:'block',marginBottom:6}}>Nombre del proyecto</label>
            <input type="text" className="input-field" style={{width:'100%'}} value={proyectoNombre} onChange={(e)=>setProyectoNombre(e.target.value)} placeholder="Ej: Sitio web + Sistema de citas"/>
          </div>
          <div>
            <label style={{fontSize:13,fontWeight:600,color:'rgba(255,255,255,0.7)',display:'block',marginBottom:6}}>Fase actual</label>
            <select className="input-field" style={{width:'100%'}} value={fase} onChange={(e)=>setFase(e.target.value)}>
              {FASES.map((f)=><option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label style={{fontSize:13,fontWeight:600,color:'rgba(255,255,255,0.7)',display:'flex',justifyContent:'space-between',marginBottom:6}}>
              <span>Progreso</span><span style={{color:'#22C55E'}}>{progreso}%</span>
            </label>
            <input type="range" min={0} max={100} step={5} value={progreso} onChange={(e)=>setProgreso(Number(e.target.value))} style={{width:'100%',accentColor:'#22C55E'}}/>
          </div>
          <label style={{display:'flex',alignItems:'center',gap:10,fontSize:14,color:'rgba(255,255,255,0.8)',cursor:'pointer'}}>
            <input type="checkbox" checked={onboardingCompleto} onChange={(e)=>setOnboardingCompleto(e.target.checked)} style={{width:16,height:16,accentColor:'#22C55E'}}/>
            Onboarding completado
          </label>
        </div>
        <div style={{display:'flex',gap:12,marginTop:24}}>
          <button onClick={onClose} className="btn-outline" style={{flex:1}} disabled={saving}>Cancelar</button>
          <button onClick={handleSubmit} className="btn-primary" style={{flex:1}} disabled={saving}>{saving?'Guardando...':'Guardar cambios'}</button>
        </div>
      </div>
    </div>
  );
}

function ProyectoCard({ cliente, onEdit }: { cliente: ClienteProyecto; onEdit: () => void }) {
  const fase = cliente.fase || "Pago";
  const progreso = cliente.progreso ?? 0;
  const color = FASE_COLOR[fase] || "#22C55E";
  return (
    <div className="card glass-hover" style={{padding:20}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
        <div>
          <h3 style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:16,color:'#fff'}}>{cliente.proyectoNombre||'Sin proyecto asignado'}</h3>
          <p style={{fontSize:13,color:'rgba(255,255,255,0.5)',marginTop:2}}>{cliente.nombre} {cliente.empresa?`· ${cliente.empresa}`:''}</p>
        </div>
        <span className="badge-green" style={{background:`${color}22`,color,border:`1px solid ${color}55`,whiteSpace:'nowrap'}}>{fase}</span>
      </div>
      <div style={{marginBottom:14}}>
        <div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:'rgba(255,255,255,0.5)',marginBottom:6}}>
          <span>Progreso</span><span style={{color:'#22C55E',fontWeight:700}}>{progreso}%</span>
        </div>
        <div style={{height:8,borderRadius:8,background:'rgba(255,255,255,0.06)',overflow:'hidden'}}>
          <div style={{height:'100%',width:`${progreso}%`,background:'linear-gradient(90deg,#1A3A8F,#22C55E)',borderRadius:8,transition:'width 0.3s ease'}}/>
        </div>
      </div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <span style={{fontSize:12,color:cliente.onboardingCompleto?'#22C55E':'rgba(255,255,255,0.35)'}}>
          {cliente.onboardingCompleto?'✓ Onboarding completo':'Onboarding pendiente'}
        </span>
        <button onClick={onEdit} className="btn-outline" style={{padding:'6px 16px',fontSize:13}}>✏️ Editar</button>
      </div>
    </div>
  );
}

export default function ProyectosPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [clientes, setClientes] = useState<ClienteProyecto[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(true);
  const [editingCliente, setEditingCliente] = useState<ClienteProyecto | null>(null);
  const [filtroFase, setFiltroFase] = useState<string>("Todas");

  useEffect(() => {
    if (!loading && (!user || user.rol !== 'admin')) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    const q = query(collection(db, 'usuarios'), where('rol', '==', 'cliente'));
    const unsub = onSnapshot(q, (snap) => {
      setClientes(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as ClienteProyecto[]);
      setLoadingClientes(false);
    }, (err) => { console.error(err); setLoadingClientes(false); });
    return () => unsub();
  }, []);

  const handleSave = async (id: string, data: Partial<ClienteProyecto>) => {
    await updateDoc(doc(db, 'usuarios', id), data);
  };

  if (loading || !user || user.rol !== 'admin') return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}><div className="spinner"/></div>;

  const clientesFiltrados = filtroFase === 'Todas' ? clientes : clientes.filter((c) => (c.fase || 'Pago') === filtroFase);

  return (
    <div style={{display:'flex',minHeight:'100vh',background:'#050814'}}>
      <SidebarNav links={NAV_LINKS} active="Proyectos" />

      <style>{`
        @media (max-width: 768px) {
          .proyectos-main { margin-left: 0 !important; padding: 80px 16px 32px !important; }
          .proyectos-header { flex-direction: column !important; align-items: flex-start !important; }
          .proyectos-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <main className="proyectos-main" style={{marginLeft:240,flex:1,padding:32}}>
        <div className="proyectos-header" style={{marginBottom:28,display:'flex',justifyContent:'space-between',alignItems:'flex-end',flexWrap:'wrap',gap:16}}>
          <div>
            <h1 style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:28,color:'#fff'}}>Gestión de <span className="gradient-text">Proyectos</span></h1>
            <p style={{color:'rgba(255,255,255,0.5)',marginTop:4,fontSize:14}}>Asigna y actualiza la fase y el progreso de cada proyecto.</p>
          </div>
          <select value={filtroFase} onChange={(e)=>setFiltroFase(e.target.value)} className="input-field" style={{minWidth:180}}>
            <option value="Todas">Todas las fases</option>
            {FASES.map((f)=><option key={f} value={f}>{f}</option>)}
          </select>
        </div>

        {loadingClientes ? (
          <div style={{display:'flex',justifyContent:'center',padding:60}}><div className="spinner"/></div>
        ) : clientesFiltrados.length === 0 ? (
          <div className="card" style={{padding:40,textAlign:'center'}}>
            <p style={{color:'rgba(255,255,255,0.5)',fontSize:14}}>{clientes.length===0?'No hay clientes registrados todavía.':'No hay proyectos en esta fase.'}</p>
          </div>
        ) : (
          <div className="proyectos-grid" style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:20}}>
            {clientesFiltrados.map((cliente)=>(
              <ProyectoCard key={cliente.id} cliente={cliente} onEdit={()=>setEditingCliente(cliente)}/>
            ))}
          </div>
        )}
      </main>

      {editingCliente && <EditarProyectoModal cliente={editingCliente} onClose={()=>setEditingCliente(null)} onSave={handleSave}/>}
    </div>
  );
}