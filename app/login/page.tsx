"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "login" | "register";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/");
        router.refresh();
      } else {
        const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
        if (error) throw error;
        setSuccess("Account created. Check your email to confirm, then sign in.");
        setMode("login");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg)",
      display: "flex",
      fontFamily: "var(--font-body)",
      color: "var(--text)",
    }}>
      {/* Left — brand panel */}
      <div style={{
        width: "44%",
        background: "var(--surface)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        padding: "52px 56px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Subtle grid */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
          backgroundSize: "52px 52px",
          opacity: 0.35,
        }} />
        {/* Gold gradient glow — bottom */}
        <div style={{
          position: "absolute", bottom: "-10%", left: "10%",
          width: "400px", height: "300px",
          background: "radial-gradient(ellipse, var(--gold-dim) 0%, transparent 70%)",
        }} />

        <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column" }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 72 }}>
            <svg width="28" height="26" viewBox="0 0 28 26" fill="none">
              <polygon points="14,1 27,25 1,25" fill="none" stroke="var(--gold)" strokeWidth="1.2" strokeLinejoin="round"/>
              <polygon points="14,8 21,25 7,25" fill="var(--gold)" opacity="0.12"/>
              <line x1="14" y1="1" x2="14" y2="25" stroke="var(--gold)" strokeWidth="0.8" opacity="0.4"/>
            </svg>
            <span style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", letterSpacing: "0.02em", fontFamily: "var(--font-display)" }}>
              Olympeaks
            </span>
          </div>

          {/* Main headline */}
          <div style={{ marginBottom: 52 }}>
            <h1 style={{
              fontFamily: "var(--font-display)",
              fontSize: 42, fontWeight: 300, fontStyle: "italic",
              color: "var(--text)", lineHeight: 1.15,
              letterSpacing: "-0.02em", marginBottom: 18,
            }}>
              Reach Your<br />
              <span style={{ color: "var(--gold)" }}>Peak Performance</span>
            </h1>
            <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.75, maxWidth: 320 }}>
              A modern digital temple for endurance athletes. Training, nutrition and performance intelligence — unified.
            </p>
          </div>

          {/* Feature list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {[
              { glyph: "◎", label: "Daily Intelligence", desc: "AI coaching based on HRV, sleep and training load" },
              { glyph: "⬡", label: "Fueling Precision", desc: "Race-day nutrition strategy calculated to the minute" },
              { glyph: "∿", label: "Performance Analysis", desc: "6-week trend analysis with actionable insights" },
            ].map(f => (
              <div key={f.label} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <span style={{ fontSize: 14, color: "var(--gold)", width: 18, marginTop: 1, opacity: 0.8 }}>{f.glyph}</span>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", marginBottom: 3 }}>{f.label}</p>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom tagline */}
          <div style={{ marginTop: "auto", paddingTop: 48 }}>
            <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, var(--border), var(--gold), var(--border), transparent)", marginBottom: 20, opacity: 0.5 }} />
            <p style={{ fontSize: 11, color: "var(--text-subtle)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              Data · Discipline · Peak Performance
            </p>
          </div>
        </div>
      </div>

      {/* Right — auth form */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 24px" }}>
        <div style={{ width: "100%", maxWidth: 360 }}>
          <h2 style={{ fontSize: 24, fontWeight: 300, fontFamily: "var(--font-display)", fontStyle: "italic", letterSpacing: "-0.02em", marginBottom: 6 }}>
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h2>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 32 }}>
            {mode === "login" ? "Sign in to your athlete dashboard" : "Begin your journey to peak performance"}
          </p>

          {/* Toggle */}
          <div style={{ display: "flex", background: "var(--bg-subtle)", borderRadius: 9, padding: 3, marginBottom: 28, border: "1px solid var(--border)" }}>
            {(["login", "register"] as Mode[]).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(null); }} style={{
                flex: 1, padding: "8px 0", borderRadius: 7, border: "none",
                background: mode === m ? "var(--surface)" : "transparent",
                color: mode === m ? "var(--text)" : "var(--text-muted)",
                fontSize: 13, fontWeight: mode === m ? 500 : 400,
                cursor: "pointer", transition: "all 0.15s",
                boxShadow: mode === m ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
              }}>
                {m === "login" ? "Sign in" : "Register"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {mode === "register" && (
              <div>
                <label style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500, display: "block", marginBottom: 6, letterSpacing: "0.04em" }}>Full name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Carlos Almeida" required style={{ width: "100%", padding: "10px 14px", boxSizing: "border-box" }} />
              </div>
            )}
            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500, display: "block", marginBottom: 6, letterSpacing: "0.04em" }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="athlete@example.com" required style={{ width: "100%", padding: "10px 14px", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500, display: "block", marginBottom: 6, letterSpacing: "0.04em" }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required style={{ width: "100%", padding: "10px 14px", boxSizing: "border-box" }} />
            </div>

            {error && (
              <div style={{ background: "var(--terra-dim)", border: "1px solid var(--terra)", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "var(--terra)", opacity: 0.9 }}>
                {error}
              </div>
            )}
            {success && (
              <div style={{ background: "var(--olive-dim)", border: "1px solid var(--olive)", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "var(--olive)" }}>
                {success}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              marginTop: 4, padding: "12px",
              background: "var(--gold)", color: "var(--bg)",
              border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1, letterSpacing: "0.01em",
              fontFamily: "var(--font-body)",
            }}>
              {loading ? "Loading..." : mode === "login" ? "Sign in →" : "Create account →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}