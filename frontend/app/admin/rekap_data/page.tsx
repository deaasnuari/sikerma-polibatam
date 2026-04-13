'use client';

import { useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Filter, Pencil, Plus, Search, Trash2, Upload, Eye } from 'lucide-react';
import TambahDokumenModal from './TambahDokumenModal';

type RekapStatus = 'Aktif' | 'Akan Berakhir' | 'Kadaluarsa';

interface RekapDokumen {
  noDokumen: string;
  namaMitra: string;
  jenis: 'MoA' | 'MoU' | 'IA';
  unit: string;
  tanggalMulai: string;
  berlakuHingga: string;
  tahun: string;
  status: RekapStatus;
  whatsappNumber?: string;
}

interface DokumenData {
  nomorDokumen: string;
  jenisDokumen: string;
  namaPIC: string;
  kategoriMitra: string;
  namaMitra: string;
  status: string;
  jabatanMitra: string;
  emailMitra: string;
  tanggalMulai: string;
  tanggalBerakhir: string;
  alamatMitra: string;
  whatsappMitra: string;
}

const initialRekapData: RekapDokumen[] = [
  {
    noDokumen: 'MoA/001/2026',
    namaMitra: 'PT. Teknologi Maju Indonesia',
    jenis: 'MoA',
    unit: 'Teknik Informatika',
    tanggalMulai: '28 Feb 2026',
    berlakuHingga: '28 Feb 2029',
    tahun: '2026',
    status: 'Akan Berakhir',
    whatsappNumber: '6283333333333',
  },
  {
    noDokumen: 'MoU/002/2026',
    namaMitra: 'Universitas Negeri Jakarta',
    jenis: 'MoU',
    unit: 'Teknik Informatika',
    tanggalMulai: '28 Feb 2026',
    berlakuHingga: '28 Feb 2029',
    tahun: '2026',
    status: 'Aktif',
    whatsappNumber: '6282222222222',
  },
  {
    noDokumen: 'IA/002/2026',
    namaMitra: 'PT. Digita Solutions',
    jenis: 'IA',
    unit: 'Teknik Informatika',
    tanggalMulai: '28 Feb 2026',
    berlakuHingga: '28 Feb 2029',
    tahun: '2026',
    status: 'Kadaluarsa',
    whatsappNumber: '6284444444444',
  },
];

const jenisBadgeMap: Record<RekapDokumen['jenis'], string> = {
  MoA: 'bg-cyan-100 text-cyan-700',
  MoU: 'bg-violet-100 text-violet-700',
  IA: 'bg-orange-100 text-orange-700',
};

const statusBadgeMap: Record<RekapStatus, string> = {
  Aktif: 'bg-green-500 text-white',
  'Akan Berakhir': 'bg-orange-500 text-white',
  Kadaluarsa: 'bg-red-500 text-white',
};

export default function RekapDataPage() {
  const [rekapData, setRekapData] = useState<RekapDokumen[]>(initialRekapData);
  const [search, setSearch] = useState('');
  const [filterJenis, setFilterJenis] = useState('Semua Jenis');
  const [filterUnit, setFilterUnit] = useState('Semua Jurusan/unit');
  const [filterStatus, setFilterStatus] = useState('Semua Status');
  const [filterTahun, setFilterTahun] = useState<string | null>(null);
  const [yearPickerOpen, setYearPickerOpen] = useState(false);
  const [isTambahModalOpen, setIsTambahModalOpen] = useState(false);

  const jenisOptions = ['Semua Jenis', ...Array.from(new Set(rekapData.map((item) => item.jenis)))];
  const unitOptions = ['Semua Jurusan/unit', ...Array.from(new Set(rekapData.map((item) => item.unit)))];
  const statusOptions = ['Semua Status', 'Aktif', 'Akan Berakhir', 'Kadaluarsa'];
  const availableYears = useMemo(() => Array.from(new Set(rekapData.map((item) => Number(item.tahun)))).sort((a, b) => a - b), []);
  const currentYear = new Date().getFullYear();
  const defaultYearRangeStart = Math.min(currentYear - 4, availableYears[0] ?? currentYear);
  const [yearRangeStart, setYearRangeStart] = useState(defaultYearRangeStart);
  const yearGrid = Array.from({ length: 12 }, (_, index) => yearRangeStart + index);

  const filteredRows = rekapData.filter((item) => {
    const matchesJenis = filterJenis === 'Semua Jenis' || item.jenis === filterJenis;
    const matchesUnit = filterUnit === 'Semua Jurusan/unit' || item.unit === filterUnit;
    const matchesStatus = filterStatus === 'Semua Status' || item.status === filterStatus;
    const matchesTahun = filterTahun === null || item.tahun === filterTahun;
    const matchesSearch =
      search.trim() === '' || item.namaMitra.toLowerCase().includes(search.toLowerCase().trim());

    return matchesJenis && matchesUnit && matchesStatus && matchesTahun && matchesSearch;
  });

  const totalKerjasama = rekapData.length;
  const totalAktif = rekapData.filter((item) => item.status === 'Aktif').length;
  const totalAkanBerakhir = rekapData.filter((item) => item.status === 'Akan Berakhir').length;
  const totalKadaluarsa = rekapData.filter((item) => item.status === 'Kadaluarsa').length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Data Kerjasama</h1>
          <p className="mt-1 text-sm text-gray-600">Daftar seluruh dokumen kerjasama yang terdaftar di sistem</p>
        </div>
        <button
          type="button"
          onClick={() => setIsTambahModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-[#1E376C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#2B4A93]"
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

      <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-gray-800">
              <Filter size={15} />
              Filter:
            </span>

            <select
              value={filterJenis}
              onChange={(event) => setFilterJenis(event.target.value)}
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#1E376C]"
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
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#1E376C]"
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
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#1E376C]"
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
                className="inline-flex min-w-[150px] items-center justify-between gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition-colors hover:border-[#1E376C]"
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
                className="h-10 w-full rounded-md border border-gray-300 pl-10 pr-3 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-[#1E376C]"
              />
            </label>

            <button
              type="button"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#1E376C] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#2B4A93]"
            >
              <Upload size={14} />
              Export Excel
            </button>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-700">
                <th className="px-4 py-3">No.Dokumen</th>
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
                      <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${jenisBadgeMap[row.jenis]}`}>{row.jenis}</span>
                    </td>
                    <td className="px-4 py-3">{row.unit}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{row.tanggalMulai}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{row.berlakuHingga}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeMap[row.status]}`}>{row.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-3">
                        <button type="button" className="text-[#1E376C] transition-colors hover:text-[#2B4A93]" title="Lihat detail">
                          <Eye size={16} />
                        </button>
                        <button type="button" className="text-green-600 transition-colors hover:text-green-700" title="Edit dokumen">
                          <Pencil size={16} />
                        </button>
                        <button type="button" className="text-red-600 transition-colors hover:text-red-700" title="Hapus dokumen">
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

      <TambahDokumenModal
        isOpen={isTambahModalOpen}
        onClose={() => setIsTambahModalOpen(false)}
        onSubmit={(data: DokumenData) => {
          // Determine status based on dates
          const tahun = new Date(data.tanggalMulai).getFullYear().toString();
          const newDokumen: RekapDokumen = {
            noDokumen: data.nomorDokumen,
            namaMitra: data.namaMitra,
            jenis: data.jenisDokumen as 'MoA' | 'MoU' | 'IA',
            unit: 'Teknik Informatika', // Default unit, could be input
            tanggalMulai: data.tanggalMulai,
            berlakuHingga: data.tanggalBerakhir,
            tahun,
            status: (data.status as RekapStatus) || 'Aktif',
            whatsappNumber: data.whatsappMitra,
          };
          setRekapData((prev) => [newDokumen, ...prev]);
          alert(`Dokumen "${data.namaMitra}" berhasil ditambahkan dengan WhatsApp: ${data.whatsappMitra}`);
        }}
      />
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
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-xs text-gray-500">{title}</p>
      <p className={`mt-1 text-2xl font-bold ${valueClassName}`}>{value}</p>
      <p className="mt-1 text-xs text-gray-400">{caption}</p>
    </div>
  );
}
