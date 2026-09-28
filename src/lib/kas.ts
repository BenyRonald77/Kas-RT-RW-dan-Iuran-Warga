type TransaksiRingkas = { jenis: string; jumlah: number };

/** Saldo akhir = total MASUK dikurangi total KELUAR. */
export function hitungSaldo(transaksi: TransaksiRingkas[]): number {
  return transaksi.reduce(
    (saldo, t) => (t.jenis === "MASUK" ? saldo + t.jumlah : saldo - t.jumlah),
    0
  );
}

/**
 * Menambahkan saldo berjalan ke tiap transaksi. Input harus sudah terurut
 * dari yang paling lama ke yang paling baru.
 */
export function denganSaldoBerjalan<T extends TransaksiRingkas>(
  transaksiTerurut: T[]
): (T & { saldoBerjalan: number })[] {
  let saldo = 0;
  return transaksiTerurut.map((t) => {
    saldo = t.jenis === "MASUK" ? saldo + t.jumlah : saldo - t.jumlah;
    return { ...t, saldoBerjalan: saldo };
  });
}
