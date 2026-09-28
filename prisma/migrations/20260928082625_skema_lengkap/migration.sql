-- CreateTable
CREATE TABLE "KepalaKeluarga" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nomorKK" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "noHp" TEXT,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "TagihanIuran" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kkId" TEXT NOT NULL,
    "bulan" INTEGER NOT NULL,
    "tahun" INTEGER NOT NULL,
    "nominal" INTEGER NOT NULL,
    "jatuhTempo" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'BELUM_BAYAR',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TagihanIuran_kkId_fkey" FOREIGN KEY ("kkId") REFERENCES "KepalaKeluarga" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Pembayaran" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tagihanId" TEXT NOT NULL,
    "tanggal" DATETIME NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "metode" TEXT NOT NULL,
    "catatan" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Pembayaran_tagihanId_fkey" FOREIGN KEY ("tagihanId") REFERENCES "TagihanIuran" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "KasTransaksi" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tanggal" DATETIME NOT NULL,
    "jenis" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "uraian" TEXT NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Pengumuman" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "judul" TEXT NOT NULL,
    "isi" TEXT NOT NULL,
    "tanggal" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "KepalaKeluarga_nomorKK_key" ON "KepalaKeluarga"("nomorKK");

-- CreateIndex
CREATE UNIQUE INDEX "TagihanIuran_kkId_bulan_tahun_key" ON "TagihanIuran"("kkId", "bulan", "tahun");
