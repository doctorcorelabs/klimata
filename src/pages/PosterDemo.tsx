import React from "react";
import PosterDisplay from "../components/PosterDisplay";

export default function PosterDemo() {
  return (
    <main className="min-h-screen bg-gray-50 text-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-bold">Demo Poster Penyuluhan</h1>
          <p className="mt-2 text-slate-600">Contoh tampilan poster dengan lightbox, unduh, dan cetak.</p>
        </header>

        <section>
          <PosterDisplay />
        </section>

        <footer className="mt-8 text-sm text-slate-600">
          <p>Tip: tombol <strong>Unduh</strong> menyimpan file asli, dan <strong>Cetak</strong> membuka dialog cetak browser.</p>
        </footer>
      </div>
    </main>
  );
}
