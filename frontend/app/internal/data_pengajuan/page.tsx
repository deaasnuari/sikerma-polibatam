'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock3,
  Eye,
  FileText,
  Filter,
  MessageSquareText,
  Plus,
  Search,
  XCircle,
} from 'lucide-react';
import {
  getFilteredPengajuanData,
  getPengajuanData,
  getPengajuanStats,
  pengajuanDokumenBadge,
  pengajuanJurusanOptions,
  pengajuanUnitOptions,
  type PengajuanItem,
  type PengajuanStatus,
} from '@/services/adminPengajuanService';
import AjukanKerjasamaForm from './AjukanKerjasamaForm';

const statusConfig: Record<PengajuanStatus, { className: string; icon: React.ReactNode }> = {
  Menunggu: {
    className: 'bg-amber-100 text-amber-700',
    icon: <Clock3 size={13} />,
  },
  Diproses: {
    className: 'bg-sky-100 text-sky-700',
    icon: <Clock3 size={13} />,
  },
  Disetujui: {
    className: 'bg-emerald-100 text-emerald-700',
    icon: <CheckCircle2 size={13} />,
  },
  Ditolak: {
    className: 'bg-rose-100 text-rose-700',
    icon: <XCircle size={13} />,
  },
};

const reviewCopy: Record<PengajuanStatus, string> = {
  Menunggu: 'Pengajuan sudah masuk dan sedang menunggu review dari admin.',
  Diproses: 'Admin sedang memeriksa detail pengajuan kerja sama ini.',
  Disetujui: 'Pengajuan sudah disetujui admin dan siap ditindaklanjuti.',
  Ditolak: 'Pengajuan belum disetujui admin. Silakan cek catatan review.',
};

const unitKeywords = ['upt', 'upa', 'pokja', 'subag', 'spi', 'p3m', 'p4m', 'shilau', 'sbum', 'akademik'];

function isUnitValue(value: string) {
  const normalized = value.toLowerCase();
  return pengajuanUnitOptions.includes(value) || unitKeywords.some((keyword) => normalized.includes(keyword));
}

export default function InternalDataPengajuanPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAjukanView = searchParams.get('mode') === 'ajukan';
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua Status');
  const [filterKategori, setFilterKategori] = useState<'Semua' | 'Jurusan' | 'Unit'>('Semua');
  const [filterJurusan, setFilterJurusan] = useState('Semua Jurusan/unit');
  const [pengajuanData, setPengajuanData] = useState<PengajuanItem[]>([]);

  useEffect(() => {
    const syncPengajuan = () => {
      const internalOnly = getPengajuanData().filter((item) => item.kategori === 'Internal');
      setPengajuanData(internalOnly);
    };

    syncPengajuan();
    window.addEventListener('pengajuan-data-updated', syncPengajuan);
    return () => window.removeEventListener('pengajuan-data-updated', syncPengajuan);
  }, []);

  const jurusanOptions = useMemo(() => {
    const currentValues = pengajuanData.map((item) => item.jurusan);

    if (filterKategori === 'Jurusan') {
      return [...new Set([...pengajuanJurusanOptions, ...currentValues.filter((value) => !isUnitValue(value))])];
    }

    if (filterKategori === 'Unit') {
      return [...new Set([...pengajuanUnitOptions, ...currentValues.filter((value) => isUnitValue(value))])];
    }

    return [...new Set([...pengajuanJurusanOptions, ...pengajuanUnitOptions, ...currentValues])];
  }, [filterKategori, pengajuanData]);

  const filteredItems = useMemo(() => {
    const baseItems = getFilteredPengajuanData(pengajuanData, {
      filterStatus,
      filterJurusan,
      filterTahun: 'Semua Tahun',
      search,
    });

    if (filterKategori === 'Jurusan') {
      return baseItems.filter((item) => !isUnitValue(item.jurusan));
    }

    if (filterKategori === 'Unit') {
      return baseItems.filter((item) => isUnitValue(item.jurusan));
    }

    return baseItems;
  }, [pengajuanData, filterStatus, filterJurusan, search, filterKategori]);

  const stats = getPengajuanStats(pengajuanData);

  if (isAjukanView) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Pengajuan Kerjasama</h2>
          <p className="text-sm text-slate-500">Form pengajuan sekarang ditempatkan langsung di dalam menu data pengajuan.</p>
        </div>

        <AjukanKerjasamaForm
          onCancel={() => router.replace('/internal/data_pengajuan')}
          onSubmitted={() => router.replace('/internal/data_pengajuan')}
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Pengajuan Kerjasama</h2>
          <p className="text-sm text-slate-500">
            Daftar pengajuan internal akan otomatis mengikuti hasil review dari admin.
          </p>
        </div>
        <Link href="/internal/data_pengajuan?mode=ajukan" className="btn-primary px-4 py-2.5 text-sm font-semibold">
          <Plus size={16} />
          Ajukan Kerjasama Baru
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Pengajuan</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{stats.totalPengajuan}</p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Menunggu</p>
          <p className="mt-2 text-3xl font-bold text-amber-700">{stats.menunggu}</p>
        </div>
        <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">Diproses</p>
          <p className="mt-2 text-3xl font-bold text-sky-700">{stats.diproses}</p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Disetujui</p>
          <p className="mt-2 text-3xl font-bold text-emerald-700">{stats.disetujui}</p>
        </div>
      </div>

      <div className="toolbar-shell p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
            <Filter size={15} />
            Filter:
          </div>

          <div className="inline-flex overflow-hidden rounded-lg border border-slate-300 bg-white">
            {(['Semua', 'Jurusan', 'Unit'] as const).map((kategori) => (
              <button
                key={kategori}
                type="button"
                onClick={() => {
                  setFilterKategori(kategori);
                  setFilterJurusan('Semua Jurusan/unit');
                }}
                className={`px-3 py-2 text-sm font-semibold transition ${
                  filterKategori === kategori
                    ? 'bg-[#173B82] text-white'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {kategori}
              </button>
            ))}
          </div>

          <select
            value={filterJurusan}
            onChange={(e) => setFilterJurusan(e.target.value)}
            className="input-field min-w-[220px] px-3 py-2 text-sm text-gray-700 cursor-pointer"
          >
            <option value="Semua Jurusan/unit">
              {filterKategori === 'Jurusan'
                ? 'Semua Jurusan'
                : filterKategori === 'Unit'
                  ? 'Semua Unit'
                  : 'Semua Jurusan/unit'}
            </option>
            {jurusanOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field px-3 py-2 text-sm text-gray-700 cursor-pointer"
          >
            <option>Semua Status</option>
            <option>Menunggu</option>
            <option>Diproses</option>
            <option>Disetujui</option>
            <option>Ditolak</option>
          </select>

          <div className="relative flex-1 min-w-[220px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                filterKategori === 'Jurusan'
                  ? 'Cari judul, mitra, pengusul, atau jurusan'
                  : filterKategori === 'Unit'
                    ? 'Cari judul, mitra, pengusul, atau unit'
                    : 'Cari judul, mitra, pengusul, atau jurusan/unit'
              }
              className="input-field w-full pl-9 pr-3 py-2 text-sm text-gray-700"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500 shadow-sm">
            Belum ada pengajuan internal yang masuk.
          </div>
        ) : (
          filteredItems.map((item) => {
            const sc = statusConfig[item.status];

            return (
              <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{item.judul}</h3>
                      <p className="text-xs text-slate-500">
                        Pengusul: {item.pengusul} • {item.tanggal}
                      </p>
                    </div>

                    <div className="grid gap-3 text-sm text-slate-700 sm:grid-cols-3">
                      <div>
                        <p className="text-xs text-slate-400">Mitra Tujuan</p>
                        <p className="font-semibold">{item.mitra}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Jenis Dokumen</p>
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${pengajuanDokumenBadge[item.jenisDokumen] || 'bg-slate-100 text-slate-700'}`}>
                          {item.jenisDokumen}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Jurusan / Unit</p>
                        <p className="font-semibold">{item.jurusan}</p>
                      </div>
                    </div>
                  </div>

                  <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${sc.className}`}>
                    {sc.icon}
                    {item.status}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    {item.ruangLingkup.map((scope) => (
                      <span key={`${item.id}-${scope}`} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                        {scope}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-5 text-sm">
                    <button type="button" className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-900">
                      <Eye size={16} />
                      <span className="underline underline-offset-2">Lihat Detail</span>
                    </button>
                    <button type="button" className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700">
                      <MessageSquareText size={16} />
                      <span>Review</span>
                    </button>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-[#173B82]">
                    <FileText size={15} />
                    Hasil Review Admin
                  </div>
                  <p className="text-sm text-slate-600">{item.reviewComment || reviewCopy[item.status]}</p>
                  {item.reviewedAt && (
                    <p className="mt-2 text-xs text-slate-500">
                      Diperbarui oleh {item.reviewedBy || 'Admin'} pada {item.reviewedAt}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
