"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Brain,
  Zap,
  TrendingUp,
  Flag,
  Activity,
  Settings,
  ChevronRight,
} from "lucide-react";
import { cn } from "../../lib/utils";
import type { Profile } from "../../lib/types";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

const NAV: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/coach", label: "AI Coach", icon: Brain, badge: "IA" },
  { href: "/fueling", label: "Fueling", icon: Zap },
  { href: "/analysis", label: "Analysis", icon: TrendingUp },
  { href: "/races", label: "Races", icon: Flag },
  { href: "/activities", label: "Actividades", icon: Activity },
];

interface SidebarProps {
  profile: Profile | null;
}

export function Sidebar({ profile }: SidebarProps) {
  const path = usePathname();

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "AT";

  return (
    <aside className="w-[220px] flex-shrink-0 bg-[#0E1117] border-r border-[#1C2130] flex flex-col">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-[#1C2130]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#F5A623] flex items-center justify-center">
            <span className="text-[13px] font-black text-black">E</span>
          </div>
          <span className="text-[13.5px] font-bold text-white tracking-tight">
            EnduranceOS
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <p className="text-[10px] font-semibold text-[#3A4260] tracking-[0.12em] uppercase px-2.5 mb-2">
          PRINCIPAL
        </p>
        {NAV.map(({ href, label, icon: Icon, badge }) => {
          const active = path === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 px-2.5 py-2 rounded-lg mb-0.5 transition-all duration-150",
                active
                  ? "bg-[#F5A62318] text-[#F5A623]"
                  : "text-[#5A6480] hover:text-[#8A94B0] hover:bg-[#1C2130]"
              )}
            >
              <Icon size={15} />
              <span
                className={cn(
                  "text-[13px]",
                  active ? "font-semibold" : "font-normal"
                )}
              >
                {label}
              </span>
              {badge && (
                <span className="ml-auto text-[9px] bg-[#F5A623] text-black px-1.5 py-0.5 rounded-full font-bold">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}

        <div className="mt-6">
          <p className="text-[10px] font-semibold text-[#3A4260] tracking-[0.12em] uppercase px-2.5 mb-2">
            AJUSTES
          </p>
          <Link
            href="/settings"
            className={cn(
              "flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all duration-150",
              path === "/settings"
                ? "bg-[#F5A62318] text-[#F5A623]"
                : "text-[#5A6480] hover:text-[#8A94B0] hover:bg-[#1C2130]"
            )}
          >
            <Settings size={15} />
            <span className="text-[13px]">Configuración</span>
          </Link>
        </div>
      </nav>

      {/* User profile */}
      <div className="px-3 py-4 border-t border-[#1C2130]">
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-[#1C2130] cursor-pointer transition-all">
          <div className="w-7 h-7 rounded-full bg-[#F5A62330] flex items-center justify-center flex-shrink-0">
            <span className="text-[11px] font-bold text-[#F5A623]">
              {initials}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-medium text-white truncate">
              {profile?.full_name ?? "Atleta"}
            </p>
            <p className="text-[10px] text-[#5A6480] capitalize">
              {profile?.sport ?? "triatlón"}
            </p>
          </div>
          <ChevronRight size={13} className="text-[#3A4260]" />
        </div>
      </div>
    </aside>
  );
}