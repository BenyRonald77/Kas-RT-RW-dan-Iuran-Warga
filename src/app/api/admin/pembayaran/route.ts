import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pembayaranSchema } from "@/lib/validation/pembayaran";
import { totalTerbayar } from "@/lib/tagihan";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = pembayaranSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid." },
      { status: 400 }
    );
  }

  const tagihan = await prisma.tagihanIuran.findUnique({
    where: { id: parsed.data.tagihanId },
    include: { pembayaran: true },
  });
  if (!tagihan) {
    return NextResponse.json({ error: "Tagihan tidak ditemukan." }, { status: 404 });
  }

  const pembayaranBaru = await prisma.pembayaran.create({
    data: {
      tagihanId: tagihan.id,
      tanggal: new Date(parsed.data.tanggal),
      jumlah: parsed.data.jumlah,
      metode: parsed.data.metode,
      catatan: parsed.data.catatan || null,
    },
  });

  const totalSetelahBayar = totalTerbayar([...tagihan.pembayaran, pembayaranBaru]);
  const statusBaru = totalSetelahBayar >= tagihan.nominal ? "LUNAS" : "BELUM_BAYAR";

  const tagihanTerupdate = await prisma.tagihanIuran.update({
    where: { id: tagihan.id },
    data: { status: statusBaru },
  });

  return NextResponse.json({
    pembayaran: pembayaranBaru,
    tagihan: tagihanTerupdate,
    totalTerbayar: totalSetelahBayar,
  });
}
