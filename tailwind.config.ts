import type { Config } from "tailwindcss";

// Palet & tipografi identitas aplikasi (lihat catatan di src/app/globals.css
// untuk alasan setiap pilihan). Dipakai konsisten di seluruh layar admin
// maupun laporan publik.
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        paper: "#FAF6ED", // latar hangat seperti kertas, bukan putih pucat
        ink: "#2A2420", // teks utama, hitam kehangatan (bukan hitam pekat)
        hijau: {
          50: "#EBF2EE",
          100: "#D3E3DA",
          200: "#A8C7B6",
          400: "#5C8C77",
          600: "#2F5D50", // warna utama: kas & kepercayaan
          700: "#254A40",
          900: "#152D26",
        },
        sawo: {
          50: "#FBEEE4",
          100: "#F3D6BC",
          400: "#D98B4B",
          500: "#C1652F", // aksen: hangat, komunitas, tombol utama
          600: "#A6521F",
        },
        waspada: {
          50: "#FBECEA",
          500: "#B23A2E", // status tunggakan/peringatan
          600: "#8F2E24",
        },
      },
      fontFamily: {
        judul: ["var(--font-judul)", "serif"],
        tubuh: ["var(--font-tubuh)", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "8px",
        lg: "12px",
        sm: "6px",
      },
    },
  },
  plugins: [],
};

export default config;
