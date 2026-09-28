import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "./LoginForm";

export default function MasukPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-4 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-judul text-lg font-semibold text-hijau-700">
          Kas RT/RW &amp; Iuran Warga
        </Link>
        <h1 className="mt-6 font-judul text-2xl font-semibold text-ink">
          Masuk Pengurus
        </h1>
        <p className="mt-1 text-sm text-ink/70">
          Khusus untuk bendahara/pengurus RT yang mengelola data.
        </p>

        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>

        <p className="mt-6 text-center text-sm">
          <Link href="/laporan" className="text-hijau-700 hover:underline">
            Kembali ke Laporan Publik
          </Link>
        </p>
      </div>
    </div>
  );
}
