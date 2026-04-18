'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Download, Eye, Pencil, Search, Trash2 } from 'lucide-react';

type ApprovalStatus = 'Menunggu' | 'Disetujui' | 'Ditolak';
type Jenis = 'MoU' | 'MoA' | 'IA';

interface KerjasamaItem {
  noDokumen: string;
  namaMitra: string;
  jenis: Jenis;
  unit: string;
  tanggalMulai: string;
  berlakuHingga: string;
  status: ApprovalStatus;
}

const defaultData: KerjasamaItem[] = [
  { noDokumen: 'MoU/001/2026', namaMitra: 'PT. Teknologi Maju Indonesia', jenis: 'MoU', unit: 'Teknik Informatika', tanggalMulai: '28 Feb 2026', berlakuHingga: '28 Feb 2029', status: 'Menunggu' },
  { noDokumen: 'MoA/002/2026', namaMitra: 'PT. Teknologi Maju Indonesia', jenis: 'MoA', unit: 'Jurusan Teknik', tanggalMulai: '27 Feb 2026', berlakuHingga: '28 Feb 2028', status: 'Disetujui' },
  { noDokumen: 'IA/003/2026', namaMitra: 'PT. Teknologi Maju Indonesia', jenis: 'IA', unit: 'Teknik Elektro', tanggalMulai: '26 Feb 2026', berlakuHingga: '26 Feb 2027', status: 'Menunggu' },
  { noDokumen: 'MoU/004/2026', namaMitra: 'PT. Teknologi Maju Indonesia', jenis: 'MoU', unit: 'Teknik Multimedia', tanggalMulai: '25 Feb 2026', berlakuHingga: '-', status: 'Ditolak' },
  { noDokumen: 'MoA/005/2026', namaMitra: 'PT. Teknologi Maju Indonesia', jenis: 'MoA', unit: 'Teknik Mesin', tanggalMulai: '24 Feb 2026', berlakuHingga: '24 Feb 2029', status: 'Disetujui' },
  { noDokumen: 'MoA/006/2026', namaMitra: 'PT. Teknologi Maju Indonesia', jenis: 'MoA', unit: 'Teknik Informatika', tanggalMulai: '23 Feb 2026', berlakuHingga: '28 Feb 2027', status: 'Disetujui' },
  { noDokumen: 'IA/007/2026', namaMitra: 'PT. Teknologi Maju Indonesia', jenis: 'IA', unit: 'Jurusan Teknik', tanggalMulai: '22 Feb 2026', berlakuHingga: '22 Feb 2029', status: 'Disetujui' },
  { noDokumen: 'MoU/008/2026', namaMitra: 'PT. Teknologi Maju Indonesia', jenis: 'MoU', unit: 'Teknik Mesin', tanggalMulai: '21 Feb 2026', berlakuHingga: '21 Feb 2028', status: 'Menunggu' },
];

const jenisBadgeMap: Record<Jenis, string> = {
  MoU: 'bg-violet-100 text-violet-700',
  MoA: 'bg-cyan-100 text-cyan-700',
  IA: 'bg-orange-100 text-orange-700',
};

const statusBadgeMap: Record<ApprovalStatus, string> = {
  Menunggu: 'bg-orange-500 text-white',
  Disetujui: 'bg-green-500 text-white',
  Ditolak: 'bg-red-500 text-white',
};

const jurusanOptions = ['Semua Jurusan', 'Teknik Informatika', 'Teknik Elektro', 'Teknik Mesin', 'Teknik Multimedia', 'Jurusan Teknik'];
const jenisOptions = ['Semua Jenis', 'MoU', 'MoA', 'IA'];
const statusOptions = ['Semua Status', 'Menunggu', 'Disetujui', 'Ditolak'];

const ITEMS_PER_PAGE = 10;

export default function InternalRekapDataPage() {
  const [search, setSearch] = useState('');
  const [filterJurusan, setFilterJurusan] = useState('Semua Jurusan');
  const [filterJenis, setFilterJenis] = useState('Semua Jenis');
  const [filterStatus, setFilterStatus] = useState('Semua Status');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = useMemo(() => {
    return defaultData.filter((item) => {
      const keyword = search.toLowerCase().trim();
      const matchesSearch =
        keyword === '' ||
        item.namaMitra.toLowerCase().includes(keyword) ||
        item.noDokumen.toLowerCase().includes(keyword);
      const matchesJurusan = filterJurusan === 'Semua Jurusan' || item.unit === filterJurusan;
      const matchesJenis = filterJenis === 'Semua Jenis' || item.jenis === filterJenis;
      const matchesStatus = filterStatus === 'Semua Status' || item.status === filterStatus;
      return matchesSearch && matchesJurusan && matchesJenis && matchesStatus;
    });
  }, [search, filterJurusan, filterJenis, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / ITEMS_PER_PAGE));
  const paginatedData = filteredData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="page-title">Daftar Kerjasama</h1>
          <p className="page-subtitle mt-1">Kelola dan monitor semua kerjasama</p>
        </div>
        <button
          type="button"
          className="btn-secondary inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold shadow-sm"
        >
          <Download size={16} />
          Export
        </button>
      </div>

      {/* Filters */}
      <section className="toolbar-shell p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <label className="relative w-full md:max-w-md">
            <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="Cari berdasarkan nama mitra atau nomor..."
              className="input-field h-10 w-full pl-10 pr-3 text-sm text-gray-700 placeholder:text-gray-400"
            />
          </label>

          <div className="flex flex-wrap items-center gap-2 md:ml-auto">
            <select
              value={filterJurusan}
              onChange={(e) => { setFilterJurusan(e.target.value); setCurrentPage(1); }}
              className="input-field px-3 py-2 text-sm text-gray-700"
            >
              {jurusanOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>

            <select
              value={filterJenis}
              onChange={(e) => { setFilterJenis(e.target.value); setCurrentPage(1); }}
              className="input-field px-3 py-2 text-sm text-gray-700"
            >
              {jenisOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
              className="input-field px-3 py-2 text-sm text-gray-700"
            >
              {statusOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Table */}
      <section className="table-shell">
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full border-collapse">
            <thead>
              <tr className="table-head border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wide text-gray-700">
                <th className="px-4 py-3">No. Dokumen</th>
                <th className="px-4 py-3">Nama Mitra</th>
                <th className="px-4 py-3">Jenis</th>
                <th className="px-4 py-3">Unit</th>
                <th className="px-4 py-3">Tanggal mulai</th>
                <th className="px-4 py-3">Berlaku Hingga</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-500">
                    Data tidak ditemukan berdasarkan filter saat ini.
                  </td>
                </tr>
              ) : (
                paginatedData.map((row) => (
                  <tr key={row.noDokumen} className="border-b border-gray-100 text-sm text-gray-700 hover:bg-gray-50/60">
                    <td className="px-4 py-3 text-xs text-gray-600">{row.noDokumen}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{row.namaMitra}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${jenisBadgeMap[row.jenis]}`}>
                        {row.jenis}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block rounded-full bg-[#1E376C] px-3 py-1 text-xs font-medium text-white">
                        {row.unit}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{row.tanggalMulai}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{row.berlakuHingga}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeMap[row.status]}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-3">
                        <button type="button" className="text-[#1E376C] transition-colors hover:text-[#2B4A93]" title="Lihat detail">
                          <Eye size={16} />
                        </button>
                        <button type="button" className="text-green-600 transition-colors hover:text-green-700" title="Edit">
                          <Pencil size={16} />
                        </button>
                        <button type="button" className="text-red-600 transition-colors hover:text-red-700" title="Hapus">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-200 px-4 py-3 sm:flex-row">
          <p className="text-sm text-gray-500">
            Menampilkan {paginatedData.length} dari {filteredData.length} data
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={14} />
              Sebelumnya
            </button>
            <span className="inline-flex h-8 min-w-[2rem] items-center justify-center rounded-lg bg-[#1E376C] px-2 text-sm font-semibold text-white">
              {currentPage}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Selanjutnya
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
