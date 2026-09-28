"use client";

import { useState } from "react";

type KK = {
  id: string;
  nomorKK: string;
  nama: string;
  alamat: string;
  noHp: string | null;
  aktif: boolean;
  createdAt: string;
  updatedAt: string;
};

type FormState = {
  id: string | null;
  nomorKK: string;
  nama: string;
  alamat: string;
  noHp: string;
  aktif: boolean;
};

const FORM_KOSONG: FormState = {
  id: null,
  nomorKK: "",
  nama: "",
  alamat: "",
  noHp: "",
  aktif: true,
};

export function KKManager({ dataAwal }: { dataAwal: KK[] }) {
  const [daftar, setDaftar] = useState<KK[]>(dataAwal);
  const [form, setForm] = useState<FormState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [menyimpan, setMenyimpan] = useState(false);
  const [memproses, setMemproses] = useState<string | null>(null); // id yang sedang diubah/dihapus

  const sedangEdit = form?.id != null;

  function bukaFormTambah() {
    setForm({ ...FORM_KOSONG });
    setError(null);
  }

  function bukaFormEdit(kk: KK) {
    setForm({
      id: kk.id,
      nomorKK: kk.nomorKK,
      nama: kk.nama,
      alamat: kk.alamat,
      noHp: kk.noHp ?? "",
      aktif: kk.aktif,
    });
    setError(null);
  }

  function tutupForm() {
    setForm(null);
    setError(null);
  }

  async function simpanForm(event: React.FormEvent) {
    event.preventDefault();
    if (!form) return;
    setError(null);
    setMenyimpan(true);

    const payload = {
      nomorKK: form.nomorKK.trim(),
      nama: form.nama.trim(),
      alamat: form.alamat.trim(),
      noHp: form.noHp.trim(),
      aktif: form.aktif,
    };

    try {
      const response = await fetch(
        sedangEdit ? `/api/admin/kk/${form.id}` : "/api/admin/kk",
        {
          method: sedangEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Gagal menyimpan data.");
        setMenyimpan(false);
        return;
      }

      setDaftar((prev) => {
        if (sedangEdit) {
          return prev
            .map((kk) => (kk.id === data.id ? data : kk))
            .sort((a, b) => a.nama.localeCompare(b.nama));
        }
        return [...prev, data].sort((a, b) => a.nama.localeCompare(b.nama));
      });
      setForm(null);
    } catch {
      setError("Tidak bisa terhubung ke server. Coba lagi.");
    } finally {
      setMenyimpan(false);
    }
  }

  async function ubahStatusAktif(kk: KK) {
    setMemproses(kk.id);
    setError(null);
    try {
      const response = await fetch(`/api/admin/kk/${kk.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aktif: !kk.aktif }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Gagal mengubah status.");
        return;
      }
      setDaftar((prev) => prev.map((item) => (item.id === kk.id ? data : item)));
    } catch {
      setError("Tidak bisa terhubung ke server. Coba lagi.");
    } finally {
      setMemproses(null);
    }
  }

  async function hapusKK(kk: KK) {
    const yakin = window.confirm(
      `Hapus data KK "${kk.nama}" (${kk.nomorKK})? Tindakan ini tidak bisa dibatalkan.`
    );
    if (!yakin) return;

    setMemproses(kk.id);
    setError(null);
    try {
      const response = await fetch(`/api/admin/kk/${kk.id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Gagal menghapus data.");
        return;
      }
      setDaftar((prev) => prev.filter((item) => item.id !== kk.id));
    } catch {
      setError("Tidak bisa terhubung ke server. Coba lagi.");
    } finally {
      setMemproses(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink/70">{daftar.length} KK terdaftar</p>
        {!form && (
          <button
            type="button"
            onClick={bukaFormTambah}
            className="rounded bg-hijau-600 px-4 py-2 text-sm font-medium text-white hover:bg-hijau-700"
          >
            Tambah KK
          </button>
        )}
      </div>

      {form && (
        <form
          onSubmit={simpanForm}
          className="flex flex-col gap-4 rounded-lg border border-hijau-200 bg-white p-5"
        >
          <h2 className="font-judul text-lg font-semibold text-ink">
            {sedangEdit ? "Ubah Data KK" : "Tambah KK Baru"}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nomor KK">
              <input
                required
                value={form.nomorKK}
                onChange={(e) => setForm({ ...form, nomorKK: e.target.value })}
                className="input"
              />
            </Field>
            <Field label="Nama Kepala Keluarga">
              <input
                required
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                className="input"
              />
            </Field>
            <Field label="Alamat" className="sm:col-span-2">
              <input
                required
                value={form.alamat}
                onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                className="input"
              />
            </Field>
            <Field label="No HP (untuk WhatsApp)">
              <input
                value={form.noHp}
                onChange={(e) => setForm({ ...form, noHp: e.target.value })}
                placeholder="08xxxxxxxxxx"
                className="input"
              />
            </Field>
            {sedangEdit && (
              <label className="flex items-center gap-2 self-end pb-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={form.aktif}
                  onChange={(e) => setForm({ ...form, aktif: e.target.checked })}
                  className="h-4 w-4 rounded border-hijau-300"
                />
                KK aktif (ditagih iuran)
              </label>
            )}
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
              onClick={tutupForm}
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
          <p className="text-ink/70">Belum ada data KK.</p>
          <p className="mt-1 text-sm text-ink/70">
            Tambahkan KK pertama untuk mulai membuat tagihan iuran.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-hijau-200 bg-white">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-hijau-200 bg-hijau-50/50 text-ink/70">
              <tr>
                <th className="px-4 py-3 font-medium">Nomor KK</th>
                <th className="px-4 py-3 font-medium">Nama</th>
                <th className="px-4 py-3 font-medium">Alamat</th>
                <th className="px-4 py-3 font-medium">No HP</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {daftar.map((kk) => (
                <tr key={kk.id} className="border-b border-hijau-100 last:border-0">
                  <td className="px-4 py-3">{kk.nomorKK}</td>
                  <td className="px-4 py-3">{kk.nama}</td>
                  <td className="px-4 py-3">{kk.alamat}</td>
                  <td className="px-4 py-3">{kk.noHp || "-"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        kk.aktif
                          ? "rounded bg-hijau-50 px-2 py-0.5 text-xs font-medium text-hijau-700"
                          : "rounded bg-ink/5 px-2 py-0.5 text-xs font-medium text-ink/70"
                      }
                    >
                      {kk.aktif ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-3 text-sm">
                      <button
                        type="button"
                        onClick={() => bukaFormEdit(kk)}
                        className="text-hijau-700 hover:underline"
                      >
                        Ubah
                      </button>
                      <button
                        type="button"
                        disabled={memproses === kk.id}
                        onClick={() => ubahStatusAktif(kk)}
                        className="text-sawo-600 hover:underline disabled:opacity-50"
                      >
                        {kk.aktif ? "Nonaktifkan" : "Aktifkan"}
                      </button>
                      <button
                        type="button"
                        disabled={memproses === kk.id}
                        onClick={() => hapusKK(kk)}
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

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1 text-sm text-ink ${className ?? ""}`}>
      {label}
      {children}
    </label>
  );
}
