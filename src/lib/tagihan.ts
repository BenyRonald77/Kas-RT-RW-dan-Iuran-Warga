import type { Pembayaran, TagihanIuran } from "@prisma/client";

/** Menjumlahkan seluruh pembayaran yang tercatat untuk satu tagihan. */
export function totalTerbayar(pembayaran: Pick<Pembayaran, "jumlah">[]): number {
  return pembayaran.reduce((total, p) => total + p.jumlah, 0);
}

/** Sisa yang masih harus dibayar (tidak pernah negatif). */
export function sisaTagihan(
  tagihan: Pick<TagihanIuran, "nominal">,
  pembayaran: Pick<Pembayaran, "jumlah">[]
): number {
  return Math.max(0, tagihan.nominal - totalTerbayar(pembayaran));
}
