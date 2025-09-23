// app/api/fournisseurs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:8080/api";

async function buildHeaders() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
    headers.Cookie = `auth_token=${token}`;
  }
  return headers;
}

function buildTarget(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  const sp = new URLSearchParams(url.searchParams);
  if (id) sp.delete("id");
  const qs = sp.toString();
  const base = `${API}/fournisseurs`;
  return {
    id,
    url: `${base}${id ? `/${id}` : ""}${qs ? `?${qs}` : ""}`,
  };
}


export async function GET(req: NextRequest) {
  try {
    const { url } = buildTarget(req);
    const res = await fetch(url, {
      method: "GET",
      headers: await buildHeaders(),
      cache: "no-store",
    });
    const data = await res.json().catch(() => (Array.isArray(res) ? [] : {}));
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    return NextResponse.json({ error: "Proxy error (GET)" }, { status: 500 });
  }
}


export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const res = await fetch(`${API}/fournisseurs`, {
      method: "POST",
      headers: await buildHeaders(),
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Proxy error (POST)" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id } = buildTarget(req);
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const body = await req.json().catch(() => ({}));
    const res = await fetch(`${API}/fournisseurs/${id}`, {
      method: "PUT",
      headers: await buildHeaders(),
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Proxy error (PUT)" }, { status: 500 });
  }
}


export async function DELETE(req: NextRequest) {
  try {
    const { id } = buildTarget(req);
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const res = await fetch(`${API}/fournisseurs/${id}`, {
      method: "DELETE",
      headers: await buildHeaders(),
    });
    if (res.status === 204) return new NextResponse(null, { status: 204 });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Proxy error (DELETE)" }, { status: 500 });
  }
}
