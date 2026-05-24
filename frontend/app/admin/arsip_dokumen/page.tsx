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
import { fetchArsipDokumenFromApi } from '@/services/dokumenKerjasamaApiService';

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
  const [activeTab, setActiveTab] = useState<'akan-kadaluarsa' | 'kadaluarsa'>('akan-kadaluarsa');

  // Helper function to determine document status
  const getDocumentStatus = (berlakuHingga: string): 'akan-kadaluarsa' | 'kadaluarsa' | null => {
    const dateStr = berlakuHingga.split('/').reverse().join('-');
    const expiryDate = new Date(dateStr);
    const today = new Date();
    
    // Reset time to compare only dates
    today.setHours(0, 0, 0, 0);
    expiryDate.setHours(0, 0, 0, 0);

    if (isNaN(expiryDate.getTime())) {
      return null;
    }

    // Jika sudah berlalu
    if (expiryDate < today) {
      return 'kadaluarsa'; // Already expired
    }

    // 3 months warning threshold
    const threeMonthsFromNow = new Date(today);
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

    // Jika akan berakhir dalam 3 bulan ke depan
    if (expiryDate <= threeMonthsFromNow) {
      return 'akan-kadaluarsa'; // Will expire within 3 months
    }

    // Masih jauh dari masa berlaku, tidak perlu di arsip
    return null;
  };

  const getRowStyling = (berlakuHingga: string) => {
    const status = getDocumentStatus(berlakuHingga);
    if (status === 'kadaluarsa') {
      return 'bg-red-50/40 hover:bg-red-50';
    } else if (status === 'akan-kadaluarsa') {
      return 'bg-orange-50/30 hover:bg-orange-50';
    } else {
      return 'hover:bg-gray-50';
    }
  };

  useEffect(() => {
    let mounted = true;

    const loadArsip = async () => {
      try {
        const rows = await fetchArsipDokumenFromApi();
        if (!mounted) {
          return;
        }

        setData(
          rows.map((item) => ({
            id: item.id,
            noDokumen: item.noDokumen,
            namaMitra: item.namaMitra,
            jenis: item.jenis,
            tanggalMulai: item.tanggalMulai,
            berlakuHingga: item.berlakuHingga,
            statusFollowUp: 'Menunggu',
            buktiFollowUp: null,
          }))
        );
      } catch {
        if (mounted) {
          setData([]);
        }
      }
    };

    loadArsip();

    return () => {
      mounted = false;
    };
  }, []);

  const handleDelete = (id: number) => {
    const item = data.find((d) => d.id === id);
    if (!item) return;
    if (!confirm(`Yakin ingin menghapus arsip "${item.noDokumen}" (${item.namaMitra})?`)) return;
    setData((prev) => prev.filter((d) => d.id !== id));
  };

  // Filter dan deduplikasi berdasarkan id
  const filteredRaw = data.filter(
    (item) =>
      item.namaMitra.toLowerCase().includes(search.toLowerCase()) ||
      item.noDokumen.toLowerCase().includes(search.toLowerCase())
  );
  const seen = new Set();
  const filtered = [];
  for (const item of filteredRaw) {
    if (!seen.has(item.id)) {
      const status = getDocumentStatus(item.berlakuHingga);
      if (status === activeTab && status !== null) {
        filtered.push(item);
      }
      seen.add(item.id);
    }
  }

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

  const totalArsip = data.filter((item) => {
    const status = getDocumentStatus(item.berlakuHingga);
    return status !== null;
  }).length;
  const akanKadaluarsa = data.filter((item) => getDocumentStatus(item.berlakuHingga) === 'akan-kadaluarsa').length;
  const sudahKadaluarsa = data.filter((item) => getDocumentStatus(item.berlakuHingga) === 'kadaluarsa').length;
  const tidakDirespon = data.filter(
    (item) => item.statusFollowUp === 'Tidak Direspon'
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="page-title">
          Arsip Dokumen Kerjasama
        </h1>
        <p className="page-subtitle mt-1">
          Daftar dokumen kerjasama yang akan atau sudah kadaluarsa
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Arsip */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-50 border-l-4 border-gray-500 flex items-center justify-center shrink-0">
            <Archive size={22} className="text-gray-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Dokumen</p>
            <p className="text-3xl font-bold text-gray-900">{totalArsip}</p>
          </div>
        </div>

        {/* Akan Kadaluarsa */}
        <div className="bg-white rounded-xl border border-orange-200 shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 border-l-4 border-orange-500 flex items-center justify-center shrink-0">
            <AlertCircle size={22} className="text-orange-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">
              Akan Kadaluarsa
            </p>
            <p className="text-3xl font-bold text-orange-700">
              {akanKadaluarsa}
            </p>
          </div>
        </div>

        {/* Sudah Kadaluarsa */}
        <div className="bg-white rounded-xl border border-red-200 shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 border-l-4 border-red-500 flex items-center justify-center shrink-0">
            <Archive size={22} className="text-red-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">
              Sudah Kadaluarsa
            </p>
            <p className="text-3xl font-bold text-red-700">{sudahKadaluarsa}</p>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="card bg-blue-50 border border-blue-200 p-5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
            <Info size={18} className="text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-blue-900 text-sm mb-2">
              Panduan Arsip Dokumen
            </h3>
            <ul className="text-sm text-blue-800 space-y-1.5 list-disc list-inside">
              <li>
                <span className="font-semibold">Akan Kadaluarsa (⏰)</span>: Dokumen yang akan berakhir dalam 3 bulan ke depan
              </li>
              <li>
                <span className="font-semibold">Sudah Kadaluarsa (❌)</span>: Dokumen yang sudah melampaui tanggal berlaku
              </li>
              <li>
                Dokumen yang sudah kadaluarsa dapat diperpanjang dengan membuat pengajuan kerjasama baru
              </li>
              <li>
                Arsip dapat dihapus permanen oleh admin jika tidak diperlukan lagi
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('akan-kadaluarsa')}
          className={`px-4 py-3 font-semibold text-sm border-b-2 transition ${
            activeTab === 'akan-kadaluarsa'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          ⏰ Akan Kadaluarsa ({akanKadaluarsa})
        </button>
        <button
          onClick={() => setActiveTab('kadaluarsa')}
          className={`px-4 py-3 font-semibold text-sm border-b-2 transition ${
            activeTab === 'kadaluarsa'
              ? 'border-red-500 text-red-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          ❌ Sudah Kadaluarsa ({sudahKadaluarsa})
        </button>
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
                  Status
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
                    colSpan={9}
                    className="py-10 text-center text-gray-400"
                  >
                    Tidak ada data ditemukan
                  </td>
                </tr>
              )}

              {filtered.map((item) => (
                <tr
                  key={item.id}
                  className={`border-b border-gray-100 transition ${getRowStyling(item.berlakuHingga)}`}
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
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        getDocumentStatus(item.berlakuHingga) === 'kadaluarsa'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}
                    >
                      {getDocumentStatus(item.berlakuHingga) === 'kadaluarsa' ? '❌ Kadaluarsa' : '⏰ Akan Kadaluarsa'}
                    </span>
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
