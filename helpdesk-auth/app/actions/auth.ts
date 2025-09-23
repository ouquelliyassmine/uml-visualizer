// app/actions/auth.ts
"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";

type ActionState = { success: boolean; message: string } | null;

type JwtAuthority = { authority?: string };
type JwtPayload = {
  role?: string;                // "ROLE_TECHNICIEN" ...
  roles?: string[];             // ["ROLE_TECHNICIEN"]
  authorities?: JwtAuthority[]; // [{ authority: "ROLE_TECHNICIEN" }]
 
  id?: number | string;
  userId?: number | string;
  user_id?: number | string;
  uid?: number | string;
  email?: string;
  sub?: string;
  [k: string]: any;
};

type MeDto = { id: number; nom?: string; prenom?: string; email: string; role?: string };

// ---------- helpers ----------
function safeJson(res: Response) {
  return res.json().then((j) => j).catch(() => null);
}


function b64urlDecodeUtf8(input: string): string {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, "=");
  if (typeof atob === "function") {
    const ascii = atob(padded);
    const bytes = Uint8Array.from(ascii, (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }
  // Node runtime
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

function normalizeRole(raw?: string): "ADMIN" | "TECHNICIEN" | "USER" | undefined {
  if (!raw) return undefined;
  const r = raw.toUpperCase();
  const noPrefix = r.startsWith("ROLE_") ? r.replace(/^ROLE_/, "") : r;
  if (noPrefix === "TECH" || noPrefix === "TECHNICIEN") return "TECHNICIEN";
  if (noPrefix === "ADMIN") return "ADMIN";
  if (noPrefix === "USER") return "USER";
  return undefined;
}

function extractRole(payload: JwtPayload | null): "ADMIN" | "TECHNICIEN" | "USER" | undefined {
  if (!payload) return undefined;
  const fromRole = normalizeRole(payload.role);
  if (fromRole) return fromRole;
  const fromRoles = Array.isArray(payload.roles) ? normalizeRole(payload.roles[0]) : undefined;
  if (fromRoles) return fromRoles;
  const fromAuth = Array.isArray(payload.authorities) ? normalizeRole(payload.authorities[0]?.authority) : undefined;
  return fromAuth;
}

function getBackendUrl() {
  return process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:8080/api";
}


async function fetchMeWithToken(token: string): Promise<MeDto | null> {
  const backend = getBackendUrl();
  try {
    const res = await fetch(`${backend}/auth/me`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        Cookie: `auth_token=${token}`,
      },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as MeDto;
  } catch {
    return null;
  }
}

// ---------- ACTIONS ----------

// 🔐 LOGIN
export async function login(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  "use server";

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    const backendUrl = getBackendUrl();

    const res = await fetch(`${backendUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const data = await safeJson(res);
      return { success: false, message: data?.message || "Échec de la connexion" };
    }

    const responseData = await safeJson(res);

    
    let token: string | null = null;
    const setCookieHeader = res.headers.get("set-cookie");
    if (setCookieHeader) {
      const m = setCookieHeader.match(/(?:^|,)\s*auth_token=([^;]+)/i) || setCookieHeader.match(/auth_token=([^;]+)/i);
      if (m) token = m[1];
    }
    if (!token && responseData?.token) token = responseData.token;

    if (!token) {
      return { success: false, message: "Token manquant. Vérifiez vos identifiants ou la config du backend." };
    }

   
    // @ts-expect-error — Server Actions allow cookies().set()
    cookies().set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60,
      path: "/",
    });

    
    const payload = decodeJwt(token);
    const role = extractRole(payload);

    // حدّد الوجهة:
    if (role === "ADMIN") {
      redirect("/admin");
    }

    if (role === "TECHNICIEN") {
      
      const me = await fetchMeWithToken(token);
      
      if (me?.id != null) {
        redirect(`/techniciens/${me.id}`);
      }

      
      const rawId =
        payload?.id ?? payload?.userId ?? payload?.user_id ?? payload?.uid ??
        (typeof payload?.sub === "string" && !payload.sub.includes("@") ? payload.sub : undefined);
      const n = Number(rawId);
      if (!Number.isNaN(n)) {
        redirect(`/techniciens/${n}`);
      }

      redirect("/technicien");
    }

   
    redirect("/dashboard");
  } catch (error: any) {
    if (error?.digest?.startsWith?.("NEXT_REDIRECT")) throw error;
    return { success: false, message: "Erreur de connexion" };
  }
}

// 📝 REGISTER
export async function register(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  "use server";

  const nom = formData.get("nom") as string;
  const prenom = formData.get("prenom") as string;
  const email = formData.get("email") as string;
  const telephone = formData.get("telephone") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;

  try {
    const backendUrl = getBackendUrl();

    const res = await fetch(`${backendUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nom, prenom, email, telephone, password, role }),
    });

    if (res.ok) {
      redirect("/login");
      return { success: true, message: "Inscription réussie !" };
    }

    const data = await safeJson(res);
    return { success: false, message: data?.message || "Erreur lors de l'inscription." };
  } catch (error: any) {
    if (error?.digest?.startsWith?.("NEXT_REDIRECT")) throw error;
    return { success: false, message: "Une erreur est survenue lors de l'inscription. Veuillez réessayer." };
  }
}

// 🚪 LOGOUT
export async function logout(): Promise<void> {
  "use server";
  // @ts-expect-error — Server Actions allow cookies().delete()
  cookies().delete("auth_token");
  redirect("/login");
}

