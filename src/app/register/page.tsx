"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentCode, setPaymentCode] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    const CODIGO_VALIDO = "POLLA2026"; 
    if (paymentCode.trim().toUpperCase() !== CODIGO_VALIDO) {
      alert("❌ El código de pago/acceso no es válido. Coordina con el administrador.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username.trim(),
          phone: phone.trim(),
          is_paid: true
        }
      }
    });

    if (error) {
      alert("❌ Error al registrar: " + error.message);
      setLoading(false);
    } else {
      alert("🎉 ¡Inscripción exitosa!");
      router.push("/login");
    }
  }

  return (
    <main style={styles.container}>
      <div style={styles.card}>
        <div style={styles.brandHeader}>
          <span style={styles.logo}>📝</span>
          <h1 style={styles.title}>Crear Cuenta</h1>
          <p style={styles.subtitle}>Inscríbete en la Polla y demuestra lo que sabes</p>
        </div>

        <form onSubmit={handleRegister} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Nombre de Usuario (Apodo en Ranking)</label>
            <input
              type="text"
              placeholder="Ej: ElInkaDelGol"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Celular / WhatsApp (Para premios)</label>
            <input
              type="tel"
              placeholder="Ej: 987654321"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              style={styles.input}
            />
          </div>

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
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.paymentBox}>
            <label style={{ ...styles.label, color: "#fcd34d" }}>🔑 Código de Pago o Inscripción</label>
            <input
              type="text"
              placeholder="Introduce el código recibido"
              value={paymentCode}
              onChange={(e) => setPaymentCode(e.target.value)}
              required
              style={{ ...styles.input, border: "1px solid #f59e0b" }}
            />
            <span style={{ fontSize: "11px", color: "#fbbf24", marginTop: "4px" }}>Pídele tu código al organizador tras realizar el abono.</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ ...styles.button, backgroundColor: loading ? "#4b5563" : "#10b981", cursor: loading ? "not-allowed" : "pointer" }}
          >
            {loading ? "Procesando..." : "🏃 Registrarme y Participar"}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            ¿Ya tienes cuenta? <Link href="/login" style={styles.link}>Inicia sesión aquí</Link>
          </p>
        </div>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", backgroundColor: "#0b0f19", fontFamily: "'Segoe UI', Roboto, sans-serif", padding: "40px 20px" },
  card: { backgroundColor: "#111827", padding: "40px 30px", borderRadius: "16px", width: "100%", maxWidth: "460px", boxShadow: "0 10px 25px rgba(0,0,0,0.4)", border: "1px solid #1f2937" },
  brandHeader: { textAlign: "center", marginBottom: "25px" },
  logo: { fontSize: "40px", display: "block", marginBottom: "10px" },
  title: { fontSize: "24px", fontWeight: 800, color: "#f8fafc", margin: "0 0 6px 0" },
  subtitle: { fontSize: "13px", color: "#9ca3af", margin: 0 },
  form: { display: "flex", flexDirection: "column", gap: "18px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "13px", fontWeight: 600, color: "#9ca3af" },
  input: { height: "42px", padding: "0 14px", borderRadius: "8px", border: "1px solid #374151", fontSize: "14px", backgroundColor: "#1f2937", color: "#f8fafc", outline: "none" },
  paymentBox: { display: "flex", flexDirection: "column", gap: "6px", backgroundColor: "#1c1917", padding: "12px", borderRadius: "8px", border: "1px dashed #78350f" },
  button: { height: "48px", color: "#ffffff", border: "none", borderRadius: "8px", fontSize: "15px", fontWeight: 700, marginTop: "10px", boxShadow: "0 4px 14px rgba(16, 185, 129, 0.3)" },
  footer: { textAlign: "center", marginTop: "25px", borderTop: "1px solid #1f2937", paddingTop: "20px" },
  footerText: { margin: 0, fontSize: "13px", color: "#9ca3af" },
  link: { color: "#10b981", textDecoration: "none", fontWeight: 600 },
};