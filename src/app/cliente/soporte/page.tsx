"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  doc,
  addDoc,
  updateDoc,
  query,
  where,
  arrayUnion,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

// ============ TIPOS ============
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

const CATEGORIAS = [
  "Soporte técnico",
  "Duda sobre el proyecto",
  "Solicitud de cambio",
  "Facturación",
  "Otro",
];

const ESTADO_COLOR: Record<string, string> = {
  Abierto: "#2563EB",
  "En proceso": "#F59E0B",
  Resuelto: "#22C55E",
};

// ============ SIDEBAR ============
function Sidebar({ active }: { active: string }) {
  const { logout } = useAuth();
  const router = useRouter();

  const links = [
    { href: "/cliente", label: "Dashboard", icon: "📊" },
    { href: "/cliente/soporte", label: "Soporte", icon: "🎧" },
  ];

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <aside
      style={{
        width: 240,
        position: "fixed",
        top: 0,
        left: 0,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        padding: "24px 16px",
        borderRight: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(5,8,20,0.6)",
        backdropFilter: "blur(20px)",
        zIndex: 50,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 8px", marginBottom: 32 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "linear-gradient(135deg, #1A3A8F, #2563EB)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "Syne, sans-serif",
            fontWeight: 800,
            color: "#fff",
            fontSize: 18,
          }}
        >
          C
        </div>
        <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 18 }}>
          <span style={{ color: "#fff" }}>Crece</span>
          <span style={{ color: "#22C55E" }}>Con</span>
        </span>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
        {links.map((link) => {
          const isActive = active === link.label;
          return (
            <div
              key={link.href}
              onClick={() => router.push(link.href)}
              className="glass-hover"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 14px",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
                cursor: "pointer",
                color: isActive ? "#fff" : "rgba(255,255,255,0.65)",
                background: isActive ? "rgba(34,197,94,0.12)" : "transparent",
                border: isActive ? "1px solid rgba(34,197,94,0.3)" : "1px solid transparent",
                transition: "all 0.2s ease",
              }}
            >
              <span style={{ fontSize: 16 }}>{link.icon}</span>
              {link.label}
            </div>
          );
        })}
      </nav>

      <button
        onClick={handleLogout}
        className="btn-outline"
        style={{ width: "100%", justifyContent: "center", display: "flex", alignItems: "center", gap: 8 }}
      >
        🚪 Cerrar sesión
      </button>
    </aside>
  );
}

// ============ FORMATEAR FECHA ============
function formatFecha(ts: Timestamp | null | undefined) {
  if (!ts || !ts.toDate) return "";
  return ts.toDate().toLocaleString("es-VE", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

// ============ PAGINA PRINCIPAL ============
export default function SoporteClientePage() {
  const { user, firebaseUser, loading } = useAuth();
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [ticketActivo, setTicketActivo] = useState<Ticket | null>(null);
  const [mostrarNuevo, setMostrarNuevo] = useState(false);

  // formulario nuevo ticket
  const [nuevoAsunto, setNuevoAsunto] = useState("");
  const [nuevaCategoria, setNuevaCategoria] = useState(CATEGORIAS[0]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [creando, setCreando] = useState(false);

  // respuesta
  const [respuesta, setRespuesta] = useState("");
  const [enviando, setEnviando] = useState(false);
  const mensajesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && (!user || !firebaseUser)) {
      router.push("/login");
    }
  }, [user, firebaseUser, loading, router]);

  useEffect(() => {
    if (!firebaseUser) return;
    const q = query(
      collection(db, "tickets"),
      where("clienteId", "==", firebaseUser.uid)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const data: Ticket[] = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Ticket[];
        data.sort((a, b) => {
          const ta = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : 0;
          const tb = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : 0;
          return tb - ta;
        });
        setTickets(data);
        setLoadingTickets(false);

        // si hay un ticket activo, sincronizarlo con la nueva data
        if (ticketActivo) {
          const actualizado = data.find((t) => t.id === ticketActivo.id);
          if (actualizado) setTicketActivo(actualizado);
        }
      },
      (err) => {
        console.error("Error leyendo tickets:", err);
        setLoadingTickets(false);
      }
    );
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firebaseUser]);

  useEffect(() => {
    mensajesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticketActivo?.mensajes?.length]);

  const crearTicket = async () => {
    if (!firebaseUser || !nuevoAsunto.trim() || !nuevoMensaje.trim()) return;
    setCreando(true);
    try {
      await addDoc(collection(db, "tickets"), {
        asunto: nuevoAsunto.trim(),
        categoria: nuevaCategoria,
        estado: "Abierto",
        clienteId: firebaseUser.uid,
        clienteNombre: user?.nombre || "Cliente",
        mensajes: [
          {
            autor: user?.nombre || "Cliente",
            rol: "cliente",
            texto: nuevoMensaje.trim(),
            fecha: Timestamp.now(),
          },
        ],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setNuevoAsunto("");
      setNuevoMensaje("");
      setNuevaCategoria(CATEGORIAS[0]);
      setMostrarNuevo(false);
    } catch (err) {
      console.error("Error creando ticket:", err);
      alert("Hubo un error al crear el ticket. Intenta de nuevo.");
    } finally {
      setCreando(false);
    }
  };

  const enviarRespuesta = async () => {
    if (!ticketActivo || !respuesta.trim() || !user) return;
    setEnviando(true);
    try {
      await updateDoc(doc(db, "tickets", ticketActivo.id), {
        mensajes: arrayUnion({
          autor: user.nombre || "Cliente",
          rol: "cliente",
          texto: respuesta.trim(),
          fecha: Timestamp.now(),
        }),
        updatedAt: serverTimestamp(),
        ...(ticketActivo.estado === "Resuelto" ? { estado: "Abierto" } : {}),
      });
      setRespuesta("");
    } catch (err) {
      console.error("Error enviando respuesta:", err);
      alert("Hubo un error al enviar tu mensaje.");
    } finally {
      setEnviando(false);
    }
  };

  if (loading || !user || !firebaseUser) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="spinner" />
      </div>
    );
  }

  // ===================== VISTA DETALLE DE TICKET =====================
  if (ticketActivo) {
    return (
      <div style={{ minHeight: "100vh" }}>
        <Sidebar active="Soporte" />
        <main style={{ marginLeft: 240, padding: 32, display: "flex", flexDirection: "column", height: "100vh" }}>
          <div style={{ marginBottom: 16 }}>
            <div
              onClick={() => setTicketActivo(null)}
              style={{ cursor: "pointer", fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 12, display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              ← Volver a mis tickets
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
              <div>
                <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 22, color: "#fff" }}>
                  {ticketActivo.asunto}
                </h1>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>{ticketActivo.categoria}</p>
              </div>
              <span
                className="badge-green"
                style={{
                  background: `${ESTADO_COLOR[ticketActivo.estado]}22`,
                  color: ESTADO_COLOR[ticketActivo.estado],
                  border: `1px solid ${ESTADO_COLOR[ticketActivo.estado]}55`,
                }}
              >
                {ticketActivo.estado}
              </span>
            </div>
          </div>

          {/* HILO DE MENSAJES */}
          <div
            className="card"
            style={{
              flex: 1,
              overflowY: "auto",
              padding: 20,
              display: "flex",
              flexDirection: "column",
              gap: 12,
              marginBottom: 16,
            }}
          >
            {(ticketActivo.mensajes || []).map((m, i) => {
              const esMio = m.rol === "cliente";
              return (
                <div
                  key={i}
                  style={{
                    alignSelf: esMio ? "flex-end" : "flex-start",
                    maxWidth: "75%",
                    background: esMio ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.05)",
                    border: esMio ? "1px solid rgba(34,197,94,0.25)" : "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 14,
                    padding: "10px 14px",
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 700, color: esMio ? "#22C55E" : "#60A5FA", marginBottom: 4 }}>
                    {esMio ? "Tú" : m.autor || "CreceCon"}
                  </div>
                  <div style={{ fontSize: 14, color: "rgba(255,255,255,0.9)", whiteSpace: "pre-wrap" }}>{m.texto}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 6 }}>{formatFecha(m.fecha)}</div>
                </div>
              );
            })}
            <div ref={mensajesEndRef} />
          </div>

          {/* RESPONDER */}
          {ticketActivo.estado === "Resuelto" && (
            <div style={{ fontSize: 12, color: "#22C55E", marginBottom: 8 }}>
              ✓ Este ticket fue marcado como resuelto. Si respondes, se reabrirá automáticamente.
            </div>
          )}
          <div style={{ display: "flex", gap: 10 }}>
            <input
              type="text"
              className="input-field"
              style={{ flex: 1 }}
              value={respuesta}
              onChange={(e) => setRespuesta(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !enviando) enviarRespuesta();
              }}
              placeholder="Escribe tu mensaje..."
            />
            <button onClick={enviarRespuesta} className="btn-primary" disabled={enviando || !respuesta.trim()}>
              {enviando ? "..." : "Enviar"}
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ===================== VISTA LISTA DE TICKETS =====================
  return (
    <div style={{ minHeight: "100vh" }}>
      <Sidebar active="Soporte" />
      <main style={{ marginLeft: 240, padding: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16, marginBottom: 28 }}>
          <div>
            <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 28, color: "#fff" }}>
              Centro de <span className="gradient-text">Soporte</span>
            </h1>
            <p style={{ color: "rgba(255,255,255,0.5)", marginTop: 4, fontSize: 14 }}>
              Crea un ticket si tienes dudas, problemas o solicitudes sobre tu proyecto.
            </p>
          </div>
          <button onClick={() => setMostrarNuevo(!mostrarNuevo)} className="btn-primary">
            {mostrarNuevo ? "✕ Cancelar" : "+ Nuevo ticket"}
          </button>
        </div>

        {/* FORMULARIO NUEVO TICKET */}
        {mostrarNuevo && (
          <div className="card" style={{ padding: 24, marginBottom: 24, display: "flex", flexDirection: "column", gap: 14 }}>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 16, color: "#fff" }}>Nuevo ticket</h2>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)", display: "block", marginBottom: 6 }}>
                  Asunto
                </label>
                <input
                  type="text"
                  className="input-field"
                  style={{ width: "100%" }}
                  value={nuevoAsunto}
                  onChange={(e) => setNuevoAsunto(e.target.value)}
                  placeholder="Ej: Quiero cambiar el texto de la sección de inicio"
                />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)", display: "block", marginBottom: 6 }}>
                  Categoría
                </label>
                <select
                  className="input-field"
                  style={{ width: "100%" }}
                  value={nuevaCategoria}
                  onChange={(e) => setNuevaCategoria(e.target.value)}
                >
                  {CATEGORIAS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)", display: "block", marginBottom: 6 }}>
                Mensaje
              </label>
              <textarea
                className="input-field"
                style={{ width: "100%", minHeight: 100, resize: "vertical" }}
                value={nuevoMensaje}
                onChange={(e) => setNuevoMensaje(e.target.value)}
                placeholder="Describe tu duda, problema o solicitud con detalle"
              />
            </div>

            <button
              onClick={crearTicket}
              className="btn-primary"
              disabled={creando || !nuevoAsunto.trim() || !nuevoMensaje.trim()}
              style={{ alignSelf: "flex-start" }}
            >
              {creando ? "Creando..." : "Crear ticket"}
            </button>
          </div>
        )}

        {/* LISTA DE TICKETS */}
        {loadingTickets ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
            <div className="spinner" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="card" style={{ padding: 40, textAlign: "center" }}>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>
              No tienes tickets todavía. Crea uno si necesitas ayuda con tu proyecto.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {tickets.map((t) => {
              const ultimoMensaje = t.mensajes?.[t.mensajes.length - 1];
              return (
                <div
                  key={t.id}
                  onClick={() => setTicketActivo(t)}
                  className="card glass-hover"
                  style={{ padding: 18, cursor: "pointer", borderLeft: `3px solid ${ESTADO_COLOR[t.estado] || "#2563EB"}` }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                    <div>
                      <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15, color: "#fff" }}>{t.asunto}</h3>
                      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{t.categoria}</p>
                    </div>
                    <span
                      className="badge-green"
                      style={{
                        background: `${ESTADO_COLOR[t.estado]}22`,
                        color: ESTADO_COLOR[t.estado],
                        border: `1px solid ${ESTADO_COLOR[t.estado]}55`,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {t.estado}
                    </span>
                  </div>
                  {ultimoMensaje && (
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 10, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      <strong style={{ color: "rgba(255,255,255,0.8)" }}>{ultimoMensaje.rol === "cliente" ? "Tú" : ultimoMensaje.autor}:</strong>{" "}
                      {ultimoMensaje.texto}
                    </p>
                  )}
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 6 }}>
                    Actualizado: {formatFecha(t.updatedAt)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}