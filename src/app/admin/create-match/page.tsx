"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function CreateMatchPage() {
  const [teamHome, setTeamHome] = useState("");
  const [teamAway, setTeamAway] = useState("");
  const [groupName, setGroupName] = useState("");
  const [matchDate, setMatchDate] = useState("");

  async function createMatch() {
    const { error } = await supabase
      .from("matches")
      .insert({
        team_home: teamHome,
        team_away: teamAway,
        group_name: groupName,
        stage: "group_stage",
        status: "upcoming",
        match_date: matchDate,
      });

    if (error) {
      console.log(error);
      alert("Error");
    } else {
      alert("Partido creado");

      setTeamHome("");
      setTeamAway("");
      setGroupName("");
      setMatchDate("");
    }
  }

  return (
    <main style={{ padding: 30 }}>
      <h1>Crear Partido</h1>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          maxWidth: 400,
        }}
      >
        <input
          placeholder="Equipo Local"
          value={teamHome}
          onChange={(e) => setTeamHome(e.target.value)}
        />

        <input
          placeholder="Equipo Visitante"
          value={teamAway}
          onChange={(e) => setTeamAway(e.target.value)}
        />

        <input
          placeholder="Grupo"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />

        <input
          type="datetime-local"
          value={matchDate}
          onChange={(e) => setMatchDate(e.target.value)}
        />

        <button onClick={createMatch}>
          Crear Partido
        </button>
      </div>
    </main>
  );
}