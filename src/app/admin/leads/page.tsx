"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";

// ============ TIPOS ============
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
  Nuevo: "#2563EB",
  Contactado: "#F59E0B",
  Negociación: "#A855F7",
  Cerrado: "#22C55E",
};

// ============ SIDEBAR ============
function Sidebar({ active }: { active: string }) {
  const { logout } = useAuth();
  const router = useRouter();

  const links = [
    { href: "/admin", label: "Dashboard", icon: "📊" },
    { href: "/admin/clientes", label: "Clientes", icon: "👥" },
    { href: "/admin/proyectos", label: "Proyectos", icon: "📁" },
    { href: "/admin/leads", label: "CRM Leads", icon: "🎯" },
    { href: "/admin/cursos", label: "Cursos LMS", icon: "🎓" },
    { href: "/admin/tickets", label: "Soporte", icon: "🎧" },
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

// ============ MODAL DETALLE LEAD ============
function LeadModal({ lead, onClose, onDelete }: { lead: Lead; onClose: () => void; onDelete: (id: string) => void }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="card"
        style={{ maxWidth: 480, width: "100%", padding: 28 }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 20, color: "#fff" }}>
            {lead.nombre || "Sin nombre"}
          </h3>
          <span
            className="badge-green"
            style={{
              background: `${ESTADO_COLOR[lead.estado]}22`,
              color: ESTADO_COLOR[lead.estado],
              border: `1px solid ${ESTADO_COLOR[lead.estado]}55`,
            }}
          >
            {lead.estado}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 14, color: "rgba(255,255,255,0.8)" }}>
          {lead.email && (
            <div><strong style={{ color: "#fff" }}>Email:</strong> {lead.email}</div>
          )}
          {lead.whatsapp && (
            <div>
              <strong style={{ color: "#fff" }}>WhatsApp:</strong>{" "}
              <span
                onClick={() => window.open(`https://wa.me/${lead.whatsapp!.replace(/\D/g, "")}`, "_blank")}
                style={{ color: "#22C55E", cursor: "pointer", textDecoration: "underline" }}
              >
                {lead.whatsapp}
              </span>
            </div>
          )}
          {lead.empresa && (
            <div><strong style={{ color: "#fff" }}>Empresa:</strong> {lead.empresa}</div>
          )}
          {lead.servicio && (
            <div><strong style={{ color: "#fff" }}>Servicio:</strong> {lead.servicio}</div>
          )}
          {lead.mensaje && (
            <div>
              <strong style={{ color: "#fff" }}>Mensaje:</strong>
              <p style={{ marginTop: 4, color: "rgba(255,255,255,0.65)", lineHeight: 1.6 }}>{lead.mensaje}</p>
            </div>
          )}
          {lead.createdAt && (
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
              Recibido: {lead.createdAt.toDate ? lead.createdAt.toDate().toLocaleString("es-VE") : ""}
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <button
            onClick={() => {
              if (confirm("¿Eliminar este lead permanentemente?")) {
                onDelete(lead.id);
                onClose();
              }
            }}
            className="btn-outline"
            style={{ flex: 1, borderColor: "#EF4444", color: "#EF4444" }}
          >
            🗑️ Eliminar
          </button>
          <button onClick={onClose} className="btn-primary" style={{ flex: 1 }}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

// ============ TARJETA DE LEAD ============
function LeadCard({
  lead,
  onDragStart,
  onClick,
}: {
  lead: Lead;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onClick: () => void;
}) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, lead.id)}
      onClick={onClick}
      className="card glass-hover"
      style={{
        padding: 14,
        marginBottom: 12,
        cursor: "grab",
        borderLeft: `3px solid ${ESTADO_COLOR[lead.estado]}`,
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 14, color: "#fff", marginBottom: 4 }}>
        {lead.nombre || "Sin nombre"}
      </div>
      {lead.empresa && (
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>
          🏢 {lead.empresa}
        </div>
      )}
      {lead.servicio && (
        <div
          style={{
            display: "inline-block",
            fontSize: 11,
            fontWeight: 600,
            color: "#22C55E",
            background: "rgba(34,197,94,0.1)",
            border: "1px solid rgba(34,197,94,0.25)",
            borderRadius: 6,
            padding: "2px 8px",
            marginBottom: 6,
          }}
        >
          {lead.servicio}
        </div>
      )}
      {lead.whatsapp && (
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>📱 {lead.whatsapp}</div>
      )}
      {lead.createdAt?.toDate && (
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 6 }}>
          {lead.createdAt.toDate().toLocaleDateString("es-VE", { day: "2-digit", month: "short" })}
        </div>
      )}
    </div>
  );
}

// ============ PAGINA PRINCIPAL ============
export default function LeadsKanbanPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const draggedIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!loading && (!user || user.rol !== "admin")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const q = query(collection(db, "leads"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const data: Lead[] = snap.docs.map((d) => {
          const raw = d.data();
          return {
            id: d.id,
            ...raw,
            estado: raw.estado || "Nuevo",
          } as Lead;
        });
        setLeads(data);
        setLoadingLeads(false);
      },
      (err) => {
        console.error("Error leyendo leads:", err);
        setLoadingLeads(false);
      }
    );
    return () => unsub();
  }, []);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    draggedIdRef.current = id;
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, estado: string) => {
    e.preventDefault();
    setDragOverCol(estado);
  };

  const handleDragLeave = () => {
    setDragOverCol(null);
  };

  const handleDrop = async (e: React.DragEvent, estado: string) => {
    e.preventDefault();
    setDragOverCol(null);
    const id = draggedIdRef.current;
    if (!id) return;

    const lead = leads.find((l) => l.id === id);
    if (!lead || lead.estado === estado) return;

    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, estado } : l)));

    try {
      await updateDoc(doc(db, "leads", id), { estado });
    } catch (err) {
      console.error("Error actualizando lead:", err);
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, estado: lead.estado } : l)));
      alert("Error al actualizar el estado del lead.");
    }

    draggedIdRef.current = null;
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "leads", id));
    } catch (err) {
      console.error("Error eliminando lead:", err);
      alert("Error al eliminar el lead.");
    }
  };

  if (loading || !user || user.rol !== "admin") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh" }}>
      <Sidebar active="CRM Leads" />

      <main style={{ marginLeft: 240, padding: 32 }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 28, color: "#fff" }}>
            CRM <span className="gradient-text">Leads</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.5)", marginTop: 4, fontSize: 14 }}>
            Arrastra las tarjetas para cambiar el estado de cada lead. Haz clic para ver detalles.
          </p>
        </div>

        {loadingLeads ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
            <div className="spinner" />
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(260px, 1fr))",
              gap: 20,
              overflowX: "auto",
            }}
          >
            {ESTADOS.map((estado) => {
              const columnLeads = leads.filter((l) => l.estado === estado);
              const isOver = dragOverCol === estado;

              return (
                <div
                  key={estado}
                  onDragOver={(e) => handleDragOver(e, estado)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, estado)}
                  style={{
                    borderRadius: 16,
                    padding: 14,
                    minHeight: 400,
                    background: isOver ? "rgba(34,197,94,0.06)" : "rgba(255,255,255,0.02)",
                    border: isOver ? "1px dashed rgba(34,197,94,0.5)" : "1px solid rgba(255,255,255,0.06)",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 14,
                      padding: "0 4px",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "Syne, sans-serif",
                        fontWeight: 700,
                        fontSize: 14,
                        color: ESTADO_COLOR[estado],
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      {estado}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: "rgba(255,255,255,0.6)",
                        background: "rgba(255,255,255,0.06)",
                        borderRadius: 20,
                        padding: "2px 9px",
                      }}
                    >
                      {columnLeads.length}
                    </span>
                  </div>

                  {columnLeads.length === 0 ? (
                    <div
                      style={{
                        fontSize: 13,
                        color: "rgba(255,255,255,0.25)",
                        textAlign: "center",
                        padding: "30px 10px",
                      }}
                    >
                      Sin leads
                    </div>
                  ) : (
                    columnLeads.map((lead) => (
                      <LeadCard
                        key={lead.id}
                        lead={lead}
                        onDragStart={handleDragStart}
                        onClick={() => setSelectedLead(lead)}
                      />
                    ))
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {selectedLead && (
        <LeadModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}