import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";
import { totalTerbayar } from "@/lib/tagihan";
import { AdminShell } from "@/components/AdminShell";
import { TunggakanManager } from "./TunggakanManager";

export default async function TunggakanPage() {
  const admin = await getCurrentAdmin();

  const tagihanTunggakan = await prisma.tagihanIuran.findMany({
    where: {
      status: "BELUM_BAYAR",
      jatuhTempo: { lt: new Date() },
    },
    include: { kk: true, pembayaran: true },
    orderBy: [{ kk: { nama: "asc" } }, { tahun: "asc" }, { bulan: "asc" }],
  });

  const data = tagihanTunggakan.map((t) => ({
    id: t.id,
    bulan: t.bulan,
    tahun: t.tahun,
    nominal: t.nominal,
    jatuhTempo: t.jatuhTempo.toISOString(),
    totalTerbayar: totalTerbayar(t.pembayaran),
    kk: { id: t.kk.id, nama: t.kk.nama, nomorKK: t.kk.nomorKK },
  }));

  return (
    <AdminShell username={admin?.username ?? "Pengurus"}>
      <h1 className="font-judul text-2xl font-semibold text-ink">Daftar Tunggakan</h1>
      <p className="mt-1 text-sm text-ink/70">
        Tagihan yang belum lunas dan sudah lewat jatuh tempo, dikelompokkan
        per KK.
      </p>

      <div className="mt-6">
        <TunggakanManager dataAwal={data} />
      </div>
    </AdminShell>
  );
}
