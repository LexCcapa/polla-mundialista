"use client";

import { useEffect, useState, CSSProperties } from "react";
import { supabase } from "@/lib/supabase";
import AdminGuard from "@/components/AdminGuard";
import Link from "next/link";

export default function ResultsPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [scores, setScores] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState<any>(null);

  useEffect(() => {
    getMatches();
  }, []);

  async function getMatches() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("matches")
        .select("*")
        .order("match_date", { ascending: true });

      if (error) throw error;
      setMatches(data || []);
    } catch (err) {
      console.error("Error al cargar partidos:", err);
    } finally {
      setLoading(false);
    }
  }

  async function saveResult(matchId: string) {
    const home = scores[matchId]?.home;
    const away = scores[matchId]?.away;

    if (home === undefined || away === undefined || home === "" || away === "") {
      setMessage({ text: "Por favor, ingresa ambos marcadores antes de guardar.", type: "error" });
      return;
    }

    try {
      setSavingId(matchId);
      setMessage(null);

      const { error } = await supabase
        .from("matches")
        .update({
          home_score: parseInt(home, 10),
          away_score: parseInt(away, 10),
          status: "finished",
        })
        .eq("id", matchId);

      if (error) throw error;

      setMessage({ text: "¡Marcador oficial guardado y actualizado con éxito!", type: "success" });
      getMatches();
    } catch (error) {
      console.error(error);
      setMessage({ text: "Hubo un error al conectar con la base de datos.", type: "error" });
    } finally {
      setSavingId(null);
    }
  }

  return (
    <AdminGuard>
      <main style={styles.container}>
        {/* --- ENCABEZADO --- */}
        <header style={styles.header}>
          <div>
            <h1 style={styles.mainTitle}>🏆 Cargar Resultados</h1>
            <p style={styles.subtitle}>Ingresa los marcadores oficiales finales para calcular las puntuaciones globales.</p>
          </div>
          <Link href="/admin" style={styles.backButton}>
            ← Volver al Panel Admin
          </Link>
        </header>

        {/* --- NOTIFICACIONES --- */}
        {message && (
          <div style={{
            ...styles.alert,
            backgroundColor: message.type === "success" ? "#064e3b" : "#7f1d1d",
            border: message.type === "success" ? "1px solid #059669" : "1px solid #ef4444",
            color: message.type === "success" ? "#a7f3d0" : "#fca5a5"
          }}>
            {message.type === "success" ? "✅" : "⚠️"} {message.text}
          </div>
        )}

        {/* --- LISTA DE PARTIDOS --- */}
        {loading ? (
          <p style={styles.infoText}>⚽ Extrayendo partidos programados...</p>
        ) : matches.length === 0 ? (
          <p style={styles.infoText}>No hay partidos cargados en la base de datos.</p>
        ) : (
          <div style={styles.list}>
            {matches.map((match: any) => (
              <div key={match.id} style={styles.matchCard}>
                
                {/* Cabecera interna */}
                <div style={styles.cardHeader}>
                  <span style={styles.stageLabel}>{match.stage || "Fase de Grupos"}</span>
                  <span style={{
                    ...styles.statusTag,
                    backgroundColor: match.status === "finished" ? "#1f2937" : "#1e1b4b",
                    color: match.status === "finished" ? "#9ca3af" : "#818cf8"
                  }}>
                    {match.status === "finished" ? "Finalizado" : "Pendiente"}
                  </span>
                </div>

                {/* Zona del Versus */}
                <div style={styles.vsContainer}>
                  <div style={styles.teamBlock}>
                    <span style={styles.teamName}>{match.team_home}</span>
                  </div>

                  <div style={styles.currentScoreBlock}>
                    <span style={styles.scoreDisplay}>{match.home_score ?? "-"}</span>
                    <span style={styles.vsText}>vs</span>
                    <span style={styles.scoreDisplay}>{match.away_score ?? "-"}</span>
                  </div>

                  <div style={{ ...styles.teamBlock, textAlign: "right" }}>
                    <span style={styles.teamName}>{match.team_away}</span>
                  </div>
                </div>

                {/* Formulario de actualización */}
                <div style={styles.actionRow}>
                  <div style={styles.inputsGroup}>
                    <input
                      type="number"
                      placeholder="Local"
                      min="0"
                      style={styles.scoreInput}
                      onChange={(e) =>
                        setScores({
                          ...scores,
                          [match.id]: {
                            ...scores[match.id],
                            home: e.target.value,
                          },
                        })
                      }
                    />
                    <span style={styles.dash}>-</span>
                    <input
                      type="number"
                      placeholder="Visita"
                      min="0"
                      style={styles.scoreInput}
                      onChange={(e) =>
                        setScores({
                          ...scores,
                          [match.id]: {
                            ...scores[match.id],
                            away: e.target.value,
                          },
                        })
                      }
                    />
                  </div>

                  <button
                    onClick={() => saveResult(match.id)}
                    disabled={savingId === match.id}
                    style={{
                      ...styles.saveButton,
                      backgroundColor: savingId === match.id ? "#1f2937" : "#059669"
                    }}
                  >
                    {savingId === match.id ? "Guardando..." : "Guardar Marcador"}
                  </button>
                </div>

                <div style={styles.dateFooter}>
                  📅 {new Date(match.match_date).toLocaleString("es-PE", { dateStyle: "short", timeStyle: "short" })}
                </div>

              </div>
            ))}
          </div>
        )}
      </main>
    </AdminGuard>
  );
}

// 📌 Aquí es donde se había cortado el archivo; ahora está completo y cerrado correctamente:
const styles: Record<string, CSSProperties> = {
  container: { padding: "40px 20px", fontFamily: "'Segoe UI', Roboto, sans-serif", maxWidth: "800px", margin: "0 auto", backgroundColor: "#0b0f19", minHeight: "100vh", color: "#f8fafc" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "15px", borderBottom: "1px solid #1f2937", paddingBottom: "20px", marginBottom: "30px" },
  mainTitle: { margin: "0 0 6px 0", fontSize: "26px", fontWeight: 800 },
  subtitle: { margin: 0, fontSize: "14px", color: "#9ca3af" },
  backButton: { backgroundColor: "#1f2937", border: "1px solid #374151", color: "#f8fafc", padding: "10px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, textDecoration: "none" },
  alert: { padding: "15px", borderRadius: "10px", fontSize: "14px", fontWeight: 600, marginBottom: "25px" },
  infoText: { textAlign: "center", color: "#6b7280", padding: "30px", fontSize: "14px" },
  list: { display: "flex", flexDirection: "column", gap: "20px" },
  matchCard: { backgroundColor: "#111827", border: "1px solid #1f2937", borderRadius: "14px", padding: "20px", boxShadow: "0 4px 10px rgba(0,0,0,0.2)" },
  cardHeader: { display: "flex", justifyContent: "space-between", marginBottom: "15px" },
  stageLabel: { fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" },
  statusTag: { fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "6px", textTransform: "uppercase" },
  vsContainer: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", margin: "15px 0" },
  teamBlock: { flex: 1 },
  teamName: { fontSize: "15px", fontWeight: 700, color: "#f8fafc" },
  currentScoreBlock: { display: "flex", alignItems: "center", gap: "12px", backgroundColor: "#0b0f19", padding: "6px 16px", borderRadius: "10px", border: "1px solid #1f2937" },
  scoreDisplay: { fontSize: "18px", fontWeight: 800, color: "#38bdf8" },
  vsText: { fontSize: "11px", color: "#4b5563", fontWeight: 700, textTransform: "lowercase" },
  actionRow: { display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "15px", marginTop: "20px", paddingTop: "15px", borderTop: "1px solid #1f2937" },
  inputsGroup: { display: "flex", alignItems: "center", gap: "8px" },
  scoreInput: { backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px", width: "75px", padding: "10px", color: "#fff", fontSize: "14px", textAlign: "center", outline: "none" },
  dash: { color: "#4b5563", fontWeight: 700 },
  saveButton: { color: "#fff", border: "none", borderRadius: "8px", padding: "11px 18px", fontSize: "13px", fontWeight: 700, cursor: "pointer", transition: "background-color 0.2s" },
  dateFooter: { fontSize: "11px", color: "#4b5563", marginTop: "12px", textAlign: "right" }
};