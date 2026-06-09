'use client';

import { type ReactNode, useEffect, useMemo, useState } from 'react';
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  Eye,
  FileText,
  Filter,
  MessageSquareText,
  Paperclip,
  Search,
  Tag,
  User,
  X,
  XCircle,
} from 'lucide-react';
import type { PengajuanItem } from '../../../services/adminPengajuanService';
import { refreshPengajuanDataFromApi } from '@/services/adminPengajuanService';
import {
  getExternalPengajuanData,
  getExternalPengajuanUpdateEventName,
  syncExternalPengajuanWithAdminData,
} from '@/services/externalPengajuanService';

interface KerjasamaItem {
  id: number;
  noDokumen: string;
  judulPengajuan: string;
  namaPengusul: string;
  diajukanPada: string;
  namaMitra: string;
  jenis: 'MoU' | 'MoA' | 'IA';
  unit: string;
  tanggalMulai: string;
  berlakuHingga: string;
  tahun: string;
  emailPengusul: string;
  whatsappPengusul: string;
  ruangLingkup: string[];
  fileAttachments: { name: string; url: string }[];
  status: 'Menunggu' | 'Diproses' | 'Aktif' | 'Berakhir';
  reviewState: 'Belum Direview' | 'Sudah Direview';
  reviewComment?: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

function toDisplayDate(value?: string): string {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function mapPengajuanToItem(item: PengajuanItem): KerjasamaItem {
  const jenis = (['MoA', 'MoU', 'IA'].includes(item.jenisDokumen) ? item.jenisDokumen : 'MoU') as KerjasamaItem['jenis'];
  const tahun = (item.tanggalMulai || item.diajukanPada || new Date().toISOString()).slice(0, 4);
  const statusMap: Record<string, KerjasamaItem['status']> = {
    Menunggu: 'Menunggu',
    Diproses: 'Diproses',
    Disetujui: 'Aktif',
    Ditolak: 'Berakhir',
  };
  return {
    id: item.id,
    noDokumen: `${jenis}/${String(item.id).padStart(3, '0')}/${tahun}`,
    judulPengajuan: item.judulPengajuan || '-',
    namaPengusul: item.namaPengusul || '-',
    diajukanPada: toDisplayDate(item.diajukanPada),
    namaMitra: item.namaMitra,
    jenis,
    unit: item.namaUnitProdi,
    tanggalMulai: toDisplayDate(item.tanggalMulai),
    berlakuHingga: toDisplayDate(item.tanggalBerakhir),
    tahun,
    emailPengusul: item.emailPengusul || '-',
    whatsappPengusul: item.whatsappPengusul || '-',
    ruangLingkup: item.ruangLingkup?.length ? item.ruangLingkup : [],
    fileAttachments:
      item.fileAttachments?.length
        ? item.fileAttachments.map((file) => ({ name: file.name, url: file.url || '' }))
        : (item.fileName || '')
            .split(',')
            .map((name) => name.trim())
            .filter(Boolean)
            .map((name) => ({ name, url: '' })),
    status: statusMap[item.statusPengajuan] ?? 'Menunggu',
    reviewState: item.reviewedAt || item.reviewComment ? 'Sudah Direview' : 'Belum Direview',
    reviewComment: item.reviewComment,
    reviewedAt: item.reviewedAt,
    reviewedBy: item.reviewedBy,
  };
}

const statusStyle: Record<KerjasamaItem['status'], string> = {
  Menunggu: 'bg-amber-100 text-amber-700',
  Diproses: 'bg-sky-100 text-sky-700',
  Aktif: 'bg-emerald-100 text-emerald-700',
  Berakhir: 'bg-rose-100 text-rose-700',
};

const reviewStateStyle: Record<KerjasamaItem['reviewState'], string> = {
  'Belum Direview': 'bg-slate-100 text-slate-700',
  'Sudah Direview': 'bg-indigo-100 text-indigo-700',
};

const statusDetailConfig: Record<KerjasamaItem['status'], { className: string; icon: ReactNode; label: string }> = {
  Menunggu: {
    className: 'bg-amber-100 text-amber-700',
    icon: <Clock3 size={14} />,
    label: 'Menunggu',
  },
  Diproses: {
    className: 'bg-sky-100 text-sky-700',
    icon: <Clock3 size={14} />,
    label: 'Diproses',
  },
  Aktif: {
    className: 'bg-emerald-100 text-emerald-700',
    icon: <CheckCircle2 size={14} />,
    label: 'Aktif',
  },
  Berakhir: {
    className: 'bg-rose-100 text-rose-700',
    icon: <XCircle size={14} />,
    label: 'Berakhir',
  },
};

const jenisStyle: Record<KerjasamaItem['jenis'], string> = {
  MoU: 'bg-violet-100 text-violet-700',
  MoA: 'bg-[#1E376C] text-white',
  IA: 'bg-orange-100 text-orange-700',
};

const reviewCopy: Record<KerjasamaItem['status'], string> = {
  Menunggu: 'Pengajuan sudah masuk dan sedang menunggu review dari admin.',
  Diproses: 'Admin sedang memeriksa detail pengajuan kerja sama ini.',
  Aktif: 'Pengajuan sudah disetujui admin dan siap ditindaklanjuti.',
  Berakhir: 'Pengajuan belum disetujui admin. Silakan cek catatan review.',
};

export default function DaftarKerjasamaEksternalPage() {
  const [data, setData] = useState<KerjasamaItem[]>([]);
  const [detailItem, setDetailItem] = useState<KerjasamaItem | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua Status');
  const [filterReview, setFilterReview] = useState<'Semua Review' | 'Belum Direview' | 'Sudah Direview'>('Semua Review');
  const [filterTahun, setFilterTahun] = useState<string | null>(null);
  const [yearPickerOpen, setYearPickerOpen] = useState(false);
  const currentYear = new Date().getFullYear();
  const [yearRangeStart, setYearRangeStart] = useState(currentYear - 4);
  const yearGrid = Array.from({ length: 12 }, (_, index) => yearRangeStart + index);

  useEffect(() => {
    let isMounted = true;
    const updateEventName = getExternalPengajuanUpdateEventName();

    const sync = () => {
      if (!isMounted) {
        return;
      }

      const eksternalItems = getExternalPengajuanData().map(mapPengajuanToItem);
      setData(eksternalItems);
    };

    const syncFromAdmin = async () => {
      try {
        await refreshPengajuanDataFromApi(true);
      } catch {
        // Ignore refresh failures and keep local account-specific data.
      }

      syncExternalPengajuanWithAdminData();
      sync();
    };

    const handlePengajuanUpdated = () => {
      // Avoid recursive refresh loop: refreshPengajuanDataFromApi emits this event.
      syncExternalPengajuanWithAdminData();
      sync();
    };

    void syncFromAdmin();
    window.addEventListener(updateEventName, sync);
    window.addEventListener('pengajuan-data-updated', handlePengajuanUpdated);

    return () => {
      isMounted = false;
      window.removeEventListener(updateEventName, sync);
      window.removeEventListener('pengajuan-data-updated', handlePengajuanUpdated);
    };
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
      const matchesReview = filterReview === 'Semua Review' || item.reviewState === filterReview;
      const matchesTahun = filterTahun === null || item.tahun === filterTahun;

      return matchesSearch && matchesStatus && matchesReview && matchesTahun;
    });
  }, [data, search, filterStatus, filterReview, filterTahun]);

  const reviewStats = useMemo(() => {
    const belumDireview = data.filter((item) => item.reviewState === 'Belum Direview').length;
    const sudahDireview = data.filter((item) => item.reviewState === 'Sudah Direview').length;

    return { belumDireview, sudahDireview };
  }, [data]);

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

            <select
              value={filterReview}
              onChange={(event) => setFilterReview(event.target.value as 'Semua Review' | 'Belum Direview' | 'Sudah Direview')}
              className="input-field h-10 px-3 text-sm text-slate-700"
            >
              <option>Semua Review</option>
              <option>Belum Direview</option>
              <option>Sudah Direview</option>
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

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
            Belum Direview: {reviewStats.belumDireview}
          </span>
          <span className="rounded-full bg-indigo-100 px-3 py-1.5 text-xs font-semibold text-indigo-700">
            Sudah Direview: {reviewStats.sudahDireview}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[1080px] w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                <th className="px-4 py-3">No. Dokumen</th>
                <th className="px-4 py-3">Nama Mitra</th>
                <th className="px-4 py-3">Jenis</th>
                <th className="px-4 py-3">Unit</th>
                <th className="px-4 py-3">Tanggal Mulai</th>
                <th className="px-4 py-3">Berlaku Hingga</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Review</th>
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
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${reviewStateStyle[item.reviewState]}`}>
                        {item.reviewState}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setDetailItem(item)}
                        className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-900"
                      >
                        <Eye size={16} />
                        <span className="underline underline-offset-2">Lihat Detail</span>
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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setDetailItem(null);
            }
          }}
        >
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-6 py-4">
              <div>
                <div className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Judul Pengajuan</div>
                <h2 className="text-xl font-bold text-slate-900">{detailItem.judulPengajuan}</h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  {detailItem.diajukanPada} - {detailItem.namaPengusul}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDetailItem(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-5 px-6 py-5">
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${statusDetailConfig[detailItem.status].className}`}
                >
                  {statusDetailConfig[detailItem.status].icon}
                  {statusDetailConfig[detailItem.status].label}
                </span>
                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${jenisStyle[detailItem.jenis]}`}>
                  {detailItem.jenis}
                </span>
              </div>

              <section>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-400">Informasi Umum</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoRow icon={<Building2 size={15} />} label="Mitra" value={detailItem.namaMitra} />
                  <InfoRow icon={<User size={15} />} label="Pengusul" value={detailItem.namaPengusul} />
                  <InfoRow icon={<Tag size={15} />} label="Jurusan / Unit" value={detailItem.unit} />
                  <InfoRow icon={<FileText size={15} />} label="Jenis Dokumen" value={detailItem.jenis} />
                  <InfoRow icon={<CalendarDays size={15} />} label="Tanggal Mulai" value={detailItem.tanggalMulai} />
                  <InfoRow icon={<CalendarDays size={15} />} label="Tanggal Berakhir" value={detailItem.berlakuHingga} />
                </div>
              </section>

              <section>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-400">Ruang Lingkup</h3>
                <div className="flex flex-wrap gap-2">
                  {detailItem.ruangLingkup.length > 0 ? (
                    detailItem.ruangLingkup.map((scope) => (
                      <span key={`${detailItem.id}-${scope}`} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                        {scope}
                      </span>
                    ))
                  ) : (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">-</span>
                  )}
                </div>
              </section>

              <section>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-400">Kontak</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoRow icon={<User size={15} />} label="Email Pengusul" value={detailItem.emailPengusul} />
                  <InfoRow icon={<User size={15} />} label="Whatsapp" value={detailItem.whatsappPengusul} />
                </div>
              </section>

              <section>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-400">Dokumen Pendukung</h3>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  {detailItem.fileAttachments.length > 0 ? (
                    <ul className="space-y-2 text-sm">
                      {detailItem.fileAttachments.map((file, index) => (
                        <li key={`${file.name}-${index}`}>
                          {file.url ? (
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-blue-700 hover:underline"
                            >
                              <Paperclip size={14} />
                              {file.name}
                            </a>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-blue-700">
                              <Paperclip size={14} />
                              {file.name}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-500">Belum ada dokumen pendukung.</p>
                  )}
                </div>
              </section>

              <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#173B82]">
                    <MessageSquareText size={15} />
                    Hasil Review Admin
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${reviewStateStyle[detailItem.reviewState]}`}
                  >
                    {detailItem.reviewState}
                  </span>
                </div>

                {detailItem.reviewComment ? (
                  <p className="text-sm text-slate-700">{detailItem.reviewComment}</p>
                ) : (
                  <p className="text-sm text-slate-700">{reviewCopy[detailItem.status]}</p>
                )}

                {(detailItem.reviewedAt || detailItem.reviewedBy) && (
                  <p className="mt-2 text-xs text-slate-500">
                    Diperbarui oleh {detailItem.reviewedBy || 'Admin'}
                    {detailItem.reviewedAt ? ` pada ${toDisplayDate(detailItem.reviewedAt)}` : ''}
                  </p>
                )}
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
      <span className="mt-0.5 text-slate-400">{icon}</span>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <p className="mt-0.5 text-sm font-medium text-slate-800">{value || '-'}</p>
      </div>
    </div>
  );
}
