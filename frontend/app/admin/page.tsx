'use client';

import {
  FileText,
  Users,
  TrendingUp,
  Handshake,
  Building2,
  Globe,
  BarChart3,
  Zap,
} from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 text-sm md:text-base mt-2">Selamat datang di SIKERMA v2.0 - Sistem Informasi Kerjasama Politeknik Negeri Batam</p>
      </div>

      {/* Notifikasi Section */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            {/* Bell Icon */}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            Notifikasi Terbaru
          </h2>
          <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium">Lihat Semua</a>
        </div>

        <div className="space-y-3">
          {/* Success Notification */}
          <div className="bg-white border-l-4 border-green-500 rounded-lg p-4 flex gap-3 hover:shadow-md transition-shadow cursor-pointer">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">Pengajuan Disetujui</p>
              <p className="text-sm text-gray-600 mt-1">Pengajuan 'Kerja Sama Magong dengan PT Solusi Digital' telah disetujui.</p>
              <p className="text-xs text-gray-500 mt-1">📌 dari: Admin SIKERMA</p>
            </div>
          </div>

          {/* Info Notification */}
          <div className="bg-white border-l-4 border-blue-500 rounded-lg p-4 flex gap-3 hover:shadow-md transition-shadow cursor-pointer">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">Komentar Baru pada Pengajuan</p>
              <p className="text-sm text-gray-600 mt-1">Pengajuan 'Kerja Sama Magong dengan PT Solusi Digital' telah mendapat komentar baru.</p>
              <p className="text-xs text-gray-500 mt-1">📌 dari: Admin SIKERMA</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        {[
          { label: 'Total Kerjasama Aktif', value: '6', color: 'bg-green-100', textColor: 'text-green-700', icon: Handshake },
          { label: 'Total Dalam Negeri', value: '154', color: 'bg-red-100', textColor: 'text-red-700', icon: Building2 },
          { label: 'Total Luar Negeri', value: '31', color: 'bg-blue-100', textColor: 'text-blue-700', icon: Globe },
          { label: 'Total Dokumen', value: '185', color: 'bg-orange-100', textColor: 'text-orange-700', icon: BarChart3 },
          { label: 'Total Proses', value: '5', color: 'bg-indigo-100', textColor: 'text-indigo-700', icon: Zap },
        ].map((stat, idx) => {
          const IconComponent = stat.icon;
          return (
            <button key={idx} className={`${stat.color} rounded-lg p-3 md:p-4 text-center hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer`}>
              <div className="flex justify-center mb-2">
                <IconComponent size={24} className={stat.textColor} />
              </div>
              <p className={`text-xs md:text-sm font-medium ${stat.textColor}`}>{stat.label}</p>
              <p className="text-lg md:text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </button>
          );
        })}
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        {[
          { label: 'Buat Kerjasama Baru', icon: Handshake, color: 'bg-blue-50 border-blue-200' },
          { label: 'Lihat User', icon: Users, color: 'bg-green-50 border-green-200' },
          { label: 'Monitoring', icon: TrendingUp, color: 'bg-purple-50 border-purple-200' },
        ].map((action, idx) => {
          const IconComponent = action.icon;
          return (
            <button key={idx} className={`${action.color} border rounded-lg p-4 md:p-6 text-center hover:shadow-md transition-shadow`}>
              <div className="flex justify-center mb-2">
                <IconComponent size={28} className="text-gray-700" />
              </div>
              <p className="text-xs md:text-sm font-medium text-gray-900">{action.label}</p>
            </button>
          );
        })}
      </div>

      {/* Statistik Kerjasama Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
        <h2 className="text-center text-xl md:text-2xl font-bold text-gray-900 mb-8">STATISTIK KERJASAMA</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Chart 1 Placeholder */}
          <div className="flex flex-col items-center justify-center">
            <div className="w-32 h-32 md:w-40 md:h-40 bg-gray-200 rounded-full mb-4"></div>
            <p className="text-sm text-gray-600">Distribusi Kerjasama Berdasarkan Wilayah</p>
          </div>

          {/* Chart 2 Placeholder */}
          <div className="flex flex-col items-center justify-center">
            <div className="w-32 h-32 md:w-40 md:h-40 bg-gray-200 rounded-full mb-4"></div>
            <p className="text-sm text-gray-600">Distribusi Nilai Dokumen</p>
          </div>
        </div>
      </div>

      {/* Top 5 Sikerma Kerjasama */}
      <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">Top 5 Sikerma Kerjasama</h2>
        
        <div className="space-y-4">
          {[
            { name: 'Integrator Indonesia', value: 95 },
            { name: 'PT Mitra Digital Nusantara', value: 85 },
            { name: 'PT Teknologi Indonesia', value: 78 },
            { name: 'Solusi Bisnis Modern', value: 72 },
            { name: 'PT Inovasi Solusi Bisnis Indonesia', value: 68 },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-900 min-w-fit">{idx + 1}. {item.name}</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-blue-900 h-full rounded-full" 
                  style={{ width: `${item.value}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-700 min-w-fit">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

