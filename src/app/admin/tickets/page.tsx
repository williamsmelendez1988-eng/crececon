"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, doc, updateDoc, arrayUnion, serverTimestamp, Timestamp } from "firebase/firestore";
import SidebarNav from "@/components/SidebarNav";

const NAV_LINKS = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/clientes", label: "Clientes", icon: "👥" },
  { href: "/admin/proyectos", label: "Proyectos", icon: "📁" },
  { href: "/admin/leads", label: "CRM Leads", icon: "🎯" },
  { href: "/admin/cursos", label: "Cursos LMS", icon: "🎓" },
  { href: "/admin/tickets", label: "Soporte", icon: "🎧" },
];

interface Mensaje {
  autor: string;
  rol: string;
  texto: string;
  fecha: Timestamp | null;
}

interface Ticket {
  id: string;
  asunto: string;
  categoria: string;
  estado: string;
  clienteId: string;
  clienteNombre: string;
  mensajes: Mensaje[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

const ESTADOS = ["Abierto", "En proceso", "Resuelto"] as const;

const ESTADO_COLOR: Record<string, string> = {
  Abierto: "#2563EB", "En proceso": "#F59E0B", Resuelto: "#22C55E",
};

function formatFecha(ts: Timestamp | null | undefined) {
  if (!ts || !ts.toDate) return "";
  return ts.toDate().toLocaleString("es-VE", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function AdminTicketsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [ticketActivo, setTicketActivo] = useState<Ticket | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string>("Todos");
  const [respuesta, setRespuesta] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [cambiandoEstado, setCambiandoEstado] = useState(false);
  const mensajesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && (!user || user.rol !== 'admin')) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'tickets'), (snap) => {
      const data: Ticket[] = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Ticket[];
      data.sort((a, b) => {
        const ta = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : 0;
        const tb = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : 0;
        return tb - ta;
      });
      setTickets(data);
      setLoadingTickets(false);
      if (ticketActivo) {
        const actualizado = data.find((t) => t.id === ticketActivo.id);
        if (actualizado) setTicketActivo(actualizado);
      }
    }, (err) => { console.error(err); setLoadingTickets(false); });
    return () => unsub();
  }, []);

  useEffect(() => {
    mensajesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticketActivo?.mensajes?.length]);

  const enviarRespuesta = async () => {
    if (!ticketActivo || !respuesta.trim()) return;
    setEnviando(true);
    try {
      await updateDoc(doc(db, 'tickets', ticketActivo.id), {
        mensajes: arrayUnion({ autor: "CreceCon", rol: "admin", texto: respuesta.trim(), fecha: Timestamp.now() }),
        updatedAt: serverTimestamp(),
        ...(ticketActivo.estado === 'Abierto' ? { estado: 'En proceso' } : {}),
      });
      setRespuesta("");
    } catch (err) { alert("Error al enviar."); }
    finally { setEnviando(false); }
  };

  const cambiarEstado = async (nuevoEstado: string) => {
    if (!ticketActivo) return;
    setCambiandoEstado(true);
    try {
      await updateDoc(doc(db, 'tickets', ticketActivo.id), { estado: nuevoEstado, updatedAt: serverTimestamp() });
    } catch (err) { alert("Error al cambiar estado."); }
    finally { setCambiandoEstado(false); }
  };

  if (loading || !user || user.rol !== 'admin') return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}><div className="spinner"/></div>;

  const ticketsFiltrados = filtroEstado === 'Todos' ? tickets : tickets.filter((t) => t.estado === filtroEstado);

  if (ticketActivo) {
    return (
      <div style={{display:'flex',minHeight:'100vh',background:'#050814'}}>
        <SidebarNav links={NAV_LINKS} active="Soporte" />
        <style>{`@media (max-width: 768px) { .tickets-main { margin-left: 0 !important; padding: 80px 16px 32px !important; } }`}</style>
        <main className="tickets-main" style={{marginLeft:240,flex:1,padding:32,display:'flex',flexDirection:'column',height:'100vh'}}>
          <div style={{marginBottom:16}}>
            <div onClick={()=>setTicketActivo(null)} style={{cursor:'pointer',fontSize:13,color:'rgba(255,255,255,0.5)',marginBottom:12,display:'inline-flex',alignItems:'center',gap:6}}>
              ← Volver a tickets
            </div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:12}}>
              <div>
                <h1 style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:22,color:'#fff'}}>{ticketActivo.asunto}</h1>
                <p style={{fontSize:13,color:'rgba(255,255,255,0.5)',marginTop:4}}>{ticketActivo.categoria} · {ticketActivo.clienteNombre}</p>
              </div>
              <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                {ESTADOS.map((e)=>(
                  <button key={e} onClick={()=>cambiarEstado(e)} disabled={cambiandoEstado||ticketActivo.estado===e}
                    style={{padding:'6px 14px',borderRadius:20,fontSize:12,fontWeight:700,cursor:ticketActivo.estado===e?'default':'pointer',background:ticketActivo.estado===e?`${ESTADO_COLOR[e]}22`:'rgba(255,255,255,0.04)',color:ticketActivo.estado===e?ESTADO_COLOR[e]:'rgba(255,255,255,0.5)',border:`1px solid ${ticketActivo.estado===e?ESTADO_COLOR[e]+'55':'rgba(255,255,255,0.1)'}`}}>
                    {e}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="card" style={{flex:1,overflowY:'auto',padding:20,display:'flex',flexDirection:'column',gap:12,marginBottom:16}}>
            {(ticketActivo.mensajes||[]).map((m,i)=>{
              const esAdmin = m.rol === 'admin';
              return (
                <div key={i} style={{alignSelf:esAdmin?'flex-end':'flex-start',maxWidth:'75%',background:esAdmin?'rgba(34,197,94,0.12)':'rgba(255,255,255,0.05)',border:esAdmin?'1px solid rgba(34,197,94,0.25)':'1px solid rgba(255,255,255,0.08)',borderRadius:14,padding:'10px 14px'}}>
                  <div style={{fontSize:12,fontWeight:700,color:esAdmin?'#22C55E':'#60A5FA',marginBottom:4}}>{esAdmin?'Tú (CreceCon)':m.autor||ticketActivo.clienteNombre}</div>
                  <div style={{fontSize:14,color:'rgba(255,255,255,0.9)',whiteSpace:'pre-wrap'}}>{m.texto}</div>
                  <div style={{fontSize:11,color:'rgba(255,255,255,0.35)',marginTop:6}}>{formatFecha(m.fecha)}</div>
                </div>
              );
            })}
            <div ref={mensajesEndRef}/>
          </div>

          <div style={{display:'flex',gap:10}}>
            <input type="text" className="input-field" style={{flex:1}} value={respuesta} onChange={(e)=>setRespuesta(e.target.value)}
              onKeyDown={(e)=>{if(e.key==='Enter'&&!enviando)enviarRespuesta();}} placeholder="Escribe tu respuesta..."/>
            <button onClick={enviarRespuesta} className="btn-primary" disabled={enviando||!respuesta.trim()}>{enviando?'...':'Enviar'}</button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={{display:'flex',minHeight:'100vh',background:'#050814'}}>
      <SidebarNav links={NAV_LINKS} active="Soporte" />
      <style>{`@media (max-width: 768px) { .tickets-main { margin-left: 0 !important; padding: 80px 16px 32px !important; } }`}</style>
      <main className="tickets-main" style={{marginLeft:240,flex:1,padding:32}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',flexWrap:'wrap',gap:16,marginBottom:28}}>
          <div>
            <h1 style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:28,color:'#fff'}}>Tickets de <span className="gradient-text">Soporte</span></h1>
            <p style={{color:'rgba(255,255,255,0.5)',marginTop:4,fontSize:14}}>Gestiona las solicitudes de todos los clientes.</p>
          </div>
          <select value={filtroEstado} onChange={(e)=>setFiltroEstado(e.target.value)} className="input-field" style={{minWidth:180}}>
            <option value="Todos">Todos los estados</option>
            {ESTADOS.map((e)=><option key={e} value={e}>{e}</option>)}
          </select>
        </div>

        {loadingTickets ? (
          <div style={{display:'flex',justifyContent:'center',padding:60}}><div className="spinner"/></div>
        ) : ticketsFiltrados.length === 0 ? (
          <div className="card" style={{padding:40,textAlign:'center'}}>
            <p style={{color:'rgba(255,255,255,0.5)',fontSize:14}}>{tickets.length===0?'No hay tickets todavía.':'No hay tickets con este estado.'}</p>
          </div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {ticketsFiltrados.map((t)=>{
              const ultimoMensaje = t.mensajes?.[t.mensajes.length-1];
              return (
                <div key={t.id} onClick={()=>setTicketActivo(t)} className="card glass-hover" style={{padding:18,cursor:'pointer',borderLeft:`3px solid ${ESTADO_COLOR[t.estado]||'#2563EB'}`}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:12,flexWrap:'wrap'}}>
                    <div>
                      <h3 style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:15,color:'#fff'}}>{t.asunto}</h3>
                      <p style={{fontSize:12,color:'rgba(255,255,255,0.5)',marginTop:2}}>{t.categoria} · <span style={{color:'#22C55E'}}>{t.clienteNombre}</span></p>
                    </div>
                    <span className="badge-green" style={{background:`${ESTADO_COLOR[t.estado]}22`,color:ESTADO_COLOR[t.estado],border:`1px solid ${ESTADO_COLOR[t.estado]}55`,whiteSpace:'nowrap'}}>{t.estado}</span>
                  </div>
                  {ultimoMensaje&&<p style={{fontSize:13,color:'rgba(255,255,255,0.6)',marginTop:10,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}><strong style={{color:'rgba(255,255,255,0.8)'}}>{ultimoMensaje.rol==='admin'?'Tú':ultimoMensaje.autor}:</strong> {ultimoMensaje.texto}</p>}
                  <p style={{fontSize:11,color:'rgba(255,255,255,0.3)',marginTop:6}}>Actualizado: {formatFecha(t.updatedAt)}</p>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}