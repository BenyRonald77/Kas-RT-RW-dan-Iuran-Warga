import { PublicHeader } from "@/components/PublicHeader";
import { formatRupiah, NAMA_BULAN } from "@/lib/status";
import { getSaldoGabungan, getRekapBulanan, getRekapIuranBulan } from "@/lib/laporan";

// Halaman ini menampilkan data kas yang berubah setiap ada transaksi baru,
// jadi tidak boleh di-cache statis saat build (lihat catatan yang sama di
// src/app/api/admin/tagihan/route.ts).
export const dynamic = "force-dynamic";

export default async function LaporanPublikPage() {
  const sekarang = new Date();
  const bulanIni = sekarang.getMonth() + 1;
  const tahunIni = sekarang.getFullYear();

  const [saldo, rekapBulanan, rekapIuran] = await Promise.all([
    getSaldoGabungan(),
    getRekapBulanan(),
    getRekapIuranBulan(bulanIni, tahunIni),
  ]);

  const jumlahLunas = rekapIuran.filter((r) => r.status === "LUNAS").length;
  const jumlahBelumBayar = rekapIuran.length - jumlahLunas;

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-10 px-4 py-10 sm:px-6">
        <div>
          <h1 className="font-judul text-2xl font-semibold text-ink sm:text-3xl">
            Laporan Kas RT/RW
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-ink/70">
            Halaman ini terbuka untuk semua warga. Untuk menjaga privasi,
            laporan status iuran hanya menampilkan nomor KK, bukan nama atau
            alamat lengkap.
          </p>
        </div>

        <section aria-labelledby="saldo-kas" className="rounded-lg border border-hijau-200 bg-white p-6">
          <h2 id="saldo-kas" className="text-sm font-medium text-ink/60">
            Saldo Kas Saat Ini
          </h2>
          <p className="mt-1 font-judul text-3xl font-semibold text-hijau-700">
            {formatRupiah(saldo)}
          </p>
          <p className="mt-2 text-xs text-ink/50">
            Gabungan seluruh iuran yang telah dibayar warga dan kas umum RT.
          </p>
        </section>

        <section aria-labelledby="rekap-bulanan">
          <h2 id="rekap-bulanan" className="font-judul text-lg font-semibold text-ink">
            Rekap Kas Masuk-Keluar per Bulan
          </h2>
          {rekapBulanan.length === 0 ? (
            <div className="mt-3 rounded-lg border border-dashed border-hijau-200 bg-white p-8 text-center">
              <p className="text-ink/70">Belum ada transaksi kas yang tercatat.</p>
              <p className="mt-1 text-sm text-ink/50">
                Rekap akan muncul di sini setelah pengurus mencatat transaksi pertama.
              </p>
            </div>
          ) : (
            <div className="mt-3 overflow-x-auto rounded-lg border border-hijau-200 bg-white">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead className="border-b border-hijau-200 bg-hijau-50/50 text-ink/70">
                  <tr>
                    <th className="px-4 py-3 font-medium">Bulan</th>
                    <th className="px-4 py-3 font-medium">Masuk</th>
                    <th className="px-4 py-3 font-medium">Keluar</th>
                    <th className="px-4 py-3 font-medium">Selisih</th>
                  </tr>
                </thead>
                <tbody>
                  {rekapBulanan.map((r) => (
                    <tr key={`${r.tahun}-${r.bulan}`} className="border-b border-hijau-100 last:border-0">
                      <td className="px-4 py-3">
                        {NAMA_BULAN[r.bulan - 1]} {r.tahun}
                      </td>
                      <td className="px-4 py-3 text-hijau-700">{formatRupiah(r.masuk)}</td>
                      <td className="px-4 py-3 text-sawo-600">{formatRupiah(r.keluar)}</td>
                      <td className="px-4 py-3 font-medium">
                        {formatRupiah(r.masuk - r.keluar)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section aria-labelledby="rekap-iuran">
          <h2 id="rekap-iuran" className="font-judul text-lg font-semibold text-ink">
            Status Iuran {NAMA_BULAN[bulanIni - 1]} {tahunIni}
          </h2>

          {rekapIuran.length === 0 ? (
            <div className="mt-3 rounded-lg border border-dashed border-hijau-200 bg-white p-8 text-center">
              <p className="text-ink/70">Tagihan iuran bulan ini belum dibuat oleh pengurus.</p>
              <p className="mt-1 text-sm text-ink/50">
                Rekap status iuran akan muncul setelah tagihan bulan berjalan dibuat.
              </p>
            </div>
          ) : (
            <>
              <p className="mt-2 text-sm text-ink/70">
                <span className="font-medium text-hijau-700">{jumlahLunas} KK lunas</span>
                {" · "}
                <span className="font-medium text-waspada-600">{jumlahBelumBayar} KK belum bayar</span>
              </p>
              <div className="mt-3 overflow-x-auto rounded-lg border border-hijau-200 bg-white">
                <table className="w-full min-w-[320px] text-left text-sm">
                  <thead className="border-b border-hijau-200 bg-hijau-50/50 text-ink/70">
                    <tr>
                      <th className="px-4 py-3 font-medium">Nomor KK</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rekapIuran.map((r) => (
                      <tr key={r.nomorKK} className="border-b border-hijau-100 last:border-0">
                        <td className="px-4 py-3">{r.nomorKK}</td>
                        <td className="px-4 py-3">
                          <span
                            className={
                              r.status === "LUNAS"
                                ? "rounded bg-hijau-50 px-2 py-0.5 text-xs font-medium text-hijau-700"
                                : "rounded bg-waspada-50 px-2 py-0.5 text-xs font-medium text-waspada-600"
                            }
                          >
                            {r.status === "LUNAS" ? "Lunas" : "Belum Bayar"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      </main>

      <footer className="border-t border-hijau-200/60 px-4 py-6 text-center text-xs text-ink/60 sm:px-6">
        Dikelola oleh pengurus RT/RW setempat. Data diperbarui setiap ada transaksi baru.
      </footer>
    </div>
  );
}
