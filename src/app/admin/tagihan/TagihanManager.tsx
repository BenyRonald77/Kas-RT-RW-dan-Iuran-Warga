"use client";

import { Fragment, useState } from "react";
import { NAMA_BULAN, formatRupiah, formatTanggal } from "@/lib/status";
import { CatatPembayaranForm } from "@/components/CatatPembayaranForm";

type Tagihan = {
  id: string;
  bulan: number;
  tahun: number;
  nominal: number;
  jatuhTempo: string;
  status: string;
  totalTerbayar: number;
  kk: { id: string; nama: string; nomorKK: string };
};

type Pengaturan = {
  nominalIuranDefault: number;
  tanggalJatuhTempo: number;
};

type HasilGenerate = {
  bulan: number;
  tahun: number;
  dibuat: number;
  dilewati: number;
  totalKkAktif: number;
};

export function TagihanManager({
  tagihanAwal,
  pengaturanAwal,
}: {
  tagihanAwal: Tagihan[];
  pengaturanAwal: Pengaturan;
}) {
  const [daftar, setDaftar] = useState<Tagihan[]>(tagihanAwal);
  const [pengaturan, setPengaturan] = useState<Pengaturan>(pengaturanAwal);
  const [editPengaturan, setEditPengaturan] = useState(false);
  const [formPengaturan, setFormPengaturan] = useState(pengaturanAwal);

  const [menghasilkan, setMenghasilkan] = useState(false);
  const [hasil, setHasil] = useState<HasilGenerate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [menyimpanPengaturan, setMenyimpanPengaturan] = useState(false);
  const [sedangBayar, setSedangBayar] = useState<string | null>(null);

  async function generateTagihan() {
    setMenghasilkan(true);
    setError(null);
    setHasil(null);
    try {
      const response = await fetch("/api/admin/tagihan/generate", { method: "POST" });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Gagal membuat tagihan.");
        return;
      }
      setHasil(data);

      if (data.dibuat > 0) {
        const refresh = await fetch("/api/admin/tagihan");
        if (refresh.ok) {
          setDaftar(await refresh.json());
        }
      }
    } catch {
      setError("Tidak bisa terhubung ke server. Coba lagi.");
    } finally {
      setMenghasilkan(false);
    }
  }

  async function simpanPengaturan(event: React.FormEvent) {
    event.preventDefault();
    setMenyimpanPengaturan(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/pengaturan", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formPengaturan),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Gagal menyimpan pengaturan.");
        return;
      }
      setPengaturan(data);
      setEditPengaturan(false);
    } catch {
      setError("Tidak bisa terhubung ke server. Coba lagi.");
    } finally {
      setMenyimpanPengaturan(false);
    }
  }

  const sekarang = new Date();
  const namaBulanBerjalan = NAMA_BULAN[sekarang.getMonth()];

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-hijau-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-judul text-lg font-semibold text-ink">
              Nominal iuran saat ini: {formatRupiah(pengaturan.nominalIuranDefault)}
            </h2>
            <p className="mt-1 text-sm text-ink/70">
              Jatuh tempo otomatis tanggal {pengaturan.tanggalJatuhTempo} setiap bulan.
            </p>
          </div>
          {!editPengaturan && (
            <button
              type="button"
              onClick={() => {
                setFormPengaturan(pengaturan);
                setEditPengaturan(true);
              }}
              className="rounded border border-hijau-200 px-3 py-1.5 text-sm text-hijau-700 hover:border-hijau-600"
            >
              Ubah Nominal
            </button>
          )}
        </div>

        {editPengaturan && (
          <form onSubmit={simpanPengaturan} className="mt-4 flex flex-wrap items-end gap-4">
            <label className="flex flex-col gap-1 text-sm text-ink">
              Nominal iuran (Rp)
              <input
                type="number"
                min={1}
                required
                value={formPengaturan.nominalIuranDefault}
                onChange={(e) =>
                  setFormPengaturan({
                    ...formPengaturan,
                    nominalIuranDefault: Number(e.target.value),
                  })
                }
                className="input w-40"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-ink">
              Tanggal jatuh tempo
              <input
                type="number"
                min={1}
                max={28}
                required
                value={formPengaturan.tanggalJatuhTempo}
                onChange={(e) =>
                  setFormPengaturan({
                    ...formPengaturan,
                    tanggalJatuhTempo: Number(e.target.value),
                  })
                }
                className="input w-24"
              />
            </label>
            <button
              type="submit"
              disabled={menyimpanPengaturan}
              className="rounded bg-hijau-600 px-4 py-2 text-sm font-medium text-white hover:bg-hijau-700 disabled:opacity-60"
            >
              {menyimpanPengaturan ? "Menyimpan..." : "Simpan"}
            </button>
            <button
              type="button"
              onClick={() => setEditPengaturan(false)}
              className="rounded border border-hijau-200 px-4 py-2 text-sm text-ink hover:border-hijau-600"
            >
              Batal
            </button>
          </form>
        )}
      </div>

      <div className="rounded-lg border border-hijau-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-judul text-lg font-semibold text-ink">
              Generate Tagihan {namaBulanBerjalan} {sekarang.getFullYear()}
            </h2>
            <p className="mt-1 text-sm text-ink/70">
              Membuat tagihan untuk semua KK aktif yang belum ditagih bulan ini.
            </p>
          </div>
          <button
            type="button"
            onClick={generateTagihan}
            disabled={menghasilkan}
            className="rounded bg-sawo-500 px-4 py-2 text-sm font-medium text-white hover:bg-sawo-600 disabled:opacity-60"
          >
            {menghasilkan ? "Memproses..." : "Generate Tagihan Bulan Ini"}
          </button>
        </div>

        {hasil && (
          <p className="mt-4 rounded bg-hijau-50 px-3 py-2 text-sm text-hijau-700">
            Selesai: {hasil.dibuat} tagihan baru dibuat, {hasil.dilewati} KK
            dilewati karena sudah punya tagihan bulan ini (dari {hasil.totalKkAktif} KK aktif).
          </p>
        )}
      </div>

      {error && (
        <p role="alert" className="rounded bg-waspada-50 px-3 py-2 text-sm text-waspada-600">
          {error}
        </p>
      )}

      <div>
        <h2 className="font-judul text-lg font-semibold text-ink">Daftar Tagihan</h2>
        {daftar.length === 0 ? (
          <div className="mt-3 rounded-lg border border-dashed border-hijau-200 bg-white p-8 text-center">
            <p className="text-ink/70">Belum ada tagihan.</p>
            <p className="mt-1 text-sm text-ink/50">
              Klik &quot;Generate Tagihan Bulan Ini&quot; di atas setelah menambahkan data KK aktif.
            </p>
          </div>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-lg border border-hijau-200 bg-white">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-hijau-200 bg-hijau-50/50 text-ink/70">
                <tr>
                  <th className="px-4 py-3 font-medium">KK</th>
                  <th className="px-4 py-3 font-medium">Periode</th>
                  <th className="px-4 py-3 font-medium">Nominal</th>
                  <th className="px-4 py-3 font-medium">Jatuh Tempo</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {daftar.map((t) => (
                  <Fragment key={t.id}>
                    <tr className="border-b border-hijau-100 last:border-0">
                      <td className="px-4 py-3">
                        {t.kk.nama}
                        <span className="block text-xs text-ink/50">{t.kk.nomorKK}</span>
                      </td>
                      <td className="px-4 py-3">
                        {NAMA_BULAN[t.bulan - 1]} {t.tahun}
                      </td>
                      <td className="px-4 py-3">
                        {formatRupiah(t.nominal)}
                        {t.totalTerbayar > 0 && t.status !== "LUNAS" && (
                          <span className="block text-xs text-sawo-600">
                            Terbayar {formatRupiah(t.totalTerbayar)}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">{formatTanggal(t.jatuhTempo)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            t.status === "LUNAS"
                              ? "rounded bg-hijau-50 px-2 py-0.5 text-xs font-medium text-hijau-700"
                              : "rounded bg-waspada-50 px-2 py-0.5 text-xs font-medium text-waspada-600"
                          }
                        >
                          {t.status === "LUNAS" ? "Lunas" : "Belum Bayar"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {t.status !== "LUNAS" && (
                          <button
                            type="button"
                            onClick={() =>
                              setSedangBayar(sedangBayar === t.id ? null : t.id)
                            }
                            className="text-hijau-700 hover:underline"
                          >
                            {sedangBayar === t.id ? "Tutup" : "Catat Pembayaran"}
                          </button>
                        )}
                      </td>
                    </tr>
                    {sedangBayar === t.id && (
                      <tr>
                        <td colSpan={6} className="bg-paper px-4 py-4">
                          <CatatPembayaranForm
                            tagihanId={t.id}
                            sisa={t.nominal - t.totalTerbayar}
                            onBatal={() => setSedangBayar(null)}
                            onSukses={({ status, totalTerbayar: baru }) => {
                              setDaftar((prev) =>
                                prev.map((item) =>
                                  item.id === t.id
                                    ? { ...item, status, totalTerbayar: baru }
                                    : item
                                )
                              );
                              setSedangBayar(null);
                            }}
                          />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
