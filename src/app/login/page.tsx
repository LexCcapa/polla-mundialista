"use client";

import { useState, FormEvent } from "react";
// ✅ Reemplaza la línea 4 por esta:
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  async function handleLogin(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      alert("❌ Error: " + error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <main style={styles.container}>
      <div style={styles.card}>
        <div style={styles.brandHeader}>
          <span style={styles.logo}>🏆</span>
          <h1 style={styles.title}>Polla Mundialista</h1>
          <p style={styles.subtitle}>Inicia sesión para registrar tus pronósticos</p>
        </div>

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Correo Electrónico</label>
            <input
              type="email"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ 
              ...styles.button, 
              backgroundColor: loading ? "#4b5563" : "#3b82f6", 
              cursor: loading ? "not-allowed" : "pointer" 
            }}
          >
            {loading ? "Cargando..." : "⚽ Ingresar a la Cancha"}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            ¿Aún no tienes cuenta? <Link href="/register" style={styles.link}>Regístrate aquí</Link>
          </p>
        </div>
      </div>
    </main>
  );
}

// 📌 Estilos Black Premium tipados rigurosamente para evitar errores de TypeScript
const styles: Record<string, React.CSSProperties> = {
  container: { 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center", 
    minHeight: "100vh", 
    backgroundColor: "#0b0f19", 
    fontFamily: "'Segoe UI', Roboto, sans-serif", 
    padding: "20px" 
  },
  card: { 
    backgroundColor: "#111827", 
    padding: "40px 30px", 
    borderRadius: "16px", 
    width: "100%", 
    maxWidth: "420px", 
    boxShadow: "0 10px 25px rgba(0,0,0,0.4)", 
    border: "1px solid #1f2937" 
  },
  brandHeader: { 
    textAlign: "center" as const, 
    marginBottom: "30px" 
  },
  logo: { 
    fontSize: "45px", 
    display: "block", 
    marginBottom: "10px" 
  },
  title: { 
    fontSize: "24px", 
    fontWeight: 800, 
    color: "#f8fafc", 
    margin: "0 0 6px 0" 
  },
  subtitle: { 
    fontSize: "13px", 
    color: "#9ca3af", 
    margin: 0 
  },
  form: { 
    display: "flex", 
    flexDirection: "column", 
    gap: "20px" 
  },
  inputGroup: { 
    display: "flex", 
    flexDirection: "column", 
    gap: "6px" 
  },
  label: { 
    fontSize: "13px", 
    fontWeight: 600, 
    color: "#9ca3af" 
  },
  input: { 
    height: "45px", 
    padding: "0 14px", 
    borderRadius: "8px", 
    border: "1px solid #374151", 
    fontSize: "14px", 
    backgroundColor: "#1f2937", 
    color: "#f8fafc", 
    outline: "none" 
  },
  button: { 
    height: "48px", 
    color: "#ffffff", 
    border: "none", 
    borderRadius: "8px", 
    fontSize: "15px", 
    fontWeight: 700, 
    marginTop: "10px", 
    boxShadow: "0 4px 14px rgba(59, 130, 246, 0.3)" 
  },
  footer: { 
    textAlign: "center" as const, 
    marginTop: "25px", 
    borderTop: "1px solid #1f2937", 
    paddingTop: "20px" 
  },
  footerText: { 
    margin: 0, 
    fontSize: "13px", 
    color: "#9ca3af" 
  },
  link: { 
    color: "#3b82f6", 
    textDecoration: "none", 
    fontWeight: 600 
  },
};