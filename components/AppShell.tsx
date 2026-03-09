"use client";

// ─── MARKDOWN RENDERER ───────────────────────────────────────────────────────
// Lightweight — no deps. Handles: **bold**, *italic*, `code`, # headers,
// - bullets, 1. lists, > blockquote, code blocks, ---, [links](url)

function Markdown({ text, size=13, color="var(--text-2)" }: { text:string; size?:number; color?:string }) {
  if (!text) return null;
  const lines = text.split("\n");
  const els: React.ReactNode[] = [];
  let i = 0, k = 0;

  function inline(raw: string): React.ReactNode[] {
    const out: React.ReactNode[] = [];
    let s = raw, ki = 0;
    while (s.length) {
      const bim = s.match(/^(.*?)\*{3}(.+?)\*{3}/);
      if (bim) { if(bim[1]) out.push(bim[1]); out.push(<strong key={ki++} style={{fontStyle:"italic"}}>{bim[2]}</strong>); s=s.slice(bim[0].length); continue; }
      const bm = s.match(/^(.*?)\*{2}(.+?)\*{2}/);
      if (bm) { if(bm[1]) out.push(bm[1]); out.push(<strong key={ki++} style={{color:"var(--text)",fontWeight:600}}>{bm[2]}</strong>); s=s.slice(bm[0].length); continue; }
      const im = s.match(/^(.*?)(?<![\*])\*(?![\*])(.+?)(?<![\*])\*(?![\*])/);
      if (im) { if(im[1]) out.push(im[1]); out.push(<em key={ki++} style={{fontStyle:"italic",opacity:0.85}}>{im[2]}</em>); s=s.slice(im[0].length); continue; }
      const cm = s.match(/^(.*?)`(.+?)`/);
      if (cm) { if(cm[1]) out.push(cm[1]); out.push(<code key={ki++} style={{fontFamily:"var(--font-mono)",fontSize:"0.85em",background:"var(--surface-hi)",color:"var(--gold)",padding:"1px 5px",borderRadius:3,border:"1px solid var(--border)"}}>{cm[2]}</code>); s=s.slice(cm[0].length); continue; }
      const lm = s.match(/^(.*?)\[(.+?)\]\((.+?)\)/);
      if (lm) { if(lm[1]) out.push(lm[1]); out.push(<a key={ki++} href={lm[3]} target="_blank" rel="noopener noreferrer" style={{color:"var(--gold)",textDecoration:"underline",textDecorationColor:"var(--gold)40"}}>{lm[2]}</a>); s=s.slice(lm[0].length); continue; }
      out.push(s); break;
    }
    return out;
  }

  while (i < lines.length) {
    const l = lines[i];
    if (l.trim() === "") { els.push(<div key={k++} style={{height:6}} />); i++; continue; }
    if (/^[-*_]{3,}$/.test(l.trim())) { els.push(<div key={k++} style={{height:1,background:"linear-gradient(90deg,transparent,var(--border),var(--gold)40,var(--border),transparent)",margin:"12px 0",opacity:0.5}} />); i++; continue; }
    if (l.startsWith("```")) {
      const code: string[] = []; i++;
      while (i < lines.length && !lines[i].startsWith("```")) { code.push(lines[i]); i++; }
      els.push(<pre key={k++} style={{fontFamily:"var(--font-mono)",fontSize:12,background:"var(--surface-hi)",border:"1px solid var(--border)",borderRadius:6,padding:"10px 14px",overflowX:"auto",color:"var(--text-muted)",lineHeight:1.6,margin:"8px 0"}}>{code.join("\n")}</pre>); i++; continue;
    }
    const h1=l.match(/^#\s+(.+)/); if(h1){ els.push(<h3 key={k++} style={{fontFamily:"var(--font-display)",fontStyle:"italic",fontSize:size+5,fontWeight:300,color:"var(--text)",letterSpacing:"-0.02em",margin:"14px 0 4px",lineHeight:1.2}}>{inline(h1[1])}</h3>); i++; continue; }
    const h2=l.match(/^##\s+(.+)/); if(h2){ els.push(<h4 key={k++} style={{fontFamily:"var(--font-display)",fontStyle:"italic",fontSize:size+3,fontWeight:300,color:"var(--text)",letterSpacing:"-0.01em",margin:"12px 0 4px",lineHeight:1.2}}>{inline(h2[1])}</h4>); i++; continue; }
    const h3=l.match(/^###\s+(.+)/); if(h3){ els.push(<div key={k++} style={{display:"flex",alignItems:"center",gap:8,margin:"12px 0 4px"}}><div style={{width:2,height:13,background:"var(--gold)",borderRadius:1,flexShrink:0}}/><p style={{fontFamily:"var(--font-mono)",fontSize:size-1,fontWeight:600,color:"var(--text)",textTransform:"uppercase",letterSpacing:"0.08em"}}>{inline(h3[1])}</p></div>); i++; continue; }
    if (/^[\-\*]\s/.test(l)) {
      const items: string[] = [];
      while (i < lines.length && /^[\-\*]\s/.test(lines[i])) { items.push(lines[i].replace(/^[\-\*]\s/,"")); i++; }
      els.push(<ul key={k++} style={{margin:"4px 0 8px",paddingLeft:0,listStyle:"none"}}>{items.map((it,idx)=><li key={idx} style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:5}}><span style={{color:"var(--gold)",fontSize:9,marginTop:5,flexShrink:0}}>◆</span><span style={{fontSize:size,color,lineHeight:1.75}}>{inline(it)}</span></li>)}</ul>); continue;
    }
    if (/^\d+\.\s/.test(l)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) { items.push(lines[i].replace(/^\d+\.\s/,"")); i++; }
      els.push(<ol key={k++} style={{margin:"4px 0 8px",paddingLeft:0,listStyle:"none"}}>{items.map((it,idx)=><li key={idx} style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:5}}><span style={{color:"var(--gold)",fontSize:10,fontFamily:"var(--font-mono)",width:18,marginTop:3,flexShrink:0,textAlign:"right"}}>{idx+1}.</span><span style={{fontSize:size,color,lineHeight:1.75}}>{inline(it)}</span></li>)}</ol>); continue;
    }
    if (l.startsWith("> ")) { els.push(<div key={k++} style={{borderLeft:"2px solid var(--gold)",paddingLeft:12,margin:"6px 0",opacity:0.85}}><p style={{fontSize:size,color,lineHeight:1.7,fontStyle:"italic"}}>{inline(l.slice(2))}</p></div>); i++; continue; }
    els.push(<p key={k++} style={{fontSize:size,color,lineHeight:1.85,margin:"2px 0"}}>{inline(l)}</p>); i++;
  }
  return <div>{els}</div>;
}



import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, Legend,
  ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from "recharts";
import { createClient } from "@/lib/supabase/client";
import { tssColor, sportColor, formColor, getFormLabel } from "@/lib/design";
import type { Profile, Activity, DailyMetrics, TrainingMetrics } from "@/lib/types";

// ─── GREEK GEOMETRY ICONS ─────────────────────────────────────────────────────
// Each icon is a minimal SVG built on classical geometry principles

function IconDashboard({ size=16, active=false }: { size?:number; active?:boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={active?"var(--gold)":"currentColor"} strokeWidth="1">
      <rect x="1" y="1" width="6" height="6" />
      <rect x="9" y="1" width="6" height="6" />
      <rect x="1" y="9" width="6" height="6" />
      <rect x="9" y="9" width="3" height="6" />
      <rect x="13" y="9" width="2" height="6" />
    </svg>
  );
}

function IconCoach({ size=16, active=false }: { size?:number; active?:boolean }) {
  const s = active?"var(--gold)":"currentColor";
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={s} strokeWidth="1">
      <circle cx="8" cy="8" r="6.5" />
      <circle cx="8" cy="8" r="3" />
      <line x1="8" y1="1.5" x2="8" y2="5" />
      <line x1="8" y1="11" x2="8" y2="14.5" />
      <line x1="1.5" y1="8" x2="5" y2="8" />
      <line x1="11" y1="8" x2="14.5" y2="8" />
    </svg>
  );
}

function IconFueling({ size=16, active=false }: { size?:number; active?:boolean }) {
  const s = active?"var(--gold)":"currentColor";
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={s} strokeWidth="1">
      <polygon points="8,1 14,13 2,13" />
      <polygon points="8,5 11.5,11.5 4.5,11.5" fill={active?"var(--gold)":"none"} fillOpacity="0.15" />
      <line x1="8" y1="5" x2="8" y2="13" strokeOpacity="0.4" />
    </svg>
  );
}

function IconAnalysis({ size=16, active=false }: { size?:number; active?:boolean }) {
  const s = active?"var(--gold)":"currentColor";
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={s} strokeWidth="1">
      <polyline points="1,12 4,8 7,10 10,4 13,6 15,3" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="1" y1="14.5" x2="15" y2="14.5" />
    </svg>
  );
}

function IconRaces({ size=16, active=false }: { size?:number; active?:boolean }) {
  const s = active?"var(--gold)":"currentColor";
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={s} strokeWidth="1">
      <circle cx="8" cy="8" r="6.5" />
      <polygon points="8,2 9.5,6.5 14.5,6.5 10.5,9.5 12,14 8,11 4,14 5.5,9.5 1.5,6.5 6.5,6.5" fill={active?"var(--gold)":"none"} fillOpacity="0.2" />
    </svg>
  );
}

function IconActivities({ size=16, active=false }: { size?:number; active?:boolean }) {
  const s = active?"var(--gold)":"currentColor";
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={s} strokeWidth="1">
      <rect x="1" y="4" width="14" height="10" rx="1" />
      <line x1="1" y1="7" x2="15" y2="7" />
      <line x1="4" y1="1.5" x2="4" y2="5" />
      <line x1="12" y1="1.5" x2="12" y2="5" />
      <line x1="4.5" y1="10" x2="7.5" y2="10" />
      <line x1="4.5" y1="12.5" x2="9" y2="12.5" />
    </svg>
  );
}


function IconSync({ size=16, active=false }: { size?:number; active?:boolean }) {
  const s = active?"var(--gold)":"currentColor";
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={s} strokeWidth="1">
      <path d="M13,8 A5,5 0 1,1 8,3" strokeLinecap="round"/>
      <polyline points="11,1 13,3 11,5" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="5,11 3,13 5,15" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3,8 A5,5 0 1,1 8,13" strokeLinecap="round"/>
    </svg>
  );
}

function IconProfile({ size=16, active=false }: { size?:number; active?:boolean }) {
  const s = active?"var(--gold)":"currentColor";
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={s} strokeWidth="1">
      <circle cx="8" cy="5.5" r="3" />
      <path d="M1.5,14.5 C1.5,10.5 4.5,8.5 8,8.5 C11.5,8.5 14.5,10.5 14.5,14.5" />
    </svg>
  );
}

function IconMoon({ size=14 }: { size?:number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1">
      <path d="M12,8 A5,5 0 1,1 6,2 A4,4 0 0,0 12,8 Z" />
    </svg>
  );
}

function IconSun({ size=14 }: { size?:number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1">
      <circle cx="7" cy="7" r="2.5" />
      <line x1="7" y1="1" x2="7" y2="2.5" />
      <line x1="7" y1="11.5" x2="7" y2="13" />
      <line x1="1" y1="7" x2="2.5" y2="7" />
      <line x1="11.5" y1="7" x2="13" y2="7" />
      <line x1="2.8" y1="2.8" x2="3.9" y2="3.9" />
      <line x1="10.1" y1="10.1" x2="11.2" y2="11.2" />
      <line x1="11.2" y1="2.8" x2="10.1" y2="3.9" />
      <line x1="3.9" y1="10.1" x2="2.8" y2="11.2" />
    </svg>
  );
}

function IconSignOut({ size=13 }: { size?:number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1">
      <path d="M9,4 L9,2 L2,2 L2,12 L9,12 L9,10" />
      <polyline points="6,7 12,7" />
      <polyline points="10,5 12,7 10,9" />
    </svg>
  );
}

function IconPlan({ size=16, active=false }: { size?:number; active?:boolean }) {
  const s = active?"var(--gold)":"currentColor";
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={s} strokeWidth="1">
      <rect x="1.5" y="2" width="13" height="12" rx="1.5" />
      <line x1="5" y1="6" x2="11" y2="6" />
      <line x1="5" y1="9" x2="11" y2="9" />
      <line x1="5" y1="12" x2="8" y2="12" />
      <polyline points="10,10 11.5,11.5 14,8" stroke={active?"var(--gold)":"currentColor"} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconCompare({ size=16, active=false }: { size?:number; active?:boolean }) {
  const s = active?"var(--gold)":"currentColor";
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={s} strokeWidth="1">
      <line x1="8" y1="1" x2="8" y2="15" strokeDasharray="2 1.5" />
      <polyline points="1,12 3,8 5,10 7,5" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="9,11 11,7 13,9 15,4" stroke={active?"var(--gold)":"currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.6"/>
    </svg>
  );
}

function IconRecords({ size=16, active=false }: { size?:number; active?:boolean }) {
  const s = active?"var(--gold)":"currentColor";
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={s} strokeWidth="1">
      <polygon points="8,1 10,6 15,6 11,9.5 12.5,14.5 8,11.5 3.5,14.5 5,9.5 1,6 6,6" fill={active?"var(--gold)":"none"} fillOpacity="0.15" strokeLinejoin="round"/>
    </svg>
  );
}

// Sport icons as clean geometric SVGs
function SportIcon({ sport, size=13, color }: { sport:string; size?:number; color:string }) {
  const p = { fill:"none", stroke:color, strokeWidth:"1.2" };
  if (sport==="running") return (
    <svg width={size} height={size} viewBox="0 0 14 14" {...p}>
      <circle cx="9" cy="2.5" r="1.2" fill={color} stroke="none" />
      <path d="M8,4 L6,7 L3,8 M8,4 L9.5,7 L8,10 M5,10 L8,9 L10,10.5" strokeLinecap="round" />
    </svg>
  );
  if (sport==="cycling") return (
    <svg width={size} height={size} viewBox="0 0 14 14" {...p}>
      <circle cx="3" cy="9" r="2.5" />
      <circle cx="11" cy="9" r="2.5" />
      <circle cx="3" cy="9" r="0.8" fill={color} stroke="none" />
      <circle cx="11" cy="9" r="0.8" fill={color} stroke="none" />
      <path d="M7,3 L9,9 L11,9 M7,3 L5,6 L3,9" strokeLinecap="round" />
      <circle cx="7" cy="3" r="1" fill={color} stroke="none" />
    </svg>
  );
  if (sport==="swimming") return (
    <svg width={size} height={size} viewBox="0 0 14 14" {...p}>
      <path d="M1,5 Q3.5,3 7,5 Q10.5,7 13,5" strokeLinecap="round" />
      <path d="M1,8.5 Q3.5,6.5 7,8.5 Q10.5,10.5 13,8.5" strokeLinecap="round" />
      <circle cx="10" cy="3" r="1.2" fill={color} stroke="none" />
    </svg>
  );
  if (sport==="strength") return (
    <svg width={size} height={size} viewBox="0 0 14 14" {...p}>
      <rect x="5.5" y="6" width="3" height="2" />
      <rect x="1" y="5" width="2" height="4" />
      <rect x="11" y="5" width="2" height="4" />
      <line x1="3" y1="7" x2="5.5" y2="7" />
      <line x1="8.5" y1="7" x2="11" y2="7" />
      <rect x="1.5" y="4.5" width="1" height="5" rx="0.5" />
      <rect x="11.5" y="4.5" width="1" height="5" rx="0.5" />
    </svg>
  );
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" {...p}>
      <polygon points="7,1 13,13 1,13" />
    </svg>
  );
}

// ─── OLYMPIC LOGO ─────────────────────────────────────────────────────────────

function OlympeaksLogo({ size=22 }: { size?:number }) {
  return (
    <svg width={size} height={Math.round(size*0.9)} viewBox="0 0 24 22" fill="none">
      {/* Outer triangle */}
      <polygon points="12,1 23,21 1,21" stroke="var(--gold)" strokeWidth="1" fill="none" strokeLinejoin="miter"/>
      {/* Inner triangle — filled subtly */}
      <polygon points="12,7 18.5,21 5.5,21" fill="var(--gold)" fillOpacity="0.1" stroke="none"/>
      {/* Central axis — column of Parthenon */}
      <line x1="12" y1="1" x2="12" y2="21" stroke="var(--gold)" strokeWidth="0.6" opacity="0.35"/>
      {/* Horizontal crossbars — entablature */}
      <line x1="7" y1="13" x2="17" y2="13" stroke="var(--gold)" strokeWidth="0.6" opacity="0.5"/>
      <line x1="4.5" y1="18" x2="19.5" y2="18" stroke="var(--gold)" strokeWidth="0.6" opacity="0.3"/>
    </svg>
  );
}

// ─── GREEK DIVIDER ───────────────────────────────────────────────────────────

function GreekDivider({ style }: { style?:React.CSSProperties }) {
  return (
    <div style={{ display:"flex",alignItems:"center",gap:0,...style }}>
      <div style={{ flex:1,height:"1px",background:"var(--border)" }} />
      <svg width="16" height="8" viewBox="0 0 16 8" fill="none" style={{ flexShrink:0 }}>
        <path d="M0,4 L4,0 L8,4 L12,0 L16,4" stroke="var(--border)" strokeWidth="0.8" fill="none" />
      </svg>
      <div style={{ flex:1,height:"1px",background:"var(--border)" }} />
    </div>
  );
}

// ─── LAB METRIC CARD ─────────────────────────────────────────────────────────
// Crisp, data-forward, laboratory instrument aesthetic

function LabValue({ label, value, unit, color="var(--text)", hint, size="lg" }: { label:string; value:string|number; unit?:string; color?:string; hint?:string; size?:"sm"|"lg" }) {
  return (
    <div>
      <div style={{ display:"flex",alignItems:"center",gap:5,marginBottom:size==="lg"?10:6 }}>
        <p style={{ fontSize:10,color:"var(--text-muted)",letterSpacing:"0.14em",textTransform:"uppercase",fontWeight:600,fontFamily:"var(--font-mono)" }}>{label}</p>
        {hint && <HintIcon text={hint} />}
      </div>
      <div style={{ display:"flex",alignItems:"baseline",gap:3 }}>
        <span style={{ fontSize:size==="lg"?26:18,fontWeight:300,fontFamily:"var(--font-display)",color,letterSpacing:"-0.03em",lineHeight:1 }}>{value}</span>
        {unit && <span style={{ fontSize:11,color:"var(--text-muted)",fontFamily:"var(--font-mono)",letterSpacing:"0.04em" }}>{unit}</span>}
      </div>
    </div>
  );
}

// ─── THEME ───────────────────────────────────────────────────────────────────

function useTheme() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const s = localStorage.getItem("op-theme");
    if (s==="dark") { setDark(true); document.documentElement.setAttribute("data-theme","dark"); }
  }, []);
  const toggle = () => {
    const n=!dark; setDark(n);
    document.documentElement.setAttribute("data-theme",n?"dark":"light");
    localStorage.setItem("op-theme",n?"dark":"light");
  };
  return { dark, toggle };
}

// ─── HINT ICON ───────────────────────────────────────────────────────────────

function HintIcon({ text }: { text:string }) {
  const [show,setShow]=useState(false);
  const ref=useRef<HTMLButtonElement>(null);
  const [xy,setXY]=useState({x:0,y:0});
  return (
    <>
      <button ref={ref}
        onMouseEnter={()=>{if(ref.current){const r=ref.current.getBoundingClientRect();setXY({x:r.left+r.width/2,y:r.top});}setShow(true);}}
        onMouseLeave={()=>setShow(false)}
        style={{ width:13,height:13,borderRadius:"50%",border:"1px solid var(--border-hi)",background:"transparent",cursor:"help",fontSize:8,color:"var(--text-subtle)",display:"inline-flex",alignItems:"center",justifyContent:"center",flexShrink:0,padding:0,fontFamily:"var(--font-mono)",letterSpacing:0 }}>?</button>
      {show&&(
        <div style={{ position:"fixed",left:xy.x,top:xy.y-10,transform:"translate(-50%,-100%)",background:"var(--text)",color:"var(--bg)",fontSize:12,lineHeight:1.55,padding:"7px 12px",borderRadius:6,maxWidth:240,boxShadow:"0 4px 20px rgba(0,0,0,0.25)",zIndex:9999,pointerEvents:"none",textAlign:"center",fontFamily:"var(--font-body)" }}>
          {text}
        </div>
      )}
    </>
  );
}

// ─── CHART TOOLTIP — Lab style ────────────────────────────────────────────────

interface TE { name?:string; value?:number|string; color?:string; }
function OTooltip({ active, payload, label }: { active?:boolean; payload?:TE[]; label?:string }) {
  if (!active||!payload?.length) return null;
  return (
    <div style={{ background:"var(--surface)",border:"1px solid var(--border)",borderRadius:6,padding:"10px 14px",fontSize:12,boxShadow:"0 4px 24px rgba(0,0,0,0.12)" }}>
      <p style={{ color:"var(--text-muted)",marginBottom:6,fontSize:10,fontFamily:"var(--font-mono)",letterSpacing:"0.1em",textTransform:"uppercase" }}>{label}</p>
      {payload.map((p,i)=>(
        <div key={i} style={{ display:"flex",alignItems:"center",gap:8,margin:"3px 0" }}>
          <div style={{ width:4,height:4,borderRadius:"50%",background:p.color??"var(--gold)",flexShrink:0 }} />
          <span style={{ color:"var(--text-muted)",fontSize:12,fontFamily:"var(--font-mono)" }}>{p.name}</span>
          <span style={{ color:"var(--text)",fontWeight:600,fontFamily:"var(--font-mono)",marginLeft:"auto",paddingLeft:12 }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── MODAL ────────────────────────────────────────────────────────────────────

function Modal({ title, onClose, children, width=560, wide=false }: { title:string; onClose:()=>void; children:React.ReactNode; width?:number; wide?:boolean }) {
  useEffect(()=>{
    const h=(e:KeyboardEvent)=>{if(e.key==="Escape")onClose();};
    document.addEventListener("keydown",h); return ()=>document.removeEventListener("keydown",h);
  },[onClose]);
  return (
    <div className="op-modal-wrap" style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,backdropFilter:"blur(4px)",padding:wide?"12px":"16px" }} onClick={onClose}>
      <div className="op-modal-box fade-in" style={{ background:"var(--surface)",border:"1px solid var(--border)",borderRadius:12,padding:wide?"0":"24px 26px",width:"100%",maxWidth:wide?"min(92vw,1100px)":width,boxShadow:"0 32px 80px rgba(0,0,0,0.3)",maxHeight:wide?"88vh":"92vh",overflowY:wide?"hidden":"auto",display:wide?"flex":undefined,flexDirection:wide?"column":undefined }} onClick={e=>e.stopPropagation()}>
        {wide?(
          // Wide mode: sticky header + scrollable body
          <>
            <div style={{ padding:"18px 24px 14px",borderBottom:"1px solid var(--border)",flexShrink:0 }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}>
                <p style={{ fontSize:14,fontWeight:500,color:"var(--text)",fontFamily:"var(--font-display)",fontStyle:"italic",letterSpacing:"0.02em" }}>{title}</p>
                <button onClick={onClose} style={{ width:26,height:26,borderRadius:"50%",border:"1px solid var(--border)",background:"transparent",cursor:"pointer",color:"var(--text-muted)",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1 }}>×</button>
              </div>
              <GreekDivider />
            </div>
            <div style={{ flex:1,overflowY:"auto",minHeight:0 }}>{children}</div>
          </>
        ):(
          <>
            <div style={{ marginBottom:20 }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}>
                <p style={{ fontSize:14,fontWeight:500,color:"var(--text)",fontFamily:"var(--font-display)",fontStyle:"italic",letterSpacing:"0.02em" }}>{title}</p>
                <button onClick={onClose} style={{ width:26,height:26,borderRadius:"50%",border:"1px solid var(--border)",background:"transparent",cursor:"pointer",color:"var(--text-muted)",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1 }}>×</button>
              </div>
              <GreekDivider />
            </div>
            {children}
          </>
        )}
      </div>
    </div>
  );
}

function Confirm({ message, onConfirm, onCancel }: { message:string; onConfirm:()=>void; onCancel:()=>void }) {
  return (
    <Modal title="Confirm action" onClose={onCancel} width={340}>
      <p style={{ fontSize:14,color:"var(--text-muted)",lineHeight:1.65,marginBottom:22 }}>{message}</p>
      <div style={{ display:"flex",gap:10,justifyContent:"flex-end" }}>
        <Btn variant="ghost" onClick={onCancel}>Cancel</Btn>
        <Btn variant="danger" onClick={onConfirm}>Delete</Btn>
      </div>
    </Modal>
  );
}

function Toast({ message, type, onDone }: { message:string; type:"success"|"error"|"info"; onDone:()=>void }) {
  useEffect(()=>{const t=setTimeout(onDone,3000);return()=>clearTimeout(t);},[onDone]);
  const c=type==="success"?"var(--olive)":type==="error"?"var(--terra)":"var(--gold)";
  return (
    <div style={{ position:"fixed",bottom:84,right:20,zIndex:2000,background:"var(--surface)",border:`1px solid ${c}40`,borderRadius:8,padding:"10px 16px",fontSize:12,color:c,boxShadow:"0 8px 32px rgba(0,0,0,0.18)",display:"flex",alignItems:"center",gap:8,animation:"fadeUp 0.25s cubic-bezier(0.16,1,0.3,1)",maxWidth:300,fontFamily:"var(--font-mono)" }}>
      <span>{type==="success"?"✓":type==="error"?"✕":"·"}</span>{message}
    </div>
  );
}

// ─── BUTTON ───────────────────────────────────────────────────────────────────

function Btn({ children, onClick, disabled, variant="primary", size="md", fullWidth, style:xs, type="button" }: {
  children:React.ReactNode; onClick?:()=>void; disabled?:boolean;
  variant?:"primary"|"ghost"|"danger"|"outline"; size?:"sm"|"md";
  fullWidth?:boolean; style?:React.CSSProperties; type?:"button"|"submit";
}) {
  const bg=variant==="primary"?"var(--gold)":variant==="danger"?"var(--terra)":"transparent";
  const col=variant==="primary"||variant==="danger"?"#fff":"var(--text-muted)";
  const bd=variant==="outline"?"1px solid var(--border-hi)":variant==="ghost"?"1px solid var(--border)":"none";
  const p=size==="sm"?"6px 12px":"10px 20px";
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{ padding:p,background:bg,color:col,border:bd,borderRadius:6,fontSize:size==="sm"?11:12,fontWeight:600,cursor:disabled?"not-allowed":"pointer",opacity:disabled?0.55:1,width:fullWidth?"100%":"auto",fontFamily:"var(--font-mono)",letterSpacing:"0.03em",transition:"opacity 0.15s,transform 0.1s",whiteSpace:"nowrap",...xs }}>
      {children}
    </button>
  );
}

// ─── FIELD / INPUT / SELECT ───────────────────────────────────────────────────

function Field({ label, hint, children, col }: { label:string; hint?:string; children:React.ReactNode; col?:number }) {
  return (
    <div style={{ gridColumn:col?`span ${col}`:undefined }}>
      <div style={{ display:"flex",alignItems:"center",gap:5,marginBottom:6 }}>
        <label style={{ fontSize:10,color:"var(--text-muted)",letterSpacing:"0.08em",textTransform:"uppercase",fontFamily:"var(--font-mono)" }}>{label}</label>
        {hint&&<HintIcon text={hint} />}
      </div>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type="text", style:s }: { value:string; onChange:(v:string)=>void; placeholder?:string; type?:string; style?:React.CSSProperties }) {
  return <input type={type} value={value} placeholder={placeholder} onChange={e=>onChange(e.target.value)} style={{ width:"100%",padding:"9px 12px",boxSizing:"border-box",...s }} />;
}

function Sel({ value, onChange, options }: { value:string; onChange:(v:string)=>void; options:string[]|Array<{v:string;l:string}> }) {
  return (
    <select value={value} onChange={e=>onChange(e.target.value)} style={{ width:"100%",padding:"9px 12px",boxSizing:"border-box" }}>
      {options.map(o=>typeof o==="string"?<option key={o} value={o}>{o}</option>:<option key={o.v} value={o.v}>{o.l}</option>)}
    </select>
  );
}

// ─── CARD PRIMITIVES ─────────────────────────────────────────────────────────

function Card({ children, style, p=16, className }: { children:React.ReactNode; style?:React.CSSProperties; p?:number; className?:string }) {
  return <div className={className} style={{ background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8,...style,padding:p }}>{children}</div>;
}

function SectionTitle({ children, sub, right, mono }: { children:React.ReactNode; sub?:string; right?:React.ReactNode; mono?:boolean }) {
  return (
    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16 }}>
      <div>
        <p style={{ fontSize:mono?10:12,fontWeight:mono?600:500,color:"var(--text)",marginBottom:sub?3:0,fontFamily:mono?"var(--font-mono)":undefined,letterSpacing:mono?"0.08em":undefined,textTransform:mono?"uppercase":undefined }}>{children}</p>
        {sub&&<p style={{ fontSize:11,color:"var(--text-muted)",fontFamily:"var(--font-mono)",letterSpacing:"0.04em" }}>{sub}</p>}
      </div>
      {right}
    </div>
  );
}

function PageHeader({ supra, title, action }: { supra:string; title:string; action?:React.ReactNode }) {
  return (
    <div className="op-page-header" style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-end",borderBottom:"1px solid var(--border)",paddingBottom:18,marginBottom:22 }}>
      <div>
        <p style={{ fontSize:11,color:"var(--text-muted)",letterSpacing:"0.18em",textTransform:"uppercase",marginBottom:5,fontFamily:"var(--font-mono)" }}>{supra}</p>
        <h1 style={{ fontSize:26,fontWeight:300,fontFamily:"var(--font-display)",fontStyle:"italic",color:"var(--text)",letterSpacing:"-0.02em" }}>{title}</h1>
      </div>
      {action&&<div>{action}</div>}
    </div>
  );
}

function InsightCard({ accent, tag, children }: { accent:string; tag:string; children:React.ReactNode }) {
  return (
    <div style={{ background:"var(--surface)",border:"1px solid var(--border)",borderLeft:`2px solid ${accent}`,borderRadius:"0 10px 10px 0",padding:"18px 22px" }}>
      <p style={{ fontSize:9,fontWeight:700,color:accent,letterSpacing:"0.16em",textTransform:"uppercase",marginBottom:12,fontFamily:"var(--font-mono)" }}>{tag}</p>
      {children}
    </div>
  );
}

function Badge({ color, children }: { color:string; children:React.ReactNode }) {
  return <span style={{ display:"inline-flex",alignItems:"center",padding:"2px 8px",borderRadius:3,background:color+"12",border:`1px solid ${color}25`,fontSize:10,color,fontWeight:600,fontFamily:"var(--font-mono)",letterSpacing:"0.06em" }}>{children}</span>;
}

function EmptyState({ label }: { label:string }) {
  return (
    <div style={{ minHeight:160,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12 }}>
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="var(--border-hi)" strokeWidth="1">
        <circle cx="16" cy="16" r="14" />
        <line x1="16" y1="10" x2="16" y2="18" />
        <circle cx="16" cy="22" r="1" fill="var(--border-hi)" stroke="none" />
      </svg>
      <p style={{ fontSize:12,color:"var(--text-subtle)",fontStyle:"italic",fontFamily:"var(--font-display)" }}>{label}</p>
    </div>
  );
}

// ─── METRIC ROW — 4 lab panels seamless ──────────────────────────────────────

function MetricRow({ items }: { items:Array<{ label:string; value:string; unit?:string; sub?:string; accent:string; hint:string }> }) {
  return (
    <div className="op-metric-row" style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:1,background:"var(--border)",borderRadius:10,overflow:"hidden",border:"1px solid var(--border)" }}>
      {items.map((item,i)=>(
        <div key={i} style={{ background:"var(--surface)",padding:"18px 20px",position:"relative" }}>
          {/* Lab-style accent bar */}
          <div style={{ position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg, ${item.accent}, ${item.accent}80)` }} />
          <div style={{ display:"flex",alignItems:"center",gap:5,marginBottom:10 }}>
            <p style={{ fontSize:10,color:"var(--text-muted)",letterSpacing:"0.14em",textTransform:"uppercase",fontWeight:600,fontFamily:"var(--font-mono)" }}>{item.label}</p>
            <HintIcon text={item.hint} />
          </div>
          <div style={{ display:"flex",alignItems:"baseline",gap:3 }}>
            <span style={{ fontSize:26,fontWeight:300,fontFamily:"var(--font-display)",color:"var(--text)",letterSpacing:"-0.03em",lineHeight:1 }}>{item.value}</span>
            {item.unit&&<span style={{ fontSize:11,color:"var(--text-muted)",fontFamily:"var(--font-mono)" }}>{item.unit}</span>}
          </div>
          {item.sub&&<p style={{ fontSize:11,color:"var(--text-muted)",marginTop:5,fontFamily:"var(--font-mono)" }}>{item.sub}</p>}
        </div>
      ))}
    </div>
  );
}

// ─── ACTIVITY FORM ────────────────────────────────────────────────────────────

// ─── GOAL EDITOR ─────────────────────────────────────────────────────────────

type GoalData = { name:string; date:string; distance:string; targetTime:string };

const RACE_PRESETS = [
  { label:"5K",          distance:"5 km",              category:"run"   },
  { label:"10K",         distance:"10 km",             category:"run"   },
  { label:"Half",        distance:"21.1 km",           category:"run"   },
  { label:"Marathon",    distance:"42.2 km",           category:"run"   },
  { label:"Ultra 50K",   distance:"50 km",             category:"run"   },
  { label:"Ultra 100K",  distance:"100 km",            category:"run"   },
  { label:"Sprint",      distance:"750m/20km/5km",     category:"tri"   },
  { label:"Olympic",     distance:"1.5km/40km/10km",   category:"tri"   },
  { label:"70.3",        distance:"1.9km/90km/21.1km", category:"tri"   },
  { label:"Ironman",     distance:"3.8km/180km/42km",  category:"tri"   },
  { label:"Gran Fondo",  distance:"100+ km",           category:"cycle" },
  { label:"Century",     distance:"160 km",            category:"cycle" },
  { label:"Custom",      distance:"",                  category:"other" },
];

function GoalEditor({ initial, onSave }: { initial:GoalData|null; onSave:(g:GoalData)=>void }) {
  const [f,setF]=useState<GoalData>(initial??{name:"",date:"",distance:"",targetTime:""});
  const [preset,setPreset]=useState<string>(
    RACE_PRESETS.find(p=>p.distance===initial?.distance)?.label??"Custom"
  );
  const s=(k:keyof GoalData)=>(v:string)=>setF(p=>({...p,[k]:v}));

  const daysLeft=f.date?Math.ceil((new Date(f.date).getTime()-Date.now())/86400000):null;
  const canSave=f.name.trim()&&f.date;

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
      {/* Race name */}
      <div style={{ display:"grid",gridTemplateColumns:"80px 1fr",gap:10,alignItems:"center" }}>
        <span style={{ fontSize:11,color:"var(--text-muted)",fontFamily:"var(--font-mono)",textTransform:"uppercase",letterSpacing:"0.08em" }}>Race name</span>
        <input value={f.name} onChange={e=>s("name")(e.target.value)} placeholder="e.g. Berlin Marathon"
          style={{ padding:"7px 10px",borderRadius:5,border:"1px solid var(--border)",background:"var(--bg)",color:"var(--text)",fontSize:12,fontFamily:"var(--font-mono)",width:"100%",boxSizing:"border-box" }} />
      </div>

      {/* Distance presets — grouped by category */}
      <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
        <span style={{ fontSize:11,color:"var(--text-muted)",fontFamily:"var(--font-mono)",textTransform:"uppercase",letterSpacing:"0.08em" }}>Distance</span>
        {(["run","tri","cycle","other"] as const).map(cat=>{
          const catLabel:{[k:string]:string}={run:"Running",tri:"Triathlon",cycle:"Cycling",other:"Other"};
          const items=RACE_PRESETS.filter(p=>p.category===cat);
          return (
            <div key={cat} style={{ display:"flex",alignItems:"center",gap:8 }}>
              <span style={{ fontSize:11,color:"var(--text-muted)",fontFamily:"var(--font-mono)",width:56,flexShrink:0 }}>{catLabel[cat]}</span>
              <div style={{ display:"flex",gap:4,flexWrap:"wrap" }}>
                {items.map(p=>(
                  <button key={p.label} onClick={()=>{setPreset(p.label);if(p.distance)s("distance")(p.distance);}}
                    style={{ padding:"4px 10px",borderRadius:4,cursor:"pointer",fontSize:10,border:`1px solid ${preset===p.label?"var(--gold)":"var(--border)"}`,background:preset===p.label?"var(--gold-dim)":"transparent",color:preset===p.label?"var(--gold)":"var(--text-muted)",fontFamily:"var(--font-mono)",whiteSpace:"nowrap" }}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
        {preset==="Custom"&&(
          <div style={{ display:"flex",alignItems:"center",gap:8 }}>
            <span style={{ fontSize:11,color:"var(--text-muted)",fontFamily:"var(--font-mono)",width:56,flexShrink:0 }}>Distance</span>
            <input value={f.distance} onChange={e=>s("distance")(e.target.value)} placeholder="e.g. 50 km"
              style={{ padding:"6px 10px",borderRadius:4,border:"1px solid var(--border)",background:"var(--bg)",color:"var(--text)",fontSize:12,fontFamily:"var(--font-mono)",width:120 }} />
          </div>
        )}
      </div>

      {/* Race date */}
      <div style={{ display:"grid",gridTemplateColumns:"80px 1fr auto",gap:10,alignItems:"center" }}>
        <span style={{ fontSize:11,color:"var(--text-muted)",fontFamily:"var(--font-mono)",textTransform:"uppercase",letterSpacing:"0.08em" }}>Race date</span>
        <input type="date" value={f.date} onChange={e=>s("date")(e.target.value)}
          style={{ padding:"7px 10px",borderRadius:5,border:"1px solid var(--border)",background:"var(--bg)",color:"var(--text)",fontSize:12,fontFamily:"var(--font-mono)",colorScheme:"dark" }} />
        {daysLeft!==null&&(
          <span style={{ fontSize:9,color:daysLeft<0?"var(--terra)":daysLeft<42?"var(--gold)":"var(--olive)",fontFamily:"var(--font-mono)",whiteSpace:"nowrap" }}>
            {daysLeft<0?`${Math.abs(daysLeft)}d ago`:`${daysLeft} days`}
          </span>
        )}
      </div>

      {/* Target time */}
      <div style={{ display:"grid",gridTemplateColumns:"80px 1fr",gap:10,alignItems:"center" }}>
        <span style={{ fontSize:11,color:"var(--text-muted)",fontFamily:"var(--font-mono)",textTransform:"uppercase",letterSpacing:"0.08em" }}>Target time</span>
        <input value={f.targetTime} onChange={e=>s("targetTime")(e.target.value)} placeholder="e.g. 3:30:00  (optional)"
          style={{ padding:"7px 10px",borderRadius:5,border:"1px solid var(--border)",background:"var(--bg)",color:"var(--text)",fontSize:12,fontFamily:"var(--font-mono)",width:"100%",boxSizing:"border-box" }} />
      </div>

      <Btn onClick={()=>canSave&&onSave(f)} disabled={!canSave} size="sm">Save goal →</Btn>
    </div>
  );
}

// ─── ACTIVITY FORM ────────────────────────────────────────────────────────────

type AF={title:string;sport:string;type:string;date:string;duration_h:string;duration_m:string;distance:string;elev:string;avg_hr:string;max_hr:string;avg_power:string;np:string;tss:string;calories:string;feel:string;notes:string};
const EMPTY_AF:AF={title:"",sport:"running",type:"easy",date:new Date().toISOString().split("T")[0],duration_h:"",duration_m:"",distance:"",elev:"",avg_hr:"",max_hr:"",avg_power:"",np:"",tss:"",calories:"",feel:"7",notes:""};

function actToForm(a:Activity):AF{const dh=a.duration_seconds?String(Math.floor(a.duration_seconds/3600)):"";const dm=a.duration_seconds?String(Math.floor((a.duration_seconds%3600)/60)):"";return{title:a.title,sport:a.sport,type:a.type??"easy",date:a.date,duration_h:dh,duration_m:dm,distance:a.distance_meters?String((a.distance_meters/1000).toFixed(2)):"",elev:a.elevation_gain?String(a.elevation_gain):"",avg_hr:a.avg_heart_rate?String(a.avg_heart_rate):"",max_hr:a.max_heart_rate?String(a.max_heart_rate):"",avg_power:a.avg_power_watts?String(a.avg_power_watts):"",np:a.normalized_power?String(a.normalized_power):"",tss:a.tss?String(a.tss):"",calories:a.calories?String(a.calories):"",feel:a.feel_score?String(a.feel_score):"7",notes:a.notes??""}}

function formToBody(f:AF){const dur=(parseInt(f.duration_h||"0")*3600)+(parseInt(f.duration_m||"0")*60);return{title:f.title||"Untitled",sport:f.sport,type:f.type,date:f.date,duration_seconds:dur||null,distance_meters:f.distance?parseFloat(f.distance)*1000:null,elevation_gain:f.elev?parseFloat(f.elev):null,avg_heart_rate:f.avg_hr?parseInt(f.avg_hr):null,max_heart_rate:f.max_hr?parseInt(f.max_hr):null,avg_power_watts:f.avg_power?parseInt(f.avg_power):null,normalized_power:f.np?parseInt(f.np):null,tss:f.tss?parseFloat(f.tss):null,calories:f.calories?parseInt(f.calories):null,feel_score:parseInt(f.feel),notes:f.notes||null};}

function ActivityFormModal({ initial, onSave, onClose, saving }: { initial?:AF; onSave:(f:AF)=>void; onClose:()=>void; saving:boolean }) {
  const [f,setF]=useState<AF>(initial??EMPTY_AF);
  const s=(k:keyof AF)=>(v:string)=>setF(p=>({...p,[k]:v}));
  const autoTSS=useMemo(()=>{if(f.tss)return null;const dur=(parseInt(f.duration_h||"0")*60)+(parseInt(f.duration_m||"0"));if(!dur)return null;const i=f.type==="race"?1.05:f.type==="hard"?0.9:f.type==="moderate"?0.75:0.6;return Math.round(dur*i);},[f.duration_h,f.duration_m,f.tss,f.type]);
  const feelNum=parseInt(f.feel)||7;
  const feelColor=feelNum>=8?"var(--olive)":feelNum>=5?"var(--gold)":"var(--terra)";

  return (
    <Modal title={initial?"Edit session":"Log new session"} onClose={onClose} width={620}>
      <div className="op-grid-form" style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
        <Field label="Title" col={2}><Input value={f.title} onChange={s("title")} placeholder="Morning Z2 run" /></Field>
        <Field label="Date"><Input type="date" value={f.date} onChange={s("date")} /></Field>
        <Field label="Sport"><Sel value={f.sport} onChange={s("sport")} options={["running","cycling","swimming","triathlon","strength"]} /></Field>
        <Field label="Type" hint="Session intensity classification"><Sel value={f.type} onChange={s("type")} options={["easy","moderate","hard","race","long","recovery","strength","brick"]} /></Field>
        <Field label="Duration — hr"><Input value={f.duration_h} onChange={s("duration_h")} placeholder="1" /></Field>
        <Field label="Duration — min"><Input value={f.duration_m} onChange={s("duration_m")} placeholder="30" /></Field>
        <Field label="Distance (km)"><Input value={f.distance} onChange={s("distance")} placeholder="12.5" /></Field>
        <Field label="Elevation (m)"><Input value={f.elev} onChange={s("elev")} placeholder="420" /></Field>
        <Field label="Avg HR" hint="Average heart rate during the session"><Input value={f.avg_hr} onChange={s("avg_hr")} placeholder="142" /></Field>
        <Field label="Max HR"><Input value={f.max_hr} onChange={s("max_hr")} placeholder="178" /></Field>
        <Field label="Avg Power (W)"><Input value={f.avg_power} onChange={s("avg_power")} placeholder="215" /></Field>
        <Field label="NP (W)" hint="Normalized Power — variability-adjusted average"><Input value={f.np} onChange={s("np")} placeholder="228" /></Field>
        <Field label="TSS" hint="Training Stress Score. Leave blank to auto-estimate.">
          <div style={{ position:"relative" }}>
            <Input value={f.tss} onChange={s("tss")} placeholder={autoTSS?`Auto: ~${autoTSS}`:"85"} />
            {autoTSS&&!f.tss&&<button onClick={()=>setF(p=>({...p,tss:String(autoTSS)}))} style={{ position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",fontSize:10,color:"var(--gold)",background:"none",border:"none",cursor:"pointer",fontFamily:"var(--font-mono)" }}>use {autoTSS}</button>}
          </div>
        </Field>
        <Field label="Calories"><Input value={f.calories} onChange={s("calories")} placeholder="820" /></Field>
        <Field label="Feel score" hint="Subjective session rating. 1=terrible, 10=perfect." col={2}>
          <div style={{ display:"flex",alignItems:"center",gap:14 }}>
            <input type="range" min={1} max={10} value={feelNum} onChange={e=>s("feel")(e.target.value)} style={{ flex:1 }} />
            <div style={{ display:"flex",alignItems:"baseline",gap:2,minWidth:32 }}>
              <span style={{ fontSize:22,fontWeight:300,fontFamily:"var(--font-display)",color:feelColor,lineHeight:1 }}>{f.feel}</span>
              <span style={{ fontSize:11,color:"var(--text-muted)",fontFamily:"var(--font-mono)" }}>/10</span>
            </div>
          </div>
        </Field>
        <Field label="Notes" col={2}>
          <textarea value={f.notes} onChange={e=>s("notes")(e.target.value)} placeholder="How did it go? Key observations…" style={{ width:"100%",minHeight:68,padding:"9px 12px",boxSizing:"border-box",resize:"vertical" }} />
        </Field>
      </div>
      <GreekDivider style={{ margin:"18px 0" }} />
      <div style={{ display:"flex",gap:10 }}>
        <Btn onClick={()=>onSave(f)} disabled={saving} fullWidth>{saving?"Saving…":initial?"Update session":"Save session"}</Btn>
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
      </div>
    </Modal>
  );
}

// ─── ACTIVITY ROW ─────────────────────────────────────────────────────────────

function ActivityRow({ act, border, onEdit, onDelete, onClick, compact }: { act:Activity; border:boolean; onEdit?:(a:Activity)=>void; onDelete?:(id:string)=>void; onClick?:()=>void; compact?:boolean }) {
  const [hover,setHover]=useState(false);
  const sc=sportColor(act.sport);
  return (
    <div onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)} onClick={onClick}
      className={compact?"":"op-act-grid"}
      style={{ display:"grid",gridTemplateColumns:compact?"32px 1fr 56px 52px 40px":"32px 1fr 80px 80px 80px 56px 40px 48px",alignItems:"center",gap:compact?10:12,padding:"11px 0",borderBottom:border?"1px solid var(--border)":"none",cursor:onClick?"pointer":"default",transition:"background 0.08s" }}>
      <div style={{ width:30,height:30,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",background:sc+"10",border:"1px solid "+sc+"20",flexShrink:0 }}>
        <SportIcon sport={act.sport} color={sc} size={13} />
      </div>
      <div style={{ minWidth:0 }}>
        <p style={{ fontSize:12,fontWeight:500,color:"var(--text)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{act.title}</p>
        <p style={{ fontSize:10,color:"var(--text-muted)",marginTop:1,fontFamily:"var(--font-mono)" }}>{formatRelDate(act.date)} · {act.type??act.sport}</p>
      </div>
      {!compact&&<span style={{ fontSize:12,color:"var(--text-muted)",fontFamily:"var(--font-mono)" }}>{fmtDuration(act.duration_seconds)}</span>}
      {!compact&&<span style={{ fontSize:12,color:"var(--text-muted)",fontFamily:"var(--font-mono)" }}>{fmtDist(act.distance_meters,act.sport)}</span>}
      {!compact&&<span className="op-col-elev" style={{ fontSize:12,color:"var(--text-muted)",fontFamily:"var(--font-mono)" }}>{act.elevation_gain?`↑${act.elevation_gain}m`:"—"}</span>}
      <div style={{ display:"flex",alignItems:"baseline",gap:2 }}>
        <span style={{ fontSize:12,fontWeight:600,color:tssColor(act.tss??0),fontFamily:"var(--font-mono)" }}>{act.tss??"-"}</span>
        <span style={{ fontSize:11,color:"var(--text-muted)",fontFamily:"var(--font-mono)" }}>TSS</span>
      </div>
      <span style={{ fontSize:12,color:"var(--text-muted)",fontFamily:"var(--font-mono)" }}>{act.feel_score?`★${act.feel_score}`:"—"}</span>
      {!compact&&(
        <div style={{ display:"flex",gap:4,opacity:hover&&(onEdit||onDelete)?1:0,transition:"opacity 0.15s" }}>
          {onEdit&&<button onClick={e=>{e.stopPropagation();onEdit(act);}} style={{ width:22,height:22,borderRadius:4,border:"1px solid var(--border)",background:"transparent",color:"var(--text-muted)",fontSize:10,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>✎</button>}
          {onDelete&&<button onClick={e=>{e.stopPropagation();onDelete(act.id);}} style={{ width:22,height:22,borderRadius:4,border:"1px solid var(--terra)40",background:"transparent",color:"var(--terra)",fontSize:10,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>✕</button>}
        </div>
      )}
    </div>
  );
}

// ─── CALENDAR ────────────────────────────────────────────────────────────────

function CalendarView({ activities, onSelect }: { activities:Activity[]; onSelect:(a:Activity)=>void }) {
  const [mo,setMo]=useState(()=>{const d=new Date();return{y:d.getFullYear(),m:d.getMonth()};});
  const dIM=new Date(mo.y,mo.m+1,0).getDate();
  const startDow=(new Date(mo.y,mo.m,1).getDay()+6)%7;
  const byDate:Record<string,Activity[]>={};
  activities.forEach(a=>{if(!byDate[a.date])byDate[a.date]=[];byDate[a.date].push(a);});
  const today=new Date().toISOString().split("T")[0];
  const cells=Array.from({length:startDow+dIM},(_,i)=>i<startDow?null:i-startDow+1);
  return (
    <div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
        <p style={{ fontSize:12,fontWeight:500,color:"var(--text)" }}>
          {new Date(mo.y,mo.m).toLocaleDateString("en",{month:"long",year:"numeric"})}
        </p>
        <div style={{ display:"flex",gap:4 }}>
          <Btn size="sm" variant="ghost" onClick={()=>setMo(p=>{const d=new Date(p.y,p.m-1);return{y:d.getFullYear(),m:d.getMonth()};})}> ‹ </Btn>
          <Btn size="sm" variant="ghost" onClick={()=>setMo(p=>{const d=new Date(p.y,p.m+1);return{y:d.getFullYear(),m:d.getMonth()};})}> › </Btn>
        </div>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2 }}>
        {["Mo","Tu","We","Th","Fr","Sa","Su"].map(d=><p key={d} style={{ fontSize:11,color:"var(--text-muted)",textAlign:"center",padding:"3px 0",fontFamily:"var(--font-mono)",letterSpacing:"0.06em" }}>{d}</p>)}
        {cells.map((day,i)=>{
          if(!day) return <div key={i} />;
          const ds=`${mo.y}-${String(mo.m+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
          const acts=byDate[ds]??[];
          const isTdy=ds===today;
          const totalTSS=acts.reduce((s,a)=>s+(a.tss??0),0);
          return (
            <div key={i} className="op-cal-cell" onClick={()=>acts.length&&onSelect(acts[0])} style={{ minHeight:46,padding:"4px 5px",borderRadius:6,border:`1px solid ${isTdy?"var(--gold)":"var(--border)"}`,background:isTdy?"var(--gold-dim)":acts.length?"var(--surface-hi)":"var(--surface)",cursor:acts.length?"pointer":"default",position:"relative",transition:"border-color 0.1s" }}>
              <p style={{ fontSize:10,color:isTdy?"var(--gold)":"var(--text-muted)",fontWeight:isTdy?600:400,fontFamily:"var(--font-mono)" }}>{day}</p>
              <div style={{ display:"flex",flexDirection:"column",gap:1.5,marginTop:3 }}>
                {acts.slice(0,2).map((a,j)=>(
                  <div key={j} style={{ height:3,borderRadius:1,background:sportColor(a.sport),opacity:0.75 }} />
                ))}
              </div>
              {totalTSS>0&&<p style={{ fontSize:8,color:"var(--text-subtle)",fontFamily:"var(--font-mono)",position:"absolute",bottom:2,right:3 }}>{totalTSS}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── WELLNESS MODAL ───────────────────────────────────────────────────────────

type WF={sleep:string;hrv:string;rhr:string;fatigue:string;soreness:string;motivation:string;mood:string;weight:string;notes:string};
const EMPTY_WF:WF={sleep:"7.5",hrv:"",rhr:"",fatigue:"4",soreness:"3",motivation:"7",mood:"7",weight:"",notes:""};

function WellnessModal({ date, existing, onSave, onClose, saving }: { date:string; existing?:DailyMetrics|null; onSave:(f:WF)=>void; onClose:()=>void; saving:boolean }) {
  const [f,setF]=useState<WF>(existing?{sleep:String(existing.sleep_hours??7.5),hrv:String(existing.hrv_ms??""),rhr:String(existing.resting_hr??""),fatigue:String(existing.fatigue??4),soreness:String(existing.muscle_soreness??3),motivation:String(existing.motivation??7),mood:String(existing.mood??7),weight:String(existing.weight_kg??""),notes:existing.notes??""}:EMPTY_WF);
  const s=(k:keyof WF)=>(v:string)=>setF(p=>({...p,[k]:v}));

  const sliders=[
    {key:"sleep" as const,label:"Sleep",min:3,max:11,step:0.5,unit:"h",hint:"Hours slept. 7.5–9h optimal.",colorFn:(v:number)=>v>=7.5?"var(--olive)":v>=6?"var(--gold)":"var(--terra)"},
    {key:"hrv" as const,label:"HRV",min:20,max:120,unit:"ms",hint:"Heart Rate Variability — higher = better recovery.",colorFn:(v:number)=>v>=65?"var(--olive)":v>=45?"var(--gold)":"var(--terra)"},
    {key:"rhr" as const,label:"Resting HR",min:35,max:90,unit:"bpm",hint:"Resting heart rate before getting up. Elevated = stress.",colorFn:(v:number)=>v<=52?"var(--olive)":v<=65?"var(--gold)":"var(--terra)"},
    {key:"fatigue" as const,label:"Fatigue",min:1,max:10,unit:"/10",hint:"1 = completely fresh, 10 = exhausted.",colorFn:(v:number)=>v<=3?"var(--olive)":v<=6?"var(--gold)":"var(--terra)"},
    {key:"soreness" as const,label:"Muscle soreness",min:1,max:10,unit:"/10",hint:"1 = none, 10 = very sore.",colorFn:(v:number)=>v<=3?"var(--olive)":v<=6?"var(--gold)":"var(--terra)"},
    {key:"motivation" as const,label:"Motivation",min:1,max:10,unit:"/10",hint:"Drive to train today. 1 = none, 10 = peak.",colorFn:(v:number)=>v>=7?"var(--olive)":v>=5?"var(--gold)":"var(--terra)"},
    {key:"mood" as const,label:"Mood",min:1,max:10,unit:"/10",hint:"Emotional state. 1 = very low, 10 = excellent.",colorFn:(v:number)=>v>=7?"var(--olive)":v>=5?"var(--gold)":"var(--terra)"},
  ];

  return (
    <Modal title={`Wellness log · ${date}`} onClose={onClose} width={500}>
      <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
        {sliders.map(({key,label,min,max,step=1,unit,hint,colorFn})=>{
          const val=parseFloat(f[key])||min;
          const col=colorFn(val);
          return (
            <div key={key}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8 }}>
                <div style={{ display:"flex",alignItems:"center",gap:5 }}>
                  <label style={{ fontSize:11,color:"var(--text-muted)",fontFamily:"var(--font-mono)",letterSpacing:"0.06em",textTransform:"uppercase" }}>{label}</label>
                  <HintIcon text={hint} />
                </div>
                <span style={{ fontSize:14,fontWeight:300,color:col,fontFamily:"var(--font-display)" }}>{f[key]}<span style={{ fontSize:11,color:"var(--text-muted)",fontFamily:"var(--font-mono)",marginLeft:1 }}>{unit}</span></span>
              </div>
              <input type="range" min={min} max={max} step={step} value={val} onChange={e=>s(key)(e.target.value)} style={{ width:"100%",accentColor:col }} />
            </div>
          );
        })}
        <GreekDivider />
        <Field label="Body weight (kg)"><Input value={f.weight} onChange={s("weight")} placeholder="72.4" /></Field>
        <Field label="Notes"><textarea value={f.notes} onChange={e=>s("notes")(e.target.value)} placeholder="Anything notable today…" style={{ width:"100%",minHeight:56,padding:"9px 12px",boxSizing:"border-box",resize:"vertical" }} /></Field>
      </div>
      <div style={{ display:"flex",gap:10,marginTop:20,paddingTop:16,borderTop:"1px solid var(--border)" }}>
        <Btn onClick={()=>onSave(f)} disabled={saving} fullWidth>{saving?"Saving…":"Save wellness log"}</Btn>
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
      </div>
    </Modal>
  );
}

// ─── ACTIVITY DETAIL ─────────────────────────────────────────────────────────

function StatCell({ label, value, unit, color, hint, large }: { label:string; value:string|number|null; unit?:string; color?:string; hint?:string; large?:boolean }) {
  if (!value && value !== 0) return (
    <div>
      <div style={{ display:"flex",alignItems:"center",gap:4,marginBottom:5 }}>
        <p style={{ fontSize:10,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.09em",fontFamily:"var(--font-mono)" }}>{label}</p>
        {hint&&<HintIcon text={hint} />}
      </div>
      <p style={{ fontSize:15,color:"var(--text-subtle)",fontFamily:"var(--font-mono)" }}>—</p>
    </div>
  );
  return (
    <div>
      <div style={{ display:"flex",alignItems:"center",gap:4,marginBottom:5 }}>
        <p style={{ fontSize:10,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.09em",fontFamily:"var(--font-mono)" }}>{label}</p>
        {hint&&<HintIcon text={hint} />}
      </div>
      <div style={{ display:"flex",alignItems:"baseline",gap:2 }}>
        <span style={{ fontSize:large?22:15,fontWeight:large?300:500,fontFamily:large?"var(--font-display)":"var(--font-mono)",color:color??"var(--text)",letterSpacing:large?"-0.02em":"0",lineHeight:1 }}>{value}</span>
        {unit&&<span style={{ fontSize:12,color:"var(--text-muted)",fontFamily:"var(--font-mono)",marginLeft:2 }}>{unit}</span>}
      </div>
    </div>
  );
}

function SplitsChart({ splits, sport }: { splits: Array<{distance:number;moving_time:number;average_speed:number;average_heartrate?:number;split:number;pace_zone?:number}>; sport:string }) {
  const data = splits.map(s => {
    const paceSecKm = s.average_speed > 0 ? Math.round(1000 / s.average_speed) : null;
    const speedKph  = s.average_speed > 0 ? parseFloat((s.average_speed * 3.6).toFixed(1)) : null;
    return {
      km: `${s.split}`,
      pace: paceSecKm ? parseFloat((paceSecKm/60).toFixed(2)) : null,
      speed: speedKph,
      hr: s.average_heartrate ? Math.round(s.average_heartrate) : null,
    };
  });
  const isCycling = sport === "cycling";
  const vals = data.map(d => isCycling ? d.speed : d.pace).filter((v): v is number => v != null);
  const minV = vals.length ? Math.min(...vals) : 0;
  const maxV = vals.length ? Math.max(...vals) : 10;
  const pad  = (maxV - minV) * 0.15 || 0.5;
  // For running: reversed axis (lower pace = faster = bar from top). Domain tight around data.
  const domain: [number,number] = isCycling
    ? [Math.max(0, minV - pad), maxV + pad]
    : [minV - pad, maxV + pad];
  const dataKey = isCycling ? "speed" : "pace";
  const label   = isCycling ? "Speed" : "Pace";
  return (
    <div>
      <p style={{ fontSize:11,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.1em",fontFamily:"var(--font-mono)",marginBottom:10 }}>
        {isCycling ? "Speed by km · km/h" : "Pace by km · min/km"} · splits
      </p>
      <ResponsiveContainer width="100%" height={130}>
        <BarChart data={data} barSize={Math.max(8,Math.min(24,Math.floor(300/data.length)))} margin={{top:6,right:4,bottom:0,left:-20}} barCategoryGap="25%">
          <CartesianGrid strokeDasharray="2 6" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="km" tick={{fill:"var(--text-subtle)",fontSize:10,fontFamily:"var(--font-mono)"}} axisLine={false} tickLine={false} interval={data.length>20?2:0} />
          <YAxis tick={{fill:"var(--text-subtle)",fontSize:10,fontFamily:"var(--font-mono)"}} axisLine={false} tickLine={false} domain={domain} reversed={!isCycling} width={32} />
          <Tooltip content={<OTooltip />} cursor={{fill:"var(--border)",opacity:0.3}} />
          <Bar dataKey={dataKey} name={label} radius={[3,3,0,0]} fill="var(--gold)" opacity={0.9} />
        </BarChart>
      </ResponsiveContainer>
      {data.some(d=>d.hr) && (
        <ResponsiveContainer width="100%" height={55} style={{marginTop:4}}>
          <AreaChart data={data} margin={{top:4,right:4,bottom:0,left:-24}}>
            <defs>
              <linearGradient id="hrg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--terra)" stopOpacity={0.2}/>
                <stop offset="100%" stopColor="var(--terra)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <YAxis tick={{fill:"var(--text-subtle)",fontSize:10,fontFamily:"var(--font-mono)"}} axisLine={false} tickLine={false} domain={["auto","auto"]} width={28} />
            <Tooltip content={<OTooltip />} cursor={{stroke:"var(--border-hi)",strokeWidth:1,strokeDasharray:"2 2"}} />
            <Area type="monotone" dataKey="hr" name="HR" stroke="var(--terra)" fill="url(#hrg)" strokeWidth={1.5} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

function ActivityDetailModal({ act, profile, onClose, onEdit, onDelete }: { act:Activity; profile:Profile|null; onClose:()=>void; onEdit:(a:Activity)=>void; onDelete:(id:string)=>void }) {
  const mob = useIsMobile();
  const sc = sportColor(act.sport);
  const isStrava = act.source === "strava";
  const isCycling = act.sport === "cycling";
  const isRunning = act.sport === "running";
  const [rightTab, setRightTab] = useState<"metrics"|"intelligence"|"zones">("metrics");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string|null>(null);

  // ── Derived metrics ────────────────────────────────────────────────────────
  const ftp = profile?.ftp_watts ?? null;
  const lthr = profile?.lthr ?? null;
  const weight = profile?.weight_kg ?? null;

  const efficiency = act.avg_heart_rate && act.avg_power_watts
    ? Math.round((act.avg_power_watts / act.avg_heart_rate) * 100) / 100 : null;
  const coasting = act.duration_seconds && act.elapsed_seconds && act.elapsed_seconds > act.duration_seconds
    ? Math.round(((act.elapsed_seconds - act.duration_seconds) / act.elapsed_seconds) * 100) : null;
  const paceStr = act.avg_pace_sec_km ? fmtPace(act.avg_pace_sec_km) : null;
  const maxSpeedKmh = act.max_speed_ms ? Math.round(act.max_speed_ms * 3.6 * 10) / 10 : null;
  const avgSpeedKmh = act.distance_meters && act.duration_seconds
    ? Math.round((act.distance_meters / act.duration_seconds) * 3.6 * 10) / 10 : null;

  // Intensity Factor = NP / FTP
  const IF = act.normalized_power && ftp ? Math.round((act.normalized_power / ftp) * 100) / 100 : null;
  // TSS from power (if not from Strava): IF² × duration_h × 100
  const tssCalc = IF && act.duration_seconds ? Math.round(IF * IF * (act.duration_seconds / 3600) * 100) : null;

  // W/kg
  const wkg = act.avg_power_watts && weight ? Math.round((act.avg_power_watts / weight) * 100) / 100 : null;
  const npKg = act.normalized_power && weight ? Math.round((act.normalized_power / weight) * 100) / 100 : null;

  // Aerobic Decoupling: compare first half HR vs pace to second half
  const decoupling = useMemo(() => {
    if (!act.splits_metric || act.splits_metric.length < 4) return null;
    const splits = act.splits_metric;
    const half = Math.floor(splits.length / 2);
    const first = splits.slice(0, half);
    const second = splits.slice(half);
    const avgEff = (arr: typeof splits) => {
      const withHr = arr.filter(s => s.average_heartrate && s.average_speed > 0);
      if (!withHr.length) return null;
      return withHr.reduce((sum, s) => sum + s.average_speed / s.average_heartrate!, 0) / withHr.length;
    };
    const e1 = avgEff(first), e2 = avgEff(second);
    if (!e1 || !e2) return null;
    return Math.round(((e1 - e2) / e1) * 1000) / 10; // % drop
  }, [act.splits_metric]);

  // Efficiency Factor = avg_speed / avg_hr (aerobic efficiency)
  const ef = act.avg_heart_rate && act.distance_meters && act.duration_seconds
    ? Math.round(((act.distance_meters / act.duration_seconds) / act.avg_heart_rate) * 10000) / 100
    : null;

  // HR zones distribution from splits
  const hrZones = useMemo(() => {
    if (!lthr || !act.splits_metric) return null;
    const zones = [
      { name:"Z1 Recovery",  lo:0,    hi:0.85, color:"#6B8F71" },
      { name:"Z2 Aerobic",   lo:0.85, hi:0.89, color:"#4A7C8E" },
      { name:"Z3 Tempo",     lo:0.89, hi:0.94, color:"#C8A84E" },
      { name:"Z4 Threshold", lo:0.94, hi:1.00, color:"#C87840" },
      { name:"Z5 VO2max",    lo:1.00, hi:1.06, color:"#C84040" },
    ];
    const splits = act.splits_metric.filter(s => s.average_heartrate);
    if (!splits.length) return null;
    const counts = zones.map(z => ({
      ...z,
      pct: Math.round(splits.filter(s =>
        s.average_heartrate! >= lthr * z.lo && s.average_heartrate! < lthr * z.hi
      ).length / splits.length * 100)
    }));
    return counts;
  }, [act.splits_metric, lthr]);

  // Best splits (fastest km)
  const bestSplit = useMemo(() => {
    if (!act.splits_metric?.length) return null;
    return act.splits_metric.reduce((best, s) =>
      s.average_speed > best.average_speed ? s : best, act.splits_metric[0]);
  }, [act.splits_metric]);

  const worstSplit = useMemo(() => {
    if (!act.splits_metric?.length) return null;
    const moving = act.splits_metric.filter(s => s.average_speed > 0);
    return moving.reduce((worst, s) =>
      s.average_speed < worst.average_speed ? s : worst, moving[0]);
  }, [act.splits_metric]);

  // Pace fade: % difference between first and last km
  const paceFade = useMemo(() => {
    if (!act.splits_metric || act.splits_metric.length < 3) return null;
    const first = act.splits_metric[0].average_speed;
    const last = act.splits_metric[act.splits_metric.length - 1].average_speed;
    if (!first) return null;
    return Math.round(((last - first) / first) * 100);
  }, [act.splits_metric]);

  // AI analysis fetch
  const fetchAI = async () => {
    setAiLoading(true);
    try {
      const d = await fetch("/api/ai/analysis", {
        method: "GET",
      }).then(r => r.json());
      setAiAnalysis(d.analysis ?? d.error ?? "No response.");
    } catch { setAiAnalysis("Could not connect to AI."); }
    finally { setAiLoading(false); }
  };

  // ── Shared blocks ─────────────────────────────────────────────────────────
  const Header = () => (
    <div style={{ display:"flex",alignItems:"center",gap:14,marginBottom:16 }}>
      <div style={{ width:44,height:44,borderRadius:10,background:sc+"12",border:"1px solid "+sc+"22",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
        <SportIcon sport={act.sport} color={sc} size={20} />
      </div>
      <div style={{ flex:1,minWidth:0 }}>
        <p style={{ fontSize:16,fontWeight:300,fontFamily:"var(--font-display)",fontStyle:"italic",color:"var(--text)",marginBottom:5,lineHeight:1.2 }}>{act.title}</p>
        <div style={{ display:"flex",gap:5,flexWrap:"wrap",alignItems:"center" }}>
          <Badge color={sc}>{act.sport}</Badge>
          {act.type&&<Badge color="var(--stone)">{act.type}</Badge>}
          {isStrava&&<Badge color="var(--terra)">Strava</Badge>}
          {act.pr_count&&act.pr_count>0&&<Badge color="var(--gold)">🏆 {act.pr_count} PR{act.pr_count>1?"s":""}</Badge>}
          {act.achievement_count&&act.achievement_count>0&&<Badge color="var(--olive)">★ {act.achievement_count}</Badge>}
          <span style={{ fontSize:11,color:"var(--text-muted)",fontFamily:"var(--font-mono)" }}>{act.date}</span>
        </div>
      </div>
      {act.kudos_count&&act.kudos_count>0?(
        <div style={{ textAlign:"center",flexShrink:0 }}>
          <p style={{ fontSize:18,fontWeight:300,color:"var(--terra)",fontFamily:"var(--font-display)" }}>{act.kudos_count}</p>
          <p style={{ fontSize:9,color:"var(--text-muted)",fontFamily:"var(--font-mono)",textTransform:"uppercase",letterSpacing:"0.08em" }}>kudos</p>
        </div>
      ):null}
    </div>
  );

  const PrimaryGrid = () => (
    <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:1,background:"var(--border)",borderRadius:8,overflow:"hidden",marginBottom:14 }}>
      {[
        { label:"Duration", value:fmtDuration(act.duration_seconds), color:"var(--text)" },
        { label:"Distance", value:fmtDist(act.distance_meters,act.sport), color:"var(--text)" },
        { label:"TSS",      value:act.tss??null, color:tssColor(act.tss??0) },
        { label:"Elevation",value:act.elevation_gain?`↑${act.elevation_gain}m`:null, color:"var(--text)" },
      ].map((m,i)=>(
        <div key={i} style={{ background:"var(--surface-hi)",padding:"12px 14px" }}>
          <p style={{ fontSize:10,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.08em",fontFamily:"var(--font-mono)",marginBottom:7 }}>{m.label}</p>
          <p style={{ fontSize:20,fontWeight:300,fontFamily:"var(--font-display)",color:m.color,lineHeight:1,letterSpacing:"-0.02em" }}>{m.value??"—"}</p>
        </div>
      ))}
    </div>
  );

  const StatsBlock = () => (
    <div style={{ display:"flex",flexDirection:"column",gap:0 }}>
      {/* Pace / Speed */}
      {(isRunning||isCycling)&&(
        <div style={{ display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12,padding:"12px 0",borderBottom:"1px solid var(--border)" }}>
          <StatCell label={isRunning?"Avg pace":"Avg speed"} value={isRunning?paceStr:avgSpeedKmh} unit={isRunning?"/km":"km/h"} color="var(--olive)" />
          <StatCell label="Cadence" value={act.average_cadence} unit={isRunning?"spm":"rpm"} hint={isRunning?"Steps per minute. Optimal: 170–180 spm":"Pedal revolutions per minute. Optimal: 85–100 rpm"} />
          <StatCell label={isRunning?"Max speed":"Max speed"} value={maxSpeedKmh} unit="km/h" />
          <StatCell label="Elapsed" value={fmtDuration(act.elapsed_seconds)} />
        </div>
      )}
      {/* HR */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12,padding:"12px 0",borderBottom:"1px solid var(--border)" }}>
        <StatCell label="Avg HR"  value={act.avg_heart_rate}  unit="bpm" color={act.avg_heart_rate&&act.avg_heart_rate>160?"var(--terra)":"var(--text)"} />
        <StatCell label="Max HR"  value={act.max_heart_rate}  unit="bpm" color="var(--terra)" />
        <StatCell label="Suffer score" value={act.suffer_score} hint="Strava Suffer Score — relative effort based on HR zones" color="var(--gold)" />
        <StatCell label="Feel"    value={act.feel_score?`${act.feel_score}/10`:null} color={act.feel_score&&act.feel_score>=7?"var(--olive)":act.feel_score&&act.feel_score>=5?"var(--gold)":"var(--terra)"} />
      </div>
      {/* Power */}
      {(act.avg_power_watts||act.normalized_power)&&(
        <div style={{ display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12,padding:"12px 0",borderBottom:"1px solid var(--border)" }}>
          <StatCell label="Avg power" value={act.avg_power_watts} unit="W" color="var(--gold)" />
          <StatCell label="NP" value={act.normalized_power} unit="W" color="var(--gold)" hint="Normalized Power — variability-adjusted average." />
          <StatCell label="Max power" value={act.max_power_watts} unit="W" />
          <StatCell label="Var. index" value={act.variability_index} hint="NP ÷ Avg Power. Closer to 1.00 = more steady effort." />
        </div>
      )}
      {/* Energy */}
      {(act.calories||act.kilojoules)&&(
        <div style={{ display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12,padding:"12px 0",borderBottom:"1px solid var(--border)" }}>
          <StatCell label="Calories" value={act.calories} unit="kcal" />
          <StatCell label="Kilojoules" value={act.kilojoules} unit="kJ" hint="Mechanical energy output (cycling)." />
          {efficiency&&<StatCell label="W/HR ratio" value={efficiency} hint="Power-to-HR efficiency." />}
          {coasting!==null&&<StatCell label="Coasting" value={`${coasting}%`} hint="Time stopped vs. elapsed." />}
        </div>
      )}
      {/* Gear */}
      {(act.gear_name||act.device_name)&&(
        <div style={{ display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12,padding:"12px 0",borderBottom:"1px solid var(--border)" }}>
          {act.gear_name&&<StatCell label="Equipment" value={act.gear_name} />}
          {act.device_name&&<StatCell label="Device" value={act.device_name} />}
        </div>
      )}
    </div>
  );

  const Actions = () => (
    <div style={{ display:"flex",gap:8,paddingTop:12,flexWrap:"wrap" }}>
      <Btn onClick={()=>{onClose();onEdit(act);}}>Edit</Btn>
      <Btn variant="danger" onClick={()=>{onClose();onDelete(act.id);}}>Delete</Btn>
      {isStrava&&act.strava_id&&(
        <a href={`https://www.strava.com/activities/${act.strava_id}`} target="_blank" rel="noopener noreferrer"
          style={{ fontSize:12,color:"var(--terra)",fontFamily:"var(--font-mono)",textDecoration:"none",border:"1px solid var(--terra)30",borderRadius:6,padding:"9px 16px",display:"flex",alignItems:"center" }}>
          Strava →
        </a>
      )}
      <Btn variant="ghost" onClick={onClose} style={{ marginLeft:"auto" }}>Close</Btn>
    </div>
  );

  // ── MOBILE: single column, scrollable ─────────────────────────────────────
  if (mob) return (
    <Modal title="Session detail" onClose={onClose}>
      <Header />
      <GreekDivider style={{ marginBottom:14 }} />
      <PrimaryGrid />
      {/* All stats in 4-col on mobile */}
      {(isRunning||isCycling)&&(
        <div style={{ display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12,padding:"12px 0",borderBottom:"1px solid var(--border)" }}>
          <StatCell label={isRunning?"Avg pace":"Avg speed"} value={isRunning?paceStr:avgSpeedKmh} unit={isRunning?"/km":"km/h"} color="var(--olive)" />
          <StatCell label="Cadence" value={act.average_cadence} unit={isRunning?"spm":"rpm"} />
        </div>
      )}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12,padding:"12px 0",borderBottom:"1px solid var(--border)" }}>
        <StatCell label="Avg HR" value={act.avg_heart_rate} unit="bpm" />
        <StatCell label="Max HR" value={act.max_heart_rate} unit="bpm" color="var(--terra)" />
        <StatCell label="Suffer" value={act.suffer_score} color="var(--gold)" />
        <StatCell label="Feel"   value={act.feel_score?`${act.feel_score}/10`:null} />
      </div>
      {(act.avg_power_watts||act.normalized_power)&&(
        <div style={{ display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12,padding:"12px 0",borderBottom:"1px solid var(--border)" }}>
          <StatCell label="Avg power" value={act.avg_power_watts} unit="W" color="var(--gold)" />
          <StatCell label="NP" value={act.normalized_power} unit="W" color="var(--gold)" />
        </div>
      )}
      {(act.calories)&&(
        <div style={{ padding:"12px 0",borderBottom:"1px solid var(--border)" }}>
          <StatCell label="Calories" value={act.calories} unit="kcal" />
        </div>
      )}
      {act.splits_metric&&act.splits_metric.length>1&&(
        <div style={{ marginTop:12 }}><SplitsChart splits={act.splits_metric} sport={act.sport} /></div>
      )}
      {act.notes&&(
        <div style={{ background:"var(--bg)",borderRadius:6,padding:"12px 14px",marginTop:12,borderLeft:"2px solid var(--border-hi)" }}>
          <p style={{ fontSize:12,color:"var(--text-2)",lineHeight:1.7,fontFamily:"var(--font-display)",fontStyle:"italic" }}>&ldquo;{act.notes}&rdquo;</p>
        </div>
      )}
      <Actions />
    </Modal>
  );

  // ── DESKTOP: 16:9 two-column layout ──────────────────────────────────────
  return (
    <Modal title="Session detail" onClose={onClose} wide>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 380px",height:"100%",minHeight:0 }}>

        {/* ═══ LEFT PANEL ═══════════════════════════════════════════════════ */}
        <div style={{ padding:"20px 24px",overflowY:"auto",borderRight:"1px solid var(--border)",display:"flex",flexDirection:"column",gap:14 }}>
          <Header />
          <GreekDivider />
          <PrimaryGrid />

          {/* Splits chart — main visual */}
          {act.splits_metric&&act.splits_metric.length>1?(
            <div>
              <SplitsChart splits={act.splits_metric} sport={act.sport} />

              {/* Split summary: best / worst / fade */}
              <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:1,background:"var(--border)",borderRadius:6,overflow:"hidden",marginTop:10 }}>
                {[
                  { label:"Best km", value: bestSplit ? (isRunning ? fmtPace(Math.round(1000/bestSplit.average_speed)) : `${Math.round(bestSplit.average_speed*3.6*10)/10} km/h`) : null, sub:`km ${bestSplit?.split??"-"}`, color:"var(--olive)" },
                  { label:"Worst km", value: worstSplit ? (isRunning ? fmtPace(Math.round(1000/worstSplit.average_speed)) : `${Math.round(worstSplit.average_speed*3.6*10)/10} km/h`) : null, sub:`km ${worstSplit?.split??"-"}`, color:"var(--terra)" },
                  { label:"Pace fade", value: paceFade !== null ? `${paceFade > 0 ? "+" : ""}${paceFade}%` : null, sub: paceFade !== null ? (paceFade >= 0 ? "↓ slower finish" : "↑ negative split") : "", color: paceFade !== null ? (paceFade < -2 ? "var(--olive)" : paceFade > 5 ? "var(--terra)" : "var(--gold)") : "var(--text)" },
                ].map((m,i) => (
                  <div key={i} style={{ background:"var(--surface)",padding:"10px 12px" }}>
                    <p style={{ fontSize:8,color:"var(--text-subtle)",textTransform:"uppercase",letterSpacing:"0.1em",fontFamily:"var(--font-mono)",marginBottom:4 }}>{m.label}</p>
                    <p style={{ fontSize:15,fontWeight:300,fontFamily:"var(--font-display)",color:m.color,lineHeight:1,letterSpacing:"-0.01em",marginBottom:2 }}>{m.value??"—"}</p>
                    <p style={{ fontSize:8,color:"var(--text-subtle)",fontFamily:"var(--font-mono)" }}>{m.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          ):(isRunning||isCycling)&&(
            <div style={{ display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",gap:6,padding:"24px 0",opacity:0.45 }}>
              <p style={{ fontSize:52,fontWeight:300,fontFamily:"var(--font-display)",color:"var(--olive)",letterSpacing:"-0.03em",lineHeight:1 }}>{isRunning?paceStr:(avgSpeedKmh?`${avgSpeedKmh}`:null)??"—"}</p>
              <p style={{ fontSize:11,color:"var(--text-muted)",fontFamily:"var(--font-mono)",textTransform:"uppercase",letterSpacing:"0.1em" }}>{isRunning?"avg pace / km":"avg speed km/h"}</p>
            </div>
          )}

          {/* Aerobic decoupling bar */}
          {decoupling !== null && (
            <div style={{ background:"var(--surface)",borderRadius:6,padding:"12px 14px",border:"1px solid var(--border)" }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8 }}>
                <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                  <p style={{ fontSize:11,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.1em",fontFamily:"var(--font-mono)" }}>Aerobic decoupling</p>
                  <HintIcon text="How much aerobic efficiency drops from first half to second half. < 5% = excellent aerobic base. > 10% = significant cardiac drift." />
                </div>
                <span style={{ fontSize:14,fontWeight:300,fontFamily:"var(--font-display)",color:decoupling<5?"var(--olive)":decoupling<10?"var(--gold)":"var(--terra)" }}>{decoupling.toFixed(1)}%</span>
              </div>
              <div style={{ height:5,background:"var(--border)",borderRadius:4,overflow:"hidden" }}>
                <div style={{ height:"100%",width:`${Math.min(decoupling*5,100)}%`,background:decoupling<5?"var(--olive)":decoupling<10?"var(--gold)":"var(--terra)",borderRadius:4,transition:"width 0.6s ease" }} />
              </div>
              <div style={{ display:"flex",justifyContent:"space-between",marginTop:4 }}>
                <span style={{ fontSize:8,color:"var(--text-subtle)",fontFamily:"var(--font-mono)" }}>excellent &lt;5%</span>
                <span style={{ fontSize:8,color:"var(--text-subtle)",fontFamily:"var(--font-mono)" }}>drift &gt;10%</span>
              </div>
            </div>
          )}

          {act.notes&&(
            <div style={{ background:"var(--bg)",borderRadius:6,padding:"12px 14px",borderLeft:"2px solid var(--border-hi)" }}>
              <p style={{ fontSize:12,color:"var(--text-2)",lineHeight:1.7,fontFamily:"var(--font-display)",fontStyle:"italic" }}>&ldquo;{act.notes}&rdquo;</p>
            </div>
          )}
          <Actions />
        </div>

        {/* ═══ RIGHT PANEL — tabbed ════════════════════════════════════════ */}
        <div style={{ display:"flex",flexDirection:"column",background:"var(--bg)",minHeight:0 }}>
          {/* Tab bar */}
          <div style={{ display:"flex",borderBottom:"1px solid var(--border)",flexShrink:0 }}>
            {([
              { id:"metrics",      label:"Metrics" },
              { id:"intelligence", label:"Intelligence" },
              { id:"zones",        label:"Zones" },
            ] as const).map(t => (
              <button key={t.id} onClick={()=>setRightTab(t.id)} style={{
                flex:1, padding:"11px 4px", border:"none",
                borderBottom:`2px solid ${rightTab===t.id?"var(--gold)":"transparent"}`,
                background:"transparent",
                color:rightTab===t.id?"var(--gold)":"var(--text-subtle)",
                fontSize:10, fontFamily:"var(--font-mono)",
                textTransform:"uppercase", letterSpacing:"0.08em",
                cursor:"pointer", transition:"all 0.15s",
              }}>{t.label}</button>
            ))}
          </div>

          {/* Tab content */}
          <div style={{ flex:1,overflowY:"auto",padding:"16px 20px" }}>

            {/* ── TAB: METRICS ─────────────────────────────────────────── */}
            {rightTab==="metrics"&&(
              <div style={{ display:"flex",flexDirection:"column",gap:0 }}>
                {/* Pace / Speed */}
                {(isRunning||isCycling)&&(
                  <div style={{ display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12,padding:"10px 0",borderBottom:"1px solid var(--border)" }}>
                    <StatCell label={isRunning?"Avg pace":"Avg speed"} value={isRunning?paceStr:avgSpeedKmh} unit={isRunning?"/km":"km/h"} color="var(--olive)" />
                    <StatCell label="Max speed" value={maxSpeedKmh} unit="km/h" />
                    <StatCell label="Cadence" value={act.average_cadence} unit={isRunning?"spm":"rpm"} hint={isRunning?"Steps per minute. Optimal: 170–180 spm":"Pedal revolutions per minute. Optimal: 85–100 rpm"} />
                    <StatCell label="Elapsed" value={fmtDuration(act.elapsed_seconds)} />
                  </div>
                )}
                {/* HR */}
                <div style={{ display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12,padding:"10px 0",borderBottom:"1px solid var(--border)" }}>
                  <StatCell label="Avg HR"  value={act.avg_heart_rate}  unit="bpm" color={act.avg_heart_rate&&act.avg_heart_rate>160?"var(--terra)":"var(--text)"} />
                  <StatCell label="Max HR"  value={act.max_heart_rate}  unit="bpm" color="var(--terra)" />
                  <StatCell label="Suffer score" value={act.suffer_score} hint="Strava Suffer Score — relative effort based on HR zones" color="var(--gold)" />
                  <StatCell label="Feel" value={act.feel_score?`${act.feel_score}/10`:null} color={act.feel_score&&act.feel_score>=7?"var(--olive)":act.feel_score&&act.feel_score>=5?"var(--gold)":"var(--terra)"} />
                </div>
                {/* Power */}
                {(act.avg_power_watts||act.normalized_power)&&(
                  <div style={{ display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12,padding:"10px 0",borderBottom:"1px solid var(--border)" }}>
                    <StatCell label="Avg power" value={act.avg_power_watts} unit="W" color="var(--gold)" />
                    <StatCell label="NP" value={act.normalized_power} unit="W" color="var(--gold)" hint="Normalized Power — variability-adjusted average." />
                    <StatCell label="Max power" value={act.max_power_watts} unit="W" />
                    <StatCell label="Var. index" value={act.variability_index} hint="NP ÷ Avg Power. Closer to 1.00 = more steady effort." />
                  </div>
                )}
                {/* Energy */}
                {(act.calories||act.kilojoules)&&(
                  <div style={{ display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12,padding:"10px 0",borderBottom:"1px solid var(--border)" }}>
                    <StatCell label="Calories" value={act.calories} unit="kcal" />
                    <StatCell label="Kilojoules" value={act.kilojoules} unit="kJ" hint="Mechanical energy output (cycling). ~4kJ ≈ 1kcal at ~25% efficiency." />
                    {efficiency&&<StatCell label="W/HR ratio" value={efficiency} hint="Power-to-HR efficiency index." />}
                    {coasting!==null&&<StatCell label="Coasting" value={`${coasting}%`} hint="Time stopped vs. total elapsed time." />}
                  </div>
                )}
                {/* Gear */}
                {(act.gear_name||act.device_name)&&(
                  <div style={{ display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12,padding:"10px 0",borderBottom:"1px solid var(--border)" }}>
                    {act.gear_name&&<StatCell label="Equipment" value={act.gear_name} />}
                    {act.device_name&&<StatCell label="Device" value={act.device_name} />}
                  </div>
                )}
                {/* Strava link */}
                {isStrava&&act.strava_id&&(
                  <div style={{ paddingTop:12 }}>
                    <a href={`https://www.strava.com/activities/${act.strava_id}`} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize:10,color:"var(--terra)",fontFamily:"var(--font-mono)",textDecoration:"none",border:"1px solid var(--terra)30",borderRadius:5,padding:"7px 12px",display:"inline-flex",alignItems:"center",gap:6 }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="var(--terra)"><path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169"/></svg>
                      View on Strava
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* ── TAB: INTELLIGENCE ────────────────────────────────────── */}
            {rightTab==="intelligence"&&(
              <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
                {/* Power metrics */}
                {(IF||wkg||npKg)&&(
                  <div>
                    <p style={{ fontSize:8,color:"var(--text-subtle)",textTransform:"uppercase",letterSpacing:"0.12em",fontFamily:"var(--font-mono)",marginBottom:10 }}>Power intelligence</p>
                    <div style={{ display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:1,background:"var(--border)",borderRadius:6,overflow:"hidden",marginBottom:12 }}>
                      {[
                        { label:"IF", value:IF, sub:"Intensity Factor", hint:"NP ÷ FTP. 1.0 = threshold effort. <0.75 = easy. >1.05 = very hard.", color:IF&&IF>1.0?"var(--terra)":IF&&IF>0.85?"var(--gold)":"var(--olive)" },
                        { label:"W/kg", value:wkg, sub:"Avg watts per kg", hint:"Average power relative to bodyweight. Key cycling performance metric.", color:"var(--gold)" },
                        { label:"NP/kg", value:npKg, sub:"Norm. power per kg", hint:"Normalized Power per kg. More accurate than avg W/kg for variable efforts.", color:"var(--gold)" },
                        { label:"TSS est.", value:tssCalc??act.tss, sub:"Training Stress Score", hint:"Quantifies workout load: duration × intensity². 100 = 1h at threshold.", color:tssColor(tssCalc??act.tss??0) },
                      ].map((m,i)=>(
                        <div key={i} style={{ background:"var(--surface)",padding:"10px 12px" }}>
                          <div style={{ display:"flex",alignItems:"center",gap:4,marginBottom:4 }}>
                            <p style={{ fontSize:8,color:"var(--text-subtle)",textTransform:"uppercase",letterSpacing:"0.1em",fontFamily:"var(--font-mono)" }}>{m.label}</p>
                            {m.hint&&<HintIcon text={m.hint} />}
                          </div>
                          <p style={{ fontSize:17,fontWeight:300,fontFamily:"var(--font-display)",color:m.color,lineHeight:1,letterSpacing:"-0.02em",marginBottom:2 }}>{m.value??"-"}</p>
                          <p style={{ fontSize:8,color:"var(--text-subtle)",fontFamily:"var(--font-mono)" }}>{m.sub}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Aerobic metrics */}
                <div>
                  <p style={{ fontSize:8,color:"var(--text-subtle)",textTransform:"uppercase",letterSpacing:"0.12em",fontFamily:"var(--font-mono)",marginBottom:10 }}>Aerobic efficiency</p>
                  <div style={{ display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:1,background:"var(--border)",borderRadius:6,overflow:"hidden",marginBottom:12 }}>
                    {[
                      { label:"Efficiency factor", value:ef, hint:"Speed ÷ HR × 10000. Tracks aerobic fitness over time. Higher = more fit.", color:"var(--olive)" },
                      { label:"Aerobic decoupling", value:decoupling!==null?`${decoupling.toFixed(1)}%`:null, hint:"Efficiency drop first→second half. <5% = well-trained. >10% = underpaced/underfueled.", color:decoupling!==null?decoupling<5?"var(--olive)":decoupling<10?"var(--gold)":"var(--terra)":"var(--text)" },
                      { label:"W/HR efficiency", value:efficiency, hint:"Watts per bpm. Higher = more mechanically efficient at a given HR.", color:"var(--text)" },
                      { label:"Suffer/TSS ratio", value:act.suffer_score&&act.tss?Math.round((act.suffer_score/act.tss)*100)/100:null, hint:"Strava Suffer vs TSS. >1.2 suggests effort was harder than load indicates.", color:"var(--text)" },
                    ].map((m,i)=>(
                      <div key={i} style={{ background:"var(--surface)",padding:"10px 12px" }}>
                        <div style={{ display:"flex",alignItems:"center",gap:4,marginBottom:4 }}>
                          <p style={{ fontSize:8,color:"var(--text-subtle)",textTransform:"uppercase",letterSpacing:"0.1em",fontFamily:"var(--font-mono)" }}>{m.label}</p>
                          {m.hint&&<HintIcon text={m.hint} />}
                        </div>
                        <p style={{ fontSize:17,fontWeight:300,fontFamily:"var(--font-display)",color:m.color??"var(--text)",lineHeight:1,letterSpacing:"-0.02em" }}>{m.value??"-"}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI per-activity analysis */}
                <div style={{ background:"var(--surface)",borderRadius:8,padding:"14px",border:"1px solid var(--border)" }}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}>
                    <p style={{ fontSize:11,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.1em",fontFamily:"var(--font-mono)" }}>AI analysis · this session</p>
                    <button onClick={fetchAI} disabled={aiLoading} style={{ fontSize:10,fontFamily:"var(--font-mono)",color:"var(--gold)",background:"none",border:"1px solid var(--gold)40",borderRadius:4,padding:"4px 10px",cursor:aiLoading?"not-allowed":"pointer",opacity:aiLoading?0.6:1 }}>
                      {aiLoading?"Analysing…":"Analyse →"}
                    </button>
                  </div>
                  {aiAnalysis?(
                    <div><Markdown text={aiAnalysis} size={11} /></div>
                  ):(
                    <p style={{ fontSize:12,color:"var(--text-subtle)",fontFamily:"var(--font-mono)",fontStyle:"italic" }}>
                      Get AI-powered insights specific to this session — pacing strategy, recovery needs, training adaptation signals.
                    </p>
                  )}
                </div>

                {!ftp&&!lthr&&(
                  <div style={{ padding:"10px 12px",background:"var(--gold-dim)",borderRadius:6,border:"1px solid var(--gold)30" }}>
                    <p style={{ fontSize:10,color:"var(--gold)",fontFamily:"var(--font-mono)" }}>Set FTP, LTHR and weight in Profile to unlock W/kg, IF, and zone analysis.</p>
                  </div>
                )}
              </div>
            )}

            {/* ── TAB: ZONES ───────────────────────────────────────────── */}
            {rightTab==="zones"&&(
              <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
                {/* HR zone distribution */}
                {hrZones?(
                  <div>
                    <p style={{ fontSize:8,color:"var(--text-subtle)",textTransform:"uppercase",letterSpacing:"0.12em",fontFamily:"var(--font-mono)",marginBottom:12 }}>HR zone distribution · this session</p>
                    <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                      {hrZones.map(z=>(
                        <div key={z.name}>
                          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4 }}>
                            <span style={{ fontSize:11,color:"var(--text-muted)",fontFamily:"var(--font-mono)" }}>{z.name}</span>
                            <span style={{ fontSize:10,color:z.color,fontFamily:"var(--font-mono)",fontWeight:600 }}>{z.pct}%</span>
                          </div>
                          <div style={{ height:6,background:"var(--border)",borderRadius:4,overflow:"hidden" }}>
                            <div style={{ height:"100%",width:`${z.pct}%`,background:z.color,borderRadius:4,opacity:0.8,transition:"width 0.6s ease" }} />
                          </div>
                          <div style={{ display:"flex",justifyContent:"space-between",marginTop:2 }}>
                            <span style={{ fontSize:9,color:"var(--text-muted)",fontFamily:"var(--font-mono)" }}>{lthr?`${Math.round(lthr*z.lo)}–${Math.round(lthr*z.hi)} bpm`:""}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Time in zone summary */}
                    <div style={{ marginTop:14,padding:"10px 12px",background:"var(--surface)",borderRadius:6 }}>
                      <p style={{ fontSize:9,color:"var(--text-muted)",fontFamily:"var(--font-mono)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6 }}>Session character</p>
                      {(()=>{
                        const z2 = hrZones.find(z=>z.name.includes("Z2"))?.pct??0;
                        const z4z5 = (hrZones.find(z=>z.name.includes("Z4"))?.pct??0)+(hrZones.find(z=>z.name.includes("Z5"))?.pct??0);
                        const char = z2>60?"Aerobic base · long endurance":z4z5>40?"High intensity · threshold/VO2":z2>40&&z4z5<20?"Polarised · good distribution":"Moderate · tempo/sweet spot";
                        const advice = z2>60?"Excellent for base building. Aerobic development without excess fatigue.":z4z5>40?"High metabolic stress. Ensure adequate recovery before next hard session.":z2>40&&z4z5<20?"Well-distributed effort. Ideal polarised training profile.":"Tempo work. Effective but accumulates fatigue. Monitor week load.";
                        return (
                          <>
                            <p style={{ fontSize:12,fontWeight:300,fontFamily:"var(--font-display)",fontStyle:"italic",color:"var(--text)",marginBottom:4 }}>{char}</p>
                            <p style={{ fontSize:10,color:"var(--text-muted)",lineHeight:1.6,fontFamily:"var(--font-mono)" }}>{advice}</p>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                ):(
                  <div style={{ textAlign:"center",padding:"24px 0",opacity:0.5 }}>
                    <p style={{ fontSize:12,color:"var(--text-muted)",fontFamily:"var(--font-mono)",marginBottom:6 }}>No zone data available</p>
                    <p style={{ fontSize:11,color:"var(--text-muted)",fontFamily:"var(--font-mono)" }}>
                      {!lthr?"Set your LTHR in Profile to see HR zone distribution.":"This activity has no per-km HR splits from Strava."}
                    </p>
                  </div>
                )}

                {/* Pace zones from VDOT if available */}
                {isRunning&&profile?.vdot&&act.splits_metric&&act.splits_metric.length>1&&(
                  <div>
                    <p style={{ fontSize:8,color:"var(--text-subtle)",textTransform:"uppercase",letterSpacing:"0.12em",fontFamily:"var(--font-mono)",marginBottom:10 }}>Split consistency</p>
                    {(()=>{
                      const speeds = act.splits_metric!.map(s=>s.average_speed).filter(Boolean);
                      const avg = speeds.reduce((a,b)=>a+b,0)/speeds.length;
                      const stdDev = Math.sqrt(speeds.reduce((sum,s)=>sum+(s-avg)**2,0)/speeds.length);
                      const cv = Math.round((stdDev/avg)*1000)/10; // coefficient of variation %
                      return (
                        <div style={{ background:"var(--surface)",borderRadius:6,padding:"12px 14px" }}>
                          <div style={{ display:"flex",justifyContent:"space-between",marginBottom:8 }}>
                            <span style={{ fontSize:11,color:"var(--text-muted)",fontFamily:"var(--font-mono)" }}>Pace variability (CV)</span>
                            <span style={{ fontSize:12,fontFamily:"var(--font-mono)",color:cv<3?"var(--olive)":cv<6?"var(--gold)":"var(--terra)",fontWeight:600 }}>{cv}%</span>
                          </div>
                          <div style={{ height:4,background:"var(--border)",borderRadius:3,overflow:"hidden" }}>
                            <div style={{ height:"100%",width:`${Math.min(cv*8,100)}%`,background:cv<3?"var(--olive)":cv<6?"var(--gold)":"var(--terra)",borderRadius:3 }} />
                          </div>
                          <p style={{ fontSize:11,color:"var(--text-muted)",fontFamily:"var(--font-mono)",marginTop:6 }}>
                            {cv<3?"Very consistent pacing":cv<6?"Good pacing control":cv<10?"Moderate variability — check course profile":"High variability — hills, wind or pacing issues"}
                          </p>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

      </div>
    </Modal>
  );
}



// ─── DASHBOARD ────────────────────────────────────────────────────────────────

function DashboardPage({ profile, activities, metrics, goal, onGoalChange, onNavigate, onLogWellness }: { profile:Profile|null; activities:Activity[]; metrics:DailyMetrics|null; goal:{name:string;date:string;distance:string;targetTime:string}|null; onGoalChange:(g:{name:string;date:string;distance:string;targetTime:string}|null)=>void; onNavigate:(p:PageId)=>void; onLogWellness:()=>void }) {
  const mob=useIsMobile();
  const tm=useMemo(()=>calcTM(activities),[activities]);
  const weekActs=useMemo(()=>activities.filter(a=>new Date(a.date)>=new Date(Date.now()-7*86400000)),[activities]);
  const weekTSS=useMemo(()=>weekActs.reduce((s,a)=>s+(a.tss??0),0),[weekActs]);
  const fitness=useMemo(()=>buildFitnessChart(activities),[activities]);
  const bar=useMemo(()=>buildWeekBar(activities),[activities]);
  const [viewMode,setViewMode]=useState<"chart"|"calendar">("chart");
  const [calSel,setCalSel]=useState<Activity|null>(null);
  const [detail,setDetail]=useState<Activity|null>(null);
  const name=profile?.full_name?.split(" ")[0]??"Athlete";
  const fs=getFormLabel(tm.tsb);
  const rc=metrics?calcRec(metrics):null;
  const rcColor=!rc?"var(--text-muted)":rc>=70?"var(--olive)":rc>=50?"var(--gold)":"var(--terra)";
  const [showGoalEditor,setShowGoalEditor]=useState(false);
  const [dismissed,setDismissed]=useState<Set<number>>(()=>{
    try {
      const raw=localStorage.getItem("op-alerts-dismissed");
      if(!raw) return new Set<number>();
      const parsed=JSON.parse(raw);
      if(Date.now()-parsed.ts>86400000){localStorage.removeItem("op-alerts-dismissed");return new Set<number>();}
      return new Set<number>(parsed.ids);
    } catch { return new Set<number>(); }
  });
  const dismiss=(i:number)=>{
    setDismissed(s=>{
      const next=new Set([...s,i]);
      try { localStorage.setItem("op-alerts-dismissed",JSON.stringify({ids:[...next],ts:Date.now()})); } catch {}
      return next;
    });
  };

  // ── Load alerts ────────────────────────────────────────────────────────────
  const prevWeekActs=activities.filter(a=>{const d=new Date(a.date),now=Date.now();return d>=new Date(now-14*86400000)&&d<new Date(now-7*86400000);});
  const prevWeekTSS=prevWeekActs.reduce((s,a)=>s+(a.tss??0),0);
  const atkSpike=prevWeekTSS>0?Math.round(((weekTSS-prevWeekTSS)/prevWeekTSS)*100):null;
  const daysSinceTraining=activities.length>0?Math.floor((Date.now()-new Date(activities[0].date).getTime())/86400000):null;
  const alerts:(({type:"warning"|"danger"|"info";msg:string}))[] = [];
  if(atkSpike!==null&&atkSpike>25) alerts.push({type:"danger",msg:`Weekly load up ${atkSpike}% vs last week — injury risk. Consider an easy day.`});
  else if(atkSpike!==null&&atkSpike>15) alerts.push({type:"warning",msg:`Load increased ${atkSpike}% this week. Monitor fatigue closely.`});
  if(daysSinceTraining!==null&&daysSinceTraining>=5) alerts.push({type:"warning",msg:`${daysSinceTraining} days without training — fitness starting to decline.`});
  if(tm.tsb<-25) alerts.push({type:"danger",msg:`Form at ${tm.tsb} pts — deep fatigue. Reduce load before racing.`});
  if(tm.tsb>25) alerts.push({type:"info",msg:`Form at +${tm.tsb} — very fresh. Good window to race or do a key session.`});
  if(rc!==null&&rc<30) alerts.push({type:"danger",msg:`Recovery score ${rc}/100 — prioritise sleep and rest today.`});

  // ── Goal calculations ──────────────────────────────────────────────────────
  const goalDaysLeft=goal?.date?Math.ceil((new Date(goal.date).getTime()-Date.now())/86400000):null;
  const goalFitnessPct=goal&&tm.ctl>0?Math.min(100,Math.round((tm.ctl/Math.max(tm.ctl,60))*100)):null;

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:20 }} className="fade-up">
      {calSel&&<ActivityDetailModal act={calSel} profile={profile} onClose={()=>setCalSel(null)} onEdit={()=>{}} onDelete={()=>{}} />}
      {detail&&<ActivityDetailModal act={detail} profile={profile} onClose={()=>setDetail(null)} onEdit={()=>{}} onDelete={()=>{}} />}

      {/* Page title */}
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid var(--border)",paddingBottom:14 }}>
        <div>
          <p style={{ fontSize:8,color:"var(--text-subtle)",letterSpacing:"0.16em",textTransform:"uppercase",marginBottom:3,fontFamily:"var(--font-mono)" }}>{fmtDate(new Date())}</p>
          <h1 style={{ fontSize:22,fontWeight:300,fontFamily:"var(--font-display)",fontStyle:"italic",color:"var(--text)",letterSpacing:"-0.02em",lineHeight:1 }}>
            {getGreeting()}, {name}
          </h1>
        </div>
        <div style={{ display:"flex",gap:6 }}>
          <Btn size="sm" variant="outline" onClick={onLogWellness}>{metrics?"Wellness":"+ Wellness"}</Btn>
          <Btn size="sm" onClick={()=>onNavigate("activities")}>+ Activity</Btn>
        </div>
      </div>

      {/* Recovery inline strip */}
      {rc&&(
        <div style={{ display:"flex",alignItems:"center",gap:12,padding:"10px 16px",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8,borderLeft:`2px solid ${rcColor}` }}>
          <div style={{ display:"flex",alignItems:"baseline",gap:3 }}>
            <span style={{ fontSize:20,fontWeight:300,color:rcColor,fontFamily:"var(--font-display)" }}>{rc}</span>
            <span style={{ fontSize:11,color:"var(--text-muted)",fontFamily:"var(--font-mono)" }}>/100</span>
          </div>
          <div style={{ height:1,flex:1,background:"var(--border)",position:"relative" }}>
            <div style={{ position:"absolute",left:0,top:0,height:"100%",width:`${rc}%`,background:rcColor,transition:"width 0.5s cubic-bezier(0.16,1,0.3,1)" }} />
          </div>
          <p style={{ fontSize:12,color:"var(--text-muted)",fontFamily:"var(--font-mono)",whiteSpace:"nowrap" }}>
            {getAutoInsight(metrics!)} <button onClick={onLogWellness} style={{ color:"var(--text-subtle)",background:"none",border:"none",cursor:"pointer",fontSize:12,fontFamily:"var(--font-mono)",textDecoration:"underline",padding:0 }}>edit</button>
          </p>
        </div>
      )}
      {!metrics&&(
        <div style={{ display:"flex",alignItems:"center",gap:12,padding:"10px 16px",background:"var(--gold-dim)",border:"1px solid var(--gold)25",borderRadius:8 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--gold)" strokeWidth="1"><circle cx="7" cy="7" r="6"/><line x1="7" y1="4" x2="7" y2="8"/><circle cx="7" cy="10.5" r="0.8" fill="var(--gold)" stroke="none"/></svg>
          <p style={{ fontSize:12,color:"var(--gold)",fontFamily:"var(--font-mono)" }}>
            Log your morning wellness for personalised training recommendations.{" "}
            <button onClick={onLogWellness} style={{ color:"var(--gold)",background:"none",border:"none",cursor:"pointer",fontSize:12,fontFamily:"var(--font-mono)",textDecoration:"underline",padding:0 }}>Log now →</button>
          </p>
        </div>
      )}

      {/* ── Load alerts ── */}
      {alerts.filter((_,i)=>!dismissed.has(i)).length>0&&(
        <div style={{ display:"flex",flexDirection:"column",gap:5 }}>
          {alerts.map((a,i)=>{
            if(dismissed.has(i)) return null;
            const col=a.type==="danger"?"var(--terra)":a.type==="warning"?"var(--gold)":"var(--stone)";
            return (
              <div key={i} style={{ display:"flex",alignItems:"center",gap:10,padding:"8px 12px",background:"var(--surface)",border:`1px solid ${col}28`,borderLeft:`2px solid ${col}`,borderRadius:6 }}>
                <svg width="11" height="11" viewBox="0 0 14 14" fill="none" style={{flexShrink:0}}>
                  {a.type==="info"
                    ?<><circle cx="7" cy="7" r="6" stroke={col} strokeWidth="1"/><line x1="7" y1="6" x2="7" y2="10" stroke={col} strokeWidth="1.2"/><circle cx="7" cy="4" r="0.8" fill={col}/></>
                    :<><path d="M7 1L13 12H1L7 1Z" stroke={col} strokeWidth="1" strokeLinejoin="round"/><line x1="7" y1="5" x2="7" y2="8.5" stroke={col} strokeWidth="1.2"/><circle cx="7" cy="10.5" r="0.8" fill={col}/></>
                  }
                </svg>
                <p style={{ fontSize:10,color:col,fontFamily:"var(--font-mono)",lineHeight:1.5,flex:1 }}>{a.msg}</p>
                <button onClick={()=>dismiss(i)} style={{ flexShrink:0,width:18,height:18,borderRadius:3,border:"none",background:"transparent",cursor:"pointer",color:col,fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",opacity:0.6,lineHeight:1 }}>×</button>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Goal widget (inline editor) ── */}
      {!showGoalEditor&&goal&&(
        <div style={{ display:"grid",gridTemplateColumns:"1fr auto auto",gap:1,background:"var(--border)",borderRadius:8,overflow:"hidden" }}>
          <div style={{ background:"var(--surface)",padding:"12px 18px",display:"flex",gap:18,alignItems:"center",flexWrap:"wrap" }}>
            <div>
              <p style={{ fontSize:11,color:"var(--text-muted)",fontFamily:"var(--font-mono)",textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:3 }}>Goal race</p>
              <p style={{ fontSize:16,fontWeight:300,fontFamily:"var(--font-display)",fontStyle:"italic",color:"var(--text)",lineHeight:1 }}>{goal.name}</p>
              <p style={{ fontSize:12,color:"var(--text-muted)",fontFamily:"var(--font-mono)",marginTop:3 }}>{goal.distance}{goal.targetTime?` · target ${goal.targetTime}`:""}</p>
            </div>
            {goalDaysLeft!==null&&(
              <div style={{ textAlign:"center",paddingLeft:18,borderLeft:"1px solid var(--border)" }}>
                <p style={{ fontSize:11,color:"var(--text-muted)",fontFamily:"var(--font-mono)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:3 }}>Countdown</p>
                <p style={{ fontSize:26,fontWeight:300,fontFamily:"var(--font-display)",color:goalDaysLeft<14?"var(--terra)":goalDaysLeft<42?"var(--gold)":"var(--olive)",lineHeight:1 }}>{goalDaysLeft<0?"past":goalDaysLeft}</p>
                <p style={{ fontSize:11,color:"var(--text-muted)",fontFamily:"var(--font-mono)" }}>{goalDaysLeft<0?"days ago":"days"}</p>
              </div>
            )}
            {goalFitnessPct!==null&&(
              <div style={{ flex:1,minWidth:120 }}>
                <div style={{ display:"flex",justifyContent:"space-between",marginBottom:5 }}>
                  <p style={{ fontSize:11,color:"var(--text-muted)",fontFamily:"var(--font-mono)",textTransform:"uppercase",letterSpacing:"0.08em" }}>Fitness readiness</p>
                  <p style={{ fontSize:10,color:"var(--gold)",fontFamily:"var(--font-mono)",fontWeight:600 }}>{goalFitnessPct}%</p>
                </div>
                <div style={{ height:4,background:"var(--border)",borderRadius:3,overflow:"hidden" }}>
                  <div style={{ height:"100%",width:`${goalFitnessPct}%`,background:`linear-gradient(90deg,var(--terra),var(--gold) 60%,var(--olive))`,borderRadius:3,transition:"width 0.6s ease" }} />
                </div>
                <p style={{ fontSize:11,color:"var(--text-muted)",fontFamily:"var(--font-mono)",marginTop:4 }}>CTL {tm.ctl} pts · {goalFitnessPct<50?"Build base":goalFitnessPct<80?"On track ✓":"Peak ready ✓"}</p>
              </div>
            )}
          </div>
          <div style={{ background:"var(--surface)",padding:"12px 14px",display:"flex",alignItems:"center",borderLeft:"1px solid var(--border)" }}>
            <button onClick={()=>setShowGoalEditor(true)} style={{ fontSize:12,color:"var(--text-subtle)",background:"none",border:"none",cursor:"pointer",fontFamily:"var(--font-mono)",letterSpacing:"0.06em",textTransform:"uppercase" }}>Edit</button>
          </div>
          <div style={{ background:"var(--surface)",padding:"12px 14px",display:"flex",alignItems:"center",borderLeft:"1px solid var(--border)" }}>
            <button onClick={()=>onGoalChange(null)} style={{ fontSize:12,color:"var(--terra)",background:"none",border:"none",cursor:"pointer",fontFamily:"var(--font-mono)",letterSpacing:"0.06em",textTransform:"uppercase" }}>Clear</button>
          </div>
        </div>
      )}
      {!showGoalEditor&&!goal&&(
        <button onClick={()=>setShowGoalEditor(true)} style={{ display:"flex",alignItems:"center",gap:10,padding:"9px 16px",background:"transparent",border:"1px dashed var(--border-hi)",borderRadius:8,cursor:"pointer",color:"var(--text-subtle)",fontFamily:"var(--font-mono)",fontSize:12,letterSpacing:"0.06em",textTransform:"uppercase",width:"100%",transition:"border-color 0.15s,color 0.15s" }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="6" y1="1" x2="6" y2="11"/><line x1="1" y1="6" x2="11" y2="6"/></svg>
          Set a goal race
        </button>
      )}
      {showGoalEditor&&(
        <Card p={16}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
            <p style={{ fontSize:12,color:"var(--text-subtle)",textTransform:"uppercase",letterSpacing:"0.12em",fontFamily:"var(--font-mono)" }}>Goal race</p>
            <button onClick={()=>setShowGoalEditor(false)} style={{ width:22,height:22,borderRadius:4,border:"1px solid var(--border)",background:"transparent",cursor:"pointer",color:"var(--text-muted)",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center" }}>×</button>
          </div>
          <GoalEditor initial={goal} onSave={g=>{onGoalChange(g);setShowGoalEditor(false);}} />
        </Card>
      )}

      {/* 4 metrics */}
      <MetricRow items={[
        {label:"Fitness · CTL",value:String(tm.ctl),unit:"pts",accent:"var(--gold)",sub:"42-day avg",hint:"Chronic Training Load — long-term fitness base. Increases slowly with consistent training."},
        {label:"Fatigue · ATL",value:String(tm.atl),unit:"pts",accent:"var(--terra)",sub:"7-day avg",hint:"Acute Training Load — recent fatigue. Spikes after hard blocks."},
        {label:"Form · TSB",value:(tm.tsb>0?"+":"")+tm.tsb,unit:"pts",accent:formColor(tm.tsb),sub:fs.label,hint:"TSB = CTL − ATL. Positive = rested. Ideal race form: +5 to +20."},
        {label:"Week load",value:String(weekTSS),unit:"TSS",accent:"var(--stone)",sub:`${weekActs.length} sessions`,hint:"Total Training Stress Score this week. Build gradually: max +10% week on week."},
      ]} />

      {/* Chart / Calendar toggle */}
      <div>
        <div style={{ display:"flex",gap:1,background:"var(--border)",borderRadius:6,padding:2,width:"fit-content",marginBottom:14 }}>
          {(["chart","calendar"] as const).map(v=>(
            <button key={v} onClick={()=>setViewMode(v)} style={{ padding:"5px 14px",borderRadius:4,border:"none",background:viewMode===v?"var(--surface)":"transparent",color:viewMode===v?"var(--text)":"var(--text-muted)",fontSize:10,cursor:"pointer",textTransform:"capitalize",fontWeight:viewMode===v?500:400,fontFamily:"var(--font-mono)",letterSpacing:"0.04em" }}>{v}</button>
          ))}
        </div>

        {viewMode==="chart"?(
          <div className="op-grid-2" style={{ display:"grid",gridTemplateColumns:"1.4fr 1fr",gap:14 }}>
            <Card p={20}>
              <SectionTitle mono sub="CTL / ATL / TSB" right={
                <div style={{ display:"flex",gap:12 }}>
                  {[["var(--gold)","Fitness"],["var(--terra)","Fatigue"],["var(--olive)","Form"]].map(([c,l])=>(
                    <div key={l} style={{ display:"flex",alignItems:"center",gap:4 }}>
                      <div style={{ width:12,height:1,background:c }} />
                      <span style={{ fontSize:11,color:"var(--text-muted)",fontFamily:"var(--font-mono)" }}>{l}</span>
                    </div>
                  ))}
                </div>
              }>Fitness · Fatigue · Form</SectionTitle>
              {fitness.length>1?(
                <ResponsiveContainer width="100%" height={mob?140:190} className="op-chart-tall">
                  <LineChart data={fitness} margin={{top:8,right:4,bottom:0,left:-18}}>
                    <defs>
                      <linearGradient id="ctlg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--gold)" stopOpacity={0.12}/><stop offset="100%" stopColor="var(--gold)" stopOpacity={0}/></linearGradient>
                      <linearGradient id="tsbg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--olive)" stopOpacity={0.1}/><stop offset="100%" stopColor="var(--olive)" stopOpacity={0}/></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="2 8" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="week" tick={{fill:"var(--text-subtle)",fontSize:10,fontFamily:"var(--font-mono)"}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fill:"var(--text-subtle)",fontSize:10,fontFamily:"var(--font-mono)"}} axisLine={false} tickLine={false} />
                    <ReferenceLine y={0} stroke="var(--border-hi)" strokeDasharray="3 4" strokeWidth={1} />
                    <Tooltip content={<OTooltip />} cursor={{stroke:"var(--border-hi)",strokeWidth:1,strokeDasharray:"3 3"}} />
                    <Line type="monotone" dataKey="ctl" stroke="var(--gold)" strokeWidth={2} dot={false} name="Fitness" />
                    <Line type="monotone" dataKey="atl" stroke="var(--terra)" strokeWidth={1.5} dot={false} name="Fatigue" strokeDasharray="4 3" />
                    <Line type="monotone" dataKey="tsb" stroke="var(--olive)" strokeWidth={2} dot={false} name="Form" />
                  </LineChart>
                </ResponsiveContainer>
              ):<EmptyState label="Log activities to build your fitness curve" />}
            </Card>
            <Card p={20}>
              <SectionTitle mono sub="Daily load (TSS)">This week</SectionTitle>
              {bar.some(d=>d.tss>0)?(
                <ResponsiveContainer width="100%" height={mob?140:190} className="op-chart-tall">
                  <BarChart data={bar} barSize={28} margin={{top:8,right:4,bottom:0,left:-18}} barCategoryGap="30%">
                    <CartesianGrid strokeDasharray="2 6" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="day" tick={{fill:"var(--text-subtle)",fontSize:10,fontFamily:"var(--font-mono)"}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fill:"var(--text-subtle)",fontSize:10,fontFamily:"var(--font-mono)"}} axisLine={false} tickLine={false} domain={[0,"auto"]} />
                    <Tooltip content={<OTooltip />} cursor={{fill:"var(--border)",opacity:0.4,radius:3}} />
                    <Bar dataKey="tss" name="TSS" radius={[4,4,0,0]} fill="var(--gold)" opacity={0.85} />
                  </BarChart>
                </ResponsiveContainer>
              ):<EmptyState label="No sessions this week" />}
            </Card>
          </div>
        ):(
          <Card p={20}>
            <CalendarView activities={activities} onSelect={setCalSel} />
          </Card>
        )}
      </div>

      {/* Recent + Sport mix */}
      <div className="op-grid-2" style={{ display:"grid",gridTemplateColumns:"1fr 240px",gap:14 }}>
        <Card p={20}>
          <SectionTitle mono right={<button onClick={()=>onNavigate("activities")} style={{ fontSize:10,color:"var(--text-muted)",background:"none",border:"none",cursor:"pointer",fontFamily:"var(--font-mono)" }}>all →</button>}>
            Recent sessions
          </SectionTitle>
          {activities.length===0?<EmptyState label="No activities logged yet" />
            :activities.slice(0,5).map((a,i)=>(
              <ActivityRow key={a.id} act={a} border={i<4} compact onClick={()=>setDetail(a)} />
            ))
          }
        </Card>
        <Card p={20}>
          <SectionTitle mono sub="Last 30 days">Sport mix</SectionTitle>
          <SportBreakdown activities={activities} />
        </Card>
      </div>
    </div>
  );
}

function SportBreakdown({ activities }: { activities:Activity[] }) {
  const cutoff=new Date(Date.now()-30*86400000);
  const recent=activities.filter(a=>new Date(a.date)>=cutoff);
  const sports=["running","cycling","swimming","strength","triathlon"];
  const counts=sports.map(s=>({sport:s,n:recent.filter(a=>a.sport===s).length,tss:recent.filter(a=>a.sport===s).reduce((acc,a)=>acc+(a.tss??0),0)})).filter(x=>x.n>0);
  const total=counts.reduce((s,x)=>s+x.n,0);
  if(!total) return <EmptyState label="No data" />;
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
      {counts.map(x=>(
        <div key={x.sport}>
          <div style={{ display:"flex",justifyContent:"space-between",marginBottom:5 }}>
            <span style={{ fontSize:12,color:"var(--text)",display:"flex",alignItems:"center",gap:7 }}>
              <SportIcon sport={x.sport} color={sportColor(x.sport)} size={11} />
              <span style={{ textTransform:"capitalize",fontFamily:"var(--font-mono)",fontSize:10 }}>{x.sport}</span>
            </span>
            <span style={{ fontSize:11,color:"var(--text-muted)",fontFamily:"var(--font-mono)" }}>{x.n}x · {x.tss}TSS</span>
          </div>
          <div style={{ height:2,background:"var(--border)",borderRadius:1 }}>
            <div style={{ width:`${(x.n/total)*100}%`,height:"100%",background:sportColor(x.sport),borderRadius:1,opacity:0.75,transition:"width 0.5s" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── AI COACH ────────────────────────────────────────────────────────────────

function CoachPage({ activities, metrics, wellnessHistory, onLogWellness }: { activities:Activity[]; metrics:DailyMetrics|null; wellnessHistory:DailyMetrics[]; onLogWellness:()=>void }) {
  const mob=useIsMobile();
  const [loading,setLoading]=useState(false);
  const [rec,setRec]=useState<string|null>(null);
  const [extra,setExtra]=useState("");
  const [trendMetric,setTrendMetric]=useState<"hrv"|"sleep"|"fatigue"|"recovery">("recovery");
  const rc=metrics?calcRec(metrics):null;
  const rcColor=!rc?"var(--text-muted)":rc>=70?"var(--olive)":rc>=50?"var(--gold)":"var(--terra)";

  // Build trend chart data from history
  const trendData=wellnessHistory.slice(-30).map(m=>({
    date:m.date.slice(5),
    hrv:m.hrv_ms??null,
    sleep:m.sleep_hours??null,
    fatigue:m.fatigue??null,
    recovery:calcRec(m),
  }));
  const trendCfg:{[k:string]:{label:string;color:string;unit:string}} = {
    recovery:{label:"Recovery score",color:"var(--olive)",unit:"/100"},
    hrv:     {label:"HRV",          color:"var(--gold)", unit:"ms"},
    sleep:   {label:"Sleep",        color:"var(--stone)",unit:"h"},
    fatigue: {label:"Fatigue",      color:"var(--terra)",unit:"/10"},
  };
  const tc=trendCfg[trendMetric];

  const generate=async()=>{
    setLoading(true);
    try {
      const body=metrics?{sleep_hours:metrics.sleep_hours,sleep_quality:metrics.sleep_quality??7,hrv_ms:metrics.hrv_ms,resting_hr:metrics.resting_hr??52,fatigue:metrics.fatigue,motivation:metrics.motivation,available_minutes:60,notes:(metrics.notes??"")+"\n"+extra}:{sleep_hours:7.5,sleep_quality:7,hrv_ms:60,resting_hr:52,fatigue:4,motivation:7,available_minutes:60,notes:extra};
      const d=await fetch("/api/ai/coach",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)}).then(r=>r.json());
      setRec(d.recommendation??d.error??"No response.");
    } catch { setRec("Could not connect to AI. Check your OpenAI key."); }
    finally { setLoading(false); }
  };

  const statLine=(label:string,value:string|null,good:boolean|null)=>(
    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:"1px solid var(--border)" }}>
      <span style={{ fontSize:11,color:"var(--text-muted)",fontFamily:"var(--font-mono)",textTransform:"uppercase",letterSpacing:"0.06em" }}>{label}</span>
      <span style={{ fontSize:14,fontWeight:300,fontFamily:"var(--font-display)",color:good===null?"var(--text)":good?"var(--olive)":"var(--terra)" }}>{value??"-"}</span>
    </div>
  );

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
      <PageHeader supra="Intelligence" title="AI Coach" />

      {/* Top strip: recovery score + wellness stats inline */}
      <div style={{ display:"grid",gridTemplateColumns:"auto 1fr auto",gap:1,background:"var(--border)",borderRadius:8,overflow:"hidden" }}>
        {/* Score */}
        <div style={{ background:"var(--surface)",padding:"14px 20px",display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",minWidth:80 }}>
          <div style={{ display:"flex",alignItems:"center",gap:4,marginBottom:4 }}>
            <span style={{ fontSize:9,color:"var(--text-muted)",fontFamily:"var(--font-mono)",textTransform:"uppercase",letterSpacing:"0.08em" }}>Recovery</span>
            <HintIcon text="40% sleep · 30% HRV · 20% fatigue · 10% motivation" />
          </div>
          <span style={{ fontSize:32,fontWeight:300,color:rcColor,fontFamily:"var(--font-display)",letterSpacing:"-0.04em",lineHeight:1 }}>{rc??"-"}</span>
          {rc&&<span style={{ fontSize:8,color:rcColor,fontFamily:"var(--font-mono)",marginTop:2 }}>{rc>=70?"READY":rc>=50?"CAREFUL":"REST"}</span>}
        </div>
        {/* Wellness inline stats */}
        <div style={{ background:"var(--surface)",padding:"10px 16px",display:"flex",alignItems:"center",flexWrap:"wrap",gap:0 }}>
          {metrics?[
            {l:"HRV",v:metrics.hrv_ms?`${metrics.hrv_ms}ms`:null,good:metrics.hrv_ms?metrics.hrv_ms>=60:null},
            {l:"Sleep",v:metrics.sleep_hours?`${metrics.sleep_hours}h`:null,good:metrics.sleep_hours?metrics.sleep_hours>=7.5:null},
            {l:"Fatigue",v:metrics.fatigue?`${metrics.fatigue}/10`:null,good:metrics.fatigue?metrics.fatigue<=4:null},
            {l:"Motivation",v:metrics.motivation?`${metrics.motivation}/10`:null,good:metrics.motivation?metrics.motivation>=6:null},
            {l:"RHR",v:metrics.resting_hr?`${metrics.resting_hr}bpm`:null,good:metrics.resting_hr?metrics.resting_hr<=55:null},
          ].map(({l,v,good})=>(
            <div key={l} style={{ padding:"6px 14px",borderRight:"1px solid var(--border)" }}>
              <p style={{ fontSize:8,color:"var(--text-subtle)",fontFamily:"var(--font-mono)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:3 }}>{l}</p>
              <p style={{ fontSize:14,fontWeight:300,fontFamily:"var(--font-display)",color:good===null?"var(--text)":good?"var(--olive)":"var(--terra)",lineHeight:1 }}>{v??"-"}</p>
            </div>
          )):(
            <p style={{ fontSize:12,color:"var(--text-muted)",fontFamily:"var(--font-mono)",fontStyle:"italic",padding:"0 4px" }}>Log morning wellness to enable AI coaching</p>
          )}
        </div>
        {/* Log button */}
        <div style={{ background:"var(--surface)",padding:"10px 14px",display:"flex",alignItems:"center" }}>
          <Btn size="sm" variant="outline" onClick={onLogWellness}>{metrics?"Update":"Log"}</Btn>
        </div>
      </div>

      {/* Main area */}
      <div style={{ display:"grid",gridTemplateColumns:"1fr 220px",gap:14,alignItems:"start" }}>
        <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
          <Card p={16}>
            <p style={{ fontSize:11,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.12em",fontFamily:"var(--font-mono)",marginBottom:10 }}>Additional context for AI</p>
            <textarea value={extra} onChange={e=>setExtra(e.target.value)}
              placeholder="Race in 8 days · tight calf · poor nutrition · travel fatigue…"
              style={{ width:"100%",minHeight:60,padding:"8px 10px",boxSizing:"border-box",resize:"vertical",marginBottom:10,fontSize:12,fontFamily:"var(--font-mono)",background:"var(--bg)",border:"1px solid var(--border)",borderRadius:5,color:"var(--text)",lineHeight:1.6 }} />
            <Btn onClick={generate} disabled={loading} fullWidth>{loading?"Generating…":"Get AI recommendation →"}</Btn>
          </Card>
          {rec&&(
            <InsightCard accent="var(--gold)" tag="AI Recommendation">
              <Markdown text={rec} size={13} />
              <button onClick={()=>setRec(null)} style={{ marginTop:12,fontSize:11,color:"var(--text-muted)",background:"none",border:"none",cursor:"pointer",fontFamily:"var(--font-mono)",letterSpacing:"0.04em" }}>← NEW EVALUATION</button>
            </InsightCard>
          )}
          {metrics?.notes&&(
            <div style={{ padding:"10px 14px",background:"var(--surface)",borderRadius:6,borderLeft:"2px solid var(--border-hi)" }}>
              <p style={{ fontSize:12,color:"var(--text-muted)",fontStyle:"italic",lineHeight:1.6,fontFamily:"var(--font-display)" }}>&ldquo;{metrics.notes}&rdquo;</p>
            </div>
          )}
        </div>

        {/* Sidebar: wellness trend + recent load */}
        <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
        {trendData.length>1&&(
          <Card p={14}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}>
              <p style={{ fontSize:11,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.12em",fontFamily:"var(--font-mono)" }}>30-day trend</p>
              <div style={{ display:"flex",gap:2 }}>
                {(["recovery","hrv","sleep","fatigue"] as const).map(m=>(
                  <button key={m} onClick={()=>setTrendMetric(m)} style={{ padding:"3px 7px",borderRadius:3,border:`1px solid ${trendMetric===m?trendCfg[m].color:"var(--border)"}`,background:trendMetric===m?trendCfg[m].color+"15":"transparent",color:trendMetric===m?trendCfg[m].color:"var(--text-subtle)",fontSize:8,cursor:"pointer",fontFamily:"var(--font-mono)",textTransform:"uppercase",letterSpacing:"0.04em" }}>{m==="recovery"?"REC":m.toUpperCase()}</button>
                ))}
              </div>
            </div>
            <p style={{ fontSize:9,color:tc.color,fontFamily:"var(--font-mono)",marginBottom:8 }}>{tc.label} · {tc.unit}</p>
            <ResponsiveContainer width="100%" height={90}>
              <AreaChart data={trendData} margin={{top:4,right:4,bottom:0,left:-28}}>
                <defs>
                  <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={tc.color} stopOpacity={0.25}/>
                    <stop offset="100%" stopColor={tc.color} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 6" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="date" tick={{fill:"var(--text-subtle)",fontSize:7,fontFamily:"var(--font-mono)"}} axisLine={false} tickLine={false} interval={6} />
                <YAxis tick={{fill:"var(--text-subtle)",fontSize:7,fontFamily:"var(--font-mono)"}} axisLine={false} tickLine={false} reversed={trendMetric==="fatigue"} />
                <Tooltip content={<OTooltip />} cursor={{stroke:"var(--border-hi)",strokeWidth:1,strokeDasharray:"2 2"}} />
                <Area type="monotone" dataKey={trendMetric} stroke={tc.color} fill="url(#wg)" strokeWidth={1.5} dot={false} connectNulls name={tc.label} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        )}
        <Card p={14}>
          <p style={{ fontSize:11,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.12em",fontFamily:"var(--font-mono)",marginBottom:10 }}>Recent load</p>
          {activities.length===0?<EmptyState label="No data" />
            :activities.slice(0,6).map((a,i)=>(
              <div key={a.id} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:i<5?"1px solid var(--border)":"none" }}>
                <div style={{ minWidth:0,flex:1 }}>
                  <p style={{ fontSize:12,color:"var(--text)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{a.title}</p>
                  <p style={{ fontSize:11,color:"var(--text-muted)",fontFamily:"var(--font-mono)",marginTop:1 }}>{formatRelDate(a.date)}</p>
                </div>
                <span style={{ fontSize:14,fontWeight:300,color:tssColor(a.tss??0),fontFamily:"var(--font-display)",flexShrink:0,marginLeft:8 }}>{a.tss??"-"}</span>
              </div>
            ))
          }
        </Card>
        </div>
      </div>
    </div>
  );
}

// ─── FUELING ─────────────────────────────────────────────────────────────────

type IL="easy"|"moderate"|"hard"|"race";
type FT="gel"|"fluid"|"bar"|"chews";
interface FP2{duration:number;intensity:IL;weight:number;temp:number;sport:string}
interface FPlan{carbs_per_hour:number;fluid_per_hour_ml:number;sodium_per_hour_mg:number;schedule:Array<{minute:number;action:string;type:FT}>;ai_notes:string}

function FuelingPage({ profile }: { profile:Profile|null }) {
  const mob=useIsMobile();
  const [p,setP]=useState<FP2>({duration:180,intensity:"moderate",weight:profile?.weight_kg??72,temp:20,sport:"cycling"});
  const [plan,setPlan]=useState<FPlan|null>(null);
  const [loading,setLoading]=useState(false);
  const [saved,setSaved]=useState(false);
  const ILabels:Record<IL,string>={easy:"Easy",moderate:"Moderate",hard:"Hard",race:"Race"};
  const tc=(t:FT)=>({gel:"var(--gold)",fluid:"var(--stone)",bar:"var(--olive)",chews:"var(--terra)"}[t]);

  const gen=async()=>{setLoading(true);try{const d=await fetch("/api/ai/fueling",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(p)}).then(r=>r.json());if(d.error)throw new Error();setPlan(d);}catch{setPlan(localFueling(p));}finally{setLoading(false);}};
  const save=async()=>{if(!plan)return;await fetch("/api/fueling",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...p,...plan})}).catch(()=>{});setSaved(true);setTimeout(()=>setSaved(false),2200);};
  const exportTxt=()=>{if(!plan)return;const lines=[`OLYMPEAKS FUELING PLAN`,`${p.duration}min · ${ILabels[p.intensity]} · ${p.temp}°C · ${p.weight}kg`,``,`Carbs: ${plan.carbs_per_hour}g/h · Fluid: ${plan.fluid_per_hour_ml}ml/h · Sodium: ${plan.sodium_per_hour_mg}mg/h`,``,`TIMELINE:`,  ...plan.schedule.map(s=>`${String(Math.floor(s.minute/60)).padStart(2,"0")}:${String(s.minute%60).padStart(2,"0")} — ${s.action}`),``,`NOTES:`,plan.ai_notes];const b=new Blob([lines.join("\n")],{type:"text/plain"});const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="fueling-plan.txt";a.click();};

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
      <PageHeader supra="Nutrition" title="Fueling Planner" />
      <div className="op-grid-2" style={{ display:"grid",gridTemplateColumns:"260px 1fr",gap:14,alignItems:"start" }}>
        <Card p={14}>
          <p style={{ fontSize:11,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.12em",fontFamily:"var(--font-mono)",marginBottom:12 }}>Parameters</p>
          <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
            {/* Sport */}
            <div style={{ display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:5,alignItems:"center" }}>
              <span style={{ fontSize:11,color:"var(--text-muted)",fontFamily:"var(--font-mono)",textTransform:"uppercase",letterSpacing:"0.06em" }}>Sport</span>
              <Sel value={p.sport} onChange={v=>setP(x=>({...x,sport:v}))} options={["running","cycling","triathlon","swimming"]} />
            </div>
            {/* Sliders */}
            {([
              {label:"Duration",key:"duration" as const,min:30,max:360,step:15,unit:"min",hint:"Under 60 min rarely needs in-session fueling."},
              {label:"Weight",key:"weight" as const,min:45,max:120,unit:"kg",hint:"Scales fluid and sodium requirements."},
              {label:"Temp",key:"temp" as const,min:5,max:42,unit:"°C",hint:"Fluid needs +150ml/h for every 10°C above 20."}
            ]).map(({label,key,min,max,step=1,unit,hint})=>(
              <div key={key}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:3 }}>
                    <span style={{ fontSize:11,color:"var(--text-muted)",fontFamily:"var(--font-mono)",textTransform:"uppercase",letterSpacing:"0.06em" }}>{label}</span>
                    <HintIcon text={hint} />
                  </div>
                  <span style={{ fontSize:14,fontWeight:300,color:"var(--text)",fontFamily:"var(--font-display)",lineHeight:1 }}>{p[key]}<span style={{ fontSize:8,color:"var(--text-subtle)",fontFamily:"var(--font-mono)",marginLeft:2 }}>{unit}</span></span>
                </div>
                <input type="range" min={min} max={max} step={step} value={p[key]} onChange={e=>setP(x=>({...x,[key]:parseInt(e.target.value)}))} style={{ width:"100%",accentColor:"var(--gold)" }} />
              </div>
            ))}
            {/* Intensity */}
            <div>
              <p style={{ fontSize:11,color:"var(--text-muted)",fontFamily:"var(--font-mono)",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6 }}>Intensity</p>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:4 }}>
                {(["easy","moderate","hard","race"] as IL[]).map(i=>(
                  <button key={i} onClick={()=>setP(x=>({...x,intensity:i}))} style={{ padding:"6px 0",borderRadius:4,cursor:"pointer",fontSize:9,border:`1px solid ${p.intensity===i?"var(--gold)":"var(--border)"}`,background:p.intensity===i?"var(--gold-dim)":"transparent",color:p.intensity===i?"var(--gold)":"var(--text-muted)",fontFamily:"var(--font-mono)",letterSpacing:"0.04em",textTransform:"uppercase" }}>
                    {ILabels[i]}
                  </button>
                ))}
              </div>
            </div>
            <Btn onClick={gen} disabled={loading} fullWidth>{loading?"Calculating…":"Generate →"}</Btn>
          </div>
        </Card>

        {plan?(
          <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
            <div className="op-grid-3" style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10 }}>
              {[{label:"Carbs",value:plan.carbs_per_hour,unit:"g/h",color:"var(--gold)",hint:"Use mixed carb sources (glucose + fructose) above 60g/h."},{label:"Fluid",value:plan.fluid_per_hour_ml,unit:"ml/h",color:"var(--stone)",hint:"Drink to thirst; use as a reference guide."},{label:"Sodium",value:plan.sodium_per_hour_mg,unit:"mg/h",color:"var(--olive)",hint:"Critical for sessions 90+ min or in heat."}].map(m=>(
                <Card key={m.label} p={18}>
                  <div style={{ display:"flex",alignItems:"center",gap:5,marginBottom:10 }}>
                    <p style={{ fontSize:10,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.1em",fontFamily:"var(--font-mono)" }}>{m.label}</p>
                    <HintIcon text={m.hint} />
                  </div>
                  <div style={{ display:"flex",alignItems:"baseline",gap:3 }}>
                    <span style={{ fontSize:22,fontWeight:300,color:m.color,fontFamily:"var(--font-display)",letterSpacing:"-0.02em" }}>{m.value}</span>
                    <span style={{ fontSize:11,color:"var(--text-muted)",fontFamily:"var(--font-mono)" }}>{m.unit}</span>
                  </div>
                </Card>
              ))}
            </div>
            <Card p={20}>
              <SectionTitle mono sub={`${p.duration}min · ${ILabels[p.intensity].toLowerCase()} · ${p.temp}°C`} right={
                <div style={{ display:"flex",gap:6 }}>
                  <Btn size="sm" variant="ghost" onClick={exportTxt}>↓ txt</Btn>
                  <Btn size="sm" variant="outline" onClick={save}>{saved?"Saved ✓":"Save"}</Btn>
                </div>
              }>Ingestion timeline</SectionTitle>
              <div style={{ display:"flex",flexDirection:"column" }}>
                {plan.schedule.map((item,i)=>(
                  <div key={i} style={{ display:"flex",gap:12,alignItems:"flex-start" }}>
                    <div style={{ display:"flex",flexDirection:"column",alignItems:"center",flexShrink:0,width:14 }}>
                      <div style={{ width:6,height:6,borderRadius:"50%",background:tc(item.type),marginTop:5,flexShrink:0 }} />
                      {i<plan.schedule.length-1&&<div style={{ width:1,flex:1,background:"var(--border)",minHeight:20,margin:"3px 0" }} />}
                    </div>
                    <div style={{ paddingBottom:i<plan.schedule.length-1?4:0 }}>
                      <span style={{ fontSize:10,color:tc(item.type),fontFamily:"var(--font-mono)",marginRight:10 }}>
                        {String(Math.floor(item.minute/60))}:{String(item.minute%60).padStart(2,"0")}
                      </span>
                      <span style={{ fontSize:12,color:"var(--text-2)" }}>{item.action}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            {plan.ai_notes&&<InsightCard accent="var(--olive)" tag="Nutrition notes"><p style={{}}><Markdown text={plan.ai_notes} size={13} color="var(--text-muted)" /></p></InsightCard>}
          </div>
        ):(
          <Card style={{ display:"flex",alignItems:"center",justifyContent:"center",minHeight:280 }} p={0}>
            <EmptyState label="Configure parameters and generate your plan" />
          </Card>
        )}
      </div>
    </div>
  );
}

// ─── ANALYSIS ────────────────────────────────────────────────────────────────

function AnalysisPage({ activities }: { activities:Activity[] }) {
  const mob=useIsMobile();
  const [analysis,setAnalysis]=useState<string|null>(null);
  const [loading,setLoading]=useState(false);
  const [period,setPeriod]=useState<6|12|26>(6);
  const pace=buildPaceTrend(activities);
  const radar=buildRadar(activities);
  const weekly=buildWeekly(activities);
  const tssChart=buildTSSChart(activities,period);

  const run=async()=>{setLoading(true);try{const d=await fetch("/api/ai/analysis").then(r=>r.json());setAnalysis(d.analysis??d.error);}catch{setAnalysis("Could not connect to AI.");}finally{setLoading(false);}};
  const exportCSV=()=>{const rows=[["Date","Title","Sport","Type","Duration(min)","Distance(km)","Elevation(m)","Avg HR","TSS","Feel","Notes"],...activities.map(a=>[a.date,a.title,a.sport,a.type??"",a.duration_seconds?Math.round(a.duration_seconds/60):"",a.distance_meters?(a.distance_meters/1000).toFixed(2):"",a.elevation_gain??"",a.avg_heart_rate??"",a.tss??"",a.feel_score??"",a.notes?.replace(/,/g,";")??""])];const csv=rows.map(r=>r.join(",")).join("\n");const b=new Blob([csv],{type:"text/csv"});const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="olympeaks-activities.csv";a.click();};

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid var(--border)",paddingBottom:14 }}>
        <div>
          <p style={{ fontSize:8,color:"var(--text-subtle)",letterSpacing:"0.16em",textTransform:"uppercase",marginBottom:3,fontFamily:"var(--font-mono)" }}>Performance</p>
          <h1 style={{ fontSize:22,fontWeight:300,fontFamily:"var(--font-display)",fontStyle:"italic",color:"var(--text)",letterSpacing:"-0.02em",lineHeight:1 }}>Analysis</h1>
        </div>
        <div style={{ display:"flex",gap:6 }}>
          <Btn size="sm" variant="ghost" onClick={exportCSV}>↓ CSV</Btn>
          <Btn size="sm" onClick={run} disabled={loading||!activities.length}>{loading?"Analysing…":"AI Analysis →"}</Btn>
        </div>
      </div>
      {analysis&&<InsightCard accent="var(--olive)" tag="Performance Intelligence"><div style={{}}><Markdown text={analysis} size={13} /></div><button onClick={()=>setAnalysis(null)} style={{ marginTop:14,fontSize:11,color:"var(--text-muted)",background:"none",border:"none",cursor:"pointer",fontFamily:"var(--font-mono)" }}>← close</button></InsightCard>}

      <Card p={20}>
        <SectionTitle mono sub={`Weekly load · last ${period} weeks`} right={
          <div style={{ display:"flex",gap:1,background:"var(--border)",borderRadius:5,padding:2 }}>
            {([6,12,26] as const).map(w=>(
              <button key={w} onClick={()=>setPeriod(w)} style={{ padding:"4px 10px",borderRadius:3,border:"none",background:period===w?"var(--surface)":"transparent",color:period===w?"var(--text)":"var(--text-muted)",fontSize:10,cursor:"pointer",fontFamily:"var(--font-mono)" }}>{w}w</button>
            ))}
          </div>
        }>Training load history</SectionTitle>
        {tssChart.length>1?(
          <ResponsiveContainer width="100%" height={mob?120:160}>
            <BarChart data={tssChart} barSize={period>12?8:period>6?12:20} margin={{top:8,right:4,bottom:0,left:-18}} barCategoryGap="25%">
              <CartesianGrid strokeDasharray="2 8" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="week" tick={{fill:"var(--text-subtle)",fontSize:10,fontFamily:"var(--font-mono)"}} axisLine={false} tickLine={false} interval={period>12?2:0} />
              <YAxis tick={{fill:"var(--text-subtle)",fontSize:10,fontFamily:"var(--font-mono)"}} axisLine={false} tickLine={false} domain={[0,"auto"]} />
              <Tooltip content={<OTooltip />} cursor={{fill:"var(--border)",opacity:0.35,radius:3}} />
              <Bar dataKey="tss" name="Weekly TSS" radius={[3,3,0,0]} fill="var(--gold)" opacity={0.8}>
                {tssChart.map((_,i)=><Cell key={i} fill={i===tssChart.length-1?"var(--gold)":"var(--gold)"} fillOpacity={i===tssChart.length-1?1:0.65} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ):<EmptyState label="Log activities to see training load history" />}
      </Card>

      <div className="op-grid-2" style={{ display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:14 }}>
        <Card p={20}>
          <SectionTitle mono sub="Running · min/km">Pace trend</SectionTitle>
          {pace.length>1?(
            <ResponsiveContainer width="100%" height={mob?130:170}>
              <AreaChart data={pace} margin={{top:8,right:4,bottom:0,left:-18}}>
                <defs>
                  <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--olive)" stopOpacity={0.22}/>
                    <stop offset="100%" stopColor="var(--olive)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 8" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" tick={{fill:"var(--text-subtle)",fontSize:10,fontFamily:"var(--font-mono)"}} axisLine={false} tickLine={false} />
                <YAxis tick={{fill:"var(--text-subtle)",fontSize:10,fontFamily:"var(--font-mono)"}} axisLine={false} tickLine={false} reversed />
                <Tooltip content={<OTooltip />} cursor={{stroke:"var(--border-hi)",strokeWidth:1,strokeDasharray:"3 3"}} />
                <Area type="monotone" dataKey="pace" stroke="var(--olive)" fill="url(#pg)" strokeWidth={2} dot={{fill:"var(--olive)",r:3,strokeWidth:0}} activeDot={{r:5,fill:"var(--olive)",strokeWidth:0}} name="Pace (min/km)" />
              </AreaChart>
            </ResponsiveContainer>
          ):<EmptyState label="Log running sessions" />}
        </Card>
        <Card p={20}>
          <div style={{ display:"flex",alignItems:"center",gap:5,marginBottom:16 }}>
            <p style={{ fontSize:10,fontWeight:600,color:"var(--text)",fontFamily:"var(--font-mono)",textTransform:"uppercase",letterSpacing:"0.08em" }}>Capability profile</p>
            <HintIcon text="Multi-dimensional estimate from training distribution and volume" />
          </div>
          <ResponsiveContainer width="100%" height={170}>
            <RadarChart data={radar} margin={{top:4,right:24,bottom:4,left:24}}>
              <PolarGrid stroke="var(--border)" strokeDasharray="2 4" gridType="polygon" />
              <PolarAngleAxis dataKey="attr" tick={{fill:"var(--text-muted)",fontSize:11,fontFamily:"var(--font-mono)",fontWeight:600}} />
              <Radar name="Profile" dataKey="val" stroke="var(--gold)" fill="var(--gold)" fillOpacity={0.12} strokeWidth={2} dot={{fill:"var(--gold)",r:3,strokeWidth:0}} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card p={20}>
        <SectionTitle mono sub="Last 8 weeks">Weekly breakdown</SectionTitle>
        {weekly.length===0?<EmptyState label="No data yet" />:(
          <table style={{ width:"100%",borderCollapse:"collapse" }}>
            <thead><tr>{["Week","Volume","Load","Sessions","Avg HR","Feel","Consistency"].map(h=><th key={h} style={{ fontSize:10,color:"var(--text-muted)",padding:"0 0 10px",letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:500,textAlign:"left",fontFamily:"var(--font-mono)" }}>{h}</th>)}</tr></thead>
            <tbody>
              {weekly.map((w,i)=>(
                <tr key={i} style={{ borderTop:"1px solid var(--border)" }}>
                  <td style={{ padding:"9px 0",fontSize:12,color:"var(--text)",fontFamily:"var(--font-mono)" }}>{w.label}</td>
                  <td style={{ padding:"9px 0",fontSize:12,color:"var(--text-muted)",fontFamily:"var(--font-mono)" }}>{w.volume}</td>
                  <td style={{ padding:"9px 0",fontSize:12,fontFamily:"var(--font-mono)",fontWeight:600,color:tssColor(w.tss) }}>{w.tss} TSS</td>
                  <td style={{ padding:"9px 0",fontSize:12,color:"var(--text-muted)" }}>{w.sessions}</td>
                  <td style={{ padding:"9px 0",fontSize:12,color:"var(--text-muted)",fontFamily:"var(--font-mono)" }}>{w.avgHR}</td>
                  <td style={{ padding:"9px 0",fontSize:12,color:"var(--text-muted)",fontFamily:"var(--font-mono)" }}>{w.feel}</td>
                  <td style={{ padding:"9px 0" }}>
                    <div style={{ display:"flex",gap:2 }}>
                      {[...Array(7)].map((_,d)=><div key={d} style={{ width:7,height:7,borderRadius:2,background:w.dayMask&(1<<d)?"var(--gold)":"var(--border)",opacity:w.dayMask&(1<<d)?0.8:0.5 }} />)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

// ─── RACES ───────────────────────────────────────────────────────────────────

function RacesPage({ activities, profile, goal, onGoalChange }: { activities:Activity[]; profile:Profile|null; goal:GoalData|null; onGoalChange:(g:GoalData|null)=>void }) {
  const mob=useIsMobile();
  const races=activities.filter(a=>a.type==="race");
  const [sel,setSel]=useState<Activity|null>(null);
  const [detail,setDetail]=useState<Activity|null>(null);
  const [analysis,setAnalysis]=useState<string|null>(null);
  const [loading,setLoading]=useState(false);
  const [showGoalEditor,setShowGoalEditor]=useState(false);
  const analyze=async(race:Activity)=>{setLoading(true);try{const d=await fetch("/api/ai/race",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({activity_id:race.id})}).then(r=>r.json());setAnalysis(d.analysis??d.error);}catch{setAnalysis("Could not connect to AI.");}finally{setLoading(false);}};
  const sc=(r:Activity)=>sportColor(r.sport);

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
      {detail&&<ActivityDetailModal act={detail} profile={profile} onClose={()=>setDetail(null)} onEdit={()=>{}} onDelete={()=>{}} />}
      {/* Compact header + stats inline */}
      <div style={{ display:"flex",alignItems:"center",gap:1,background:"var(--border)",borderRadius:8,overflow:"hidden" }}>
        <div style={{ background:"var(--surface)",padding:"12px 18px",flex:1 }}>
          <p style={{ fontSize:8,color:"var(--text-subtle)",letterSpacing:"0.16em",textTransform:"uppercase",marginBottom:3,fontFamily:"var(--font-mono)" }}>Competition</p>
          <p style={{ fontSize:18,fontWeight:300,fontFamily:"var(--font-display)",fontStyle:"italic",color:"var(--text)",lineHeight:1 }}>Race Analyzer</p>
        </div>
        {races.length>0&&[
          {label:"Races",value:String(races.length),accent:"var(--gold)"},
          {label:"Distance",value:fmtDist(races.reduce((s,r)=>s+(r.distance_meters??0),0),"running"),accent:"var(--terra)"},
          {label:"Best feel",value:races.reduce((m,r)=>Math.max(m,r.feel_score??0),0)?`★ ${races.reduce((m,r)=>Math.max(m,r.feel_score??0),0)}`:"-",accent:"var(--olive)"},
        ].map((m,i)=>(
          <div key={i} style={{ background:"var(--surface)",padding:"12px 18px",position:"relative",borderLeft:"1px solid var(--border)" }}>
            <div style={{ position:"absolute",top:0,left:0,right:0,height:2,background:m.accent }} />
            <p style={{ fontSize:8,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:4,fontFamily:"var(--font-mono)" }}>{m.label}</p>
            <p style={{ fontSize:16,fontWeight:300,fontFamily:"var(--font-display)",color:"var(--text)",lineHeight:1 }}>{m.value}</p>
          </div>
        ))}
      </div>
      {/* ── Goal race ── */}
      {!showGoalEditor&&goal&&(
        <div style={{ display:"grid",gridTemplateColumns:"1fr auto auto",gap:1,background:"var(--border)",borderRadius:8,overflow:"hidden" }}>
          <div style={{ background:"var(--surface)",padding:"11px 16px",display:"flex",gap:16,alignItems:"center",flexWrap:"wrap" }}>
            <div>
              <p style={{ fontSize:8,color:"var(--gold)",fontFamily:"var(--font-mono)",textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:2 }}>🎯 Goal race</p>
              <p style={{ fontSize:14,fontWeight:300,fontFamily:"var(--font-display)",fontStyle:"italic",color:"var(--text)",lineHeight:1 }}>{goal.name}</p>
              <p style={{ fontSize:11,color:"var(--text-muted)",fontFamily:"var(--font-mono)",marginTop:2 }}>{goal.distance}{goal.targetTime?` · target ${goal.targetTime}`:""}</p>
            </div>
            {goal.date&&(()=>{const d=Math.ceil((new Date(goal.date).getTime()-Date.now())/86400000);return(
              <div style={{ paddingLeft:16,borderLeft:"1px solid var(--border)",textAlign:"center" }}>
                <p style={{ fontSize:8,color:"var(--text-subtle)",fontFamily:"var(--font-mono)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:2 }}>Countdown</p>
                <p style={{ fontSize:20,fontWeight:300,fontFamily:"var(--font-display)",color:d<14?"var(--terra)":d<42?"var(--gold)":"var(--olive)",lineHeight:1 }}>{d<0?"past":d}</p>
                <p style={{ fontSize:8,color:"var(--text-subtle)",fontFamily:"var(--font-mono)" }}>{d<0?"days ago":"days"}</p>
              </div>
            );})()}
          </div>
          <div style={{ background:"var(--surface)",padding:"11px 12px",display:"flex",alignItems:"center",borderLeft:"1px solid var(--border)" }}>
            <button onClick={()=>setShowGoalEditor(true)} style={{ fontSize:11,color:"var(--text-muted)",background:"none",border:"none",cursor:"pointer",fontFamily:"var(--font-mono)",letterSpacing:"0.06em",textTransform:"uppercase" }}>Edit</button>
          </div>
          <div style={{ background:"var(--surface)",padding:"11px 12px",display:"flex",alignItems:"center",borderLeft:"1px solid var(--border)" }}>
            <button onClick={()=>onGoalChange(null)} style={{ fontSize:9,color:"var(--terra)",background:"none",border:"none",cursor:"pointer",fontFamily:"var(--font-mono)",letterSpacing:"0.06em",textTransform:"uppercase" }}>Clear</button>
          </div>
        </div>
      )}
      {!showGoalEditor&&!goal&&(
        <button onClick={()=>setShowGoalEditor(true)} style={{ display:"flex",alignItems:"center",gap:10,padding:"9px 16px",background:"transparent",border:"1px dashed var(--border-hi)",borderRadius:8,cursor:"pointer",color:"var(--text-subtle)",fontFamily:"var(--font-mono)",fontSize:10,letterSpacing:"0.06em",textTransform:"uppercase",width:"100%",transition:"border-color 0.15s,color 0.15s" }}>
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="6" y1="1" x2="6" y2="11"/><line x1="1" y1="6" x2="11" y2="6"/></svg>
          Set a goal race
        </button>
      )}
      {showGoalEditor&&(
        <Card p={16}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
            <p style={{ fontSize:11,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.12em",fontFamily:"var(--font-mono)" }}>Goal race</p>
            <button onClick={()=>setShowGoalEditor(false)} style={{ width:22,height:22,borderRadius:4,border:"1px solid var(--border)",background:"transparent",cursor:"pointer",color:"var(--text-muted)",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center" }}>×</button>
          </div>
          <GoalEditor initial={goal} onSave={g=>{onGoalChange(g);setShowGoalEditor(false);}} />
        </Card>
      )}

      {races.length===0?(
        <Card style={{ textAlign:"center" }} p={52}><EmptyState label="Log a session with type 'race' to analyse it here" /></Card>
      ):(
        <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
          {/* Race list */}
          {races.map((r,i)=>{
            const isSelected=sel?.id===r.id;
            const c=sc(r);
            return (
              <Card key={r.id} p={0} style={{ cursor:"pointer",border:`1px solid ${isSelected?"var(--gold)":"var(--border)"}`,transition:"border-color 0.15s",overflow:"hidden" }}>
                <div style={{ display:"grid",gridTemplateColumns:"4px 1fr",height:"100%" }}>
                  <div style={{ background:isSelected?"var(--gold)":c+"40" }} />
                  <div style={{ padding:"10px 14px" }}>
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,flexWrap:"wrap" }}>
                      <div style={{ display:"flex",gap:10,alignItems:"center",flex:1,minWidth:0 }} onClick={()=>setDetail(r)}>
                        <div style={{ width:30,height:30,borderRadius:6,background:c+"12",border:"1px solid "+c+"22",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                          <SportIcon sport={r.sport} color={c} size={12} />
                        </div>
                        <div style={{ minWidth:0 }}>
                          <p style={{ fontSize:14,fontWeight:300,fontFamily:"var(--font-display)",fontStyle:"italic",color:"var(--text)",marginBottom:2,lineHeight:1.2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{r.title}</p>
                          <p style={{ fontSize:11,color:"var(--text-muted)",fontFamily:"var(--font-mono)" }}>{r.date} · {fmtDist(r.distance_meters,r.sport)} · {fmtDuration(r.duration_seconds)}</p>
                        </div>
                      </div>
                      <div style={{ display:"flex",gap:14,alignItems:"center",flexShrink:0 }}>
                        {r.avg_pace_sec_km&&<div><p style={{ fontSize:8,color:"var(--text-subtle)",fontFamily:"var(--font-mono)",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:1 }}>pace</p><p style={{ fontSize:14,fontWeight:300,fontFamily:"var(--font-display)",color:"var(--olive)",lineHeight:1 }}>{fmtPace(r.avg_pace_sec_km)}</p></div>}
                        {r.avg_heart_rate&&<div><p style={{ fontSize:8,color:"var(--text-subtle)",fontFamily:"var(--font-mono)",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:1 }}>hr</p><p style={{ fontSize:14,fontWeight:300,fontFamily:"var(--font-display)",color:"var(--text)",lineHeight:1 }}>{r.avg_heart_rate}</p></div>}
                        {r.tss&&<div><p style={{ fontSize:8,color:"var(--text-subtle)",fontFamily:"var(--font-mono)",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:1 }}>tss</p><p style={{ fontSize:14,fontWeight:300,fontFamily:"var(--font-display)",color:tssColor(r.tss),lineHeight:1 }}>{r.tss}</p></div>}
                        {r.feel_score&&<div><p style={{ fontSize:8,color:"var(--text-subtle)",fontFamily:"var(--font-mono)",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:1 }}>feel</p><p style={{ fontSize:14,fontWeight:300,fontFamily:"var(--font-display)",color:"var(--gold)",lineHeight:1 }}>★{r.feel_score}</p></div>}
                        <div style={{ display:"flex",gap:4 }}>
                          <button onClick={()=>setDetail(r)} style={{ padding:"5px 10px",borderRadius:4,cursor:"pointer",fontSize:9,border:"1px solid var(--border)",background:"transparent",color:"var(--text-muted)",fontFamily:"var(--font-mono)" }}>Detail</button>
                          <button onClick={()=>{setSel(r);setAnalysis(null);analyze(r);}} style={{ padding:"5px 10px",borderRadius:4,cursor:"pointer",fontSize:9,border:`1px solid ${isSelected?"var(--gold)":"var(--border)"}`,background:isSelected?"var(--gold-dim)":"transparent",color:isSelected?"var(--gold)":"var(--text-muted)",fontFamily:"var(--font-mono)" }}>{loading&&sel?.id===r.id?"…":"AI"}</button>
                        </div>
                      </div>
                    </div>
                    {/* AI analysis inline */}
                    {sel?.id===r.id&&analysis&&(
                      <div style={{ marginTop:14,paddingTop:14,borderTop:"1px solid var(--border)" }}>
                        <InsightCard accent="var(--gold)" tag="Race Analysis · AI">
                          <div><Markdown text={analysis} size={12} /></div>
                        </InsightCard>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── ACTIVITIES PAGE ──────────────────────────────────────────────────────────

function ActivitiesPage({ activities, profile, onRefresh }: { activities:Activity[]; profile:Profile|null; onRefresh:()=>void }) {
  const [showForm,setShowForm]=useState(false);
  const [saving,setSaving]=useState(false);
  const [editTarget,setEditTarget]=useState<Activity|null>(null);
  const [deleteTarget,setDeleteTarget]=useState<string|null>(null);
  const [detailTarget,setDetailTarget]=useState<Activity|null>(null);
  const [toast,setToast]=useState<{message:string;type:"success"|"error"|"info"}|null>(null);
  const [filter,setFilter]=useState("all");
  const [search,setSearch]=useState("");
  const [sort,setSort]=useState<"date"|"tss"|"distance"|"duration">("date");

  const showToast=(msg:string,type:"success"|"error"|"info"="success")=>setToast({message:msg,type});

  const handleSave=async(f:AF)=>{setSaving(true);try{const body=formToBody(f);if(editTarget){await fetch("/api/activities",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:editTarget.id,...body})});showToast("Activity updated");setEditTarget(null);}else{await fetch("/api/activities",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});showToast("Activity saved");setShowForm(false);}onRefresh();}catch{showToast("Error saving","error");}finally{setSaving(false);}};
  const handleDelete=async(id:string)=>{try{await fetch("/api/activities",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id})});showToast("Deleted");setDeleteTarget(null);onRefresh();}catch{showToast("Error","error");}};

  const sports=["all",...Array.from(new Set(activities.map(a=>a.sport)))];
  const filtered=useMemo(()=>{
    let f=filter==="all"?activities:activities.filter(a=>a.sport===filter);
    if(search)f=f.filter(a=>a.title.toLowerCase().includes(search.toLowerCase())||(a.notes??"").toLowerCase().includes(search.toLowerCase()));
    if(sort==="tss")f=[...f].sort((a,b)=>(b.tss??0)-(a.tss??0));
    if(sort==="distance")f=[...f].sort((a,b)=>(b.distance_meters??0)-(a.distance_meters??0));
    if(sort==="duration")f=[...f].sort((a,b)=>(b.duration_seconds??0)-(a.duration_seconds??0));
    return f;
  },[activities,filter,search,sort]);
  const totalTSS=useMemo(()=>filtered.reduce((s,a)=>s+(a.tss??0),0),[filtered]);
  const totalDist=useMemo(()=>filtered.reduce((s,a)=>s+(a.distance_meters??0)/1000,0),[filtered]);

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
      {deleteTarget&&<Confirm message="Delete this activity? This cannot be undone." onConfirm={()=>handleDelete(deleteTarget)} onCancel={()=>setDeleteTarget(null)} />}
      
      <style>{`
        /* ── Base font size ── */
        body { font-size: 14px; }
        
        /* ── Dark mode contrast boost ── */
        [data-theme="dark"] {
          --text-muted: #B8B4AA;
          --text-subtle: #8A867E;
          --border: #383832;
          --border-hi: #4A4A42;
        }
        /* ── Light mode contrast boost ── */
        :root {
          --text-muted: #5A574F;
          --text-subtle: #888480;
        }

        /* ── Mobile ── */
        @media (max-width: 640px) {
          .op-chart-tall { height: 140px !important; }
          .op-grid-2 { grid-template-columns: 1fr !important; }
          .op-grid-form { grid-template-columns: 1fr !important; }
          .recharts-wrapper { touch-action: pan-y; }
        }

        /* ── Charts ── */
        .recharts-bar-rectangle { shape-rendering: crispEdges; }
        .recharts-cartesian-axis-tick text { font-size: 10px !important; }
      `}</style>
      {toast&&<Toast message={toast.message} type={toast.type} onDone={()=>setToast(null)} />}
      {(showForm&&!editTarget)&&<ActivityFormModal onSave={handleSave} onClose={()=>setShowForm(false)} saving={saving} />}
      {editTarget&&<ActivityFormModal initial={actToForm(editTarget)} onSave={handleSave} onClose={()=>setEditTarget(null)} saving={saving} />}
      {detailTarget&&<ActivityDetailModal act={detailTarget} profile={profile} onClose={()=>setDetailTarget(null)} onEdit={a=>{setDetailTarget(null);setEditTarget(a);}} onDelete={id=>{setDetailTarget(null);setDeleteTarget(id);}} />}

      <PageHeader supra="Training log" title="Activities" action={<Btn onClick={()=>{setShowForm(true);setEditTarget(null);}}>+ Log activity</Btn>} />

      {/* Filters */}
      <div style={{ display:"flex",gap:10,alignItems:"center",flexWrap:"wrap" }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…" style={{ padding:"7px 12px",borderRadius:6,border:"1px solid var(--border)",background:"var(--surface)",color:"var(--text)",fontSize:12,width:160,fontFamily:"var(--font-mono)",boxSizing:"border-box" }} />
        <div style={{ display:"flex",gap:5,flexWrap:"wrap" }}>
          {sports.map(s=><button key={s} onClick={()=>setFilter(s)} style={{ padding:"5px 11px",borderRadius:20,border:`1px solid ${filter===s?"var(--gold)":"var(--border)"}`,background:filter===s?"var(--gold-dim)":"transparent",color:filter===s?"var(--gold)":"var(--text-muted)",fontSize:10,cursor:"pointer",textTransform:"capitalize",fontFamily:"var(--font-mono)" }}>{s}</button>)}
        </div>
        <div style={{ marginLeft:"auto",display:"flex",alignItems:"center",gap:6 }}>
          <span style={{ fontSize:11,color:"var(--text-muted)",fontFamily:"var(--font-mono)" }}>sort</span>
          {(["date","tss","distance"] as const).map(s=><button key={s} onClick={()=>setSort(s)} style={{ padding:"4px 9px",borderRadius:4,border:`1px solid ${sort===s?"var(--gold)":"var(--border)"}`,background:sort===s?"var(--gold-dim)":"transparent",color:sort===s?"var(--gold)":"var(--text-muted)",fontSize:10,cursor:"pointer",fontFamily:"var(--font-mono)" }}>{s}</button>)}
        </div>
      </div>

      {filtered.length>0&&(
        <div style={{ display:"flex",gap:16,padding:"8px 0",borderBottom:"1px solid var(--border)" }}>
          <span style={{ fontSize:12,color:"var(--text-muted)",fontFamily:"var(--font-mono)" }}><strong style={{ color:"var(--text)" }}>{filtered.length}</strong> sessions</span>
          <span style={{ fontSize:12,color:"var(--text-muted)",fontFamily:"var(--font-mono)" }}><strong style={{ color:"var(--text)" }}>{totalDist.toFixed(0)} km</strong></span>
          <span style={{ fontSize:12,color:"var(--text-muted)",fontFamily:"var(--font-mono)" }}><strong style={{ color:"var(--text)" }}>{totalTSS}</strong> TSS</span>
        </div>
      )}

      <Card p={18}>
        {filtered.length===0
          ?<EmptyState label={activities.length===0?"No activities yet. Begin your record.":search?"No results.":"No activities match this filter."} />
          :(
            <>
              <div className="op-act-grid" style={{ display:"grid",gridTemplateColumns:"32px 1fr 80px 80px 80px 56px 40px 48px",gap:12,paddingBottom:10,borderBottom:"1px solid var(--border)",marginBottom:2 }}>
                {["","Session","Duration","Distance",<span key="e" className="op-col-elev">Elevation</span>,"Load","Feel",""].map((h,i)=>(
                  <p key={i} style={{ fontSize:11,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.08em",fontFamily:"var(--font-mono)" }}>{h}</p>
                ))}
              </div>
              {filtered.map((act,i)=>(
                <ActivityRow key={act.id} act={act} border={i<filtered.length-1} onClick={()=>setDetailTarget(act)} onEdit={a=>{setDetailTarget(null);setEditTarget(a);}} onDelete={id=>setDeleteTarget(id)} />
              ))}
            </>
          )
        }
      </Card>
    </div>
  );
}

// ─── PROFILE ─────────────────────────────────────────────────────────────────

function ProfilePage({ profile, onSaved }: { profile:Profile|null; onSaved:()=>void }) {
  const mob = useIsMobile();
  const [f,setF]=useState({
    full_name: profile?.full_name??"",
    sport:     profile?.sport??"running",
    weight_kg: profile?.weight_kg ? String(profile.weight_kg) : "",
    height_cm: profile?.height_cm ? String(profile.height_cm) : "",
    birth_date:profile?.birth_date??"",
    ftp_watts: profile?.ftp_watts ? String(profile.ftp_watts) : "",
    lthr:      profile?.lthr ? String(profile.lthr) : "",
    vdot:      profile?.vdot ? String(profile.vdot) : "",
  });
  const [saving,setSaving]=useState(false);
  const [toast,setToast]=useState<{message:string;type:"success"|"error"}|null>(null);
  const s=(k:string)=>(v:string)=>setF(p=>({...p,[k]:v}));

  const save=async()=>{
    setSaving(true);
    try {
      const res=await fetch("/api/profile",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({
        ...f,
        weight_kg: f.weight_kg?parseFloat(f.weight_kg):null,
        height_cm: f.height_cm?parseFloat(f.height_cm):null,
        ftp_watts: f.ftp_watts?parseInt(f.ftp_watts):null,
        lthr:      f.lthr?parseInt(f.lthr):null,
        vdot:      f.vdot?parseFloat(f.vdot):null,
      })});
      if(!res.ok) throw new Error();
      setToast({message:"Profile saved",type:"success"});
      onSaved();
    } catch { setToast({message:"Error saving profile",type:"error"}); }
    finally { setSaving(false); }
  };

  const ftp  = parseInt(f.ftp_watts)||0;
  const lthr = parseInt(f.lthr)||0;
  const vdot = parseFloat(f.vdot)||0;
  const wkg  = ftp && f.weight_kg ? Math.round((ftp/parseFloat(f.weight_kg))*100)/100 : null;
  const age  = f.birth_date ? Math.floor((Date.now()-new Date(f.birth_date).getTime())/31557600000) : null;
  const initials = f.full_name ? f.full_name.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase() : "AT";

  // Compact inline field — label + input on same row
  const Row = ({ label, hint, children }: { label:string; hint?:string; children:React.ReactNode }) => (
    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,alignItems:"center",padding:"8px 0",borderBottom:"1px solid var(--border)" }}>
      <div style={{ display:"flex",alignItems:"center",gap:4 }}>
        <span style={{ fontSize:11,color:"var(--text-muted)",fontFamily:"var(--font-mono)",textTransform:"uppercase",letterSpacing:"0.07em" }}>{label}</span>
        {hint&&<HintIcon text={hint} />}
      </div>
      {children}
    </div>
  );

  // Zone table compact
  const ZoneTable = ({ zones }: { zones:{z:string;n:string;val:string;color:string}[] }) => (
    <div style={{ display:"flex",flexDirection:"column",gap:0 }}>
      {zones.map((z,i)=>(
        <div key={z.z} style={{ display:"grid",gridTemplateColumns:"28px 1fr auto",gap:8,alignItems:"center",padding:"5px 0",borderTop:i>0?"1px solid var(--border)":"none" }}>
          <span style={{ fontSize:8,color:"var(--text-subtle)",fontFamily:"var(--font-mono)",letterSpacing:"0.05em" }}>{z.z}</span>
          <div style={{ display:"flex",alignItems:"center",gap:6 }}>
            <div style={{ width:3,height:10,borderRadius:2,background:z.color,flexShrink:0 }} />
            <span style={{ fontSize:12,color:"var(--text-muted)" }}>{z.n}</span>
          </div>
          <span style={{ fontSize:12,color:"var(--text)",fontFamily:"var(--font-mono)",letterSpacing:"0.02em" }}>{z.val}</span>
        </div>
      ))}
    </div>
  );

  const powerZones = ftp>0 ? [
    {z:"Z1",n:"Recovery",  color:"#6B8F71",val:`${Math.round(ftp*0.01)}–${Math.round(ftp*0.55)}W`},
    {z:"Z2",n:"Endurance", color:"#4A7C8E",val:`${Math.round(ftp*0.56)}–${Math.round(ftp*0.75)}W`},
    {z:"Z3",n:"Tempo",     color:"#7E8E4A",val:`${Math.round(ftp*0.76)}–${Math.round(ftp*0.90)}W`},
    {z:"Z4",n:"Threshold", color:"#C8A84E",val:`${Math.round(ftp*0.91)}–${Math.round(ftp*1.05)}W`},
    {z:"Z5",n:"VO₂Max",   color:"#C87840",val:`${Math.round(ftp*1.06)}–${Math.round(ftp*1.20)}W`},
    {z:"Z6",n:"Anaerobic", color:"#C84040",val:`${Math.round(ftp*1.21)}–${Math.round(ftp*1.50)}W`},
  ] : [];

  const hrZones = lthr>0 ? [
    {z:"Z1",n:"Recovery",  color:"#6B8F71",val:`< ${Math.round(lthr*0.85)} bpm`},
    {z:"Z2",n:"Aerobic",   color:"#4A7C8E",val:`${Math.round(lthr*0.85)}–${Math.round(lthr*0.89)} bpm`},
    {z:"Z3",n:"Tempo",     color:"#7E8E4A",val:`${Math.round(lthr*0.90)}–${Math.round(lthr*0.94)} bpm`},
    {z:"Z4",n:"Threshold", color:"#C8A84E",val:`${Math.round(lthr*0.95)}–${Math.round(lthr*0.99)} bpm`},
    {z:"Z5a",n:"VO₂Max",  color:"#C87840",val:`${Math.round(lthr*1.00)}–${Math.round(lthr*1.02)} bpm`},
    {z:"Z5b",n:"Speed",    color:"#C84040",val:`> ${Math.round(lthr*1.03)} bpm`},
  ] : [];

  // VDOT training paces (Jack Daniels)
  const vdotPaces = vdot>0 ? (() => {
    // Formula approximation: pace in sec/km
    const easyPace = Math.round(3600 / (vdot * 0.135));
    const marathonPace = Math.round(3600 / (vdot * 0.163));
    const thresholdPace = Math.round(3600 / (vdot * 0.177));
    const intervalPace = Math.round(3600 / (vdot * 0.195));
    const repPace = Math.round(3600 / (vdot * 0.215));
    return [
      {z:"E", n:"Easy",      color:"#6B8F71", val:fmtPace(easyPace)+"/km"},
      {z:"M", n:"Marathon",  color:"#4A7C8E", val:fmtPace(marathonPace)+"/km"},
      {z:"T", n:"Threshold", color:"#C8A84E", val:fmtPace(thresholdPace)+"/km"},
      {z:"I", n:"Interval",  color:"#C87840", val:fmtPace(intervalPace)+"/km"},
      {z:"R", n:"Repetition",color:"#C84040", val:fmtPace(repPace)+"/km"},
    ];
  })() : [];

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
      {toast&&<Toast message={toast.message} type={toast.type} onDone={()=>setToast(null)} />}
      <PageHeader supra="Account" title="Athlete Profile" />

      {/* ── Hero card ── */}
      <Card p={16}>
        <div style={{ display:"flex",alignItems:"center",gap:14 }}>
          <div style={{ width:52,height:52,borderRadius:"50%",background:"var(--gold-dim)",border:"2px solid var(--gold)30",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
            <span style={{ fontSize:18,fontWeight:300,color:"var(--gold)",fontFamily:"var(--font-display)",lineHeight:1 }}>{initials}</span>
          </div>
          <div style={{ flex:1,minWidth:0 }}>
            <p style={{ fontSize:16,fontWeight:300,fontFamily:"var(--font-display)",fontStyle:"italic",color:"var(--text)",marginBottom:3,lineHeight:1.2 }}>{f.full_name||"Athlete"}</p>
            <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
              <Badge color="var(--gold)">{f.sport}</Badge>
              {age&&<Badge color="var(--stone)">{age}y</Badge>}
              {wkg&&<Badge color="var(--olive)">{wkg} W/kg</Badge>}
              {ftp>0&&<Badge color="var(--terra)">FTP {ftp}W</Badge>}
              {lthr>0&&<Badge color="var(--stone)">LTHR {lthr}</Badge>}
              {vdot>0&&<Badge color="var(--stone)">VDOT {vdot}</Badge>}
            </div>
          </div>
          <Btn onClick={save} disabled={saving} style={{ flexShrink:0 }}>{saving?"Saving…":"Save"}</Btn>
        </div>
      </Card>

      {/* ── Main grid ── */}
      <div style={{ display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:14,alignItems:"start" }}>

        {/* LEFT col: personal + thresholds */}
        <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
          <Card p={16}>
            <p style={{ fontSize:11,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.14em",fontFamily:"var(--font-mono)",marginBottom:10 }}>Personal</p>
            <div>
              <Row label="Name"><Input value={f.full_name} onChange={s("full_name")} placeholder="Carlos Almeida" /></Row>
              <Row label="Born"><Input type="date" value={f.birth_date} onChange={s("birth_date")} /></Row>
              <Row label="Weight" hint="Used for W/kg and fueling calculations"><Input value={f.weight_kg} onChange={s("weight_kg")} placeholder="72 kg" /></Row>
              <Row label="Height"><Input value={f.height_cm} onChange={s("height_cm")} placeholder="178 cm" /></Row>
              <Row label="Sport">
                <Sel value={f.sport} onChange={s("sport")} options={["running","cycling","swimming","triathlon","strength"]} />
              </Row>
            </div>
          </Card>

          <Card p={16}>
            <p style={{ fontSize:11,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.14em",fontFamily:"var(--font-mono)",marginBottom:10 }}>Performance thresholds</p>
            <div>
              <Row label="FTP" hint="Functional Threshold Power — max 1h average power. Powers TSS, IF and all cycling zones.">
                <Input value={f.ftp_watts} onChange={s("ftp_watts")} placeholder="280 W" />
              </Row>
              <Row label="LTHR" hint="Lactate Threshold Heart Rate (Friel model). Used for HR zone distribution in activity analysis.">
                <Input value={f.lthr} onChange={s("lthr")} placeholder="168 bpm" />
              </Row>
              <Row label="VDOT" hint="Jack Daniels aerobic index from race times. Determines E / M / T / I / R training paces.">
                <Input value={f.vdot} onChange={s("vdot")} placeholder="52.5" />
              </Row>
            </div>
          </Card>
        </div>

        {/* RIGHT col: zone tables */}
        <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
          {powerZones.length>0&&(
            <Card p={16}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}>
                <p style={{ fontSize:11,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.14em",fontFamily:"var(--font-mono)" }}>Power zones</p>
                <span style={{ fontSize:8,color:"var(--text-subtle)",fontFamily:"var(--font-mono)" }}>Coggan · FTP {ftp}W</span>
              </div>
              <ZoneTable zones={powerZones} />
            </Card>
          )}

          {hrZones.length>0&&(
            <Card p={16}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}>
                <p style={{ fontSize:11,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.14em",fontFamily:"var(--font-mono)" }}>HR zones</p>
                <span style={{ fontSize:8,color:"var(--text-subtle)",fontFamily:"var(--font-mono)" }}>Friel · LTHR {lthr} bpm</span>
              </div>
              <ZoneTable zones={hrZones} />
            </Card>
          )}

          {vdotPaces.length>0&&(
            <Card p={16}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}>
                <p style={{ fontSize:11,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.14em",fontFamily:"var(--font-mono)" }}>Training paces</p>
                <span style={{ fontSize:8,color:"var(--text-subtle)",fontFamily:"var(--font-mono)" }}>Daniels · VDOT {vdot}</span>
              </div>
              <ZoneTable zones={vdotPaces} />
            </Card>
          )}

          {!ftp&&!lthr&&!vdot&&(
            <Card p={20} style={{ textAlign:"center",opacity:0.6 }}>
              <p style={{ fontSize:12,color:"var(--text-muted)",fontFamily:"var(--font-mono)",lineHeight:1.7 }}>
                Add FTP, LTHR or VDOT above to see your power zones, HR zones and training paces automatically calculated.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}


// ─── SYNC PAGE ────────────────────────────────────────────────────────────────

function SyncPage({ onRefresh }: { onRefresh: () => void }) {
  const [stravaStatus, setStravaStatus] = useState<"loading"|"connected"|"disconnected">("loading");
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ imported: number; message: string } | null>(null);
  const [syncDays, setSyncDays] = useState(30);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number; errors: string[]; message: string } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Check Strava connection status — re-runs if tokens just saved
  useEffect(() => {
    setStravaStatus("loading");
    fetch("/api/strava/sync")
      .then(r => r.json())
      .then(d => setStravaStatus(d.connected ? "connected" : "disconnected"))
      .catch(() => setStravaStatus("disconnected"));
  }, []); // intentionally runs once; AppShell re-mounts SyncPage on navigation

  const connectStrava = () => { window.location.href = "/api/strava/auth"; };

  const syncStrava = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch("/api/strava/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days: syncDays }),
      });
      const d = await res.json();
      if (d.error) throw new Error(d.error);
      setSyncResult(d);
      showToast(d.message, d.imported > 0 ? "success" : "info");
      if (d.imported > 0) onRefresh();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Sync failed", "error");
    } finally { setSyncing(false); }
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setImporting(true);
    setImportResult(null);
    const fd = new FormData();
    Array.from(files).forEach(f => fd.append("files", f));
    try {
      const res = await fetch("/api/import", { method: "POST", body: fd });
      const d = await res.json();
      setImportResult(d);
      showToast(d.message, d.imported > 0 ? "success" : "info");
      if (d.imported > 0) onRefresh();
    } catch { showToast("Import failed", "error"); }
    finally { setImporting(false); }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const stravaColor = stravaStatus === "connected" ? "var(--olive)" : "var(--terra)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
      <PageHeader supra="Integrations" title="Sync & Import" />

      {/* ── STRAVA ── */}
      <Card p={24}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* Strava flame logo */}
            <div style={{ width: 44, height: 44, borderRadius: 10, background: "#FC4C02", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
              </svg>
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text)", marginBottom: 3, fontFamily: "var(--font-display)", fontStyle: "italic" }}>Strava</p>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: stravaColor }} />
                <p style={{ fontSize: 10, color: stravaColor, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {stravaStatus === "loading" ? "checking…" : stravaStatus === "connected" ? "connected" : "not connected"}
                </p>
              </div>
            </div>
          </div>
          {stravaStatus === "disconnected" && (
            <Btn onClick={connectStrava}>Connect Strava →</Btn>
          )}
        </div>

        {stravaStatus === "connected" && (
          <>
            <GreekDivider style={{ marginBottom: 20 }} />
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <label style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      Sync period
                    </label>
                    <HintIcon text="How many days back to pull from Strava. Already-synced activities won't be duplicated." />
                  </div>
                  <span style={{ fontSize: 13, color: "var(--text)", fontFamily: "var(--font-display)", fontWeight: 300 }}>
                    {syncDays} <span style={{ fontSize: 9, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>days</span>
                  </span>
                </div>
                <input type="range" min={7} max={365} step={7} value={syncDays}
                  onChange={e => setSyncDays(parseInt(e.target.value))} style={{ width: "100%" }} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                  {[7, 30, 90, 180, 365].map(d => (
                    <button key={d} onClick={() => setSyncDays(d)}
                      style={{ fontSize: 9, color: syncDays === d ? "var(--gold)" : "var(--text-subtle)", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-mono)", padding: "2px 4px" }}>
                      {d === 365 ? "1y" : d === 180 ? "6m" : d === 90 ? "3m" : d + "d"}
                    </button>
                  ))}
                </div>
              </div>
              <Btn onClick={syncStrava} disabled={syncing} style={{ flexShrink: 0 }}>
                {syncing ? "Syncing…" : "↓ Sync now"}
              </Btn>
            </div>

            {syncResult && (
              <div style={{ marginTop: 16, padding: "12px 16px", borderRadius: 8, background: syncResult.imported > 0 ? "var(--olive-dim)" : "var(--surface-hi)", border: `1px solid ${syncResult.imported > 0 ? "var(--olive)" : "var(--border)"}30` }}>
                <p style={{ fontSize: 12, color: syncResult.imported > 0 ? "var(--olive)" : "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                  {syncResult.imported > 0 ? "✓" : "·"} {syncResult.message}
                </p>
              </div>
            )}
          </>
        )}

        {stravaStatus === "disconnected" && (
          <div style={{ padding: "14px 0 2px" }}>
            <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.7, fontFamily: "var(--font-display)", fontStyle: "italic" }}>
              Connect your Strava account to automatically import all your runs, rides, and swims.
              Activities already in Olympeaks won&apos;t be duplicated.
            </p>
            <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 6 }}>
              {["Imports runs, rides, swims, and more", "Maps HR, power, pace, elevation automatically", "Estimates TSS from Strava Suffer Score", "Incremental — only imports new activities"].map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--gold)", flexShrink: 0 }} />
                  <p style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{f}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* ── GARMIN / FILE IMPORT ── */}
      <Card p={24}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: "#003366", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="22" height="16" viewBox="0 0 60 42" fill="white">
              <path d="M30 0C13.4 0 0 9.4 0 21s13.4 21 30 21 30-9.4 30-21S46.6 0 30 0zm0 36c-8.3 0-15-6.7-15-15S21.7 6 30 6s15 6.7 15 15-6.7 15-15 15zm0-24c-5 0-9 4-9 9s4 9 9 9 9-4 9-9-4-9-9-9z" />
            </svg>
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text)", marginBottom: 3, fontFamily: "var(--font-display)", fontStyle: "italic" }}>Garmin / File Import</p>
            <p style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em" }}>GPX · TCX · FIT</p>
          </div>
        </div>

        <GreekDivider style={{ marginBottom: 20 }} />

        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
          style={{
            border: `1px dashed ${dragOver ? "var(--gold)" : "var(--border-hi)"}`,
            borderRadius: 10,
            padding: "36px 24px",
            textAlign: "center",
            cursor: "pointer",
            background: dragOver ? "var(--gold-dim)" : "var(--bg)",
            transition: "all 0.15s",
            marginBottom: 16,
          }}>
          <input ref={fileRef} type="file" multiple accept=".gpx,.tcx,.fit"
            style={{ display: "none" }} onChange={e => handleFiles(e.target.files)} />
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="var(--text-subtle)" strokeWidth="1" style={{ margin: "0 auto 12px" }}>
            <path d="M14 18 L14 8" strokeLinecap="round" />
            <polyline points="10,12 14,8 18,12" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5,20 L5,23 L23,23 L23,20" strokeLinecap="round" />
          </svg>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4, fontFamily: "var(--font-mono)" }}>
            {importing ? "Importing…" : "Drop .gpx or .tcx files here"}
          </p>
          <p style={{ fontSize: 10, color: "var(--text-subtle)", fontFamily: "var(--font-mono)" }}>
            or click to browse · multiple files supported
          </p>
        </div>

        {importResult && (
          <div style={{ padding: "12px 16px", borderRadius: 8, background: importResult.imported > 0 ? "var(--olive-dim)" : "var(--terra-dim)", border: `1px solid ${importResult.imported > 0 ? "var(--olive)" : "var(--terra)"}30` }}>
            <p style={{ fontSize: 12, color: importResult.imported > 0 ? "var(--olive)" : "var(--terra)", fontFamily: "var(--font-mono)", marginBottom: importResult.errors.length ? 6 : 0 }}>
              {importResult.imported > 0 ? "✓" : "✕"} {importResult.message}
            </p>
            {importResult.errors.map((e, i) => (
              <p key={i} style={{ fontSize: 10, color: "var(--terra)", fontFamily: "var(--font-mono)", marginTop: 3 }}>⚠ {e}</p>
            ))}
          </div>
        )}

        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 5 }}>
          <p style={{ fontSize: 9, color: "var(--text-subtle)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>How to export from Garmin</p>
          {[
            "Go to Garmin Connect → Activities",
            "Open any activity → ⋯ → Export to GPX",
            "Or bulk export via Settings → Account → Export Data",
          ].map((s, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ fontSize: 9, color: "var(--gold)", fontFamily: "var(--font-mono)", flexShrink: 0, marginTop: 1 }}>{i + 1}.</span>
              <p style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{s}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* ── SETUP GUIDE ── */}
      <Card p={22}>
        <SectionTitle mono sub="Add to your .env.local and Vercel environment variables">Strava API setup</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { step: "1", text: "Go to strava.com/settings/api and create an app" },
            { step: "2", text: 'Set Authorization Callback Domain to your Vercel URL (e.g. olympeaks.vercel.app)' },
            { step: "3", text: "Copy Client ID and Client Secret" },
            { step: "4", text: "Add to Vercel: STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, NEXT_PUBLIC_APP_URL" },
          ].map(({ step, text }) => (
            <div key={step} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "10px 0", borderBottom: step !== "4" ? "1px solid var(--border)" : "none" }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", border: "1px solid var(--gold)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                <span style={{ fontSize: 9, color: "var(--gold)", fontFamily: "var(--font-mono)", fontWeight: 700 }}>{step}</span>
              </div>
              <p style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6, fontFamily: "var(--font-mono)" }}>{text}</p>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16, padding: "12px 14px", background: "var(--bg)", borderRadius: 6, fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)", lineHeight: 1.8 }}>
          <span style={{ color: "var(--text-subtle)" }}># .env.local</span><br />
          STRAVA_CLIENT_ID=<span style={{ color: "var(--gold)" }}>your_client_id</span><br />
          STRAVA_CLIENT_SECRET=<span style={{ color: "var(--gold)" }}>your_client_secret</span><br />
          NEXT_PUBLIC_APP_URL=<span style={{ color: "var(--gold)" }}>https://olympeaks.vercel.app</span>
        </div>
      </Card>
    </div>
  );
}

// ─── SIDEBAR ─────────────────────────────────────────────────────────────────

type PageId="dashboard"|"coach"|"fueling"|"analysis"|"races"|"activities"|"sync"|"profile"|"plan"|"compare"|"records";

const NAV=[
  {id:"dashboard" as PageId, label:"Dashboard",  Icon:IconDashboard,  sublabel:"Home"},
  {id:"coach"     as PageId, label:"AI Coach",   Icon:IconCoach,     sublabel:"Coach"},
  {id:"fueling"   as PageId, label:"Fueling",    Icon:IconFueling,   sublabel:"Fuel"},
  {id:"analysis"  as PageId, label:"Analysis",   Icon:IconAnalysis,  sublabel:"Stats"},
  {id:"races"     as PageId, label:"Races",      Icon:IconRaces,     sublabel:"Races"},
  {id:"activities"as PageId, label:"Activities", Icon:IconActivities,sublabel:"Log"},
  {id:"plan"      as PageId, label:"Train Plan",  Icon:IconPlan,      sublabel:"Plan"},
  {id:"compare"   as PageId, label:"Compare",    Icon:IconCompare,   sublabel:"Vs"},
  {id:"records"   as PageId, label:"Records",    Icon:IconRecords,   sublabel:"PRs"},
  {id:"sync"      as PageId, label:"Sync",       Icon:IconSync,      sublabel:"Sync"},
];

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

function Sidebar({ active, onChange, profile, onSignOut, dark, onToggleTheme }: { active:PageId; onChange:(p:PageId)=>void; profile:Profile|null; onSignOut:()=>void; dark:boolean; onToggleTheme:()=>void }) {
  const mob = useIsMobile();
  const initials = profile?.full_name ? profile.full_name.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase() : "AT";

  // ── MOBILE: horizontal bottom tab bar ────────────────────────────────────
  if (mob) {
    const allTabs = [
      ...NAV,
      { id:"profile" as PageId, label:"Profile", Icon:({ size=20, active=false }: {size?:number;active?:boolean}) => (
        <div style={{ width:size,height:size,borderRadius:"50%",background:active?"var(--gold)":"var(--border)",display:"flex",alignItems:"center",justifyContent:"center" }}>
          <span style={{ fontSize:size*0.45,fontWeight:700,color:active?"#0A0A08":"var(--text-muted)",fontFamily:"var(--font-display)",lineHeight:1 }}>{initials}</span>
        </div>
      )},
    ];
    return (
      <aside style={{
        position:"fixed", bottom:0, left:0, right:0, zIndex:200,
        background:"var(--surface)",
        borderTop:"1px solid var(--border)",
        display:"flex", flexDirection:"column",
      }}>
        {/* Tab row */}
        <div style={{ display:"flex", flexDirection:"row", alignItems:"stretch", height:54 }}>
          {allTabs.map(({ id, label, Icon }) => {
            const a = active === id;
            return (
              <button key={id} onClick={() => onChange(id)}
                style={{
                  flex:1, display:"flex", flexDirection:"column",
                  alignItems:"center", justifyContent:"center",
                  border:"none",
                  borderTop: a ? "2px solid var(--gold)" : "2px solid transparent",
                  background: a ? "var(--gold-dim)" : "transparent",
                  color: a ? "var(--gold)" : "var(--text-muted)",
                  cursor:"pointer", padding:0, gap:0,
                  WebkitTapHighlightColor:"transparent",
                }}>
                <Icon size={20} active={a} />
              </button>
            );
          })}
          {/* Theme toggle */}
          <button onClick={onToggleTheme} style={{
            width:48, display:"flex", flexDirection:"column",
            alignItems:"center", justifyContent:"center",
            border:"none", borderTop:"2px solid transparent",
            background:"transparent", color:"var(--text-muted)",
            cursor:"pointer", padding:0, flexShrink:0,
            WebkitTapHighlightColor:"transparent",
          }}>
            {dark ? <IconSun size={20} /> : <IconMoon size={20} />}
          </button>
        </div>
        {/* iOS safe area spacer */}
        <div style={{ height:"env(safe-area-inset-bottom,0px)", background:"var(--surface)" }} />
      </aside>
    );
  }

  // ── DESKTOP: vertical sidebar ─────────────────────────────────────────────
  return (
    <aside style={{ width:200,flexShrink:0,background:"var(--surface)",borderRight:"1px solid var(--border)",display:"flex",flexDirection:"column",height:"100vh",position:"sticky",top:0 }}>
      {/* Logo */}
      <div style={{ padding:"18px 16px",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",gap:10 }}>
        <OlympeaksLogo size={22} />
        <div>
          <p style={{ fontSize:12,fontWeight:600,color:"var(--text)",letterSpacing:"0.01em",fontFamily:"var(--font-display)" }}>Olympeaks</p>
          <p style={{ fontSize:11,color:"var(--text-muted)",fontFamily:"var(--font-mono)",letterSpacing:"0.08em",marginTop:1 }}>ATHLETE OS</p>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex:1,padding:"12px 6px",overflowY:"auto" }}>
        <p style={{ fontSize:8,fontWeight:700,color:"var(--text-subtle)",letterSpacing:"0.18em",textTransform:"uppercase",padding:"0 10px",marginBottom:6,fontFamily:"var(--font-mono)" }}>Platform</p>
        {NAV.map(({id,label,Icon})=>{
          const a=active===id;
          return (
            <button key={id} onClick={()=>onChange(id)}
              style={{ display:"flex",alignItems:"center",gap:10,width:"100%",padding:"8px 10px",borderRadius:6,border:"none",cursor:"pointer",background:a?"var(--gold-dim)":"transparent",color:a?"var(--gold)":"var(--text-muted)",marginBottom:1,transition:"background 0.1s,color 0.1s",textAlign:"left" }}>
              <span style={{ flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1,width:16 }}>
                <Icon size={14} active={a} />
              </span>
              <span style={{ fontSize:12,fontWeight:a?500:400 }}>{label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={{ padding:"8px 6px 12px",borderTop:"1px solid var(--border)" }}>
        <button onClick={onToggleTheme} style={{ display:"flex",alignItems:"center",gap:10,width:"100%",padding:"7px 10px",borderRadius:6,border:"none",background:"transparent",cursor:"pointer",color:"var(--text-muted)",marginBottom:1 }}>
          <span style={{ width:14,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
            {dark?<IconSun size={13} />:<IconMoon size={13} />}
          </span>
          <span style={{ fontSize:12 }}>{dark?"Light mode":"Dark mode"}</span>
        </button>
        <button onClick={()=>onChange("profile")} style={{ display:"flex",alignItems:"center",gap:10,width:"100%",padding:"8px 10px",borderRadius:6,border:"none",cursor:"pointer",background:active==="profile"?"var(--gold-dim)":"transparent",transition:"background 0.1s",textAlign:"left" }}>
          <div style={{ width:26,height:26,borderRadius:"50%",background:"var(--gold-dim)",border:"1px solid var(--gold)28",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
            <span style={{ fontSize:10,fontWeight:600,color:"var(--gold)",fontFamily:"var(--font-display)" }}>{initials}</span>
          </div>
          <div style={{ flex:1,minWidth:0 }}>
            <p style={{ fontSize:12,fontWeight:500,color:"var(--text)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{profile?.full_name??"Athlete"}</p>
            <p style={{ fontSize:10,color:"var(--text-muted)",textTransform:"capitalize",fontFamily:"var(--font-mono)" }}>{profile?.sport??"endurance"}</p>
          </div>
          <span onClick={e=>{e.stopPropagation();onSignOut();}} title="Sign out" style={{ display:"flex",alignItems:"center",cursor:"pointer",padding:"2px",flexShrink:0,color:"var(--text-subtle)" }}>
            <IconSignOut size={12} />
          </span>
        </button>
      </div>
    </aside>
  );
}

// ─── APP SHELL ────────────────────────────────────────────────────────────────

const supabase=createClient();
export function AppShell() {
  const router=useRouter();
  const {dark,toggle}=useTheme();
  const [page,setPage]=useState<PageId>("dashboard");
  const [profile,setProfile]=useState<Profile|null>(null);
  const [activities,setActivities]=useState<Activity[]>([]);
  const [todayMetrics,setTodayMetrics]=useState<DailyMetrics|null>(null);
  const [wellnessHistory,setWellnessHistory]=useState<DailyMetrics[]>([]);
  const [goal,setGoal]=useState<{name:string;date:string;distance:string;targetTime:string}|null>(null);
  const [loading,setLoading]=useState(true);
  const [wellnessOpen,setWellnessOpen]=useState(false);
  const [wellnessSaving,setWellnessSaving]=useState(false);
  const [toast,setToast]=useState<{message:string;type:"success"|"error"|"info"}|null>(null);

  const load=useCallback(async()=>{
    setLoading(true);
    try {
      const {data:{user}}=await supabase.auth.getUser();
      if(!user){router.push("/login");return;}
      const cutoff30=new Date(Date.now()-30*86400000).toISOString().split("T")[0];
      const [{data:prof},{data:acts},{data:met},{data:hist}]=await Promise.all([
        supabase.from("profiles").select("*").eq("id",user.id).single(),
        supabase.from("activities").select("*").eq("user_id",user.id).order("date",{ascending:false}).limit(200),
        supabase.from("daily_metrics").select("*").eq("user_id",user.id).eq("date",new Date().toISOString().split("T")[0]).single(),
        supabase.from("daily_metrics").select("*").eq("user_id",user.id).gte("date",cutoff30).order("date",{ascending:true}),
      ]);
      setProfile(prof as Profile??null);
      setActivities((acts as Activity[])??[]);
      setTodayMetrics(met as DailyMetrics??null);
      setWellnessHistory((hist as DailyMetrics[])??[]);
      // Load goal from localStorage
      try { const g=localStorage.getItem("op-goal"); if(g) setGoal(JSON.parse(g)); } catch {}
    } finally { setLoading(false); }
  },[]);// eslint-disable-line

  useEffect(()=>{load();},[]);// eslint-disable-line

  // Handle ?strava= param from OAuth redirect — runs at top level, not inside SyncPage
  useEffect(()=>{
    if (typeof window === "undefined") return;
    const p = new URLSearchParams(window.location.search);
    const s = p.get("strava");
    if (s === "connected") {
      setToast({message:"✓ Strava connected successfully!",type:"success"});
      setPage("sync");
      window.history.replaceState({}, "", window.location.pathname);
    }
    if (s === "denied")  { setToast({message:"Strava connection denied",type:"info"}); window.history.replaceState({}, "", window.location.pathname); }
    if (s === "error")   { setToast({message:"Strava auth error — check your credentials",type:"error"}); window.history.replaceState({}, "", window.location.pathname); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);


  const saveWellness=async(f:WF)=>{
    setWellnessSaving(true);
    try {
      const today=new Date().toISOString().split("T")[0];
      await fetch("/api/metrics",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({date:today,sleep_hours:parseFloat(f.sleep),hrv_ms:f.hrv?parseFloat(f.hrv):null,resting_hr:f.rhr?parseInt(f.rhr):null,fatigue:parseInt(f.fatigue),muscle_soreness:parseInt(f.soreness),motivation:parseInt(f.motivation),mood:parseInt(f.mood),weight_kg:f.weight?parseFloat(f.weight):null,notes:f.notes||null})});
      setToast({message:"Wellness logged",type:"success"});
      setWellnessOpen(false); load();
    } catch { setToast({message:"Error saving wellness",type:"error"}); }
    finally { setWellnessSaving(false); }
  };

  const signOut=async()=>{await supabase.auth.signOut();router.push("/login");};
  const tm=calcTM(activities);
  const fs=getFormLabel(tm.tsb);
  const mob=useIsMobile();

  return (
    <div style={{ fontFamily:"var(--font-body)",background:"var(--bg)",minHeight:"100vh",display:"flex",flexDirection: mob ? "column" : "row",color:"var(--text)" }}>
      {toast&&<Toast message={toast.message} type={toast.type} onDone={()=>setToast(null)} />}
      {wellnessOpen&&<WellnessModal date={new Date().toISOString().split("T")[0]} existing={todayMetrics} onSave={saveWellness} onClose={()=>setWellnessOpen(false)} saving={wellnessSaving} />}

      <Sidebar active={page} onChange={setPage} profile={profile} onSignOut={signOut} dark={dark} onToggleTheme={toggle} />

      <main style={{ flex:1,display:"flex",flexDirection:"column",minWidth:0,overflow:"hidden" }}>
        {/* Topbar */}
        <header style={{ position:"sticky",top:0,zIndex:20,background:"var(--bg)",borderBottom:"1px solid var(--border)",padding: mob ? "0 14px" : "0 28px",height:44,display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0 }}>
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            {mob && <OlympeaksLogo size={18} />}
            <span style={{ fontSize:11,color:"var(--text-muted)",letterSpacing:"0.14em",textTransform:"uppercase",fontFamily:"var(--font-mono)" }}>Week {getWeekN()}</span>
            {!mob && (
              <svg width="32" height="6" viewBox="0 0 32 6" fill="none">
                <path d="M0,3 L4,3 L4,0 L8,0 L8,6 L12,6 L12,0 L16,0 L16,3 L20,3 L20,0 L24,0 L24,6 L28,6 L28,3 L32,3" stroke="var(--border-hi)" strokeWidth="0.8" fill="none" />
              </svg>
            )}
          </div>
          <div style={{ display:"flex",alignItems:"center",gap:8 }}>
            <div style={{ display:"flex",alignItems:"center",gap:6,padding:"4px 10px",borderRadius:20,background:formColor(tm.tsb)+"10",border:`1px solid ${formColor(tm.tsb)}20` }}>
              <div style={{ width:4,height:4,borderRadius:"50%",background:formColor(tm.tsb) }} />
              <span style={{ fontSize:10,color:formColor(tm.tsb),fontWeight:600,fontFamily:"var(--font-mono)",letterSpacing:"0.04em" }}>{fs.label}</span>
              {!mob && <span style={{ fontSize:10,color:formColor(tm.tsb),opacity:0.6,fontFamily:"var(--font-mono)" }}>&#xB7; {tm.tsb>0?"+":""}{tm.tsb}</span>}
            </div>
          </div>
        </header>

        {/* Content */}
        <div style={{ flex:1,overflowY:"auto",padding: mob ? "14px 14px 80px" : "24px 28px 72px" }}>
          {loading?(
            <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
              {[80,52,240].map((h,i)=><div key={i} className="skeleton" style={{ height:h,borderRadius:10 }} />)}
            </div>
          ):(() => {
            switch(page){
              case "dashboard":  return <DashboardPage profile={profile} activities={activities} metrics={todayMetrics} goal={goal} onGoalChange={g=>{setGoal(g);try{if(g)localStorage.setItem("op-goal",JSON.stringify(g));else localStorage.removeItem("op-goal");}catch{}}} onNavigate={setPage} onLogWellness={()=>setWellnessOpen(true)} />;
              case "coach":      return <CoachPage activities={activities} metrics={todayMetrics} wellnessHistory={wellnessHistory} onLogWellness={()=>setWellnessOpen(true)} />;
              case "fueling":    return <FuelingPage profile={profile} />;
              case "analysis":   return <AnalysisPage activities={activities} />;
              case "races":      return <RacesPage activities={activities} profile={profile} goal={goal} onGoalChange={g=>{setGoal(g);try{if(g)localStorage.setItem("op-goal",JSON.stringify(g));else localStorage.removeItem("op-goal");}catch{}}} />;
              case "activities": return <ActivitiesPage activities={activities} profile={profile} onRefresh={load} />;
              case "sync":       return <SyncPage onRefresh={load} />;
              case "profile":    return <ProfilePage profile={profile} onSaved={load} />;
              case "plan":       return <TrainPlanPage activities={activities} profile={profile} goal={goal} />;
              case "compare":    return <ComparePage activities={activities} profile={profile} />;
              case "records":    return <RecordsPage activities={activities} profile={profile} />;
            }
          })()}
        </div>
      </main>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// RECORDS PAGE — Personal Best detection across all distances
// ═══════════════════════════════════════════════════════════════════════════
const PR_DISTANCES = [
  { label:"1 km",    meters:1000,   sport:"running" },
  { label:"5 km",    meters:5000,   sport:"running" },
  { label:"10 km",   meters:10000,  sport:"running" },
  { label:"Half",    meters:21097,  sport:"running" },
  { label:"Marathon",meters:42195,  sport:"running" },
  { label:"20 km",   meters:20000,  sport:"cycling" },
  { label:"40 km",   meters:40000,  sport:"cycling" },
  { label:"100 km",  meters:100000, sport:"cycling" },
  { label:"100 m",   meters:100,    sport:"swimming" },
  { label:"400 m",   meters:400,    sport:"swimming" },
  { label:"1500 m",  meters:1500,   sport:"swimming" },
];

function getBestForDistance(acts: Activity[], distMeters: number, sport: string, tolerance=0.06) {
  const candidates = acts.filter(a =>
    a.sport === sport &&
    a.distance_meters != null &&
    a.duration_seconds != null &&
    Math.abs((a.distance_meters - distMeters) / distMeters) <= tolerance
  );
  if (!candidates.length) return null;
  // Best = fastest pace (lowest sec/km normalized to exact distance)
  return candidates.reduce((best, a) => {
    const normSec = (a.duration_seconds! / a.distance_meters!) * distMeters;
    const bestNorm = (best.duration_seconds! / best.distance_meters!) * distMeters;
    return normSec < bestNorm ? a : best;
  });
}

export function RecordsPage({ activities, profile }: { activities: Activity[]; profile: Profile | null }) {
  const mob=useIsMobile();
  const [sport, setSport] = useState<"all"|"running"|"cycling"|"swimming">("running");
  const [detail, setDetail] = useState<Activity|null>(null);

  const sports = ["running","cycling","swimming"] as const;
  const filtered = PR_DISTANCES.filter(d => sport === "all" || d.sport === sport);

  // Build records
  const records = filtered.map(d => {
    const best = getBestForDistance(activities, d.meters, d.sport);
    if (!best) return { ...d, best: null, normSec: null, prevBest: null };
    // Find 2nd best (different activity)
    const others = activities.filter(a =>
      a.sport === d.sport &&
      a.distance_meters != null &&
      a.duration_seconds != null &&
      Math.abs((a.distance_meters - d.meters) / d.meters) <= 0.06 &&
      a.id !== best.id
    );
    const prevBest = others.length ? others.reduce((b, a) => {
      const norm = (a.duration_seconds! / a.distance_meters!) * d.meters;
      const bn = (b.duration_seconds! / b.distance_meters!) * d.meters;
      return norm < bn ? a : b;
    }) : null;
    const normSec = (best.duration_seconds! / best.distance_meters!) * d.meters;
    const prevNormSec = prevBest ? (prevBest.duration_seconds! / prevBest.distance_meters!) * d.meters : null;
    return { ...d, best, normSec, prevBest, prevNormSec };
  }).filter(r => r.best != null);

  // Stats
  const totalPRs = records.length;
  const recentPR = records.filter(r => r.best && Math.floor((Date.now() - new Date(r.best.date).getTime())/86400000) <= 90).length;

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:14 }} className="fade-up">
      {detail && <ActivityDetailModal act={detail} profile={profile} onClose={()=>setDetail(null)} onEdit={()=>{}} onDelete={()=>{}} />}

      {/* Header */}
      <div style={{ display:"flex",alignItems:"center",gap:1,background:"var(--border)",borderRadius:8,overflow:"hidden" }}>
        <div style={{ background:"var(--surface)",padding:"12px 18px",flex:1 }}>
          <p style={{ fontSize:11,color:"var(--text-muted)",letterSpacing:"0.16em",textTransform:"uppercase",marginBottom:3,fontFamily:"var(--font-mono)" }}>Performance</p>
          <p style={{ fontSize:18,fontWeight:300,fontFamily:"var(--font-display)",fontStyle:"italic",color:"var(--text)",lineHeight:1 }}>Personal Records</p>
        </div>
        {[
          {label:"Total PRs", value:String(totalPRs), accent:"var(--gold)"},
          {label:"Last 90d",  value:String(recentPR), accent:"var(--olive)"},
          {label:"Athletes",  value:"1",              accent:"var(--terra)"},
        ].map((m,i)=>(
          <div key={i} style={{ background:"var(--surface)",padding:"12px 18px",position:"relative",borderLeft:"1px solid var(--border)" }}>
            <div style={{ position:"absolute",top:0,left:0,right:0,height:2,background:m.accent }} />
            <p style={{ fontSize:10,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:4,fontFamily:"var(--font-mono)" }}>{m.label}</p>
            <p style={{ fontSize:18,fontWeight:300,fontFamily:"var(--font-display)",color:"var(--text)",lineHeight:1 }}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Sport filter */}
      <div style={{ display:"flex",gap:4 }}>
        {(["running","cycling","swimming"] as const).map(s=>(
          <button key={s} onClick={()=>setSport(s)} style={{ padding:"5px 14px",borderRadius:4,border:`1px solid ${sport===s?"var(--gold)":"var(--border)"}`,background:sport===s?"var(--gold-dim)":"transparent",color:sport===s?"var(--gold)":"var(--text-muted)",fontSize:12,fontFamily:"var(--font-mono)",cursor:"pointer",textTransform:"capitalize" }}>
            {s}
          </button>
        ))}
      </div>

      {records.length === 0 ? (
        <Card style={{ textAlign:"center" }} p={52}><EmptyState label="Log activities to track personal records" /></Card>
      ) : (
        <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
          {records.map((r,i) => {
            if (!r.best || !r.normSec) return null;
            const pace = r.sport === "running" ? fmtPace(r.normSec / (r.meters/1000)) : null;
            const speed = r.sport === "cycling" ? `${((r.meters / r.normSec) * 3.6).toFixed(1)} km/h` : null;
            const swimPace = r.sport === "swimming" ? fmtPace((r.normSec / r.meters) * 100) + "/100m" : null;
            const displayVal = pace ?? speed ?? swimPace ?? fmtDuration(r.normSec);
            const prevVal = r.prevNormSec ? (r.sport==="running" ? fmtPace(r.prevNormSec/(r.meters/1000)) : r.sport==="cycling" ? `${((r.meters/r.prevNormSec)*3.6).toFixed(1)}` : fmtPace((r.prevNormSec/r.meters)*100)+"/100m") : null;
            const improvement = r.prevNormSec ? Math.round(((r.prevNormSec - r.normSec) / r.prevNormSec) * 100 * 10) / 10 : null;
            const isRecent = Math.floor((Date.now()-new Date(r.best.date).getTime())/86400000) <= 90;
            const sportColor = r.sport==="running"?"var(--gold)":r.sport==="cycling"?"var(--olive)":"var(--terra)";

            return (
              <div key={i} style={{ cursor:"pointer" }} onClick={()=>setDetail(r.best!)}>
              <Card p={0} style={{ overflow:"hidden" }}>
                <div style={{ display:"grid",gridTemplateColumns:"3px 1fr",height:"100%" }}>
                  <div style={{ background:isRecent?"var(--gold)":sportColor+"40" }} />
                  <div style={{ padding:"12px 16px",display:"flex",alignItems:"center",gap:16,flexWrap:"wrap" }}>
                    {/* Distance badge */}
                    <div style={{ minWidth:70 }}>
                      <p style={{ fontSize:11,color:"var(--text-muted)",fontFamily:"var(--font-mono)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:2 }}>{r.sport}</p>
                      <p style={{ fontSize:15,fontWeight:300,fontFamily:"var(--font-display)",fontStyle:"italic",color:"var(--text)",lineHeight:1 }}>{r.label}</p>
                    </div>
                    {/* PR value — big */}
                    <div style={{ flex:1 }}>
                      <p style={{ fontSize:11,color:"var(--text-muted)",fontFamily:"var(--font-mono)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:2 }}>PR {r.sport==="running"?"pace":r.sport==="cycling"?"speed":"pace"}</p>
                      <p style={{ fontSize:22,fontWeight:300,fontFamily:"var(--font-display)",color:isRecent?"var(--gold)":"var(--text)",lineHeight:1 }}>{displayVal}</p>
                    </div>
                    {/* Time */}
                    <div>
                      <p style={{ fontSize:11,color:"var(--text-muted)",fontFamily:"var(--font-mono)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:2 }}>Time</p>
                      <p style={{ fontSize:14,fontWeight:300,fontFamily:"var(--font-display)",color:"var(--text)",lineHeight:1 }}>{fmtDuration(r.normSec)}</p>
                    </div>
                    {/* HR */}
                    {r.best.avg_heart_rate && (
                      <div>
                        <p style={{ fontSize:11,color:"var(--text-muted)",fontFamily:"var(--font-mono)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:2 }}>Avg HR</p>
                        <p style={{ fontSize:14,fontWeight:300,fontFamily:"var(--font-display)",color:"var(--terra)",lineHeight:1 }}>{r.best.avg_heart_rate} bpm</p>
                      </div>
                    )}
                    {/* vs prev */}
                    {prevVal && improvement !== null && (
                      <div>
                        <p style={{ fontSize:11,color:"var(--text-muted)",fontFamily:"var(--font-mono)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:2 }}>vs Prev</p>
                        <p style={{ fontSize:14,fontFamily:"var(--font-mono)",color:improvement>0?"var(--olive)":"var(--terra)",lineHeight:1 }}>
                          {improvement>0?`↑ ${improvement}%`:`↓ ${Math.abs(improvement)}%`}
                        </p>
                      </div>
                    )}
                    {/* Date + badge */}
                    <div style={{ textAlign:"right" }}>
                      <p style={{ fontSize:11,color:"var(--text-muted)",fontFamily:"var(--font-mono)",marginBottom:4 }}>{r.best.date}</p>
                      {isRecent && <span style={{ fontSize:9,color:"var(--gold)",fontFamily:"var(--font-mono)",background:"var(--gold-dim)",border:"1px solid var(--gold)30",borderRadius:3,padding:"2px 6px",letterSpacing:"0.06em" }}>NEW ★</span>}
                    </div>
                  </div>
                </div>
              </Card>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPARE PAGE — Side-by-side race/activity deep comparison
// ═══════════════════════════════════════════════════════════════════════════
export function ComparePage({ activities, profile }: { activities: Activity[]; profile: Profile | null }) {
  const mob=useIsMobile();
  const [leftId, setLeftId] = useState<string>("");
  const [rightId, setRightId] = useState<string>("");
  const [tab, setTab] = useState<"overview"|"charts"|"splits">("overview");

  const left = activities.find(a => a.id === leftId) ?? null;
  const right = activities.find(a => a.id === rightId) ?? null;

  const selectStyle: React.CSSProperties = {
    width:"100%", padding:"9px 12px", background:"var(--bg)", border:"1px solid var(--border)",
    borderRadius:6, color:"var(--text)", fontFamily:"var(--font-mono)", fontSize:12,
    cursor:"pointer", outline:"none",
  };

  // Build comparison metrics
  function metricDiff(a: number|null, b: number|null, lowerIsBetter=false) {
    if (!a || !b) return null;
    const pct = ((a - b) / b) * 100;
    const better = lowerIsBetter ? pct < 0 : pct > 0;
    return { pct: Math.abs(Math.round(pct * 10)/10), better, aWins: better };
  }

  const metrics: Array<{label:string; leftVal:string; rightVal:string; diff:ReturnType<typeof metricDiff>; unit?:string}> = left && right ? [
    {
      label:"Distance",
      leftVal: fmtDist(left.distance_meters, left.sport),
      rightVal: fmtDist(right.distance_meters, right.sport),
      diff: metricDiff(left.distance_meters, right.distance_meters),
    },
    {
      label:"Duration",
      leftVal: fmtDuration(left.duration_seconds),
      rightVal: fmtDuration(right.duration_seconds),
      diff: metricDiff(left.duration_seconds, right.duration_seconds, true),
    },
    ...(left.avg_pace_sec_km && right.avg_pace_sec_km ? [{
      label:"Avg Pace",
      leftVal: fmtPace(left.avg_pace_sec_km),
      rightVal: fmtPace(right.avg_pace_sec_km),
      diff: metricDiff(left.avg_pace_sec_km, right.avg_pace_sec_km, true),
      unit:"/km",
    }] : []),
    ...(left.avg_heart_rate && right.avg_heart_rate ? [{
      label:"Avg HR",
      leftVal: `${left.avg_heart_rate} bpm`,
      rightVal: `${right.avg_heart_rate} bpm`,
      diff: metricDiff(left.avg_heart_rate, right.avg_heart_rate, true),
    }] : []),
    ...(left.tss && right.tss ? [{
      label:"TSS",
      leftVal: String(left.tss),
      rightVal: String(right.tss),
      diff: metricDiff(left.tss, right.tss, true),
    }] : []),
    ...(left.elevation_gain && right.elevation_gain ? [{
      label:"Elevation",
      leftVal: `${left.elevation_gain} m`,
      rightVal: `${right.elevation_gain} m`,
      diff: metricDiff(left.elevation_gain, right.elevation_gain),
    }] : []),
    ...(left.avg_power_watts && right.avg_power_watts ? [{
      label:"Avg Power",
      leftVal: `${left.avg_power_watts} W`,
      rightVal: `${right.avg_power_watts} W`,
      diff: metricDiff(left.avg_power_watts, right.avg_power_watts),
    }] : []),
    ...(left.normalized_power && right.normalized_power ? [{
      label:"NP",
      leftVal: `${left.normalized_power} W`,
      rightVal: `${right.normalized_power} W`,
      diff: metricDiff(left.normalized_power, right.normalized_power),
    }] : []),
    ...(left.calories && right.calories ? [{
      label:"Calories",
      leftVal: `${left.calories} kcal`,
      rightVal: `${right.calories} kcal`,
      diff: metricDiff(left.calories, right.calories),
    }] : []),
    ...(left.feel_score && right.feel_score ? [{
      label:"Feel",
      leftVal: `★ ${left.feel_score}/10`,
      rightVal: `★ ${right.feel_score}/10`,
      diff: metricDiff(left.feel_score, right.feel_score),
    }] : []),
    ...(left.intensity_factor && right.intensity_factor ? [{
      label:"Int. Factor",
      leftVal: left.intensity_factor.toFixed(2),
      rightVal: right.intensity_factor.toFixed(2),
      diff: metricDiff(left.intensity_factor, right.intensity_factor),
    }] : []),
    ...(left.variability_index && right.variability_index ? [{
      label:"Variability Idx",
      leftVal: left.variability_index.toFixed(2),
      rightVal: right.variability_index.toFixed(2),
      diff: metricDiff(left.variability_index, right.variability_index, true),
    }] : []),
  ] : [];

  // Efficiency: power/HR ratio
  const leftEff = left?.avg_power_watts && left?.avg_heart_rate
    ? Math.round((left.avg_power_watts/left.avg_heart_rate)*100)/100 : null;
  const rightEff = right?.avg_power_watts && right?.avg_heart_rate
    ? Math.round((right.avg_power_watts/right.avg_heart_rate)*100)/100 : null;
  if (leftEff && rightEff) {
    metrics.push({
      label:"Efficiency (W/bpm)",
      leftVal: String(leftEff),
      rightVal: String(rightEff),
      diff: metricDiff(leftEff, rightEff),
    });
  }

  // Aerobic decoupling: pa:hr drift
  const leftDec = left?.elapsed_seconds && left?.duration_seconds && left?.elapsed_seconds > left.duration_seconds
    ? Math.round(((left.elapsed_seconds - left.duration_seconds)/left.elapsed_seconds)*100) : null;
  const rightDec = right?.elapsed_seconds && right?.duration_seconds && right?.elapsed_seconds > right.duration_seconds
    ? Math.round(((right.elapsed_seconds - right.duration_seconds)/right.elapsed_seconds)*100) : null;
  if (leftDec !== null && rightDec !== null) {
    metrics.push({
      label:"Coasting %",
      leftVal: `${leftDec}%`,
      rightVal: `${rightDec}%`,
      diff: metricDiff(leftDec, rightDec, true),
    });
  }

  // Chart data: bar chart of key metrics normalised 0-100
  const chartData = left && right ? [
    { metric:"Pace",    left: left.avg_pace_sec_km ? Math.max(0,100-Math.round((left.avg_pace_sec_km-180)/2)) : 0,
                        right: right.avg_pace_sec_km ? Math.max(0,100-Math.round((right.avg_pace_sec_km-180)/2)) : 0 },
    { metric:"HR",      left: left.avg_heart_rate ? Math.round(left.avg_heart_rate/2) : 0,
                        right: right.avg_heart_rate ? Math.round(right.avg_heart_rate/2) : 0 },
    { metric:"TSS",     left: Math.min(100, left.tss??0), right: Math.min(100, right.tss??0) },
    { metric:"Elev",    left: Math.min(100, Math.round((left.elevation_gain??0)/20)), right: Math.min(100, Math.round((right.elevation_gain??0)/20)) },
    { metric:"Feel",    left: ((left.feel_score??5)/10)*100, right: ((right.feel_score??5)/10)*100 },
    { metric:"Power",   left: Math.min(100,Math.round((left.avg_power_watts??0)/4)), right: Math.min(100,Math.round((right.avg_power_watts??0)/4)) },
  ] : [];

  const leftColor = "var(--gold)";
  const rightColor = "var(--terra)";

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:14 }} className="fade-up">
      {/* Header */}
      <div style={{ display:"flex",alignItems:"center",gap:1,background:"var(--border)",borderRadius:8,overflow:"hidden" }}>
        <div style={{ background:"var(--surface)",padding:"12px 18px",flex:1 }}>
          <p style={{ fontSize:11,color:"var(--text-muted)",letterSpacing:"0.16em",textTransform:"uppercase",marginBottom:3,fontFamily:"var(--font-mono)" }}>Analysis</p>
          <p style={{ fontSize:18,fontWeight:300,fontFamily:"var(--font-display)",fontStyle:"italic",color:"var(--text)",lineHeight:1 }}>Race Comparator</p>
        </div>
        <div style={{ background:"var(--surface)",padding:"12px 18px",borderLeft:"1px solid var(--border)" }}>
          <p style={{ fontSize:11,color:"var(--text-muted)",fontFamily:"var(--font-mono)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:4 }}>Metrics</p>
          <p style={{ fontSize:18,fontWeight:300,fontFamily:"var(--font-display)",color:"var(--text)" }}>{metrics.length}</p>
        </div>
      </div>

      {/* Selector row */}
      <div style={{ display:"grid",gridTemplateColumns:"1fr 40px 1fr",gap:8,alignItems:"center" }}>
        <div>
          <p style={{ fontSize:10,color:leftColor,fontFamily:"var(--font-mono)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6,borderBottom:`2px solid ${leftColor}`,paddingBottom:4 }}>Activity A</p>
          <select value={leftId} onChange={e=>setLeftId(e.target.value)} style={selectStyle}>
            <option value="">— select —</option>
            {activities.map(a=>(
              <option key={a.id} value={a.id}>{a.date} · {a.title} ({fmtDist(a.distance_meters,a.sport)})</option>
            ))}
          </select>
        </div>
        <div style={{ textAlign:"center",color:"var(--text-subtle)",fontFamily:"var(--font-mono)",fontSize:14,fontWeight:300 }}>vs</div>
        <div>
          <p style={{ fontSize:10,color:rightColor,fontFamily:"var(--font-mono)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6,borderBottom:`2px solid ${rightColor}`,paddingBottom:4 }}>Activity B</p>
          <select value={rightId} onChange={e=>setRightId(e.target.value)} style={selectStyle}>
            <option value="">— select —</option>
            {activities.map(a=>(
              <option key={a.id} value={a.id}>{a.date} · {a.title} ({fmtDist(a.distance_meters,a.sport)})</option>
            ))}
          </select>
        </div>
      </div>

      {left && right && (
        <>
          {/* Activity title cards */}
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
            {([left, right] as const).map((act,i)=>(
              <Card key={i} p={14} style={{ borderTop:`2px solid ${i===0?leftColor:rightColor}` }}>
                <p style={{ fontSize:12,fontWeight:500,color:"var(--text)",fontFamily:"var(--font-display)",fontStyle:"italic",marginBottom:4 }}>{act.title}</p>
                <p style={{ fontSize:11,color:"var(--text-muted)",fontFamily:"var(--font-mono)" }}>{act.date} · {act.sport} · {act.type}</p>
                <p style={{ fontSize:11,color:"var(--text-muted)",fontFamily:"var(--font-mono)",marginTop:3 }}>{fmtDist(act.distance_meters,act.sport)} · {fmtDuration(act.duration_seconds)}</p>
              </Card>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display:"flex",gap:1,background:"var(--border)",borderRadius:6,padding:2,width:"fit-content" }}>
            {(["overview","charts","splits"] as const).map(t=>(
              <button key={t} onClick={()=>setTab(t)} style={{ padding:"5px 16px",borderRadius:4,border:"none",background:tab===t?"var(--surface)":"transparent",color:tab===t?"var(--text)":"var(--text-muted)",fontSize:12,cursor:"pointer",fontFamily:"var(--font-mono)",letterSpacing:"0.04em",textTransform:"capitalize" }}>{t}</button>
            ))}
          </div>

          {/* Overview tab — metrics table */}
          {tab==="overview" && (
            <Card p={0}>
              <div style={{ padding:"10px 16px",borderBottom:"1px solid var(--border)",display:"grid",gridTemplateColumns:"1fr 1fr 1fr 80px",gap:8,alignItems:"center" }}>
                <p style={{ fontSize:11,color:"var(--text-muted)",fontFamily:"var(--font-mono)",textTransform:"uppercase",letterSpacing:"0.08em" }}>Metric</p>
                <p style={{ fontSize:10,color:leftColor,fontFamily:"var(--font-mono)",textTransform:"uppercase",letterSpacing:"0.08em" }}>A</p>
                <p style={{ fontSize:10,color:rightColor,fontFamily:"var(--font-mono)",textTransform:"uppercase",letterSpacing:"0.08em" }}>B</p>
                <p style={{ fontSize:11,color:"var(--text-muted)",fontFamily:"var(--font-mono)",textTransform:"uppercase",letterSpacing:"0.08em",textAlign:"right" }}>Δ</p>
              </div>
              {metrics.map((m,i)=>(
                <div key={i} style={{ padding:"9px 16px",borderBottom:i<metrics.length-1?"1px solid var(--border)":undefined,display:"grid",gridTemplateColumns:"1fr 1fr 1fr 80px",gap:8,alignItems:"center",background:i%2===0?"transparent":"var(--surface-hi, var(--bg))20" }}>
                  <p style={{ fontSize:12,color:"var(--text-muted)",fontFamily:"var(--font-mono)" }}>{m.label}</p>
                  <p style={{ fontSize:14,fontWeight:300,fontFamily:"var(--font-display)",color:m.diff?.aWins?"var(--gold)":"var(--text)" }}>{m.leftVal}</p>
                  <p style={{ fontSize:14,fontWeight:300,fontFamily:"var(--font-display)",color:m.diff&&!m.diff.aWins?"var(--gold)":"var(--text)" }}>{m.rightVal}</p>
                  <p style={{ fontSize:12,fontFamily:"var(--font-mono)",color:m.diff?.better?"var(--olive)":"var(--terra)",textAlign:"right" }}>
                    {m.diff ? `${m.diff.pct}%` : "—"}
                  </p>
                </div>
              ))}
            </Card>
          )}

          {/* Charts tab */}
          {tab==="charts" && (
            <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
              {/* Radar-style bar comparison */}
              <Card p={20}>
                <SectionTitle mono sub="Normalised 0-100 per metric">Key Metrics Comparison</SectionTitle>
                <div style={{ height:240 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} barCategoryGap="30%">
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="metric" tick={{ fontSize:10, fill:"var(--text-muted)", fontFamily:"var(--font-mono)" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize:10, fill:"var(--text-muted)", fontFamily:"var(--font-mono)" }} domain={[0,100]} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8,fontSize:12,fontFamily:"var(--font-mono)" }} cursor={{ fill:"var(--border)",opacity:0.3 }} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize:10, fontFamily:"var(--font-mono)" }} />
                      <Bar dataKey="left" name={left.title.slice(0,20)} fill="var(--gold)" radius={[3,3,0,0]} barSize={24} />
                      <Bar dataKey="right" name={right.title.slice(0,20)} fill="var(--terra)" radius={[3,3,0,0]} barSize={24} opacity={0.8} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Pace/HR timeline if we have splits */}
              {(left as any).splits && (right as any).splits && (
                <Card p={20}>
                  <SectionTitle mono sub="Km-by-km split overlay">Pace Overlay</SectionTitle>
                  <div style={{ height:220 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                        <XAxis dataKey="split" type="number" tick={{ fontSize:10, fill:"var(--text-muted)", fontFamily:"var(--font-mono)" }} />
                        <YAxis reversed tick={{ fontSize:10, fill:"var(--text-muted)", fontFamily:"var(--font-mono)" }} />
                        <Tooltip contentStyle={{ background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8,fontSize:12,fontFamily:"var(--font-mono)" }} />
                        <Line data={(left as any).splits?.map((s:any,i:number)=>({split:i+1,pace:parseFloat((s.moving_time/60/s.distance*1000).toFixed(2))}))} dataKey="pace" name="A" stroke="var(--gold)" strokeWidth={2} dot={false} />
                        <Line data={(right as any).splits?.map((s:any,i:number)=>({split:i+1,pace:parseFloat((s.moving_time/60/s.distance*1000).toFixed(2))}))} dataKey="pace" name="B" stroke="var(--terra)" strokeWidth={2} dot={false} opacity={0.8} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              )}

              {/* HR distribution comparison */}
              {left.avg_heart_rate && right.avg_heart_rate && (
                <Card p={20}>
                  <SectionTitle mono sub="Estimated zone distribution">Heart Rate Profile</SectionTitle>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>
                    {([left,right] as const).map((act,ai)=>{
                      const color = ai===0?leftColor:rightColor;
                      const hr=act.avg_heart_rate!;
                      const max=act.max_heart_rate??190;
                      const pct=Math.round((hr/max)*100);
                      const zones=[
                        {name:"Z1",pct:pct<60?30:10,c:"var(--text-subtle)"},
                        {name:"Z2",pct:pct<70?40:20,c:"var(--olive)"},
                        {name:"Z3",pct:pct<80?20:30,c:"var(--gold)"},
                        {name:"Z4",pct:pct<90?8:30,c:"var(--terra)"},
                        {name:"Z5",pct:pct>=90?20:2,c:"#c0392b"},
                      ];
                      return (
                        <div key={ai}>
                          <p style={{ fontSize:10,color,fontFamily:"var(--font-mono)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10 }}>{ai===0?"Activity A":"Activity B"} — Avg {hr} bpm</p>
                          {zones.map(z=>(
                            <div key={z.name} style={{ display:"flex",alignItems:"center",gap:8,marginBottom:6 }}>
                              <span style={{ fontSize:11,color:"var(--text-muted)",fontFamily:"var(--font-mono)",width:20 }}>{z.name}</span>
                              <div style={{ flex:1,height:8,background:"var(--border)",borderRadius:4,overflow:"hidden" }}>
                                <div style={{ width:`${z.pct}%`,height:"100%",background:z.c,borderRadius:4,transition:"width 0.6s ease" }} />
                              </div>
                              <span style={{ fontSize:11,color:"var(--text-muted)",fontFamily:"var(--font-mono)",width:28,textAlign:"right" }}>{z.pct}%</span>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Splits tab */}
          {tab==="splits" && (
            <Card p={20}>
              <SectionTitle mono sub="Per-km breakdown">Splits Comparison</SectionTitle>
              {(left as any).splits || (right as any).splits ? (
                <p style={{ fontSize:12,color:"var(--text-muted)",fontFamily:"var(--font-mono)" }}>Splits available for Strava-synced activities.</p>
              ) : (
                <div style={{ display:"grid",gridTemplateColumns:"auto 1fr 1fr",gap:8,alignItems:"center" }}>
                  <p style={{ fontSize:11,color:"var(--text-muted)",fontFamily:"var(--font-mono)",textTransform:"uppercase",letterSpacing:"0.08em" }}>km</p>
                  <p style={{ fontSize:10,color:leftColor,fontFamily:"var(--font-mono)",textTransform:"uppercase",letterSpacing:"0.08em" }}>A</p>
                  <p style={{ fontSize:10,color:rightColor,fontFamily:"var(--font-mono)",textTransform:"uppercase",letterSpacing:"0.08em" }}>B</p>
                  <div style={{ gridColumn:"1/-1",height:1,background:"var(--border)" }} />
                  <p style={{ fontSize:12,color:"var(--text-muted)",fontFamily:"var(--font-mono)",gridColumn:"1/-1",paddingTop:8 }}>Sync with Strava to get km-by-km splits.</p>
                </div>
              )}
            </Card>
          )}
        </>
      )}

      {(!left || !right) && (
        <Card style={{ textAlign:"center" }} p={52}>
          <EmptyState label="Select two activities above to compare them in detail" />
        </Card>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TRAINING PLAN PAGE — AI-generated periodised plan based on goal + CTL
// ═══════════════════════════════════════════════════════════════════════════
export function TrainPlanPage({ activities, profile, goal }: { activities: Activity[]; profile: Profile | null; goal: GoalData | null }) {
  const mob=useIsMobile();
  const [plan, setPlan] = useState<string|null>(null);
  const [loading, setLoading] = useState(false);
  const [weeks, setWeeks] = useState(12);
  const [focus, setFocus] = useState<"base"|"build"|"peak"|"auto">("auto");
  const [generated, setGenerated] = useState(false);

  const tm = calcTM(activities);
  const daysLeft = goal?.date ? Math.ceil((new Date(goal.date).getTime()-Date.now())/86400000) : null;
  const weeksLeft = daysLeft ? Math.floor(daysLeft/7) : null;

  const generate = async () => {
    setLoading(true);
    setPlan(null);
    try {
      const ctx = {
        ctl: tm.ctl, atl: tm.atl, tsb: tm.tsb,
        sport: profile?.sport ?? "running",
        ftp: profile?.ftp_watts ?? null,
        lthr: profile?.lthr ?? null,
        vdot: profile?.vdot ?? null,
        weeks,
        focus,
        goal: goal ? { name: goal.name, distance: goal.distance, date: goal.date, target: goal.targetTime, daysLeft } : null,
        recentTSS: activities.slice(0,4).map(a=>a.tss??0),
      };
      const res = await fetch("/api/ai/plan", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify(ctx),
      });
      const d = await res.json();
      setPlan(d.plan ?? d.error ?? "No plan generated.");
      setGenerated(true);
    } catch {
      setPlan("Could not connect to AI. Check your OpenAI key.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:14 }} className="fade-up">
      {/* Header */}
      <div style={{ display:"flex",alignItems:"center",gap:1,background:"var(--border)",borderRadius:8,overflow:"hidden" }}>
        <div style={{ background:"var(--surface)",padding:"12px 18px",flex:1 }}>
          <p style={{ fontSize:11,color:"var(--text-muted)",letterSpacing:"0.16em",textTransform:"uppercase",marginBottom:3,fontFamily:"var(--font-mono)" }}>Intelligence</p>
          <p style={{ fontSize:18,fontWeight:300,fontFamily:"var(--font-display)",fontStyle:"italic",color:"var(--text)",lineHeight:1 }}>Training Plan Generator</p>
        </div>
        {[
          {label:"CTL",   value:`${tm.ctl} pts`, accent:"var(--gold)"},
          {label:"Form",  value:`${tm.tsb>0?"+":""}${tm.tsb}`, accent:tm.tsb>0?"var(--olive)":tm.tsb<-20?"var(--terra)":"var(--text-muted)"},
          ...(weeksLeft?[{label:"Weeks out", value:String(weeksLeft), accent:"var(--terra)"}]:[]),
        ].map((m,i)=>(
          <div key={i} style={{ background:"var(--surface)",padding:"12px 18px",position:"relative",borderLeft:"1px solid var(--border)" }}>
            <div style={{ position:"absolute",top:0,left:0,right:0,height:2,background:m.accent }} />
            <p style={{ fontSize:10,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:4,fontFamily:"var(--font-mono)" }}>{m.label}</p>
            <p style={{ fontSize:18,fontWeight:300,fontFamily:"var(--font-display)",color:"var(--text)",lineHeight:1 }}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Config */}
      <Card p={18}>
        <SectionTitle mono sub="Customise your plan parameters">Plan Setup</SectionTitle>
        <div style={{ display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:14 }}>
          {/* Goal info */}
          <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
            <p style={{ fontSize:11,color:"var(--text-muted)",fontFamily:"var(--font-mono)",textTransform:"uppercase",letterSpacing:"0.08em" }}>Goal Race</p>
            {goal ? (
              <div style={{ padding:"10px 14px",background:"var(--bg)",border:"1px solid var(--gold)30",borderRadius:6 }}>
                <p style={{ fontSize:14,fontWeight:300,fontFamily:"var(--font-display)",fontStyle:"italic",color:"var(--text)" }}>{goal.name}</p>
                <p style={{ fontSize:11,color:"var(--text-muted)",fontFamily:"var(--font-mono)",marginTop:2 }}>{goal.distance} · {goal.date}{goal.targetTime?` · target ${goal.targetTime}`:""}</p>
                {daysLeft && <p style={{ fontSize:10,color:daysLeft<42?"var(--terra)":"var(--olive)",fontFamily:"var(--font-mono)",marginTop:4 }}>{daysLeft} days out</p>}
              </div>
            ) : (
              <div style={{ padding:"10px 14px",background:"var(--bg)",border:"1px dashed var(--border-hi)",borderRadius:6 }}>
                <p style={{ fontSize:12,color:"var(--text-subtle)",fontFamily:"var(--font-mono)" }}>No goal set — set one in Races for a targeted plan</p>
              </div>
            )}
          </div>

          {/* Weeks */}
          <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
            <p style={{ fontSize:11,color:"var(--text-muted)",fontFamily:"var(--font-mono)",textTransform:"uppercase",letterSpacing:"0.08em" }}>Plan Duration</p>
            <div style={{ display:"flex",gap:4,flexWrap:"wrap" }}>
              {[4,8,12,16,20,24].map(w=>(
                <button key={w} onClick={()=>setWeeks(w)} style={{ padding:"5px 12px",borderRadius:4,border:`1px solid ${weeks===w?"var(--gold)":"var(--border)"}`,background:weeks===w?"var(--gold-dim)":"transparent",color:weeks===w?"var(--gold)":"var(--text-muted)",fontSize:12,fontFamily:"var(--font-mono)",cursor:"pointer" }}>
                  {w}w
                </button>
              ))}
            </div>
          </div>

          {/* Focus */}
          <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
            <p style={{ fontSize:11,color:"var(--text-muted)",fontFamily:"var(--font-mono)",textTransform:"uppercase",letterSpacing:"0.08em" }}>Training Focus</p>
            <div style={{ display:"flex",gap:4,flexWrap:"wrap" }}>
              {(["auto","base","build","peak"] as const).map(f=>(
                <button key={f} onClick={()=>setFocus(f)} style={{ padding:"5px 12px",borderRadius:4,border:`1px solid ${focus===f?"var(--gold)":"var(--border)"}`,background:focus===f?"var(--gold-dim)":"transparent",color:focus===f?"var(--gold)":"var(--text-muted)",fontSize:12,fontFamily:"var(--font-mono)",cursor:"pointer",textTransform:"capitalize" }}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Current fitness */}
          <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
            <p style={{ fontSize:11,color:"var(--text-muted)",fontFamily:"var(--font-mono)",textTransform:"uppercase",letterSpacing:"0.08em" }}>Current Fitness</p>
            <div style={{ padding:"10px 14px",background:"var(--bg)",border:"1px solid var(--border)",borderRadius:6 }}>
              <div style={{ display:"flex",gap:16 }}>
                {[
                  {l:"CTL",v:tm.ctl,c:"var(--gold)"},
                  {l:"ATL",v:tm.atl,c:"var(--terra)"},
                  {l:"TSB",v:tm.tsb,c:tm.tsb>0?"var(--olive)":"var(--terra)"},
                ].map(x=>(
                  <div key={x.l}>
                    <p style={{ fontSize:11,color:"var(--text-muted)",fontFamily:"var(--font-mono)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:1 }}>{x.l}</p>
                    <p style={{ fontSize:15,fontWeight:300,fontFamily:"var(--font-display)",color:x.c,lineHeight:1 }}>{x.v>0?"+":""}{x.v}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop:16 }}>
          <Btn onClick={generate} disabled={loading}>
            {loading ? "Generating plan…" : generated ? "Regenerate Plan" : "Generate Training Plan"}
          </Btn>
        </div>
      </Card>

      {/* Plan output */}
      {loading && (
        <Card p={24}>
          <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
            {[100,80,90,70,85].map((w,i)=>(
              <div key={i} className="skeleton" style={{ height:16,borderRadius:4,width:`${w}%` }} />
            ))}
          </div>
        </Card>
      )}

      {plan && !loading && (
        <Card p={20}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
            <SectionTitle mono sub={`${weeks}-week · ${focus} phase · CTL ${tm.ctl}`}>Your Training Plan</SectionTitle>
            <button onClick={()=>{const b=new Blob([plan],{type:"text/plain"});const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=`olympeaks-plan-${new Date().toISOString().split("T")[0]}.txt`;a.click();}} style={{ fontSize:10,color:"var(--text-muted)",background:"none",border:"1px solid var(--border)",borderRadius:4,padding:"4px 10px",cursor:"pointer",fontFamily:"var(--font-mono)" }}>
              Export .txt
            </button>
          </div>
          <Markdown text={plan} size={13} />
        </Card>
      )}
    </div>
  );
}

// ─── UTILS ───────────────────────────────────────────────────────────────────

function calcTM(acts:Activity[]):TrainingMetrics{if(!acts.length)return{ctl:0,atl:0,tsb:0,weekly_tss:0};const sorted=[...acts].sort((a,b)=>a.date.localeCompare(b.date));let ctl=0,atl=0;const kC=1-Math.exp(-1/42),kA=1-Math.exp(-1/7);for(const a of sorted){const t=a.tss??0;ctl=ctl+kC*(t-ctl);atl=atl+kA*(t-atl);}const wTss=acts.filter(a=>new Date(a.date)>=new Date(Date.now()-7*86400000)).reduce((s,a)=>s+(a.tss??0),0);return{ctl:Math.round(ctl),atl:Math.round(atl),tsb:Math.round(ctl-atl),weekly_tss:wTss};}
function buildFitnessChart(acts:Activity[]){const W:Record<string,number[]>={};for(const a of acts){const d=new Date(a.date),m=new Date(d);m.setDate(d.getDate()-d.getDay()+1);const k=m.toISOString().split("T")[0];if(!W[k])W[k]=[];W[k].push(a.tss??0);}let ctl=0,atl=0;const kC=1-Math.exp(-1/42),kA=1-Math.exp(-1/7);return Object.keys(W).sort().slice(-12).map((w,i)=>{const t=W[w].reduce((s,v)=>s+v,0);ctl=ctl+kC*(t-ctl);atl=atl+kA*(t-atl);return{week:`W${i+1}`,ctl:Math.round(ctl),atl:Math.round(atl),tsb:Math.round(ctl-atl)};});}
function buildWeekBar(acts:Activity[]){const days=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],now=new Date();return days.map((day,i)=>{const d=new Date(now);d.setDate(now.getDate()-(now.getDay()||7)+1+i);return{day,tss:acts.filter(a=>a.date===d.toISOString().split("T")[0]).reduce((s,a)=>s+(a.tss??0),0)};});}
function buildPaceTrend(acts:Activity[]){return acts.filter(a=>a.sport==="running"&&a.avg_pace_sec_km).slice(0,8).reverse().map((a,i)=>({label:`S${i+1}`,pace:parseFloat((a.avg_pace_sec_km!/60).toFixed(2))}));}
function buildRadar(acts:Activity[]){const r=acts.filter(a=>a.sport==="running").length,c=acts.filter(a=>a.sport==="cycling").length,sw=acts.filter(a=>a.sport==="swimming").length,st=acts.filter(a=>a.sport==="strength").length,tss=acts.reduce((s,a)=>s+(a.tss??0),0);return[{attr:"Endurance",val:Math.min(100,Math.round(tss/10))},{attr:"Threshold",val:Math.min(100,r*8+20)},{attr:"VO2Max",val:Math.min(100,c*6+30)},{attr:"Speed",val:Math.min(100,r*5+15)},{attr:"Strength",val:Math.min(100,st*12+20)},{attr:"Technique",val:Math.min(100,sw*10+30)}];}
function buildWeekly(acts:Activity[]){const W:Record<string,Activity[]>={};for(const a of acts){const d=new Date(a.date),m=new Date(d);m.setDate(d.getDate()-d.getDay()+1);const k=m.toISOString().split("T")[0];if(!W[k])W[k]=[];W[k].push(a);}return Object.entries(W).sort((a,b)=>b[0].localeCompare(a[0])).slice(0,8).map(([k,aa])=>{let dayMask=0;aa.forEach(a=>{const dow=(new Date(a.date).getDay()+6)%7;dayMask|=(1<<dow);});return{label:new Date(k).toLocaleDateString("en",{month:"short",day:"numeric"}),volume:(()=>{const km=aa.reduce((s,a)=>s+(a.distance_meters??0)/1000,0);return km>0?`${km.toFixed(0)} km`:"—";})(),tss:aa.reduce((s,a)=>s+(a.tss??0),0),sessions:aa.length,avgHR:(()=>{const h=aa.filter(a=>a.avg_heart_rate);return h.length?`${Math.round(h.reduce((s,a)=>s+(a.avg_heart_rate??0),0)/h.length)} bpm`:"—";})(),feel:(()=>{const f=aa.filter(a=>a.feel_score);return f.length?`★${(f.reduce((s,a)=>s+(a.feel_score??0),0)/f.length).toFixed(1)}`:"—";})(),dayMask};})}
function buildTSSChart(acts:Activity[],weeks:number){const W:Record<string,number>={};for(const a of acts){const d=new Date(a.date),m=new Date(d);m.setDate(d.getDate()-d.getDay()+1);const k=m.toISOString().split("T")[0];W[k]=(W[k]??0)+(a.tss??0);}return Object.entries(W).sort((a,b)=>a[0].localeCompare(b[0])).slice(-weeks).map(([,tss],i)=>({week:`W${i+1}`,tss:Math.round(tss)}));}
function localFueling(p:FP2):FPlan{const cm:Record<IL,number>={easy:50,moderate:68,hard:83,race:105};const ft:FT[]=["gel","fluid","bar","gel","fluid","gel"];const fa=["Energy gel 25g","Isotonic 500ml","Energy bar 30g","Gel + caffeine","Water + electrolytes","Gel 25g"];const sc:FPlan["schedule"]=[];let tm=p.duration>60?20:30,idx=0;while(tm<=p.duration&&idx<ft.length){sc.push({minute:tm,action:fa[idx],type:ft[idx]});tm+=20;idx++;}return{carbs_per_hour:cm[p.intensity],fluid_per_hour_ml:Math.round(500+Math.max(0,(p.temp-20)/10)*150),sodium_per_hour_mg:p.temp>25?800:600,schedule:sc,ai_notes:"Local calculation. Add OpenAI key for personalised plans."};}
function calcRec(m:DailyMetrics){const sleep=m.sleep_hours??7,hrv=m.hrv_ms??55,fatigue=m.fatigue??5,mot=m.motivation??7;return Math.round(Math.min(100,(sleep/8)*40+Math.min(100,(hrv/70)*30)+Math.max(0,(1-fatigue/10)*20)+(mot/10)*10));}
function getAutoInsight(m:DailyMetrics){const h=m.hrv_ms??0,sl=m.sleep_hours??0,f=m.fatigue??5;if(h>=65&&sl>=7.5&&f<=4)return"Excellent recovery";if(h>=50&&sl>=6.5&&f<=6)return"Moderate recovery";return"Low recovery — rest";}
function fmtDuration(s:number|null){if(!s)return"—";const h=Math.floor(s/3600),m=Math.floor((s%3600)/60);return h>0?`${h}h ${m}m`:`${m} min`;}
function fmtDist(m:number|null,sport:string){if(!m)return"—";return sport==="swimming"?`${m.toFixed(0)} m`:`${(m/1000).toFixed(1)} km`;}
function fmtPace(s:number){return`${Math.floor(s/60)}:${String(Math.round(s%60)).padStart(2,"0")}`;}
function fmtDate(d:Date){return d.toLocaleDateString("en",{weekday:"long",year:"numeric",month:"long",day:"numeric"}).toUpperCase();}
function formatRelDate(ds:string){const d=Math.floor((Date.now()-new Date(ds).getTime())/86400000);return d===0?"today":d===1?"yesterday":d<7?`${d}d ago`:new Date(ds).toLocaleDateString("en",{month:"short",day:"numeric"});}
function getGreeting(){const h=new Date().getHours();return h<12?"Good morning":h<18?"Good afternoon":"Good evening";}
function getWeekN(){const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()+4-(d.getDay()||7));return Math.ceil(((d.getTime()-new Date(d.getFullYear(),0,1).getTime())/86400000+1)/7);}