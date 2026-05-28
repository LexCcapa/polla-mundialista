"use client";

import Link from "next/link";
import AdminGuard from "@/components/AdminGuard";

export default function AdminPage() {
  return (
    <AdminGuard>
      <main
        style={{
          padding: 30,
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "10px" }}>
          Panel Admin
        </h1>

        <Link href="/matches">
          ⚽ Ver Partidos
        </Link>

        <Link href="/admin/create-match">
          ➕ Crear Partido
        </Link>

        <Link href="/admin/results">
          🏆 Cargar Resultados
        </Link>

        <Link href="/admin/calculate">
          🤖 Calcular Puntajes
        </Link>

        <Link href="/ranking">
          📊 Ver Ranking
        </Link>
      </main>
    </AdminGuard>
  );
}