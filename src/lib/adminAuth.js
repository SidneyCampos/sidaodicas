import crypto from "crypto";
import { cookies } from "next/headers";

export const COOKIE_NAME = "sidao_admin_token";

function getCredentials() {
  const user = (process.env.ADMIN_USER || "sidao").trim();
  const pass = (
    process.env.ADMIN_PASSWORD ||
    process.env.ADMIN_PASS ||
    "Sidao@2026"
  ).trim();
  const secret =
    process.env.ADMIN_SECRET || `sidao-dicas-secret-key-${user}-${pass}`;
  return { user, pass, secret };
}

export function createSessionToken(username) {
  const { secret } = getCredentials();
  const payload = `${username}:authenticated`;
  const signature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  return `${payload}.${signature}`;
}

export function verifySessionToken(token) {
  if (!token || typeof token !== "string") return false;
  const { user, secret } = getCredentials();
  const expectedToken = createSessionToken(user);

  try {
    const a = Buffer.from(token);
    const b = Buffer.from(expectedToken);
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function validateLogin(inputUser, inputPass) {
  const { user, pass } = getCredentials();
  return (
    String(inputUser || "").trim().toLowerCase() === user.toLowerCase() &&
    String(inputPass || "").trim() === pass
  );
}

export async function isAuthenticated() {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get(COOKIE_NAME);
    return verifySessionToken(tokenCookie?.value);
  } catch {
    return false;
  }
}
