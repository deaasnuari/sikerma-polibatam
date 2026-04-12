'use client';

import { Users } from 'lucide-react';

export default function ManajemenuserPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Users size={32} className="text-blue-600" />
          Manajemen User
        </h1>
        <p className="text-sm text-gray-600 mt-2">Kelola pengguna dan permission sistem</p>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Daftar User</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">No</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Nama</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4">1</td>
                <td className="py-3 px-4">Admin User</td>
                <td className="py-3 px-4">admin@polibatam.ac.id</td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">Administrator</span>
                </td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Aktif</span>
                </td>
                <td className="py-3 px-4"><button className="text-blue-600 hover:text-blue-800 font-medium text-sm">Edit</button></td>
              </tr>
              <tr className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4">2</td>
                <td className="py-3 px-4">Staff Kerjasama</td>
                <td className="py-3 px-4">staff@polibatam.ac.id</td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Staff</span>
                </td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Aktif</span>
                </td>
                <td className="py-3 px-4"><button className="text-blue-600 hover:text-blue-800 font-medium text-sm">Edit</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex gap-3">
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700">+ Tambah User</button>
      </div>
    </div>
  );
}
