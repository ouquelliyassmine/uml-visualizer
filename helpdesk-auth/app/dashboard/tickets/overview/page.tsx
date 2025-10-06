"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { getUserTickets } from "@/app/actions/tickets";
import type { Ticket } from "@/app/actions/tickets";
import {
  Ticket as TicketIcon,
  Clock,
  Hourglass,
  CheckCircle2,
  ListChecks,
  RefreshCcw,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/* ===================== Utils ===================== */
type TicketsState =
  | { success: true; message: string; tickets: Ticket[] }
  | { success: false; message: string; tickets?: Ticket[] }
  | null;

const STATUSES = ["OUVERT", "EN_COURS", "EN_ATTENTE", "RESOLU", "FERME"] as const;
type Status = typeof STATUSES[number];

function normStatus(s?: string): Status {
  const v = (s || "").toUpperCase();
  if (v === "OUVERT" || v === "OPEN") return "OUVERT";
  if (v === "EN_COURS" || v === "IN_PROGRESS") return "EN_COURS";
  if (v === "EN_ATTENTE" || v === "PENDING") return "EN_ATTENTE";
  if (v === "RESOLU" || v === "RÉSOLU" || v === "RESOLVED") return "RESOLU";
  if (v === "FERME" || v === "CLOSE" || v === "CLOSED" || v === "CLOTURE") return "FERME";
  return "OUVERT";
}

function statusPillClass(s: Status) {
  switch (s) {
    case "OUVERT":
      return "bg-green-100 text-green-800 border-green-200";
    case "EN_COURS":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "EN_ATTENTE":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "RESOLU":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "FERME":
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
}

function priorityPillClass(p?: string) {
  const v = (p || "").toUpperCase();
  if (v === "CRITIQUE") return "bg-red-100 text-red-800 border-red-200";
  if (v === "HAUTE") return "bg-orange-100 text-orange-800 border-orange-200";
  if (v === "MOYENNE") return "bg-yellow-100 text-yellow-800 border-yellow-200";
  if (v === "BASSE") return "bg-green-100 text-green-800 border-green-200";
  return "bg-gray-100 text-gray-700 border-gray-200";
}

function safeDate(s?: string | null) {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

function fmtDateTime(s?: string | null) {
  const d = safeDate(s);
  if (!d) return "—";
  return d.toLocaleString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function daysBetween(a: Date, b: Date) {
  const ms = Math.abs(b.getTime() - a.getTime());
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

/* ===================== Small UI ===================== */
function StatCard({
  title,
  value,
  icon,
  hint,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  hint?: string;
}) {
  return (
    <Card className="rounded-2xl shadow-sm hover:shadow-md transition-all">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-semibold text-slate-700">{title}</CardTitle>
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 ring-1 ring-orange-200/60 flex items-center justify-center">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-extrabold text-slate-900">{value}</div>
        {hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
      </CardContent>
    </Card>
  );
}

function Meter({ value }: { value: number }) {
  return (
    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-orange-400 to-amber-500"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

/* ===================== Page ===================== */
export default function TicketsOverviewPage() {
  const [state, setState] = useState<TicketsState>(null);
  const [isTransitioning, startTransition] = useTransition();

  const load = () =>
    startTransition(async () => {
      const res = await getUserTickets();
      setState(res as any);
    });

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tickets: Ticket[] = (state && (state as any).tickets) || [];

  // KPIs
  const total = tickets.length;
  const byStatus: Record<Status, number> = {
    OUVERT: 0,
    EN_COURS: 0,
    EN_ATTENTE: 0,
    RESOLU: 0,
    FERME: 0,
  };
  const byPriority: Record<string, number> = {};
  let openAgesDays: number[] = [];

  for (const t of tickets) {
    const s = normStatus(t.statut as any);
    byStatus[s]++;

    const p = (t.priorite || "—").toUpperCase();
    byPriority[p] = (byPriority[p] || 0) + 1;

    const created = safeDate((t as any).dateCreation);
    const closed = safeDate((t as any).dateCloture);
    if (created) {
      if (s === "OUVERT" || s === "EN_COURS" || s === "EN_ATTENTE") {
        openAgesDays.push(daysBetween(created, new Date()));
      }
    }
  }

  const resolvedOrClosed = byStatus.RESOLU + byStatus.FERME;
  const avgOpenAge =
    openAgesDays.length > 0
      ? Math.round(openAgesDays.reduce((a, b) => a + b, 0) / openAgesDays.length)
      : 0;

  // Aging buckets for open/in-progress
  const agingBuckets = { "< 1j": 0, "1–3j": 0, "4–7j": 0, "> 7j": 0 } as Record<string, number>;
  for (const d of openAgesDays) {
    if (d < 1) agingBuckets["< 1j"]++;
    else if (d <= 3) agingBuckets["1–3j"]++;
    else if (d <= 7) agingBuckets["4–7j"]++;
    else agingBuckets["> 7j"]++;
  }

  const recent = [...tickets]
    .sort((a, b) => {
      const da = safeDate((a as any).dateCreation)?.getTime() || 0;
      const db = safeDate((b as any).dateCreation)?.getTime() || 0;
      return db - da;
    })
    .slice(0, 6);

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
            Tableau de bord des tickets
          </h1>
          
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/incidents">
            <Button className="rounded-xl">
              Créer un incident <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
          <Link href="/dashboard/tickets">
            <Button variant="outline" className="rounded-xl">
              Voir tous les tickets
            </Button>
          </Link>
          <Button onClick={load} variant="ghost" disabled={isTransitioning} className="rounded-xl">
            <RefreshCcw className={`h-4 w-4 ${isTransitioning ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          title="Total"
          value={total}
          hint="Tous vos tickets"
          icon={<ListChecks className="h-5 w-5 text-slate-700" />}
        />
        <StatCard
          title="Ouverts"
          value={byStatus.OUVERT}
          hint="En attente de prise en charge"
          icon={<TicketIcon className="h-5 w-5 text-green-700" />}
        />
        <StatCard
          title="En cours / Attente"
          value={byStatus.EN_COURS + byStatus.EN_ATTENTE}
          hint="En traitement"
          icon={<Clock className="h-5 w-5 text-blue-700" />}
        />
        <StatCard
          title="Résolus / Fermés"
          value={resolvedOrClosed}
          hint="Incidents terminés"
          icon={<CheckCircle2 className="h-5 w-5 text-emerald-700" />}
        />
      </div>

      {/* Distribution par statut */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Répartition par statut</CardTitle>
          <CardDescription>Nombre de tickets par état.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {STATUSES.map((s) => {
            const count = byStatus[s];
            const pct = total ? (count / total) * 100 : 0;
            return (
              <div key={s} className="flex items-center gap-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${statusPillClass(s)}`}>
                  {s}
                </span>
                <div className="flex-1">
                  <Meter value={pct} />
                </div>
                <span className="w-16 text-right text-sm text-slate-700 font-medium">{count}</span>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Distribution par priorité + Âge moyen des tickets ouverts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Répartition par priorité</CardTitle>
            <CardDescription>Critique, Haute, Moyenne, Basse…</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(byPriority)
              .sort((a, b) => b[1] - a[1])
              .map(([p, count]) => {
                const pct = total ? (count / total) * 100 : 0;
                return (
                  <div key={p} className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${priorityPillClass(p)}`}>
                      {p}
                    </span>
                    <div className="flex-1">
                      <Meter value={pct} />
                    </div>
                    <span className="w-16 text-right text-sm text-slate-700 font-medium">{count}</span>
                  </div>
                );
              })}
            {Object.keys(byPriority).length === 0 && (
              <div className="text-sm text-slate-500">Aucune priorité définie.</div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Âge moyen des tickets ouverts</CardTitle>
            <CardDescription>Temps écoulé depuis la création (en jours).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end gap-3">
              <span className="text-4xl font-extrabold text-slate-900">{avgOpenAge}</span>
              <span className="text-slate-600 mb-1">jours</span>
            </div>
            <div className="space-y-2">
              {(["< 1j", "1–3j", "4–7j", "> 7j"] as const).map((k) => {
                const count = agingBuckets[k];
                const openCount = openAgesDays.length || 1;
                const pct = (count / openCount) * 100;
                return (
                  <div key={k} className="flex items-center gap-3">
                    <span className="w-16 text-xs font-semibold text-slate-700">{k}</span>
                    <div className="flex-1">
                      <Meter value={pct} />
                    </div>
                    <span className="w-12 text-right text-sm text-slate-700">{count}</span>
                  </div>
                );
              })}
              {openAgesDays.length === 0 && (
                <div className="text-sm text-slate-500">Aucun ticket ouvert/en cours/en attente.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Derniers tickets */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Derniers tickets</CardTitle>
          <CardDescription>Les 6 plus récents par date de création.</CardDescription>
        </CardHeader>
        <CardContent>
          {isTransitioning ? (
            <div className="text-sm text-slate-500">Chargement…</div>
          ) : recent.length === 0 ? (
            <div className="text-sm text-slate-500">Aucun ticket pour le moment.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b">
                    <th className="py-2 pr-4">Titre</th>
                    <th className="py-2 pr-4">Statut</th>
                    <th className="py-2 pr-4">Priorité</th>
                    <th className="py-2 pr-4">Créé le</th>
                    <th className="py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((t) => {
                    const s = normStatus((t as any).statut);
                    return (
                      <tr key={t.id} className="border-b last:border-0">
                        <td className="py-3 pr-4 font-medium text-slate-800">{t.titre}</td>
                        <td className="py-3 pr-4">
                          <Badge className={`rounded-full px-2.5 py-1 text-xs font-semibold border ${statusPillClass(s)}`}>
                            {s}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4">
                          <Badge variant="outline" className={`rounded-full ${priorityPillClass((t as any).priorite)}`}>
                            {(t as any).priorite || "—"}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4">{fmtDateTime((t as any).dateCreation)}</td>
                        <td className="py-3 text-right">
                          <Link href={`/dashboard/tickets?id=${t.id}`} className="text-orange-700 hover:underline">
                            Détails →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alerte si échec */}
      {state && !state.success && (
        <Card className="border-l-4 border-l-red-500 bg-red-50 rounded-2xl">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="font-medium text-red-800">{(state as any).message || "Erreur de chargement."}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

