import { PrismaClient } from "@prisma/client";

// Menghindari pembuatan banyak koneksi PrismaClient saat hot-reload di mode
// pengembangan Next.js, dengan menyimpan satu instance di objek global.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
