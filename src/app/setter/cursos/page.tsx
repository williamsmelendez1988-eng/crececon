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
  arrayUnion,
  query,
  orderBy,
} from "firebase/firestore";

// ============ TIPOS ============
interface Curso {
  id: string;
  titulo: string;
  descripcion: string;
  videoUrl: string;
  orden: number;
  activo: boolean;
}

// ============ SIDEBAR ============
function Sidebar({ active }: { active: string }) {
  const { logout } = useAuth();
  const router = useRouter();

  const links = [
    { href: "/setter", label: "Dashboard", icon: "📊" },
    { href: "/setter/cursos", label: "Mis Cursos", icon: "🎓" },
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

// ============ CONVERTIR URL DE YOUTUBE A EMBED ============
function getEmbedUrl(url: string): string {
  try {
    if (url.includes("youtube.com/watch")) {
      const videoId = new URL(url).searchParams.get("v");
      return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1` : url;
    }
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1` : url;
    }
    if (url.includes("vimeo.com/")) {
      const videoId = url.split("vimeo.com/")[1]?.split("?")[0];
      return videoId ? `https://player.vimeo.com/video/${videoId}` : url;
    }
    return url;
  } catch {
    return url;
  }
}

// ============ REPRODUCTOR PROTEGIDO ============
function VideoProtegido({ url }: { url: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const bloquear = (e: Event) => e.preventDefault();
    el.addEventListener("contextmenu", bloquear);
    return () => el.removeEventListener("contextmenu", bloquear);
  }, []);

  return (
    <div
      ref={containerRef}
      onContextMenu={(e) => e.preventDefault()}
      style={{
        position: "relative",
        width: "100%",
        borderRadius: 14,
        overflow: "hidden",
        background: "#000",
        userSelect: "none",
      }}
    >
      <iframe
        src={getEmbedUrl(url)}
        style={{
          width: "100%",
          aspectRatio: "16/9",
          border: "none",
          display: "block",
        }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

// ============ PAGINA PRINCIPAL ============
export default function SetterCursosPage() {
  const { user, firebaseUser, loading } = useAuth();
  const router = useRouter();
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loadingCursos, setLoadingCursos] = useState(true);
  const [cursosCompletados, setCursosCompletados] = useState<string[]>([]);
  const [cursoActivo, setCursoActivo] = useState<Curso | null>(null);
  const [marcando, setMarcando] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.rol !== "setter")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const q = query(collection(db, "cursos"), orderBy("orden", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Curso[];
      setCursos(data.filter((c) => c.activo));
      setLoadingCursos(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!firebaseUser) return;
    const unsub = onSnapshot(doc(db, "usuarios", firebaseUser.uid), (snap) => {
      const data = snap.data();
      setCursosCompletados(data?.cursosCompletados || []);
    });
    return () => unsub();
  }, [firebaseUser]);

  const marcarCompletado = async (cursoId: string) => {
    if (!firebaseUser || cursosCompletados.includes(cursoId)) return;
    setMarcando(true);
    try {
      await updateDoc(doc(db, "usuarios", firebaseUser.uid), {
        cursosCompletados: arrayUnion(cursoId),
      });
    } catch (err) {
      console.error("Error marcando curso:", err);
    } finally {
      setMarcando(false);
    }
  };

  if (loading || !user || user.rol !== "setter") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="spinner" />
      </div>
    );
  }

  // ===================== VISTA REPRODUCTOR =====================
  if (cursoActivo) {
    const completado = cursosCompletados.includes(cursoActivo.id);
    const idx = cursos.findIndex((c) => c.id === cursoActivo.id);
    const siguiente = cursos[idx + 1];
    const puedeAvanzar = completado && siguiente;

    return (
      <div style={{ minHeight: "100vh" }}>
        <Sidebar active="Mis Cursos" />
        <main style={{ marginLeft: 240, padding: 32 }}>
          <div
            onClick={() => setCursoActivo(null)}
            style={{ cursor: "pointer", fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 16, display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            ← Volver a mis cursos
          </div>

          <div style={{ maxWidth: 800 }}>
            <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 24, color: "#fff", marginBottom: 6 }}>
              Módulo {cursoActivo.orden}: {cursoActivo.titulo}
            </h1>
            {cursoActivo.descripcion && (
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", marginBottom: 20 }}>
                {cursoActivo.descripcion}
              </p>
            )}

            <VideoProtegido url={cursoActivo.videoUrl} />

            <div style={{ marginTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              {completado ? (
                <span style={{ fontSize: 14, fontWeight: 700, color: "#22C55E" }}>
                  ✓ Módulo completado
                </span>
              ) : (
                <button
                  onClick={() => marcarCompletado(cursoActivo.id)}
                  className="btn-primary"
                  disabled={marcando}
                >
                  {marcando ? "Guardando..." : "✓ Marcar como completado"}
                </button>
              )}

              {siguiente && (
                <button
                  onClick={() => puedeAvanzar && setCursoActivo(siguiente)}
                  className="btn-outline"
                  disabled={!puedeAvanzar}
                  style={{ opacity: puedeAvanzar ? 1 : 0.4, cursor: puedeAvanzar ? "pointer" : "not-allowed" }}
                >
                  Siguiente módulo →
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ===================== VISTA LISTA =====================
  const totalCompletados = cursosCompletados.filter((id) => cursos.find((c) => c.id === id)).length;
  const porcentaje = cursos.length > 0 ? Math.round((totalCompletados / cursos.length) * 100) : 0;

  return (
    <div style={{ minHeight: "100vh" }}>
      <Sidebar active="Mis Cursos" />

      <main style={{ marginLeft: 240, padding: 32 }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 28, color: "#fff" }}>
            Mis <span className="gradient-text">Cursos</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.5)", marginTop: 4, fontSize: 14 }}>
            Completa cada módulo en orden para desbloquear el siguiente.
          </p>
        </div>

        {cursos.length > 0 && (
          <div className="card" style={{ padding: 20, marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 8 }}>
              <span style={{ color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>Progreso general</span>
              <span style={{ color: "#22C55E", fontWeight: 700 }}>{totalCompletados} / {cursos.length} módulos</span>
            </div>
            <div style={{ height: 10, borderRadius: 10, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${porcentaje}%`,
                  background: "linear-gradient(90deg, #1A3A8F, #22C55E)",
                  borderRadius: 10,
                  transition: "width 0.4s ease",
                }}
              />
            </div>
            <div style={{ textAlign: "right", fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>
              {porcentaje}% completado
            </div>
          </div>
        )}

        {loadingCursos ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
            <div className="spinner" />
          </div>
        ) : cursos.length === 0 ? (
          <div className="card" style={{ padding: 40, textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🎓</div>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>
              Aún no hay módulos disponibles. El equipo de CreceCon los publicará pronto.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {cursos.map((curso, idx) => {
              const completado = cursosCompletados.includes(curso.id);
              const anteriorCompletado = idx === 0 || cursosCompletados.includes(cursos[idx - 1].id);
              const desbloqueado = anteriorCompletado;

              return (
                <div
                  key={curso.id}
                  onClick={() => desbloqueado && setCursoActivo(curso)}
                  className={desbloqueado ? "card glass-hover" : "card"}
                  style={{
                    padding: 20,
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    cursor: desbloqueado ? "pointer" : "not-allowed",
                    opacity: desbloqueado ? 1 : 0.45,
                    borderLeft: `3px solid ${completado ? "#22C55E" : desbloqueado ? "#2563EB" : "rgba(255,255,255,0.08)"}`,
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: completado
                        ? "linear-gradient(135deg, #16A34A, #22C55E)"
                        : desbloqueado
                        ? "linear-gradient(135deg, #1A3A8F, #2563EB)"
                        : "rgba(255,255,255,0.06)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: completado ? 20 : 18,
                      fontFamily: "Syne, sans-serif",
                      fontWeight: 800,
                      color: "#fff",
                      flexShrink: 0,
                    }}
                  >
                    {completado ? "✓" : desbloqueado ? curso.orden : "🔒"}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15, color: "#fff", margin: 0 }}>
                      Módulo {curso.orden}: {curso.titulo}
                    </h3>
                    {curso.descripcion && (
                      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {curso.descripcion}
                      </p>
                    )}
                  </div>

                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: completado ? "#22C55E" : desbloqueado ? "#60A5FA" : "rgba(255,255,255,0.3)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {completado ? "✓ Completado" : desbloqueado ? "▶ Ver módulo" : "🔒 Bloqueado"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}