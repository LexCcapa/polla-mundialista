"use client";

import { useState, useRef, useEffect, ChangeEvent, FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import AdminGuard from "@/components/AdminGuard";
import Link from "next/link";

interface MatchQuery {
  team_home: string;
  team_away: string;
}

interface MatchInsert {
  id: string;
  team_home: string;
  team_away: string;
  match_date: string;
  status: string;
  stage: string;
  group_name: string | null;
}

interface CSVRow {
  id?: string;
  team_home?: string;
  team_away?: string;
  match_date?: string;
  status?: string;
  stage?: string;
  group_name?: string;
}

export default function CreateMatchPage() {
  const [loading, setLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [existingTeams, setExistingTeams] = useState<string[]>([]);

  const [manualMatch, setManualMatch] = useState({
    team_home: "",
    team_away: "",
    match_date: "",
    stage: "Fase de Grupos",
    group_name: ""
  });

  useEffect(() => {
    fetchTeams();
  }, []);

  async function fetchTeams(): Promise<void> {
    const { data, error } = await supabase
      .from("matches")
      .select("team_home, team_away");

    if (error) {
      console.error("Error al cargar equipos:", error.message);
      return;
    }

    if (data) {
      const teams = new Set<string>();
      (data as MatchQuery[]).forEach((m) => {
        if (m.team_home) teams.add(m.team_home);
        if (m.team_away) teams.add(m.team_away);
      });
      setExistingTeams(Array.from(teams).sort());
    }
  }

  async function handleCSVUpload(e: ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setStatusMessage("⏳ Procesando CSV...");

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 0);
        
        if (lines.length <= 1) {
          throw new Error("El archivo CSV no contiene datos.");
        }

        const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
        const matchesToUpload: MatchInsert[] = [];

        for (let i = 1; i < lines.length; i++) {
          const currentLine = lines[i].split(",");
          const rowData: CSVRow = {};
          
          headers.forEach((h, idx) => {
            const value = currentLine[idx]?.trim();
            if (value) {
              (rowData as Record<string, string>)[h] = value;
            }
          });

          if (!rowData.team_home || !rowData.team_away) continue;

          const matchId = rowData.id && rowData.id.length > 20 ? rowData.id : window.crypto.randomUUID();

          matchesToUpload.push({
            id: matchId,
            team_home: rowData.team_home,
            team_away: rowData.team_away,
            match_date: rowData.match_date ? new Date(rowData.match_date).toISOString() : new Date().toISOString(),
            status: rowData.status || "scheduled",
            stage: rowData.stage || "Fase de Grupos",
            group_name: rowData.group_name || null
          });
        }

        const { error } = await supabase
          .from("matches")
          .upsert(matchesToUpload, { onConflict: "id" });

        if (error) throw error;

        setStatusMessage("✅ CSV cargado con éxito.");
        fetchTeams(); 
        alert("¡Partidos del CSV sincronizados!");
      } catch (err: any) {
        setStatusMessage(`❌ Error CSV: ${err.message || "Formato inválido"}`);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file, "UTF-8");
  }

  async function handleManualSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    if (manualMatch.team_home === manualMatch.team_away) {
      alert("❌ Un equipo no puede jugar contra sí mismo.");
      return;
    }

    setLoading(true);
    setStatusMessage("⏳ Guardando partido manual...");

    try {
      const { error } = await supabase.from("matches").insert([{
        id: window.crypto.randomUUID(),
        team_home: manualMatch.team_home,
        team_away: manualMatch.team_away,
        match_date: new Date(manualMatch.match_date).toISOString(),
        status: "scheduled",
        stage: manualMatch.stage,
        group_name: manualMatch.group_name || null
      }]);

      if (error) throw error;

      setStatusMessage("✅ Partido manual agregado.");
      setManualMatch({ team_home: "", team_away: "", match_date: "", stage: "Fase de Grupos", group_name: "" });
      alert("¡Partido guardado con éxito!");
    } catch (err: any) {
      setStatusMessage(`❌ Error Manual: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminGuard>
      <main style={styles.container}>
        <div style={styles.navBlock}>
          <Link href="/admin" style={styles.backLink}>← Volver al Panel Admin</Link>
        </div>

        <h1 style={styles.mainTitle}>Gestión de Partidos</h1>

        {/* --- SECCIÓN A: CARGA MANUAL --- */}
        <div style={styles.box}>
          <h2 style={styles.sectionTitle}>➕ Agregar Partido Manual</h2>
          <p style={styles.sectionSubtitle}>Solo permite seleccionar equipos que ya están en el sistema.</p>
          
          <form onSubmit={handleManualSubmit} style={styles.form}>
            <div style={styles.formGrid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Equipo Local</label>
                <select 
                  style={styles.select}
                  required
                  value={manualMatch.team_home}
                  onChange={(e) => setManualMatch({...manualMatch, team_home: e.target.value})}
                >
                  <option value="" style={styles.option}>Selecciona equipo...</option>
                  {existingTeams.map(t => (
                    <option key={t} value={t} style={styles.option}>{t}</option>
                  ))}
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Equipo Visitante</label>
                <select 
                  style={styles.select}
                  required
                  value={manualMatch.team_away}
                  onChange={(e) => setManualMatch({...manualMatch, team_away: e.target.value})}
                >
                  <option value="" style={styles.option}>Selecciona equipo...</option>
                  {existingTeams.map(t => (
                    <option key={t} value={t} style={styles.option}>{t}</option>
                  ))}
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Fecha y Hora</label>
                <input 
                  type="datetime-local" 
                  style={styles.input}
                  required
                  value={manualMatch.match_date}
                  onChange={(e) => setManualMatch({...manualMatch, match_date: e.target.value})}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Fase / Etapa</label>
                <select 
                  style={styles.select}
                  value={manualMatch.stage}
                  onChange={(e) => setManualMatch({...manualMatch, stage: e.target.value})}
                >
                  <option value="Fase de Grupos" style={styles.option}>Fase de Grupos</option>
                  <option value="Octavos de Final" style={styles.option}>Octavos de Final</option>
                  <option value="Cuartos de Final" style={styles.option}>Cuartos de Final</option>
                  <option value="Semifinal" style={styles.option}>Semifinal</option>
                  <option value="Final" style={styles.option}>Final</option>
                </select>
              </div>
            </div>

            <button type="submit" disabled={loading || existingTeams.length === 0} style={styles.submitBtn}>
              {loading ? "Guardando..." : "Guardar Partido Manual"}
            </button>
            {existingTeams.length === 0 && <p style={styles.warning}>⚠️ Primero debes cargar el CSV para habilitar la lista.</p>}
          </form>
        </div>

        {/* --- SECCIÓN B: CARGA CSV --- */}
        <div style={styles.box}>
          <h2 style={styles.sectionTitle}>📁 Carga Masiva vía CSV</h2>
          <div style={styles.uploadArea}>
            <label style={{ ...styles.uploadLabel, cursor: loading ? "not-allowed" : "pointer" }}>
              {loading ? "Procesando..." : "Seleccionar CSV"}
              <input type="file" accept=".csv" ref={fileInputRef} onChange={handleCSVUpload} disabled={loading} style={{ display: "none" }} />
            </label>
            <p style={styles.fileHint}>Acepta el formato de 72 partidos de la Polla.</p>
          </div>
        </div>

        {/* Mensaje de Estado */}
        {statusMessage && (
          <div style={{
            ...styles.statusBox,
            backgroundColor: statusMessage.includes("❌") ? "#2c1515" : "#142c14",
            color: statusMessage.includes("❌") ? "#ff6b6b" : "#69db7c",
            border: statusMessage.includes("❌") ? "1px solid #e03131" : "1px solid #2b8a3e"
          }}>{statusMessage}</div>
        )}
      </main>
    </AdminGuard>
  );
}

// 📌 Paleta de Estilos Dark Mode Premium (Cyber/Deportivo)
const styles: Record<string, React.CSSProperties> = {
  container: { 
    padding: "40px 20px", 
    fontFamily: "'Segoe UI', Roboto, sans-serif", 
    maxWidth: "800px", 
    margin: "0 auto", 
    backgroundColor: "#0b0f19", // Fondo ultra oscuro
    minHeight: "100vh" 
  },
  navBlock: { marginBottom: "20px" },
  backLink: { color: "#64748b", textDecoration: "none", fontWeight: 600, fontSize: "14px" },
  mainTitle: { fontSize: "28px", fontWeight: 800, color: "#f8fafc", marginBottom: "30px", textAlign: "center" },
  box: { 
    backgroundColor: "#111827", // Tarjetas gris oscuro
    border: "1px solid #1f2937", 
    borderRadius: "16px", 
    padding: "30px", 
    marginBottom: "25px", 
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)" 
  },
  sectionTitle: { fontSize: "18px", fontWeight: 700, color: "#f8fafc", margin: "0 0 5px 0" },
  sectionSubtitle: { fontSize: "13px", color: "#9ca3af", marginBottom: "20px" },
  form: { display: "flex", flexDirection: "column", gap: "20px" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "5px" },
  label: { fontSize: "12px", fontWeight: 700, color: "#9ca3af" },
  input: { 
    padding: "10px", 
    borderRadius: "8px", 
    border: "1px solid #374151", 
    fontSize: "14px", 
    backgroundColor: "#1f2937", 
    color: "#f8fafc" 
  },
  select: { 
    padding: "10px", 
    borderRadius: "8px", 
    border: "1px solid #374151", 
    fontSize: "14px", 
    backgroundColor: "#1f2937", // Controla el fondo del input select
    color: "#f8fafc", // Controla el color del texto seleccionado
    outline: "none"
  },
  option: {
    backgroundColor: "#1f2937", // Forzamos fondo oscuro en las opciones de la lista
    color: "#f8fafc",           // Forzamos texto blanco/claro en las opciones
    padding: "10px"
  },
  submitBtn: { 
    padding: "12px", 
    backgroundColor: "#10b981", // Verde esmeralda vivo
    color: "#fff", 
    border: "none", 
    borderRadius: "8px", 
    fontWeight: 700, 
    cursor: "pointer", 
    marginTop: "10px",
    boxShadow: "0 4px 14px rgba(16, 185, 129, 0.3)"
  },
  uploadArea: { 
    border: "2px dashed #374151", 
    padding: "20px", 
    borderRadius: "12px", 
    textAlign: "center", 
    backgroundColor: "#1f2937" 
  },
  uploadLabel: { 
    padding: "10px 20px", 
    backgroundColor: "#3b82f6", // Azul eléctrico deportivo
    color: "#fff", 
    borderRadius: "8px", 
    fontWeight: 600, 
    fontSize: "13px",
    cursor: "pointer",
    boxShadow: "0 4px 14px rgba(59, 130, 246, 0.3)"
  },
  fileHint: { fontSize: "11px", color: "#6b7280", marginTop: "10px" },
  statusBox: { padding: "15px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, marginTop: "20px" },
  warning: { fontSize: "12px", color: "#fbbf24", marginTop: "10px", fontWeight: "bold" }
};