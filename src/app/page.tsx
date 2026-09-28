import Link from "next/link";
import { PublicHeader } from "@/components/PublicHeader";

export default function BerandaPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-12 sm:px-6">
        <div className="max-w-2xl">
          <h1 className="font-judul text-3xl font-semibold text-hijau-700 sm:text-4xl">
            Kas dan iuran warga, tercatat rapi dan terbuka untuk semua
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink/80">
            Aplikasi ini membantu pengurus RT/RW mencatat tagihan iuran bulanan,
            memantau tunggakan, mengelola kas umum lingkungan, dan membagikan
            pengumuman. Warga dapat melihat laporan kas kapan saja tanpa perlu
            akun.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/laporan"
            className="rounded-lg border border-hijau-200 bg-white p-5 transition-colors hover:border-hijau-600"
          >
            <h2 className="font-judul text-lg font-semibold text-hijau-700">
              Lihat Laporan Kas
            </h2>
            <p className="mt-2 text-sm text-ink/70">
              Saldo kas, rekap pemasukan-pengeluaran, dan status iuran warga.
              Terbuka untuk semua, tanpa perlu masuk akun.
            </p>
          </Link>

          <Link
            href="/masuk"
            className="rounded-lg border border-sawo-500/40 bg-white p-5 transition-colors hover:border-sawo-500"
          >
            <h2 className="font-judul text-lg font-semibold text-sawo-600">
              Masuk sebagai Pengurus
            </h2>
            <p className="mt-2 text-sm text-ink/70">
              Untuk bendahara/pengurus RT: kelola data warga, buat tagihan,
              catat pembayaran, dan buat pengumuman.
            </p>
          </Link>
        </div>
      </main>

      <footer className="border-t border-hijau-200/60 px-4 py-6 text-center text-xs text-ink/60 sm:px-6">
        Dikelola oleh pengurus RT/RW setempat.
      </footer>
    </div>
  );
}
