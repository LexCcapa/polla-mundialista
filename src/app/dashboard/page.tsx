"use client";

import Link from "next/link"; 
import { supabase } from "@/lib/supabase";
import AdminGuard from "@/components/AdminGuard";
import { CSSProperties } from "react";

export default function AdminPage() {
  return (
    <AdminGuard>
      <main style={styles.container}>
        {/* --- CABECERA PANEL ADMIN --- */}
        <header style={styles.header}>
          <div>
            <h1 style={styles.mainTitle}>⚙️ Panel de Administración</h1>
            <p style={styles.subtitle}>Gestiona los partidos oficiales, resultados y el sistema de puntos de la Polla.</p>
          </div>
          <Link href="/dashboard" style={styles.backButton}>
            ← Volver al Dashboard
          </Link>
        </header>

        {/* --- SECCIÓN DE OPERACIONES --- */}
        <section>
          <h2 style={styles.sectionTitle}>Operaciones del Fixture</h2>
          <div style={styles.grid}>
            
            {/* Tarjeta 1: Crear Partidos */}
            <Link href="/admin/create-match" style={styles.card}>
              <div style={{ ...styles.cardIcon, backgroundColor: "#1e1b4b", color: "#818cf8" }}>⚽</div>
              <div style={styles.cardContent}>
                <h3 style={styles.cardTitle}>Gestionar Partidos</h3>
                <p style={styles.cardDescription}>Añade nuevos encuentros deportivos al fixture global del torneo.</p>
              </div>
            </Link>

            {/* Tarjeta 2: Ingresar Resultados Reales */}
            <Link href="/admin/results" style={styles.card}>
              <div style={{ ...styles.cardIcon, backgroundColor: "#064e3b", color: "#34d399" }}>🏆</div>
              <div style={styles.cardContent}>
                <h3 style={styles.cardTitle}>Cargar Resultados</h3>
                <p style={styles.cardDescription}>Registra los marcadores finales oficiales para calcular los puntos de los usuarios.</p>
              </div>
            </Link>

          </div>
        </section>
      </main>
    </AdminGuard>
  );
}

// 📌 Estilos Premium Black optimizados para PC y Celulares
const styles: Record<string, CSSProperties> = {
  container: { padding: "40px 20px", fontFamily: "'Segoe UI', Roboto, sans-serif", maxWidth: "1000px", margin: "0 auto", backgroundColor: "#0b0f19", minHeight: "100vh", color: "#f8fafc" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px", borderBottom: "1px solid #1f2937", paddingBottom: "24px", marginBottom: "35px" },
  mainTitle: { margin: "0 0 6px 0", fontSize: "26px", fontWeight: 800, color: "#f8fafc" },
  subtitle: { margin: 0, fontSize: "14px", color: "#9ca3af", maxWidth: "600px" },
  backButton: { backgroundColor: "#1f2937", border: "1px solid #374151", color: "#f8fafc", padding: "10px 18px", borderRadius: "10px", fontSize: "13px", fontWeight: 600, textDecoration: "none", cursor: "pointer" },
  sectionTitle: { fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "#64748b", marginBottom: "20px" },
  
  // Grid responsivo básico: En celular se pone una columna sola y en PC dos columnas
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" },
  
  card: { backgroundColor: "#111827", border: "1px solid #1f2937", borderRadius: "14px", padding: "24px", display: "flex", gap: "18px", alignItems: "center", textDecoration: "none", cursor: "pointer" },
  cardIcon: { fontSize: "24px", width: "54px", height: "54px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  cardContent: { display: "flex", flexDirection: "column", gap: "4px" },
  cardTitle: { margin: 0, fontSize: "16px", fontWeight: 700, color: "#f8fafc" },
  cardDescription: { margin: 0, fontSize: "13px", color: "#9ca3af", lineHeight: "1.4" }
};