import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "kurovia_admin_session";
export const DEFAULT_ADMIN_PASSWORD = "kurovia-admin-2026";

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD?.trim() || DEFAULT_ADMIN_PASSWORD;
}

export function isUsingDefaultPassword(): boolean {
  return !process.env.ADMIN_PASSWORD?.trim();
}

export function createSessionToken(password: string = getAdminPassword()): string {
  return createHmac("sha256", password).update("kurovia-admin-session-v1").digest("hex");
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const expected = createSessionToken();
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(ADMIN_COOKIE)?.value);
}

export function passwordMatches(candidate: string): boolean {
  const a = Buffer.from(candidate);
  const b = Buffer.from(getAdminPassword());
  return a.length === b.length && timingSafeEqual(a, b);
}
