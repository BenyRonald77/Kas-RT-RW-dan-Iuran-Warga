import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";
import { denganSaldoBerjalan } from "@/lib/kas";
import { AdminShell } from "@/components/AdminShell";
import { KasManager } from "./KasManager";

export default async function KasPage() {
  const admin = await getCurrentAdmin();
  const transaksi = await prisma.kasTransaksi.findMany({
    orderBy: [{ tanggal: "asc" }, { createdAt: "asc" }],
  });

  const dataDenganSaldo = denganSaldoBerjalan(
    transaksi.map((t) => ({
      id: t.id,
      tanggal: t.tanggal.toISOString(),
      jenis: t.jenis,
      kategori: t.kategori,
      uraian: t.uraian,
      jumlah: t.jumlah,
    }))
  );

  return (
    <AdminShell username={admin?.username ?? "Pengurus"}>
      <h1 className="font-judul text-2xl font-semibold text-ink">Kas Umum</h1>
      <p className="mt-1 text-sm text-ink/70">
        Catat pemasukan dan pengeluaran kas RT di luar iuran, misalnya untuk
        kegiatan warga atau perbaikan fasilitas.
      </p>

      <div className="mt-6">
        <KasManager dataAwal={dataDenganSaldo} />
      </div>
    </AdminShell>
  );
}
