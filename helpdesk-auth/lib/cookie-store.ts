// lib/cookie-store.ts
import "server-only";
import { cookies } from "next/headers";


export async function getCookieStore() {
  const c: any = cookies();
  return typeof c?.then === "function" ? await c : c;
}


export async function getAuthTokenFromCookies() {
  const store = await getCookieStore();
  return store.get("auth_token")?.value ?? "";
}

