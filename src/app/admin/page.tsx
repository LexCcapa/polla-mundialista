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
        <h1>Panel Admin</h1>

        <Link href="/admin/matches">
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