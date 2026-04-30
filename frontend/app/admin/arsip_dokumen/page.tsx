'use client';

import { useEffect, useState } from 'react';
import {
  Archive,
  Search,
  Download,
  Trash2,
  FileText,
  AlertCircle,
  Info,
} from 'lucide-react';
import { getPengajuanData, type PengajuanItem } from '@/services/adminPengajuanService';
import { generateNoDokumen } from '@/services/adminMonitoringService';

interface ArsipDokumen {
  id: number;
  noDokumen: string;
  namaMitra: string;
  jenis: 'MoA' | 'MoU' | 'IA';
  tanggalMulai: string;
  berlakuHingga: string;
  statusFollowUp: 'Direspon' | 'Tidak Direspon' | 'Menunggu';
  buktiFollowUp: string | null;
}

function toDisplayDate(value?: string): string {
  if (!value) {
    return '-';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '-';
  }

  return parsed.toLocaleDateString('en-GB');
}

function toDocumentType(value: string): ArsipDokumen['jenis'] {
  if (value === 'MoA' || value === 'MoU' || value === 'IA') {
    return value;
  }

  return 'MoU';
}

function mapPengajuanToArsip(item: PengajuanItem): ArsipDokumen {
  const tahun = Number(item.tanggal?.slice(0, 4)) || new Date().getFullYear();
  const jenis = toDocumentType(item.jenisDokumen);

  return {
    id: item.id,
    noDokumen: generateNoDokumen({ urutan: item.id, jenis, tanggal: item.tanggalMulai }),
    namaMitra: item.mitra,
    jenis,
    tanggalMulai: toDisplayDate(item.tanggalMulai),
    berlakuHingga: toDisplayDate(item.tanggalBerakhir),
    statusFollowUp: item.status === 'Disetujui' ? 'Menunggu' : 'Tidak Direspon',
    buktiFollowUp: null,
  };
}

const followUpColor: Record<string, { bg: string; text: string }> = {
  Direspon: { bg: 'bg-green-100', text: 'text-green-700' },
  'Tidak Direspon': { bg: 'bg-red-100', text: 'text-red-700' },
  Menunggu: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
};

const jenisColor: Record<string, string> = {
  MoA: 'bg-blue-50 text-blue-700',
  MoU: 'bg-purple-50 text-purple-700',
  IA: 'bg-orange-50 text-orange-700',
};

export default function ArsipDokumenPage() {
  const [search, setSearch] = useState('');
  const [data, setData] = useState<ArsipDokumen[]>([]);

  useEffect(() => {
    const syncArsip = () => {
      setData(getPengajuanData().map(mapPengajuanToArsip));
    };

    syncArsip();
    window.addEventListener('pengajuan-data-updated', syncArsip);

    return () => window.removeEventListener('pengajuan-data-updated', syncArsip);
  }, []);

  const handleDelete = (id: number) => {
    const item = data.find((d) => d.id === id);
    if (!item) return;
    if (!confirm(`Yakin ingin menghapus arsip "${item.noDokumen}" (${item.namaMitra})?`)) return;
    setData((prev) => prev.filter((d) => d.id !== id));
  };

  const filtered = data.filter(
    (item) =>
      item.namaMitra.toLowerCase().includes(search.toLowerCase()) ||
      item.noDokumen.toLowerCase().includes(search.toLowerCase())
  );

  const handleExportExcel = () => {
    const rows = filtered.map((item, index) => [
      String(index + 1),
      item.noDokumen,
      item.namaMitra,
      item.jenis,
      item.tanggalMulai,
      item.berlakuHingga,
      item.statusFollowUp,
      item.buktiFollowUp || '-',
    ]);

    const header = [
      'No',
      'No Dokumen',
      'Nama Mitra',
      'Jenis',
      'Tanggal Mulai',
      'Berlaku Hingga',
      'Follow Up',
      'Bukti',
    ];

    const content = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join('\t'))
      .join('\n');

    const blob = new Blob(['\ufeff', content], {
      type: 'application/vnd.ms-excel;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStamp = new Date().toISOString().slice(0, 10);

    link.href = url;
    link.download = `arsip-dokumen-${dateStamp}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const totalArsip = data.length;
  const tahunIni = new Date().getFullYear();
  const kadaluarsaTahunIni = data.filter((item) => {
    const parsed = new Date(item.berlakuHingga.split('/').reverse().join('-'));
    return !Number.isNaN(parsed.getTime()) && parsed.getFullYear() === tahunIni;
  }).length;
  const tidakDirespon = data.filter(
    (item) => item.statusFollowUp === 'Tidak Direspon'
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="page-title">
          Arsip Dokumen Kadaluarsa
        </h1>
        <p className="page-subtitle mt-1">
          Daftar dokumen kerjasama yang sudah melewati masa berlaku
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Arsip */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 border-l-4 border-red-500 flex items-center justify-center shrink-0">
            <Archive size={22} className="text-red-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Arsip</p>
            <p className="text-3xl font-bold text-gray-900">{totalArsip}</p>
          </div>
        </div>

        {/* Kadaluarsa Tahun Ini */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 border-l-4 border-orange-500 flex items-center justify-center shrink-0">
            <Archive size={22} className="text-orange-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">
              Kadaluarsa Tahun Ini
            </p>
            <p className="text-3xl font-bold text-gray-900">
              {kadaluarsaTahunIni}
            </p>
          </div>
        </div>

        {/* Tidak Direspon */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border-l-4 border-blue-500 flex items-center justify-center shrink-0">
            <AlertCircle size={22} className="text-blue-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">
              Tidak Direspon
            </p>
            <p className="text-3xl font-bold text-gray-900">{tidakDirespon}</p>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="card bg-slate-50 p-5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
            <Info size={18} className="text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-blue-900 text-sm mb-1.5">
              Informasi Arsip
            </h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>
                Dokumen yang sudah kadaluarsa akan secara otomatis dipindahkan
                ke arsip
              </li>
              <li>
                Data arsip dapat digunakan untuk keperluan akreditasi dan
                pelaporan
              </li>
              <li>
                Dokumen dapat diperpanjang dengan membuat pengajuan kerjasama
                baru
              </li>
              <li>Arsip dapat dihapus permanen oleh admin</li>
              <li>
                Bukti follow up menunjukkan apakah mitra telah merespon
                perpanjangan atau tidak
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Search & Export */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Cari dokumen arsip..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field w-full pl-9 pr-4 py-2.5 text-sm"
          />
        </div>
        <button
          onClick={handleExportExcel}
          className="btn-primary flex items-center gap-2 text-sm font-medium px-4 py-2.5"
        >
          <Download size={15} />
          Export Arsip
        </button>
      </div>

      {/* Table */}
      <div className="table-shell">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-head border-b border-gray-200">
                <th className="text-left py-3.5 px-4 font-semibold text-gray-700">
                  No.Dokumen
                </th>
                <th className="text-left py-3.5 px-4 font-semibold text-gray-700">
                  Nama Mitra
                </th>
                <th className="text-left py-3.5 px-4 font-semibold text-gray-700">
                  Jenis
                </th>
                <th className="text-left py-3.5 px-4 font-semibold text-gray-700">
                  Tanggal Mulai
                </th>
                <th className="text-left py-3.5 px-4 font-semibold text-gray-700">
                  Berlaku Hingga
                </th>
                <th className="text-left py-3.5 px-4 font-semibold text-gray-700">
                  Follow Up
                </th>
                <th className="text-left py-3.5 px-4 font-semibold text-gray-700">
                  Bukti
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
                    colSpan={8}
                    className="py-10 text-center text-gray-400"
                  >
                    Tidak ada data ditemukan
                  </td>
                </tr>
              )}

              {filtered.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-gray-100 hover:bg-gray-50/50 transition"
                >
                  <td className="py-3.5 px-4 font-medium text-gray-900">
                    {item.noDokumen}
                  </td>
                  <td className="py-3.5 px-4 text-gray-700">
                    {item.namaMitra}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${jenisColor[item.jenis]}`}
                    >
                      {item.jenis}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-gray-600">
                    {item.tanggalMulai}
                  </td>
                  <td className="py-3.5 px-4 text-gray-600">
                    {item.berlakuHingga}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${followUpColor[item.statusFollowUp].bg} ${followUpColor[item.statusFollowUp].text}`}
                    >
                      {item.statusFollowUp}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {item.buktiFollowUp ? (
                      <button
                        className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 text-xs font-medium"
                        title={`Download ${item.buktiFollowUp}`}
                      >
                        <FileText size={14} />
                        Lihat Bukti
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400 italic">
                        Tidak ada
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        className="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center justify-center transition"
                        title="Download Dokumen"
                      >
                        <Download size={14} className="text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition"
                        title="Hapus Arsip"
                      >
                        <Trash2 size={14} className="text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
