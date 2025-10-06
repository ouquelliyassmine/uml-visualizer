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

export async function GET(_req: NextRequest) {
  const res = await fetch(`${API}/materiels`, {
    method: "GET",
    headers: await buildHeaders(),
    cache: "no-store",
  });
  try {
    const data = await res.json();
    return NextResponse.json(Array.isArray(data) ? data : Array.isArray(data?.content) ? data.content : [], { status: res.status });
  } catch {
    return NextResponse.json([], { status: res.status });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const res = await fetch(`${API}/materiels`, {
    method: "POST",
    headers: await buildHeaders(),
    body: JSON.stringify(body),
  });
  try {
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    const txt = await res.text().catch(() => "");
    return new NextResponse(txt || "", { status: res.status });
  }
}

export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const res = await fetch(`${API}/materiels/${id}`, {
    method: "PUT",
    headers: await buildHeaders(),
    body: JSON.stringify(body),
  });
  try {
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    const txt = await res.text().catch(() => "");
    return new NextResponse(txt || "", { status: res.status });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const res = await fetch(`${API}/materiels/${id}`, {
    method: "DELETE",
    headers: await buildHeaders(),
  });

  if (res.ok) return NextResponse.json({ ok: true }, { status: 200 });

  const txt = await res.text().catch(() => "");
  return new NextResponse(txt || "", { status: res.status });
}

