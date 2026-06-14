"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, doc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import SidebarNav from "@/components/SidebarNav";

const NAV_LINKS = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/clientes", label: "Clientes", icon: "👥" },
  { href: "/admin/proyectos", label: "Proyectos", icon: "📁" },
  { href: "/admin/leads", label: "CRM Leads", icon: "🎯" },
  { href: "/admin/cursos", label: "Cursos LMS", icon: "🎓" },
  { href: "/admin/tickets", label: "Soporte", icon: "🎧" },
];

interface Lead {
  id: string;
  nombre?: string;
  email?: string;
  whatsapp?: string;
  empresa?: string;
  servicio?: string;
  mensaje?: string;
  estado: string;
  createdAt?: any;
}

const ESTADOS = ["Nuevo", "Contactado", "Negociación", "Cerrado"] as const;

const ESTADO_COLOR: Record<string, string> = {
  Nuevo: "#2563EB", Contactado: "#F59E0B", Negociación: "#A855F7", Cerrado: "#22C55E",
};

function LeadModal({ lead, onClose, onDelete }: { lead: Lead; onClose: () => void; onDelete: (id: string) => void }) {
  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',backdropFilter:'blur(4px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:100,padding:16}}>
      <div onClick={(e)=>e.stopPropagation()} className="card" style={{maxWidth:480,width:'100%',padding:28}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16}}>
          <h3 style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:20,color:'#fff'}}>{lead.nombre||'Sin nombre'}</h3>
          <span className="badge-green" style={{background:`${ESTADO_COLOR[lead.estado]}22`,color:ESTADO_COLOR[lead.estado],border:`1px solid ${ESTADO_COLOR[lead.estado]}55`}}>{lead.estado}</span>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:10,fontSize:14,color:'rgba(255,255,255,0.8)'}}>
          {lead.email&&<div><strong style={{color:'#fff'}}>Email:</strong> {lead.email}</div>}
          {lead.whatsapp&&<div><strong style={{color:'#fff'}}>WhatsApp:</strong> <span onClick={()=>window.open(`https://wa.me/${lead.whatsapp!.replace(/\D/g,'')}`, '_blank')} style={{color:'#22C55E',cursor:'pointer',textDecoration:'underline'}}>{lead.whatsapp}</span></div>}
          {lead.empresa&&<div><strong style={{color:'#fff'}}>Empresa:</strong> {lead.empresa}</div>}
          {lead.servicio&&<div><strong style={{color:'#fff'}}>Servicio:</strong> {lead.servicio}</div>}
          {lead.mensaje&&<div><strong style={{color:'#fff'}}>Mensaje:</strong><p style={{marginTop:4,color:'rgba(255,255,255,0.65)',lineHeight:1.6}}>{lead.mensaje}</p></div>}
          {lead.createdAt&&<div style={{fontSize:12,color:'rgba(255,255,255,0.4)'}}>Recibido: {lead.createdAt.toDate?lead.createdAt.toDate().toLocaleString('es-VE'):''}</div>}
        </div>
        <div style={{display:'flex',gap:12,marginTop:24}}>
          <button onClick={()=>{if(confirm('¿Eliminar este lead?')){onDelete(lead.id);onClose();}}} className="btn-outline" style={{flex:1,borderColor:'#EF4444',color:'#EF4444'}}>🗑️ Eliminar</button>
          <button onClick={onClose} className="btn-primary" style={{flex:1}}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

function LeadCard({ lead, onDragStart, onClick }: { lead: Lead; onDragStart: (e: React.DragEvent, id: string) => void; onClick: () => void }) {
  return (
    <div draggable onDragStart={(e)=>onDragStart(e,lead.id)} onClick={onClick} className="card glass-hover"
      style={{padding:14,marginBottom:12,cursor:'grab',borderLeft:`3px solid ${ESTADO_COLOR[lead.estado]}`}}>
      <div style={{fontWeight:700,fontSize:14,color:'#fff',marginBottom:4}}>{lead.nombre||'Sin nombre'}</div>
      {lead.empresa&&<div style={{fontSize:12,color:'rgba(255,255,255,0.5)',marginBottom:4}}>🏢 {lead.empresa}</div>}
      {lead.servicio&&<div style={{display:'inline-block',fontSize:11,fontWeight:600,color:'#22C55E',background:'rgba(34,197,94,0.1)',border:'1px solid rgba(34,197,94,0.25)',borderRadius:6,padding:'2px 8px',marginBottom:6}}>{lead.servicio}</div>}
      {lead.whatsapp&&<div style={{fontSize:12,color:'rgba(255,255,255,0.5)'}}>📱 {lead.whatsapp}</div>}
      {lead.createdAt?.toDate&&<div style={{fontSize:11,color:'rgba(255,255,255,0.35)',marginTop:6}}>{lead.createdAt.toDate().toLocaleDateString('es-VE',{day:'2-digit',month:'short'})}</div>}
    </div>
  );
}

export default function LeadsKanbanPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const draggedIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!loading && (!user || user.rol !== 'admin')) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    const q = query(collection(db, 'leads'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setLeads(snap.docs.map((d) => ({ id: d.id, ...d.data(), estado: d.data().estado || 'Nuevo' })) as Lead[]);
      setLoadingLeads(false);
    }, (err) => { console.error(err); setLoadingLeads(false); });
    return () => unsub();
  }, []);

  const handleDragStart = (e: React.DragEvent, id: string) => { draggedIdRef.current = id; e.dataTransfer.effectAllowed = 'move'; };
  const handleDragOver = (e: React.DragEvent, estado: string) => { e.preventDefault(); setDragOverCol(estado); };
  const handleDragLeave = () => setDragOverCol(null);

  const handleDrop = async (e: React.DragEvent, estado: string) => {
    e.preventDefault(); setDragOverCol(null);
    const id = draggedIdRef.current;
    if (!id) return;
    const lead = leads.find((l) => l.id === id);
    if (!lead || lead.estado === estado) return;
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, estado } : l)));
    try { await updateDoc(doc(db, 'leads', id), { estado }); }
    catch (err) { setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, estado: lead.estado } : l))); }
    draggedIdRef.current = null;
  };

  const handleDelete = async (id: string) => {
    try { await deleteDoc(doc(db, 'leads', id)); } catch (err) { alert('Error al eliminar.'); }
  };

  if (loading || !user || user.rol !== 'admin') return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}><div className="spinner"/></div>;

  return (
    <div style={{display:'flex',minHeight:'100vh',background:'#050814'}}>
      <SidebarNav links={NAV_LINKS} active="CRM Leads" />

      <style>{`
        @media (max-width: 768px) {
          .leads-main { margin-left: 0 !important; padding: 80px 16px 32px !important; }
          .kanban-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <main className="leads-main" style={{marginLeft:240,flex:1,padding:32}}>
        <div style={{marginBottom:28}}>
          <h1 style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:28,color:'#fff'}}>CRM <span className="gradient-text">Leads</span></h1>
          <p style={{color:'rgba(255,255,255,0.5)',marginTop:4,fontSize:14}}>Arrastra las tarjetas para cambiar el estado. Haz clic para ver detalles.</p>
        </div>

        {loadingLeads ? (
          <div style={{display:'flex',justifyContent:'center',padding:60}}><div className="spinner"/></div>
        ) : (
          <div className="kanban-grid" style={{display:'grid',gridTemplateColumns:'repeat(4,minmax(240px,1fr))',gap:20,overflowX:'auto'}}>
            {ESTADOS.map((estado) => {
              const columnLeads = leads.filter((l) => l.estado === estado);
              const isOver = dragOverCol === estado;
              return (
                <div key={estado} onDragOver={(e)=>handleDragOver(e,estado)} onDragLeave={handleDragLeave} onDrop={(e)=>handleDrop(e,estado)}
                  style={{borderRadius:16,padding:14,minHeight:400,background:isOver?'rgba(34,197,94,0.06)':'rgba(255,255,255,0.02)',border:isOver?'1px dashed rgba(34,197,94,0.5)':'1px solid rgba(255,255,255,0.06)',transition:'all 0.15s'}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14,padding:'0 4px'}}>
                    <span style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:14,color:ESTADO_COLOR[estado],textTransform:'uppercase',letterSpacing:0.5}}>{estado}</span>
                    <span style={{fontSize:12,fontWeight:700,color:'rgba(255,255,255,0.6)',background:'rgba(255,255,255,0.06)',borderRadius:20,padding:'2px 9px'}}>{columnLeads.length}</span>
                  </div>
                  {columnLeads.length===0 ? (
                    <div style={{fontSize:13,color:'rgba(255,255,255,0.25)',textAlign:'center',padding:'30px 10px'}}>Sin leads</div>
                  ) : (
                    columnLeads.map((lead) => <LeadCard key={lead.id} lead={lead} onDragStart={handleDragStart} onClick={()=>setSelectedLead(lead)}/>)
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
      {selectedLead && <LeadModal lead={selectedLead} onClose={()=>setSelectedLead(null)} onDelete={handleDelete}/>}
    </div>
  );
}