"use client";

import { useEffect, useState, useTransition } from "react";
import { getUserTickets } from "@/app/actions/tickets";
import type { Ticket } from "@/app/actions/tickets";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Ticket as TicketIcon, Clock, AlertCircle } from "lucide-react";

interface TicketsState {
  success: boolean;
  message: string;
  tickets?: Ticket[];
}

/** ===================== DATE HELPERS (robust) ===================== **/
const toDate = (val: any): Date | null => {
  if (val == null) return null;

  // string ISO (with/without millis, with space instead of T, date-only)
  if (typeof val === "string") {
    let v = val.trim().replace(/\.\d+/, "").replace(" ", "T");
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) v = `${v}T00:00:00`;
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  }

  // number (epoch seconds or milliseconds)
  if (typeof val === "number") {
    const ms = val < 1e12 ? val * 1000 : val;
    const d = new Date(ms);
    return isNaN(d.getTime()) ? null : d;
  }

  // array [yyyy, mm, dd, hh?, mi?, ss?, ns?]  ← Jackson can do this sometimes
  if (Array.isArray(val)) {
    const [y, m, d, hh = 0, mi = 0, ss = 0] = val;
    if (!y || !m || !d) return null;
    const date = new Date(y, m - 1, d, hh, mi, ss);
    return isNaN(date.getTime()) ? null : date;
  }

  // object {year, monthValue or month, day/dayOfMonth, hour, minute, second}
  if (typeof val === "object") {
    const y = val.year ?? val.y;
    let m = val.monthValue ?? val.m ?? val.month;
    const d = val.day ?? val.dayOfMonth ?? val.d;
    const hh = val.hour ?? 0;
    const mi = val.minute ?? 0;
    const ss = val.second ?? 0;

    if (typeof m === "string") {
      const months: Record<string, number> = {
        JANUARY: 1, FEBRUARY: 2, MARCH: 3, APRIL: 4, MAY: 5, JUNE: 6,
        JULY: 7, AUGUST: 8, SEPTEMBER: 9, OCTOBER: 10, NOVEMBER: 11, DECEMBER: 12,
      };
      m = months[m.toUpperCase()];
    }
    if (y && m && d) {
      const date = new Date(y, Number(m) - 1, d, hh, mi, ss);
      return isNaN(date.getTime()) ? null : date;
    }
  }

  return null;
};

const formatDate = (val: any) => {
  const d = toDate(val);
  if (!d) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
};

const sameDateTime = (a: any, b: any) => {
  const da = toDate(a);
  const db = toDate(b);
  if (!da || !db) return false;
  return da.getTime() === db.getTime();
};


const getCreationRaw = (t: any) =>
  t?.dateCreation ??
  t?.createdAt ??
  t?.created_on ??
  t?.date_creation ??
  null;

/** ===================== COMPONENT ===================== **/
export default function UserTicketsPage() {
  const [state, setState] = useState<TicketsState | null>(null);
  const [isTransitioning, startTransition] = useTransition();

  const loadTickets = () => {
    startTransition(async () => {
      const result = await getUserTickets();
      setState(result);
    });
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleRefresh = () => {
    loadTickets();
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case "OUVERT":
        return "bg-green-100 text-green-800 border-green-200";
      case "EN_COURS":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "EN_ATTENTE":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "RESOLU":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "FERME":
        return "bg-gray-100 text-gray-600 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priorite?: string) => {
    switch (priorite) {
      case "CRITIQUE":
        return "bg-red-100 text-red-800 border-red-200";
      case "HAUTE":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "MOYENNE":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "BASSE":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <TicketIcon className="h-6 w-6" />
            Mes Tickets
          </h1>
          <p className="text-gray-600 mt-1">Consultez et suivez l'état de vos demandes d'assistance.</p>
        </div>
        <Button onClick={handleRefresh} disabled={isTransitioning} variant="outline" className="flex items-center gap-2">
          <RefreshCw className={`h-4 w-4 ${isTransitioning ? "animate-spin" : ""}`} />
          Actualiser
        </Button>
      </div>

      {isTransitioning && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8 gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="text-gray-600">Chargement des tickets...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {state?.message && (
        <Card className={`border-l-4 ${state.success ? "border-l-green-500 bg-green-50" : "border-l-red-500 bg-red-50"}`}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              {state.success ? <TicketIcon className="h-5 w-5 text-green-600" /> : <AlertCircle className="h-5 w-5 text-red-600" />}
              <span className={`font-medium ${state.success ? "text-green-800" : "text-red-800"}`}>{state.message}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {state?.tickets && state.tickets.length > 0 ? (
        <div className="grid gap-4">
          {state.tickets.map((ticket: Ticket) => {
            const createdRaw = getCreationRaw(ticket);
            return (
              <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-900">{ticket.titre}</CardTitle>
                      <p className="text-gray-600 mt-2 line-clamp-2">{ticket.description}</p>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.statut)}`}>
                        {ticket.statut}
                      </span>
                      {ticket.priorite && (
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(ticket.priorite)}`}>
                          {ticket.priorite}
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {ticket.commentaire && (
                    <div className="mb-3 p-3 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-700">
                        <strong>Commentaire:</strong> {ticket.commentaire}
                      </p>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>Créé le {formatDate(createdRaw)}</span>
                      </div>

                      {ticket.dateCloture && !sameDateTime(ticket.dateCloture, createdRaw) && (
                        <div className="flex items-center gap-1">
                          <RefreshCw className="h-4 w-4" />
                          <span>Modifié le {formatDate(ticket.dateCloture)}</span>
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-mono text-gray-400">#{ticket.id?.toString().slice(-8)}</span>
                  </div>

                 
                  {/* <pre className="text-[10px] text-gray-500 mt-2">{JSON.stringify(ticket, null, 2)}</pre> */}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : state?.success && state.tickets ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <TicketIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun ticket trouvé</h3>
            <p className="text-gray-600 mb-6">Vous n'avez pas encore créé de tickets d'assistance.</p>
            <Button onClick={() => (window.location.href = "/dashboard/incidents")} className="bg-blue-600 hover:bg-blue-700">
              Créer un incident
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

