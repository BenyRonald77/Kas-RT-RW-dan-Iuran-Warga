import { prisma } from "@/lib/prisma";
import { hitungSaldo } from "@/lib/kas";

/**
 * Saldo kas gabungan: seluruh iuran yang sudah dibayar warga (Pembayaran)
 * ditambah kas umum (KasTransaksi, sudah bersih masuk dikurangi keluar).
 * Kas umum secara definisi berada di luar iuran (lihat PRD, Ruang Lingkup),
 * jadi tidak ada penghitungan ganda.
 */
export async function getSaldoGabungan(): Promise<number> {
  const [pembayaran, kasTransaksi] = await Promise.all([
    prisma.pembayaran.findMany({ select: { jumlah: true } }),
    prisma.kasTransaksi.findMany({ select: { jenis: true, jumlah: true } }),
  ]);

  const totalIuranMasuk = pembayaran.reduce((total, p) => total + p.jumlah, 0);
  const saldoKasUmum = hitungSaldo(kasTransaksi);

  return totalIuranMasuk + saldoKasUmum;
}

export type RekapBulanan = {
  bulan: number;
  tahun: number;
  masuk: number;
  keluar: number;
};

/**
 * Menggabungkan pemasukan iuran dan transaksi kas umum menjadi rekap per
 * bulan, terurut dari bulan terbaru ke terlama.
 */
export async function getRekapBulanan(): Promise<RekapBulanan[]> {
  const [pembayaran, kasTransaksi] = await Promise.all([
    prisma.pembayaran.findMany({ select: { tanggal: true, jumlah: true } }),
    prisma.kasTransaksi.findMany({ select: { tanggal: true, jenis: true, jumlah: true } }),
  ]);

  const peta = new Map<string, RekapBulanan>();

  function ambilBaris(tanggal: Date): RekapBulanan {
    const bulan = tanggal.getMonth() + 1;
    const tahun = tanggal.getFullYear();
    const kunci = `${tahun}-${bulan}`;
    const existing = peta.get(kunci);
    if (existing) return existing;
    const baru: RekapBulanan = { bulan, tahun, masuk: 0, keluar: 0 };
    peta.set(kunci, baru);
    return baru;
  }

  for (const p of pembayaran) {
    ambilBaris(p.tanggal).masuk += p.jumlah;
  }
  for (const t of kasTransaksi) {
    const baris = ambilBaris(t.tanggal);
    if (t.jenis === "MASUK") baris.masuk += t.jumlah;
    else baris.keluar += t.jumlah;
  }

  return Array.from(peta.values()).sort((a, b) => b.tahun - a.tahun || b.bulan - a.bulan);
}

export type RekapIuranBaris = {
  nomorKK: string;
  status: string;
};

/** Status iuran seluruh KK untuk satu bulan/tahun, hanya nomor KK + status. */
export async function getRekapIuranBulan(bulan: number, tahun: number): Promise<RekapIuranBaris[]> {
  const tagihan = await prisma.tagihanIuran.findMany({
    where: { bulan, tahun },
    include: { kk: { select: { nomorKK: true } } },
    orderBy: { kk: { nomorKK: "asc" } },
  });

  return tagihan.map((t) => ({ nomorKK: t.kk.nomorKK, status: t.status }));
}
