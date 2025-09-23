// app/actions/equipments.ts
import "server-only";
import { revalidatePath } from "next/cache";
import { getAuthenticatedUserId } from "@/lib/auth";
import { getAuthTokenFromCookies } from "@/lib/cookie-store";

export type Equipment = {
  id: string | number;
  type: string;
  marque: string;
  modele: string;
  etat: string;
  codeInventaire?: string | null;
  numeroSerie?: string | null;
  garantieFin?: string | null;
  affecteLe?: string | null;
  localisation?: string | null;
};

type ActionState =
  | { success: boolean; message: string; equipment?: Equipment[] }
  | null;

function backend() {
  return process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:8080/api";
}

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}


export async function getUserEquipmentList(): Promise<Equipment[]> {
  const userId = await getAuthenticatedUserId();
  if (!userId) return [];

  const token = await getAuthTokenFromCookies();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}`, Cookie: `auth_token=${token}` } : {}),
  };


  {
    const res = await fetch(`${backend()}/materiels/mine`, { headers, cache: "no-store" });
    if (res.ok) {
      return ((await safeJson(res)) ?? []) as Equipment[];
    }
  }

  // fallback: /materiels/user/{id}
  const res = await fetch(`${backend()}/materiels/user/${encodeURIComponent(userId)}`, {
    method: "GET",
    headers,
    cache: "no-store",
  });

  if (!res.ok) return [];
  return ((await safeJson(res)) ?? []) as Equipment[];
}


export async function refreshUserEquipment(
  _prev: ActionState,
  _fd: FormData
): Promise<ActionState> {
  "use server";
  const userId = await getAuthenticatedUserId();
  if (!userId) return { success: false, message: "Utilisateur non authentifié." };

  const token = await getAuthTokenFromCookies();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}`, Cookie: `auth_token=${token}` } : {}),
  };

 
  let equipment: Equipment[] = [];
  {
    const res = await fetch(`${backend()}/materiels/mine`, { headers, cache: "no-store" });
    if (res.ok) {
      equipment = ((await safeJson(res)) ?? []) as Equipment[];
    } else {
      const res2 = await fetch(`${backend()}/materiels/user/${encodeURIComponent(userId)}`, {
        headers, cache: "no-store"
      });
      if (!res2.ok) {
        const err = (await safeJson(res2)) as any;
        return { success: false, message: err?.message || "Échec de la récupération du matériel." };
      }
      equipment = ((await safeJson(res2)) ?? []) as Equipment[];
    }
  }

  revalidatePath("/dashboard/equipment");
  return { success: true, message: "Matériel récupéré.", equipment };
}

