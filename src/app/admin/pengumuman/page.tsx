import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";
import { AdminShell } from "@/components/AdminShell";
import { PengumumanManager } from "./PengumumanManager";

export default async function PengumumanPage() {
  const admin = await getCurrentAdmin();

  const [pengumuman, kkAktif] = await Promise.all([
    prisma.pengumuman.findMany({ orderBy: { tanggal: "desc" } }),
    prisma.kepalaKeluarga.findMany({
      where: { aktif: true },
      orderBy: { nama: "asc" },
      select: { id: true, nama: true, nomorKK: true, noHp: true },
    }),
  ]);

  return (
    <AdminShell username={admin?.username ?? "Pengurus"}>
      <h1 className="font-judul text-2xl font-semibold text-ink">Pengumuman</h1>
      <p className="mt-1 text-sm text-ink/70">
        Buat pengumuman untuk warga, lalu bagikan lewat WhatsApp menggunakan
        tautan klik-kirim.
      </p>

      <div className="mt-3 rounded-lg border border-sawo-500/30 bg-sawo-50 p-4 text-sm text-ink/80">
        <strong className="text-sawo-600">Catatan:</strong> aplikasi ini tidak
        terhubung ke WhatsApp Business API resmi. Setiap tautan di bawah
        hanya membuka WhatsApp dengan draf pesan yang sudah terisi. Anda
        tetap harus membuka tautan dan menekan tombol kirim secara manual,
        satu per satu untuk setiap warga.
      </div>

      <div className="mt-6">
        <PengumumanManager
          pengumumanAwal={pengumuman.map((p) => ({
            ...p,
            tanggal: p.tanggal.toISOString(),
          }))}
          kkAktif={kkAktif}
        />
      </div>
    </AdminShell>
  );
}
