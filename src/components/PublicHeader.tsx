import Link from "next/link";

/**
 * Header untuk halaman publik (beranda, laporan). Sengaja sederhana dan
 * berbasis teks (bukan logo buatan) karena tidak ada aset identitas resmi
 * yang diberikan (lihat R-23: tidak membuat logo tanpa instruksi).
 */
export function PublicHeader() {
  return (
    <header className="border-b border-hijau-200/60">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <Link href="/" className="font-judul text-lg font-semibold text-hijau-700">
          Kas RT/RW &amp; Iuran Warga
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/laporan" className="text-ink hover:text-hijau-700 hover:underline">
            Laporan Publik
          </Link>
          <Link
            href="/masuk"
            className="rounded border border-hijau-600 px-3 py-1.5 text-hijau-700 hover:bg-hijau-50"
          >
            Masuk Pengurus
          </Link>
        </nav>
      </div>
    </header>
  );
}
