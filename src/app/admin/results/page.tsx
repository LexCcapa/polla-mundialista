"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ResultsPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [scores, setScores] = useState<any>({});

  useEffect(() => {
    getMatches();
  }, []);

  async function getMatches() {
    const { data } = await supabase
      .from("matches")
      .select("*")
      .order("match_date");

    setMatches(data || []);
  }

  async function saveResult(matchId: string) {
    const home = scores[matchId]?.home;
    const away = scores[matchId]?.away;

    const { error } = await supabase
      .from("matches")
      .update({
        home_score: home,
        away_score: away,
        status: "finished",
      })
      .eq("id", matchId);

    if (error) {
      console.log(error);
      alert("Error");
    } else {
      alert("Resultado guardado");
      getMatches();
    }
  }

  return (
    <main style={{ padding: 30 }}>
      <h1>Cargar Resultados</h1>

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

          <p>
            Resultado actual:
            {" "}
            {match.home_score ?? "-"}
            {" - "}
            {match.away_score ?? "-"}
          </p>

          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 10,
            }}
          >
            <input
              type="number"
              placeholder="Local"
              style={{ width: 70 }}
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

            <input
              type="number"
              placeholder="Visita"
              style={{ width: 70 }}
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
            onClick={() => saveResult(match.id)}
          >
            Guardar Resultado
          </button>
        </div>
      ))}
    </main>
  );
}