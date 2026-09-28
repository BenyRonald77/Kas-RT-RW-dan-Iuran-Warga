import { prisma } from "@/lib/prisma";

/**
 * Mengambil baris pengaturan tunggal, membuatnya dengan nilai default bila
 * belum pernah dibuat (mis. pada instalasi baru).
 */
export async function getPengaturan() {
  const existing = await prisma.pengaturan.findUnique({ where: { id: "default" } });
  if (existing) return existing;

  return prisma.pengaturan.create({ data: { id: "default" } });
}
