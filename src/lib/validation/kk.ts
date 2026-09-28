import { z } from "zod";

export const kkSchema = z.object({
  nomorKK: z
    .string()
    .trim()
    .min(6, "Nomor KK minimal 6 digit")
    .max(32, "Nomor KK terlalu panjang"),
  nama: z.string().trim().min(2, "Nama wajib diisi"),
  alamat: z.string().trim().min(3, "Alamat wajib diisi"),
  noHp: z
    .string()
    .trim()
    .max(20, "Nomor HP terlalu panjang")
    .optional()
    .or(z.literal("")),
  aktif: z.boolean().optional(),
});

export type KKInput = z.infer<typeof kkSchema>;
