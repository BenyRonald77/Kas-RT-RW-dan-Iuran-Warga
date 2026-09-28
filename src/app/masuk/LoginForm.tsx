"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tujuan = searchParams.get("dari") || "/admin";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Gagal masuk. Silakan coba lagi.");
        setLoading(false);
        return;
      }

      router.push(tujuan);
      router.refresh();
    } catch {
      setError("Tidak bisa terhubung ke server. Periksa koneksi Anda.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-ink">
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mt-1 w-full rounded border border-hijau-200 bg-white px-3 py-2 text-ink focus:border-hijau-600"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-ink">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded border border-hijau-200 bg-white px-3 py-2 text-ink focus:border-hijau-600"
        />
      </div>

      {error ? (
        <p role="alert" className="rounded bg-waspada-50 px-3 py-2 text-sm text-waspada-600">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="rounded bg-hijau-600 px-4 py-2 font-medium text-white transition-colors hover:bg-hijau-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Memeriksa..." : "Masuk"}
      </button>
    </form>
  );
}
