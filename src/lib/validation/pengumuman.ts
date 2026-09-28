import { z } from "zod";

export const pengumumanSchema = z.object({
  judul: z.string().trim().min(3, "Judul minimal 3 karakter"),
  isi: z.string().trim().min(3, "Isi pengumuman wajib diisi"),
});

export type PengumumanInput = z.infer<typeof pengumumanSchema>;
