// components/technician-dashboard.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ClipboardList,
  Calendar,
  Package,
  Search,
  Bell,
  Settings,
  CheckCircle,
  Wrench,
  Filter,
  RefreshCw,
} from "lucide-react";

/* ================== Types ================== */
type SimpleUserDto = { id: number; nom: string; prenom: string; email: string };

type Ticket = {
  id: number;
  titre: string;
  description: string;
  statut: "OUVERT" | "EN_COURS" | "CLOTURE" | "CLÔTURÉ";
  priorite: "FAIBLE" | "MOYENNE" | "HAUTE";
  commentaire?: string | null;
  date_creation?: string | null;
  date_cloture?: string | null;
  utilisateur: SimpleUserDto;
  assigned_to?: SimpleUserDto | null;
};

type Materiel = {
  id: number;
  type?: string;
  marque?: string;
  modele?: string;
  etat: string;
  nom?: string;
};

type InterventionResponse = {
  id: number;
  description: string;
  statut: string;
  date_planifiee: string;
  created_at: string;
  updated_at: string;
  materiel: { id: number; type?: string; marque?: string; modele?: string; etat: string };
  technicien: { id: number; nom: string; prenom: string; email: string; role: string };
};

type NotificationDto = {
  id?: number;
  type?: string;
  message: string;
  created_at?: string;
  read?: boolean;
};

type MeDto = { id: number; nom: string; prenom: string; email: string; role: string };

/* ================== API config ==================
   .env.local:
   NEXT_PUBLIC_API_URL=http://localhost:8080/api
*/
const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api").replace(/\/+$/, "");
const api = (path: string, init?: RequestInit) => {
  const url = path.startsWith("/") ? `${API_BASE}${path}` : `${API_BASE}/${path}`;
  return fetch(url, {
    credentials: "include",
    headers: { Accept: "application/json", ...(init?.headers || {}) },
    ...init,
  });
};

/* ================== Utils ================== */
const formatFr = (iso?: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return isNaN(d.getTime())
    ? "—"
    : `${d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })} à ${d.toLocaleTimeString(
        "fr-FR",
        { hour: "2-digit", minute: "2-digit" }
      )}`;
};


const statusBadge = (s: Ticket["statut"]) => {
  const base = "px-3 py-1 rounded-full text-xs font-semibold shadow-sm";
  switch (s) {
    case "OUVERT":
      return `${base} bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200`;
    case "EN_COURS":
      return `${base} bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border border-orange-200`;
    default:
      return `${base} bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border border-gray-200`;
  }
};
const priorityBadge = (p: Ticket["priorite"]) => {
  const base = "px-3 py-1 rounded-full text-xs font-semibold shadow-sm";
  switch (p) {
    case "HAUTE":
      return `${base} bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200`;
    case "MOYENNE":
      return `${base} bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border border-amber-200`;
    default:
      return `${base} bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border border-blue-200`;
  }
};


type Personish = { nom?: string; prenom?: string; email?: string } | null | undefined;

const initials = (p: Personish) => {
  if (!p) return "";
  if (p.prenom || p.nom) {
    return `${(p.prenom ?? "")[0] ?? ""}${(p.nom ?? "")[0] ?? ""}`.toUpperCase();
  }
  return (p.email ?? "")[0]?.toUpperCase() ?? "";
};

const displayName = (p: Personish) => {
  if (!p) return "";
  const full = `${p.prenom ?? ""} ${p.nom ?? ""}`.trim();
  return full || (p.email ? p.email.split("@")[0] : "");
};

/* ================== Component ================== */
export default function TechnicianDashboard() {
  const [activeTab, setActiveTab] = useState("tickets");

  // Me (profil)
  const [me, setMe] = useState<MeDto | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  // Tickets
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [errorTickets, setErrorTickets] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Materiels
  const [materiels, setMateriels] = useState<Materiel[]>([]);
  const [loadingMateriels, setLoadingMateriels] = useState(false);
  const [errorMateriels, setErrorMateriels] = useState<string | null>(null);

  // Planification
  const [planMaterielId, setPlanMaterielId] = useState<number | "">("");
  const [planDate, setPlanDate] = useState<string>("");
  const [planDesc, setPlanDesc] = useState<string>("");
  const [planSaving, setPlanSaving] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);
  const [planOk, setPlanOk] = useState<string | null>(null);

  // Notifications (SSE)
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState<NotificationDto[]>([]);
  const [unread, setUnread] = useState(0);
  const esRef = useRef<EventSource | null>(null);

  /* ====== Loaders ====== */
  const loadMe = async () => {
    try {
      
      let res = await api("/auth/me");
      if (!res.ok) {
        
        res = await fetch("/api/me", { credentials: "include" });
      }
      if (res.ok) {
        setMe(await res.json());
      } else {
        setMe(null);
      }
    } catch {
      try {
        const res = await fetch("/api/me", { credentials: "include" });
        if (res.ok) setMe(await res.json());
        else setMe(null);
      } catch {
        setMe(null);
      }
    }
  };

  const loadTickets = async () => {
    setLoadingTickets(true);
    setErrorTickets(null);
    try {
      const res = await api("/technicien/tickets/assigned");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: Ticket[] = await res.json();
      setTickets(data);
    } catch (e: any) {
      setErrorTickets(`Erreur lors du chargement des tickets (Status: ${e.message?.replace("HTTP ", "") || "?"})`);
    } finally {
      setLoadingTickets(false);
    }
  };

  const loadMateriels = async () => {
    setLoadingMateriels(true);
    setErrorMateriels(null);
    try {
      const res = await api("/materiels");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: Materiel[] = await res.json();
      setMateriels(data);
    } catch (e: any) {
      setErrorMateriels(`Erreur lors du chargement des équipements (Status: ${e.message?.replace("HTTP ", "") || "?"})`);
    } finally {
      setLoadingMateriels(false);
    }
  };

  useEffect(() => {
    loadMe();
    loadTickets();
    loadMateriels();
  }, []);

  const filteredTickets = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tickets;
    return tickets.filter(
      (t) =>
        t.titre.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        String(t.id).includes(q) ||
        t.utilisateur?.email?.toLowerCase().includes(q)
    );
  }, [tickets, search]);

  /* ====== Ticket actions ====== */
  const intervenir = async (ticketId: number) => {
    const commentaire = window.prompt("Commentaire d'intervention :");
    if (commentaire == null) return;

    try {
      const res = await api(`/technicien/tickets/${ticketId}/intervenir`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" }, // record CommentaireDto(String commentaire)
        body: JSON.stringify({ commentaire }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await loadTickets();
    } catch (e: any) {
      alert(`Échec d'intervention (Status: ${e.message?.replace("HTTP ", "") || "?"})`);
    }
  };

  const clore = async (ticketId: number) => {
    if (!confirm("Clore ce ticket ?")) return;
    try {
      const res = await api(`/technicien/tickets/${ticketId}/clore`, { method: "PUT" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await loadTickets();
    } catch (e: any) {
      alert(`Échec de clôture (Status: ${e.message?.replace("HTTP ", "") || "?"})`);
    }
  };

  /* ====== Planification ====== */
  const submitPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlanError(null);
    setPlanOk(null);

    if (!planMaterielId || !planDate || !planDesc) {
      setPlanError("Veuillez renseigner tout le formulaire.");
      return;
    }

    setPlanSaving(true);
    try {
      const payload = {
        materielId: Number(planMaterielId),
        date: planDate, // "YYYY-MM-DDTHH:mm"
        description: planDesc,
        etat: "PLANIFIEE",
      };

      const res = await api(`/technicien/planning`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data: InterventionResponse = await res.json();
      setPlanOk(`Intervention #${data.id} planifiée pour le ${new Date(data.date_planifiee).toLocaleString("fr-FR")}.`);
      setPlanMaterielId("");
      setPlanDate("");
      setPlanDesc("");
      await loadMateriels();
    } catch (e: any) {
      setPlanError(`Échec de planification (Status: ${e.message?.replace("HTTP ", "") || "?"})`);
    } finally {
      setPlanSaving(false);
    }
  };

  /* ====== Inventory update ====== */
  const saveEtatMateriel = async (m: Materiel, newEtat: string) => {
    if (newEtat === m.etat) return;
    try {
      const res = await api(`/materiels/${m.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ etat: newEtat }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await loadMateriels();
    } catch (e: any) {
      alert(`Échec de mise à jour (Status: ${e.message?.replace("HTTP ", "") || "?"})`);
    }
  };

  /* ================== Notifications (SSE) ================== */
  useEffect(() => {
    let stopped = false;
    const connect = () => {
      if (stopped) return;
      const es = new EventSource(`${API_BASE}/notifications/stream`, { withCredentials: true });
      esRef.current = es;

      es.addEventListener("notification", (e) => {
        try {
          const payload: NotificationDto = JSON.parse((e as MessageEvent).data);
          setNotifs((prev) => [payload, ...prev].slice(0, 50));
          setUnread((c) => c + 1);
        } catch {}
      });

      es.onerror = () => {
        es.close();
        if (!stopped) setTimeout(connect, 3000);
      };
    };

    connect();
    return () => {
      stopped = true;
      esRef.current?.close();
    };
  }, []);

  const markAllRead = async () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
    try {
      await api("/notifications/read-all", { method: "POST" });
    } catch {}
  };
  const markOneRead = async (id?: number) => {
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnread((c) => Math.max(0, c - 1));
    if (!id) return;
    try {
      await api(`/notifications/${id}/read`, { method: "POST" });
    } catch {}
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50">
      {/* Header */}
      <header className="border-b border-orange-200/50 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 shadow-lg">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-white/20 p-2">
              <Wrench className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">TechOasis</h1>
              <p className="text-xs text-emerald-100">Espace Technicien</p>
            </div>
          </div>

          <div className="relative flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                loadTickets();
                loadMateriels();
              }}
              className="text-white hover:bg-white/20"
              title="Rafraîchir"
            >
              <RefreshCw className="h-5 w-5" />
            </Button>

            {/* Notifications */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setNotifOpen((v) => !v)}
                aria-label="Notifications"
                className="text-white hover:bg-white/20"
              >
                <Bell className="h-5 w-5" />
                {unread > 0 && (
                  <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-1 text-[10px] font-bold text-white shadow-md">
                    {unread}
                  </span>
                )}
              </Button>

              {notifOpen && (
                <div
                  className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-orange-200 bg-white shadow-2xl"
                  onMouseLeave={() => setNotifOpen(false)}
                >
                  <div className="flex items-center justify-between border-b border-orange-100 bg-gradient-to-r from-orange-50 to-amber-50 p-3">
                    <span className="text-sm font-semibold text-orange-900">Notifications</span>
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-orange-700 hover:bg-orange-100" onClick={markAllRead}>
                      Tout marquer comme lu
                    </Button>
                  </div>
                  <div className="max-h-80 overflow-auto">
                    {notifs.length === 0 ? (
                      <div className="p-3 text-sm text-gray-500">Aucune notification.</div>
                    ) : (
                      notifs.map((n, idx) => (
                        <button
                          key={n.id ?? `${n.type}-${idx}`}
                          onClick={() => markOneRead(n.id)}
                          className={`block w-full cursor-pointer p-3 text-left transition hover:bg-orange-50 ${
                            n.read ? "opacity-70" : ""
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <span className={`mt-1 h-2 w-2 rounded-full ${n.read ? "bg-gray-300" : "bg-gradient-to-r from-orange-400 to-red-400"}`} />
                            <div className="flex-1">
                              <div className="text-sm text-gray-900">{n.message}</div>
                              <div className="mt-0.5 text-[11px] text-gray-500">{n.created_at ? formatFr(n.created_at) : ""}</div>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <Button variant="ghost" size="icon" aria-label="Paramètres" className="text-white hover:bg-white/20">
              <Settings className="h-5 w-5" />
            </Button>

            
            <div className="relative">
              <button
                onClick={() => setProfileOpen((v) => !v)}
                aria-label="Profil"
                className="flex items-center gap-2 rounded-full bg-white/15 hover:bg-white/25 pl-3 pr-2 py-1 text-white transition"
              >
                <span className="hidden sm:block text-sm font-medium tracking-wide">
                  {displayName(me) || "—"}
                </span>
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white text-xs font-bold">
                  {initials(me)}
                </div>
              </button>

              {profileOpen && (
                <div
                  className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-xl border border-emerald-200 bg-white shadow-2xl"
                  onMouseLeave={() => setProfileOpen(false)}
                >
                  <div className="flex items-center gap-3 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-teal-50 p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white font-bold">
                      {initials(me)}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-emerald-900">
                        {displayName(me) || "Technicien"}
                      </div>
                      <div className="text-xs text-emerald-700">{me?.email ?? "—"}</div>
                      <div className="text-[11px] text-emerald-600/80">{me?.role ?? "TECHNICIEN"}</div>
                    </div>
                  </div>
                  <div className="p-2 text-sm">
                    <Link
                      href={me ? `/techniciens/${me.id}` : "#"}
                      className="block rounded-md px-3 py-2 text-emerald-800 hover:bg-emerald-50"
                    >
                      Voir mon profil
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-3xl grid-cols-3 bg-white/80 backdrop-blur-sm border border-orange-200/50 shadow-md">
            <TabsTrigger
              value="tickets"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white"
            >
              <ClipboardList className="h-4 w-4" /> Tickets assignés
            </TabsTrigger>
            <TabsTrigger
              value="plan"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white"
            >
              <Calendar className="h-4 w-4" /> Planifier
            </TabsTrigger>
            <TabsTrigger
              value="inventaire"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white"
            >
              <Package className="h-4 w-4" /> Inventaire
            </TabsTrigger>
          </TabsList>

          {/* === Tickets === */}
          <TabsContent value="tickets" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
                Liste des tickets assignés
              </h2>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-orange-500" />
                  <Input
                    placeholder="Rechercher ticket, #id, email…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-72 pl-9 border-orange-200 focus:border-orange-400 focus:ring-orange-400/20 bg-white/80 backdrop-blur-sm"
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  title="Filtres (à venir)"
                  className="border-orange-300 bg-white/80 text-orange-700 hover:bg-orange-50 backdrop-blur-sm"
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {loadingTickets && <div className="text-sm text-orange-600">Chargement…</div>}
            {errorTickets && (
              <div className="rounded-xl border border-red-200 bg-gradient-to-r from-red-50 to-pink-50 p-4 text-sm text-red-700 shadow-sm">
                {errorTickets}
              </div>
            )}

            <div className="grid gap-4">
              {filteredTickets.map((t) => {
                const email = t.assigned_to?.email ?? me?.email ?? "Moi";
                const techId = t.assigned_to?.id ?? me?.id;

                return (
                  <Card
                    key={t.id}
                    className="bg-white/90 backdrop-blur-sm border-orange-100 shadow-md hover:shadow-lg transition-all duration-200 hover:border-orange-200"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono bg-gradient-to-r from-gray-100 to-slate-100 border-gray-300">
                            #{t.id}
                          </Badge>
                          <span className={statusBadge(t.statut)}>{t.statut === "EN_COURS" ? "EN COURS" : t.statut}</span>
                          <span className={priorityBadge(t.priorite)}>{t.priorite}</span>
                        </div>
                        <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                          Créé le {formatFr(t.date_creation)}
                        </div>
                      </div>
                      <CardTitle className="text-lg bg-gradient-to-r from-gray-800 to-gray-700 bg-clip-text text-transparent">
                        {t.titre}
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-600">
                        {t.description || <span className="text-gray-400">—</span>}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      {t.commentaire && (
                        <div className="rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-3 text-sm">
                          <span className="font-semibold text-amber-800">Commentaire:&nbsp;</span>
                          <span className="text-amber-700">{t.commentaire}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm">
                        <div className="text-gray-600">
                          Demandeur: <span className="text-emerald-700 font-semibold">{t.utilisateur?.email}</span>
                        </div>
                        <div className="text-gray-600">
                          Assigné à:{" "}
                          {techId ? (
                            <Link
                              href={`/techniciens/${techId}`}
                              prefetch={false}
                              className="text-teal-700 font-semibold underline underline-offset-2 decoration-teal-400 hover:text-teal-800 hover:decoration-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-400 rounded-sm"
                              title={`Ouvrir le profil de ${email}`}
                            >
                              {email}
                            </Link>
                          ) : (
                            <span className="text-teal-700 font-semibold">{email}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          onClick={() => intervenir(t.id)}
                          disabled={t.statut === "CLOTURE" || t.statut === "CLÔTURÉ"}
                          className="
                            w-fit h-8 px-3 text-xs font-medium rounded-lg
                            text-white
                            bg-gradient-to-r from-orange-500 to-amber-500
                            hover:from-orange-600 hover:to-amber-600
                            shadow-lg shadow-orange-500/30
                            disabled:opacity-60 disabled:cursor-not-allowed
                            transition-all duration-200
                          "
                        >
                          <Wrench className="mr-1.5 h-3.5 w-3.5" />
                          Intervenir
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => clore(t.id)}
                          disabled={t.statut !== "EN_COURS"}
                          className="
                            h-8 px-3 text-xs rounded-lg
                            border-emerald-300 bg-emerald-50 text-emerald-700
                            hover:bg-emerald-100 hover:border-emerald-400
                            disabled:opacity-60
                            transition-all duration-200
                          "
                        >
                          <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                          Clore
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {!loadingTickets && !errorTickets && filteredTickets.length === 0 && (
                <div className="text-center py-8 text-gray-500">Aucun ticket assigné.</div>
              )}
            </div>
          </TabsContent>

          {/* === Planification === */}
          <TabsContent value="plan" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
                Planifier une intervention
              </h2>
              <Button
                variant="outline"
                size="icon"
                onClick={loadMateriels}
                className="border-orange-300 bg-white/80 text-orange-700 hover:bg-orange-50 backdrop-blur-sm"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            <Card className="bg-white/90 backdrop-blur-sm border-orange-100 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100">
                <CardTitle className="text-orange-900">Nouvelle planification</CardTitle>
                <CardDescription className="text-orange-700">
                  Sélectionnez l'équipement et la date, puis décrivez l'intervention.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={submitPlan} className="grid max-w-xl gap-4">
                  <div className="grid gap-2">
                    <Label className="text-gray-700 font-semibold">Équipement</Label>
                    <select
                      className="h-10 rounded-lg border border-orange-200 bg-white px-3 focus:outline-none focus:ring-2 focus:ring-orange-400/20 focus:border-orange-400"
                      value={planMaterielId}
                      onChange={(e) => setPlanMaterielId(e.target.value ? Number(e.target.value) : "")}
                    >
                      <option value="">— choisir —</option>
                      {materiels.map((m) => (
                        <option key={m.id} value={m.id}>
                          #{m.id} {m.nom || m.modele || m.type || ""} — {m.etat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid gap-2">
                    <Label className="text-gray-700 font-semibold">Date & heure</Label>
                    <Input
                      type="datetime-local"
                      value={planDate}
                      onChange={(e) => setPlanDate(e.target.value)}
                      className="border-orange-200 focus:border-orange-400 focus:ring-orange-400/20"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label className="text-gray-700 font-semibold">Description</Label>
                    <Textarea
                      rows={4}
                      placeholder="Détaillez la maintenance préventive / intervention…"
                      value={planDesc}
                      onChange={(e) => setPlanDesc(e.target.value)}
                      className="border-orange-200 focus:border-orange-400 focus:ring-orange-400/20"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="submit"
                      disabled={planSaving}
                      className="
                        bg-gradient-to-r from-orange-500 to-amber-500 text-white
                        hover:from-orange-600 hover:to-amber-600
                        shadow-lg shadow-orange-500/30
                        transition-all duration-200
                      "
                    >
                      {planSaving ? "Planification…" : "Planifier"}
                    </Button>
                    {planError && <span className="text-sm text-red-600 bg-red-50 px-2 py-1 rounded-md">{planError}</span>}
                    {planOk && <span className="text-sm text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">{planOk}</span>}
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* === Inventaire === */}
          <TabsContent value="inventaire" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
                Inventaire des équipements
              </h2>
              <Button
                variant="outline"
                size="icon"
                onClick={loadMateriels}
                className="border-orange-300 bg-white/80 text-orange-700 hover:bg-orange-50 backdrop-blur-sm"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            {loadingMateriels && <div className="text-sm text-orange-600">Chargement…</div>}
            {errorMateriels && (
              <div className="rounded-xl border border-red-200 bg-gradient-to-r from-red-50 to-pink-50 p-4 text-sm text-red-700 shadow-sm">
                {errorMateriels}
              </div>
            )}

            <div className="grid gap-3">
              {materiels.map((m) => (
                <Card
                  key={m.id}
                  className="bg-white/90 backdrop-blur-sm border-orange-100 shadow-md hover:shadow-lg transition-all duration-200 hover:border-orange-200"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base bg-gradient-to-r from-gray-800 to-gray-700 bg-clip-text text-transparent">
                        #{m.id} {m.nom || m.modele || m.type || "Équipement"}
                      </CardTitle>
                      <Badge
                        variant="secondary"
                        className="bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 border border-emerald-200 shadow-sm"
                      >
                        {m.etat}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs text-gray-600">
                      {m.marque ? `${m.marque} · ` : ""}
                      {m.modele || ""}
                      {m.type ? ` · ${m.type}` : ""}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center gap-2">
                    <Label className="text-sm font-semibold text-gray-700">Changer l'état:</Label>
                    <select
                      defaultValue={m.etat}
                      onChange={(e) => saveEtatMateriel(m, e.target.value)}
                      className="h-9 rounded-lg border border-orange-200 bg-white px-2 focus:outline-none focus:ring-2 focus:ring-orange-400/20 focus:border-orange-400 text-sm"
                    >
                      <option value="EN_SERVICE">EN_SERVICE</option>
                      <option value="MAINTENANCE">MAINTENANCE</option>
                      <option value="EN_PANNE">EN_PANNE</option>
                      <option value="HORS_SERVICE">HORS_SERVICE</option>
                    </select>
                  </CardContent>
                </Card>
              ))}
            </div>

            {!loadingMateriels && !errorMateriels && materiels.length === 0 && (
              <div className="text-center py-8 text-gray-500">Aucun équipement dans l'inventaire.</div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
