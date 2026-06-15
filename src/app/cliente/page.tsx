"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import SidebarNav from "@/components/SidebarNav";

const NAV_LINKS = [
  { href: "/cliente", label: "Dashboard", icon: "📊" },
  { href: "/cliente/soporte", label: "Soporte", icon: "🎧" },
];

const FASES = ["Pago", "Onboarding", "Diseño", "Desarrollo", "Lanzamiento", "Escalamiento"];

const FASE_COLOR: Record<string, string> = {
  Pago: "#F59E0B", Onboarding: "#2563EB", Diseño: "#A855F7",
  Desarrollo: "#22C55E", Lanzamiento: "#16A34A", Escalamiento: "#1A3A8F",
};

export default function ClienteDashboard() {
  const { user, firebaseUser, loading } = useAuth();
  const router = useRouter();
  const [datos, setDatos] = useState<any>(null);

  useEffect(() => {
    if (!loading && (!user || user.rol !== "cliente")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!firebaseUser) return;
    const unsub = onSnapshot(doc(db, "usuarios", firebaseUser.uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setDatos(data);
        if (data && !data.onboardingCompleto) {
          router.push("/cliente/onboarding");
        }
      }
    });
    return () => unsub();
  }, [firebaseUser, router]);

  if (loading || !user || user.rol !== "cliente") {
    return <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}><div className="spinner"/></div>;
  }

  const fase = datos?.fase || "Pago";
  const progreso = datos?.progreso || 0;
  const proyectoNombre = datos?.proyectoNombre || "Tu proyecto";
  const faseIndex = FASES.indexOf(fase);

  return (
    <div style={{display:"flex",minHeight:"100vh",background:"#050814"}}>
      <SidebarNav links={NAV_LINKS} active="Dashboard" />

      <style>{`
        @media (max-width: 768px) {
          .cliente-main { margin-left: 0 !important; padding: 80px 16px 32px !important; }
          .fases-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .acciones-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <main className="cliente-main" style={{marginLeft:240,flex:1,padding:32}}>
        <div style={{marginBottom:28}}>
          <h1 style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:26,color:"#fff",marginBottom:4}}>
            Hola, <span className="gradient-text">{datos?.nombre || user.nombre}</span> 👋
          </h1>
          <p style={{color:"rgba(255,255,255,0.5)",fontSize:14}}>{proyectoNombre}</p>
        </div>

        {/* PROGRESO GENERAL */}
        <div className="card" style={{padding:24,marginBottom:20}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:8}}>
            <h2 style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:16,color:"#fff",margin:0}}>Progreso del proyecto</h2>
            <span className="badge-green" style={{background:`${FASE_COLOR[fase]}22`,color:FASE_COLOR[fase],border:`1px solid ${FASE_COLOR[fase]}55`}}>
              Fase actual: {fase}
            </span>
          </div>
          <div style={{marginBottom:8,display:"flex",justifyContent:"space-between",fontSize:13,color:"rgba(255,255,255,0.6)"}}>
            <span>Avance total</span>
            <span style={{color:"#22C55E",fontWeight:700}}>{progreso}%</span>
          </div>
          <div style={{height:12,borderRadius:12,background:"rgba(255,255,255,0.06)",overflow:"hidden",marginBottom:20}}>
            <div style={{height:"100%",width:`${progreso}%`,background:"linear-gradient(90deg,#1A3A8F,#22C55E)",borderRadius:12,transition:"width 0.5s ease"}}/>
          </div>

          {/* FASES */}
          <div className="fases-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
            {FASES.map((f, i) => {
              const completada = i < faseIndex;
              const actual = i === faseIndex;
              const pendiente = i > faseIndex;
              return (
                <div key={f} style={{padding:"12px 14px",borderRadius:12,background:actual?"rgba(34,197,94,0.1)":completada?"rgba(255,255,255,0.04)":"rgba(255,255,255,0.02)",border:actual?"1px solid rgba(34,197,94,0.3)":completada?"1px solid rgba(255,255,255,0.08)":"1px solid rgba(255,255,255,0.04)",opacity:pendiente?0.5:1}}>
                  <div style={{fontSize:18,marginBottom:4}}>{completada?"✅":actual?"🔄":"⏳"}</div>
                  <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:12,color:actual?"#22C55E":completada?"rgba(255,255,255,0.7)":"rgba(255,255,255,0.4)"}}>{f}</div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,0.3)",marginTop:2}}>{completada?"Completada":actual?"En curso":"Pendiente"}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ACCIONES RAPIDAS */}
        <div className="acciones-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <div onClick={()=>router.push("/cliente/soporte")} className="card glass-hover" style={{padding:20,cursor:"pointer"}}>
            <div style={{fontSize:28,marginBottom:10}}>🎧</div>
            <h3 style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:14,color:"#fff",marginBottom:4}}>Centro de Soporte</h3>
            <p style={{fontSize:13,color:"rgba(255,255,255,0.5)"}}>Envía una consulta o revisa tus tickets</p>
          </div>
          <div onClick={()=>router.push("/cliente/onboarding")} className="card glass-hover" style={{padding:20,cursor:"pointer"}}>
            <div style={{fontSize:28,marginBottom:10}}>📋</div>
            <h3 style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:14,color:"#fff",marginBottom:4}}>Ver mi onboarding</h3>
            <p style={{fontSize:13,color:"rgba(255,255,255,0.5)"}}>Revisa la información que enviaste</p>
          </div>
        </div>
      </main>
    </div>
  );
}