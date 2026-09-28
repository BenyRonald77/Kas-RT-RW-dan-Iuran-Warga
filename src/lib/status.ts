// SQLite (lewat Prisma) tidak mendukung tipe enum asli, jadi status disimpan
// sebagai String di database dan divalidasi/diberi tipe di sini.

export const STATUS_TAGIHAN = ["BELUM_BAYAR", "LUNAS"] as const;
export type StatusTagihan = (typeof STATUS_TAGIHAN)[number];

export const JENIS_KAS = ["MASUK", "KELUAR"] as const;
export type JenisKas = (typeof JENIS_KAS)[number];

export const NAMA_BULAN = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
] as const;

export function formatRupiah(jumlah: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(jumlah);
}

export function formatTanggal(tanggal: Date | string): string {
  const date = typeof tanggal === "string" ? new Date(tanggal) : tanggal;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}
