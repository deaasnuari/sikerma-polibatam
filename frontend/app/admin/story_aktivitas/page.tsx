'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Activity,
  Building2,
  CalendarClock,
  ChevronDown,
  Eye,
  Filter,
  FolderKanban,
  Search,
  Users,
} from 'lucide-react';
import { getHiddenStoryIds, refreshAktivitasDataFromApi } from '@/services/adminStoryAktivitasService';
import {
  getPengajuanData,
  refreshPengajuanDataFromApi,
  type PengajuanItem,
} from '@/services/adminPengajuanService';
import {
  groupStoryAktivitasByMitra,
  type StoryAktivitasGroup,
  type StoryAktivitasTimelineItem,
} from '@/services/storyAktivitasGrouping';

function parseDate(value?: string): Date | null {
  if (!value) {
    return null;
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    const [day, month, year] = value.split('/').map(Number);
    const parsed = new Date(year, month - 1, day);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatTimelineDate(value?: string): string {
  const parsed = parseDate(value);
  if (!parsed) {
    return '-';
  }

  return parsed.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function statusBadge(status: StoryAktivitasGroup['status']): string {
  if (status === 'Aktif') {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }

  if (status === 'Akan Berakhir') {
    return 'bg-amber-50 text-amber-700 border-amber-200';
  }

  return 'bg-rose-50 text-rose-700 border-rose-200';
}

function timelineColor(status: StoryAktivitasTimelineItem['status']): string {
  if (status === 'selesai') {
    return 'bg-emerald-500';
  }

  if (status === 'berlangsung') {
    return 'bg-blue-500';
  }

  return 'bg-amber-500';
}

function normalizeSearchText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export default function StoryAktivitasPage() {
  const router = useRouter();
  const [filterJenis, setFilterJenis] = useState('Semua Jenis');
  const [filterStatus, setFilterStatus] = useState('Semua Status');
  const [filterTahun, setFilterTahun] = useState('Semua Tahun');
  const [search, setSearch] = useState('');
  const [hiddenStoryIds, setHiddenStoryIds] = useState<number[]>([]);
  const [sourceData, setSourceData] = useState<PengajuanItem[]>([]);
  const [aktivitasRevision, setAktivitasRevision] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const syncData = () => {
      if (!isMounted) {
        return;
      }

      setSourceData(getPengajuanData());
    };

    const syncStoryState = () => {
      if (!isMounted) {
        return;
      }

      setHiddenStoryIds(getHiddenStoryIds());
      setAktivitasRevision((r) => r + 1);
    };

    void Promise.all([
      refreshPengajuanDataFromApi(true),
      refreshAktivitasDataFromApi(),
    ])
      .catch(() => {
        // Keep rendering cached timeline if aktivitas API is temporarily unavailable.
      })
      .finally(() => {
        syncData();
        syncStoryState();
      });

    window.addEventListener('pengajuan-data-updated', syncData);
    window.addEventListener('story-data-updated', syncStoryState);

    return () => {
      isMounted = false;
      window.removeEventListener('pengajuan-data-updated', syncData);
      window.removeEventListener('story-data-updated', syncStoryState);
    };
  }, []);

  const groupedData = useMemo(
    () => groupStoryAktivitasByMitra(sourceData, hiddenStoryIds),
    [sourceData, hiddenStoryIds, aktivitasRevision]
  );

  const tahunOptions = useMemo(
    () => Array.from(new Set(groupedData.map((d) => d.tahun))).sort((a, b) => b - a),
    [groupedData]
  );

  const filtered = useMemo(() => {
    return groupedData.filter((item) => {
      const keyword = normalizeSearchText(search);
      const matchJenis = filterJenis === 'Semua Jenis' || item.jenis === filterJenis;
      const matchStatus = filterStatus === 'Semua Status' || item.status === filterStatus;
      const matchTahun = filterTahun === 'Semua Tahun' || item.tahun === Number(filterTahun);

      const searchableText = normalizeSearchText([
        item.namaMitra,
        item.nomorDokumen,
        item.jenis,
        item.status,
        item.pengajuan
          .map((pengajuan) => [
            pengajuan.nomorPengajuan,
            pengajuan.judulPengajuan,
            pengajuan.namaUnitProdi,
            pengajuan.namaPengusul,
            pengajuan.namaMitra,
          ].join(' '))
          .join(' '),
        item.ruangLingkup.join(' '),
        item.jurusanTerlibat.join(' '),
        item.aktivitas
          .map((aktivitas) => [
            aktivitas.judul,
            aktivitas.jenisAktivitas,
            aktivitas.deskripsi,
            aktivitas.picPolibatam,
            aktivitas.picMitra,
            aktivitas.sourceNomorPengajuan,
            aktivitas.sourceJudulPengajuan,
          ].join(' '))
          .join(' '),
      ].join(' '));

      const matchSearch = keyword === '' || searchableText.includes(keyword);

      return matchJenis && matchStatus && matchTahun && matchSearch;
    });
  }, [groupedData, search, filterJenis, filterStatus, filterTahun]);

  const summary = useMemo(() => {
    const totalAktivitas = groupedData.reduce((acc, group) => acc + group.totalAktivitas, 0);
    const totalPengajuan = groupedData.reduce((acc, group) => acc + group.totalPengajuan, 0);
    const akanBerakhir = groupedData.filter((group) => group.status === 'Akan Berakhir').length;

    return {
      totalMitra: groupedData.length,
      totalPengajuan,
      totalAktivitas,
      akanBerakhir,
    };
  }, [groupedData]);

  return (
    <div className="space-y-4 pb-8">
      <section>
        <h1 className="text-4xl font-bold text-[#091222]">Story Aktivitas</h1>
        <p className="mt-1 text-sm text-slate-600">
          Daftar story kerja sama per mitra dengan riwayat aktivitas gabungan dari seluruh pengajuan.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <button
          type="button"
          onClick={() => {
            setFilterJenis('Semua Jenis');
            setFilterStatus('Semua Status');
            setFilterTahun('Semua Tahun');
            setSearch('');
          }}
          className="rounded-2xl border border-slate-100 bg-white p-4 text-left shadow-sm transition hover:bg-slate-50"
          title="Klik untuk memfilter ke semua data"
        >
          <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <Building2 size={16} />
          </div>
          <p className="text-xs text-slate-500">Total Mitra</p>
          <p className="mt-1 text-xl font-bold text-slate-900">{summary.totalMitra}</p>
        </button>

        <button
          type="button"
          onClick={() => {
            setFilterJenis('Semua Jenis');
            setFilterStatus('Semua Status');
            setFilterTahun('Semua Tahun');
            setSearch('');
          }}
          className="rounded-2xl border border-slate-100 bg-white p-4 text-left shadow-sm transition hover:bg-slate-50"
        >
          <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
            <FolderKanban size={16} />
          </div>
          <p className="text-xs text-slate-500">Total Pengajuan</p>
          <p className="mt-1 text-xl font-bold text-slate-900">{summary.totalPengajuan}</p>
        </button>

        <button
          type="button"
          onClick={() => {
            setFilterJenis('Semua Jenis');
            setFilterStatus('Semua Status');
            setFilterTahun('Semua Tahun');
            setSearch('');
          }}
          className="rounded-2xl border border-slate-100 bg-white p-4 text-left shadow-sm transition hover:bg-slate-50"
        >
          <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <Activity size={16} />
          </div>
          <p className="text-xs text-slate-500">Aktivitas Gabungan</p>
          <p className="mt-1 text-xl font-bold text-slate-900">{summary.totalAktivitas}</p>
        </button>

        <button
          type="button"
          onClick={() => {
            setFilterStatus((prev) => (prev === 'Akan Berakhir' ? 'Semua Status' : 'Akan Berakhir'));
          }}
          className={`rounded-2xl border p-4 shadow-sm text-left transition-colors ${
            filterStatus === 'Akan Berakhir'
              ? 'border-amber-300 bg-amber-50'
              : 'border-slate-100 bg-white hover:bg-slate-50'
          }`}
        >
          <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
            <CalendarClock size={16} />
          </div>
          <p className="text-xs text-slate-500">Akan Berakhir</p>
          <p className="mt-1 text-xl font-bold text-slate-900">{summary.akanBerakhir}</p>
        </button>
      </section>

      <section className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700">
            <Filter size={14} />
            Filter
          </div>

          <div className="relative">
            <select
              value={filterJenis}
              onChange={(event) => setFilterJenis(event.target.value)}
              className="appearance-none rounded-lg border border-slate-200 bg-white py-1.5 pl-3 pr-8 text-xs text-slate-700 outline-none transition focus:border-slate-400"
            >
              <option>Semua Jenis</option>
              <option>MoA</option>
              <option>MoU</option>
              <option>IA</option>
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          <div className="relative">
            <select
              value={filterStatus}
              onChange={(event) => setFilterStatus(event.target.value)}
              className="appearance-none rounded-lg border border-slate-200 bg-white py-1.5 pl-3 pr-8 text-xs text-slate-700 outline-none transition focus:border-slate-400"
            >
              <option>Semua Status</option>
              <option>Aktif</option>
              <option>Akan Berakhir</option>
              <option>Kadaluarsa</option>
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          <div className="relative">
            <select
              value={filterTahun}
              onChange={(event) => setFilterTahun(event.target.value)}
              className="appearance-none rounded-lg border border-slate-200 bg-white py-1.5 pl-3 pr-8 text-xs text-slate-700 outline-none transition focus:border-slate-400"
            >
              <option>Semua Tahun</option>
              {tahunOptions.map((tahun) => (
                <option key={tahun} value={tahun}>
                  {tahun}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          <div className="relative ml-auto w-full max-w-sm">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              type="text"
              placeholder="Cari mitra, nomor, judul pengajuan"
              className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-9 pr-3 text-xs text-slate-700 outline-none transition focus:border-slate-400"
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
            Data story aktivitas tidak ditemukan untuk filter saat ini.
          </div>
        )}

        {filtered.map((group) => {
          const timelinePreview = [...group.aktivitas]
            .sort((left, right) => (parseDate(right.tanggal)?.getTime() ?? 0) - (parseDate(left.tanggal)?.getTime() ?? 0))
            .slice(0, 3);

          return (
            <article key={group.key} className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
              <div className="border-b border-slate-100 bg-slate-50/80 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-bold text-slate-900">{group.namaMitra}</h2>
                      <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
                        {group.jenis}
                      </span>
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusBadge(group.status)}`}>
                        {group.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      Dokumen acuan: {group.nomorDokumen} • Berlaku hingga {group.berakhir}
                    </p>
                  </div>
                  <div className="text-right text-xs text-slate-600">
                    <p className="font-semibold text-slate-900">{group.totalPengajuan} Pengajuan</p>
                    <p>{group.totalAktivitas} Aktivitas Gabungan</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 p-4 lg:grid-cols-[1.3fr_1fr]">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Story Kerja Sama</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {group.pengajuan.map((pengajuan) => (
                      <span
                        key={pengajuan.id}
                        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700"
                      >
                        {pengajuan.nomorPengajuan}
                      </span>
                    ))}
                  </div>

                  {(() => {
                    const moaList = group.pengajuan.filter((p) => p.jenisDokumen === 'MoA');
                    if (moaList.length === 0) return null;
                    return (
                      <div className="mt-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Dokumen MoA</p>
                        <div className="mt-2 space-y-1.5">
                          {moaList.map((moa) => (
                            <div key={moa.id} className="flex items-start gap-2 rounded-lg border border-indigo-100 bg-indigo-50/60 px-3 py-2">
                              <span className="mt-0.5 shrink-0 rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">MoA</span>
                              <div className="min-w-0">
                                <p className="truncate text-xs font-semibold text-slate-800">{moa.nomorPengajuan}</p>
                                <p className="truncate text-xs text-slate-500">{moa.judulPengajuan}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  <div className="mt-4 flex flex-wrap gap-2">
                    {group.ruangLingkup.map((scope) => (
                      <span key={scope} className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                        {scope}
                      </span>
                    ))}
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-600">
                    <span className="inline-flex items-center gap-1.5">
                      <Users size={14} className="text-slate-400" />
                      {group.jurusanTerlibat.length} Jurusan/Unit
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Activity size={14} className="text-slate-400" />
                      {group.totalAktivitas} Aktivitas
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Preview Timeline Aktivitas</p>
                  {timelinePreview.length === 0 ? (
                    <p className="mt-2 text-xs text-slate-500">Belum ada aktivitas tercatat.</p>
                  ) : (
                    <ol className="mt-2 space-y-2">
                      {timelinePreview.map((item, index) => (
                        <li key={`${group.key}-${item.sourcePengajuanId}-${item.id}-${index}`} className="flex gap-2.5">
                          <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: 'transparent' }}>
                            <span className={`block h-2.5 w-2.5 rounded-full ${timelineColor(item.status)}`} />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-900">{item.judul}</p>
                            <p className="text-xs text-slate-500">
                              {formatTimelineDate(item.tanggal)} • {item.jenisAktivitas}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 p-3">
                <button
                  onClick={() => router.push(`/admin/story_aktivitas/${group.key}`)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#0e1d34] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[#183053]"
                >
                  <Eye size={14} />
                  Lihat Detail Story
                </button>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
