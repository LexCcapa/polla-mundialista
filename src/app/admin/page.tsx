"use client";

import { CSSProperties } from "react";
import Link from "next/link";
import AdminGuard from "@/components/AdminGuard";

export default function AdminDashboard() {
  return (
    <AdminGuard>
      <main style={styles.container}>
        {/* --- ENCABEZADO --- */}
        <header style={styles.header}>
          <div>
            <h1 style={styles.mainTitle}>⚙️ Panel de Administración</h1>
            <p style={styles.subtitle}>Gestiona los partidos oficiales, resultados y el sistema de puntos de la Polla.</p>
          </div>
          <Link href="/dashboard" style={styles.backButton}>
            ← Volver al Dashboard
          </Link>
        </header>

        {/* --- SECCIÓN SELECCIÓN --- */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Operaciones del Fixture</h2>
          
          <div style={styles.grid}>
            {/* Opción 1: Gestionar Partidos */}
            <div style={styles.card}>
              <div style={{ ...styles.iconBlock, backgroundColor: "#1e1b4b" }}>
                <span style={styles.icon}>⚽</span>
              </div>
              <div style={styles.cardContent}>
                <h3 style={styles.cardTitle}>Gestionar Partidos</h3>
                <p style={styles.cardDescription}>Añade nuevos encuentros deportivos al fixture global del torneo.</p>
                <Link href="/admin/create-match" style={styles.cardButton}>
                  Ingresar Módulo
                </Link>
              </div>
            </div>

            {/* Opción 2: Cargar Resultados */}
            <div style={styles.card}>
              <div style={{ ...styles.iconBlock, backgroundColor: "#064e3b" }}>
                <span style={styles.icon}>🏆</span>
              </div>
              <div style={styles.cardContent}>
                <h3 style={styles.cardTitle}>Cargar Resultados</h3>
                <p style={styles.cardDescription}>Registra los marcadores finales oficiales para calcular los puntos de los usuarios.</p>
                <Link href="/admin/results" style={{ ...styles.cardButton, border: "1px solid #059669", color: "#34d399" }}>
                  Ingresar Módulo
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </AdminGuard>
  );
}

const styles: Record<string, CSSProperties> = {
  container: { padding: "40px 20px", fontFamily: "'Segoe UI', Roboto, sans-serif", maxWidth: "900px", margin: "0 auto", backgroundColor: "#0b0f19", minHeight: "100vh", color: "#f8fafc" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px", borderBottom: "1px solid #1f2937", paddingBottom: "25px", marginBottom: "35px" },
  mainTitle: { margin: "0 0 6px 0", fontSize: "28px", fontWeight: 800, color: "#fff" },
  subtitle: { margin: 0, fontSize: "14px", color: "#9ca3af" },
  backButton: { backgroundColor: "#1f2937", border: "1px solid #374151", color: "#f8fafc", padding: "10px 18px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, textDecoration: "none", transition: "background 0.2s" },
  section: { marginTop: "10px" },
  sectionTitle: { fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "#64748b", marginBottom: "20px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "25px" },
  card: { backgroundColor: "#111827", border: "1px solid #1f2937", borderRadius: "16px", padding: "25px", display: "flex", gap: "20px", alignItems: "flex-start", boxShadow: "0 4px 15px rgba(0,0,0,0.3)" },
  iconBlock: { width: "55px", height: "55px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  icon: { fontSize: "24px" },
  cardContent: { flex: 1, display: "flex", flexDirection: "column", gap: "6px" },
  cardTitle: { margin: 0, fontSize: "18px", fontWeight: 700, color: "#fff" },
  cardDescription: { margin: "0 0 12px 0", fontSize: "13px", color: "#9ca3af", lineHeight: "1.5" },
  cardButton: { display: "inline-block", textAlign: "center", textDecoration: "none", backgroundColor: "#1f2937", border: "1px solid #374151", color: "#fff", padding: "8px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 700, width: "fit-content" }
};