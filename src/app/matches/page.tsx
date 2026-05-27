"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function MatchesPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [scores, setScores] = useState<any>({});

  useEffect(() => {
    getMatches();
    getUser();
  }, []);

  async function getMatches() {
    const { data, error } = await supabase
      .from("matches")
      .select("*");

    if (error) {
      console.log("ERROR:", error);
    } else {
      setMatches(data || []);
    }
  }

  async function getUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUser(user);
  }

  async function savePrediction(match: any) {
    if (!user) {
      alert("Debes iniciar sesión");
      return;
    }

    const homeScore = scores[match.id]?.home;
    const awayScore = scores[match.id]?.away;

    if (homeScore === undefined || awayScore === undefined) {
      alert("Completa el marcador");
      return;
    }

    // FECHA DEL PARTIDO
    const matchDate = new Date(match.match_date);

    // FECHA ACTUAL
    const now = new Date();

    // DIFERENCIA EN HORAS
    const diffHours =
      (matchDate.getTime() - now.getTime()) /
      (1000 * 60 * 60);

    // BLOQUEAR SI FALTAN MENOS DE 12 HORAS
    if (diffHours <= 12) {
      alert(
        "Los pronósticos se cierran 12 horas antes del partido"
      );
      return;
    }

    const { error } = await supabase
      .from("predictions")
      .insert({
        user_id: user.id,
        match_id: match.id,
        predicted_home_score: Number(homeScore),
        predicted_away_score: Number(awayScore),
      });

    if (error) {
      console.log(error);
      alert("Error al guardar");
    } else {
      alert("Pronóstico guardado");
    }
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>Partidos</h1>

      {matches.length === 0 && (
        <p>No hay partidos registrados</p>
      )}

      {matches.map((match) => (
        <div
          key={match.id}
          style={{
            border: "1px solid #ccc",
            padding: 10,
            marginBottom: 10,
          }}
        >
          <h3>
            {match.team_home} vs {match.team_away}
          </h3>

          <p>Fase: {match.stage}</p>

          <p>Estado: {match.status}</p>

          <p>
            Fecha:{" "}
            {match.match_date
              ? new Intl.DateTimeFormat("es-PE", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(new Date(match.match_date))
              : "Sin fecha"}
          </p>

          <div style={{ marginTop: 10 }}>
            <input
              type="number"
              placeholder="Local"
              style={{ width: 60 }}
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

            <span> - </span>

            <input
              type="number"
              placeholder="Visita"
              style={{ width: 60 }}
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
            style={{ marginTop: 10 }}
            onClick={() => savePrediction(match)}
          >
            Guardar Pronóstico
          </button>
        </div>
      ))}
    </main>
  );
}