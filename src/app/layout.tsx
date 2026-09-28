import type { Metadata } from "next";
import { Lora, Public_Sans } from "next/font/google";
import "./globals.css";

const judul = Lora({
  subsets: ["latin"],
  variable: "--font-judul",
  display: "swap",
});

const tubuh = Public_Sans({
  subsets: ["latin"],
  variable: "--font-tubuh",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kas RT/RW & Iuran Warga",
  description:
    "Pengelolaan kas RT/RW dan iuran warga: tagihan bulanan otomatis, catatan tunggakan, laporan kas transparan, dan pengumuman lingkungan.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${judul.variable} ${tubuh.variable}`}>
      <body className="font-tubuh min-h-screen bg-paper text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
