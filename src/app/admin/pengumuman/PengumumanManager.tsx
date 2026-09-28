"use client";

import { useState } from "react";
import { formatTanggal } from "@/lib/status";
import { buatTautanWhatsapp } from "@/lib/whatsapp";

type Pengumuman = {
  id: string;
  judul: string;
  isi: string;
  tanggal: string;
};

type KK = {
  id: string;
  nama: string;
  nomorKK: string;
  noHp: string | null;
};

export function PengumumanManager({
  pengumumanAwal,
  kkAktif,
}: {
  pengumumanAwal: Pengumuman[];
  kkAktif: KK[];
}) {
  const [daftar, setDaftar] = useState<Pengumuman[]>(pengumumanAwal);
  const [judul, setJudul] = useState("");
  const [isi, setIsi] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [menyimpan, setMenyimpan] = useState(false);
  const [terbuka, setTerbuka] = useState<string | null>(null);

  const kkPunyaHp = kkAktif.filter((kk) => kk.noHp && kk.noHp.trim() !== "");
  const kkTanpaHp = kkAktif.filter((kk) => !kk.noHp || kk.noHp.trim() === "");

  async function buatPengumuman(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setMenyimpan(true);

    try {
      const response = await fetch("/api/admin/pengumuman", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ judul, isi }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Gagal membuat pengumuman.");
        setMenyimpan(false);
        return;
      }

      setDaftar((prev) => [data, ...prev]);
      setJudul("");
      setIsi("");
      setTerbuka(data.id);
    } catch {
      setError("Tidak bisa terhubung ke server. Coba lagi.");
    } finally {
      setMenyimpan(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={buatPengumuman}
        className="flex flex-col gap-4 rounded-lg border border-hijau-200 bg-white p-5"
      >
        <h2 className="font-judul text-lg font-semibold text-ink">Buat Pengumuman Baru</h2>
        <label className="flex flex-col gap-1 text-sm text-ink">
          Judul
          <input
            required
            value={judul}
            onChange={(e) => setJudul(e.target.value)}
            className="input"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-ink">
          Isi Pengumuman
          <textarea
            required
            rows={4}
            value={isi}
            onChange={(e) => setIsi(e.target.value)}
            className="input"
          />
        </label>

        {error && (
          <p role="alert" className="rounded bg-waspada-50 px-3 py-2 text-sm text-waspada-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={menyimpan}
          className="self-start rounded bg-hijau-600 px-4 py-2 text-sm font-medium text-white hover:bg-hijau-700 disabled:opacity-60"
        >
          {menyimpan ? "Menyimpan..." : "Buat Pengumuman"}
        </button>
      </form>

      <div>
        <h2 className="font-judul text-lg font-semibold text-ink">Riwayat Pengumuman</h2>

        {daftar.length === 0 ? (
          <div className="mt-3 rounded-lg border border-dashed border-hijau-200 bg-white p-8 text-center">
            <p className="text-ink/70">Belum ada pengumuman.</p>
            <p className="mt-1 text-sm text-ink/70">
              Buat pengumuman pertama menggunakan formulir di atas.
            </p>
          </div>
        ) : (
          <ul className="mt-3 flex flex-col gap-3">
            {daftar.map((p) => (
              <li key={p.id} className="rounded-lg border border-hijau-200 bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-judul text-base font-semibold text-ink">{p.judul}</h3>
                    <p className="text-xs text-ink/70">{formatTanggal(p.tanggal)}</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-ink/80">{p.isi}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTerbuka(terbuka === p.id ? null : p.id)}
                    className="shrink-0 rounded border border-hijau-600 px-3 py-1.5 text-sm text-hijau-700 hover:bg-hijau-50"
                  >
                    {terbuka === p.id ? "Sembunyikan Tautan" : "Bagikan via WhatsApp"}
                  </button>
                </div>

                {terbuka === p.id && (
                  <div className="mt-4 border-t border-hijau-100 pt-4">
                    <p className="text-sm text-ink/70">
                      Klik nama warga untuk membuka WhatsApp dengan pesan
                      sudah terisi, lalu tekan kirim secara manual.
                    </p>

                    {kkPunyaHp.length === 0 ? (
                      <p className="mt-3 text-sm text-ink/70">
                        Tidak ada KK aktif dengan nomor HP terdaftar.
                      </p>
                    ) : (
                      <ul className="mt-3 flex flex-col gap-2">
                        {kkPunyaHp.map((kk) => {
                          const pesan = `${p.judul}\n\n${p.isi}`;
                          const tautan = buatTautanWhatsapp(kk.noHp as string, pesan);
                          if (!tautan) return null;
                          return (
                            <li key={kk.id}>
                              <a
                                href={tautan}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between rounded border border-hijau-200 px-3 py-2 text-sm hover:border-hijau-600 hover:bg-hijau-50"
                              >
                                <span>
                                  {kk.nama}
                                  <span className="ml-2 text-xs text-ink/70">{kk.noHp}</span>
                                </span>
                                <span className="text-hijau-700">Kirim &rarr;</span>
                              </a>
                            </li>
                          );
                        })}
                      </ul>
                    )}

                    {kkTanpaHp.length > 0 && (
                      <p className="mt-3 text-xs text-ink/70">
                        {kkTanpaHp.length} KK aktif tidak punya nomor HP terdaftar dan
                        tidak bisa dikirimi tautan: {kkTanpaHp.map((kk) => kk.nama).join(", ")}.
                      </p>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
