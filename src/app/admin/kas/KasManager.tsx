"use client";

import { useState } from "react";
import { formatRupiah, formatTanggal } from "@/lib/status";
import { denganSaldoBerjalan } from "@/lib/kas";

type Transaksi = {
  id: string;
  tanggal: string;
  jenis: string;
  kategori: string;
  uraian: string;
  jumlah: number;
  saldoBerjalan: number;
};

type FormState = {
  id: string | null;
  tanggal: string;
  jenis: "MASUK" | "KELUAR";
  kategori: string;
  uraian: string;
  jumlah: number;
};

function hariIni(): string {
  return new Date().toISOString().slice(0, 10);
}

const FORM_KOSONG: FormState = {
  id: null,
  tanggal: hariIni(),
  jenis: "MASUK",
  kategori: "",
  uraian: "",
  jumlah: 0,
};

export function KasManager({ dataAwal }: { dataAwal: Transaksi[] }) {
  const [daftar, setDaftar] = useState<Transaksi[]>(dataAwal);
  const [form, setForm] = useState<FormState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [menyimpan, setMenyimpan] = useState(false);
  const [memproses, setMemproses] = useState<string | null>(null);

  const sedangEdit = form?.id != null;
  const saldoAkhir = daftar.length > 0 ? daftar[daftar.length - 1].saldoBerjalan : 0;

  function hitungUlangSaldo(list: Omit<Transaksi, "saldoBerjalan">[]): Transaksi[] {
    const terurut = [...list].sort(
      (a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime()
    );
    return denganSaldoBerjalan(terurut);
  }

  function bukaFormTambah() {
    setForm({ ...FORM_KOSONG });
    setError(null);
  }

  function bukaFormEdit(t: Transaksi) {
    setForm({
      id: t.id,
      tanggal: t.tanggal.slice(0, 10),
      jenis: t.jenis as "MASUK" | "KELUAR",
      kategori: t.kategori,
      uraian: t.uraian,
      jumlah: t.jumlah,
    });
    setError(null);
  }

  async function simpanForm(event: React.FormEvent) {
    event.preventDefault();
    if (!form) return;
    setError(null);
    setMenyimpan(true);

    const payload = {
      tanggal: form.tanggal,
      jenis: form.jenis,
      kategori: form.kategori.trim(),
      uraian: form.uraian.trim(),
      jumlah: form.jumlah,
    };

    try {
      const response = await fetch(
        sedangEdit ? `/api/admin/kas/${form.id}` : "/api/admin/kas",
        {
          method: sedangEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Gagal menyimpan transaksi.");
        setMenyimpan(false);
        return;
      }

      setDaftar((prev) => {
        const tanpaSaldo = prev.map(({ saldoBerjalan: _s, ...rest }) => rest);
        const daftarBaru = sedangEdit
          ? tanpaSaldo.map((t) => (t.id === data.id ? data : t))
          : [...tanpaSaldo, data];
        return hitungUlangSaldo(daftarBaru);
      });
      setForm(null);
    } catch {
      setError("Tidak bisa terhubung ke server. Coba lagi.");
    } finally {
      setMenyimpan(false);
    }
  }

  async function hapusTransaksi(t: Transaksi) {
    const yakin = window.confirm(`Hapus transaksi "${t.uraian}"? Tindakan ini tidak bisa dibatalkan.`);
    if (!yakin) return;

    setMemproses(t.id);
    setError(null);
    try {
      const response = await fetch(`/api/admin/kas/${t.id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Gagal menghapus transaksi.");
        return;
      }
      setDaftar((prev) => {
        const sisa = prev.filter((item) => item.id !== t.id).map(({ saldoBerjalan: _s, ...rest }) => rest);
        return hitungUlangSaldo(sisa);
      });
    } catch {
      setError("Tidak bisa terhubung ke server. Coba lagi.");
    } finally {
      setMemproses(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-hijau-200 bg-white p-5">
        <p className="text-sm text-ink/70">Saldo kas umum saat ini</p>
        <p className="font-judul text-2xl font-semibold text-hijau-700">
          {formatRupiah(saldoAkhir)}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-ink/70">{daftar.length} transaksi tercatat</p>
        {!form && (
          <button
            type="button"
            onClick={bukaFormTambah}
            className="rounded bg-hijau-600 px-4 py-2 text-sm font-medium text-white hover:bg-hijau-700"
          >
            Tambah Transaksi
          </button>
        )}
      </div>

      {form && (
        <form
          onSubmit={simpanForm}
          className="flex flex-col gap-4 rounded-lg border border-hijau-200 bg-white p-5"
        >
          <h2 className="font-judul text-lg font-semibold text-ink">
            {sedangEdit ? "Ubah Transaksi" : "Tambah Transaksi Kas"}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm text-ink">
              Tanggal
              <input
                type="date"
                required
                value={form.tanggal}
                onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                className="input"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-ink">
              Jenis
              <select
                value={form.jenis}
                onChange={(e) => setForm({ ...form, jenis: e.target.value as "MASUK" | "KELUAR" })}
                className="input"
              >
                <option value="MASUK">Masuk</option>
                <option value="KELUAR">Keluar</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm text-ink">
              Kategori
              <input
                required
                placeholder="Kegiatan Warga, Perbaikan Fasilitas, dll"
                value={form.kategori}
                onChange={(e) => setForm({ ...form, kategori: e.target.value })}
                className="input"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-ink">
              Jumlah (Rp)
              <input
                type="number"
                min={1}
                required
                value={form.jumlah || ""}
                onChange={(e) => setForm({ ...form, jumlah: Number(e.target.value) })}
                className="input"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-ink sm:col-span-2">
              Uraian
              <input
                required
                value={form.uraian}
                onChange={(e) => setForm({ ...form, uraian: e.target.value })}
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
              {menyimpan ? "Menyimpan..." : "Simpan"}
            </button>
            <button
              type="button"
              onClick={() => setForm(null)}
              className="rounded border border-hijau-200 px-4 py-2 text-sm text-ink hover:border-hijau-600"
            >
              Batal
            </button>
          </div>
        </form>
      )}

      {!form && error && (
        <p role="alert" className="rounded bg-waspada-50 px-3 py-2 text-sm text-waspada-600">
          {error}
        </p>
      )}

      {daftar.length === 0 ? (
        <div className="rounded-lg border border-dashed border-hijau-200 bg-white p-8 text-center">
          <p className="text-ink/70">Belum ada transaksi kas umum.</p>
          <p className="mt-1 text-sm text-ink/50">
            Tambahkan transaksi pertama untuk mulai mencatat kas RT.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-hijau-200 bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-hijau-200 bg-hijau-50/50 text-ink/70">
              <tr>
                <th className="px-4 py-3 font-medium">Tanggal</th>
                <th className="px-4 py-3 font-medium">Jenis</th>
                <th className="px-4 py-3 font-medium">Kategori</th>
                <th className="px-4 py-3 font-medium">Uraian</th>
                <th className="px-4 py-3 font-medium">Jumlah</th>
                <th className="px-4 py-3 font-medium">Saldo</th>
                <th className="px-4 py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {[...daftar].reverse().map((t) => (
                <tr key={t.id} className="border-b border-hijau-100 last:border-0">
                  <td className="px-4 py-3">{formatTanggal(t.tanggal)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        t.jenis === "MASUK"
                          ? "rounded bg-hijau-50 px-2 py-0.5 text-xs font-medium text-hijau-700"
                          : "rounded bg-sawo-50 px-2 py-0.5 text-xs font-medium text-sawo-600"
                      }
                    >
                      {t.jenis === "MASUK" ? "Masuk" : "Keluar"}
                    </span>
                  </td>
                  <td className="px-4 py-3">{t.kategori}</td>
                  <td className="px-4 py-3">{t.uraian}</td>
                  <td className="px-4 py-3">
                    {t.jenis === "MASUK" ? "+" : "-"}
                    {formatRupiah(t.jumlah)}
                  </td>
                  <td className="px-4 py-3 font-medium">{formatRupiah(t.saldoBerjalan)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-3 text-sm">
                      <button
                        type="button"
                        onClick={() => bukaFormEdit(t)}
                        className="text-hijau-700 hover:underline"
                      >
                        Ubah
                      </button>
                      <button
                        type="button"
                        disabled={memproses === t.id}
                        onClick={() => hapusTransaksi(t)}
                        className="text-waspada-500 hover:underline disabled:opacity-50"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
