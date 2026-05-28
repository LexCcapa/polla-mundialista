"use client";

import { useEffect, useState, CSSProperties } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface Match {
  id: string;
  team_home: string;
  team_away: string;
  match_date: string;
  stage: string;
  status: string;
}

interface Prediction {
  match_id: string;
  predicted_home_score: number;
  predicted_away_score: number;
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Record<string, Prediction>>({});
  const [savedMatchIds, setSavedMatchIds] = useState<Set<string>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  useEffect(() => {
    fetchMatchesAndPredictions();
  }, []);

  async function fetchMatchesAndPredictions() {
    try {
      setLoading(true);

      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      if (!user) return;
      setUserId(user.id);

      const { data: matchesData } = await supabase
        .from("matches")
        .select("*")
        .order("match_date", { ascending: true });

      const { data: predictionsData } = await supabase
        .from("predictions")
        .select("match_id, predicted_home_score, predicted_away_score")
        .eq("user_id", user.id);

      if (matchesData) setMatches(matchesData as Match[]);

      if (predictionsData) {
        const predMap: Record<string, Prediction> = {};
        const savedSet = new Set<string>();
        
        predictionsData.forEach((p: any) => {
          predMap[p.match_id] = {
            match_id: p.match_id,
            predicted_home_score: p.predicted_home_score,
            predicted_away_score: p.predicted_away_score
          };
          savedSet.add(p.match_id);
        });

        setPredictions(predMap);
        setSavedMatchIds(savedSet);
      }
    } catch (error) {
      console.error("Error al cargar partidos y apuestas:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleScoreChange = (matchId: string, side: "home" | "away", value: string) => {
    const numValue = value === "" ? 0 : parseInt(value, 10);
    setPredictions((prev) => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        match_id: matchId,
        predicted_home_score: side === "home" ? numValue : (prev[matchId]?.predicted_home_score ?? 0),
        predicted_away_score: side === "away" ? numValue : (prev[matchId]?.predicted_away_score ?? 0),
      },
    }));
  };

  async function savePrediction(matchId: string) {
    if (!userId || submittingId) return;

    const currentPred = predictions[matchId];
    const homeScore = currentPred?.predicted_home_score ?? 0;
    const awayScore = currentPred?.predicted_away_score ?? 0;

    setSubmittingId(matchId);

    try {
      const { error } = await supabase.from("predictions").insert([
        {
          id: window.crypto.randomUUID(),
          user_id: userId,
          match_id: matchId,
          predicted_home_score: homeScore,
          predicted_away_score: awayScore,
          points: 0,
        },
      ]);

      if (error) throw error;

      setSavedMatchIds((prev) => {
        const next = new Set(prev);
        next.add(matchId);
        return next;
      });

      alert("🎉 Pronóstico registrado con éxito. ¡Marcador congelado!");
    } catch (error: any) {
      alert("❌ Error al guardar pronóstico: " + (error.message || error));
    } finally {
      setSubmittingId(null);
    }
  }

  const getMatchTimingStatus = (matchDateString: string) => {
    const matchDate = new Date(matchDateString).getTime();
    const now = new Date().getTime();
    
    const doceHorasEnMs = 12 * 60 * 60 * 1000;
    const tiempoLimite = matchDate - doceHorasEnMs;
    const esBloqueadoPorTiempo = now >= tiempoLimite;

    const fechaLimiteStr = new Date(tiempoLimite).toLocaleString("es-PE", {
      dateStyle: "short",
      timeStyle: "short",
    });

    return {
      isLocked: esBloqueadoPorTiempo,
      deadlineMessage: `Cierre: ${fechaLimiteStr}`,
    };
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <p style={styles.loadingText}>⚽ Desplegando fixture deportivo oficial...</p>
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

      <header style={styles.header}>
        <span style={styles.headerIcon}>📝</span>
        <h1 style={styles.title}>Registrar Pronósticos</h1>
        <p style={styles.subtitle}>
          Ingresa tus apuestas. Los marcadores se bloquean al guardar o automáticamente 12 horas antes del partido.
        </p>
      </header>

      <section style={styles.list}>
        {matches.map((match) => {
          const isSaved = savedMatchIds.has(match.id);
          const timing = getMatchTimingStatus(match.match_date);
          const isInputDisabled = isSaved || timing.isLocked || match.status === "finished";

          const currentPred = predictions[match.id];
          
          // 🔥 AQUÍ ESTÁ EL CAMBIO CRUCIAL: Controlamos los valores nulos con un string vacío si no existe el pronóstico
          const displayHome = currentPred !== undefined ? currentPred.predicted_home_score : "";
          const displayAway = currentPred !== undefined ? currentPred.predicted_away_score : "";

          return (
            <div key={match.id} style={{
              ...styles.matchCard,
              border: isSaved ? "1px solid #10b981" : timing.isLocked ? "1px solid #7f1d1d" : "1px solid #1f2937"
            }}>
              <div style={styles.matchHeader}>
                <span style={styles.stageTag}>{match.stage}</span>
                <span style={{
                  ...styles.timerText,
                  color: timing.isLocked ? "#ef4444" : "#10b981"
                }}>
                  {timing.isLocked ? "🔒 Registro Cerrado" : `⏰ ${timing.deadlineMessage}`}
                </span>
              </div>

              <div style={styles.fixtureRow}>
                <div style={styles.teamBlock}>
                  <p style={styles.teamName}>{match.team_home}</p>
                </div>

                <div style={styles.scoreArea}>
                  <input
                    type="number"
                    min="0"
                    disabled={isInputDisabled}
                    value={displayHome}
                    onChange={(e) => handleScoreChange(match.id, "home", e.target.value)}
                    style={{
                      ...styles.scoreInput,
                      backgroundColor: isInputDisabled ? "#111827" : "#1f2937",
                      color: isInputDisabled ? "#10b981" : "#f8fafc", // Pone el texto en verde brillante si está guardado/bloqueado
                      fontWeight: 800
                    }}
                  />
                  
                  <span style={styles.vsText}>X</span>

                  <input
                    type="number"
                    min="0"
                    disabled={isInputDisabled}
                    value={displayAway}
                    onChange={(e) => handleScoreChange(match.id, "away", e.target.value)}
                    style={{
                      ...styles.scoreInput,
                      backgroundColor: isInputDisabled ? "#111827" : "#1f2937",
                      color: isInputDisabled ? "#10b981" : "#f8fafc",
                      fontWeight: 800
                    }}
                  />
                </div>

                <div style={{ ...styles.teamBlock, textAlign: "right" }}>
                  <p style={styles.teamName}>{match.team_away}</p>
                </div>
              </div>

              <div style={styles.cardFooter}>
                <p style={styles.matchTimeLabel}>
                  🗓️ Juego: {new Date(match.match_date).toLocaleString("es-PE", { dateStyle: "short", timeStyle: "short" })}
                </p>

                {isSaved ? (
                  <span style={styles.statusBadgeSaved}>💾 Pronóstico Registrado</span>
                ) : timing.isLocked ? (
                  <span style={styles.statusBadgeLocked}>🚫 Tiempo Agotado</span>
                ) : (
                  <button
                    onClick={() => savePrediction(match.id)}
                    disabled={submittingId === match.id}
                    style={styles.saveButton}
                  >
                    {submittingId === match.id ? "Guardando..." : "🔒 Congelar Marcador"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </section>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  container: { padding: "40px 20px", fontFamily: "'Segoe UI', Roboto, sans-serif", maxWidth: "750px", margin: "0 auto", backgroundColor: "#0b0f19", minHeight: "100vh", color: "#f8fafc" },
  loadingContainer: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", backgroundColor: "#0b0f19" },
  loadingText: { color: "#9ca3af", fontSize: "14px", fontWeight: 600 },
  navBlock: { marginBottom: "20px" },
  backLink: { color: "#64748b", textDecoration: "none", fontWeight: 600, fontSize: "14px" },
  header: { textAlign: "center", marginBottom: "40px" },
  headerIcon: { fontSize: "40px", display: "block", marginBottom: "10px" },
  title: { fontSize: "26px", fontWeight: 800, margin: "0 0 8px 0" },
  subtitle: { fontSize: "13px", color: "#9ca3af", lineHeight: "1.5", maxWidth: "550px", margin: "0 auto" },
  list: { display: "flex", flexDirection: "column", gap: "20px" },
  matchCard: { backgroundColor: "#111827", borderRadius: "14px", padding: "20px", boxShadow: "0 4px 15px rgba(0,0,0,0.2)" },
  matchHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #1f2937", paddingBottom: "10px", marginBottom: "15px" },
  stageTag: { fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" },
  timerText: { fontSize: "12px", fontWeight: 700 },
  fixtureRow: { display: "flex", justifyContent: "space-between", alignItems: "center", margin: "15px 0" },
  teamBlock: { flex: 1.2 },
  teamName: { fontSize: "15px", fontWeight: 700, margin: 0 },
  scoreArea: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" },
  scoreInput: { width: "45px", height: "42px", borderRadius: "8px", border: "1px solid #374151", textAlign: "center", fontSize: "16px", outline: "none" },
  vsText: { fontSize: "12px", color: "#4b5563", fontWeight: 700 },
  cardFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "15px", borderTop: "1px solid #1f2937", paddingTop: "12px" },
  matchTimeLabel: { fontSize: "12px", color: "#6b7280", margin: 0 },
  saveButton: { padding: "8px 16px", backgroundColor: "#2563eb", color: "#fff", border: "none", borderRadius: "6px", fontWeight: 700, fontSize: "12px", cursor: "pointer" },
  statusBadgeSaved: { fontSize: "12px", fontWeight: 700, color: "#10b981", backgroundColor: "#064e3b", padding: "4px 10px", borderRadius: "6px" },
  statusBadgeLocked: { fontSize: "12px", fontWeight: 700, color: "#ef4444", backgroundColor: "#451a03", padding: "4px 10px", borderRadius: "6px" }
};