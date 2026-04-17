'use client';

import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Filter, Pencil, Plus, Search, Trash2, Upload, Eye } from 'lucide-react';
import TambahDokumenModal from './TambahDokumenModal';
import {
  addRekapDokumen,
  createDokumenFormData,
  deleteRekapDokumen,
  filterRekapData,
  getAvailableYears,
  getRekapData,
  getRekapJenisOptions,
  getRekapStats,
  getRekapUnitOptions,
  rekapJenisBadgeMap,
  rekapStatusBadgeMap,
  rekapStatusOptions,
  updateRekapDokumen,
  type DokumenData,
  type RekapDokumen,
} from '@/services/adminRekapDataService';

export default function RekapDataPage() {
  const [rekapData, setRekapData] = useState<RekapDokumen[]>([]);
  const [search, setSearch] = useState('');
  const [filterJenis, setFilterJenis] = useState('Semua Jenis');
  const [filterUnit, setFilterUnit] = useState('Semua Jurusan/unit');
  const [filterStatus, setFilterStatus] = useState('Semua Status');
  const [filterTahun, setFilterTahun] = useState<string | null>(null);
  const [yearPickerOpen, setYearPickerOpen] = useState(false);
  const [isTambahModalOpen, setIsTambahModalOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<RekapDokumen | null>(null);
  const [editingItem, setEditingItem] = useState<RekapDokumen | null>(null);

  useEffect(() => {
    const syncRekapData = () => {
      setRekapData(getRekapData());
    };

    syncRekapData();
    window.addEventListener('rekap-data-updated', syncRekapData);

    return () => window.removeEventListener('rekap-data-updated', syncRekapData);
  }, []);

  const jenisOptions = getRekapJenisOptions(rekapData);
  const unitOptions = getRekapUnitOptions(rekapData);
  const statusOptions = rekapStatusOptions;
  const availableYears = useMemo(() => getAvailableYears(rekapData), [rekapData]);
  const currentYear = new Date().getFullYear();
  const defaultYearRangeStart = Math.min(currentYear - 4, availableYears[0] ?? currentYear);
  const [yearRangeStart, setYearRangeStart] = useState(defaultYearRangeStart);
  const yearGrid = Array.from({ length: 12 }, (_, index) => yearRangeStart + index);

  const filteredRows = filterRekapData(rekapData, {
    filterJenis,
    filterUnit,
    filterStatus,
    filterTahun,
    search,
  });

  const { totalKerjasama, totalAktif, totalAkanBerakhir, totalKadaluarsa } = getRekapStats(rekapData);

  function handleDelete(item: RekapDokumen) {
    const isConfirmed = window.confirm(`Yakin ingin menghapus dokumen ${item.noDokumen}?`);

    if (!isConfirmed) {
      return;
    }

    deleteRekapDokumen(item.noDokumen);
    if (detailItem?.noDokumen === item.noDokumen) {
      setDetailItem(null);
    }
    alert(`Dokumen ${item.noDokumen} berhasil dihapus.`);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="page-title">Data Kerjasama</h1>
          <p className="page-subtitle mt-1">Daftar seluruh dokumen kerjasama yang terdaftar di sistem</p>
        </div>
        <button
          type="button"
          onClick={() => setIsTambahModalOpen(true)}
          className="btn-primary inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold shadow-sm"
        >
          <Plus size={16} />
          Tambah Dokumen
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <StatCard title="Total Kerjasama" value={totalKerjasama} caption="Semua dokumen" valueClassName="text-gray-900" />
        <StatCard title="Aktif" value={totalAktif} caption="Masa berlaku > 3 bulan" valueClassName="text-green-600" />
        <StatCard
          title="Akan Berakhir"
          value={totalAkanBerakhir}
          caption="Masa berlaku < 3 bulan"
          valueClassName="text-orange-600"
        />
        <StatCard title="Kadaluarsa" value={totalKadaluarsa} caption="Sudah berakhir" valueClassName="text-red-600" />
      </div>

      <section className="toolbar-shell p-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-gray-800">
              <Filter size={15} />
              Filter:
            </span>

            <select
              value={filterJenis}
              onChange={(event) => setFilterJenis(event.target.value)}
              className="input-field px-3 py-2 text-sm text-gray-700"
            >
              {jenisOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <select
              value={filterUnit}
              onChange={(event) => setFilterUnit(event.target.value)}
              className="input-field px-3 py-2 text-sm text-gray-700"
            >
              {unitOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(event) => setFilterStatus(event.target.value)}
              className="input-field px-3 py-2 text-sm text-gray-700"
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <div className="relative">
              <button
                type="button"
                onClick={() => setYearPickerOpen((prev) => !prev)}
                className="input-field inline-flex min-w-[150px] items-center justify-between gap-2 px-3 py-2 text-sm text-gray-700 transition-colors"
              >
                <span>{filterTahun ?? 'Pilih Tahun'}</span>
                <CalendarDays size={16} className="text-gray-500" />
              </button>

              {yearPickerOpen && (
                <div className="absolute right-0 top-[calc(100%+8px)] z-20 w-[280px] rounded-xl border border-gray-200 bg-white p-3 shadow-lg">
                  <div className="mb-3 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setYearRangeStart((prev) => prev - 12)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <p className="text-sm font-semibold text-gray-800">
                      {yearRangeStart} - {yearRangeStart + 11}
                    </p>
                    <button
                      type="button"
                      onClick={() => setYearRangeStart((prev) => prev + 12)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {yearGrid.map((year) => {
                      const isSelected = String(year) === filterTahun;
                      const hasData = availableYears.includes(year);

                      return (
                        <button
                          key={year}
                          type="button"
                          onClick={() => {
                            setFilterTahun(String(year));
                            setYearPickerOpen(false);
                          }}
                          className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                            isSelected
                              ? 'border-[#1E376C] bg-[#1E376C] text-white'
                              : hasData
                                ? 'border-gray-200 bg-white text-gray-800 hover:border-[#1E376C] hover:text-[#1E376C]'
                                : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200'
                          }`}
                        >
                          {year}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
                    <p className="text-xs text-gray-500">Pilih tahun untuk menampilkan data tahunan</p>
                    <button
                      type="button"
                      onClick={() => {
                        setFilterTahun(null);
                        setYearPickerOpen(false);
                      }}
                      className="text-xs font-semibold text-[#1E376C] transition-colors hover:text-[#2B4A93]"
                    >
                      Semua Tahun
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <label className="relative w-full">
              <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari berdasarkan nama mitra"
                className="input-field h-10 w-full pl-10 pr-3 text-sm text-gray-700 placeholder:text-gray-400"
              />
            </label>

            <button
              type="button"
              className="btn-primary inline-flex h-10 items-center justify-center gap-2 px-4 text-sm font-semibold"
            >
              <Upload size={14} />
              Export Excel
            </button>
          </div>
        </div>
      </section>

      <section className="table-shell">
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full border-collapse">
            <thead>
              <tr className="table-head border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wide text-gray-700">
                <th className="px-4 py-3">No.Dokumen</th>
                <th className="px-4 py-3">Nama Mitra</th>
                <th className="px-4 py-3">Jenis</th>
                <th className="px-4 py-3">Jurusan / Unit</th>
                <th className="px-4 py-3">Tanggal mulai</th>
                <th className="px-4 py-3">Berlaku Hingga</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-500">
                    Data tidak ditemukan berdasarkan filter saat ini.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => (
                  <tr key={row.noDokumen} className="border-b border-gray-100 text-sm text-gray-700 hover:bg-gray-50/60">
                    <td className="px-4 py-3 text-xs text-gray-600">{row.noDokumen}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{row.namaMitra}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${rekapJenisBadgeMap[row.jenis]}`}>{row.jenis}</span>
                    </td>
                    <td className="px-4 py-3">{row.unit}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{row.tanggalMulai}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{row.berlakuHingga}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${rekapStatusBadgeMap[row.status]}`}>{row.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => setDetailItem(row)}
                          className="text-[#1E376C] transition-colors hover:text-[#2B4A93]"
                          title="Lihat detail"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingItem(row)}
                          className="text-green-600 transition-colors hover:text-green-700"
                          title="Edit dokumen"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(row)}
                          className="text-red-600 transition-colors hover:text-red-700"
                          title="Hapus dokumen"
                        >
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
      </section>

      {detailItem && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/35 px-4 py-8 backdrop-blur-[2px]">
          <div className="w-full max-w-2xl rounded-[24px] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-[#1E376C]">Detail Dokumen</h2>
                <p className="text-sm text-gray-500 mt-1">Informasi lengkap dokumen rekap kerjasama</p>
              </div>
              <button
                type="button"
                onClick={() => setDetailItem(null)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 text-sm">
              <InfoItem label="No. Dokumen" value={detailItem.noDokumen} />
              <InfoItem label="Jenis Dokumen" value={detailItem.jenis} />
              <InfoItem label="Nama Mitra" value={detailItem.namaMitra} />
              <InfoItem label="Kategori Asal" value={detailItem.kategoriUnit || 'Jurusan / Unit'} />
              <InfoItem label="Jurusan / Unit" value={detailItem.unit} />
              <InfoItem label="Tanggal Mulai" value={detailItem.tanggalMulai} />
              <InfoItem label="Berlaku Hingga" value={detailItem.berlakuHingga} />
              <InfoItem label="Tahun" value={detailItem.tahun} />
              <InfoItem label="Status" value={detailItem.status} />
              <InfoItem label="WhatsApp" value={detailItem.whatsappNumber || '-'} />
            </div>
          </div>
        </div>
      )}

      <TambahDokumenModal
        isOpen={isTambahModalOpen}
        onClose={() => setIsTambahModalOpen(false)}
        title="+ Tambah Dokumen Baru"
        submitLabel="Tambah Dokumen"
        onSubmit={(data: DokumenData) => {
          addRekapDokumen(data);
          alert(`Dokumen "${data.namaMitra}" berhasil ditambahkan dengan WhatsApp: ${data.whatsappMitra}`);
        }}
      />

      <TambahDokumenModal
        isOpen={Boolean(editingItem)}
        onClose={() => setEditingItem(null)}
        initialData={editingItem ? createDokumenFormData(editingItem) : null}
        title="Edit Dokumen"
        submitLabel="Simpan Perubahan"
        onSubmit={(data: DokumenData) => {
          if (!editingItem) {
            return;
          }

          updateRekapDokumen(editingItem.noDokumen, data);
          setEditingItem(null);
          alert(`Dokumen "${data.namaMitra}" berhasil diperbarui.`);
        }}
      />
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-slate-50 px-4 py-3">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-gray-800">{value}</p>
    </div>
  );
}

function StatCard({
  title,
  value,
  caption,
  valueClassName,
}: {
  title: string;
  value: number;
  caption: string;
  valueClassName: string;
}) {
  return (
    <div className="stat-card p-4">
      <p className="text-xs text-gray-500">{title}</p>
      <p className={`mt-1 text-2xl font-bold ${valueClassName}`}>{value}</p>
      <p className="mt-1 text-xs text-gray-400">{caption}</p>
    </div>
  );
}
