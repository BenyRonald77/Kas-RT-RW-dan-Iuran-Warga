import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ADMIN_USERNAME = "bendahara";
const ADMIN_PASSWORD = "RTRW-Warga-2026";

const NOMINAL_IURAN = 50000;
const TANGGAL_JATUH_TEMPO = 10;

type DataKK = {
  nomorKK: string;
  nama: string;
  alamat: string;
  noHp: string | null;
  aktif: boolean;
};

const DAFTAR_KK: DataKK[] = [
  { nomorKK: "3501011200000001", nama: "Agus Setiawan", alamat: "Jl. Mawar No. 1, RT 03/RW 05", noHp: "081234560001", aktif: true },
  { nomorKK: "3501011200000002", nama: "Siti Nurhaliza", alamat: "Jl. Mawar No. 2, RT 03/RW 05", noHp: "081234560002", aktif: true },
  { nomorKK: "3501011200000003", nama: "Budi Santoso", alamat: "Jl. Mawar No. 3, RT 03/RW 05", noHp: "081234560003", aktif: true },
  { nomorKK: "3501011200000004", nama: "Dewi Lestari", alamat: "Jl. Mawar No. 4, RT 03/RW 05", noHp: "081234560004", aktif: true },
  { nomorKK: "3501011200000005", nama: "Hendra Gunawan", alamat: "Jl. Melati No. 1, RT 03/RW 05", noHp: "081234560005", aktif: true },
  { nomorKK: "3501011200000006", nama: "Rina Marlina", alamat: "Jl. Melati No. 2, RT 03/RW 05", noHp: "081234560006", aktif: true },
  { nomorKK: "3501011200000007", nama: "Joko Prasetyo", alamat: "Jl. Melati No. 3, RT 03/RW 05", noHp: "081234560007", aktif: true },
  { nomorKK: "3501011200000008", nama: "Ani Wijayanti", alamat: "Jl. Melati No. 4, RT 03/RW 05", noHp: "081234560008", aktif: true },
  { nomorKK: "3501011200000009", nama: "Bambang Purnomo", alamat: "Jl. Anggrek No. 1, RT 03/RW 05", noHp: "081234560009", aktif: true },
  { nomorKK: "3501011200000010", nama: "Yuliana Sari", alamat: "Jl. Anggrek No. 2, RT 03/RW 05", noHp: "081234560010", aktif: true },
  { nomorKK: "3501011200000011", nama: "Rudi Hartono", alamat: "Jl. Anggrek No. 3, RT 03/RW 05", noHp: "081234560011", aktif: true },
  { nomorKK: "3501011200000012", nama: "Wati Susanti", alamat: "Jl. Kenanga No. 1, RT 03/RW 05", noHp: "081234560012", aktif: true },
  { nomorKK: "3501011200000013", nama: "Eko Saputra", alamat: "Jl. Kenanga No. 2, RT 03/RW 05", noHp: "081234560013", aktif: true },
  { nomorKK: "3501011200000014", nama: "Fitriani", alamat: "Jl. Kenanga No. 3, RT 03/RW 05", noHp: null, aktif: true },
  { nomorKK: "3501011200000015", nama: "Slamet Riyadi", alamat: "Jl. Kenanga No. 4, RT 03/RW 05", noHp: "081234560015", aktif: false },
];

/** 0 = bulan berjalan, 1 = bulan lalu, 2 = dua bulan lalu, dst. */
function mundurBulan(jumlahBulan: number, dariTanggal = new Date()) {
  const bulanIndex0 = dariTanggal.getMonth() - jumlahBulan;
  const tahun = dariTanggal.getFullYear() + Math.floor(bulanIndex0 / 12);
  const bulan = ((bulanIndex0 % 12) + 12) % 12; // 0-11, aman untuk indeks negatif
  return { bulan: bulan + 1, tahun };
}

async function main() {
  // Admin
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await prisma.admin.upsert({
    where: { username: ADMIN_USERNAME },
    update: {},
    create: { username: ADMIN_USERNAME, passwordHash },
  });

  // Pengaturan
  await prisma.pengaturan.upsert({
    where: { id: "default" },
    update: { nominalIuranDefault: NOMINAL_IURAN, tanggalJatuhTempo: TANGGAL_JATUH_TEMPO },
    create: {
      id: "default",
      nominalIuranDefault: NOMINAL_IURAN,
      tanggalJatuhTempo: TANGGAL_JATUH_TEMPO,
    },
  });

  // Bersihkan data transaksional lama agar seed bisa dijalankan berkali-kali
  // tanpa menumpuk duplikat (KK tidak dihapus, cukup di-upsert).
  await prisma.pembayaran.deleteMany();
  await prisma.tagihanIuran.deleteMany();
  await prisma.kasTransaksi.deleteMany();
  await prisma.pengumuman.deleteMany();

  // Kepala Keluarga
  const kkTersimpan = new Map<string, string>(); // nomorKK -> id
  for (const kk of DAFTAR_KK) {
    const hasil = await prisma.kepalaKeluarga.upsert({
      where: { nomorKK: kk.nomorKK },
      update: { nama: kk.nama, alamat: kk.alamat, noHp: kk.noHp, aktif: kk.aktif },
      create: kk,
    });
    kkTersimpan.set(kk.nomorKK, hasil.id);
  }

  // Tagihan iuran untuk 3 bulan terakhir (bulan berjalan, bulan lalu, dua
  // bulan lalu), hanya untuk KK aktif. Pola pembayaran per KK (indeks 0-14):
  //   0-7  : lunas semua bulan
  //   8-10 : menunggak 1 bulan (bulan berjalan belum dibayar)
  //   11-12: menunggak 2 bulan (bulan lalu & berjalan belum dibayar)
  //   13   : menunggak semua bulan (belum bayar sama sekali)
  //   14   : nonaktif, tidak ditagih
  const periode = [mundurBulan(2), mundurBulan(1), mundurBulan(0)]; // lama -> baru

  for (let i = 0; i < DAFTAR_KK.length; i++) {
    const kk = DAFTAR_KK[i];
    if (!kk.aktif) continue;
    const kkId = kkTersimpan.get(kk.nomorKK)!;

    for (let p = 0; p < periode.length; p++) {
      const { bulan, tahun } = periode[p];
      const jatuhTempo = new Date(tahun, bulan - 1, TANGGAL_JATUH_TEMPO);

      let sudahBayar: boolean;
      if (i <= 7) sudahBayar = true;
      else if (i <= 10) sudahBayar = p < 2; // bulan berjalan (p=2) belum bayar
      else if (i <= 12) sudahBayar = p < 1; // dua bulan terakhir belum bayar
      else sudahBayar = false; // KK 13: tidak pernah bayar

      const tagihan = await prisma.tagihanIuran.create({
        data: {
          kkId,
          bulan,
          tahun,
          nominal: NOMINAL_IURAN,
          jatuhTempo,
          status: sudahBayar ? "LUNAS" : "BELUM_BAYAR",
        },
      });

      if (sudahBayar) {
        const tanggalBayar = new Date(tahun, bulan - 1, TANGGAL_JATUH_TEMPO - 3);
        await prisma.pembayaran.create({
          data: {
            tagihanId: tagihan.id,
            tanggal: tanggalBayar,
            jumlah: NOMINAL_IURAN,
            metode: i % 2 === 0 ? "Tunai" : "Transfer",
          },
        });
      }
    }
  }

  // Kas umum (di luar iuran)
  const duaBulanLalu = mundurBulan(2);
  const bulanLalu = mundurBulan(1);
  const bulanIni = mundurBulan(0);

  await prisma.kasTransaksi.createMany({
    data: [
      {
        tanggal: new Date(duaBulanLalu.tahun, duaBulanLalu.bulan - 1, 5),
        jenis: "MASUK",
        kategori: "Sumbangan",
        uraian: "Sumbangan warga untuk taman RT",
        jumlah: 500000,
      },
      {
        tanggal: new Date(duaBulanLalu.tahun, duaBulanLalu.bulan - 1, 20),
        jenis: "KELUAR",
        kategori: "Kegiatan Warga",
        uraian: "Konsumsi kerja bakti bulanan",
        jumlah: 150000,
      },
      {
        tanggal: new Date(bulanLalu.tahun, bulanLalu.bulan - 1, 10),
        jenis: "MASUK",
        kategori: "Sumbangan",
        uraian: "Donasi acara warga",
        jumlah: 300000,
      },
      {
        tanggal: new Date(bulanLalu.tahun, bulanLalu.bulan - 1, 18),
        jenis: "KELUAR",
        kategori: "Perbaikan Fasilitas",
        uraian: "Perbaikan lampu jalan",
        jumlah: 250000,
      },
      {
        tanggal: new Date(bulanIni.tahun, bulanIni.bulan - 1, 5),
        jenis: "KELUAR",
        kategori: "Kegiatan Warga",
        uraian: "Santunan anak yatim",
        jumlah: 200000,
      },
      {
        tanggal: new Date(bulanIni.tahun, bulanIni.bulan - 1, 12),
        jenis: "MASUK",
        kategori: "Sumbangan",
        uraian: "Sumbangan sponsor acara warga",
        jumlah: 400000,
      },
    ],
  });

  // Pengumuman contoh
  await prisma.pengumuman.create({
    data: {
      judul: "Kerja Bakti Bulanan",
      isi:
        "Mohon partisipasi seluruh warga untuk kerja bakti membersihkan " +
        "lingkungan RT pada hari Minggu, pukul 07.00 WIB. Peralatan " +
        "kebersihan disediakan pengurus, mohon bawa sarung tangan masing-masing.",
    },
  });

  console.log("Seed selesai.");
  console.log(`Akun admin: ${ADMIN_USERNAME} / ${ADMIN_PASSWORD}`);
  console.log(`${DAFTAR_KK.length} KK, 3 bulan tagihan iuran, 6 transaksi kas, 1 pengumuman.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
