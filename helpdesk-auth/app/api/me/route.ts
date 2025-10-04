// app/api/me/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

type JwtAuthority = { authority?: string };
type JwtPayload = {
  sub?: string;
  email?: string;
  username?: string;
  user_name?: string;
  preferred_username?: string;

  id?: number | string;
  userId?: number | string;
  user_id?: number | string;

  nom?: string;
  prenom?: string;
  firstName?: string;
  lastName?: string;
  given_name?: string;
  family_name?: string;

  role?: string;
  roles?: string[];
  authorities?: JwtAuthority[];

  [k: string]: any;
};


function b64urlDecodeUtf8(input: string): string {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, "=");

  if (typeof atob === "function") {
    // Edge/Browser
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } else {
    // Node fallback
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { Buffer } = require("node:buffer");
    return Buffer.from(padded, "base64").toString("utf8");
  }
}

function decodeJwt(token: string): JwtPayload | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    return JSON.parse(b64urlDecodeUtf8(part));
  } catch {
    return null;
  }
}

function normalizeRole(raw?: string): "ADMIN" | "TECHNICIEN" | "USER" | undefined {
  if (!raw) return undefined;
  const r = raw.toUpperCase();
  const noPrefix = r.startsWith("ROLE_") ? r.slice(5) : r;
  if (noPrefix === "TECH" || noPrefix === "TECHNICIEN") return "TECHNICIEN";
  if (noPrefix === "ADMIN") return "ADMIN";
  if (noPrefix === "USER") return "USER";
  return undefined;
}



export async function GET() {

  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "no token" }, { status: 401 });
  }

  const payload = decodeJwt(token);
  if (!payload) {
    return NextResponse.json({ error: "bad token" }, { status: 401 });
  }

  const email =
    payload.email ||
    payload.sub ||
    payload.username ||
    payload.user_name ||
    payload.preferred_username ||
    "";

  const nom = payload.nom ?? payload.lastName ?? payload.family_name ?? "";
  const prenom = payload.prenom ?? payload.firstName ?? payload.given_name ?? "";

  const rawId = payload.id ?? payload.userId ?? payload.user_id;
  const id =
    typeof rawId === "string"
      ? (isNaN(+rawId) ? undefined : +rawId)
      : (rawId as number | undefined);

  const role =
    normalizeRole(payload.role) ||
    normalizeRole(payload.roles?.[0]) ||
    normalizeRole(payload.authorities?.[0]?.authority) ||
    "TECHNICIEN";

  return NextResponse.json({ id, email, nom, prenom, role });
}
