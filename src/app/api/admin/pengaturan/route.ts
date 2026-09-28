import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getPengaturan } from "@/lib/pengaturan";

const pengaturanSchema = z.object({
  nominalIuranDefault: z.coerce.number().int().positive("Nominal harus lebih dari 0"),
  tanggalJatuhTempo: z.coerce.number().int().min(1).max(28, "Tanggal 1-28 agar berlaku di semua bulan"),
});

export async function GET() {
  const pengaturan = await getPengaturan();
  return NextResponse.json(pengaturan);
}

export async function PATCH(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = pengaturanSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid." },
      { status: 400 }
    );
  }

  await getPengaturan(); // pastikan baris "default" sudah ada
  const updated = await prisma.pengaturan.update({
    where: { id: "default" },
    data: parsed.data,
  });

  return NextResponse.json(updated);
}
