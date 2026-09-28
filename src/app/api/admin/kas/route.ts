import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { kasSchema } from "@/lib/validation/kas";

export const dynamic = "force-dynamic";

export async function GET() {
  const daftar = await prisma.kasTransaksi.findMany({
    orderBy: [{ tanggal: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json(daftar);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = kasSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid." },
      { status: 400 }
    );
  }

  const transaksi = await prisma.kasTransaksi.create({
    data: {
      tanggal: new Date(parsed.data.tanggal),
      jenis: parsed.data.jenis,
      kategori: parsed.data.kategori,
      uraian: parsed.data.uraian,
      jumlah: parsed.data.jumlah,
    },
  });

  return NextResponse.json(transaksi, { status: 201 });
}
