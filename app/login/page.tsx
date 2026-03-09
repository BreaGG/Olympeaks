// PATH: app/login/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "login" | "register";

function useIsMobile() {
  const [mob, setMob] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    setMob(mq.matches);
    const h = (e: MediaQueryListEvent) => setMob(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);
  return mob;
}

const Logo = () => (
  <svg width="26" height="24" viewBox="0 0 28 26" fill="none">
    <polygon points="14,1 27,25 1,25" fill="none" stroke="var(--gold)" strokeWidth="1.2" strokeLinejoin="round"/>
    <polygon points="14,8 21,25 7,25" fill="var(--gold)" opacity="0.12"/>
    <line x1="14" y1="1" x2="14" y2="25" stroke="var(--gold)" strokeWidth="0.8" opacity="0.4"/>
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const mob = useIsMobile();
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
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: name } },
        });
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


  const handleGoogle = async () => {
    setLoading(true);
    setError(null);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${appUrl}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
    // On success Supabase redirects the browser — no need to do anything here
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)",
    textTransform: "uppercase", letterSpacing: "0.08em",
    display: "block", marginBottom: 6,
  };
  const inputStyle = (extra?: React.CSSProperties): React.CSSProperties => ({
    width: "100%", boxSizing: "border-box",
    padding: mob ? "12px 14px" : "10px 14px",
    fontSize: mob ? 16 : 13, // 16px prevents iOS zoom-on-focus
    ...extra,
  });

  const AuthForm = () => (
    <div style={{ width: "100%", maxWidth: mob ? "100%" : 360 }}>
      <h2 style={{
        fontSize: mob ? 22 : 24, fontWeight: 300,
        fontFamily: "var(--font-display)", fontStyle: "italic",
        letterSpacing: "-0.02em", marginBottom: 5,
      }}>
        {mode === "login" ? "Welcome back" : "Create your account"}
      </h2>
      <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: mob ? 22 : 32 }}>
        {mode === "login" ? "Sign in to your athlete dashboard" : "Begin your journey to peak performance"}
      </p>

      {/* Mode toggle */}
      <div style={{
        display: "flex", padding: 3,
        background: mob ? "var(--surface)" : "var(--bg-subtle)",
        borderRadius: 9, marginBottom: mob ? 22 : 28,
        border: "1px solid var(--border)",
      }}>
        {(["login", "register"] as Mode[]).map(m => (
          <button key={m} onClick={() => { setMode(m); setError(null); }} style={{
            flex: 1, padding: mob ? "10px 0" : "8px 0",
            borderRadius: 7, border: "none",
            background: mode === m ? (mob ? "var(--gold)" : "var(--surface)") : "transparent",
            color: mode === m ? (mob ? "#0A0A08" : "var(--text)") : "var(--text-muted)",
            fontSize: 13, fontWeight: mode === m ? (mob ? 700 : 500) : 400,
            cursor: "pointer", transition: "all 0.15s",
            fontFamily: "var(--font-body)",
          }}>
            {m === "login" ? "Sign in" : "Register"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {mode === "register" && (
          <div>
            <label style={labelStyle}>Full name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="Carlos Almeida" required
              style={inputStyle()} autoComplete="name" />
          </div>
        )}
        <div>
          <label style={labelStyle}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="athlete@example.com" required
            style={inputStyle()} autoComplete="email" inputMode="email" />
        </div>
        <div>
          <label style={labelStyle}>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="••••••••" required
            style={inputStyle()} autoComplete={mode === "login" ? "current-password" : "new-password"} />
        </div>

        {error && (
          <div style={{ background: "var(--terra-dim)", border: "1px solid var(--terra)40", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "var(--terra)" }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ background: "var(--olive-dim)", border: "1px solid var(--olive)40", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "var(--olive)" }}>
            {success}
          </div>
        )}

        <button type="submit" disabled={loading} style={{
          marginTop: mob ? 6 : 4,
          padding: mob ? "14px" : "12px",
          background: "var(--gold)", color: "#0A0A08",
          border: "none", borderRadius: 8,
          fontSize: mob ? 15 : 13, fontWeight: 700,
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.7 : 1,
          letterSpacing: "0.02em",
          fontFamily: "var(--font-body)",
          WebkitTapHighlightColor: "transparent",
        }}>
          {loading ? "Loading…" : mode === "login" ? "Sign in →" : "Create account →"}
        </button>

        {/* Google OAuth */}
        <div style={{ display:"flex",alignItems:"center",gap:10,margin:"2px 0" }}>
          <div style={{ flex:1,height:1,background:"var(--border)" }} />
          <span style={{ fontSize:10,color:"var(--text-subtle)",fontFamily:"var(--font-mono)",letterSpacing:"0.08em" }}>OR</span>
          <div style={{ flex:1,height:1,background:"var(--border)" }} />
        </div>
        <button type="button" onClick={handleGoogle} disabled={loading} style={{
          padding: mob ? "13px" : "11px",
          background: "var(--surface)", color: "var(--text)",
          border: "1px solid var(--border)", borderRadius: 8,
          fontSize: mob ? 14 : 13, fontWeight: 500,
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.7 : 1,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          fontFamily: "var(--font-body)",
          WebkitTapHighlightColor: "transparent",
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>
      </form>
    </div>
  );

  // ── MOBILE layout ──────────────────────────────────────────────────────────
  if (mob) {
    return (
      <div style={{
        minHeight: "100dvh", background: "var(--bg)",
        fontFamily: "var(--font-body)", color: "var(--text)",
        display: "flex", flexDirection: "column",
      }}>
        {/* Hero strip */}
        <div style={{
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
          padding: "32px 24px 28px",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
            backgroundSize: "40px 40px", opacity: 0.28,
          }} />
          <div style={{
            position: "absolute", bottom: "-40%", right: "-5%",
            width: "250px", height: "180px",
            background: "radial-gradient(ellipse, var(--gold-dim) 0%, transparent 70%)",
          }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 18 }}>
              <Logo />
              <span style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", fontFamily: "var(--font-display)" }}>Olympeaks</span>
            </div>
            <h1 style={{
              fontFamily: "var(--font-display)", fontSize: 28,
              fontWeight: 300, fontStyle: "italic",
              color: "var(--text)", lineHeight: 1.2,
              letterSpacing: "-0.02em", marginBottom: 10,
            }}>
              Reach Your <span style={{ color: "var(--gold)" }}>Peak Performance</span>
            </h1>
            <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 14 }}>
              Training, nutrition and intelligence — unified for endurance athletes.
            </p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {["AI Coach", "Fueling", "Analysis", "Strava Sync"].map(f => (
                <span key={f} style={{
                  fontSize: 10, color: "var(--gold)",
                  border: "1px solid var(--gold)28",
                  borderRadius: 20, padding: "3px 10px",
                  fontFamily: "var(--font-mono)", letterSpacing: "0.04em",
                  background: "var(--gold-dim)",
                }}>{f}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Form */}
        <div style={{ flex: 1, padding: "28px 24px", display: "flex", flexDirection: "column" }}>
          <AuthForm />
          <div style={{ marginTop: "auto", paddingTop: 28, textAlign: "center" }}>
            <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, var(--border), var(--gold), var(--border), transparent)", marginBottom: 14, opacity: 0.35 }} />
            <p style={{ fontSize: 9, color: "var(--text-subtle)", letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>
              Data · Discipline · Peak Performance
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── DESKTOP layout ─────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100vh", background: "var(--bg)",
      display: "flex", fontFamily: "var(--font-body)", color: "var(--text)",
    }}>
      {/* Left brand panel */}
      <div style={{
        width: "44%", background: "var(--surface)",
        borderRight: "1px solid var(--border)",
        display: "flex", flexDirection: "column",
        padding: "52px 56px", position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
          backgroundSize: "52px 52px", opacity: 0.35,
        }} />
        <div style={{
          position: "absolute", bottom: "-10%", left: "10%",
          width: "400px", height: "300px",
          background: "radial-gradient(ellipse, var(--gold-dim) 0%, transparent 70%)",
        }} />
        <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 72 }}>
            <Logo />
            <span style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", letterSpacing: "0.02em", fontFamily: "var(--font-display)" }}>Olympeaks</span>
          </div>
          <div style={{ marginBottom: 52 }}>
            <h1 style={{
              fontFamily: "var(--font-display)", fontSize: 42,
              fontWeight: 300, fontStyle: "italic",
              color: "var(--text)", lineHeight: 1.15,
              letterSpacing: "-0.02em", marginBottom: 18,
            }}>
              Reach Your<br /><span style={{ color: "var(--gold)" }}>Peak Performance</span>
            </h1>
            <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.75, maxWidth: 320 }}>
              A modern digital temple for endurance athletes. Training, nutrition and performance intelligence — unified.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {[
              { glyph: "◎", label: "Daily Intelligence",   desc: "AI coaching based on HRV, sleep and training load" },
              { glyph: "⬡", label: "Fueling Precision",    desc: "Race-day nutrition strategy calculated to the minute" },
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
          <div style={{ marginTop: "auto", paddingTop: 48 }}>
            <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, var(--border), var(--gold), var(--border), transparent)", marginBottom: 20, opacity: 0.5 }} />
            <p style={{ fontSize: 11, color: "var(--text-subtle)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              Data · Discipline · Peak Performance
            </p>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 24px" }}>
        <AuthForm />
      </div>
    </div>
  );
}