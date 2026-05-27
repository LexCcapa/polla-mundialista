"use client";

import { supabase } from "@/lib/supabase";
import AdminGuard from "@/components/AdminGuard";

export default function CalculatePage() {

  async function calculatePoints() {

    // TRAER PARTIDOS TERMINADOS
    const { data: matches } = await supabase
      .from("matches")
      .select("*")
      .not("home_score", "is", null)
      .not("away_score", "is", null);

    if (!matches) return;

    for (const match of matches) {

      // TRAER PRONOSTICOS DE ESE PARTIDO
      const { data: predictions } = await supabase
        .from("predictions")
        .select("*")
        .eq("match_id", match.id);

      if (!predictions) continue;

      for (const prediction of predictions) {

        let points = 0;

        // RESULTADO REAL
        const realHome = match.home_score;
        const realAway = match.away_score;

        // PRONOSTICO
        const predHome = prediction.predicted_home_score;
        const predAway = prediction.predicted_away_score;

        // MARCADOR EXACTO
        if (
          realHome === predHome &&
          realAway === predAway
        ) {
          points = 3;
        }

        // GANADOR O EMPATE
        else {

          const realResult =
            realHome > realAway
              ? "HOME"
              : realHome < realAway
              ? "AWAY"
              : "DRAW";

          const predResult =
            predHome > predAway
              ? "HOME"
              : predHome < predAway
              ? "AWAY"
              : "DRAW";

          if (realResult === predResult) {
            points = 1;
          }
        }

        // ACTUALIZAR PUNTOS
        await supabase
          .from("predictions")
          .update({ points })
          .eq("id", prediction.id);
      }
    }

    alert("Puntos calculados");
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>Calcular Puntajes</h1>

      <button onClick={calculatePoints}>
        Calcular
      </button>
    </main>
  );
}