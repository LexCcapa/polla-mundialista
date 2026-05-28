"use client";

import { useEffect, useState, CSSProperties } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface MatchSummary {
  id: string;
  team_home: string;
  team_away: string;
  match_date: string;
  stage: string;
  status: string;
  home_score: number | null;
  away_score: number | null;
}

export default function DashboardPage() {
  const [username, setUsername] = useState<string>("Jugador");
  const [userPoints, setUserPoints] = useState<number>(0);
  const [recentMatches, setRecentMatches] = useState<MatchSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        
        // 1. Obtener la sesión activa del usuario logueado
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        const session = sessionData?.session;
        if (session?.user) {
          const currentUserId = session.user.id;

          // 2. Intentar traer el perfil asignado a este user_id
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("username, total_points, is_admin")
            .eq("user_id", currentUserId)
            .maybeSingle(); // Uso seguro para evitar excepciones si no hay filas

          if (!profileError && profileData) {
            setUsername(profileData.username || "Crack");
            setUserPoints(profileData.total_points || 0);
            setIsAdmin(profileData.is_admin === true);
          } else {
            // Intento secundario: Si tu tabla usa 'id' en lugar de 'user_id' como llave primaria vinculada
            const { data: fallbackData } = await supabase
              .from("profiles")
              .select("username, total_points, is_admin")
              .eq("id", currentUserId)
              .maybeSingle();

            if (fallbackData) {
              setUsername(fallbackData.username || "Crack");
              setUserPoints(fallbackData.total_points || 0);
              setIsAdmin(fallbackData.is_admin === true);
            } else {
              // Respaldo de seguridad si la fila no existe en la BD
              setUsername(session.user.email?.split("@")[0] || "Crack");
              setUserPoints(0);
              setIsAdmin(false);
            }
          }
        }

        // 3. Cargar el Fixture de partidos
        const { data: matchesData, error: matchesError } = await supabase
          .from("matches")
          .select("id, team_home, team_away, match_date, stage, status, home_score, away_score")
          .order("match_date", { ascending: true })
          .limit(10);

        if (!matchesError && matchesData) {
          setRecentMatches(matchesData as MatchSummary[]);
        }

      } catch (error) {
        console.error("Error cargando el dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <p style={styles.loadingText}>⚽ Sincronizando tu panel deportivo...</p>
      </div>
    );
  }

  return (
    <main style={styles.container}>
      {/* --- BANNER BIENVENIDA --- */}
      <header style={styles.welcomeBanner}>
        <div>
          <h1 style={styles.welcomeTitle}>¡Hola, {username}! 👋</h1>
          <p style={styles.welcomeSubtitle}>Bienvenido de vuelta a la Polla. Sistema de puntos automático activo.</p>
        </div>
        <div style={styles.badge}>{isAdmin ? "ADMIN CONTROL" : "PRO USER"}</div>
      </header>

      {/* 👑 ACCESO EXCLUSIVO PARA ADMINISTRADORES */}
      {isAdmin && (
        <div style={styles.adminBanner}>
          <div style={styles.adminTextContainer}>
            <span style={styles.adminIcon}>⚙️</span>
            <div>
              <h4 style={styles.adminTitle}>Modo Administrador Activo</h4>
              <p style={styles.adminSubtitle}>Tienes permisos globales para gestionar fixture y marcadores oficiales.</p>
            </div>
          </div>
          <Link href="/admin" style={styles.adminButton}>
            Ir al Panel Admin →
          </Link>
        </div>
      )}

      {/* --- TARJETAS DE ESTADÍSTICAS --- */}
      <section style={styles.statsGrid}>
        <div style={styles.statCard}>
          <span style={styles.statIcon}>🎯</span>
          <div>
            <p style={styles.statLabel}>Mis Puntos Totales</p>
            <h2 style={{ ...styles.statValue, color: "#10b981" }}>{userPoints} pts</h2>
          </div>
        </div>

        <div style={styles.statCard}>
          <span style={styles.statIcon}>📊</span>
          <div>
            <p style={styles.statLabel}>Estado de Competencia</p>
            <h2 style={{ ...styles.statValue, color: "#fbbf24" }}>ACTIVO</h2>
          </div>
        </div>
      </section>

      {/* --- CUERPO PRINCIPAL --- */}
      <div style={styles.mainLayout}>
        <div style={styles.leftCol}>
          <h2 style={styles.sectionTitle}>🎯 Acciones Disponibles</h2>
          <div style={styles.actionGrid}>
            <Link href="/matches" style={{ ...styles.actionButton, backgroundColor: "#2563eb" }}>
              📝 Registrar Pronósticos
            </Link>
            <Link href="/ranking" style={{ ...styles.actionButton, backgroundColor: "#1f2937", border: "1px solid #374151" }}>
              🏆 Ver Tabla de Posiciones
            </Link>
          </div>
        </div>

        <div style={styles.rightCol}>
          <h2 style={styles.sectionTitle}>📅 Próximos Partidos (Top 10)</h2>
          <div style={styles.scrollableMatchesContainer}>
            <div style={styles.matchesList}>
              {recentMatches.length === 0 ? (
                <p style={styles.noMatches}>No hay partidos programados en este momento.</p>
              ) : (
                recentMatches.map((match) => (
                  <div key={match.id} style={styles.matchCard}>
                    <div style={styles.matchHeader}>
                      <span style={styles.matchStage}>{match.stage}</span>
                      <span style={{ 
                        ...styles.matchStatus, 
                        backgroundColor: match.status === "finished" ? "#1f2937" : "#1e1b4b",
                        color: match.status === "finished" ? "#9ca3af" : "#818cf8",
                        border: match.status === "finished" ? "1px solid #374151" : "1px solid #312e81"
                      }}>
                        {match.status === "finished" ? "Finalizado" : "Próximamente"}
                      </span>
                    </div>
                    
                    <div style={styles.teamsRow}>
                      <div style={styles.teamBlock}>
                        <span style={styles.teamName}>{match.team_home}</span>
                      </div>
                      
                      <div style={styles.scoreBlock}>
                        <span style={styles.scoreNumber}>
                          {match.status === "finished" && match.home_score !== null ? match.home_score : "-"}
                        </span>
                        <span style={styles.vs}>vs</span>
                        <span style={styles.scoreNumber}>
                          {match.status === "finished" && match.away_score !== null ? match.away_score : "-"}
                        </span>
                      </div>

                      <div style={{ ...styles.teamBlock, textAlign: "right" }}>
                        <span style={styles.teamName}>{match.team_away}</span>
                      </div>
                    </div>

                    <div style={styles.matchFooter}>
                      ⏰ {new Date(match.match_date).toLocaleString("es-PE", { dateStyle: "short", timeStyle: "short" })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  container: { padding: "40px 20px", fontFamily: "'Segoe UI', Roboto, sans-serif", maxWidth: "1000px", margin: "0 auto", backgroundColor: "#0b0f19", minHeight: "100vh", color: "#f8fafc" },
  loadingContainer: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", backgroundColor: "#0b0f19" },
  loadingText: { marginTop: "15px", color: "#9ca3af", fontSize: "14px", fontWeight: 600 },
  welcomeBanner: { backgroundColor: "#111827", border: "1px solid #1f2937", padding: "30px", borderRadius: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)" },
  welcomeTitle: { margin: "0 0 6px 0", fontSize: "24px", fontWeight: 800 },
  welcomeSubtitle: { margin: 0, fontSize: "14px", color: "#9ca3af" },
  badge: { backgroundColor: "#1e2937", color: "#3b82f6", border: "1px solid #3b82f6", padding: "6px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: 700, letterSpacing: "0.5px" },
  adminBanner: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px", backgroundColor: "#1c1615", border: "1px solid #dc2626", padding: "16px 20px", borderRadius: "12px", marginBottom: "25px" },
  adminTextContainer: { display: "flex", alignItems: "center", gap: "14px" },
  adminIcon: { fontSize: "22px" },
  adminTitle: { margin: "0 0 2px 0", fontSize: "14px", fontWeight: 700, color: "#fca5a5" },
  adminSubtitle: { margin: 0, fontSize: "12px", color: "#f87171" },
  adminButton: { backgroundColor: "#dc2626", color: "#fff", padding: "10px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: 700, textDecoration: "none", cursor: "pointer" },
  statsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "35px" },
  statCard: { backgroundColor: "#111827", border: "1px solid #1f2937", borderRadius: "14px", padding: "20px", display: "flex", alignItems: "center", gap: "16px" },
  statIcon: { fontSize: "28px", backgroundColor: "#1f2937", width: "50px", height: "50px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" },
  statLabel: { margin: "0 0 4px 0", fontSize: "12px", color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" },
  statValue: { margin: 0, fontSize: "22px", fontWeight: 800 },
  mainLayout: { display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "30px", alignItems: "start" },
  leftCol: { display: "flex", flexDirection: "column", gap: "15px" },
  rightCol: { display: "flex", flexDirection: "column", gap: "15px" },
  sectionTitle: { fontSize: "14px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "#64748b", marginBottom: "5px" },
  actionGrid: { display: "flex", flexDirection: "column", gap: "12px" },
  actionButton: { width: "100%", padding: "15px", borderRadius: "10px", color: "#fff", textDecoration: "none", textAlign: "center", fontWeight: 700, fontSize: "14px" },
  scrollableMatchesContainer: { maxHeight: "530px", overflowY: "auto", paddingRight: "8px", borderRadius: "12px" },
  matchesList: { display: "flex", flexDirection: "column", gap: "15px" },
  matchCard: { backgroundColor: "#111827", border: "1px solid #1f2937", borderRadius: "12px", padding: "16px" },
  matchHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", borderBottom: "1px solid #1f2937", paddingBottom: "8px" },
  matchStage: { fontSize: "11px", fontWeight: 600, color: "#9ca3af" },
  matchStatus: { fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "6px", textTransform: "uppercase" },
  teamsRow: { display: "flex", justifyContent: "space-between", alignItems: "center", margin: "10px 0" },
  teamBlock: { flex: 1 },
  teamName: { fontSize: "14px", fontWeight: 700 },
  scoreBlock: { display: "flex", alignItems: "center", gap: "10px", padding: "0 15px" },
  scoreNumber: { fontSize: "18px", fontWeight: 800, backgroundColor: "#1f2937", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "6px", color: "#fff" },
  vs: { fontSize: "11px", color: "#6b7280", fontWeight: 600, textTransform: "lowercase" },
  matchFooter: { fontSize: "11px", color: "#6b7280", marginTop: "10px", textAlign: "center" },
  noMatches: { fontSize: "13px", color: "#6b7280", textAlign: "center", padding: "20px" }
};