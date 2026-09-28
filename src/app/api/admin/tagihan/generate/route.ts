import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPengaturan } from "@/lib/pengaturan";

/**
 * Membuat TagihanIuran untuk semua KK aktif yang belum memiliki tagihan pada
 * bulan & tahun berjalan. Aman dijalankan berkali-kali: KK yang sudah punya
 * tagihan bulan ini akan dilewati, bukan dibuat ulang (lihat constraint
 * unik kkId+bulan+tahun pada skema).
 */
export async function POST() {
  const sekarang = new Date();
  const bulan = sekarang.getMonth() + 1;
  const tahun = sekarang.getFullYear();

  const pengaturan = await getPengaturan();
  const jatuhTempo = new Date(tahun, bulan - 1, pengaturan.tanggalJatuhTempo);

  const kkAktif = await prisma.kepalaKeluarga.findMany({ where: { aktif: true } });

  const kkSudahDitagih = await prisma.tagihanIuran.findMany({
    where: { bulan, tahun, kkId: { in: kkAktif.map((kk) => kk.id) } },
    select: { kkId: true },
  });
  const idSudahDitagih = new Set(kkSudahDitagih.map((t) => t.kkId));

  const kkPerluTagihan = kkAktif.filter((kk) => !idSudahDitagih.has(kk.id));

  if (kkPerluTagihan.length > 0) {
    await prisma.tagihanIuran.createMany({
      data: kkPerluTagihan.map((kk) => ({
        kkId: kk.id,
        bulan,
        tahun,
        nominal: pengaturan.nominalIuranDefault,
        jatuhTempo,
        status: "BELUM_BAYAR",
      })),
    });
  }

  return NextResponse.json({
    bulan,
    tahun,
    dibuat: kkPerluTagihan.length,
    dilewati: kkAktif.length - kkPerluTagihan.length,
    totalKkAktif: kkAktif.length,
  });
}
