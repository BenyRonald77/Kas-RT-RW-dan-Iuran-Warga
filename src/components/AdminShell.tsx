import Link from "next/link";
import { LogoutButton } from "./LogoutButton";

type AdminShellProps = {
  username: string;
  children: React.ReactNode;
};

/**
 * Kerangka halaman admin (setelah login). Daftar navigasi hanya memuat
 * tautan ke halaman yang benar-benar ada (R-24) — bertambah seiring fitur
 * dibangun pada commit berikutnya.
 */
export function AdminShell({ username, children }: AdminShellProps) {
  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-hijau-200/60 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Link href="/admin" className="font-judul text-lg font-semibold text-hijau-700">
            Kas RT/RW &middot; Pengurus
          </Link>
          <div className="flex items-center gap-4 text-sm text-ink/70">
            <span>{username}</span>
            <LogoutButton />
          </div>
        </div>
        <nav className="mx-auto flex max-w-5xl flex-wrap gap-1 px-4 pb-3 text-sm sm:px-6">
          <AdminNavLink href="/admin">Dasbor</AdminNavLink>
          <AdminNavLink href="/admin/kk">Data Warga</AdminNavLink>
          <AdminNavLink href="/admin/tagihan">Tagihan Iuran</AdminNavLink>
          <AdminNavLink href="/admin/tunggakan">Tunggakan</AdminNavLink>
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}

function AdminNavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded px-3 py-1.5 text-ink/70 hover:bg-hijau-50 hover:text-hijau-700"
    >
      {children}
    </Link>
  );
}
