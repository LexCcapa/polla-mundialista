"use client";

import { useState, FormEvent, CSSProperties } from "react";
import { supabase } from "@/lib/supabase"; 
import AdminGuard from "@/components/AdminGuard";
import Link from "next/link";

export default function CreateMatchPage() {
  const [teamHome, setTeamHome] = useState<string>("");
  const [teamAway, setTeamAway] = useState<string>("");
  const [matchDate, setMatchDate] = useState<string>("");
  const [stage, setStage] = useState<string>("Fase de Grupos");
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!teamHome || !teamAway || !matchDate) {
      setMessage({ text: "Por favor, completa todos los campos requeridos.", type: "error" });
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase
        .from("matches")
        .insert([
          {
            team_home: teamHome,
            team_away: teamAway,
            match_date: matchDate,
            stage: stage,
            status: "pending",
            home_score: null,
            away_score: null
          }
        ]);

      if (error) throw error;

      setMessage({ text: "⚽ ¡Partido creado y añadido al fixture con éxito!", type: "success" });
      
      // Limpiar el formulario
      setTeamHome("");
      setTeamAway("");
      setMatchDate("");
    } catch (err: any) {
      console.error(err);
      setMessage({ text: "Hubo un error al guardar el partido en la base de datos.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminGuard>
      <main style={styles.container}>
        {/* --- ENCABEZADO --- */}
        <header style={styles.header}>
          <div>
            <h1 style={styles.mainTitle}>⚽ Registrar Nuevo Partido</h1>
            <p style={styles.subtitle}>Añade un nuevo encuentro deportivo al fixture global de la Polla.</p>
          </div>
          <Link href="/admin" style={styles.backButton}>
            ← Volver al Panel Admin
          </Link>
        </header>

        {/* --- ALERTAS DE ESTADO --- */}
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

        {/* --- FORMULARIO --- */}
        <div style={styles.card}>
          <form onSubmit={handleSubmit} style={styles.form}>
            
            <div style={styles.gridTeams}>
              {/* Equipo Local */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>Equipo Local 🏠</label>
                <input
                  type="text"
                  value={teamHome}
                  onChange={(e) => setTeamHome(e.target.value)}
                  placeholder="Ej. Perú"
                  required
                  style={styles.input}
                />
              </div>

              {/* Separador Versus simulado */}
              <div style={styles.vsDivider}>VS</div>

              {/* Equipo Visitante */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>Equipo Visitante ✈️</label>
                <input
                  type="text"
                  value={teamAway}
                  onChange={(e) => setTeamAway(e.target.value)}
                  placeholder="Ej. Argentina"
                  required
                  style={styles.input}
                />
              </div>
            </div>

            <hr style={styles.separator} />

            <div style={styles.gridConfig}>
              {/* Etapa o Fase */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>Fase del Torneo</label>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                  style={styles.select}
                >
                  <option value="Fase de Grupos">Fase de Grupos</option>
                  <option value="Octavos de Final">Octavos de Final</option>
                  <option value="Cuartos de Final">Cuartos de Final</option>
                  <option value="Semifinal">Semifinal</option>
                  <option value="Tercer Lugar">Tercer Lugar</option>
                  <option value="Gran Final">Gran Final</option>
                </select>
              </div>

              {/* Fecha y Hora del encuentro */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>Fecha y Hora del Partido</label>
                <input
                  type="datetime-local"
                  value={matchDate}
                  onChange={(e) => setMatchDate(e.target.value)}
                  required
                  style={styles.input}
                />
              </div>
            </div>

            {/* Botón de envío */}
            <button type="submit" disabled={loading} style={styles.submitButton}>
              {loading ? "Registrando en Fixture..." : "🚀 Crear Partido Oficial"}
            </button>

          </form>
        </div>
      </main>
    </AdminGuard>
  );
}

// 📌 Estilos de Diseño Premium Black unificados
const styles: Record<string, CSSProperties> = {
  container: { padding: "40px 20px", fontFamily: "'Segoe UI', Roboto, sans-serif", maxWidth: "800px", margin: "0 auto", backgroundColor: "#0b0f19", minHeight: "100vh", color: "#f8fafc" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "15px", borderBottom: "1px solid #1f2937", paddingBottom: "20px", marginBottom: "30px" },
  mainTitle: { margin: "0 0 6px 0", fontSize: "26px", fontWeight: 800 },
  subtitle: { margin: 0, fontSize: "14px", color: "#9ca3af" },
  backButton: { backgroundColor: "#1f2937", border: "1px solid #374151", color: "#f8fafc", padding: "10px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, textDecoration: "none" },
  
  alert: { padding: "15px", borderRadius: "10px", fontSize: "14px", fontWeight: 600, marginBottom: "25px" },
  card: { backgroundColor: "#111827", border: "1px solid #1f2937", borderRadius: "16px", padding: "30px", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.4)" },
  form: { display: "flex", flexDirection: "column", gap: "20px" },
  
  gridTeams: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "15px", flexWrap: "wrap" },
  inputGroup: { flex: 1, display: "flex", flexDirection: "column", gap: "8px", minWidth: "250px" },
  label: { fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" },
  input: { backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px", padding: "12px", color: "#fff", fontSize: "14px", outline: "none", width: "100%" },
  select: { backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px", padding: "12px", color: "#fff", fontSize: "14px", outline: "none", width: "100%", cursor: "pointer" },
  
  vsDivider: { fontSize: "14px", fontWeight: 800, color: "#4b5563", padding: "10px 0", alignSelf: "center", marginTop: "20px" },
  separator: { border: "0", borderTop: "1px solid #1f2937", margin: "10px 0" },
  
  gridConfig: { display: "flex", gap: "20px", flexWrap: "wrap" },
  submitButton: { backgroundColor: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", padding: "14px", fontSize: "14px", fontWeight: 700, cursor: "pointer", transition: "background-color 0.2s", width: "100%", marginTop: "10px" }
};