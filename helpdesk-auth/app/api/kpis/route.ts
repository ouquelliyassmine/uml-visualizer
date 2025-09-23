// app/api/kpis/route.ts
import { NextRequest, NextResponse } from "next/server";

type SafeNum = number | null;

async function safeCount(req: NextRequest, path: string): Promise<SafeNum> {
  try {
    const { origin } = new URL(req.url);
    const cookie = req.headers.get("cookie") || "";
    const res = await fetch(`${origin}${path}`, {
      headers: { cookie, "content-type": "application/json" },
      credentials: "include",
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data)) return data.length;
    if (Array.isArray((data as any)?.content)) return (data as any).content.length;
    if (typeof (data as any)?.count === "number") return (data as any).count;
    if (Array.isArray((data as any)?.items)) return (data as any).items.length;
    return data ? 1 : null;
  } catch {
    return null;
  }
}

async function countLicencesActives(req: NextRequest): Promise<SafeNum> {
  try {
    const { origin } = new URL(req.url);
    const cookie = req.headers.get("cookie") || "";
    const res = await fetch(`${origin}/api/logiciels`, {
      headers: { cookie, "content-type": "application/json" },
      credentials: "include",
      cache: "no-store",
    });
    if (!res.ok) return null;
    const list: any[] = await res.json();
    const today = new Date();
    const isActive = (d?: string | null) => {
      if (!d || String(d).trim() === "" || d === "null") return true;
      const dt = new Date(`${d}T00:00:00`);
      return !isNaN(dt.getTime()) && dt >= new Date(today.toDateString());
    };
    return list.filter(l => isActive(l.dateExpiration ?? l.dateexpiration)).length;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const [users, mats, fournisseurs, licences, tickets, contrats] = await Promise.all([
    safeCount(req, "/api/admin/users"),
    safeCount(req, "/api/materiels"),
    safeCount(req, "/api/fournisseurs"),
    countLicencesActives(req),
    safeCount(req, "/api/tickets"),
    safeCount(req, "/api/contrats"),
  ]);

  const body = {
    utilisateursActifs: users ?? 0,
    equipements: mats ?? 0,
    licencesActives: licences ?? 0,
    ticketsOuverts: tickets ?? 0,
    fournisseurs: fournisseurs ?? 0,
    contratsActifs: contrats ?? 0,
    trends: {
      utilisateursActifs: null,
      equipements: null,
      licencesActives: null,
      ticketsOuverts: null,
      fournisseurs: null,
      contratsActifs: null,
    },
  };

  return NextResponse.json(body, { status: 200 });
}
