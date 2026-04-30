'use client';

import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Download, Filter, Search, X } from 'lucide-react';
import { getPengajuanData, type PengajuanItem } from '@/services/adminPengajuanService';

interface KerjasamaItem {
  id: number;
  noDokumen: string;
  namaMitra: string;
  jenis: 'MoU' | 'MoA' | 'IA';
  unit: string;
  tanggalMulai: string;
  berlakuHingga: string;
  tahun: string;
  status: 'Menunggu' | 'Diproses' | 'Aktif' | 'Berakhir';
}

function toDisplayDate(value?: string): string {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

function mapPengajuanToItem(item: PengajuanItem): KerjasamaItem {
  const jenis = (['MoA', 'MoU', 'IA'].includes(item.jenisDokumen) ? item.jenisDokumen : 'MoU') as KerjasamaItem['jenis'];
  const tahun = (item.tanggalMulai || item.tanggal || new Date().toISOString()).slice(0, 4);
  const statusMap: Record<string, KerjasamaItem['status']> = {
    Menunggu: 'Menunggu',
    Diproses: 'Diproses',
    Disetujui: 'Aktif',
    Ditolak: 'Berakhir',
  };
  return {
    id: item.id,
    noDokumen: `${jenis}/${String(item.id).padStart(3, '0')}/${tahun}`,
    namaMitra: item.mitra,
    jenis,
    unit: item.jurusan,
    tanggalMulai: toDisplayDate(item.tanggalMulai),
    berlakuHingga: toDisplayDate(item.tanggalBerakhir),
    tahun,
    status: statusMap[item.status] ?? 'Menunggu',
  };
}

const statusStyle: Record<KerjasamaItem['status'], string> = {
  Menunggu: 'bg-amber-100 text-amber-700',
  Diproses: 'bg-sky-100 text-sky-700',
  Aktif: 'bg-emerald-100 text-emerald-700',
  Berakhir: 'bg-rose-100 text-rose-700',
};

export default function DaftarKerjasamaEksternalPage() {
  const [data, setData] = useState<KerjasamaItem[]>([]);
  const [detailItem, setDetailItem] = useState<KerjasamaItem | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua Status');
  const [filterTahun, setFilterTahun] = useState<string | null>(null);
  const [yearPickerOpen, setYearPickerOpen] = useState(false);
  const currentYear = new Date().getFullYear();
  const [yearRangeStart, setYearRangeStart] = useState(currentYear - 4);
  const yearGrid = Array.from({ length: 12 }, (_, index) => yearRangeStart + index);

  useEffect(() => {
    const sync = () => {
      const eksternalItems = getPengajuanData()
        .filter((item) => item.kategori === 'Eksternal')
        .map(mapPengajuanToItem);
      setData(eksternalItems);
    };
    sync();
    window.addEventListener('pengajuan-data-updated', sync);
    return () => window.removeEventListener('pengajuan-data-updated', sync);
  }, []);

  const filteredItems = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return data.filter((item) => {
      const matchesSearch =
        keyword === '' ||
        item.noDokumen.toLowerCase().includes(keyword) ||
        item.namaMitra.toLowerCase().includes(keyword) ||
        item.unit.toLowerCase().includes(keyword);

      const matchesStatus = filterStatus === 'Semua Status' || item.status === filterStatus;
      const matchesTahun = filterTahun === null || item.tahun === filterTahun;

      return matchesSearch && matchesStatus && matchesTahun;
    });
  }, [data, search, filterStatus, filterTahun]);

  const handleExport = () => {
    const header = [
      'No. Dokumen',
      'Nama Mitra',
      'Jenis',
      'Unit',
      'Tanggal Mulai',
      'Berlaku Hingga',
      'Tahun',
      'Status',
    ];

    const rows = filteredItems.map((item) => [
      item.noDokumen,
      item.namaMitra,
      item.jenis,
      item.unit,
      item.tanggalMulai,
      item.berlakuHingga,
      item.tahun,
      item.status,
    ]);

    const content = [header, ...rows]
      .map((line) => line.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join('\t'))
      .join('\n');

    const blob = new Blob(['\ufeff', content], {
      type: 'application/vnd.ms-excel;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStamp = new Date().toISOString().slice(0, 10);

    link.href = url;
    link.download = `daftar-kerjasama-eksternal-${dateStamp}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Daftar Kerjasama</h1>
          <p className="text-sm text-slate-500">Kelola dan monitor semua kerjasama</p>
        </div>

        <button
          type="button"
          onClick={handleExport}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <Download size={15} />
          Export
        </button>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari berdasarkan nomor atau mitra"
              className="input-field h-10 w-full pl-9 pr-3 text-sm text-slate-700"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 text-sm font-medium text-slate-600">
              <Filter size={14} />
              Filter
            </span>

            <select
              value={filterStatus}
              onChange={(event) => setFilterStatus(event.target.value)}
              className="input-field h-10 px-3 text-sm text-slate-700"
            >
              <option>Semua Status</option>
              <option>Menunggu</option>
              <option>Diproses</option>
              <option>Aktif</option>
              <option>Berakhir</option>
            </select>

            <div className="relative">
              <button
                type="button"
                onClick={() => setYearPickerOpen((prev) => !prev)}
                className="input-field inline-flex h-10 min-w-[150px] items-center justify-between gap-2 px-3 text-sm text-slate-700"
              >
                <span>{filterTahun ?? 'Pilih Tahun'}</span>
                <CalendarDays size={15} className="text-slate-500" />
              </button>

              {yearPickerOpen && (
                <div className="absolute right-0 top-[calc(100%+8px)] z-20 w-[280px] rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
                  <div className="mb-3 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setYearRangeStart((prev) => prev - 12)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <p className="text-sm font-semibold text-slate-800">
                      {yearRangeStart} - {yearRangeStart + 11}
                    </p>
                    <button
                      type="button"
                      onClick={() => setYearRangeStart((prev) => prev + 12)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {yearGrid.map((year) => {
                      const isSelected = String(year) === filterTahun;

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
                              ? 'border-[#071B3C] bg-[#071B3C] text-white'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-[#071B3C] hover:text-[#071B3C]'
                          }`}
                        >
                          {year}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                    <p className="text-xs text-slate-500">Pilih tahun dokumen</p>
                    <button
                      type="button"
                      onClick={() => {
                        setFilterTahun(null);
                        setYearPickerOpen(false);
                      }}
                      className="text-xs font-semibold text-[#071B3C] hover:text-[#0d2b5b]"
                    >
                      Semua Tahun
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                <th className="px-4 py-3">No. Dokumen</th>
                <th className="px-4 py-3">Nama Mitra</th>
                <th className="px-4 py-3">Jenis</th>
                <th className="px-4 py-3">Unit</th>
                <th className="px-4 py-3">Tanggal Mulai</th>
                <th className="px-4 py-3">Berlaku Hingga</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    Tidak ada data kerjasama.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 text-slate-700 hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-medium text-slate-800">{item.noDokumen}</td>
                    <td className="px-4 py-3">{item.namaMitra}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700">
                        {item.jenis}
                      </span>
                    </td>
                    <td className="px-4 py-3">{item.unit}</td>
                    <td className="px-4 py-3">{item.tanggalMulai}</td>
                    <td className="px-4 py-3">{item.berlakuHingga}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusStyle[item.status]}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setDetailItem(item)}
                        className="inline-flex items-center rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t border-slate-200 pt-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>Menampilkan {filteredItems.length} dari {data.length} data</p>
          <div className="flex items-center gap-2">
            <button type="button" className="rounded-md border border-slate-200 px-3 py-1.5 text-slate-600 hover:bg-slate-50">
              Sebelumnya
            </button>
            <button type="button" className="rounded-md border border-slate-200 px-3 py-1.5 text-slate-600 hover:bg-slate-50">
              Selanjutnya
            </button>
          </div>
        </div>
      </section>

      {/* Detail Modal */}
      {detailItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Detail Kerjasama</h3>
                <p className="text-xs text-slate-500 mt-0.5">{detailItem.noDokumen}</p>
              </div>
              <button type="button" onClick={() => setDetailItem(null)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500 mb-0.5">Status</p>
                <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusStyle[detailItem.status]}`}>
                  {detailItem.status}
                </span>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500 mb-0.5">Nama Mitra</p>
                <p className="text-sm font-semibold text-slate-900">{detailItem.namaMitra}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs text-slate-500 mb-0.5">Jenis Dokumen</p>
                  <span className="inline-block rounded-md bg-slate-200 px-2 py-0.5 text-xs font-bold text-slate-700">{detailItem.jenis}</span>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs text-slate-500 mb-0.5">Unit Pelaksana</p>
                  <p className="text-sm font-medium text-slate-800">{detailItem.unit}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs text-slate-500 mb-0.5">Tanggal Mulai</p>
                  <p className="text-sm font-medium text-slate-800">{detailItem.tanggalMulai}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs text-slate-500 mb-0.5">Berlaku Hingga</p>
                  <p className="text-sm font-medium text-slate-800">{detailItem.berlakuHingga}</p>
                </div>
              </div>
            </div>
            <div className="border-t border-slate-200 px-5 py-4">
              <button
                type="button"
                onClick={() => setDetailItem(null)}
                className="w-full rounded-lg bg-[#071B3C] py-2.5 text-sm font-semibold text-white hover:bg-[#0d2b5b]"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
