// app/api/chatbot/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const maxDuration = 300; 
function join(a: string, b: string) {
  return `${a.replace(/\/+$/, "")}/${b.replace(/^\/+/, "")}`;
}
function safeJSON(t: string) { try { return JSON.parse(t); } catch { return null; } }

export async function POST(req: NextRequest) {
  const backendBase = process.env.NEXT_PUBLIC_BACKEND_API_URL ?? "http://localhost:8080/api";

  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ message: "JSON invalide" }, { status: 400 }); }
  const message = String(body?.message ?? "");
  if (!message) return NextResponse.json({ message: "message requis" }, { status: 400 });

  const cookieHeader = req.headers.get("cookie") ?? "";

  async function call(path: string) {
    return fetch(join(backendBase, path), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json, text/plain;q=0.9",
        "Cookie": cookieHeader,
      },
      body: JSON.stringify({ message }),
      cache: "no-store",
      
    });
  }

  let beRes = await call("/utilisateur/chatbot");
  if (beRes.status === 404) beRes = await call("/chatbot");

  const ct = beRes.headers.get("content-type") || "";
  const raw = await beRes.text();
  const data = ct.includes("application/json") ? safeJSON(raw) : null;

  if (!beRes.ok) return NextResponse.json({ message: data?.message || raw || "Erreur backend" }, { status: beRes.status });
  if (data && (data.error === true || (!data.answer && data.message)))
    return NextResponse.json({ message: data.message || "Erreur backend" }, { status: 502 });

  let answer = "";
  if (data) {
    let a = data.answer ?? data.response ?? data.text ?? "";
    if (typeof a !== "string") a = JSON.stringify(a);
    try { const j = JSON.parse(a); answer = j?.message?.content ?? j?.response ?? a; } catch { answer = a; }
  } else answer = raw;

  return NextResponse.json({ answer }, { status: 200 });
}

export async function GET() {
  return NextResponse.json({ ok: true, name: "chatbot" });
}

