'use client';

import { FileText, Plus, Filter, ChevronDown, Eye, Clock, CheckCircle, AlertCircle, Search } from 'lucide-react';
import { useState } from 'react';

interface Pengajuan {
  id: number;
  title: string;
  date: string;
  status: 'menunggu' | 'diproses' | 'disetujui';
  company: string;
  documentType: string;
  department: string;
}

export default function DataPengajuanPage() {
  const [filterStatus, setFilterStatus] = useState<string>('semua');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const dataPengajuan: Pengajuan[] = [
    {
      id: 1,
      title: 'Kerja Sama Magang dengan PT Solusi Digital',
      date: '2025-01-10',
      status: 'menunggu',
      company: 'PT Solusi Digital Indonesia',
      documentType: 'MoA',
      department: 'Teknik Informatika',
    },
    {
      id: 2,
      title: 'Penelitian Bersama Universitas Malaysia',
      date: '2025-01-15',
      status: 'diproses',
      company: 'Universiti Teknologi Malaysia',
      documentType: 'MoU',
      department: 'Teknik Informatika',
    },
    {
      id: 3,
      title: 'Pelatihan Kewirausahaan',
      date: '2025-02-25',
      status: 'disetujui',
      company: 'Universiti Teknologi Malaysia',
      documentType: 'MoU',
      department: 'Teknik Informatika',
    },
  ];

  const stats = [
    { label: 'Total Pengajuan', value: 5, color: 'bg-gray-100' },
    { label: 'Menunggu', value: 1, color: 'bg-yellow-100' },
    { label: 'Diproses', value: 1, color: 'bg-blue-100' },
    { label: 'Disetujui', value: 1, color: 'bg-green-100' },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'menunggu':
        return <Clock size={16} className="text-yellow-600" />;
      case 'diproses':
        return <AlertCircle size={16} className="text-blue-600" />;
      case 'disetujui':
        return <CheckCircle size={16} className="text-green-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'menunggu':
        return 'bg-yellow-50 border-yellow-200';
      case 'diproses':
        return 'bg-blue-50 border-blue-200';
      case 'disetujui':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'menunggu':
        return 'bg-yellow-100 text-yellow-800';
      case 'diproses':
        return 'bg-blue-100 text-blue-800';
      case 'disetujui':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'menunggu':
        return 'Menunggu';
      case 'diproses':
        return 'Diproses';
      case 'disetujui':
        return 'Disetujui';
      default:
        return status;
    }
  };

  const filteredData = dataPengajuan.filter(item => {
    const matchesStatus = filterStatus === 'semua' || item.status === filterStatus;
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.company.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pengajuan Kerjasama</h1>
          <p className="text-sm text-gray-600 mt-2">Kelola pengajuan kerjasama dari seluruh jurusan dan unit di Polibatam</p>
        </div>
        <button className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2">
          <Plus size={20} />
          Ajukan Kerjasama Baru
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className={`${stat.color} rounded-lg p-4`}>
            <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-end">
          {/* Filter by Status */}
          <div className="w-full md:w-auto">
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="semua">Semua Status</option>
              <option value="menunggu">Menunggu</option>
              <option value="diproses">Diproses</option>
              <option value="disetujui">Disetujui</option>
            </select>
          </div>

          {/* Search */}
          <div className="w-full md:flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Cari</label>
            <div className="relative">
              <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari berdasarkan nama mitra..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* List of Pengajuan */}
      <div className="space-y-4">
        {filteredData.length > 0 ? (
          filteredData.map((item) => (
            <div key={item.id} className={`border rounded-lg p-4 ${getStatusColor(item.status)}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {/* Title and Status */}
                  <div className="flex items-center gap-2 mb-3">
                    {getStatusIcon(item.status)}
                    <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  </div>

                  {/* Date and Status Badge */}
                  <p className="text-xs text-gray-500 mb-3">Pengajuan Dr. Ahmad Wijaya • {new Date(item.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    <div>
                      <p className="text-xs text-gray-600">Mitra Tujuan</p>
                      <p className="text-sm font-medium text-gray-900">{item.company}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Jenis Dokumen</p>
                      <span className="inline-block mt-1 px-2 py-1 bg-white rounded text-xs font-medium text-gray-700">
                        {item.documentType}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Jurusan</p>
                      <p className="text-sm font-medium text-gray-900">{item.department}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Ruang Lingkup</p>
                      <p className="text-sm font-medium text-gray-900">Penelitian</p>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-white rounded text-xs font-medium text-gray-700">Penelitian</span>
                    <span className="px-2 py-1 bg-white rounded text-xs font-medium text-gray-700">Publikasi Bersama</span>
                  </div>
                </div>

                {/* Right Side - Status and Action */}
                <div className="flex flex-col items-end gap-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(item.status)}`}>
                    {getStatusLabel(item.status)}
                  </span>
                  <button className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium text-sm">
                    <Eye size={16} />
                    Lihat Detail
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg p-8 text-center">
            <p className="text-gray-600 text-sm">Tidak ada data pengajuan yang sesuai dengan filter</p>
          </div>
        )}
      </div>
    </div>
  );
}
