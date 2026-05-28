"use client";

import Link from "next/link";
import AdminGuard from "@/components/AdminGuard";

export default function AdminPage() {
  return (
    <AdminGuard>
      <main style={styles.container}>
        <header style={styles.header}>
          <div style={styles.logoArea}>
            <span style={styles.logoIcon}>⚙️</span>
            <div>
              <h1 style={styles.title}>Panel de Control</h1>
              <p style={styles.subtitle}>Gestión y métricas de la Polla Mundialista</p>
            </div>
          </div>
        </header>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Operaciones del Fixture</h2>
          <div style={styles.grid}>
            <Link href="/admin/create-match" style={styles.card}>
              <div style={{ ...styles.cardIcon, backgroundColor: "#1e293b", color: "#60a5fa" }}>⚽</div>
              <div style={styles.cardContent}>
                <h3 style={styles.cardTitle}>Gestionar Partidos</h3>
                <p style={styles.cardDescription}>Carga masiva por CSV o añade nuevos partidos de forma manual.</p>
              </div>
            </Link>
          </div>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Resultados y Puntuaciones</h2>
          <div style={styles.grid}>
            <Link href="/admin/results" style={styles.card}>
              <div style={{ ...styles.cardIcon, backgroundColor: "#2e251a", color: "#fb923c" }}>🏆</div>
              <div style={styles.cardContent}>
                <h3 style={styles.cardTitle}>Cargar Resultados</h3>
                <p style={styles.cardDescription}>Introduce los marcadores oficiales de los partidos finalizados.</p>
              </div>
            </Link>

            <Link href="/admin/calculate" style={styles.card}>
              <div style={{ ...styles.cardIcon, backgroundColor: "#2e1b4e", color: "#c084fc" }}>🤖</div>
              <div style={styles.cardContent}>
                <h3 style={styles.cardTitle}>Calcular Puntajes</h3>
                <p style={styles.cardDescription}>Corre el algoritmo para evaluar predicciones y repartir puntos.</p>
              </div>
            </Link>
          </div>
        </section>
      </main>
    </AdminGuard>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { padding: "40px 20px", fontFamily: "'Segoe UI', Roboto, sans-serif", maxWidth: "1000px", margin: "0 auto", backgroundColor: "#0b0f19", minHeight: "100vh" },
  header: { backgroundColor: "#111827", padding: "30px", borderRadius: "16px", color: "#ffffff", boxShadow: "0 10px 25px rgba(0,0,0,0.3)", marginBottom: "40px", border: "1px solid #1f2937" },
  logoArea: { display: "flex", alignItems: "center", gap: "20px" },
  logoIcon: { fontSize: "36px", backgroundColor: "#1f2937", padding: "10px", borderRadius: "12px" },
  title: { margin: "0 0 4px 0", fontSize: "26px", fontWeight: 800, letterSpacing: "-0.5px" },
  subtitle: { margin: 0, fontSize: "14px", color: "#9ca3af" },
  section: { marginBottom: "35px" },
  sectionTitle: { fontSize: "14px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "#64748b", marginBottom: "15px", paddingLeft: "5px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" },
  card: { display: "flex", alignItems: "flex-start", backgroundColor: "#111827", border: "1px solid #1f2937", borderRadius: "14px", padding: "20px", textDecoration: "none", color: "inherit", boxShadow: "0 4px 6px rgba(0,0,0,0.2)", cursor: "pointer" },
  cardIcon: { fontSize: "24px", width: "48px", height: "48px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", marginRight: "16px", flexShrink: 0 },
  cardContent: { display: "flex", flexDirection: "column" },
  cardTitle: { margin: "0 0 6px 0", fontSize: "16px", fontWeight: 700, color: "#f8fafc" },
  cardDescription: { margin: 0, fontSize: "13px", color: "#9ca3af", lineHeight: "1.5" },
};