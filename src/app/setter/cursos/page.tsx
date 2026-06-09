'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  { href: '/setter', label: 'Mi Panel', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
  { href: '/setter/cursos', label: 'Mi Formación', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg> },
  { href: '/setter/clientes', label: 'Mis Clientes', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg> },
];

function getYoutubeId(url: string) {
  const match = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : null;
}

export default function SetterCursos() {
  const { user } = useAuth();
  const [cursos, setCursos] = useState<any[]>([]);
  const [progreso, setProgreso] = useState<Record<string, boolean>>({});
  const [activeLeccion, setActiveLeccion] = useState<any>(null);
  const [activeCurso, setActiveCurso] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [cursosSnap, progresoSnap] = await Promise.all([
        getDocs(collection(db, 'cursos')),
        getDoc(doc(db, 'progreso', user.uid)),
      ]);
      const cursosData = cursosSnap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter((c: any) => c.activo);
      setCursos(cursosData);
      if (progresoSnap.exists()) {
        setProgreso(progresoSnap.data() as Record<string, boolean>);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const isLeccionDesbloqueada = (curso: any, modIdx: number, lecIdx: number): boolean => {
    if (modIdx === 0 && lecIdx === 0) return true;
    // Check previous lesson completed
    if (lecIdx > 0) {
      const prevId = `${curso.id}_${modIdx}_${lecIdx - 1}`;
      return progreso[prevId] === true;
    }
    // First lesson of next module — check last of previous module
    const prevMod = curso.modulos[modIdx - 1];
    if (!prevMod) return false;
    const prevLecId = `${curso.id}_${modIdx - 1}_${prevMod.lecciones.length - 1}`;
    return progreso[prevLecId] === true;
  };

  const marcarCompletada = async (cursoId: string, modIdx: number, lecIdx: number) => {
    if (!user) return;
    const key = `${cursoId}_${modIdx}_${lecIdx}`;
    const newProgreso = { ...progreso, [key]: true };
    setProgreso(newProgreso);
    await setDoc(doc(db, 'progreso', user.uid), newProgreso, { merge: true });
  };

  const calcCursoProgress = (curso: any) => {
    const total = curso.modulos?.reduce((a: number, m: any) => a + (m.lecciones?.length || 0), 0) || 0;
    const done = curso.modulos?.reduce((a: number, m: any, mi: number) =>
      a + (m.lecciones?.filter((_: any, li: number) => progreso[`${curso.id}_${mi}_${li}`]).length || 0), 0) || 0;
    return total > 0 ? Math.round((done / total) * 100) : 0;
  };

  return (
    <DashboardLayout navItems={navItems} title="Setter" roleColor="#2563EB">
      <div className="space-y-6">
        <div>
          <h1 className="font-syne font-black text-2xl text-white mb-1">Mi Formación</h1>
          <p className="font-dm text-white/40 text-sm">Completa los cursos en orden para desbloquear el siguiente nivel</p>
        </div>

        {activeLeccion && activeCurso ? (
          <div className="space-y-4">
            <button onClick={() => { setActiveLeccion(null); setActiveCurso(null); }}
              className="flex items-center gap-2 text-sm font-dm text-white/40 hover:text-white transition-colors">
              ← Volver a cursos
            </button>
            <div className="card">
              <h2 className="font-syne font-bold text-white text-xl mb-1">{activeLeccion.titulo}</h2>
              <p className="font-dm text-white/40 text-sm mb-4">{activeLeccion.descripcion}</p>

              {/* Video Player */}
              <div className="relative w-full rounded-xl overflow-hidden bg-black mb-4" style={{ paddingTop: '56.25%' }}>
                {getYoutubeId(activeLeccion.videoUrl) ? (
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${getYoutubeId(activeLeccion.videoUrl)}?modestbranding=1&rel=0&showinfo=0`}
                    allowFullScreen
                    title={activeLeccion.titulo}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-white/30 font-dm text-sm">
                    Video no disponible
                  </div>
                )}
              </div>

              <button
                onClick={() => marcarCompletada(activeCurso.id, activeLeccion.modIdx, activeLeccion.lecIdx)}
                className={`btn-primary px-6 py-3 rounded-xl font-syne font-bold text-sm ${
                  progreso[`${activeCurso.id}_${activeLeccion.modIdx}_${activeLeccion.lecIdx}`] ? 'opacity-50 cursor-default' : ''
                }`}
                disabled={progreso[`${activeCurso.id}_${activeLeccion.modIdx}_${activeLeccion.lecIdx}`]}
              >
                {progreso[`${activeCurso.id}_${activeLeccion.modIdx}_${activeLeccion.lecIdx}`] ? '✓ Lección completada' : 'Marcar como completada'}
              </button>
            </div>
          </div>
        ) : loading ? (
          <div className="text-center py-20 text-white/30 font-dm">Cargando cursos...</div>
        ) : cursos.length === 0 ? (
          <div className="card text-center py-16">
            <div className="text-4xl mb-3">📚</div>
            <p className="font-syne font-bold text-white text-lg mb-2">Sin cursos disponibles</p>
            <p className="font-dm text-white/40 text-sm">El administrador agregará cursos pronto</p>
          </div>
        ) : (
          <div className="space-y-6">
            {cursos.map((curso: any) => {
              const pct = calcCursoProgress(curso);
              return (
                <div key={curso.id} className="card space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="font-syne font-bold text-white text-lg mb-1">{curso.titulo}</h2>
                      <p className="font-dm text-white/40 text-sm">{curso.descripcion}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-syne font-black text-xl text-[#22C55E]">{pct}%</div>
                      <div className="text-xs font-dm text-white/30">completado</div>
                    </div>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${pct}%` }} />
                  </div>

                  {curso.modulos?.map((mod: any, mi: number) => (
                    <div key={mi} className="space-y-2">
                      <h3 className="font-syne font-semibold text-white/70 text-sm">Módulo {mi + 1}: {mod.titulo}</h3>
                      {mod.lecciones?.map((lec: any, li: number) => {
                        const key = `${curso.id}_${mi}_${li}`;
                        const desbloqueada = isLeccionDesbloqueada(curso, mi, li);
                        const completada = progreso[key];
                        return (
                          <div key={li}
                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                              completada ? 'border-[#22C55E]/30 bg-[#22C55E]/5' :
                              desbloqueada ? 'border-white/10 bg-white/2 hover:bg-white/4' :
                              'border-white/5 bg-white/1 opacity-40 cursor-not-allowed'
                            }`}
                            onClick={() => {
                              if (desbloqueada) {
                                setActiveLeccion({ ...lec, modIdx: mi, lecIdx: li });
                                setActiveCurso(curso);
                              }
                            }}
                          >
                            <div className={`w-6 h-6 rounded-full border flex items-center justify-center flex-shrink-0 text-xs ${
                              completada ? 'bg-[#22C55E] border-[#22C55E] text-white' :
                              desbloqueada ? 'border-white/20 text-white/40' :
                              'border-white/10 text-white/20'
                            }`}>
                              {completada ? '✓' : desbloqueada ? '▶' : '🔒'}
                            </div>
                            <div className="flex-1">
                              <div className="font-dm text-sm font-medium text-white">{mi + 1}.{li + 1} {lec.titulo}</div>
                              <div className="font-dm text-xs text-white/30">{lec.duracion} min</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
