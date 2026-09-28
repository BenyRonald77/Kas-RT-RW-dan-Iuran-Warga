import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/session";

export async function verifyCredentials(username: string, password: string) {
  const admin = await prisma.admin.findUnique({ where: { username } });
  if (!admin) return null;

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) return null;

  return admin;
}

/**
 * Dipakai di Server Component / Route Handler untuk mengetahui admin yang
 * sedang login berdasarkan cookie sesi. Mengembalikan null bila belum login
 * atau sesi kedaluwarsa.
 */
export async function getCurrentAdmin() {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);
  if (!session) return null;
  return { id: session.sub, username: session.username };
}
