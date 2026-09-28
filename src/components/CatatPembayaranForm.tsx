"use client";

import { useState } from "react";
import { formatRupiah } from "@/lib/status";

type Props = {
  tagihanId: string;
  sisa: number;
  onBatal: () => void;
  onSukses: (hasil: { status: string; totalTerbayar: number }) => void;
};

function hariIni(): string {
  return new Date().toISOString().slice(0, 10);
}

export function CatatPembayaranForm({ tagihanId, sisa, onBatal, onSukses }: Props) {
  const [tanggal, setTanggal] = useState(hariIni());
  const [jumlah, setJumlah] = useState(sisa);
  const [metode, setMetode] = useState("Tunai");
  const [catatan, setCatatan] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [menyimpan, setMenyimpan] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setMenyimpan(true);

    try {
      const response = await fetch("/api/admin/pembayaran", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tagihanId, tanggal, jumlah, metode, catatan }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Gagal mencatat pembayaran.");
        setMenyimpan(false);
        return;
      }

      onSukses({ status: data.tagihan.status, totalTerbayar: data.totalTerbayar });
    } catch {
      setError("Tidak bisa terhubung ke server. Coba lagi.");
      setMenyimpan(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded border border-sawo-500/30 bg-sawo-50 p-4"
    >
      <p className="text-sm text-ink/70">
        Sisa tagihan: <strong>{formatRupiah(sisa)}</strong>
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm text-ink">
          Tanggal Bayar
          <input
            type="date"
            required
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            className="input"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-ink">
          Jumlah (Rp)
          <input
            type="number"
            min={1}
            required
            value={jumlah}
            onChange={(e) => setJumlah(Number(e.target.value))}
            className="input"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-ink">
          Metode
          <select value={metode} onChange={(e) => setMetode(e.target.value)} className="input">
            <option value="Tunai">Tunai</option>
            <option value="Transfer">Transfer</option>
            <option value="Lainnya">Lainnya</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm text-ink sm:col-span-2">
          Catatan (opsional)
          <input
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            className="input"
          />
        </label>
      </div>

      {error && (
        <p role="alert" className="rounded bg-waspada-50 px-3 py-2 text-sm text-waspada-600">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={menyimpan}
          className="rounded bg-hijau-600 px-4 py-2 text-sm font-medium text-white hover:bg-hijau-700 disabled:opacity-60"
        >
          {menyimpan ? "Menyimpan..." : "Simpan Pembayaran"}
        </button>
        <button
          type="button"
          onClick={onBatal}
          className="rounded border border-hijau-200 px-4 py-2 text-sm text-ink hover:border-hijau-600"
        >
          Batal
        </button>
      </div>
    </form>
  );
}
