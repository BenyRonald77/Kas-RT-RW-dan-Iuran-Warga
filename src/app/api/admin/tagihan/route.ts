import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { totalTerbayar } from "@/lib/tagihan";

// Route ini hanya berisi GET dan tidak memakai API dinamis bawaan Next.js
// (cookies/headers/searchParams), jadi tanpa ini Next akan menganggapnya
// bisa di-cache statis saat build, dan data akan "beku" tidak pernah
// ter-update. Data tagihan harus selalu dibaca langsung dari database.
export const dynamic = "force-dynamic";

export async function GET() {
  const tagihan = await prisma.tagihanIuran.findMany({
    include: { kk: true, pembayaran: true },
    orderBy: [{ tahun: "desc" }, { bulan: "desc" }, { kk: { nama: "asc" } }],
  });

  return NextResponse.json(
    tagihan.map((t) => ({
      id: t.id,
      bulan: t.bulan,
      tahun: t.tahun,
      nominal: t.nominal,
      jatuhTempo: t.jatuhTempo.toISOString(),
      status: t.status,
      totalTerbayar: totalTerbayar(t.pembayaran),
      kk: { id: t.kk.id, nama: t.kk.nama, nomorKK: t.kk.nomorKK },
    }))
  );
}
