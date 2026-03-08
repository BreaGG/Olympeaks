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

  // ─── Shared form ──────────────────────────────────────────────────────────
  const Form = () => (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {mode === "register" && (
        <div>
          <label style={lbl}>Full name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)}
            placeholder="Carlos Almeida" required autoComplete="name"
            style={{ ...inp, fontSize: mob ? 16 : 13 }} />
        </div>
      )}
      <div>
        <label style={lbl}>Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
          placeholder="athlete@example.com" required
          inputMode="email" autoComplete="email"
          style={{ ...inp, fontSize: mob ? 16 : 13 }} />
      </div>
      <div>
        <label style={lbl}>Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)}
          placeholder="••••••••" required
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          style={{ ...inp, fontSize: mob ? 16 : 13 }} />
      </div>

      {error && (
        <div style={{ background:"var(--terra-dim)", border:"1px solid var(--terra)40", borderRadius:8, padding:"10px 14px", fontSize:12, color:"var(--terra)" }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ background:"var(--olive-dim)", border:"1px solid var(--olive)40", borderRadius:8, padding:"10px 14px", fontSize:12, color:"var(--olive)" }}>
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

  // ─── Shared toggle ────────────────────────────────────────────────────────
  const Toggle = () => (
    <div style={{
      display:"flex", padding:3,
      background: mob ? "var(--bg)" : "var(--bg-subtle)",
      borderRadius:9, marginBottom: mob ? 22 : 28,
      border:"1px solid var(--border)",
    }}>
      {(["login","register"] as Mode[]).map(m => (
        <button key={m} onClick={() => { setMode(m); setError(null); }} style={{
          flex:1, padding: mob ? "11px 0" : "8px 0",
          borderRadius:7, border:"none",
          background: mode===m ? (mob ? "var(--gold)" : "var(--surface)") : "transparent",
          color: mode===m ? (mob ? "#0A0A08" : "var(--text)") : "var(--text-muted)",
          fontSize:13, fontWeight: mode===m ? (mob ? 700 : 500) : 400,
          cursor:"pointer", transition:"all 0.15s",
          fontFamily:"var(--font-body)",
          WebkitTapHighlightColor:"transparent",
        }}>
          {m === "login" ? "Sign in" : "Register"}
        </button>
      ))}
    </div>
  );

  const lbl: React.CSSProperties = {
    fontSize:10, color:"var(--text-muted)", fontFamily:"var(--font-mono)",
    textTransform:"uppercase", letterSpacing:"0.08em",
    display:"block", marginBottom:6,
  };
  const inp: React.CSSProperties = {
    width:"100%", boxSizing:"border-box",
    padding: mob ? "13px 14px" : "10px 14px",
  };

  // ─── MOBILE ───────────────────────────────────────────────────────────────
  if (mob) return (
    <div style={{
      minHeight:"100dvh", background:"var(--bg)",
      fontFamily:"var(--font-body)", color:"var(--text)",
      display:"flex", flexDirection:"column",
    }}>
      {/* Hero */}
      <div style={{
        background:"var(--surface)", borderBottom:"1px solid var(--border)",
        padding:"36px 24px 30px", position:"relative", overflow:"hidden", flexShrink:0,
      }}>
        {/* Grid */}
        <div style={{
          position:"absolute", inset:0,
          backgroundImage:`linear-gradient(var(--border) 1px,transparent 1px),linear-gradient(90deg,var(--border) 1px,transparent 1px)`,
          backgroundSize:"40px 40px", opacity:0.28,
        }}/>
        {/* Glow */}
        <div style={{
          position:"absolute", bottom:"-50%", right:"-5%",
          width:220, height:180,
          background:"radial-gradient(ellipse,var(--gold-dim) 0%,transparent 70%)",
        }}/>
        <div style={{ position:"relative", zIndex:1 }}>
          {/* Wordmark */}
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
            <Logo />
            <span style={{ fontSize:15, fontWeight:600, color:"var(--text)", fontFamily:"var(--font-display)", letterSpacing:"0.01em" }}>
              Olympeaks
            </span>
          </div>
          {/* Headline */}
          <h1 style={{
            fontFamily:"var(--font-display)", fontSize:28,
            fontWeight:300, fontStyle:"italic",
            color:"var(--text)", lineHeight:1.2,
            letterSpacing:"-0.02em", marginBottom:10,
          }}>
            Reach Your{" "}
            <span style={{ color:"var(--gold)" }}>Peak Performance</span>
          </h1>
          <p style={{ fontSize:12, color:"var(--text-muted)", lineHeight:1.65, marginBottom:16 }}>
            Training, nutrition and intelligence — unified for endurance athletes.
          </p>
          {/* Feature pills */}
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {["AI Coach","Fueling","Analysis","Strava Sync"].map(f=>(
              <span key={f} style={{
                fontSize:10, color:"var(--gold)",
                border:"1px solid var(--gold)28", borderRadius:20,
                padding:"3px 10px", fontFamily:"var(--font-mono)",
                letterSpacing:"0.04em", background:"var(--gold-dim)",
              }}>{f}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <div style={{ flex:1, padding:"28px 24px", display:"flex", flexDirection:"column" }}>
        <h2 style={{
          fontSize:20, fontWeight:300,
          fontFamily:"var(--font-display)", fontStyle:"italic",
          letterSpacing:"-0.02em", marginBottom:4,
        }}>
          {mode==="login" ? "Welcome back" : "Create your account"}
        </h2>
        <p style={{ fontSize:12, color:"var(--text-muted)", marginBottom:20 }}>
          {mode==="login" ? "Sign in to your athlete dashboard" : "Begin your journey to peak performance"}
        </p>
        <Toggle />
        <Form />
        {/* Bottom */}
        <div style={{ marginTop:"auto", paddingTop:28, textAlign:"center" }}>
          <div style={{ height:1, background:"linear-gradient(90deg,transparent,var(--border),var(--gold),var(--border),transparent)", marginBottom:14, opacity:0.35 }}/>
          <p style={{ fontSize:9, color:"var(--text-subtle)", letterSpacing:"0.14em", textTransform:"uppercase", fontFamily:"var(--font-mono)" }}>
            Data · Discipline · Peak Performance
          </p>
        </div>
      </div>
    </div>
  );

  // ─── DESKTOP ──────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex", fontFamily:"var(--font-body)", color:"var(--text)" }}>
      {/* Left brand panel */}
      <div style={{
        width:"44%", background:"var(--surface)", borderRight:"1px solid var(--border)",
        display:"flex", flexDirection:"column", padding:"52px 56px",
        position:"relative", overflow:"hidden",
      }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:`linear-gradient(var(--border) 1px,transparent 1px),linear-gradient(90deg,var(--border) 1px,transparent 1px)`, backgroundSize:"52px 52px", opacity:0.35 }}/>
        <div style={{ position:"absolute", bottom:"-10%", left:"10%", width:400, height:300, background:"radial-gradient(ellipse,var(--gold-dim) 0%,transparent 70%)" }}/>
        <div style={{ position:"relative", zIndex:1, flex:1, display:"flex", flexDirection:"column" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:72 }}>
            <Logo />
            <span style={{ fontSize:15, fontWeight:600, color:"var(--text)", letterSpacing:"0.02em", fontFamily:"var(--font-display)" }}>Olympeaks</span>
          </div>
          <div style={{ marginBottom:52 }}>
            <h1 style={{ fontFamily:"var(--font-display)", fontSize:42, fontWeight:300, fontStyle:"italic", color:"var(--text)", lineHeight:1.15, letterSpacing:"-0.02em", marginBottom:18 }}>
              Reach Your<br /><span style={{ color:"var(--gold)" }}>Peak Performance</span>
            </h1>
            <p style={{ fontSize:14, color:"var(--text-muted)", lineHeight:1.75, maxWidth:320 }}>
              A modern digital temple for endurance athletes. Training, nutrition and performance intelligence — unified.
            </p>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
            {[
              { glyph:"◎", label:"Daily Intelligence",   desc:"AI coaching based on HRV, sleep and training load" },
              { glyph:"⬡", label:"Fueling Precision",    desc:"Race-day nutrition strategy calculated to the minute" },
              { glyph:"∿", label:"Performance Analysis", desc:"6-week trend analysis with actionable insights" },
            ].map(f=>(
              <div key={f.label} style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
                <span style={{ fontSize:14, color:"var(--gold)", width:18, marginTop:1, opacity:0.8 }}>{f.glyph}</span>
                <div>
                  <p style={{ fontSize:13, fontWeight:500, color:"var(--text)", marginBottom:3 }}>{f.label}</p>
                  <p style={{ fontSize:12, color:"var(--text-muted)", lineHeight:1.6 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:"auto", paddingTop:48 }}>
            <div style={{ height:1, background:"linear-gradient(90deg,transparent,var(--border),var(--gold),var(--border),transparent)", marginBottom:20, opacity:0.5 }}/>
            <p style={{ fontSize:11, color:"var(--text-subtle)", letterSpacing:"0.12em", textTransform:"uppercase" }}>Data · Discipline · Peak Performance</p>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"48px 24px" }}>
        <div style={{ width:"100%", maxWidth:360 }}>
          <h2 style={{ fontSize:24, fontWeight:300, fontFamily:"var(--font-display)", fontStyle:"italic", letterSpacing:"-0.02em", marginBottom:6 }}>
            {mode==="login" ? "Welcome back" : "Create your account"}
          </h2>
          <p style={{ fontSize:13, color:"var(--text-muted)", marginBottom:32 }}>
            {mode==="login" ? "Sign in to your athlete dashboard" : "Begin your journey to peak performance"}
          </p>
          <Toggle />
          <Form />
        </div>
      </div>
    </div>
  );
}