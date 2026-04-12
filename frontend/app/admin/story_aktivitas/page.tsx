'use client';

import { BookOpen } from 'lucide-react';

export default function StorydanaktivitasPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <BookOpen size={32} className="text-blue-600" />
          Story & Artifacts
        </h1>
        <p className="text-sm text-gray-600 mt-2">Koleksi cerita dan dokumentasi kerjasama</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
          <h3 className="font-bold text-gray-900">Magang Industri 2025</h3>
          <p className="text-sm text-gray-600 mt-2">Program magang dengan 15 mahasiswa dari bagian IT</p>
          <button className="text-blue-600 hover:text-blue-800 font-medium text-sm mt-4">Baca Selengkapnya →</button>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
          <h3 className="font-bold text-gray-900">Penelitian Bersama</h3>
          <p className="text-sm text-gray-600 mt-2">Kolaborasi riset dengan universitas ternama</p>
          <button className="text-blue-600 hover:text-blue-800 font-medium text-sm mt-4">Baca Selengkapnya →</button>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
          <h3 className="font-bold text-gray-900">Project CSR</h3>
          <p className="text-sm text-gray-600 mt-2">Program tanggung jawab sosial perusahaan</p>
          <button className="text-blue-600 hover:text-blue-800 font-medium text-sm mt-4">Baca Selengkapnya →</button>
        </div>
      </div>

      <div className="flex gap-3">
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700">+ Tambah Story</button>
      </div>
    </div>
  );
}
