// Sesi login admin disimpan sebagai cookie yang ditandatangani (HMAC-SHA256),
// bukan disimpan di database. Ini dibuat memakai Web Crypto API (bukan modul
// "crypto" bawaan Node) supaya bisa dijalankan baik di server biasa maupun di
// Next.js Middleware (yang berjalan di Edge Runtime).

const COOKIE_NAME = "kas_rt_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 hari

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    // Nilai cadangan hanya untuk pengembangan lokal agar aplikasi tetap bisa
    // dijalankan tanpa berkas .env. Selalu isi SESSION_SECRET pada penggunaan
    // sungguhan (lihat README).
    return "dev-secret-jangan-dipakai-di-produksi";
  }
  return secret;
}

async function hmac(data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return Buffer.from(signature).toString("base64url");
}

type SessionPayload = {
  sub: string; // id admin
  username: string;
  exp: number; // epoch ms
};

export async function createSessionToken(adminId: string, username: string): Promise<string> {
  const payload: SessionPayload = {
    sub: adminId,
    username,
    exp: Date.now() + SESSION_TTL_MS,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = await hmac(encoded);
  return `${encoded}.${signature}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token) return null;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;

  const expectedSignature = await hmac(encoded);
  if (signature !== expectedSignature) return null;

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf-8")) as SessionPayload;
    if (typeof payload.exp !== "number" || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
export const SESSION_MAX_AGE_SECONDS = SESSION_TTL_MS / 1000;
