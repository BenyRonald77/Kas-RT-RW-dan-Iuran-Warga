import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";
import { AdminShell } from "@/components/AdminShell";
import { KKManager } from "./KKManager";

export default async function DataWargaPage() {
  const admin = await getCurrentAdmin();
  const daftarKK = await prisma.kepalaKeluarga.findMany({
    orderBy: { nama: "asc" },
  });

  return (
    <AdminShell username={admin?.username ?? "Pengurus"}>
      <h1 className="font-judul text-2xl font-semibold text-ink">Data Warga (Kepala Keluarga)</h1>
      <p className="mt-1 text-sm text-ink/70">
        Kelola daftar KK sebagai dasar penagihan iuran bulanan. KK yang
        dinonaktifkan tidak akan ditagih pada generate tagihan berikutnya.
      </p>

      <div className="mt-6">
        <KKManager
          dataAwal={daftarKK.map((kk) => ({
            ...kk,
            createdAt: kk.createdAt.toISOString(),
            updatedAt: kk.updatedAt.toISOString(),
          }))}
        />
      </div>
    </AdminShell>
  );
}
