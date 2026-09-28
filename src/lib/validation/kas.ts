import { z } from "zod";
import { JENIS_KAS } from "@/lib/status";

export const kasSchema = z.object({
  tanggal: z.string().min(1, "Tanggal wajib diisi"),
  jenis: z.enum(JENIS_KAS, { errorMap: () => ({ message: "Jenis harus MASUK atau KELUAR" }) }),
  kategori: z.string().trim().min(1, "Kategori wajib diisi"),
  uraian: z.string().trim().min(1, "Uraian wajib diisi"),
  jumlah: z.coerce.number().int().positive("Jumlah harus lebih dari 0"),
});

export type KasInput = z.infer<typeof kasSchema>;
