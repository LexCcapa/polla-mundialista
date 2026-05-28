"use client";

import { useEffect, useState, CSSProperties } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface RankingUser {
  user_id: string;
  username: string;
  points: number;
}

interface PredictionRow {
  points: number;
  user_id: string;
}

interface ProfileRow {
  user_id: string;
  username: string;
}

export default function RankingPage() {
  const [ranking, setRanking] = useState<RankingUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    getRanking();
  }, []);

  async function getRanking(): Promise<void> {
    try {
      setLoading(true);

      // 1. Obtener predicciones
      const { data: predictionsData } = await supabase
        .from("predictions")
        .select("points, user_id");

      // 2. Obtener perfiles
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, username");

      if (!predictionsData || !profilesData) return;

      const predictions = predictionsData as PredictionRow[];
      const profiles = profilesData as ProfileRow[];

      // 3. Sumar puntos agrupando por usuario
      const totals: Record<string, number> = {};
      predictions.forEach((prediction) => {
        if (!totals[prediction.user_id]) {
          totals[prediction.user_id] = 0;
        }
        totals[prediction.user_id] += prediction.points || 0;
      });

      // 4. Cruzar con perfiles para armar el array final
      const rankingArray: RankingUser[] = Object.entries(totals).map(
        ([user_id, points]) => {
          const profile = profiles.find((p) => p.user_id === user_id);
          return {
            user_id,
            username: profile?.username || "Hincha Anónimo",
            points,
          };
        }
      );

      // 5. Ordenar de mayor a menor puntuación
      rankingArray.sort((a, b) => b.points - a.points);

      setRanking(rankingArray);
    } catch (error) {
      console.error("Error al calcular el ranking:", error);
    } finally {
      setLoading(false);
    }
  }

  // Función para renderizar el puesto o una medalla
  const renderPosition = (index: number) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `#${index + 1}`;
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <p style={styles.loadingText}>⚽ Calculando posiciones en tiempo real...</p>
      </div>
    );
  }

  return (
    <main style={styles.container}>
      <div style={styles.navBlock}>
        <Link href="/dashboard" style={styles.backLink}>
          ← Volver al Dashboard
        </Link>
      </div>

      {/* Cabecera */}
      <header style={styles.header}>
        <div style={styles.trophyIcon}>🏆</div>
        <h1 style={styles.title}>Tabla de Posiciones</h1>
        <p style={styles.subtitle}>Suma 3 puntos por marcador exacto y 1 por acertar ganador</p>
      </header>

      {/* Contenedor de la Tabla */}
      <div style={styles.tableBox}>
        {ranking.length === 0 ? (
          <p style={styles.noData}>Aún no se han computado puntos en este torneo.</p>
        ) : (
          <div style={styles.tableResponsive}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.theadRow}>
                  <th style={{ ...styles.th, width: "80px", textAlign: "center" }}>Puesto</th>
                  <th style={styles.th}>Participante</th>
                  <th style={{ ...styles.th, width: "120px", textAlign: "right" }}>Puntos</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((user, index) => {
                  const isTopThree = index < 3;
                  return (
                    <tr key={user.user_id} style={styles.tbodyRow}>
                      {/* Puesto */}
                      <td style={{ 
                        ...styles.td, 
                        textAlign: "center", 
                        fontSize: isTopThree ? "20px" : "14px",
                        fontWeight: isTopThree ? "bold" : "500"
                      }}>
                        {renderPosition(index)}
                      </td>
                      
                      {/* Nombre de Usuario */}
                      <td style={{ ...styles.td, fontWeight: index === 0 ? 800 : 600 }}>
                        <span style={{ color: index === 0 ? "#fbbf24" : "#f8fafc" }}>
                          {user.username}
                        </span>
                        {index === 0 && <span style={styles.leaderBadge}>LÍDER</span>}
                      </td>
                      
                      {/* Puntos acumulados */}
                      <td style={{ 
                        ...styles.td, 
                        textAlign: "right", 
                        fontWeight: 800, 
                        color: isTopThree ? "#10b981" : "#f8fafc",
                        fontSize: "16px"
                      }}>
                        {user.points} <span style={styles.ptsLabel}>pts</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

// 📌 Estilos Premium Black con CSSProperties estrictos (0 errores de compilación)
const styles: Record<string, CSSProperties> = {
  container: { padding: "40px 20px", fontFamily: "'Segoe UI', Roboto, sans-serif", maxWidth: "800px", margin: "0 auto", backgroundColor: "#0b0f19", minHeight: "100vh", color: "#f8fafc" },
  loadingContainer: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", backgroundColor: "#0b0f19" },
  loadingText: { color: "#9ca3af", fontSize: "14px", fontWeight: 600 },
  navBlock: { marginBottom: "20px" },
  backLink: { color: "#64748b", textDecoration: "none", fontWeight: 600, fontSize: "14px" },
  header: { textAlign: "center", marginBottom: "35px" },
  trophyIcon: { fontSize: "45px", marginBottom: "10px" },
  title: { fontSize: "28px", fontWeight: 800, margin: "0 0 6px 0", color: "#f8fafc" },
  subtitle: { fontSize: "13px", color: "#9ca3af", margin: 0 },
  tableBox: { backgroundColor: "#111827", border: "1px solid #1f2937", borderRadius: "16px", padding: "20px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)" },
  noData: { textAlign: "center", color: "#6b7280", padding: "30px", fontSize: "14px" },
  tableResponsive: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
  theadRow: { borderBottom: "2px solid #1f2937" },
  th: { padding: "12px 16px", color: "#64748b", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" },
  tbodyRow: { borderBottom: "1px solid #1f2937" },
  td: { padding: "16px", color: "#f8fafc", fontSize: "14px", verticalAlign: "middle" },
  leaderBadge: { marginLeft: "10px", backgroundColor: "#2e251a", color: "#fbbf24", border: "1px solid #d97706", fontSize: "10px", fontWeight: 800, padding: "2px 6px", borderRadius: "4px", letterSpacing: "0.5px" },
  ptsLabel: { fontSize: "11px", color: "#64748b", fontWeight: 500 },
};