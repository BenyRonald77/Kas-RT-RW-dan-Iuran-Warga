import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { kkSchema } from "@/lib/validation/kk";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json().catch(() => null);
  const parsed = kkSchema.partial().safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid." },
      { status: 400 }
    );
  }

  const kk = await prisma.kepalaKeluarga.findUnique({ where: { id: params.id } });
  if (!kk) {
    return NextResponse.json({ error: "Data KK tidak ditemukan." }, { status: 404 });
  }

  if (parsed.data.nomorKK && parsed.data.nomorKK !== kk.nomorKK) {
    const duplikat = await prisma.kepalaKeluarga.findUnique({
      where: { nomorKK: parsed.data.nomorKK },
    });
    if (duplikat) {
      return NextResponse.json(
        { error: `Nomor KK ${parsed.data.nomorKK} sudah terdaftar.` },
        { status: 409 }
      );
    }
  }

  const updated = await prisma.kepalaKeluarga.update({
    where: { id: params.id },
    data: {
      ...(parsed.data.nomorKK !== undefined ? { nomorKK: parsed.data.nomorKK } : {}),
      ...(parsed.data.nama !== undefined ? { nama: parsed.data.nama } : {}),
      ...(parsed.data.alamat !== undefined ? { alamat: parsed.data.alamat } : {}),
      ...(parsed.data.noHp !== undefined ? { noHp: parsed.data.noHp || null } : {}),
      ...(parsed.data.aktif !== undefined ? { aktif: parsed.data.aktif } : {}),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const kk = await prisma.kepalaKeluarga.findUnique({ where: { id: params.id } });
  if (!kk) {
    return NextResponse.json({ error: "Data KK tidak ditemukan." }, { status: 404 });
  }

  await prisma.kepalaKeluarga.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
