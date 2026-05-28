"use client";

import { useState, FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Credenciales incorrectas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>⚽ Iniciar Sesión</h1>
        <p style={styles.subtitle}>Ingresa tus datos para gestionar tus pronósticos</p>

        {error && <div style={styles.errorBox}>⚠️ {error}</div>}

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={styles.input}
            />
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Cargando..." : "Entrar al Panel"}
          </button>
        </form>

        <p style={styles.footerText}>
          ¿No tienes una cuenta?{" "}
          <Link href="/register" style={styles.link}>
            Regístrate aquí
          </Link>
        </p>
      </div>
    </main>
  );
}

const styles = {
  container: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", backgroundColor: "#0b0f19", fontFamily: "'Segoe UI', Roboto, sans-serif", padding: "20px" },
  card: { backgroundColor: "#111827", border: "1px solid #1f2937", borderRadius: "16px", padding: "40px 30px", maxWidth: "420px", width: "100%", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.4)", textAlign: "center" as const },
  title: { margin: "0 0 8px 0", fontSize: "24px", fontWeight: 800, color: "#f8fafc" },
  subtitle: { margin: "0 0 24px 0", fontSize: "14px", color: "#9ca3af" },
  errorBox: { backgroundColor: "#7f1d1d", border: "1px solid #f87171", color: "#fca5a5", padding: "12px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, marginBottom: "20px", textAlign: "left" as const },
  form: { display: "flex", flexDirection: "column" as const, gap: "18px", textAlign: "left" as const },
  inputGroup: { display: "flex", flexDirection: "column" as const, gap: "6px" },
  label: { fontSize: "12px", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase" as const, letterSpacing: "0.5px" },
  input: { backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px", padding: "12px", color: "#fff", fontSize: "14px", outline: "none" },
  button: { backgroundColor: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", padding: "14px", fontSize: "14px", fontWeight: 700, cursor: "pointer", marginTop: "10px", transition: "background-color 0.2s" },
  footerText: { marginTop: "24px", fontSize: "13px", color: "#9ca3af", margin: "24px 0 0 0" },
  link: { color: "#3b82f6", textDecoration: "none", fontWeight: 600 }
};