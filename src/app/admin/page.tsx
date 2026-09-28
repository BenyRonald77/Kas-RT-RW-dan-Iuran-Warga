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
        Ini adalah dasbor pengurus. Menu pengelolaan data warga, tagihan
        iuran, tunggakan, kas umum, dan pengumuman akan muncul di navigasi
        seiring fitur ditambahkan.
      </p>
    </AdminShell>
  );
}
