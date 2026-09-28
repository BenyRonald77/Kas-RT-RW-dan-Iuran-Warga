"use client";

import { useMemo, useState } from "react";
import { NAMA_BULAN, formatRupiah, formatTanggal } from "@/lib/status";
import { CatatPembayaranForm } from "@/components/CatatPembayaranForm";

type TagihanTunggakan = {
  id: string;
  bulan: number;
  tahun: number;
  nominal: number;
  jatuhTempo: string;
  totalTerbayar: number;
  kk: { id: string; nama: string; nomorKK: string };
};

export function TunggakanManager({ dataAwal }: { dataAwal: TagihanTunggakan[] }) {
  const [daftar, setDaftar] = useState<TagihanTunggakan[]>(dataAwal);
  const [sedangBayar, setSedangBayar] = useState<string | null>(null);

  const kelompok = useMemo(() => {
    const map = new Map<
      string,
      { kk: TagihanTunggakan["kk"]; tagihan: TagihanTunggakan[]; total: number }
    >();

    for (const t of daftar) {
      const sisa = t.nominal - t.totalTerbayar;
      const existing = map.get(t.kk.id);
      if (existing) {
        existing.tagihan.push(t);
        existing.total += sisa;
      } else {
        map.set(t.kk.id, { kk: t.kk, tagihan: [t], total: sisa });
      }
    }

    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [daftar]);

  function perbaruiSetelahBayar(tagihanId: string, status: string, totalTerbayarBaru: number) {
    if (status === "LUNAS") {
      // Lunas berarti tidak lagi menunggak, keluarkan dari daftar.
      setDaftar((prev) => prev.filter((t) => t.id !== tagihanId));
    } else {
      // Pembayaran sebagian: perbarui sisa tunggakan, tetap tampil di daftar.
      setDaftar((prev) =>
        prev.map((t) => (t.id === tagihanId ? { ...t, totalTerbayar: totalTerbayarBaru } : t))
      );
    }
    setSedangBayar(null);
  }

  if (daftar.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-hijau-200 bg-white p-8 text-center">
        <p className="text-ink/70">Tidak ada tunggakan saat ini.</p>
        <p className="mt-1 text-sm text-ink/70">
          Semua tagihan yang sudah jatuh tempo telah lunas. Kerja bagus.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-ink/70">
        {kelompok.length} KK menunggak, total{" "}
        <strong>{formatRupiah(kelompok.reduce((a, k) => a + k.total, 0))}</strong>
      </p>

      {kelompok.map(({ kk, tagihan, total }) => (
        <div key={kk.id} className="rounded-lg border border-waspada-500/30 bg-white p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-judul text-lg font-semibold text-ink">
              {kk.nama}
              <span className="ml-2 text-sm font-normal text-ink/70">{kk.nomorKK}</span>
            </h2>
            <p className="text-sm font-medium text-waspada-600">
              Total tunggakan: {formatRupiah(total)}
            </p>
          </div>

          <ul className="mt-3 flex flex-col gap-2">
            {tagihan.map((t) => {
              const sisa = t.nominal - t.totalTerbayar;
              return (
                <li key={t.id} className="rounded border border-waspada-500/20 bg-waspada-50/40 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span>
                      {NAMA_BULAN[t.bulan - 1]} {t.tahun} &middot; jatuh tempo{" "}
                      {formatTanggal(t.jatuhTempo)}
                    </span>
                    <span className="flex items-center gap-3">
                      <span className="font-medium text-waspada-600">{formatRupiah(sisa)}</span>
                      <button
                        type="button"
                        onClick={() => setSedangBayar(sedangBayar === t.id ? null : t.id)}
                        className="text-hijau-700 hover:underline"
                      >
                        {sedangBayar === t.id ? "Tutup" : "Catat Pembayaran"}
                      </button>
                    </span>
                  </div>

                  {sedangBayar === t.id && (
                    <div className="mt-3">
                      <CatatPembayaranForm
                        tagihanId={t.id}
                        sisa={sisa}
                        onBatal={() => setSedangBayar(null)}
                        onSukses={({ status, totalTerbayar: baru }) =>
                          perbaruiSetelahBayar(t.id, status, baru)
                        }
                      />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
