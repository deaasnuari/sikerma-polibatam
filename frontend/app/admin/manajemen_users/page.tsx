'use client';

import { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  Shield,
  UserCheck,
  GraduationCap,
  Building2,
  Handshake,
} from 'lucide-react';

interface UserItem {
  id: number;
  nama: string;
  email: string;
  role: 'Admin' | 'Jurusan' | 'Prodi' | 'Pimpinan' | 'Mitra';
  unitInstansi: string;
  status: 'Aktif' | 'NonAktif';
}

const dummyUsers: UserItem[] = [
  {
    id: 1,
    nama: 'Ahmad Fauzi',
    email: 'ahmad.fauzi@polibatam.ac.id',
    role: 'Admin',
    unitInstansi: 'Sistem Informasi',
    status: 'Aktif',
  },
  {
    id: 2,
    nama: 'Siti Nurhaliza',
    email: 'siti.nur@polibatam.ac.id',
    role: 'Jurusan',
    unitInstansi: 'Jurusan Teknik',
    status: 'NonAktif',
  },
  {
    id: 3,
    nama: 'Budi Santoso',
    email: 'budi.santoso@polibatam.ac.id',
    role: 'Prodi',
    unitInstansi: 'Teknik Informatika',
    status: 'Aktif',
  },
  {
    id: 4,
    nama: 'Hendra Gunawan',
    email: 'hendra.g@polibatam.ac.id',
    role: 'Pimpinan',
    unitInstansi: 'Direktur',
    status: 'Aktif',
  },
  {
    id: 5,
    nama: 'PT. Teknologi Maju',
    email: 'info@teknologimaju.co.id',
    role: 'Mitra',
    unitInstansi: 'Perusahaan Swasta',
    status: 'Aktif',
  },
];

const roleColor: Record<string, { bg: string; text: string }> = {
  Admin: { bg: 'bg-teal-500', text: 'text-white' },
  Jurusan: { bg: 'bg-blue-500', text: 'text-white' },
  Prodi: { bg: 'bg-orange-400', text: 'text-white' },
  Pimpinan: { bg: 'bg-red-500', text: 'text-white' },
  Mitra: { bg: 'bg-purple-500', text: 'text-white' },
};

const statusStyle: Record<string, { bg: string; text: string; dot: string }> = {
  Aktif: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
  NonAktif: { bg: 'bg-gray-200', text: 'text-gray-600', dot: 'bg-gray-400' },
};

export default function ManajemenUserPage() {
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('Semua Role');
  const [showAddModal, setShowAddModal] = useState(false);

  const filtered = dummyUsers.filter((item) => {
    const matchRole =
      filterRole === 'Semua Role' || item.role === filterRole;
    const matchSearch =
      item.nama.toLowerCase().includes(search.toLowerCase()) ||
      item.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const totalUser = dummyUsers.length;
  const totalAdmin = dummyUsers.filter((u) => u.role === 'Admin').length;
  const totalJurusan = dummyUsers.filter((u) => u.role === 'Jurusan').length;
  const totalProdi = dummyUsers.filter((u) => u.role === 'Prodi').length;
  const totalMitra = dummyUsers.filter((u) => u.role === 'Mitra').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen User</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola user dan hak akses sistem
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-[#0e1d34] hover:bg-[#1a2d4a] text-white text-sm font-medium px-4 py-2.5 rounded-lg transition"
        >
          <Plus size={16} />
          Tambah User
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users size={18} className="text-blue-600" />
            </div>
            <p className="text-sm text-gray-500 font-medium">Total User</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalUser}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-teal-100 flex items-center justify-center">
              <Shield size={18} className="text-teal-600" />
            </div>
            <p className="text-sm text-gray-500 font-medium">Admin</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalAdmin}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
              <Building2 size={18} className="text-blue-600" />
            </div>
            <p className="text-sm text-gray-500 font-medium">Jurusan</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalJurusan}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center">
              <GraduationCap size={18} className="text-orange-600" />
            </div>
            <p className="text-sm text-gray-500 font-medium">Prodi</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalProdi}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center">
              <Handshake size={18} className="text-purple-600" />
            </div>
            <p className="text-sm text-gray-500 font-medium">Mitra</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalMitra}</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Cari akun..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        <div className="relative">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="appearance-none bg-white border border-gray-300 rounded-lg pl-4 pr-9 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option>Semua Role</option>
            <option>Admin</option>
            <option>Jurusan</option>
            <option>Prodi</option>
            <option>Pimpinan</option>
            <option>Mitra</option>
          </select>
          <ChevronDown
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-3.5 px-4 font-semibold text-gray-700">
                  Nama
                </th>
                <th className="text-left py-3.5 px-4 font-semibold text-gray-700">
                  Email
                </th>
                <th className="text-left py-3.5 px-4 font-semibold text-gray-700">
                  Role
                </th>
                <th className="text-left py-3.5 px-4 font-semibold text-gray-700">
                  Unit/Instansi
                </th>
                <th className="text-left py-3.5 px-4 font-semibold text-gray-700">
                  Status
                </th>
                <th className="text-left py-3.5 px-4 font-semibold text-gray-700">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-10 text-center text-gray-400"
                  >
                    Tidak ada data ditemukan
                  </td>
                </tr>
              )}

              {filtered.map((item) => {
                const rc = roleColor[item.role];
                const sc = statusStyle[item.status];
                return (
                  <tr
                    key={item.id}
                    className="border-b border-gray-100 hover:bg-gray-50/50 transition"
                  >
                    <td className="py-3.5 px-4 font-medium text-gray-900">
                      {item.nama}
                    </td>
                    <td className="py-3.5 px-4 text-gray-600">
                      {item.email}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold min-w-[70px] ${rc.bg} ${rc.text}`}
                      >
                        {item.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                        {item.unitInstansi}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${sc.bg} ${sc.text}`}
                      >
                        <UserCheck size={12} />
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          className="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center justify-center transition"
                          title="Edit User"
                        >
                          <Pencil size={14} className="text-blue-600" />
                        </button>
                        <button
                          className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition"
                          title="Hapus User"
                        >
                          <Trash2 size={14} className="text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-5">
              Tambah User Baru
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    placeholder="Masukkan nama lengkap"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    placeholder="Masukkan username"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    placeholder="contoh@polibatam.ac.id"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    placeholder="Masukkan password"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select className="appearance-none w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                      <option value="">Pilih Role</option>
                      <option value="Admin">Admin</option>
                      <option value="Jurusan">Jurusan</option>
                      <option value="Prodi">Prodi</option>
                      <option value="Pimpinan">Pimpinan</option>
                      <option value="Mitra">Mitra</option>
                    </select>
                    <ChevronDown
                      size={14}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Unit/Instansi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    placeholder="Nama unit/instansi"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  No. Telepon / WhatsApp <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  placeholder="Contoh: 08123456789"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2.5 bg-[#0e1d34] hover:bg-[#1a2d4a] text-white rounded-lg text-sm font-medium transition"
              >
                Simpan User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
