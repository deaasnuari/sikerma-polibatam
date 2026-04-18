'use client';

import { useMemo, useState } from 'react';
import { Download, Eye, Filter, Search } from 'lucide-react';

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

const kerjasamaItems: KerjasamaItem[] = [
  {
    id: 1,
    noDokumen: 'MoU/001/2026',
    namaMitra: 'PT Teknologi Maju Indonesia',
    jenis: 'MoU',
    unit: 'Teknik Informatika',
    tanggalMulai: '20 Feb 2026',
    berlakuHingga: '20 Feb 2028',
    tahun: '2026',
    status: 'Menunggu',
  },
  {
    id: 2,
    noDokumen: 'MoA/002/2026',
    namaMitra: 'PT Teknologi Maju Indonesia',
    jenis: 'MoA',
    unit: 'Jurusan Teknik',
    tanggalMulai: '27 Feb 2026',
    berlakuHingga: '27 Feb 2028',
    tahun: '2026',
    status: 'Aktif',
  },
  {
    id: 3,
    noDokumen: 'IA/003/2026',
    namaMitra: 'PT Teknologi Maju Indonesia',
    jenis: 'IA',
    unit: 'Teknik Elektro',
    tanggalMulai: '26 Feb 2026',
    berlakuHingga: '26 Feb 2027',
    tahun: '2026',
    status: 'Diproses',
  },
  {
    id: 4,
    noDokumen: 'MoU/004/2025',
    namaMitra: 'PT Teknologi Maju Indonesia',
    jenis: 'MoU',
    unit: 'Teknik Mesin',
    tanggalMulai: '25 Feb 2026',
    berlakuHingga: '25 Feb 2028',
    tahun: '2025',
    status: 'Berakhir',
  },
  {
    id: 5,
    noDokumen: 'MoA/005/2025',
    namaMitra: 'PT Teknologi Maju Indonesia',
    jenis: 'MoA',
    unit: 'Teknik Industri',
    tanggalMulai: '24 Feb 2026',
    berlakuHingga: '24 Feb 2029',
    tahun: '2025',
    status: 'Aktif',
  },
  {
    id: 6,
    noDokumen: 'IA/006/2025',
    namaMitra: 'PT Teknologi Maju Indonesia',
    jenis: 'IA',
    unit: 'Jurusan Teknik',
    tanggalMulai: '23 Feb 2026',
    berlakuHingga: '23 Feb 2027',
    tahun: '2025',
    status: 'Aktif',
  },
  {
    id: 7,
    noDokumen: 'MoU/007/2024',
    namaMitra: 'PT Teknologi Maju Indonesia',
    jenis: 'MoU',
    unit: 'Teknik Elektro',
    tanggalMulai: '22 Feb 2026',
    berlakuHingga: '22 Feb 2029',
    tahun: '2024',
    status: 'Menunggu',
  },
];

const statusStyle: Record<KerjasamaItem['status'], string> = {
  Menunggu: 'bg-amber-100 text-amber-700',
  Diproses: 'bg-sky-100 text-sky-700',
  Aktif: 'bg-emerald-100 text-emerald-700',
  Berakhir: 'bg-rose-100 text-rose-700',
};

export default function DaftarKerjasamaEksternalPage() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua Status');
  const [filterTahun, setFilterTahun] = useState('Semua Tahun');

  const filteredItems = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return kerjasamaItems.filter((item) => {
      const matchesSearch =
        keyword === '' ||
        item.noDokumen.toLowerCase().includes(keyword) ||
        item.namaMitra.toLowerCase().includes(keyword) ||
        item.unit.toLowerCase().includes(keyword);

      const matchesStatus = filterStatus === 'Semua Status' || item.status === filterStatus;
      const matchesTahun = filterTahun === 'Semua Tahun' || item.tahun === filterTahun;

      return matchesSearch && matchesStatus && matchesTahun;
    });
  }, [search, filterStatus, filterTahun]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Daftar Kerjasama</h1>
          <p className="text-sm text-slate-500">Kelola dan monitor semua kerjasama</p>
        </div>

        <button
          type="button"
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

            <select
              value={filterTahun}
              onChange={(event) => setFilterTahun(event.target.value)}
              className="input-field h-10 px-3 text-sm text-slate-700"
            >
              <option>Semua Tahun</option>
              <option>2026</option>
              <option>2025</option>
              <option>2024</option>
            </select>
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
                <th className="px-4 py-3">View</th>
                <th className="px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
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
                      <button type="button" className="text-slate-500 hover:text-slate-800">
                        <Eye size={16} />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
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
          <p>Menampilkan {filteredItems.length} dari {kerjasamaItems.length} data</p>
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
    </div>
  );
}
