/**
 * Menormalkan nomor HP Indonesia ke format internasional yang dipakai
 * tautan wa.me (mis. "0812-3456-7890" -> "62812345678 90" tanpa spasi).
 * Mengembalikan null bila nomor terlalu pendek untuk dianggap valid.
 */
export function normalisasiNomorWhatsapp(nomor: string): string | null {
  const digitSaja = nomor.replace(/\D/g, "");
  if (digitSaja.length < 8) return null;

  if (digitSaja.startsWith("0")) {
    return `62${digitSaja.slice(1)}`;
  }
  if (digitSaja.startsWith("62")) {
    return digitSaja;
  }
  if (digitSaja.startsWith("8")) {
    return `62${digitSaja}`;
  }
  return digitSaja;
}

/**
 * Membuat tautan klik-kirim wa.me dengan pesan sudah terisi. Ini BUKAN
 * pengiriman otomatis: mengklik tautan hanya membuka WhatsApp dengan draf
 * pesan, pengurus tetap harus menekan tombol kirim secara manual (lihat
 * PRD bagian Ruang Lingkup).
 */
export function buatTautanWhatsapp(nomor: string, pesan: string): string | null {
  const nomorNormal = normalisasiNomorWhatsapp(nomor);
  if (!nomorNormal) return null;
  return `https://wa.me/${nomorNormal}?text=${encodeURIComponent(pesan)}`;
}
