import "server-only";
import type React from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import ChatbotWidget from "@/components/ChatbotWidget";

import {
  HomeIcon,
  TicketIcon,
  ComputerIcon,
  BookIcon,
  UsersIcon,
  SettingsIcon,
  PackageIcon,
  LineChartIcon,
  SearchIcon,
  UserIcon,
  LogOutIcon,
  ChevronDownIcon,
  MenuIcon,
  Sparkles,
  Zap,
  Stars,
  CommandIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { getAuthenticatedUser, getAuthenticatedUserRole, getInitials } from "@/lib/auth";
import { logout } from "@/app/actions/auth";

/* =========================
   ORMVA THEME TOKENS
   ========================= */

type Theme = {
  ACCENT: string;
  ACCENT_SOFT: string;
  ACCENT_GLOW: string;
  ORB_1: string;
  ORB_2: string;
  ORB_3: string;
  BASE_BG: string;
  MESH_1: string;
  MESH_2: string;
  ICON_TEXT: string;
  AVATAR_BG: string;
};

const THEMES: Record<
  "ormvaDesert" | "ormvaOasis" | "ormvaSunset" | "ormvaEarth" | "ormvaClassic",
  Theme
> = {
  // Thème désertique inspiré des couleurs sable/orange du logo
  ormvaDesert: {
    ACCENT: "from-amber-400 via-yellow-500 to-orange-500",
    ACCENT_SOFT: "from-amber-200 via-yellow-300 to-orange-300",
    ACCENT_GLOW: "group-hover:shadow-amber-400/25",
    ORB_1: "from-amber-300/20 to-yellow-400/20",
    ORB_2: "from-orange-300/15 to-amber-400/15",
    ORB_3: "from-yellow-400/15 to-orange-500/15",
    BASE_BG: "from-slate-950 via-amber-950/20 to-orange-950/30",
    MESH_1: "bg-[radial-gradient(circle_at_25%_25%,rgba(245,158,11,0.12),transparent_55%)]",
    MESH_2: "bg-[radial-gradient(circle_at_75%_70%,rgba(249,115,22,0.08),transparent_55%)]",
    ICON_TEXT: "text-amber-400",
    AVATAR_BG: "from-amber-400 to-orange-500",
  },

  // Thème oasis avec les verts des palmiers
  ormvaOasis: {
    ACCENT: "from-emerald-400 via-teal-500 to-green-600",
    ACCENT_SOFT: "from-emerald-200 via-teal-300 to-green-400",
    ACCENT_GLOW: "group-hover:shadow-emerald-400/25",
    ORB_1: "from-emerald-300/18 to-teal-400/18",
    ORB_2: "from-green-300/15 to-emerald-400/15",
    ORB_3: "from-teal-400/15 to-green-500/15",
    BASE_BG: "from-slate-950 via-emerald-950/20 to-teal-950/30",
    MESH_1: "bg-[radial-gradient(circle_at_25%_25%,rgba(16,185,129,0.12),transparent_55%)]",
    MESH_2: "bg-[radial-gradient(circle_at_75%_70%,rgba(20,184,166,0.08),transparent_55%)]",
    ICON_TEXT: "text-emerald-400",
    AVATAR_BG: "from-emerald-400 to-teal-600",
  },

  // Thème coucher de soleil combinant orange et rouge
  ormvaSunset: {
    ACCENT: "from-red-400 via-orange-500 to-amber-500",
    ACCENT_SOFT: "from-red-200 via-orange-300 to-amber-300",
    ACCENT_GLOW: "group-hover:shadow-red-400/25",
    ORB_1: "from-red-300/18 to-orange-400/18",
    ORB_2: "from-orange-300/15 to-amber-400/15",
    ORB_3: "from-red-400/15 to-orange-500/15",
    BASE_BG: "from-slate-950 via-red-950/20 to-orange-950/30",
    MESH_1: "bg-[radial-gradient(circle_at_25%_25%,rgba(239,68,68,0.10),transparent_55%)]",
    MESH_2: "bg-[radial-gradient(circle_at_75%_70%,rgba(249,115,22,0.08),transparent_55%)]",
    ICON_TEXT: "text-red-400",
    AVATAR_BG: "from-red-400 to-orange-500",
  },

  // Thème terre avec les bruns des montagnes
  ormvaEarth: {
    ACCENT: "from-yellow-600 via-amber-700 to-orange-800",
    ACCENT_SOFT: "from-yellow-300 via-amber-400 to-orange-500",
    ACCENT_GLOW: "group-hover:shadow-yellow-600/25",
    ORB_1: "from-yellow-500/18 to-amber-600/18",
    ORB_2: "from-amber-500/15 to-orange-600/15",
    ORB_3: "from-yellow-600/15 to-orange-700/15",
    BASE_BG: "from-slate-950 via-yellow-950/25 to-amber-950/35",
    MESH_1: "bg-[radial-gradient(circle_at_25%_25%,rgba(202,138,4,0.12),transparent_55%)]",
    MESH_2: "bg-[radial-gradient(circle_at_75%_70%,rgba(217,119,6,0.08),transparent_55%)]",
    ICON_TEXT: "text-yellow-500",
    AVATAR_BG: "from-yellow-600 to-orange-800",
  },

  // Thème classique ORMVA - version claire inspirée du logo
  ormvaClassic: {
    ACCENT: "from-[#D4AF37] via-[#F4A460] to-[#CD853F]",
    ACCENT_SOFT: "from-[#F5E6A8] via-[#F8D7A1] to-[#E6C79A]",
    ACCENT_GLOW: "group-hover:shadow-yellow-500/30",
    ORB_1: "from-[#D4AF37]/25 to-[#F4A460]/20",
    ORB_2: "from-[#228B22]/20 to-[#32CD32]/15",
    ORB_3: "from-[#CD853F]/18 to-[#D2691E]/15",
    BASE_BG: "from-[#FFF8DC] via-[#FFFACD] to-[#F5E6A8]",
    MESH_1: "bg-[radial-gradient(circle_at_25%_25%,rgba(212,175,55,0.15),transparent_60%)]",
    MESH_2: "bg-[radial-gradient(circle_at_75%_70%,rgba(34,139,34,0.10),transparent_60%)]",
    ICON_TEXT: "text-yellow-700",
    AVATAR_BG: "from-[#D4AF37] to-[#CD853F]",
  },
};

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const [user, roleFromJwt] = await Promise.all([getAuthenticatedUser(), getAuthenticatedUserRole()]);

  const userRole = (user?.role ?? roleFromJwt ?? "USER").toString();
  const displayName = user?.displayName ?? "Utilisateur";
  const userEmail = user?.email ?? "";
  const initials = getInitials(displayName);

  // Thème actif
  type ThemeKey = keyof typeof THEMES;
  const THEME_KEY: ThemeKey = "ormvaClassic";

  const {
    ACCENT, ACCENT_SOFT, ACCENT_GLOW,
    ORB_1, ORB_2, ORB_3,
    BASE_BG, MESH_1, MESH_2,
    ICON_TEXT, AVATAR_BG
  } = THEMES[THEME_KEY];

  const isTechnicianOrAdmin = userRole === "TECHNICIEN" || userRole === "ADMIN";
  const isAdmin = userRole === "ADMIN";

  // Thèmes clairs
  const LIGHT_THEMES: ReadonlyArray<ThemeKey> = ["ormvaClassic"] as const;
  const isLight = LIGHT_THEMES.includes(THEME_KEY);

  // >>> Surfaces avec couleurs chaudes attirantes - Remplacement du blanc
  const TEXT_PRIMARY   = isLight ? "text-slate-800" : "text-[#FFF8DC]";
  const TEXT_SECONDARY = isLight ? "text-slate-600" : "text-[#FFF8DC]/70";

  // Couleurs principales - Remplacement du blanc par des tons chauds
  const PANEL_BG       = isLight ? "bg-gradient-to-br from-[#FFF8DC]/90 via-[#FFFACD]/80 to-[#F5DEB3]/85" : "bg-[#FFF8DC]/10";
  const PANEL_BORDER   = isLight ? "border-[#D4AF37]/35" : "border-[#FFF8DC]/15";
  const PANEL_HOVER    = isLight ? "hover:bg-gradient-to-br hover:from-[#FFFACD]/95 hover:via-[#F5DEB3]/90 hover:to-[#DDD3A8]/85" : "hover:bg-[#FFF8DC]/20";

  // Zones de saisie avec couleurs dorées
  const INPUT_BG       = isLight ? "bg-gradient-to-r from-[#FFFEF7]/95 to-[#FFF8DC]/90" : "bg-[#FFF8DC]/10";
  const INPUT_BORDER   = isLight ? "border-[#D4AF37]/40" : "border-[#FFF8DC]/15";
  const ICON_MUTED     = isLight ? "text-amber-700" : "text-[#FFF8DC]/70";
  const PLACEHOLDER    = isLight ? "placeholder:text-amber-600/70" : "placeholder:text-[#FFF8DC]/50";
  const INPUT_TEXT     = isLight ? "text-slate-800" : "text-[#FFF8DC]";

  const SHADOW         = isLight ? "shadow-xl shadow-amber-200/30" : "shadow-2xl";
  const NAV_LABEL      = isLight ? "text-slate-700" : "text-slate-100";

  // Panel principal avec gradient chaud
  const MAIN_PANEL_BG     = isLight ? "bg-gradient-to-br from-[#FFFEF7]/95 via-[#FFF8DC]/90 to-[#F5DEB3]/80" : "bg-[#FFF8DC]/5";
  const MAIN_PANEL_BORDER = isLight ? "border-[#D4AF37]/35" : "border-[#FFF8DC]/10";

  // Couleurs spéciales pour les éléments actifs
  const ACTIVE_BG = "bg-gradient-to-r from-[#FFFEF7]/98 via-[#FFF8DC]/95 to-[#F5DEB3]/90";
  const ICON_CONTAINER_BG = isLight ? "bg-gradient-to-br from-[#FFFEF7]/95 to-[#F5DEB3]/85" : "bg-[#FFF8DC]/80";
  const AVATAR_RING = isLight ? "ring-[#D4AF37]/60" : "ring-[#FFF8DC]/20";

  const userNavItems = [
    { href: "/dashboard/tickets/overview", icon: HomeIcon, label: "Accueil", emoji: "🏠", gradient: ACCENT, glow: ACCENT_GLOW },
    { href: "/dashboard/incidents", icon: TicketIcon, label: "Déclarer un incident", emoji: "🚨", gradient: ACCENT, glow: ACCENT_GLOW },
    { href: "/dashboard/tickets", icon: TicketIcon, label: "Mes tickets", emoji: "🎫", gradient: ACCENT, glow: ACCENT_GLOW },
    { href: "/dashboard/equipment", icon: ComputerIcon, label: "Mon matériel", emoji: "💻", gradient: ACCENT, glow: ACCENT_GLOW },
    { href: "/dashboard/knowledge-base", icon: BookIcon, label: "Base de connaissances", emoji: "📚", gradient: ACCENT, glow: ACCENT_GLOW },
  ];

  const technicianNavItems = [
    { href: "/dashboard/assigned-tickets", icon: TicketIcon, label: "Tickets assignés", emoji: "🔧", gradient: ACCENT, glow: ACCENT_GLOW },
    { href: "/dashboard/inventory", icon: ComputerIcon, label: "Inventaire", emoji: "📦", gradient: ACCENT, glow: ACCENT_GLOW },
  ];

  const adminNavItems = [
    { href: "/dashboard/users", icon: UsersIcon, label: "Gestion des utilisateurs", emoji: "👥", gradient: ACCENT, glow: ACCENT_GLOW },
    { href: "/dashboard/roles", icon: SettingsIcon, label: "Profils & Droits", emoji: "⚙️", gradient: ACCENT, glow: ACCENT_GLOW },
    { href: "/dashboard/software", icon: PackageIcon, label: "Logiciels & Licences", emoji: "💿", gradient: ACCENT, glow: ACCENT_GLOW },
    { href: "/dashboard/kpis", icon: LineChartIcon, label: "KPIs", emoji: "📊", gradient: ACCENT, glow: ACCENT_GLOW },
    { href: "/dashboard/tickets/overview", icon: LineChartIcon, label: "Dashboard Tickets", emoji: "📈", gradient: ACCENT, glow: ACCENT_GLOW },
  ];

  const NavigationLink = ({
    href,
    icon: Icon,
    label,
    emoji,
    gradient,
    glow,
    active = false,
    className = "",
  }: {
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    emoji?: string;
    gradient?: string;
    glow?: string;
    active?: boolean;
    className?: string;
  }) => (
    <Link
      href={href}
      className={`group relative flex items-center gap-4 rounded-2xl px-5 py-4 text-sm font-semibold
                  transition-all duration-500 ease-out
                  ${PANEL_HOVER} hover:backdrop-blur-xl hover:shadow-xl ${glow}
                  hover:translate-x-2
                  border border-transparent ${PANEL_BORDER}
                  ${
                    active
                      ? `${ACTIVE_BG} backdrop-blur-xl shadow-xl translate-x-2`
                      : ""
                  } 
                  ${className}`}
    >
      {/* Active indicator */}
      <div
        className={`absolute left-0 top-1/2 -translate-y-1/2 h-10 w-1.5 rounded-r-full
                    bg-gradient-to-b from-[#D4AF37] via-[#F4A460] to-[#CD853F] shadow-lg shadow-amber-400/50
                    transition-all duration-500`}
      />

      {/* Icon */}
      <div
        className={`relative flex h-12 w-12 items-center justify-center rounded-xl
                   ${ICON_CONTAINER_BG} ring-1 ring-[#D4AF37]/45
                   shadow-md transition-all duration-500 overflow-hidden`}
      >
        <Icon className="h-5 w-5 text-amber-800 transition-all" />
        {emoji && (
          <span className="absolute inset-0 flex items-center justify-center text-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            {emoji}
          </span>
        )}
        <div className="absolute inset-0 bg-gradient-to-tr from-amber-100/0 via-amber-200/60 to-amber-100/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      {/* Label */}
      <div className="flex-1 relative">
        <span className={`${NAV_LABEL} group-hover:text-amber-800 transition-colors duration-300 tracking-wide font-semibold relative z-10`}>
          {label}
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-amber-100/0 via-amber-100/20 to-amber-100/0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Background glow */}
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${gradient || ACCENT} opacity-0 group-hover:opacity-15 transition-opacity duration-500 blur-sm`} />

      {/* Active state badge */}
      {active && (
        <div className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-gradient-to-r from-[#FFFEF7]/95 to-[#F5DEB3]/90 flex items-center justify-center shadow-md ring-1 ring-[#D4AF37]/40">
          <Stars className="h-4 w-4 text-amber-600" />
        </div>
      )}
    </Link>
  );

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute inset-0 bg-gradient-to-br ${BASE_BG}`} />
        <div className="absolute top-0 left-0 w-full h-full">
          <div className={`absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br ${ORB_1} rounded-full blur-3xl`} />
          <div className={`absolute top-2/3 right-1/5 w-80 h-80 bg-gradient-to-br ${ORB_2} rounded-full blur-3xl`} />
          <div className={`absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-br ${ORB_3} rounded-full blur-3xl`} />
        </div>
        <div className={`absolute inset-0 ${MESH_1}`} />
        <div className={`absolute inset-0 ${MESH_2}`} />
        {isLight && (
          <div className="absolute inset-0 opacity-[0.08] bg-gradient-to-br from-amber-100/80 via-[#FFF0DC]/40 to-orange-50/60" />
        )}
      </div>

      {/* ===== Main layout ===== */}
      <div className="relative z-10 w-full">
        <div className="mx-auto max-w-[1800px] origin-top scale-[0.90] 2xl:scale-[0.85]">
          <div className="grid min-h-screen w-full lg:grid-cols-[360px_1fr] gap-8 p-8">
            {/* Sidebar */}
            <div className="hidden lg:block">
              <div className="sticky top-8">
                <div className={`min-h-[calc(100vh-4rem)] flex flex-col justify-between rounded-3xl ${PANEL_BG} backdrop-blur-2xl border ${PANEL_BORDER} ${SHADOW}`}>
                  {/* Logo */}
                  <div className={`flex h-20 items-center px-6 bg-gradient-to-r from-[#FFFEF7]/90 via-[#FFF8DC]/85 to-[#F5DEB3]/80 backdrop-blur-xl border-b ${PANEL_BORDER}`}>
                    <Link href="/dashboard/tickets/overview" className="flex items-center gap-4 group">
                      <div className="relative">
                        <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br from-[#FFFEF7]/95 to-[#F5DEB3]/85 flex items-center justify-center ring-1 ring-[#D4AF37]/45 shadow-xl group-hover:shadow-2xl transition-all duration-300`}>
                          <Image
                            src="/images/Concours-de-Recrutement-ORMVAO-2024-removebg-preview.png"
                            alt="ORMVA"
                            width={28}
                            height={28}
                            className="object-contain"
                          />
                        </div>
                        <div className={`absolute -bottom-2 -right-2 h-5 w-5 rounded-full bg-gradient-to-r ${ACCENT_SOFT} ring-2 ring-[#FFFEF7]/80 shadow-lg`} />
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-xl font-extrabold ${TEXT_PRIMARY} tracking-tight`}>TechOasis</span>
                        <span className={`text-xs ${TEXT_SECONDARY} font-semibold`}>ORMVA Ouarzazate</span>
                      </div>
                    </Link>
                  </div>

                  {/* Navigation */}
                  <div className="py-5 px-5">
                    <nav className="space-y-2">
                      {userNavItems.map((item) => (
                        <NavigationLink key={item.href} {...item} className="py-3.5" />
                      ))}

                      {isTechnicianOrAdmin && (
                        <div className="mt-6 pt-4">
                          <div className="flex items-center gap-3 px-5 pb-4">
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-300/40 to-transparent" />
                            <div className={`flex items-center gap-3 rounded-full bg-gradient-to-r from-[#FFFEF7]/95 via-[#FFF8DC]/90 to-[#F5DEB3]/85 px-4 py-1.5 ring-1 ring-[#D4AF37]/45 shadow-xl backdrop-blur-xl`}>
                              <Zap className={`h-4 w-4 ${ICON_TEXT}`} />
                              <span className={`text-[11px] font-black ${TEXT_PRIMARY} tracking-widest`}>TECHNICIEN</span>
                            </div>
                            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-amber-300/40 to-transparent" />
                          </div>
                          <div className="space-y-2">
                            {technicianNavItems.map((item) => (
                              <NavigationLink key={item.href} {...item} className="py-3.5" />
                            ))}
                          </div>
                        </div>
                      )}

                      {isAdmin && (
                        <div className="mt-6 pt-4">
                          <div className="flex items-center gap-3 px-5 pb-4">
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-300/40 to-transparent" />
                            <div className={`flex items-center gap-3 rounded-full bg-gradient-to-r from-amber-100/95 via-amber-200/90 to-amber-300/85 ring-2 ring-amber-400/60 px-4 py-1.5 shadow-xl backdrop-blur-xl`}>
                              <Sparkles className={`h-4 w-4 ${ICON_TEXT}`} />
                              <span className={`text-[11px] font-black ${TEXT_PRIMARY} tracking-widest`}>ADMINISTRATION</span>
                            </div>
                            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-amber-300/40 to-transparent" />
                          </div>
                          <div className="space-y-2">
                            {adminNavItems.map((item) => (
                              <NavigationLink key={item.href} {...item} className="py-3.5" />
                            ))}
                          </div>
                        </div>
                      )}
                    </nav>
                  </div>

                  {/* Bottom card */}
                  <div className={`p-5 bg-gradient-to-b from-orange-100/70 to-amber-100/50 border-t ${PANEL_BORDER}`}>
                    <div className={`rounded-2xl bg-gradient-to-r from-[#FFFEF7]/95 via-[#FFF8DC]/90 to-orange-50/80 ring-1 ring-orange-300/40 p-4 backdrop-blur-xl shadow-xl`}>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-2.5 w-2.5 rounded-full bg-green-400 animate-pulse" />
                        <span className={`text-xs font-bold ${TEXT_PRIMARY}`}>Système en ligne</span>
                      </div>
                      <div className={`text-[11px] ${TEXT_SECONDARY} space-y-0.5`}>
                        <p className="font-semibold">Office Régional de Mise en Valeur Agricole</p>
                        <p>Région Drâa-Tafilalet • Ouarzazate</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main content */}
            <div className="flex flex-col">
              {/* Header */}
              <header className="sticky top-8 z-50 mb-8">
                <div className={`flex h-18 items-center rounded-3xl ${PANEL_BG} backdrop-blur-2xl border ${PANEL_BORDER} ${SHADOW} px-6`}>
                  {/* Mobile menu */}
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`shrink-0 lg:hidden ${PANEL_HOVER} transition-all duration-300 rounded-2xl h-11 w-11 hover:scale-105`}
                      >
                        <MenuIcon className={`h-6 w-6 ${TEXT_PRIMARY}`} />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="flex flex-col bg-gradient-to-br from-slate-900/95 via-amber-900/20 to-orange-900/30 backdrop-blur-3xl border-amber-300/15 w-80 shadow-2xl">
                      {/* Mobile navigation content */}
                      <div className="flex items-center gap-4 pb-5 border-b border-amber-300/15">
                        <div className="h-11 w-11 rounded-2xl bg-gradient-to-r from-amber-200/20 to-orange-200/10 flex items-center justify-center shadow-lg ring-1 ring-amber-300/20 backdrop-blur-xl">
                          <Image
                            src="/images/Concours-de-Recrutement-ORMVAO-2024-removebg-preview.png"
                            alt="ORMVA"
                            width={26}
                            height={26}
                            className="object-contain"
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-lg font-extrabold text-[#FFF8DC]">TechOasis</span>
                          <span className="text-xs text-[#FFF8DC]/70 font-semibold">ORMVA Ouarzazate</span>
                        </div>
                      </div>

                      <nav className="flex-1 space-y-3 py-6">
                        {userNavItems.map((item) => (
                          <NavigationLink key={item.href} {...item} />
                        ))}

                        {isTechnicianOrAdmin && (
                          <div className="pt-6">
                            <div className="flex items-center gap-2 px-4 pb-3">
                              <Zap className={`h-4 w-4 ${ICON_TEXT}`} />
                              <span className="text-xs font-bold text-[#FFF8DC] tracking-wide">TECHNICIEN</span>
                            </div>
                            {technicianNavItems.map((item) => (
                              <NavigationLink key={item.href} {...item} />
                            ))}
                          </div>
                        )}

                        {isAdmin && (
                          <div className="pt-6">
                            <div className="flex items-center gap-2 px-4 pb-3">
                              <Sparkles className={`h-4 w-4 ${ICON_TEXT}`} />
                              <span className="text-xs font-bold text-[#FFF8DC] tracking-wide">ADMINISTRATION</span>
                            </div>
                            {adminNavItems.map((item) => (
                              <NavigationLink key={item.href} {...item} />
                            ))}
                          </div>
                        )}
                      </nav>
                    </SheetContent>
                  </Sheet>

                  {/* Search */}
                  <div className="flex-1 max-w-2xl mx-6">
                    <div className="relative group">
                      <SearchIcon className={`absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 ${ICON_MUTED} transition-all duration-300 group-focus-within:text-amber-800`} />
                      <Input
                        placeholder="Rechercher tickets, matériel, utilisateurs..."
                        className={`pl-12 pr-24 h-12 ${INPUT_BG} border ${INPUT_BORDER} rounded-2xl
                                 focus:bg-gradient-to-r focus:from-[#FFFEF7]/98 focus:to-[#FFF8DC]/95 focus:ring-2 focus:ring-amber-400/70 focus:border-amber-400/70 
                                 transition-all duration-300 ${PLACEHOLDER} 
                                 shadow-xl hover:shadow-2xl backdrop-blur-xl
                                 ${INPUT_TEXT} font-medium text-sm`}
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                        <kbd className={`pointer-events-none inline-flex h-8 select-none items-center gap-1 rounded-xl border border-[#D4AF37]/40 bg-gradient-to-r from-[#FFFEF7]/95 to-[#FFF8DC]/90 text-amber-700 px-2.5 font-mono text-[10px] shadow-lg backdrop-blur-sm`}>
                          <CommandIcon className="h-3 w-3" />
                          K
                        </kbd>
                      </div>
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-100/0 via-amber-100/20 to-amber-100/0 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    </div>
                  </div>

                  {/* User dropdown */}
                  <div className="flex items-center gap-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button className={`flex items-center gap-3 ${PANEL_HOVER} transition-all duration-300 px-5 py-3 rounded-2xl hover:shadow-xl group h-auto backdrop-blur-sm`} variant="ghost">
                          <Avatar className={`h-10 w-10 ring-2 ${AVATAR_RING} shadow-xl group-hover:ring-amber-400/50 transition-all duration-300`}>
                            <AvatarImage src="/api/placeholder/48/48" />
                            <AvatarFallback className={`bg-gradient-to-br ${AVATAR_BG} text-white text-sm font-bold`}>
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="hidden xl:block text-left">
                            <p className={`text-sm font-semibold ${TEXT_PRIMARY} transition-colors`}>{displayName}</p>
                            <p className={`text-[11px] ${TEXT_SECONDARY} font-medium tracking-wide`}>{userRole}</p>
                          </div>
                          <ChevronDownIcon className={`h-5 w-5 ${ICON_MUTED} transition-all duration-300`} />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent
                        align="end"
                        className={`w-80 bg-gradient-to-br from-[#FFFEF7]/98 via-[#FFF8DC]/95 to-[#F5DEB3]/90 backdrop-blur-3xl border-[#D4AF37]/45 shadow-2xl rounded-3xl p-4 mt-2`}
                      >
                        <DropdownMenuLabel className="px-5 py-4">
                          <div className="flex items-center gap-4">
                            <Avatar className={`h-14 w-14 ring-2 ${AVATAR_RING} shadow-xl`}>
                              <AvatarImage src="/api/placeholder/64/64" />
                              <AvatarFallback className={`bg-gradient-to-br ${AVATAR_BG} text-white text-base font-bold`}>
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-bold text-slate-800 text-base">{displayName}</p>
                              <p className="text-sm text-slate-600">{userEmail}</p>
                              <div className="flex items-center gap-2 mt-1.5">
                                <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
                                <span className="text-[11px] text-green-700 font-semibold">En ligne</span>
                              </div>
                            </div>
                          </div>
                        </DropdownMenuLabel>

                        <DropdownMenuSeparator className={`bg-[#D4AF37]/45 my-3`} />

                        <DropdownMenuItem asChild>
                          <Link href="/dashboard/profile" className={`flex items-center gap-3 hover:bg-gradient-to-r hover:from-amber-50/80 hover:to-amber-100/60 transition-colors text-slate-700 rounded-2xl px-5 py-3 my-1`}>
                            <UserIcon className="h-5 w-5" />
                            <span className="font-semibold text-sm">Mon profil</span>
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                          <Link href="/dashboard/settings" className={`flex items-center gap-3 hover:bg-gradient-to-r hover:from-amber-50/80 hover:to-amber-100/60 transition-colors text-slate-700 rounded-2xl px-5 py-3 my-1`}>
                            <SettingsIcon className="h-5 w-5" />
                            <span className="font-semibold text-sm">Paramètres</span>
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className={`bg-[#D4AF37]/45 my-3`} />

                        <DropdownMenuItem asChild>
                          <form action={logout}>
                            <button type="submit" className="flex w-full items-center gap-3 text-red-600 hover:bg-red-50 transition-colors rounded-2xl px-5 py-3 my-1 text-sm font-semibold">
                              <LogOutIcon className="h-5 w-5" />
                              <span>Se déconnecter</span>
                            </button>
                          </form>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </header>

              {/* Main content */}
              <main className="flex-1">
                <div className={`rounded-3xl ${MAIN_PANEL_BG} backdrop-blur-xl border ${MAIN_PANEL_BORDER} ${SHADOW} min-h-[600px] p-8`}>
                  {children}
                </div>
              </main>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Chatbot */}
      <ChatbotWidget />
    </div>
  );
} 