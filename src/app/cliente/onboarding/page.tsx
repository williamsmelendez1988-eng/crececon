"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

// ============ CATALOGOS ============
const RUBROS = [
  "Inmuebles",
  "Carwash / Lavado de autos",
  "Construcción / Remodelación",
  "Servicios profesionales",
  "Restaurante / Comida",
  "Belleza y estética",
  "Tienda / Retail",
  "Salud",
  "Educación",
  "Otro",
];

const REDES = ["Instagram", "Facebook", "TikTok"];

const SERVICIOS = [
  { id: "web", label: "Página web", desc: "Sitio web completo para tu negocio" },
  { id: "app", label: "Aplicación móvil", desc: "App para Android/iOS" },
  { id: "meta_ads", label: "Campañas en Meta Ads", desc: "Anuncios en Facebook e Instagram" },
  { id: "google_ads", label: "Campañas en Google Ads", desc: "Anuncios en buscador de Google" },
  { id: "seo", label: "SEO / Posicionamiento en Google", desc: "Aparecer en los primeros resultados" },
  { id: "diseno", label: "Diseño gráfico", desc: "Flyers, posts, branding, material visual" },
  { id: "video", label: "Producción de video", desc: "Videos promocionales o para redes" },
  { id: "redes_mensual", label: "Gestión mensual de redes sociales", desc: "Contenido y publicaciones recurrentes" },
];

const OBJETIVOS = [
  "Conseguir más clientes",
  "Agendar citas en línea",
  "Vender productos online",
  "Posicionarme en Google",
  "Mejorar mi imagen de marca",
  "Automatizar procesos del negocio",
  "Otro",
];

const TOTAL_PASOS = 5;

// ============ TIPO DE DATOS ============
interface OnboardingData {
  nombreCliente: string;
  nombreEmpresa: string;
  empresaPorCrear: boolean;
  rubro: string;
  rubroOtro: string;
  descripcionNegocio: string;
  ubicacion: string;
  horario: string;
  sinHorarioFijo: boolean;
  whatsappEmpresa: string;
  whatsappCliente: string;
  redesActuales: Record<string, string>;
  redesPorCrear: string[];
  emailContacto: string;
  correosPorCrear: string;
  servicios: string[];
  servicioOtro: string;
  logoEstado: "tiene" | "crear" | "";
  coloresMarca: string;
  coloresSugerencia: boolean;
  referencia1: string;
  referencia2: string;
  fotosDisponibles: boolean;
  objetivos: string[];
  objetivoOtro: string;
  sitioWebActual: string;
  notasAdicionales: string;
  dejarEnManosCreceCon: boolean;
}

const DATA_INICIAL: OnboardingData = {
  nombreCliente: "",
  nombreEmpresa: "",
  empresaPorCrear: false,
  rubro: "",
  rubroOtro: "",
  descripcionNegocio: "",
  ubicacion: "",
  horario: "",
  sinHorarioFijo: false,
  whatsappEmpresa: "",
  whatsappCliente: "",
  redesActuales: {},
  redesPorCrear: [],
  emailContacto: "",
  correosPorCrear: "",
  servicios: [],
  servicioOtro: "",
  logoEstado: "",
  coloresMarca: "",
  coloresSugerencia: false,
  referencia1: "",
  referencia2: "",
  fotosDisponibles: false,
  objetivos: [],
  objetivoOtro: "",
  sitioWebActual: "",
  notasAdicionales: "",
  dejarEnManosCreceCon: false,
};

// ============ COMPONENTES AUXILIARES ============
function Label({ children, optional }: { children: React.ReactNode; optional?: boolean }) {
  return (
    <label style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.85)", display: "block", marginBottom: 8 }}>
      {children}{" "}
      {optional && (
        <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.35)" }}>(opcional)</span>
      )}
    </label>
  );
}

function CheckboxRow({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
  label: string;
}) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "rgba(255,255,255,0.7)", cursor: "pointer", marginTop: 6 }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ width: 16, height: 16, accentColor: "#22C55E" }}
      />
      {label}
    </label>
  );
}

// ============ PAGINA PRINCIPAL ============
export default function OnboardingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [paso, setPaso] = useState(1);
  const [data, setData] = useState<OnboardingData>(DATA_INICIAL);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const update = (campo: keyof OnboardingData, valor: any) => {
    setData((prev) => ({ ...prev, [campo]: valor }));
  };

  const toggleEnArray = (campo: "servicios" | "objetivos" | "redesPorCrear", valor: string) => {
    setData((prev) => {
      const arr = prev[campo] as string[];
      const nuevo = arr.includes(valor) ? arr.filter((v) => v !== valor) : [...arr, valor];
      return { ...prev, [campo]: nuevo };
    });
  };

  const updateRedActual = (red: string, valor: string) => {
    setData((prev) => ({ ...prev, redesActuales: { ...prev.redesActuales, [red]: valor } }));
  };

  const siguiente = () => {
    setError("");
    if (paso === 1) {
      if (!data.nombreCliente.trim()) {
        setError("Por favor ingresa tu nombre.");
        return;
      }
      if (!data.empresaPorCrear && !data.nombreEmpresa.trim()) {
        setError("Ingresa el nombre de tu empresa o marca la opción de que te ayudemos a crearlo.");
        return;
      }
      if (!data.rubro) {
        setError("Selecciona el rubro o categoría de tu negocio.");
        return;
      }
    }
    if (paso === 3 && data.servicios.length === 0 && !data.servicioOtro.trim()) {
      setError("Selecciona al menos un servicio que necesites, o descríbelo en 'Otro'.");
      return;
    }
    setPaso((p) => Math.min(p + 1, TOTAL_PASOS));
  };

  const anterior = () => {
    setError("");
    setPaso((p) => Math.max(p - 1, 1));
  };

  const finalizar = async () => {
    if (!user) return;
    setGuardando(true);
    setError("");
    try {
      await updateDoc(doc(db, "usuarios", user.uid), {
        onboarding: data,
        onboardingCompleto: true,
      });
      router.push("/cliente");
    } catch (err) {
      console.error("Error guardando onboarding:", err);
      setError("Hubo un error al guardar la información. Intenta de nuevo.");
    } finally {
      setGuardando(false);
    }
  };

  if (loading || !user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="bg-gradient-mesh grid-pattern" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 16px" }}>
      <div className="card" style={{ maxWidth: 640, width: "100%", padding: "36px 32px" }}>
        {/* HEADER */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 26, color: "#fff", marginBottom: 6 }}>
            Cuéntanos sobre tu <span className="gradient-text">negocio</span>
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>
            Esta información nos ayuda a empezar tu proyecto con todo lo necesario. Las preguntas marcadas como
            opcionales puedes dejarlas en manos de nuestro equipo.
          </p>
        </div>

        {/* PROGRESO */}
        <div style={{ display: "flex", gap: 6, marginBottom: 32 }}>
          {Array.from({ length: TOTAL_PASOS }).map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 6,
                borderRadius: 6,
                background: i + 1 <= paso ? "linear-gradient(90deg, #1A3A8F, #22C55E)" : "rgba(255,255,255,0.08)",
                transition: "background 0.3s ease",
              }}
            />
          ))}
        </div>

        {/* ===================== PASO 1 ===================== */}
        {paso === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 18, color: "#fff" }}>
              1. Tú y tu empresa
            </h2>

            <div>
              <Label>Tu nombre completo</Label>
              <input
                type="text"
                className="input-field"
                style={{ width: "100%" }}
                value={data.nombreCliente}
                onChange={(e) => update("nombreCliente", e.target.value)}
                placeholder="Ej: Juan Pérez"
              />
            </div>

            <div>
              <Label>Nombre de tu empresa o marca</Label>
              <input
                type="text"
                className="input-field"
                style={{ width: "100%" }}
                value={data.nombreEmpresa}
                onChange={(e) => update("nombreEmpresa", e.target.value)}
                placeholder="Ej: Inmuebles Lara"
                disabled={data.empresaPorCrear}
              />
              <CheckboxRow
                checked={data.empresaPorCrear}
                onChange={(v) => update("empresaPorCrear", v)}
                label="Aún no tengo nombre definido, que CreceCon me ayude a crear uno"
              />
            </div>

            <div>
              <Label>Rubro o categoría de tu negocio</Label>
              <select
                className="input-field"
                style={{ width: "100%" }}
                value={data.rubro}
                onChange={(e) => update("rubro", e.target.value)}
              >
                <option value="">Selecciona una opción</option>
                {RUBROS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              {data.rubro === "Otro" && (
                <input
                  type="text"
                  className="input-field"
                  style={{ width: "100%", marginTop: 8 }}
                  value={data.rubroOtro}
                  onChange={(e) => update("rubroOtro", e.target.value)}
                  placeholder="Especifica el rubro"
                />
              )}
            </div>

            <div>
              <Label optional>Descripción breve de tu negocio</Label>
              <textarea
                className="input-field"
                style={{ width: "100%", minHeight: 90, resize: "vertical" }}
                value={data.descripcionNegocio}
                onChange={(e) => update("descripcionNegocio", e.target.value)}
                placeholder="¿A qué se dedica tu negocio? ¿Qué lo hace especial?"
              />
            </div>

            <div>
              <Label optional>Ubicación</Label>
              <input
                type="text"
                className="input-field"
                style={{ width: "100%" }}
                value={data.ubicacion}
                onChange={(e) => update("ubicacion", e.target.value)}
                placeholder="Ciudad, dirección o zona"
              />
            </div>

            <div>
              <Label optional>Horario de atención</Label>
              <input
                type="text"
                className="input-field"
                style={{ width: "100%" }}
                value={data.horario}
                onChange={(e) => update("horario", e.target.value)}
                placeholder="Ej: Lunes a sábado, 8am - 6pm"
                disabled={data.sinHorarioFijo}
              />
              <CheckboxRow
                checked={data.sinHorarioFijo}
                onChange={(v) => update("sinHorarioFijo", v)}
                label="No tengo un horario fijo / no aplica"
              />
            </div>
          </div>
        )}

        {/* ===================== PASO 2 ===================== */}
        {paso === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 18, color: "#fff" }}>
              2. Contacto y redes sociales
            </h2>

            <div>
              <Label>WhatsApp de la empresa</Label>
              <input
                type="text"
                className="input-field"
                style={{ width: "100%" }}
                value={data.whatsappEmpresa}
                onChange={(e) => update("whatsappEmpresa", e.target.value)}
                placeholder="Ej: +58 412 0000000"
              />
            </div>

            <div>
              <Label>Tu WhatsApp personal (para coordinar el proyecto)</Label>
              <input
                type="text"
                className="input-field"
                style={{ width: "100%" }}
                value={data.whatsappCliente}
                onChange={(e) => update("whatsappCliente", e.target.value)}
                placeholder="Ej: +58 412 0000000"
              />
            </div>

            <div>
              <Label optional>Redes sociales actuales (deja vacío si no tienes)</Label>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {REDES.map((red) => (
                  <input
                    key={red}
                    type="text"
                    className="input-field"
                    style={{ width: "100%" }}
                    value={data.redesActuales[red] || ""}
                    onChange={(e) => updateRedActual(red, e.target.value)}
                    placeholder={`${red} (link o @usuario)`}
                  />
                ))}
              </div>
              <div style={{ marginTop: 10 }}>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
                  ¿Quieres que te creemos alguna red social nueva?
                </span>
                <div style={{ display: "flex", gap: 16, marginTop: 4, flexWrap: "wrap" }}>
                  {REDES.map((red) => (
                    <CheckboxRow
                      key={red}
                      checked={data.redesPorCrear.includes(red)}
                      onChange={() => toggleEnArray("redesPorCrear", red)}
                      label={red}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div>
              <Label optional>Email de contacto actual</Label>
              <input
                type="email"
                className="input-field"
                style={{ width: "100%" }}
                value={data.emailContacto}
                onChange={(e) => update("emailContacto", e.target.value)}
                placeholder="correo@ejemplo.com"
              />
            </div>

            <div>
              <Label optional>
                ¿Quieres que te creemos correos profesionales? (Ej: admin@tuempresa.com)
              </Label>
              <input
                type="text"
                className="input-field"
                style={{ width: "100%" }}
                value={data.correosPorCrear}
                onChange={(e) => update("correosPorCrear", e.target.value)}
                placeholder="Ej: admin@, ventas@, soporte@..."
              />
            </div>
          </div>
        )}

        {/* ===================== PASO 3 ===================== */}
        {paso === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 18, color: "#fff" }}>
              3. ¿Qué servicios necesitas?
            </h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: -8 }}>
              Selecciona todo lo que aplique. Puede ser solo uno o varios.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {SERVICIOS.map((s) => {
                const selected = data.servicios.includes(s.id);
                return (
                  <div
                    key={s.id}
                    onClick={() => toggleEnArray("servicios", s.id)}
                    className="glass-hover"
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                      padding: 14,
                      borderRadius: 12,
                      cursor: "pointer",
                      border: selected ? "1px solid rgba(34,197,94,0.4)" : "1px solid rgba(255,255,255,0.06)",
                      background: selected ? "rgba(34,197,94,0.08)" : "rgba(255,255,255,0.02)",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleEnArray("servicios", s.id)}
                      style={{ width: 18, height: 18, marginTop: 2, accentColor: "#22C55E" }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#fff" }}>{s.label}</div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{s.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div>
              <Label optional>¿Algo más que necesites y no esté en la lista?</Label>
              <textarea
                className="input-field"
                style={{ width: "100%", minHeight: 70, resize: "vertical" }}
                value={data.servicioOtro}
                onChange={(e) => update("servicioOtro", e.target.value)}
                placeholder="Describe el servicio que necesitas"
              />
            </div>
          </div>
        )}

        {/* ===================== PASO 4 ===================== */}
        {paso === 4 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 18, color: "#fff" }}>
              4. Branding
            </h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: -8 }}>
              Si no tienes algo definido, no te preocupes — nuestro equipo lo crea por ti.
            </p>

            <div>
              <Label optional>Logo de tu negocio</Label>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <CheckboxRow
                  checked={data.logoEstado === "tiene"}
                  onChange={() => update("logoEstado", data.logoEstado === "tiene" ? "" : "tiene")}
                  label="Ya tengo un logo (lo enviaré por WhatsApp)"
                />
                <CheckboxRow
                  checked={data.logoEstado === "crear"}
                  onChange={() => update("logoEstado", data.logoEstado === "crear" ? "" : "crear")}
                  label="No tengo logo, que el equipo de CreceCon me cree uno"
                />
              </div>
            </div>

            <div>
              <Label optional>Colores de tu marca</Label>
              <input
                type="text"
                className="input-field"
                style={{ width: "100%" }}
                value={data.coloresMarca}
                onChange={(e) => update("coloresMarca", e.target.value)}
                placeholder="Ej: Azul y dorado"
                disabled={data.coloresSugerencia}
              />
              <CheckboxRow
                checked={data.coloresSugerencia}
                onChange={(v) => update("coloresSugerencia", v)}
                label="No tengo preferencia, que nuestros especialistas sugieran los colores"
              />
            </div>

            <div>
              <Label optional>1-2 sitios web que te gusten como referencia de estilo</Label>
              <input
                type="text"
                className="input-field"
                style={{ width: "100%", marginBottom: 8 }}
                value={data.referencia1}
                onChange={(e) => update("referencia1", e.target.value)}
                placeholder="Link de referencia 1"
              />
              <input
                type="text"
                className="input-field"
                style={{ width: "100%" }}
                value={data.referencia2}
                onChange={(e) => update("referencia2", e.target.value)}
                placeholder="Link de referencia 2"
              />
            </div>

            <div>
              <CheckboxRow
                checked={data.fotosDisponibles}
                onChange={(v) => update("fotosDisponibles", v)}
                label="Tengo fotos de mi negocio/productos para enviar por WhatsApp o correo"
              />
            </div>
          </div>
        )}

        {/* ===================== PASO 5 ===================== */}
        {paso === 5 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 18, color: "#fff" }}>
              5. Objetivos y notas finales
            </h2>

            <div>
              <Label optional>¿Qué quieres lograr con tu proyecto?</Label>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {OBJETIVOS.map((o) => (
                  <CheckboxRow
                    key={o}
                    checked={data.objetivos.includes(o)}
                    onChange={() => toggleEnArray("objetivos", o)}
                    label={o}
                  />
                ))}
              </div>
              {data.objetivos.includes("Otro") && (
                <input
                  type="text"
                  className="input-field"
                  style={{ width: "100%", marginTop: 8 }}
                  value={data.objetivoOtro}
                  onChange={(e) => update("objetivoOtro", e.target.value)}
                  placeholder="Especifica tu objetivo"
                />
              )}
            </div>

            <div>
              <Label optional>Sitio web actual (si tienes)</Label>
              <input
                type="text"
                className="input-field"
                style={{ width: "100%" }}
                value={data.sitioWebActual}
                onChange={(e) => update("sitioWebActual", e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div>
              <Label optional>Notas adicionales o detalles específicos</Label>
              <textarea
                className="input-field"
                style={{ width: "100%", minHeight: 90, resize: "vertical" }}
                value={data.notasAdicionales}
                onChange={(e) => update("notasAdicionales", e.target.value)}
                placeholder="Cualquier detalle adicional sobre tu proyecto"
              />
            </div>

            <div
              className="card"
              style={{ padding: 16, background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.25)" }}
            >
              <CheckboxRow
                checked={data.dejarEnManosCreceCon}
                onChange={(v) => update("dejarEnManosCreceCon", v)}
                label="Confío en el criterio del equipo de CreceCon para las decisiones de diseño y estrategia que no especifiqué"
              />
            </div>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div
            style={{
              marginTop: 16,
              padding: "10px 14px",
              borderRadius: 10,
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              color: "#FCA5A5",
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        {/* NAVEGACION */}
        <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
          {paso > 1 && (
            <button onClick={anterior} className="btn-outline" style={{ flex: 1 }} disabled={guardando}>
              ← Atrás
            </button>
          )}
          {paso < TOTAL_PASOS ? (
            <button onClick={siguiente} className="btn-primary" style={{ flex: 1 }}>
              Siguiente →
            </button>
          ) : (
            <button onClick={finalizar} className="btn-primary" style={{ flex: 1 }} disabled={guardando}>
              {guardando ? "Guardando..." : "✓ Finalizar onboarding"}
            </button>
          )}
        </div>

        <div style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
          Paso {paso} de {TOTAL_PASOS}
        </div>
      </div>
    </div>
  );
}