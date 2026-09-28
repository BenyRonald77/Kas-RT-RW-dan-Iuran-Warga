import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { kkSchema } from "@/lib/validation/kk";

export async function GET() {
  const daftar = await prisma.kepalaKeluarga.findMany({
    orderBy: { nama: "asc" },
  });
  return NextResponse.json(daftar);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = kkSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid." },
      { status: 400 }
    );
  }

  const existing = await prisma.kepalaKeluarga.findUnique({
    where: { nomorKK: parsed.data.nomorKK },
  });
  if (existing) {
    return NextResponse.json(
      { error: `Nomor KK ${parsed.data.nomorKK} sudah terdaftar.` },
      { status: 409 }
    );
  }

  const kk = await prisma.kepalaKeluarga.create({
    data: {
      nomorKK: parsed.data.nomorKK,
      nama: parsed.data.nama,
      alamat: parsed.data.alamat,
      noHp: parsed.data.noHp || null,
      aktif: parsed.data.aktif ?? true,
    },
  });

  return NextResponse.json(kk, { status: 201 });
}
