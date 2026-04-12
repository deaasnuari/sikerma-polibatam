import { BarChart3 } from 'lucide-react';

export default function MonitoringdanstatusPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 size={32} className="text-blue-600" />
          Monitoring & Status
        </h1>
        <p className="text-sm text-gray-600 mt-2">Pantau status dan performa kerjasama</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <p className="text-sm text-gray-600">Total Pengajuan</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">24</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <p className="text-sm text-gray-600">Disetujui</p>
          <p className="text-3xl font-bold text-green-600 mt-2">18</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">4</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <p className="text-sm text-gray-600">Ditolak</p>
          <p className="text-3xl font-bold text-red-600 mt-2">2</p>
        </div>
      </div>

      {/* Monitoring Chart */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Grafik Perkembangan</h2>
        <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
          Grafik perkembangan akan ditampilkan di sini
        </div>
      </div>
    </div>
  );
}
