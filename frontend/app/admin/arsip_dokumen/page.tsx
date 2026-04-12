'use client';

import { Archive } from 'lucide-react';

export default function ArsipdokumenPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Archive size={32} className="text-blue-600" />
          Arsip Dokumen Kesiapan
        </h1>
        <p className="text-sm text-gray-600 mt-2">Kelola dan arsipkan dokumen kerjasama</p>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Daftar Dokumen</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">No</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Nama Dokumen</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Jenis</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Tanggal Upload</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4">1</td>
                <td className="py-3 px-4">MOU_PT_Solusi_Digital.pdf</td>
                <td className="py-3 px-4">PDF</td>
                <td className="py-3 px-4">05 Jan 2025</td>
                <td className="py-3 px-4"><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Aktif</span></td>
                <td className="py-3 px-4"><button className="text-blue-600 hover:text-blue-800 font-medium text-sm">Download</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex gap-3">
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700">+ Upload Dokumen</button>
      </div>
    </div>
  );
}
