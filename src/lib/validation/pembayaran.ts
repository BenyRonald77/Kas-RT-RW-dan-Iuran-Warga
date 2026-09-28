import { z } from "zod";

export const pembayaranSchema = z.object({
  tagihanId: z.string().min(1, "Tagihan wajib dipilih"),
  tanggal: z.string().min(1, "Tanggal wajib diisi"),
  jumlah: z.coerce.number().int().positive("Jumlah harus lebih dari 0"),
  metode: z.string().trim().min(1, "Metode pembayaran wajib diisi"),
  catatan: z.string().trim().max(500).optional().or(z.literal("")),
});

export type PembayaranInput = z.infer<typeof pembayaranSchema>;
