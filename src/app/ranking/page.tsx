"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function RankingPage() {

  const [ranking, setRanking] = useState<any[]>([]);

  useEffect(() => {
    getRanking();
  }, []);

  async function getRanking() {

    // PRONOSTICOS
    const { data: predictions } = await supabase
      .from("predictions")
      .select("points, user_id");

    // PERFILES
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*");

    if (!predictions || !profiles) return;

    // SUMAR PUNTOS
    const totals: any = {};

    predictions.forEach((prediction: any) => {

      if (!totals[prediction.user_id]) {
        totals[prediction.user_id] = 0;
      }

      totals[prediction.user_id] += prediction.points || 0;
    });

    // CREAR ARRAY
    const rankingArray = Object.entries(totals).map(
      ([user_id, points]) => {

        const profile = profiles.find(
          (p: any) => p.user_id === user_id
        );

        return {
          user_id,
          username: profile?.username || "Sin nombre",
          points,
        };
      }
    );

    // ORDENAR
    rankingArray.sort(
      (a: any, b: any) => b.points - a.points
    );

    setRanking(rankingArray);
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>Ranking</h1>

      {ranking.map((user: any, index: number) => (
        <div
          key={user.user_id}
          style={{
            border: "1px solid #ccc",
            padding: 10,
            marginBottom: 10,
          }}
        >
          <h2>
            #{index + 1}
          </h2>

          <p>
            Usuario: {user.username}
          </p>

          <p>
            Puntos: {user.points}
          </p>
        </div>
      ))}
    </main>
  );
}