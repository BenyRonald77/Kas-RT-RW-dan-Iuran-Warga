import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";
import { getPengaturan } from "@/lib/pengaturan";
import { AdminShell } from "@/components/AdminShell";
import { TagihanManager } from "./TagihanManager";

export default async function TagihanPage() {
  const admin = await getCurrentAdmin();
  const [pengaturan, tagihan] = await Promise.all([
    getPengaturan(),
    prisma.tagihanIuran.findMany({
      include: { kk: true },
      orderBy: [{ tahun: "desc" }, { bulan: "desc" }, { kk: { nama: "asc" } }],
    }),
  ]);

  return (
    <AdminShell username={admin?.username ?? "Pengurus"}>
      <h1 className="font-judul text-2xl font-semibold text-ink">Tagihan Iuran</h1>
      <p className="mt-1 text-sm text-ink/70">
        Buat tagihan bulanan untuk seluruh KK aktif secara otomatis, dan
        pantau status tagihan yang sudah dibuat.
      </p>

      <div className="mt-6">
        <TagihanManager
          pengaturanAwal={pengaturan}
          tagihanAwal={tagihan.map((t) => ({
            id: t.id,
            bulan: t.bulan,
            tahun: t.tahun,
            nominal: t.nominal,
            jatuhTempo: t.jatuhTempo.toISOString(),
            status: t.status,
            kk: { id: t.kk.id, nama: t.kk.nama, nomorKK: t.kk.nomorKK },
          }))}
        />
      </div>
    </AdminShell>
  );
}
