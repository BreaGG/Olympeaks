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

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const mob = useIsMobile();
  const supabase = createClient();

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
    setGoogleLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin}/auth/callback`,
          queryParams: { access_type: "offline", prompt: "consent" },
        },
      });
      if (error) throw error;
      // Redirect handled by Supabase
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Google sign-in failed");
      setGoogleLoading(false);
    }
  };

  // ─── Style tokens ─────────────────────────────────────────────────────────
  const lbl: React.CSSProperties = {
    fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)",
    textTransform: "uppercase", letterSpacing: "0.08em",
    display: "block", marginBottom: 6,
  };
  const inp: React.CSSProperties = {
    width: "100%", boxSizing: "border-box",
    padding: mob ? "13px 14px" : "10px 14px",
    background: "var(--bg)", border: "1px solid var(--border)",
    borderRadius: 7, color: "var(--text)",
    fontFamily: "var(--font-body)", fontSize: mob ? 16 : 13,
    outline: "none", transition: "border-color 0.15s",
    // fontSize 16 on mobile prevents iOS zoom-on-focus
  };

  // ─── Shared blocks as plain JSX (NOT sub-components — fixes focus loss bug) ──
  const toggleBlock = (
    <div style={{
      display: "flex", padding: 3,
      background: "var(--bg)",
      borderRadius: 9, marginBottom: mob ? 22 : 24,
      border: "1px solid var(--border)",
    }}>
      {(["login", "register"] as Mode[]).map(m => (
        <button
          key={m} type="button"
          onClick={() => { setMode(m); setError(null); }}
          style={{
            flex: 1, padding: mob ? "11px 0" : "8px 0",
            borderRadius: 7, border: "none",
            background: mode === m ? "var(--surface)" : "transparent",
            color: mode === m ? "var(--text)" : "var(--text-muted)",
            fontSize: 13, fontWeight: mode === m ? 500 : 400,
            cursor: "pointer", transition: "all 0.15s",
            fontFamily: "var(--font-body)",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          {m === "login" ? "Sign in" : "Register"}
        </button>
      ))}
    </div>
  );

  const googleBlock = (
    <button
      type="button"
      onClick={handleGoogle}
      disabled={googleLoading || loading}
      style={{
        width: "100%", display: "flex", alignItems: "center",
        justifyContent: "center", gap: 10,
        padding: mob ? "13px" : "10px 14px",
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 8, cursor: googleLoading ? "not-allowed" : "pointer",
        fontSize: mob ? 14 : 13, color: "var(--text)",
        fontFamily: "var(--font-body)", fontWeight: 500,
        opacity: googleLoading ? 0.7 : 1,
        transition: "border-color 0.15s",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {googleLoading
        ? <span style={{ color: "var(--text-muted)" }}>Redirecting…</span>
        : <><GoogleIcon /><span>Continue with Google</span></>
      }
    </button>
  );

  const dividerBlock = (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "18px 0" }}>
      <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
      <span style={{ fontSize: 10, color: "var(--text-subtle)", fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase" }}>or</span>
      <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
    </div>
  );

  const formBlock = (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {mode === "register" && (
        <div>
          <label style={lbl}>Full name</label>
          <input
            type="text" value={name} onChange={e => setName(e.target.value)}
            placeholder="Carlos Almeida" required autoComplete="name"
            style={inp}
          />
        </div>
      )}
      <div>
        <label style={lbl}>Email</label>
        <input
          type="email" value={email} onChange={e => setEmail(e.target.value)}
          placeholder="athlete@example.com" required
          inputMode="email" autoComplete="email"
          style={inp}
        />
      </div>
      <div>
        <label style={lbl}>Password</label>
        <input
          type="password" value={password} onChange={e => setPassword(e.target.value)}
          placeholder="••••••••" required
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          style={inp}
        />
      </div>

      {error && (
        <div style={{ background: "#B8684014", border: "1px solid #B8684050", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "var(--terra, #B86840)" }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ background: "#5C704014", border: "1px solid #5C704050", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "var(--olive, #5C7040)" }}>
          {success}
        </div>
      )}

      <button type="submit" disabled={loading} style={{
        marginTop: mob ? 8 : 4,
        padding: mob ? "15px" : "12px",
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
    </form>
  );

  // ─── MOBILE ───────────────────────────────────────────────────────────────
  if (mob) return (
    <div style={{ minHeight: "100dvh", background: "var(--bg)", fontFamily: "var(--font-body)", color: "var(--text)", display: "flex", flexDirection: "column" }}>
      {/* Hero */}
      <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)", padding: "36px 24px 30px", position: "relative", overflow: "hidden", flexShrink: 0 }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(var(--border) 1px,transparent 1px),linear-gradient(90deg,var(--border) 1px,transparent 1px)`, backgroundSize: "40px 40px", opacity: 0.28 }} />
        <div style={{ position: "absolute", bottom: "-50%", right: "-5%", width: 220, height: 180, background: "radial-gradient(ellipse,var(--gold-dim) 0%,transparent 70%)" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <Logo />
            <span style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", fontFamily: "var(--font-display)", letterSpacing: "0.01em" }}>Olympeaks</span>
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 300, fontStyle: "italic", color: "var(--text)", lineHeight: 1.2, letterSpacing: "-0.02em", marginBottom: 10 }}>
            Reach Your <span style={{ color: "var(--gold)" }}>Peak Performance</span>
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.65, marginBottom: 16 }}>
            Training, nutrition and intelligence — unified for endurance athletes.
          </p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["AI Coach", "Fueling", "Analysis", "Strava Sync"].map(f => (
              <span key={f} style={{ fontSize: 10, color: "var(--gold)", border: "1px solid var(--gold)28", borderRadius: 20, padding: "3px 10px", fontFamily: "var(--font-mono)", letterSpacing: "0.04em", background: "var(--gold-dim)" }}>{f}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Form area */}
      <div style={{ flex: 1, padding: "28px 24px", display: "flex", flexDirection: "column" }}>
        <h2 style={{ fontSize: 20, fontWeight: 300, fontFamily: "var(--font-display)", fontStyle: "italic", letterSpacing: "-0.02em", marginBottom: 4 }}>
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h2>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>
          {mode === "login" ? "Sign in to your athlete dashboard" : "Begin your journey to peak performance"}
        </p>
        {toggleBlock}
        {googleBlock}
        {dividerBlock}
        {formBlock}
        <div style={{ marginTop: "auto", paddingTop: 28, textAlign: "center" }}>
          <div style={{ height: 1, background: "linear-gradient(90deg,transparent,var(--border),var(--gold),var(--border),transparent)", marginBottom: 14, opacity: 0.35 }} />
          <p style={{ fontSize: 9, color: "var(--text-subtle)", letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>
            Data · Discipline · Peak Performance
          </p>
        </div>
      </div>
    </div>
  );

  // ─── DESKTOP ──────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", fontFamily: "var(--font-body)", color: "var(--text)" }}>
      {/* Left brand panel */}
      <div style={{ width: "44%", background: "var(--surface)", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", padding: "52px 56px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(var(--border) 1px,transparent 1px),linear-gradient(90deg,var(--border) 1px,transparent 1px)`, backgroundSize: "52px 52px", opacity: 0.35 }} />
        <div style={{ position: "absolute", bottom: "-10%", left: "10%", width: 400, height: 300, background: "radial-gradient(ellipse,var(--gold-dim) 0%,transparent 70%)" }} />
        <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 72 }}>
            <Logo />
            <span style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", letterSpacing: "0.02em", fontFamily: "var(--font-display)" }}>Olympeaks</span>
          </div>
          <div style={{ marginBottom: 52 }}>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 42, fontWeight: 300, fontStyle: "italic", color: "var(--text)", lineHeight: 1.15, letterSpacing: "-0.02em", marginBottom: 18 }}>
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
            <div style={{ height: 1, background: "linear-gradient(90deg,transparent,var(--border),var(--gold),var(--border),transparent)", marginBottom: 20, opacity: 0.5 }} />
            <p style={{ fontSize: 11, color: "var(--text-subtle)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Data · Discipline · Peak Performance</p>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 24px" }}>
        <div style={{ width: "100%", maxWidth: 380 }}>
          <h2 style={{ fontSize: 24, fontWeight: 300, fontFamily: "var(--font-display)", fontStyle: "italic", letterSpacing: "-0.02em", marginBottom: 6 }}>
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h2>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 28 }}>
            {mode === "login" ? "Sign in to your athlete dashboard" : "Begin your journey to peak performance"}
          </p>
          {toggleBlock}
          {googleBlock}
          {dividerBlock}
          {formBlock}
        </div>
      </div>
    </div>
  );
}