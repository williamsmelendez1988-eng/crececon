"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from "firebase/firestore";
import SidebarNav from "@/components/SidebarNav";

const NAV_LINKS = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/clientes", label: "Clientes", icon: "👥" },
  { href: "/admin/proyectos", label: "Proyectos", icon: "📁" },
  { href: "/admin/leads", label: "CRM Leads", icon: "🎯" },
  { href: "/admin/cursos", label: "Cursos LMS", icon: "🎓" },
  { href: "/admin/tickets", label: "Soporte", icon: "🎧" },
];

interface Curso {
  id: string;
  titulo: string;
  descripcion: string;
  videoUrl: string;
  orden: number;
  activo: boolean;
  createdAt?: any;
}

function CursoModal({ curso, onClose, onSave }: { curso: Partial<Curso> | null; onClose: () => void; onSave: (data: Partial<Curso>) => Promise<void> }) {
  const [titulo, setTitulo] = useState(curso?.titulo || "");
  const [descripcion, setDescripcion] = useState(curso?.descripcion || "");
  const [videoUrl, setVideoUrl] = useState(curso?.videoUrl || "");
  const [orden, setOrden] = useState(curso?.orden ?? 1);
  const [activo, setActivo] = useState(curso?.activo ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!titulo.trim()) { setError("El título es obligatorio."); return; }
    if (!videoUrl.trim()) { setError("La URL del video es obligatoria."); return; }
    setSaving(true); setError("");
    try {
      await onSave({ titulo, descripcion, videoUrl, orden: Number(orden), activo });
      onClose();
    } catch (err) { setError("Error al guardar el curso."); }
    finally { setSaving(false); }
  };

  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',backdropFilter:'blur(4px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:100,padding:16}}>
      <div onClick={(e)=>e.stopPropagation()} className="card" style={{maxWidth:520,width:'100%',padding:28}}>
        <h3 style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:20,color:'#fff',marginBottom:20}}>
          {curso?.id ? "Editar curso" : "Nuevo curso"}
        </h3>
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <div>
            <label style={{fontSize:13,fontWeight:600,color:'rgba(255,255,255,0.7)',display:'block',marginBottom:6}}>Título del curso</label>
            <input type="text" className="input-field" style={{width:'100%'}} value={titulo} onChange={(e)=>setTitulo(e.target.value)} placeholder="Ej: Cómo conseguir tus primeros clientes"/>
          </div>
          <div>
            <label style={{fontSize:13,fontWeight:600,color:'rgba(255,255,255,0.7)',display:'block',marginBottom:6}}>Descripción</label>
            <textarea className="input-field" style={{width:'100%',minHeight:80,resize:'vertical'}} value={descripcion} onChange={(e)=>setDescripcion(e.target.value)} placeholder="Breve descripción del módulo"/>
          </div>
          <div>
            <label style={{fontSize:13,fontWeight:600,color:'rgba(255,255,255,0.7)',display:'block',marginBottom:6}}>URL del video (YouTube o Vimeo)</label>
            <input type="text" className="input-field" style={{width:'100%'}} value={videoUrl} onChange={(e)=>setVideoUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..."/>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
            <div>
              <label style={{fontSize:13,fontWeight:600,color:'rgba(255,255,255,0.7)',display:'block',marginBottom:6}}>Orden / Módulo</label>
              <input type="number" min={1} className="input-field" style={{width:'100%'}} value={orden} onChange={(e)=>setOrden(Number(e.target.value))}/>
            </div>
            <div style={{display:'flex',alignItems:'flex-end',paddingBottom:4}}>
              <label style={{display:'flex',alignItems:'center',gap:10,fontSize:14,color:'rgba(255,255,255,0.7)',cursor:'pointer'}}>
                <input type="checkbox" checked={activo} onChange={(e)=>setActivo(e.target.checked)} style={{width:16,height:16,accentColor:'#22C55E'}}/>
                Visible para setters
              </label>
            </div>
          </div>
        </div>
        {error && <div style={{marginTop:12,padding:'8px 12px',borderRadius:8,background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',color:'#FCA5A5',fontSize:13}}>{error}</div>}
        <div style={{display:'flex',gap:12,marginTop:24}}>
          <button onClick={onClose} className="btn-outline" style={{flex:1}} disabled={saving}>Cancelar</button>
          <button onClick={handleSubmit} className="btn-primary" style={{flex:1}} disabled={saving}>{saving?'Guardando...':'Guardar curso'}</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminCursosPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loadingCursos, setLoadingCursos] = useState(true);
  const [modalCurso, setModalCurso] = useState<Partial<Curso> | null | false>(false);

  useEffect(() => {
    if (!loading && (!user || user.rol !== 'admin')) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    const q = query(collection(db, 'cursos'), orderBy('orden', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      setCursos(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Curso[]);
      setLoadingCursos(false);
    }, (err) => { console.error(err); setLoadingCursos(false); });
    return () => unsub();
  }, []);

  const handleSave = async (data: Partial<Curso>) => {
    if (modalCurso && (modalCurso as Curso).id) {
      await updateDoc(doc(db, 'cursos', (modalCurso as Curso).id), { ...data });
    } else {
      await addDoc(collection(db, 'cursos'), { ...data, createdAt: serverTimestamp() });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este curso permanentemente?')) return;
    await deleteDoc(doc(db, 'cursos', id));
  };

  const toggleActivo = async (curso: Curso) => {
    await updateDoc(doc(db, 'cursos', curso.id), { activo: !curso.activo });
  };

  if (loading || !user || user.rol !== 'admin') return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}><div className="spinner"/></div>;

  return (
    <div style={{display:'flex',minHeight:'100vh',background:'#050814'}}>
      <SidebarNav links={NAV_LINKS} active="Cursos LMS" />

      <style>{`
        @media (max-width: 768px) {
          .cursos-main { margin-left: 0 !important; padding: 80px 16px 32px !important; }
          .curso-card { flex-direction: column !important; align-items: flex-start !important; }
          .curso-actions { flex-wrap: wrap; }
        }
      `}</style>

      <main className="cursos-main" style={{marginLeft:240,flex:1,padding:32}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',flexWrap:'wrap',gap:16,marginBottom:28}}>
          <div>
            <h1 style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:28,color:'#fff'}}>Gestión de <span className="gradient-text">Cursos LMS</span></h1>
            <p style={{color:'rgba(255,255,255,0.5)',marginTop:4,fontSize:14}}>Crea y gestiona los módulos de formación para tus setters.</p>
          </div>
          <button onClick={()=>setModalCurso({})} className="btn-primary">+ Nuevo curso</button>
        </div>

        {loadingCursos ? (
          <div style={{display:'flex',justifyContent:'center',padding:60}}><div className="spinner"/></div>
        ) : cursos.length === 0 ? (
          <div className="card" style={{padding:40,textAlign:'center'}}>
            <div style={{fontSize:32,marginBottom:12}}>🎓</div>
            <p style={{color:'rgba(255,255,255,0.5)',fontSize:14}}>No hay cursos todavía. Crea el primer módulo.</p>
          </div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {cursos.map((curso)=>(
              <div key={curso.id} className="card curso-card" style={{padding:20,display:'flex',alignItems:'center',gap:16,justifyContent:'space-between',flexWrap:'wrap',borderLeft:`3px solid ${curso.activo?'#22C55E':'rgba(255,255,255,0.1)'}`,opacity:curso.activo?1:0.6}}>
                <div style={{display:'flex',alignItems:'center',gap:16,flex:1,minWidth:0}}>
                  <div style={{width:44,height:44,borderRadius:12,background:'linear-gradient(135deg,#1A3A8F,#2563EB)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:18,color:'#fff',flexShrink:0}}>
                    {curso.orden}
                  </div>
                  <div style={{minWidth:0}}>
                    <h3 style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:15,color:'#fff',margin:0}}>{curso.titulo}</h3>
                    {curso.descripcion&&<p style={{fontSize:13,color:'rgba(255,255,255,0.5)',marginTop:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{curso.descripcion}</p>}
                    <p style={{fontSize:11,color:'rgba(255,255,255,0.3)',marginTop:4,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>🎬 {curso.videoUrl}</p>
                  </div>
                </div>
                <div className="curso-actions" style={{display:'flex',gap:8,alignItems:'center'}}>
                  <span style={{fontSize:12,fontWeight:700,color:curso.activo?'#22C55E':'rgba(255,255,255,0.4)',background:curso.activo?'rgba(34,197,94,0.1)':'rgba(255,255,255,0.04)',border:`1px solid ${curso.activo?'rgba(34,197,94,0.3)':'rgba(255,255,255,0.08)'}`,borderRadius:20,padding:'4px 12px'}}>
                    {curso.activo?'Visible':'Oculto'}
                  </span>
                  <button onClick={()=>toggleActivo(curso)} className="btn-outline" style={{padding:'6px 14px',fontSize:12}}>{curso.activo?'Ocultar':'Activar'}</button>
                  <button onClick={()=>setModalCurso(curso)} className="btn-outline" style={{padding:'6px 14px',fontSize:12}}>✏️ Editar</button>
                  <button onClick={()=>handleDelete(curso.id)} className="btn-outline" style={{padding:'6px 14px',fontSize:12,borderColor:'#EF4444',color:'#EF4444'}}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {modalCurso !== false && <CursoModal curso={modalCurso} onClose={()=>setModalCurso(false)} onSave={handleSave}/>}
    </div>
  );
}
