import Link from "next/link";
import { getCurrentAdmin } from "@/lib/auth";
import { AdminShell } from "@/components/AdminShell";

export default async function AdminDashboardPage() {
  // Middleware sudah memastikan hanya sesi valid yang sampai ke sini.
  const admin = await getCurrentAdmin();
  const username = admin?.username ?? "Pengurus";

  return (
    <AdminShell username={username}>
      <h1 className="font-judul text-2xl font-semibold text-ink">
        Selamat datang, {username}
      </h1>
      <p className="mt-2 max-w-xl text-sm text-ink/70">
        Menu pengelolaan lain akan muncul di navigasi seiring fitur
        ditambahkan.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/kk"
          className="rounded-lg border border-hijau-200 bg-white p-5 hover:border-hijau-600"
        >
          <h2 className="font-judul text-lg font-semibold text-hijau-700">Data Warga</h2>
          <p className="mt-2 text-sm text-ink/70">
            Kelola daftar kepala keluarga sebagai dasar penagihan iuran.
          </p>
        </Link>

        <Link
          href="/admin/tagihan"
          className="rounded-lg border border-hijau-200 bg-white p-5 hover:border-hijau-600"
        >
          <h2 className="font-judul text-lg font-semibold text-hijau-700">Tagihan Iuran</h2>
          <p className="mt-2 text-sm text-ink/70">
            Generate tagihan bulanan otomatis dan lihat status tagihan.
          </p>
        </Link>

        <Link
          href="/admin/tunggakan"
          className="rounded-lg border border-hijau-200 bg-white p-5 hover:border-hijau-600"
        >
          <h2 className="font-judul text-lg font-semibold text-hijau-700">Tunggakan</h2>
          <p className="mt-2 text-sm text-ink/70">
            Lihat KK yang menunggak dan catat pembayarannya.
          </p>
        </Link>
      </div>
    </AdminShell>
  );
}
