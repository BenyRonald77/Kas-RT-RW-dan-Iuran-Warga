import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { kasSchema } from "@/lib/validation/kas";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json().catch(() => null);
  const parsed = kasSchema.partial().safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid." },
      { status: 400 }
    );
  }

  const existing = await prisma.kasTransaksi.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ error: "Transaksi tidak ditemukan." }, { status: 404 });
  }

  const updated = await prisma.kasTransaksi.update({
    where: { id: params.id },
    data: {
      ...(parsed.data.tanggal !== undefined ? { tanggal: new Date(parsed.data.tanggal) } : {}),
      ...(parsed.data.jenis !== undefined ? { jenis: parsed.data.jenis } : {}),
      ...(parsed.data.kategori !== undefined ? { kategori: parsed.data.kategori } : {}),
      ...(parsed.data.uraian !== undefined ? { uraian: parsed.data.uraian } : {}),
      ...(parsed.data.jumlah !== undefined ? { jumlah: parsed.data.jumlah } : {}),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const existing = await prisma.kasTransaksi.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ error: "Transaksi tidak ditemukan." }, { status: 404 });
  }

  await prisma.kasTransaksi.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
