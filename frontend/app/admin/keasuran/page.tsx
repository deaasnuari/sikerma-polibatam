'use client';

import { useState } from 'react';
import {
  Plus, Search, Filter, ChevronDown, Edit2, Trash2, Eye,
  Shield, AlertCircle, CheckCircle, Clock
} from 'lucide-react';

interface SecurityLog {
  id: number;
  user: string;
  action: string;
  resource: string;
  timestamp: string;
  status: 'success' | 'warning' | 'failed';
  ipAddress: string;
  device: string;
}

const securityData: SecurityLog[] = [
  {
    id: 1,
    user: 'Admin User',
    action: 'Login',
    resource: 'System',
    timestamp: '2024-04-12 10:30:45',
    status: 'success',
    ipAddress: '192.168.1.100',
    device: 'Windows (Chrome)',
  },
  {
    id: 2,
    user: 'Pegawai 1',
    action: 'File Access',
    resource: 'Dokumen_Akreditasi.pdf',
    timestamp: '2024-04-12 09:15:20',
    status: 'success',
    ipAddress: '192.168.1.105',
    device: 'MacOS (Safari)',
  },
  {
    id: 3,
    user: 'Unknown',
    action: 'Failed Login',
    resource: 'System',
    timestamp: '2024-04-11 22:45:10',
    status: 'failed',
    ipAddress: '203.0.113.45',
    device: 'Unknown',
  },
  {
    id: 4,
    user: 'Admin User',
    action: 'User Modified',
    resource: 'Akun_Pegawai_2',
    timestamp: '2024-04-11 14:20:00',
    status: 'success',
    ipAddress: '192.168.1.100',
    device: 'Windows (Chrome)',
  },
  {
    id: 5,
    user: 'Pegawai 2',
    action: 'Permission Change',
    resource: 'Folder_Arsip',
    timestamp: '2024-04-11 11:05:30',
    status: 'warning',
    ipAddress: '192.168.1.110',
    device: 'Mobile (iOS)',
  },
];

export default function KeasuranPage() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('semua');
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle size={18} className="text-green-600" />;
      case 'warning':
        return <AlertCircle size={18} className="text-yellow-600" />;
      case 'failed':
        return <AlertCircle size={18} className="text-red-600" />;
      default:
        return <Clock size={18} className="text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredData = securityData.filter(item => {
    const matchesStatus = filterStatus === 'semua' || item.status === filterStatus;
    const matchesSearch =
      item.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.ipAddress.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
          {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Shield size={32} className="text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">Keasuran Sistem</h1>
              </div>
              <p className="text-gray-600">Monitoring dan audit trail aktivitas sistem</p>
            </div>
            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors w-full md:w-auto justify-center">
              <Plus size={20} />
              Export Report
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Aktivitas</p>
                <p className="text-2xl font-bold text-gray-900">{securityData.length}</p>
              </div>
              <Shield className="text-blue-600" size={28} />
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Sukses</p>
                <p className="text-2xl font-bold text-green-600">
                  {securityData.filter(d => d.status === 'success').length}
                </p>
              </div>
              <CheckCircle className="text-green-600" size={28} />
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Peringatan</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {securityData.filter(d => d.status === 'warning').length}
                </p>
              </div>
              <AlertCircle className="text-yellow-600" size={28} />
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Gagal</p>
                <p className="text-2xl font-bold text-red-600">
                  {securityData.filter(d => d.status === 'failed').length}
                </p>
              </div>
              <AlertCircle className="text-red-600" size={28} />
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-lg p-4 mb-6 border border-gray-200 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Cari user, aksi, resource, atau IP address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filter Status */}
            <div className="relative">
              <Filter className="absolute left-3 top-3 text-gray-400" size={20} />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
              >
                <option value="semua">Semua Status</option>
                <option value="success">Sukses</option>
                <option value="warning">Peringatan</option>
                <option value="failed">Gagal</option>
              </select>
              <ChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={20} />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">User</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">Aksi</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">Resource</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">Waktu</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">IP Address</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">Device</th>
                  <th className="px-6 py-3 text-center font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-center font-semibold text-gray-900">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((item) => (
                    <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-gray-900 font-medium">{item.user}</td>
                      <td className="px-6 py-4 text-gray-700">{item.action}</td>
                      <td className="px-6 py-4 text-gray-700 max-w-xs truncate" title={item.resource}>{item.resource}</td>
                      <td className="px-6 py-4 text-gray-600 text-xs">{item.timestamp}</td>
                      <td className="px-6 py-4 text-gray-600 font-mono text-xs">{item.ipAddress}</td>
                      <td className="px-6 py-4 text-gray-600 text-xs">{item.device}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {getStatusIcon(item.status)}
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button className="p-1 hover:bg-blue-100 rounded transition-colors text-blue-600" title="Lihat Detail">
                            <Eye size={18} />
                          </button>
                          <button className="p-1 hover:bg-yellow-100 rounded transition-colors text-yellow-600" title="Edit">
                            <Edit2 size={18} />
                          </button>
                          <button className="p-1 hover:bg-red-100 rounded transition-colors text-red-600" title="Hapus">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      Tidak ada data yang sesuai dengan filter
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredData.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-600">
              <p>Menampilkan {filteredData.length} dari {securityData.length} data</p>
              <div className="flex gap-2">
                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">Sebelumnya</button>
                <button className="px-3 py-1 bg-blue-600 text-white rounded">1</button>
                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">Berikutnya</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
