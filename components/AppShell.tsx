"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
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
        <p style={{ fontSize:9,color:"var(--text-muted)",letterSpacing:"0.14em",textTransform:"uppercase",fontWeight:600,fontFamily:"var(--font-mono)" }}>{label}</p>
        {hint && <HintIcon text={hint} />}
      </div>
      <div style={{ display:"flex",alignItems:"baseline",gap:3 }}>
        <span style={{ fontSize:size==="lg"?26:18,fontWeight:300,fontFamily:"var(--font-display)",color,letterSpacing:"-0.03em",lineHeight:1 }}>{value}</span>
        {unit && <span style={{ fontSize:10,color:"var(--text-muted)",fontFamily:"var(--font-mono)",letterSpacing:"0.04em" }}>{unit}</span>}
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
        <div style={{ position:"fixed",left:xy.x,top:xy.y-10,transform:"translate(-50%,-100%)",background:"var(--text)",color:"var(--bg)",fontSize:11,lineHeight:1.55,padding:"7px 12px",borderRadius:6,maxWidth:240,boxShadow:"0 4px 20px rgba(0,0,0,0.25)",zIndex:9999,pointerEvents:"none",textAlign:"center",fontFamily:"var(--font-body)" }}>
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
    <div style={{ background:"var(--surface)",border:"1px solid var(--border)",borderRadius:6,padding:"10px 14px",fontSize:11,boxShadow:"0 4px 24px rgba(0,0,0,0.12)" }}>
      <p style={{ color:"var(--text-muted)",marginBottom:6,fontSize:9,fontFamily:"var(--font-mono)",letterSpacing:"0.1em",textTransform:"uppercase" }}>{label}</p>
      {payload.map((p,i)=>(
        <div key={i} style={{ display:"flex",alignItems:"center",gap:8,margin:"3px 0" }}>
          <div style={{ width:4,height:4,borderRadius:"50%",background:p.color??"var(--gold)",flexShrink:0 }} />
          <span style={{ color:"var(--text-muted)",fontSize:11,fontFamily:"var(--font-mono)" }}>{p.name}</span>
          <span style={{ color:"var(--text)",fontWeight:600,fontFamily:"var(--font-mono)",marginLeft:"auto",paddingLeft:12 }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── MODAL ────────────────────────────────────────────────────────────────────

function Modal({ title, onClose, children, width=560 }: { title:string; onClose:()=>void; children:React.ReactNode; width?:number }) {
  useEffect(()=>{
    const h=(e:KeyboardEvent)=>{if(e.key==="Escape")onClose();};
    document.addEventListener("keydown",h); return ()=>document.removeEventListener("keydown",h);
  },[onClose]);
  return (
    <div className="op-modal-wrap" style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,backdropFilter:"blur(4px)",padding:16 }} onClick={onClose}>
      <div className="op-modal-box fade-in" style={{ background:"var(--surface)",border:"1px solid var(--border)",borderRadius:10,padding:"24px 26px",width:"100%",maxWidth:width,boxShadow:"0 32px 80px rgba(0,0,0,0.25)",maxHeight:"92vh",overflowY:"auto" }} onClick={e=>e.stopPropagation()}>
        {/* Greek header treatment */}
        <div style={{ marginBottom:20 }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}>
            <p style={{ fontSize:13,fontWeight:500,color:"var(--text)",fontFamily:"var(--font-display)",fontStyle:"italic",letterSpacing:"0.02em" }}>{title}</p>
            <button onClick={onClose} style={{ width:26,height:26,borderRadius:"50%",border:"1px solid var(--border)",background:"transparent",cursor:"pointer",color:"var(--text-muted)",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1 }}>×</button>
          </div>
          <GreekDivider />
        </div>
        {children}
      </div>
    </div>
  );
}

function Confirm({ message, onConfirm, onCancel }: { message:string; onConfirm:()=>void; onCancel:()=>void }) {
  return (
    <Modal title="Confirm action" onClose={onCancel} width={340}>
      <p style={{ fontSize:13,color:"var(--text-muted)",lineHeight:1.65,marginBottom:22 }}>{message}</p>
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

function Card({ children, style, p=22, className }: { children:React.ReactNode; style?:React.CSSProperties; p?:number; className?:string }) {
  return <div className={className} style={{ background:"var(--surface)",border:"1px solid var(--border)",borderRadius:10,...style,padding:p }}>{children}</div>;
}

function SectionTitle({ children, sub, right, mono }: { children:React.ReactNode; sub?:string; right?:React.ReactNode; mono?:boolean }) {
  return (
    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16 }}>
      <div>
        <p style={{ fontSize:mono?10:12,fontWeight:mono?600:500,color:"var(--text)",marginBottom:sub?3:0,fontFamily:mono?"var(--font-mono)":undefined,letterSpacing:mono?"0.08em":undefined,textTransform:mono?"uppercase":undefined }}>{children}</p>
        {sub&&<p style={{ fontSize:10,color:"var(--text-subtle)",fontFamily:"var(--font-mono)",letterSpacing:"0.04em" }}>{sub}</p>}
      </div>
      {right}
    </div>
  );
}

function PageHeader({ supra, title, action }: { supra:string; title:string; action?:React.ReactNode }) {
  return (
    <div className="op-page-header" style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-end",borderBottom:"1px solid var(--border)",paddingBottom:18,marginBottom:22 }}>
      <div>
        <p style={{ fontSize:9,color:"var(--text-subtle)",letterSpacing:"0.18em",textTransform:"uppercase",marginBottom:5,fontFamily:"var(--font-mono)" }}>{supra}</p>
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
            <p style={{ fontSize:9,color:"var(--text-muted)",letterSpacing:"0.14em",textTransform:"uppercase",fontWeight:600,fontFamily:"var(--font-mono)" }}>{item.label}</p>
            <HintIcon text={item.hint} />
          </div>
          <div style={{ display:"flex",alignItems:"baseline",gap:3 }}>
            <span style={{ fontSize:26,fontWeight:300,fontFamily:"var(--font-display)",color:"var(--text)",letterSpacing:"-0.03em",lineHeight:1 }}>{item.value}</span>
            {item.unit&&<span style={{ fontSize:10,color:"var(--text-muted)",fontFamily:"var(--font-mono)" }}>{item.unit}</span>}
          </div>
          {item.sub&&<p style={{ fontSize:10,color:"var(--text-subtle)",marginTop:5,fontFamily:"var(--font-mono)" }}>{item.sub}</p>}
        </div>
      ))}
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
              <span style={{ fontSize:10,color:"var(--text-subtle)",fontFamily:"var(--font-mono)" }}>/10</span>
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
      {!compact&&<span style={{ fontSize:11,color:"var(--text-muted)",fontFamily:"var(--font-mono)" }}>{fmtDuration(act.duration_seconds)}</span>}
      {!compact&&<span style={{ fontSize:11,color:"var(--text-muted)",fontFamily:"var(--font-mono)" }}>{fmtDist(act.distance_meters,act.sport)}</span>}
      {!compact&&<span className="op-col-elev" style={{ fontSize:11,color:"var(--text-muted)",fontFamily:"var(--font-mono)" }}>{act.elevation_gain?`↑${act.elevation_gain}m`:"—"}</span>}
      <div style={{ display:"flex",alignItems:"baseline",gap:2 }}>
        <span style={{ fontSize:12,fontWeight:600,color:tssColor(act.tss??0),fontFamily:"var(--font-mono)" }}>{act.tss??"-"}</span>
        <span style={{ fontSize:9,color:"var(--text-subtle)",fontFamily:"var(--font-mono)" }}>TSS</span>
      </div>
      <span style={{ fontSize:11,color:"var(--text-muted)",fontFamily:"var(--font-mono)" }}>{act.feel_score?`★${act.feel_score}`:"—"}</span>
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
        {["Mo","Tu","We","Th","Fr","Sa","Su"].map(d=><p key={d} style={{ fontSize:9,color:"var(--text-subtle)",textAlign:"center",padding:"3px 0",fontFamily:"var(--font-mono)",letterSpacing:"0.06em" }}>{d}</p>)}
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
                  <label style={{ fontSize:10,color:"var(--text-muted)",fontFamily:"var(--font-mono)",letterSpacing:"0.06em",textTransform:"uppercase" }}>{label}</label>
                  <HintIcon text={hint} />
                </div>
                <span style={{ fontSize:14,fontWeight:300,color:col,fontFamily:"var(--font-display)" }}>{f[key]}<span style={{ fontSize:10,color:"var(--text-subtle)",fontFamily:"var(--font-mono)",marginLeft:1 }}>{unit}</span></span>
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

function ActivityDetailModal({ act, onClose, onEdit, onDelete }: { act:Activity; onClose:()=>void; onEdit:(a:Activity)=>void; onDelete:(id:string)=>void }) {
  const sc=sportColor(act.sport);
  const stats=[["Duration",fmtDuration(act.duration_seconds)],["Distance",fmtDist(act.distance_meters,act.sport)],["Elevation",act.elevation_gain?`↑${act.elevation_gain}m`:"—"],["Avg HR",act.avg_heart_rate?`${act.avg_heart_rate} bpm`:"—"],["Max HR",act.max_heart_rate?`${act.max_heart_rate} bpm`:"—"],["Avg Power",act.avg_power_watts?`${act.avg_power_watts}W`:"—"],["NP",act.normalized_power?`${act.normalized_power}W`:"—"],["TSS",String(act.tss??"-")],["Calories",act.calories?`${act.calories} kcal`:"—"],["Feel",act.feel_score?`★ ${act.feel_score}/10`:"—"]];
  return (
    <Modal title="Session detail" onClose={onClose} width={540}>
      <div style={{ display:"flex",alignItems:"center",gap:14,marginBottom:20 }}>
        <div style={{ width:42,height:42,borderRadius:8,background:sc+"12",border:"1px solid "+sc+"22",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
          <SportIcon sport={act.sport} color={sc} size={18} />
        </div>
        <div>
          <p style={{ fontSize:15,fontWeight:300,fontFamily:"var(--font-display)",fontStyle:"italic",color:"var(--text)",marginBottom:5 }}>{act.title}</p>
          <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
            <Badge color={sc}>{act.sport}</Badge>
            {act.type&&<Badge color="var(--stone)">{act.type}</Badge>}
            <span style={{ fontSize:10,color:"var(--text-muted)",fontFamily:"var(--font-mono)" }}>{act.date}</span>
          </div>
        </div>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:14,marginBottom:20 }}>
        {stats.map(([l,v])=>(
          <div key={l}>
            <p style={{ fontSize:9,color:"var(--text-subtle)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:4,fontFamily:"var(--font-mono)" }}>{l}</p>
            <p style={{ fontSize:13,fontWeight:400,color:"var(--text)",fontFamily:"var(--font-mono)" }}>{v}</p>
          </div>
        ))}
      </div>
      {act.notes&&<div style={{ background:"var(--bg)",borderRadius:6,padding:"12px 14px",marginBottom:20,borderLeft:"2px solid var(--border-hi)" }}><p style={{ fontSize:12,color:"var(--text-2)",lineHeight:1.65,fontFamily:"var(--font-display)",fontStyle:"italic" }}>&ldquo;{act.notes}&rdquo;</p></div>}
      <div style={{ display:"flex",gap:8 }}>
        <Btn onClick={()=>{onClose();onEdit(act);}}>Edit</Btn>
        <Btn variant="danger" onClick={()=>{onClose();onDelete(act.id);}}>Delete</Btn>
        <Btn variant="ghost" onClick={onClose} style={{ marginLeft:"auto" }}>Close</Btn>
      </div>
    </Modal>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────

function DashboardPage({ profile, activities, metrics, onNavigate, onLogWellness }: { profile:Profile|null; activities:Activity[]; metrics:DailyMetrics|null; onNavigate:(p:PageId)=>void; onLogWellness:()=>void }) {
  const tm=calcTM(activities);
  const weekActs=activities.filter(a=>new Date(a.date)>=new Date(Date.now()-7*86400000));
  const weekTSS=weekActs.reduce((s,a)=>s+(a.tss??0),0);
  const fitness=buildFitnessChart(activities);
  const bar=buildWeekBar(activities);
  const [viewMode,setViewMode]=useState<"chart"|"calendar">("chart");
  const [calSel,setCalSel]=useState<Activity|null>(null);
  const [detail,setDetail]=useState<Activity|null>(null);
  const name=profile?.full_name?.split(" ")[0]??"Athlete";
  const fs=getFormLabel(tm.tsb);
  const rc=metrics?calcRec(metrics):null;
  const rcColor=!rc?"var(--text-muted)":rc>=70?"var(--olive)":rc>=50?"var(--gold)":"var(--terra)";

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:20 }} className="fade-up">
      {calSel&&<ActivityDetailModal act={calSel} onClose={()=>setCalSel(null)} onEdit={()=>{}} onDelete={()=>{}} />}
      {detail&&<ActivityDetailModal act={detail} onClose={()=>setDetail(null)} onEdit={()=>{}} onDelete={()=>{}} />}

      {/* Page title */}
      <div className="op-dash-header" style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-end",borderBottom:"1px solid var(--border)",paddingBottom:18 }}>
        <div>
          <p style={{ fontSize:9,color:"var(--text-subtle)",letterSpacing:"0.18em",textTransform:"uppercase",marginBottom:4,fontFamily:"var(--font-mono)" }}>{fmtDate(new Date())}</p>
          <h1 style={{ fontSize:26,fontWeight:300,fontFamily:"var(--font-display)",fontStyle:"italic",color:"var(--text)",letterSpacing:"-0.02em" }}>
            {getGreeting()}, {name}
          </h1>
        </div>
        <div className="op-dash-actions" style={{ display:"flex",gap:8 }}>
          <Btn size="sm" variant="outline" onClick={onLogWellness}>{metrics?"Update wellness":"+ Wellness"}</Btn>
          <Btn size="sm" onClick={()=>onNavigate("activities")}>+ Activity</Btn>
        </div>
      </div>

      {/* Recovery inline strip */}
      {rc&&(
        <div style={{ display:"flex",alignItems:"center",gap:12,padding:"10px 16px",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8,borderLeft:`2px solid ${rcColor}` }}>
          <div style={{ display:"flex",alignItems:"baseline",gap:3 }}>
            <span style={{ fontSize:20,fontWeight:300,color:rcColor,fontFamily:"var(--font-display)" }}>{rc}</span>
            <span style={{ fontSize:9,color:"var(--text-subtle)",fontFamily:"var(--font-mono)" }}>/100</span>
          </div>
          <div style={{ height:1,flex:1,background:"var(--border)",position:"relative" }}>
            <div style={{ position:"absolute",left:0,top:0,height:"100%",width:`${rc}%`,background:rcColor,transition:"width 0.5s cubic-bezier(0.16,1,0.3,1)" }} />
          </div>
          <p style={{ fontSize:11,color:"var(--text-muted)",fontFamily:"var(--font-mono)",whiteSpace:"nowrap" }}>
            {getAutoInsight(metrics!)} <button onClick={onLogWellness} style={{ color:"var(--text-subtle)",background:"none",border:"none",cursor:"pointer",fontSize:11,fontFamily:"var(--font-mono)",textDecoration:"underline",padding:0 }}>edit</button>
          </p>
        </div>
      )}
      {!metrics&&(
        <div style={{ display:"flex",alignItems:"center",gap:12,padding:"10px 16px",background:"var(--gold-dim)",border:"1px solid var(--gold)25",borderRadius:8 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--gold)" strokeWidth="1"><circle cx="7" cy="7" r="6"/><line x1="7" y1="4" x2="7" y2="8"/><circle cx="7" cy="10.5" r="0.8" fill="var(--gold)" stroke="none"/></svg>
          <p style={{ fontSize:11,color:"var(--gold)",fontFamily:"var(--font-mono)" }}>
            Log your morning wellness for personalised training recommendations.{" "}
            <button onClick={onLogWellness} style={{ color:"var(--gold)",background:"none",border:"none",cursor:"pointer",fontSize:11,fontFamily:"var(--font-mono)",textDecoration:"underline",padding:0 }}>Log now →</button>
          </p>
        </div>
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
                      <span style={{ fontSize:9,color:"var(--text-muted)",fontFamily:"var(--font-mono)" }}>{l}</span>
                    </div>
                  ))}
                </div>
              }>Fitness · Fatigue · Form</SectionTitle>
              {fitness.length>1?(
                <ResponsiveContainer width="100%" height={190} className="op-chart-tall">
                  <LineChart data={fitness} margin={{top:4,right:0,bottom:0,left:-22}}>
                    <CartesianGrid strokeDasharray="1 8" stroke="var(--border)" />
                    <XAxis dataKey="week" tick={{fill:"var(--text-subtle)",fontSize:9,fontFamily:"var(--font-mono)"}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fill:"var(--text-subtle)",fontSize:9,fontFamily:"var(--font-mono)"}} axisLine={false} tickLine={false} />
                    <ReferenceLine y={0} stroke="var(--border-hi)" strokeDasharray="2 4" />
                    <Tooltip content={<OTooltip />} />
                    <Line type="monotone" dataKey="ctl" stroke="var(--gold)" strokeWidth={1.5} dot={false} name="Fitness" />
                    <Line type="monotone" dataKey="atl" stroke="var(--terra)" strokeWidth={1.5} dot={false} name="Fatigue" strokeDasharray="3 3" />
                    <Line type="monotone" dataKey="tsb" stroke="var(--olive)" strokeWidth={1.5} dot={false} name="Form" />
                  </LineChart>
                </ResponsiveContainer>
              ):<EmptyState label="Log activities to build your fitness curve" />}
            </Card>
            <Card p={20}>
              <SectionTitle mono sub="Daily load (TSS)">This week</SectionTitle>
              {bar.some(d=>d.tss>0)?(
                <ResponsiveContainer width="100%" height={190} className="op-chart-tall">
                  <BarChart data={bar} barSize={18} margin={{top:4,right:0,bottom:0,left:-22}}>
                    <CartesianGrid strokeDasharray="1 8" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="day" tick={{fill:"var(--text-subtle)",fontSize:9,fontFamily:"var(--font-mono)"}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fill:"var(--text-subtle)",fontSize:9,fontFamily:"var(--font-mono)"}} axisLine={false} tickLine={false} />
                    <Tooltip content={<OTooltip />} />
                    <Bar dataKey="tss" name="TSS" radius={[2,2,0,0]} fill="var(--gold)" opacity={0.7} />
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
            <span style={{ fontSize:11,color:"var(--text)",display:"flex",alignItems:"center",gap:7 }}>
              <SportIcon sport={x.sport} color={sportColor(x.sport)} size={11} />
              <span style={{ textTransform:"capitalize",fontFamily:"var(--font-mono)",fontSize:10 }}>{x.sport}</span>
            </span>
            <span style={{ fontSize:10,color:"var(--text-muted)",fontFamily:"var(--font-mono)" }}>{x.n}x · {x.tss}TSS</span>
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

function CoachPage({ activities, metrics, onLogWellness }: { activities:Activity[]; metrics:DailyMetrics|null; onLogWellness:()=>void }) {
  const [loading,setLoading]=useState(false);
  const [rec,setRec]=useState<string|null>(null);
  const [extra,setExtra]=useState("");
  const rc=metrics?calcRec(metrics):null;
  const rcColor=!rc?"var(--text-muted)":rc>=70?"var(--olive)":rc>=50?"var(--gold)":"var(--terra)";

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
      <span style={{ fontSize:10,color:"var(--text-muted)",fontFamily:"var(--font-mono)",textTransform:"uppercase",letterSpacing:"0.06em" }}>{label}</span>
      <span style={{ fontSize:14,fontWeight:300,fontFamily:"var(--font-display)",color:good===null?"var(--text)":good?"var(--olive)":"var(--terra)" }}>{value??"-"}</span>
    </div>
  );

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:20 }}>
      <PageHeader supra="Intelligence" title="AI Coach" />
      <div className="op-grid-2" style={{ display:"grid",gridTemplateColumns:"1fr 280px",gap:14,alignItems:"start" }}>
        <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
          <Card p={22}>
            <SectionTitle mono sub="From today's wellness log" right={<Btn size="sm" variant="outline" onClick={onLogWellness}>{metrics?"Update":"Log wellness"}</Btn>}>
              Recovery status
            </SectionTitle>
            {metrics?(
              <>
                {statLine("HRV",metrics.hrv_ms?`${metrics.hrv_ms} ms`:null,metrics.hrv_ms?metrics.hrv_ms>=60:null)}
                {statLine("Sleep",metrics.sleep_hours?`${metrics.sleep_hours} h`:null,metrics.sleep_hours?metrics.sleep_hours>=7.5:null)}
                {statLine("Fatigue",metrics.fatigue?`${metrics.fatigue} / 10`:null,metrics.fatigue?metrics.fatigue<=4:null)}
                {statLine("Motivation",metrics.motivation?`${metrics.motivation} / 10`:null,metrics.motivation?metrics.motivation>=6:null)}
                {statLine("Resting HR",metrics.resting_hr?`${metrics.resting_hr} bpm`:null,metrics.resting_hr?metrics.resting_hr<=55:null)}
                {metrics.notes&&<p style={{ fontSize:12,color:"var(--text-muted)",fontStyle:"italic",marginTop:10,lineHeight:1.6,fontFamily:"var(--font-display)" }}>&ldquo;{metrics.notes}&rdquo;</p>}
              </>
            ):(
              <p style={{ fontSize:13,color:"var(--text-muted)",lineHeight:1.7,padding:"6px 0",fontFamily:"var(--font-display)",fontStyle:"italic" }}>
                Log your morning wellness to unlock accurate AI coaching. The engine uses HRV, sleep quality, fatigue, and motivation to prescribe precise training.
              </p>
            )}
          </Card>
          <Card p={22}>
            <SectionTitle mono>Additional context</SectionTitle>
            <textarea value={extra} onChange={e=>setExtra(e.target.value)} placeholder="Race in 8 days · tight left calf · poor week of nutrition · travel fatigue…" style={{ width:"100%",minHeight:72,padding:"9px 12px",boxSizing:"border-box",resize:"vertical",marginBottom:14 }} />
            <Btn onClick={generate} disabled={loading} fullWidth>{loading?"Generating recommendation…":"Get AI recommendation →"}</Btn>
          </Card>
          {rec&&(
            <InsightCard accent="var(--gold)" tag="AI Recommendation">
              <div style={{ fontSize:14,color:"var(--text-2)",lineHeight:1.85,whiteSpace:"pre-wrap",fontFamily:"var(--font-display)",fontWeight:300 }}>{rec}</div>
              <button onClick={()=>setRec(null)} style={{ marginTop:14,fontSize:10,color:"var(--text-subtle)",background:"none",border:"none",cursor:"pointer",fontFamily:"var(--font-mono)" }}>← New evaluation</button>
            </InsightCard>
          )}
        </div>

        <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
          <Card p={20}>
            <div style={{ display:"flex",alignItems:"center",gap:5,marginBottom:14 }}>
              <p style={{ fontSize:9,color:"var(--text-muted)",letterSpacing:"0.14em",textTransform:"uppercase",fontWeight:600,fontFamily:"var(--font-mono)" }}>Recovery score</p>
              <HintIcon text="Composite: 40% sleep, 30% HRV, 20% fatigue, 10% motivation." />
            </div>
            <div style={{ display:"flex",alignItems:"baseline",gap:3,marginBottom:10 }}>
              <span style={{ fontSize:40,fontWeight:300,color:rcColor,letterSpacing:"-0.05em",fontFamily:"var(--font-display)",lineHeight:1 }}>{rc??"-"}</span>
              {rc&&<span style={{ fontSize:11,color:"var(--text-muted)",fontFamily:"var(--font-mono)" }}>/100</span>}
            </div>
            {rc&&(
              <>
                <div style={{ height:1,background:"var(--border)",borderRadius:1,marginBottom:8 }}>
                  <div style={{ width:`${rc}%`,height:"100%",background:rcColor,transition:"width 0.6s cubic-bezier(0.16,1,0.3,1)" }} />
                </div>
                <p style={{ fontSize:11,color:rcColor,fontFamily:"var(--font-mono)" }}>
                  {rc>=70?"ready to perform":rc>=50?"train with care":"prioritise rest"}
                </p>
              </>
            )}
            {!metrics&&<p style={{ fontSize:11,color:"var(--text-subtle)",fontFamily:"var(--font-mono)" }}>Log wellness to score</p>}
          </Card>
          <Card p={20}>
            <SectionTitle mono>Recent load</SectionTitle>
            {activities.length===0?<EmptyState label="No data" />
              :activities.slice(0,5).map((a,i)=>(
                <div key={a.id} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:i<4?"1px solid var(--border)":"none" }}>
                  <div>
                    <p style={{ fontSize:11,fontWeight:500,color:"var(--text)" }}>{a.title}</p>
                    <p style={{ fontSize:9,color:"var(--text-muted)",fontFamily:"var(--font-mono)",marginTop:1 }}>{formatRelDate(a.date)}</p>
                  </div>
                  <span style={{ fontSize:13,fontWeight:300,color:tssColor(a.tss??0),fontFamily:"var(--font-display)" }}>{a.tss??"-"}</span>
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
    <div style={{ display:"flex",flexDirection:"column",gap:20 }}>
      <PageHeader supra="Nutrition" title="Fueling Planner" />
      <div className="op-grid-2" style={{ display:"grid",gridTemplateColumns:"260px 1fr",gap:14,alignItems:"start" }}>
        <Card p={20}>
          <SectionTitle mono>Parameters</SectionTitle>
          <div style={{ display:"flex",flexDirection:"column",gap:18 }}>
            <Field label="Sport"><Sel value={p.sport} onChange={v=>setP(x=>({...x,sport:v}))} options={["running","cycling","triathlon","swimming"]} /></Field>
            {([{label:"Duration",key:"duration" as const,min:30,max:360,step:15,unit:"min",hint:"Under 60 min rarely needs in-session fueling."},{label:"Body weight",key:"weight" as const,min:45,max:120,unit:"kg",hint:"Scales fluid and sodium requirements."},{label:"Temperature",key:"temp" as const,min:5,max:42,unit:"°C",hint:"Fluid needs +150ml/h for every 10°C above 20."}]).map(({label,key,min,max,step=1,unit,hint})=>(
              <div key={key}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:4 }}>
                    <label style={{ fontSize:10,color:"var(--text-muted)",fontFamily:"var(--font-mono)",textTransform:"uppercase",letterSpacing:"0.06em" }}>{label}</label>
                    <HintIcon text={hint} />
                  </div>
                  <span style={{ fontSize:13,fontWeight:300,color:"var(--text)",fontFamily:"var(--font-display)" }}>{p[key]}<span style={{ fontSize:9,color:"var(--text-subtle)",fontFamily:"var(--font-mono)",marginLeft:2 }}>{unit}</span></span>
                </div>
                <input type="range" min={min} max={max} step={step} value={p[key]} onChange={e=>setP(x=>({...x,[key]:parseInt(e.target.value)}))} style={{ width:"100%" }} />
              </div>
            ))}
            <div>
              <p style={{ fontSize:10,color:"var(--text-muted)",fontFamily:"var(--font-mono)",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8 }}>Intensity</p>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:5 }}>
                {(["easy","moderate","hard","race"] as IL[]).map(i=>(
                  <button key={i} onClick={()=>setP(x=>({...x,intensity:i}))} style={{ padding:"7px 0",borderRadius:5,cursor:"pointer",fontSize:10,border:`1px solid ${p.intensity===i?"var(--gold)":"var(--border)"}`,background:p.intensity===i?"var(--gold-dim)":"transparent",color:p.intensity===i?"var(--gold)":"var(--text-muted)",fontFamily:"var(--font-mono)",letterSpacing:"0.04em",textTransform:"uppercase" }}>
                    {ILabels[i]}
                  </button>
                ))}
              </div>
            </div>
            <Btn onClick={gen} disabled={loading} fullWidth>{loading?"Calculating…":"Generate plan →"}</Btn>
          </div>
        </Card>

        {plan?(
          <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
            <div className="op-grid-3" style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10 }}>
              {[{label:"Carbs",value:plan.carbs_per_hour,unit:"g/h",color:"var(--gold)",hint:"Use mixed carb sources (glucose + fructose) above 60g/h."},{label:"Fluid",value:plan.fluid_per_hour_ml,unit:"ml/h",color:"var(--stone)",hint:"Drink to thirst; use as a reference guide."},{label:"Sodium",value:plan.sodium_per_hour_mg,unit:"mg/h",color:"var(--olive)",hint:"Critical for sessions 90+ min or in heat."}].map(m=>(
                <Card key={m.label} p={18}>
                  <div style={{ display:"flex",alignItems:"center",gap:5,marginBottom:10 }}>
                    <p style={{ fontSize:9,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.1em",fontFamily:"var(--font-mono)" }}>{m.label}</p>
                    <HintIcon text={m.hint} />
                  </div>
                  <div style={{ display:"flex",alignItems:"baseline",gap:3 }}>
                    <span style={{ fontSize:22,fontWeight:300,color:m.color,fontFamily:"var(--font-display)",letterSpacing:"-0.02em" }}>{m.value}</span>
                    <span style={{ fontSize:10,color:"var(--text-muted)",fontFamily:"var(--font-mono)" }}>{m.unit}</span>
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
            {plan.ai_notes&&<InsightCard accent="var(--olive)" tag="Nutrition notes"><p style={{ fontSize:13,color:"var(--text-muted)",lineHeight:1.8,fontFamily:"var(--font-display)",fontStyle:"italic" }}>{plan.ai_notes}</p></InsightCard>}
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
    <div style={{ display:"flex",flexDirection:"column",gap:20 }}>
      <PageHeader supra="Performance" title="Analysis" action={
        <div style={{ display:"flex",gap:8 }}>
          <Btn size="sm" variant="outline" onClick={exportCSV}>↓ CSV</Btn>
          <Btn onClick={run} disabled={loading||!activities.length}>{loading?"Analysing…":"AI Analysis →"}</Btn>
        </div>
      } />
      {analysis&&<InsightCard accent="var(--olive)" tag="Performance Intelligence"><div style={{ fontSize:13,color:"var(--text-2)",lineHeight:1.85,whiteSpace:"pre-wrap",fontFamily:"var(--font-display)",fontWeight:300 }}>{analysis}</div><button onClick={()=>setAnalysis(null)} style={{ marginTop:10,fontSize:10,color:"var(--text-subtle)",background:"none",border:"none",cursor:"pointer",fontFamily:"var(--font-mono)" }}>close</button></InsightCard>}

      <Card p={20}>
        <SectionTitle mono sub={`Weekly load · last ${period} weeks`} right={
          <div style={{ display:"flex",gap:1,background:"var(--border)",borderRadius:5,padding:2 }}>
            {([6,12,26] as const).map(w=>(
              <button key={w} onClick={()=>setPeriod(w)} style={{ padding:"4px 10px",borderRadius:3,border:"none",background:period===w?"var(--surface)":"transparent",color:period===w?"var(--text)":"var(--text-muted)",fontSize:10,cursor:"pointer",fontFamily:"var(--font-mono)" }}>{w}w</button>
            ))}
          </div>
        }>Training load history</SectionTitle>
        {tssChart.length>1?(
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={tssChart} barSize={period>6?10:16} margin={{top:4,right:0,bottom:0,left:-22}}>
              <CartesianGrid strokeDasharray="1 8" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="week" tick={{fill:"var(--text-subtle)",fontSize:9,fontFamily:"var(--font-mono)"}} axisLine={false} tickLine={false} />
              <YAxis tick={{fill:"var(--text-subtle)",fontSize:9,fontFamily:"var(--font-mono)"}} axisLine={false} tickLine={false} />
              <Tooltip content={<OTooltip />} />
              <Bar dataKey="tss" name="Weekly TSS" radius={[2,2,0,0]} fill="var(--gold)" opacity={0.65} />
            </BarChart>
          </ResponsiveContainer>
        ):<EmptyState label="Log activities to see training load history" />}
      </Card>

      <div className="op-grid-2" style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
        <Card p={20}>
          <SectionTitle mono sub="Running · min/km">Pace trend</SectionTitle>
          {pace.length>1?(
            <ResponsiveContainer width="100%" height={170}>
              <AreaChart data={pace} margin={{top:4,right:0,bottom:0,left:-22}}>
                <defs><linearGradient id="pg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--olive)" stopOpacity={0.15}/><stop offset="95%" stopColor="var(--olive)" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="1 8" stroke="var(--border)" />
                <XAxis dataKey="label" tick={{fill:"var(--text-subtle)",fontSize:9,fontFamily:"var(--font-mono)"}} axisLine={false} tickLine={false} />
                <YAxis tick={{fill:"var(--text-subtle)",fontSize:9,fontFamily:"var(--font-mono)"}} axisLine={false} tickLine={false} />
                <Tooltip content={<OTooltip />} />
                <Area type="monotone" dataKey="pace" stroke="var(--olive)" fill="url(#pg)" strokeWidth={1.5} name="Pace (min/km)" />
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
            <RadarChart data={radar} margin={{top:0,right:20,bottom:0,left:20}}>
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis dataKey="attr" tick={{fill:"var(--text-muted)",fontSize:9,fontFamily:"var(--font-mono)"}} />
              <Radar name="Profile" dataKey="val" stroke="var(--gold)" fill="var(--gold)" fillOpacity={0.08} strokeWidth={1.5} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card p={20}>
        <SectionTitle mono sub="Last 8 weeks">Weekly breakdown</SectionTitle>
        {weekly.length===0?<EmptyState label="No data yet" />:(
          <table style={{ width:"100%",borderCollapse:"collapse" }}>
            <thead><tr>{["Week","Volume","Load","Sessions","Avg HR","Feel","Consistency"].map(h=><th key={h} style={{ fontSize:9,color:"var(--text-muted)",padding:"0 0 10px",letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:500,textAlign:"left",fontFamily:"var(--font-mono)" }}>{h}</th>)}</tr></thead>
            <tbody>
              {weekly.map((w,i)=>(
                <tr key={i} style={{ borderTop:"1px solid var(--border)" }}>
                  <td style={{ padding:"9px 0",fontSize:11,color:"var(--text)",fontFamily:"var(--font-mono)" }}>{w.label}</td>
                  <td style={{ padding:"9px 0",fontSize:11,color:"var(--text-muted)",fontFamily:"var(--font-mono)" }}>{w.volume}</td>
                  <td style={{ padding:"9px 0",fontSize:11,fontFamily:"var(--font-mono)",fontWeight:600,color:tssColor(w.tss) }}>{w.tss} TSS</td>
                  <td style={{ padding:"9px 0",fontSize:11,color:"var(--text-muted)" }}>{w.sessions}</td>
                  <td style={{ padding:"9px 0",fontSize:11,color:"var(--text-muted)",fontFamily:"var(--font-mono)" }}>{w.avgHR}</td>
                  <td style={{ padding:"9px 0",fontSize:11,color:"var(--text-muted)",fontFamily:"var(--font-mono)" }}>{w.feel}</td>
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

function RacesPage({ activities }: { activities:Activity[] }) {
  const races=activities.filter(a=>a.type==="race");
  const [sel,setSel]=useState<Activity|null>(races[0]??null);
  const [analysis,setAnalysis]=useState<string|null>(null);
  const [loading,setLoading]=useState(false);
  const analyze=async()=>{if(!sel)return;setLoading(true);try{const d=await fetch("/api/ai/race",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({activity_id:sel.id})}).then(r=>r.json());setAnalysis(d.analysis??d.error);}catch{setAnalysis("Could not connect to AI.");}finally{setLoading(false);}};

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:20 }}>
      <PageHeader supra="Competition" title="Race Analyzer" />
      {races.length>0&&(
        <div className="op-grid-3" style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:1,background:"var(--border)",borderRadius:10,overflow:"hidden",border:"1px solid var(--border)" }}>
          {[{label:"Total races",value:String(races.length),accent:"var(--gold)"},{label:"Race distance",value:fmtDist(races.reduce((s,r)=>s+(r.distance_meters??0),0),"running"),accent:"var(--terra)"},{label:"Best feel",value:races.reduce((m,r)=>Math.max(m,r.feel_score??0),0)?`★ ${races.reduce((m,r)=>Math.max(m,r.feel_score??0),0)}`:"-",accent:"var(--olive)"}].map((m,i)=>(
            <div key={i} style={{ background:"var(--surface)",padding:"16px 20px",position:"relative" }}>
              <div style={{ position:"absolute",top:0,left:0,right:0,height:2,background:m.accent }} />
              <p style={{ fontSize:9,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:8,fontFamily:"var(--font-mono)" }}>{m.label}</p>
              <p style={{ fontSize:20,fontWeight:300,fontFamily:"var(--font-display)",color:"var(--text)" }}>{m.value}</p>
            </div>
          ))}
        </div>
      )}
      {races.length===0?<Card style={{ textAlign:"center" }} p={52}><EmptyState label="Log a session with type 'race' to analyse it here" /></Card>:(
        <>
          <Card p={14}>
            <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
              {races.map(r=><button key={r.id} onClick={()=>{setSel(r);setAnalysis(null);}} style={{ padding:"6px 12px",borderRadius:5,cursor:"pointer",fontSize:10,border:`1px solid ${sel?.id===r.id?"var(--gold)":"var(--border)"}`,background:sel?.id===r.id?"var(--gold-dim)":"transparent",color:sel?.id===r.id?"var(--gold)":"var(--text-muted)",fontFamily:"var(--font-mono)",letterSpacing:"0.04em" }}>{r.title} · {r.date}</button>)}
            </div>
          </Card>
          {sel&&(
            <>
              <Card p={22}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:16 }}>
                  <div>
                    <p style={{ fontSize:9,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:6,fontFamily:"var(--font-mono)" }}>{sel.sport} · race</p>
                    <h2 style={{ fontSize:20,fontWeight:300,fontFamily:"var(--font-display)",fontStyle:"italic",marginBottom:6 }}>{sel.title}</h2>
                    <p style={{ fontSize:11,color:"var(--text-muted)",fontFamily:"var(--font-mono)" }}>{sel.date} · {fmtDist(sel.distance_meters,sel.sport)} · {fmtDuration(sel.duration_seconds)}</p>
                  </div>
                  <div className="op-race-stats" style={{ display:"flex",gap:24 }}>
                    {[[sel.avg_heart_rate?`${sel.avg_heart_rate} bpm`:null,"avg hr"],[sel.avg_pace_sec_km?fmtPace(sel.avg_pace_sec_km)+"/km":null,"pace"],[sel.tss?String(sel.tss):null,"tss"],[sel.feel_score?`★${sel.feel_score}`:null,"feel"]].filter(x=>x[0]).map(([v,l])=>(
                      <div key={l} style={{ textAlign:"right" }}>
                        <p style={{ fontSize:9,color:"var(--text-muted)",fontFamily:"var(--font-mono)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:5 }}>{l}</p>
                        <p style={{ fontSize:18,fontWeight:300,fontFamily:"var(--font-display)",color:"var(--text)" }}>{v}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
              <div>
                <Btn onClick={analyze} disabled={loading}>{loading?"Analysing…":"AI race analysis →"}</Btn>
              </div>
              {analysis&&<InsightCard accent="var(--gold)" tag="Race Analysis · AI"><div style={{ fontSize:13,color:"var(--text-2)",lineHeight:1.85,whiteSpace:"pre-wrap",fontFamily:"var(--font-display)",fontWeight:300 }}>{analysis}</div></InsightCard>}
            </>
          )}
        </>
      )}
    </div>
  );
}

// ─── ACTIVITIES PAGE ──────────────────────────────────────────────────────────

function ActivitiesPage({ activities, onRefresh }: { activities:Activity[]; onRefresh:()=>void }) {
  const [showForm,setShowForm]=useState(false);
  const [saving,setSaving]=useState(false);
  const [editTarget,setEditTarget]=useState<Activity|null>(null);
  const [deleteTarget,setDeleteTarget]=useState<string|null>(null);
  const [detailTarget,setDetailTarget]=useState<Activity|null>(null);
  const [toast,setToast]=useState<{message:string;type:"success"|"error"|"info"}|null>(null);
  const [filter,setFilter]=useState("all");
  const [search,setSearch]=useState("");
  const [sort,setSort]=useState<"date"|"tss"|"distance">("date");

  const showToast=(msg:string,type:"success"|"error"|"info"="success")=>setToast({message:msg,type});

  const handleSave=async(f:AF)=>{setSaving(true);try{const body=formToBody(f);if(editTarget){await fetch("/api/activities",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:editTarget.id,...body})});showToast("Activity updated");setEditTarget(null);}else{await fetch("/api/activities",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});showToast("Activity saved");setShowForm(false);}onRefresh();}catch{showToast("Error saving","error");}finally{setSaving(false);}};
  const handleDelete=async(id:string)=>{try{await fetch("/api/activities",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id})});showToast("Deleted");setDeleteTarget(null);onRefresh();}catch{showToast("Error","error");}};

  const sports=["all",...Array.from(new Set(activities.map(a=>a.sport)))];
  let filtered=filter==="all"?activities:activities.filter(a=>a.sport===filter);
  if(search)filtered=filtered.filter(a=>a.title.toLowerCase().includes(search.toLowerCase())||(a.notes??"").toLowerCase().includes(search.toLowerCase()));
  if(sort==="tss")filtered=[...filtered].sort((a,b)=>(b.tss??0)-(a.tss??0));
  if(sort==="distance")filtered=[...filtered].sort((a,b)=>(b.distance_meters??0)-(a.distance_meters??0));

  const totalTSS=filtered.reduce((s,a)=>s+(a.tss??0),0);
  const totalDist=filtered.reduce((s,a)=>s+(a.distance_meters??0)/1000,0);

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
      {deleteTarget&&<Confirm message="Delete this activity? This cannot be undone." onConfirm={()=>handleDelete(deleteTarget)} onCancel={()=>setDeleteTarget(null)} />}
      {toast&&<Toast message={toast.message} type={toast.type} onDone={()=>setToast(null)} />}
      {(showForm&&!editTarget)&&<ActivityFormModal onSave={handleSave} onClose={()=>setShowForm(false)} saving={saving} />}
      {editTarget&&<ActivityFormModal initial={actToForm(editTarget)} onSave={handleSave} onClose={()=>setEditTarget(null)} saving={saving} />}
      {detailTarget&&<ActivityDetailModal act={detailTarget} onClose={()=>setDetailTarget(null)} onEdit={a=>{setDetailTarget(null);setEditTarget(a);}} onDelete={id=>{setDetailTarget(null);setDeleteTarget(id);}} />}

      <PageHeader supra="Training log" title="Activities" action={<Btn onClick={()=>{setShowForm(true);setEditTarget(null);}}>+ Log activity</Btn>} />

      {/* Filters */}
      <div style={{ display:"flex",gap:10,alignItems:"center",flexWrap:"wrap" }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…" style={{ padding:"7px 12px",borderRadius:6,border:"1px solid var(--border)",background:"var(--surface)",color:"var(--text)",fontSize:11,width:160,fontFamily:"var(--font-mono)",boxSizing:"border-box" }} />
        <div style={{ display:"flex",gap:5,flexWrap:"wrap" }}>
          {sports.map(s=><button key={s} onClick={()=>setFilter(s)} style={{ padding:"5px 11px",borderRadius:20,border:`1px solid ${filter===s?"var(--gold)":"var(--border)"}`,background:filter===s?"var(--gold-dim)":"transparent",color:filter===s?"var(--gold)":"var(--text-muted)",fontSize:10,cursor:"pointer",textTransform:"capitalize",fontFamily:"var(--font-mono)" }}>{s}</button>)}
        </div>
        <div style={{ marginLeft:"auto",display:"flex",alignItems:"center",gap:6 }}>
          <span style={{ fontSize:10,color:"var(--text-subtle)",fontFamily:"var(--font-mono)" }}>sort</span>
          {(["date","tss","distance"] as const).map(s=><button key={s} onClick={()=>setSort(s)} style={{ padding:"4px 9px",borderRadius:4,border:`1px solid ${sort===s?"var(--gold)":"var(--border)"}`,background:sort===s?"var(--gold-dim)":"transparent",color:sort===s?"var(--gold)":"var(--text-muted)",fontSize:10,cursor:"pointer",fontFamily:"var(--font-mono)" }}>{s}</button>)}
        </div>
      </div>

      {filtered.length>0&&(
        <div style={{ display:"flex",gap:16,padding:"8px 0",borderBottom:"1px solid var(--border)" }}>
          <span style={{ fontSize:11,color:"var(--text-muted)",fontFamily:"var(--font-mono)" }}><strong style={{ color:"var(--text)" }}>{filtered.length}</strong> sessions</span>
          <span style={{ fontSize:11,color:"var(--text-muted)",fontFamily:"var(--font-mono)" }}><strong style={{ color:"var(--text)" }}>{totalDist.toFixed(0)} km</strong></span>
          <span style={{ fontSize:11,color:"var(--text-muted)",fontFamily:"var(--font-mono)" }}><strong style={{ color:"var(--text)" }}>{totalTSS}</strong> TSS</span>
        </div>
      )}

      <Card p={18}>
        {filtered.length===0
          ?<EmptyState label={activities.length===0?"No activities yet. Begin your record.":search?"No results.":"No activities match this filter."} />
          :(
            <>
              <div className="op-act-grid" style={{ display:"grid",gridTemplateColumns:"32px 1fr 80px 80px 80px 56px 40px 48px",gap:12,paddingBottom:10,borderBottom:"1px solid var(--border)",marginBottom:2 }}>
                {["","Session","Duration","Distance",<span key="e" className="op-col-elev">Elevation</span>,"Load","Feel",""].map((h,i)=>(
                  <p key={i} style={{ fontSize:9,color:"var(--text-subtle)",textTransform:"uppercase",letterSpacing:"0.08em",fontFamily:"var(--font-mono)" }}>{h}</p>
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
  const [f,setF]=useState({full_name:profile?.full_name??"",sport:profile?.sport??"running",weight_kg:profile?.weight_kg?String(profile.weight_kg):"",height_cm:profile?.height_cm?String(profile.height_cm):"",birth_date:profile?.birth_date??"",ftp_watts:profile?.ftp_watts?String(profile.ftp_watts):"",lthr:profile?.lthr?String(profile.lthr):"",vdot:profile?.vdot?String(profile.vdot):"" });
  const [saving,setSaving]=useState(false);
  const [toast,setToast]=useState<{message:string;type:"success"|"error"}|null>(null);
  const s=(k:string)=>(v:string)=>setF(p=>({...p,[k]:v}));

  const save=async()=>{setSaving(true);try{const res=await fetch("/api/profile",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({...f,weight_kg:f.weight_kg?parseFloat(f.weight_kg):null,height_cm:f.height_cm?parseFloat(f.height_cm):null,ftp_watts:f.ftp_watts?parseInt(f.ftp_watts):null,lthr:f.lthr?parseInt(f.lthr):null,vdot:f.vdot?parseFloat(f.vdot):null})});if(!res.ok)throw new Error();setToast({message:"Profile saved",type:"success"});onSaved();}catch{setToast({message:"Error saving",type:"error"});}finally{setSaving(false);}};

  const ftp=parseInt(f.ftp_watts);
  const lthr=parseInt(f.lthr);
  const age=f.birth_date?Math.floor((Date.now()-new Date(f.birth_date).getTime())/31557600000):null;

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:20 }}>
      {toast&&<Toast message={toast.message} type={toast.type} onDone={()=>setToast(null)} />}
      <PageHeader supra="Account" title="Athlete Profile" />

      <Card p={20} style={{ display:"flex",alignItems:"center",gap:16 }}>
        <div style={{ width:48,height:48,borderRadius:"50%",background:"var(--gold-dim)",border:"1px solid var(--gold)25",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
          <span style={{ fontSize:18,fontWeight:300,color:"var(--gold)",fontFamily:"var(--font-display)" }}>
            {f.full_name?f.full_name.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase():"AT"}
          </span>
        </div>
        <div style={{ flex:1 }}>
          <p style={{ fontSize:15,fontWeight:300,fontFamily:"var(--font-display)",fontStyle:"italic",color:"var(--text)",marginBottom:2 }}>{f.full_name||"Athlete"}</p>
          <p style={{ fontSize:10,color:"var(--text-muted)",textTransform:"capitalize",fontFamily:"var(--font-mono)" }}>{f.sport}{age?` · ${age}y`:""}</p>
        </div>
        <Btn onClick={save} disabled={saving}>{saving?"Saving…":"Save profile"}</Btn>
      </Card>

      <div className="op-grid-2" style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,alignItems:"start" }}>
        <Card p={22}>
          <SectionTitle mono>Personal details</SectionTitle>
          <div style={{ display:"flex",flexDirection:"column",gap:13 }}>
            <Field label="Full name"><Input value={f.full_name} onChange={s("full_name")} placeholder="Carlos Almeida" /></Field>
            <Field label="Date of birth"><Input type="date" value={f.birth_date} onChange={s("birth_date")} /></Field>
            <Field label="Weight (kg)" hint="Used for fueling and power/weight metrics"><Input value={f.weight_kg} onChange={s("weight_kg")} placeholder="72" /></Field>
            <Field label="Height (cm)"><Input value={f.height_cm} onChange={s("height_cm")} placeholder="178" /></Field>
            <Field label="Primary sport"><Sel value={f.sport} onChange={s("sport")} options={["running","cycling","swimming","triathlon","strength"]} /></Field>
          </div>
        </Card>

        <div style={{ display:"flex",flexDirection:"column",gap:13 }}>
          <Card p={22}>
            <SectionTitle mono>Performance thresholds</SectionTitle>
            <div style={{ display:"flex",flexDirection:"column",gap:13 }}>
              <Field label="FTP (Watts)" hint="Functional Threshold Power — max average power for ~1 hour. Foundation for cycling TSS and zone calculation."><Input value={f.ftp_watts} onChange={s("ftp_watts")} placeholder="280" /></Field>
              <Field label="LTHR (bpm)" hint="Lactate Threshold Heart Rate — used for running and cycling HR zones (Friel model)."><Input value={f.lthr} onChange={s("lthr")} placeholder="168" /></Field>
              <Field label="VDOT" hint="Jack Daniels' aerobic fitness index derived from race performances. Used for running training paces."><Input value={f.vdot} onChange={s("vdot")} placeholder="52.5" /></Field>
            </div>
          </Card>

          {ftp>0&&(
            <Card p={18}>
              <SectionTitle mono sub="Coggan model">Power zones</SectionTitle>
              <table style={{ width:"100%" }}>
                <tbody>
                  {[{z:"Z1",n:"Recovery",lo:0.01,hi:0.55},{z:"Z2",n:"Endurance",lo:0.56,hi:0.75},{z:"Z3",n:"Tempo",lo:0.76,hi:0.9},{z:"Z4",n:"Threshold",lo:0.91,hi:1.05},{z:"Z5",n:"VO₂Max",lo:1.06,hi:1.2},{z:"Z6",n:"Anaerobic",lo:1.21,hi:1.5}].map((z,i)=>(
                    <tr key={z.z} style={{ borderTop:i>0?"1px solid var(--border)":"none" }}>
                      <td style={{ padding:"6px 0",fontSize:9,color:"var(--text-subtle)",fontFamily:"var(--font-mono)",width:20 }}>{z.z}</td>
                      <td style={{ padding:"6px 0",fontSize:11,color:"var(--text)",fontWeight:400 }}>{z.n}</td>
                      <td style={{ padding:"6px 0",fontSize:11,color:"var(--text)",fontFamily:"var(--font-mono)",textAlign:"right" }}>{Math.round(ftp*z.lo)}–{Math.round(ftp*z.hi)}W</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}

          {lthr>0&&(
            <Card p={18}>
              <SectionTitle mono sub="Friel model">HR zones</SectionTitle>
              <table style={{ width:"100%" }}>
                <tbody>
                  {[{z:"Z1",n:"Recovery",lo:0,hi:0.85},{z:"Z2",n:"Aerobic",lo:0.85,hi:0.89},{z:"Z3",n:"Tempo",lo:0.9,hi:0.94},{z:"Z4",n:"Threshold",lo:0.95,hi:0.99},{z:"Z5a",n:"VO₂Max",lo:1.0,hi:1.02},{z:"Z5b",n:"Speed",lo:1.03,hi:1.06}].map((z,i)=>(
                    <tr key={z.z} style={{ borderTop:i>0?"1px solid var(--border)":"none" }}>
                      <td style={{ padding:"6px 0",fontSize:9,color:"var(--text-subtle)",fontFamily:"var(--font-mono)",width:28 }}>{z.z}</td>
                      <td style={{ padding:"6px 0",fontSize:11,color:"var(--text)" }}>{z.n}</td>
                      <td style={{ padding:"6px 0",fontSize:11,color:"var(--text)",fontFamily:"var(--font-mono)",textAlign:"right" }}>{Math.round(lthr*z.lo)}–{Math.round(lthr*z.hi)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── SIDEBAR ─────────────────────────────────────────────────────────────────

type PageId="dashboard"|"coach"|"fueling"|"analysis"|"races"|"activities"|"profile";

const NAV=[
  {id:"dashboard" as PageId, label:"Dashboard",  Icon:IconDashboard,  sublabel:"Home"},
  {id:"coach"     as PageId, label:"AI Coach",   Icon:IconCoach,     sublabel:"Coach"},
  {id:"fueling"   as PageId, label:"Fueling",    Icon:IconFueling,   sublabel:"Fuel"},
  {id:"analysis"  as PageId, label:"Analysis",   Icon:IconAnalysis,  sublabel:"Stats"},
  {id:"races"     as PageId, label:"Races",      Icon:IconRaces,     sublabel:"Races"},
  {id:"activities"as PageId, label:"Activities", Icon:IconActivities,sublabel:"Log"},
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
    return (
      <aside style={{
        position:"fixed", bottom:0, left:0, right:0, zIndex:200,
        height:58,
        background:"var(--surface)",
        borderTop:"1px solid var(--border)",
        display:"flex",
        flexDirection:"row",
        alignItems:"stretch",
      }}>
        {NAV.map(({ id, label, Icon }) => {
          const a = active === id;
          return (
            <button key={id} onClick={() => onChange(id)}
              style={{
                flex:1,
                display:"flex",
                flexDirection:"column",
                alignItems:"center",
                justifyContent:"center",
                border:"none",
                borderTop: a ? "2px solid var(--gold)" : "2px solid transparent",
                background: a ? "var(--gold-dim)" : "transparent",
                color: a ? "var(--gold)" : "var(--text-muted)",
                cursor:"pointer",
                padding:0,
                gap:0,
              }}>
              <Icon size={20} active={a} />
            </button>
          );
        })}
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
          <p style={{ fontSize:9,color:"var(--text-subtle)",fontFamily:"var(--font-mono)",letterSpacing:"0.08em",marginTop:1 }}>ATHLETE OS</p>
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
            <p style={{ fontSize:9,color:"var(--text-muted)",textTransform:"capitalize",fontFamily:"var(--font-mono)" }}>{profile?.sport??"endurance"}</p>
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

export function AppShell() {
  const router=useRouter();
  const supabase=createClient();
  const {dark,toggle}=useTheme();
  const [page,setPage]=useState<PageId>("dashboard");
  const [profile,setProfile]=useState<Profile|null>(null);
  const [activities,setActivities]=useState<Activity[]>([]);
  const [todayMetrics,setTodayMetrics]=useState<DailyMetrics|null>(null);
  const [loading,setLoading]=useState(true);
  const [wellnessOpen,setWellnessOpen]=useState(false);
  const [wellnessSaving,setWellnessSaving]=useState(false);
  const [toast,setToast]=useState<{message:string;type:"success"|"error"|"info"}|null>(null);

  const load=useCallback(async()=>{
    setLoading(true);
    try {
      const {data:{user}}=await supabase.auth.getUser();
      if(!user){router.push("/login");return;}
      const [{data:prof},{data:acts},{data:met}]=await Promise.all([
        supabase.from("profiles").select("*").eq("id",user.id).single(),
        supabase.from("activities").select("*").eq("user_id",user.id).order("date",{ascending:false}).limit(200),
        supabase.from("daily_metrics").select("*").eq("user_id",user.id).eq("date",new Date().toISOString().split("T")[0]).single(),
      ]);
      setProfile(prof as Profile??null);
      setActivities((acts as Activity[])??[]);
      setTodayMetrics(met as DailyMetrics??null);
    } finally { setLoading(false); }
  },[supabase,router]);

  useEffect(()=>{load();},[load]);

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
            <span style={{ fontSize:9,color:"var(--text-subtle)",letterSpacing:"0.14em",textTransform:"uppercase",fontFamily:"var(--font-mono)" }}>Week {getWeekN()}</span>
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
              case "dashboard":  return <DashboardPage profile={profile} activities={activities} metrics={todayMetrics} onNavigate={setPage} onLogWellness={()=>setWellnessOpen(true)} />;
              case "coach":      return <CoachPage activities={activities} metrics={todayMetrics} onLogWellness={()=>setWellnessOpen(true)} />;
              case "fueling":    return <FuelingPage profile={profile} />;
              case "analysis":   return <AnalysisPage activities={activities} />;
              case "races":      return <RacesPage activities={activities} />;
              case "activities": return <ActivitiesPage activities={activities} onRefresh={load} />;
              case "profile":    return <ProfilePage profile={profile} onSaved={load} />;
            }
          })()}
        </div>
      </main>
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