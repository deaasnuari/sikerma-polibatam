'use client';

import { ClipboardList } from 'lucide-react';

export default function RekapDataPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <ClipboardList size={32} className="text-blue-600" />
          Rekap Data
        </h1>
        <p className="text-sm text-gray-600 mt-2">Ringkasan data kerjasama untuk kebutuhan monitoring dan laporan.</p>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-2">Ringkasan Rekap</h2>
        <p className="text-sm text-gray-600">Komponen rekap detail akan ditampilkan di halaman ini.</p>
      </div>
    </div>
  );
}
