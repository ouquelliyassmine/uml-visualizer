import { NextRequest, NextResponse } from "next/server";

const BASE = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:8080/api";

// Small proxy that forwards cookies + JSON body as-is
async function proxy(req: NextRequest, url: string, init?: RequestInit) {
  const cookie = req.headers.get("cookie") || "";
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      cookie, // forward auth cookie (e.g. auth_token)
      ...(init?.headers || {}),
    },
    credentials: "include",
    cache: "no-store",
  });

  const contentType = res.headers.get("content-type") || "application/json";
  const text = await res.text();
  return new NextResponse(text, { status: res.status, headers: { "content-type": contentType } });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const materielId = searchParams.get("materielId");

  let url = `${BASE}/logiciels`;
  if (id) url = `${BASE}/logiciels/${id}`;
  else if (materielId) url = `${BASE}/logiciels?materielId=${materielId}`;

  return proxy(req, url, { method: "GET" });
}

export async function POST(req: NextRequest) {
  const body = await req.text(); // JSON string
  return proxy(req, `${BASE}/logiciels`, { method: "POST", body });
}

export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ message: "Missing id" }, { status: 400 });
  const body = await req.text();
  return proxy(req, `${BASE}/logiciels/${id}`, { method: "PUT", body });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ message: "Missing id" }, { status: 400 });
  return proxy(req, `${BASE}/logiciels/${id}`, { method: "DELETE" });
}
