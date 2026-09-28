# PRD — Aplikasi Kas RT/RW dan Iuran Warga

## 1. Latar Belakang & Tujuan

Pengelolaan kas RT/RW dan iuran warga di sebagian besar lingkungan masih dilakukan secara manual: dicatat di buku kas, diingatkan lewat grup WhatsApp, dan direkap ulang setiap kali ada yang bertanya "kas kita sekarang berapa?" atau "siapa saja yang belum bayar iuran bulan ini?". Cara ini rawan salah catat, sulit ditelusuri, dan tidak transparan bagi warga karena laporan keuangan jarang dipublikasikan secara rutin.

Aplikasi ini dibangun untuk membantu pengurus RT/RW (khususnya bendahara) mengelola:
1. Data kepala keluarga (KK) sebagai basis penagihan.
2. Tagihan iuran bulanan yang dibuat otomatis setiap bulan, bukan diketik manual satu per satu.
3. Pencatatan pembayaran dan pemantauan tunggakan secara akurat.
4. Kas umum RT (pemasukan/pengeluaran di luar iuran, misalnya untuk kegiatan warga, perbaikan fasilitas, dll).
5. Laporan kas yang bisa dilihat semua warga tanpa perlu login, agar pengelolaan uang bersama tetap transparan.
6. Pengumuman lingkungan yang bisa disebarkan lewat WhatsApp menggunakan tautan klik-kirim (bukan API resmi, karena keterbatasan yang dijelaskan di Ruang Lingkup).

Tujuan utama: membuat pengelolaan kas RT/RW lebih rapi, akurat, dan transparan, dengan effort minimum dari pengurus dan tanpa biaya infrastruktur/API berbayar.

## 2. Target Pengguna

### 2.1 Pengurus RT/RW (Bendahara/Admin)
- Satu akun admin (bendahara) yang login untuk mengelola data.
- Kebutuhan: input data warga sekali, generate tagihan otomatis tiap bulan, catat pembayaran dengan cepat, tahu siapa yang menunggak, catat kas umum, buat pengumuman dan sebarkan ke warga.
- Karakteristik: tidak selalu melek teknologi tinggi, butuh alur kerja yang sederhana dan jelas, bekerja dari HP maupun laptop.

### 2.2 Warga (Publik, tanpa login)
- Warga biasa yang ingin tahu kondisi kas RT/RW dan status iuran secara umum, tanpa perlu akun.
- Kebutuhan: melihat saldo kas, rekap pemasukan-pengeluaran, dan rekap status iuran (berapa KK lunas/belum) secara ringkas dan mudah dibaca, tanpa membuka data pribadi warga lain secara berlebihan.
- Karakteristik: mengakses dari HP, sering hanya sekali lihat lalu keluar, butuh tampilan yang cepat dipahami tanpa istilah teknis.

## 3. Ruang Lingkup

### 3.1 Termasuk dalam Ruang Lingkup
- Manajemen data kepala keluarga (KK): tambah, ubah, nonaktifkan, hapus.
- Generate tagihan iuran bulanan otomatis untuk semua KK aktif yang belum memiliki tagihan pada bulan berjalan.
- Pencatatan pembayaran iuran per tagihan, dengan status otomatis (BELUM_BAYAR / LUNAS).
- Halaman daftar tunggakan (tagihan belum bayar yang sudah lewat jatuh tempo), dikelompokkan per KK.
- Pencatatan kas umum RT (pemasukan dan pengeluaran di luar iuran) dengan laporan saldo berjalan.
- Laporan publik read-only (tanpa login) berisi ringkasan saldo kas, rekap kas masuk-keluar per bulan, dan rekap status iuran, dengan penyamaran sebagian data pribadi (nomor KK ditampilkan, bukan nama lengkap + alamat lengkap).
- Fitur pengumuman: admin membuat pengumuman (judul + isi), sistem menghasilkan daftar tautan WhatsApp klik-kirim (`wa.me`) per KK yang punya nomor HP, untuk dikirim manual oleh admin satu per satu.
- Autentikasi sederhana berbasis cookie untuk satu akun admin/bendahara.
- Seed data contoh agar aplikasi bisa langsung dicoba/didemokan.

### 3.2 Tidak Termasuk dalam Ruang Lingkup (Batasan)
- **Integrasi resmi WhatsApp Business API**: aplikasi ini TIDAK terhubung ke WhatsApp Business API, Meta Cloud API, atau penyedia pihak ketiga (mis. Twilio, Fonnte, dll) karena tidak tersedia kredensial resmi. Pengumuman WhatsApp diimplementasikan sepenuhnya sebagai **tautan klik-kirim** (`https://wa.me/<no_hp>?text=<pesan terenkode>`) yang membuka aplikasi WhatsApp milik admin dengan draf pesan sudah terisi. Admin tetap harus menekan tombol "Kirim" di WhatsApp secara manual, satu per satu, untuk setiap warga. Tidak ada pengiriman otomatis massal, tidak ada laporan terkirim/dibaca, dan tidak ada balasan warga yang tertangkap otomatis oleh sistem.
- Tidak ada pembayaran online/payment gateway (transfer bank, e-wallet, QRIS) — pencatatan pembayaran bersifat manual berdasarkan bukti yang diterima admin.
- Tidak ada multi-RT/multi-RW dalam satu instance (aplikasi ini didesain untuk satu wilayah RT/RW).
- Tidak ada multi-level role (misal ketua RT, sekretaris, bendahara terpisah) pada versi ini — hanya satu akun admin/bendahara.
- Tidak ada notifikasi push/email otomatis.
- Tidak ada aplikasi mobile native — hanya web app responsif.
- Tidak ada fitur ekspor PDF/Excel pada versi ini (dapat menjadi pengembangan lanjutan).

## 4. Daftar Fitur & User Story

### F1. CRUD Data Kepala Keluarga (KK)
- **US1**: Sebagai bendahara, saya ingin menambah data KK baru (nomor KK, nama, alamat, no HP, status aktif) agar bisa ditagih iuran.
- **US2**: Sebagai bendahara, saya ingin mengubah/menonaktifkan data KK yang pindah atau sudah tidak aktif, agar tidak lagi ditagih di generate berikutnya.
- **US3**: Sebagai bendahara, saya ingin melihat daftar seluruh KK dengan status aktif/nonaktif agar mudah mengelola.

### F2. Generate Tagihan Iuran Bulanan Otomatis
- **US4**: Sebagai bendahara, saya ingin menekan tombol "Generate Tagihan Bulan Ini" agar sistem otomatis membuat tagihan untuk semua KK aktif yang belum memiliki tagihan pada bulan dan tahun berjalan, dengan nominal default dan jatuh tempo tanggal 10.
- **US5**: Sebagai bendahara, saya ingin nominal iuran default bisa dikonfigurasi, agar bisa disesuaikan bila ada perubahan kesepakatan warga.
- **US6**: Sistem tidak boleh membuat tagihan duplikat untuk KK yang sudah punya tagihan bulan/tahun yang sama.

### F3. Pencatatan Pembayaran & Tunggakan
- **US7**: Sebagai bendahara, saya ingin mencatat pembayaran terhadap sebuah tagihan (tanggal, jumlah, metode, catatan) agar status tagihan otomatis berubah menjadi LUNAS ketika jumlah terbayar mencukupi.
- **US8**: Sebagai bendahara, saya ingin melihat daftar tunggakan: tagihan berstatus BELUM_BAYAR yang sudah lewat jatuh tempo, dikelompokkan per KK dan diakumulasi totalnya.
- **US9**: Sebagai bendahara, saya ingin melihat riwayat pembayaran per KK untuk keperluan verifikasi.

### F4. Kas Umum Masuk-Keluar
- **US10**: Sebagai bendahara, saya ingin mencatat transaksi kas umum (tanggal, jenis MASUK/KELUAR, kategori, uraian, jumlah) di luar iuran, misalnya untuk kegiatan warga atau perbaikan fasilitas.
- **US11**: Sebagai bendahara, saya ingin melihat laporan saldo berjalan kas umum, terurut berdasarkan tanggal.

### F5. Laporan Publik Read-Only
- **US12**: Sebagai warga, saya ingin membuka halaman laporan tanpa perlu login untuk melihat ringkasan saldo kas RT/RW saat ini.
- **US13**: Sebagai warga, saya ingin melihat rekap kas masuk-keluar per bulan (termasuk dari iuran) agar tahu ke mana uang bersama digunakan.
- **US14**: Sebagai warga, saya ingin melihat rekap status iuran (jumlah KK lunas vs belum lunas) tanpa melihat nama lengkap dan alamat detail warga lain, demi menjaga privasi — data yang ditampilkan adalah nomor KK dan status saja.

### F6. Pengumuman & Tautan Broadcast WhatsApp
- **US15**: Sebagai bendahara, saya ingin membuat pengumuman (judul + isi) yang tersimpan dan bisa dilihat riwayatnya.
- **US16**: Sebagai bendahara, saya ingin sistem menghasilkan daftar tautan `wa.me` per KK yang memiliki nomor HP, dengan isi pesan sudah terisi otomatis dari judul+isi pengumuman, agar saya tinggal klik dan kirim satu per satu.
- **US17**: Sebagai bendahara, saya ingin melihat penjelasan yang jelas di halaman ini bahwa pengiriman bersifat manual per nomor (bukan broadcast otomatis) karena tidak ada integrasi API resmi WhatsApp.

## 5. Alur Proses Utama

### Alur 1: Generate Tagihan Bulanan
1. Admin login.
2. Admin membuka halaman "Tagihan Iuran".
3. Admin menekan tombol "Generate Tagihan Bulan Ini".
4. Sistem mengambil semua KK dengan status aktif = true.
5. Untuk tiap KK, sistem mengecek apakah sudah ada TagihanIuran dengan bulan & tahun berjalan.
6. Jika belum ada, sistem membuat TagihanIuran baru dengan nominal default dan jatuh tempo tanggal 10 bulan berjalan, status BELUM_BAYAR.
7. Sistem menampilkan ringkasan hasil (jumlah tagihan baru dibuat, jumlah yang dilewati karena sudah ada).

### Alur 2: Mencatat Pembayaran
1. Admin membuka daftar tagihan/tunggakan, memilih satu tagihan milik KK tertentu.
2. Admin mengisi form pembayaran (tanggal, jumlah, metode, catatan opsional).
3. Sistem menyimpan Pembayaran dan menghitung total pembayaran terhadap tagihan tersebut.
4. Jika total pembayaran >= nominal tagihan, status tagihan berubah menjadi LUNAS.
5. Admin melihat konfirmasi dan tagihan tersebut hilang dari daftar tunggakan.

### Alur 3: Melihat Laporan Publik
1. Warga membuka URL laporan publik tanpa login.
2. Sistem menampilkan saldo kas gabungan (iuran + kas umum), rekap bulanan, dan rekap status iuran per nomor KK.
3. Tidak ada aksi tulis dari halaman ini; murni tampilan.

### Alur 4: Membuat & Menyebarkan Pengumuman
1. Admin membuka halaman "Pengumuman", membuat pengumuman baru (judul, isi).
2. Sistem menyimpan pengumuman dan menampilkan daftar KK aktif yang punya nomor HP beserta tautan `wa.me` siap klik.
3. Admin mengklik tautan satu per satu (membuka WhatsApp Web/App dengan pesan sudah terisi) dan menekan kirim secara manual di WhatsApp.

## 6. Skema Data (Entitas & Field)

### KepalaKeluarga
| Field | Tipe | Keterangan |
|---|---|---|
| id | String (cuid) | Primary key |
| nomorKK | String, unik | Nomor Kartu Keluarga |
| nama | String | Nama kepala keluarga |
| alamat | String | Alamat rumah |
| noHp | String? | Nomor HP (opsional, dipakai untuk WhatsApp) |
| aktif | Boolean | Status aktif, default true |
| createdAt / updatedAt | DateTime | Metadata |

### TagihanIuran
| Field | Tipe | Keterangan |
|---|---|---|
| id | String (cuid) | Primary key |
| kkId | String | FK ke KepalaKeluarga |
| bulan | Int (1-12) | Bulan tagihan |
| tahun | Int | Tahun tagihan |
| nominal | Int | Nominal tagihan (rupiah) |
| jatuhTempo | DateTime | Tanggal jatuh tempo |
| status | Enum (BELUM_BAYAR, LUNAS) | Status pembayaran |
| createdAt | DateTime | Metadata |
| Unique constraint | (kkId, bulan, tahun) | Mencegah duplikasi tagihan |

### Pembayaran
| Field | Tipe | Keterangan |
|---|---|---|
| id | String (cuid) | Primary key |
| tagihanId | String | FK ke TagihanIuran |
| tanggal | DateTime | Tanggal pembayaran |
| jumlah | Int | Jumlah dibayarkan |
| metode | String | Tunai/Transfer/dll |
| catatan | String? | Catatan opsional |

### KasTransaksi
| Field | Tipe | Keterangan |
|---|---|---|
| id | String (cuid) | Primary key |
| tanggal | DateTime | Tanggal transaksi |
| jenis | Enum (MASUK, KELUAR) | Jenis transaksi |
| kategori | String | Misal: Kegiatan Warga, Perbaikan Fasilitas, Iuran, dll |
| uraian | String | Deskripsi transaksi |
| jumlah | Int | Nominal (rupiah) |

### Pengumuman
| Field | Tipe | Keterangan |
|---|---|---|
| id | String (cuid) | Primary key |
| judul | String | Judul pengumuman |
| isi | String | Isi pengumuman |
| tanggal | DateTime | Tanggal dibuat |

### Admin (kredensial login)
| Field | Tipe | Keterangan |
|---|---|---|
| id | String (cuid) | Primary key |
| username | String, unik | Username login |
| passwordHash | String | Password ter-hash (bcrypt) |

## 7. Kriteria Penerimaan per Fitur

**F1 — CRUD KK**
- [ ] Admin dapat menambah, mengubah, dan menonaktifkan KK.
- [ ] Nomor KK harus unik; sistem menolak duplikasi dengan pesan error yang jelas.
- [ ] KK nonaktif tidak muncul di proses generate tagihan berikutnya.

**F2 — Generate Tagihan Otomatis**
- [ ] Tombol generate hanya membuat tagihan untuk KK aktif yang belum punya tagihan bulan/tahun berjalan.
- [ ] Menjalankan generate dua kali di bulan yang sama tidak menghasilkan duplikasi.
- [ ] Jatuh tempo otomatis terisi tanggal 10 bulan berjalan.

**F3 — Pembayaran & Tunggakan**
- [ ] Mencatat pembayaran mengubah status tagihan menjadi LUNAS bila jumlah cukup.
- [ ] Halaman tunggakan hanya menampilkan tagihan BELUM_BAYAR dengan jatuh tempo < hari ini.
- [ ] Tunggakan diakumulasi dan dikelompokkan per KK dengan total nominal.

**F4 — Kas Umum**
- [ ] Admin dapat mencatat transaksi MASUK/KELUAR dan melihat saldo berjalan yang terhitung benar (saldo = akumulasi masuk - keluar terurut tanggal).

**F5 — Laporan Publik**
- [ ] Halaman dapat diakses tanpa login.
- [ ] Menampilkan saldo kas total, rekap bulanan, dan rekap status iuran per nomor KK (tanpa menampilkan nama lengkap + alamat lengkap sekaligus).
- [ ] Tidak ada tombol/form yang mengubah data dari halaman ini.

**F6 — Pengumuman & WhatsApp**
- [ ] Admin dapat membuat pengumuman dan melihat riwayatnya.
- [ ] Sistem menghasilkan tautan `wa.me` valid (nomor dinormalisasi ke format internasional, pesan ter-encode dengan benar) untuk setiap KK aktif yang punya nomor HP.
- [ ] Halaman menampilkan penjelasan eksplisit bahwa pengiriman bersifat manual, bukan broadcast otomatis.

## 8. Rencana Teknis

- **Framework**: Next.js 14+ (App Router), TypeScript.
- **Styling**: Tailwind CSS, dengan palet dan tipografi kustom (bukan default) sesuai identitas visual aplikasi warga.
- **ORM & Database**: Prisma ORM dengan SQLite (file `prisma/dev.db`) — tanpa dependensi database eksternal, mudah dijalankan di lingkungan mana pun.
- **Validasi**: Zod untuk validasi input form dan payload API.
- **Autentikasi**: Cookie sesi sederhana (HTTP-only) untuk satu akun admin, password di-hash dengan bcrypt. Middleware melindungi seluruh rute `/admin/*` dan API tulis-data.
- **Rute Publik**: `/laporan` dapat diakses tanpa autentikasi, hanya membaca data (read-only).
- **Package manager**: npm.
- **Seed data**: skrip `prisma/seed.ts` dijalankan lewat `npm run db:seed`.

## 9. Batasan / Asumsi

- Aplikasi diasumsikan digunakan oleh satu RT/RW dengan satu bendahara aktif dalam satu waktu (tidak ada penanganan konkurensi multi-admin kompleks).
- Nominal uang disimpan sebagai bilangan bulat rupiah (tanpa desimal).
- Nomor HP warga diasumsikan diisi manual oleh admin dengan format yang bisa dinormalisasi ke format WhatsApp (contoh: 08xx diubah ke 62xx).
- Tidak ada jaminan bahwa warga benar-benar menerima pengumuman WhatsApp, karena pengiriman bergantung pada admin mengklik dan mengirim tautan satu per satu secara manual.
- Backup data bergantung pada file SQLite (`prisma/dev.db`); tidak ada mekanisme backup otomatis pada versi ini.
