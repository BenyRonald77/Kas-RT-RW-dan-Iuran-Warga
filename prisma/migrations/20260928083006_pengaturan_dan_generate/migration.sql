-- CreateTable
CREATE TABLE "Pengaturan" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "nominalIuranDefault" INTEGER NOT NULL DEFAULT 50000,
    "tanggalJatuhTempo" INTEGER NOT NULL DEFAULT 10
);
