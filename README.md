# Kas RT/RW & Iuran Warga

Aplikasi web untuk pengurus RT/RW mengelola kas dan iuran warga: tagihan
iuran bulanan dibuat otomatis per KK, pencatatan pembayaran dan tunggakan,
laporan kas masuk-keluar yang bisa dilihat semua warga, serta pengumuman
lingkungan lewat tautan WhatsApp.

Lihat [`PRD.md`](./PRD.md) untuk latar belakang, ruang lingkup, dan detail
fitur secara lengkap.

## Fitur

- **Data warga**: kelola daftar kepala keluarga (KK) sebagai dasar penagihan.
- **Tagihan iuran otomatis**: satu tombol untuk membuat tagihan bulan
  berjalan bagi semua KK aktif yang belum ditagih, dengan nominal dan
  jatuh tempo yang bisa dikonfigurasi.
- **Pembayaran & tunggakan**: catat pembayaran per tagihan (mendukung
  cicilan), dan lihat daftar KK yang menunggak beserta totalnya.
- **Kas umum**: catat pemasukan/pengeluaran kas RT di luar iuran, dengan
  saldo berjalan.
- **Laporan publik**: halaman `/laporan` tanpa login, menampilkan saldo
  kas, rekap bulanan, dan status iuran per nomor KK (nama & alamat warga
  tidak ditampilkan, demi privasi).
- **Pengumuman & WhatsApp**: buat pengumuman, lalu bagikan lewat tautan
  `wa.me` yang sudah berisi pesan siap kirim per warga.

## Batasan Penting: Integrasi WhatsApp

Aplikasi ini **tidak** terhubung ke WhatsApp Business API resmi (tidak ada
kredensial yang tersedia). Fitur pengumuman menghasilkan tautan klik-kirim
`https://wa.me/<no_hp>?text=<pesan>` untuk tiap KK. Mengklik tautan hanya
membuka WhatsApp dengan draf pesan terisi; pengurus tetap harus menekan
tombol kirim secara manual, satu per satu. Tidak ada broadcast otomatis,
laporan terkirim/dibaca, atau balasan warga yang tertangkap sistem.

## Stack Teknis

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Prisma ORM + SQLite (`prisma/dev.db`, tanpa server database terpisah)
- Zod untuk validasi
- Autentikasi cookie sederhana untuk satu akun admin/bendahara

## Menjalankan di Lokal

1. **Salin berkas environment**

   ```bash
   cp .env.example .env
   ```

   Untuk penggunaan sungguhan, ganti `SESSION_SECRET` di `.env` dengan
   string acak yang panjang dan rahasia.

2. **Pasang dependensi**

   ```bash
   npm install
   ```

3. **Siapkan database & data contoh**

   ```bash
   npx prisma migrate dev
   npm run db:seed
   ```

   `db:seed` mengisi 15 data KK contoh, tagihan iuran 3 bulan terakhir
   (campuran lunas & menunggak), beberapa transaksi kas umum, dan satu
   contoh pengumuman.

4. **Jalankan aplikasi**

   ```bash
   npm run dev
   ```

   Buka [http://localhost:3000](http://localhost:3000).

## Kredensial Admin Default (dari seed)

- **Username**: `bendahara`
- **Password**: `RTRW-Warga-2026`

Ganti password ini (lewat data admin di database) sebelum aplikasi
dipakai oleh RT/RW sungguhan.

## Struktur Halaman

- `/` - beranda publik
- `/laporan` - laporan kas & iuran, publik, tanpa login
- `/masuk` - login pengurus
- `/admin` - dasbor pengurus (butuh login)
- `/admin/kk` - data kepala keluarga
- `/admin/tagihan` - generate & lihat tagihan iuran
- `/admin/tunggakan` - daftar tunggakan per KK
- `/admin/kas` - kas umum masuk-keluar
- `/admin/pengumuman` - buat pengumuman & tautan WhatsApp

## Build Produksi

```bash
npm run build
npm run start
```

## Catatan & Keterbatasan Lain

- Satu instance aplikasi ditujukan untuk satu RT/RW, dengan satu akun
  pengurus/bendahara.
- Tidak ada pembayaran daring (transfer/e-wallet/QRIS otomatis); pembayaran
  dicatat manual oleh pengurus berdasarkan bukti yang diterima.
- Database SQLite berbentuk berkas (`prisma/dev.db`); cadangkan berkas ini
  secara berkala karena belum ada mekanisme backup otomatis.

## Kontributor

- BenyRonald77
