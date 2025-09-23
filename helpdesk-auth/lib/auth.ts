// lib/auth.ts
import "server-only";
import { cookies } from "next/headers";

type JwtAuthority = { authority?: string };
type JwtPayload = {
  sub?: string;
  email?: string;
  nom?: string;
  prenom?: string;
  name?: string;
  role?: string;
  roles?: string[];
  authorities?: JwtAuthority[];
  [k: string]: any;
};

/* ---------- helpers ---------- */
function b64urlDecodeUtf8(input: string): string {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, "=");

  if (typeof atob === "function") {
    const ascii = atob(padded);
    const bytes = Uint8Array.from(ascii, (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }
  // Node
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { Buffer } = require("node:buffer");
  return Buffer.from(padded, "base64").toString("utf8");
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

function normalizeRole(role?: string): string | null {
  if (!role) return null;
  const r = role.replace(/^ROLE_/, "").toUpperCase();
  if (r === "TECH") return "TECHNICIEN";
  return r;
}

function extractRole(p?: JwtPayload | null): string | null {
  if (!p) return null;
  return normalizeRole(
    p.role ||
      (Array.isArray(p.roles) ? p.roles[0] : undefined) ||
      (Array.isArray(p.authorities) ? p.authorities[0]?.authority : undefined)
  );
}

function properCase(s: string) {
  return s
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function nameFromEmail(email?: string) {
  if (!email) return "Utilisateur";
  const local = email.split("@")[0].replace(/[._-]+/g, " ");
  return properCase(local);
}

function displayNameFromPayload(p: JwtPayload | null): string | null {
  if (!p) return null;
  const byFields = [p.prenom, p.nom].filter(Boolean).join(" ").trim() || p.name;
  if (byFields) return properCase(byFields);
  const email = p.email || (typeof p.sub === "string" && p.sub.includes("@") ? p.sub : "");
  return email ? nameFromEmail(email) : null;
}

export function getInitials(name: string) {
  return (name.match(/\b\w/g)?.join("").slice(0, 2).toUpperCase() || "U");
}

/* ---------- public API ---------- */
export async function getAuthenticatedUserRole(): Promise<string | null> {
  const cookieStore = await cookies();           
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;
  return extractRole(decodeJwt(token));
}

export async function getAuthenticatedUserId(): Promise<string | null> {
  const cookieStore = await cookies();           // ✅
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;
  const p = decodeJwt(token);
  return (p?.userId as string) || (p?.sub as string) || null;
}

export async function getAuthenticatedUserEmail(): Promise<string | null> {
  const cookieStore = await cookies();           // ✅
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;
  const p = decodeJwt(token);
  return (p?.email as string) || (typeof p?.sub === "string" && p.sub.includes("@") ? p.sub : null);
}

export async function getAuthenticatedUserName(): Promise<string | null> {
  const cookieStore = await cookies();           // ✅
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;
  const p = decodeJwt(token);
  return displayNameFromPayload(p);
}

export async function getAuthenticatedUser() {
  const cookieStore = await cookies();           // ✅
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;
  const p = decodeJwt(token);
  const displayName = displayNameFromPayload(p) || "Utilisateur";
  const email = (p?.email as string) || (typeof p?.sub === "string" && p.sub.includes("@") ? p.sub : "");
  const role = extractRole(p);
  const id = (p?.userId as string) || (p?.sub as string) || null;
  return { displayName, email, role, id };
}


