'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FileText, Clock, CheckCircle, XCircle, Search, Filter, Plus, Eye, MessageSquare, X, ThumbsUp, ThumbsDown, CalendarDays, ChevronLeft, ChevronRight, Pencil, Trash2, ExternalLink, Paperclip } from 'lucide-react';
import AjukanForm from './AjukanForm';
import {
  deletePengajuanItem,
  getFilteredPengajuanData,
  getPengajuanData,
  getPengajuanStats,
  getPengajuanYearOptions,
  pengajuanDokumenBadge,
  savePengajuanReview,
  updatePengajuanItem,
  type PengajuanItem,
  type PengajuanStatus,
} from '@/services/adminPengajuanService';

type EditFormState = {
  id: number;
  judul: string;
  mitra: string;
  jurusan: string;
  jenisDokumen: string;
  tanggalMulai: string;
  tanggalBerakhir: string;
  ruangLingkup: string[];
};

const ruangLingkupOptions = [
  'Penelitian',
  'Pengabdian Masyarakat',
  'Magang',
  'Pertukaran Mahasiswa',
  'Pelatihan',
  'Workshop',
  'Sertifikasi',
  'Joint Program',
  'Lainnya',
];

const statusConfig: Record<PengajuanStatus, { label: string; className: string; iconEl: React.ReactNode }> = {
  Menunggu: {
    label: 'Menunggu',
    className: 'badge badge-warning',
    iconEl: <Clock size={13} />,
  },
  Diproses: {
    label: 'Diproses',
    className: 'badge badge-info',
    iconEl: <Clock size={13} />,
  },
  Disetujui: {
    label: 'Disetujui',
    className: 'badge badge-success',
    iconEl: <CheckCircle size={13} />,
  },
  Ditolak: {
    label: 'Ditolak',
    className: 'badge badge-danger',
    iconEl: <XCircle size={13} />,
  },
};

const templatePreviewUrlByJenis: Record<string, string> = {
  MoU: '/templates/Draft%20MOU%20Industri.docx',
  MoA: '/templates/Draft%20MOA%20Magang.docx',
  IA: '/templates/DRAFT%20IA%20POLIBATAM.docx',
};

export default function PengajuanKerjasama() {
  const searchParams = useSearchParams();
  const isAjukanView = searchParams.get('view') === 'ajukan';

  // Keep hook order stable on every render to avoid runtime hook mismatch.
  const [filterJurusan, setFilterJurusan] = useState('Semua Kategori Kerjasama');
  const [filterStatus, setFilterStatus] = useState('Semua Status');
  const [filterTahun, setFilterTahun] = useState('Semua Tahun');
  const [yearPickerOpen, setYearPickerOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [pengajuanData, setPengajuanData] = useState<PengajuanItem[]>([]);
  const [detailItem, setDetailItem] = useState<PengajuanItem | null>(null);
  const [reviewItem, setReviewItem] = useState<PengajuanItem | null>(null);
  const [reviewDecision, setReviewDecision] = useState<PengajuanStatus>('Disetujui');
  const [reviewComment, setReviewComment] = useState('');
  const [ajukanModalOpen, setAjukanModalOpen] = useState(false);
  const [infoModalMessage, setInfoModalMessage] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditFormState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PengajuanItem | null>(null);

  useEffect(() => {
    const syncPengajuan = () => {
      setPengajuanData(getPengajuanData());
    };

    syncPengajuan();
    window.addEventListener('pengajuan-data-updated', syncPengajuan);

    return () => window.removeEventListener('pengajuan-data-updated', syncPengajuan);
  }, []);

  useEffect(() => {
    if (isAjukanView) {
      setAjukanModalOpen(true);
    }
  }, [isAjukanView]);

  const { totalPengajuan, menunggu, diproses, disetujui } = getPengajuanStats(pengajuanData);

  const statCards = [
    {
      key: 'Semua Status',
      label: 'Total Pengajuan',
      value: totalPengajuan,
      icon: FileText,
      iconWrap: 'bg-gray-100',
      iconText: 'text-gray-600',
      valueText: 'text-gray-900',
    },
    {
      key: 'Menunggu',
      label: 'Menunggu',
      value: menunggu,
      icon: Clock,
      iconWrap: 'bg-yellow-50',
      iconText: 'text-yellow-600',
      valueText: 'text-yellow-600',
    },
    {
      key: 'Diproses',
      label: 'Diproses',
      value: diproses,
      icon: Clock,
      iconWrap: 'bg-blue-50',
      iconText: 'text-blue-600',
      valueText: 'text-blue-600',
    },
    {
      key: 'Disetujui',
      label: 'Disetujui',
      value: disetujui,
      icon: CheckCircle,
      iconWrap: 'bg-green-50',
      iconText: 'text-green-600',
      valueText: 'text-green-600',
    },
  ];

  const tahunOptions = getPengajuanYearOptions(pengajuanData);
  const currentYear = new Date().getFullYear();
  const defaultYearRangeStart = Math.min(currentYear - 4, Number(tahunOptions[tahunOptions.length - 1] ?? currentYear));
  const [yearRangeStart, setYearRangeStart] = useState(defaultYearRangeStart);
  const yearGrid = Array.from({ length: 12 }, (_, index) => yearRangeStart + index);

  const filtered = getFilteredPengajuanData(pengajuanData, {
    filterStatus,
    filterJurusan,
    filterTahun,
    search,
  });

  const detailFileEntries = detailItem
    ? detailItem.fileAttachments?.length
      ? detailItem.fileAttachments
      : (detailItem.fileName || '')
          .split(',')
          .map((name) => name.trim())
          .filter(Boolean)
          .map((name) => ({ name, url: '' }))
    : [];
  const detailFallbackTemplateUrl = detailItem ? (templatePreviewUrlByJenis[detailItem.jenisDokumen] || '') : '';

  function openReview(item: PengajuanItem) {
    setReviewItem(item);
    setReviewDecision(item.status === 'Ditolak' ? 'Ditolak' : 'Disetujui');
    setReviewComment('');
  }

  function saveReview() {
    if (!reviewItem) return;

    const next = savePengajuanReview(reviewItem.id, reviewDecision, reviewComment);

    setPengajuanData(next);
    setReviewItem(null);
    setReviewComment('');
    setInfoModalMessage('Review pengajuan berhasil disimpan.');
  }

  function openEdit(item: PengajuanItem) {
    setEditForm({
      id: item.id,
      judul: item.judul,
      mitra: item.mitra,
      jurusan: item.jurusan,
      jenisDokumen: item.jenisDokumen,
      tanggalMulai: item.tanggalMulai || '',
      tanggalBerakhir: item.tanggalBerakhir || '',
      ruangLingkup: item.ruangLingkup,
    });
  }

  function saveEdit() {
    if (!editForm) return;

    if (!editForm.judul.trim() || !editForm.mitra.trim() || !editForm.jurusan.trim()) {
      setInfoModalMessage('Judul, mitra, dan jurusan wajib diisi untuk menyimpan perubahan.');
      return;
    }

    if (editForm.ruangLingkup.length === 0) {
      setInfoModalMessage('Pilih minimal 1 ruang lingkup pada form edit.');
      return;
    }

    const next = updatePengajuanItem(editForm.id, {
      judul: editForm.judul.trim(),
      mitra: editForm.mitra.trim(),
      jurusan: editForm.jurusan.trim(),
      jenisDokumen: editForm.jenisDokumen.trim() || 'MoU',
      tanggalMulai: editForm.tanggalMulai || undefined,
      tanggalBerakhir: editForm.tanggalBerakhir || undefined,
      ruangLingkup: editForm.ruangLingkup,
    });

    setPengajuanData(next);
    setEditForm(null);
    setInfoModalMessage('Data pengajuan berhasil diperbarui.');
  }

  function confirmDelete() {
    if (!deleteTarget) return;

    const deletedId = deleteTarget.id;
    const next = deletePengajuanItem(deletedId);

    setPengajuanData(next);
    setDeleteTarget(null);

    if (detailItem?.id === deletedId) {
      setDetailItem(null);
    }

    if (reviewItem?.id === deletedId) {
      setReviewItem(null);
    }

    setInfoModalMessage('Data pengajuan berhasil dihapus.');
  }

    return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Pengajuan Kerjasama</h1>
          <p className="page-subtitle mt-2">Kelola data pengajuan kerjasama dari seluruh jurusan dan unit di Polibatam</p>
        </div>
        <button
          type="button"
          onClick={() => setAjukanModalOpen(true)}
          className="btn-primary flex items-center gap-2 px-4 py-2.5 text-sm font-semibold shadow-sm flex-shrink-0"
        >
          <Plus size={18} />
          Ajukan Kerjasama Baru
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          const isActive = filterStatus === card.key;

          return (
            <button
              key={card.key}
              type="button"
              onClick={() => setFilterStatus(card.key)}
              className={`rounded-lg p-4 shadow-sm flex items-center gap-4 text-left border transition-all ${
                isActive
                  ? 'bg-sky-50 border-sky-300 ring-2 ring-sky-200 shadow-md'
                  : 'bg-white border-slate-200 hover:border-sky-200 hover:shadow-md'
              }`}
            >
              <div className={`w-10 h-10 ${card.iconWrap} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <Icon size={20} className={card.iconText} />
              </div>
              <div>
                <p className="text-xs text-gray-500">{card.label}</p>
                <p className={`text-2xl font-bold ${card.valueText}`}>{card.value}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Filter Row */}
      <div className="toolbar-shell p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-sm text-gray-700 font-medium">
            <Filter size={15} />
            Filter:
          </div>
          <select
            value={filterJurusan}
            onChange={(e) => setFilterJurusan(e.target.value)}
            className="input-field px-3 py-2 text-sm text-gray-700 cursor-pointer"
          >
            <option>Semua Kategori Kerjasama</option>
            <option>Internal</option>
            <option>Eksternal</option>
          </select>
          <div className="relative">
            <button
              type="button"
              onClick={() => setYearPickerOpen((prev) => !prev)}
              className="input-field inline-flex min-w-[150px] items-center justify-between gap-2 px-3 py-2 text-sm text-gray-700 transition-colors"
            >
              <span>{filterTahun === 'Semua Tahun' ? 'Pilih Tahun' : filterTahun}</span>
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
                    const yearString = String(year);
                    const isSelected = yearString === filterTahun;
                    const hasData = tahunOptions.includes(yearString);

                    return (
                      <button
                        key={year}
                        type="button"
                        onClick={() => {
                          setFilterTahun(yearString);
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
                      setFilterTahun('Semua Tahun');
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
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama mitra atau judul..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field w-full pl-9 pr-3 py-2 text-sm text-gray-700"
            />
          </div>
        </div>
      </div>

      {/* Cards List */}
      <div className="space-y-4">
        {filtered.map((item) => {
          const sc = statusConfig[item.status];
          return (
            <div
              key={item.id}
              className="card p-5 hover:shadow-md transition-shadow"
            >
              {/* Top row */}
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-gray-900">{item.judul}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Pengusul: {item.pengusul} &bull; {item.tanggal}
                  </p>
                </div>
                <span className={`flex items-center gap-1.5 flex-shrink-0 ${sc.className}`}>
                  {sc.iconEl}
                  {sc.label}
                </span>
              </div>

              {/* Info row */}
              <div className="flex flex-wrap items-start gap-6 mt-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Mitra Tujuan</p>
                  <p className="text-sm font-semibold text-gray-900">{item.mitra}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Jenis Dokumen</p>
                  <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${pengajuanDokumenBadge[item.jenisDokumen] || 'bg-[#1E376C] text-white'}`}>
                    {item.jenisDokumen}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Jurusan</p>
                  <p className="text-sm text-gray-700">{item.jurusan}</p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDetailItem(item)}
                    className="btn-secondary flex items-center gap-1.5 text-sm px-3 py-1.5"
                  >
                    <Eye size={14} />
                    Detail
                  </button>
                  <button
                    type="button"
                    onClick={() => openReview(item)}
                    className="flex items-center gap-1.5 text-sm text-green-700 border border-green-300 bg-green-50 rounded-lg px-3 py-1.5 font-medium transition-colors hover:bg-green-100"
                  >
                    <MessageSquare size={14} />
                    Review
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(item)}
                    className="flex items-center gap-1.5 text-sm text-amber-700 border border-amber-300 bg-amber-50 rounded-lg px-3 py-1.5 font-medium transition-colors hover:bg-amber-100"
                  >
                    <Pencil size={14} />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(item)}
                    className="flex items-center gap-1.5 text-sm text-red-700 border border-red-300 bg-red-50 rounded-lg px-3 py-1.5 font-medium transition-colors hover:bg-red-100"
                  >
                    <Trash2 size={14} />
                    Hapus
                  </button>
                </div>
              </div>

              {/* Ruang Lingkup */}
              <div className="flex flex-wrap items-center gap-2 mt-4">
                <span className="text-xs text-gray-500">Ruang Lingkup:</span>
                {item.ruangLingkup.map((rl) => (
                  <span
                    key={rl}
                    className="bg-gray-100 text-gray-700 rounded text-xs font-medium px-3 py-1"
                  >
                    {rl}
                  </span>
                ))}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="card p-12 text-center text-gray-400">
            Tidak ada data yang sesuai dengan filter.
          </div>
        )}
      </div>

        {ajukanModalOpen && (
            <div
              className="fixed inset-0 z-[60] bg-black/55 backdrop-blur-[2px] p-4"
              onClick={() => setAjukanModalOpen(false)}
            >
              <div className="flex min-h-full items-center justify-center">
                <div
                  className="w-full max-w-[1120px] max-h-[92vh] overflow-y-auto rounded-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <AjukanForm onClose={() => setAjukanModalOpen(false)} />
                </div>
            </div>
          </div>
        )}

      {detailItem && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px] p-4 flex items-center justify-center">
          <div className="w-full max-w-[640px] bg-[#EFEFF1] rounded-xl shadow-xl border border-[#DBDDE3]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#D5D7DD]">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Detail Pengajuan</h3>
                <p className="text-xs text-gray-600">ID: {detailItem.id}</p>
              </div>
              <button type="button" onClick={() => { setDetailItem(null); }} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-white rounded-lg px-4 py-3 border border-[#D9DCE4]">
                <p className="text-xs text-gray-500">Status:</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">{statusConfig[detailItem.status].label}</p>
              </div>

              <div className="bg-white rounded-lg px-4 py-3 border border-[#D9DCE4]">
                <p className="text-sm font-semibold text-gray-900">{detailItem.judul}</p>
                <p className="text-xs text-gray-600 mt-1">Diajukan oleh: {detailItem.pengusul}</p>
              </div>

              <div className="bg-white rounded-lg px-4 py-3 border border-[#D9DCE4]">
                <p className="text-sm font-semibold text-gray-900 mb-3">Informasi Pengajuan</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                  <div>
                    <p className="text-gray-500">Tanggal Pengajuan</p>
                    <p className="text-gray-900 font-medium">{detailItem.tanggal}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Jenis Dokumen</p>
                    <span className={`inline-flex mt-1 px-2 py-0.5 rounded text-[11px] font-semibold ${pengajuanDokumenBadge[detailItem.jenisDokumen] || 'bg-[#1E376C] text-white'}`}>
                      {detailItem.jenisDokumen}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-500">Jurusan/Unit</p>
                    <p className="text-gray-900 font-medium">{detailItem.jurusan}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Mitra Tujuan</p>
                    <p className="text-gray-900 font-medium">{detailItem.mitra}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Tanggal Mulai</p>
                    <p className="text-gray-900 font-medium">{detailItem.tanggalMulai || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Tanggal Berakhir</p>
                    <p className="text-gray-900 font-medium">{detailItem.tanggalBerakhir || '-'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg px-4 py-3 border border-[#D9DCE4]">
                <p className="text-xs text-gray-500 mb-2">Ruang Lingkup Kerjasama:</p>
                <div className="flex flex-wrap gap-2">
                  {detailItem.ruangLingkup.map((rl) => (
                    <span key={rl} className="bg-[#ECEFF6] text-[#1E376C] rounded-md text-[11px] font-semibold px-2.5 py-1">
                      {rl}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg px-4 py-3 border border-[#D9DCE4]">
                <p className="text-sm font-semibold text-gray-900 mb-2">Dokumen Pendukung</p>

                {detailFileEntries.length === 0 && (
                  <p className="text-xs text-gray-500">Belum ada dokumen yang diunggah.</p>
                )}

                {detailFileEntries.length > 0 && (
                  <div className="space-y-2">
                    {detailFileEntries.map((doc, index) => {
                      const sourceUrl = doc.url || detailFallbackTemplateUrl;
                      const canDownload = Boolean(sourceUrl) && !sourceUrl.startsWith('blob:');

                      return (
                        <div key={`${doc.name}-${index}`} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                          <div className="min-w-0 flex items-center gap-2">
                            <Paperclip size={14} className="shrink-0 text-slate-500" />
                            <p className="truncate text-xs font-medium text-slate-800">{doc.name}</p>
                          </div>
                          {canDownload ? (
                            <a
                              href={sourceUrl}
                              download
                              className="inline-flex items-center gap-1 rounded-md bg-[#1E376C] px-2.5 py-1 text-[11px] font-semibold text-white transition hover:bg-[#2A4A8F]"
                            >
                              <ExternalLink size={12} />
                              Unduh
                            </a>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-md bg-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
                              Tidak Tersedia
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => { setDetailItem(null); }}
                className="w-full h-10 rounded-lg bg-[#1E376C] text-white text-sm font-semibold hover:bg-[#2A4A8F]"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {reviewItem && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px] p-4 flex items-center justify-center">
          <div className="w-full max-w-[680px] bg-[#EFEFF1] rounded-xl shadow-xl border border-[#DBDDE3]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#D5D7DD]">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Review Pengajuan</h3>
                <p className="text-sm text-gray-700 mt-0.5">{reviewItem.judul}</p>
              </div>
              <button type="button" onClick={() => setReviewItem(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-white rounded-lg px-4 py-3 border border-[#D9DCE4] grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                <div>
                  <p className="text-gray-500">Pengusul:</p>
                  <p className="text-gray-900 font-medium">{reviewItem.pengusul}</p>
                </div>
                <div>
                  <p className="text-gray-500">Mitra Tujuan:</p>
                  <p className="text-gray-900 font-medium">{reviewItem.mitra}</p>
                </div>
                <div>
                  <p className="text-gray-500">Jurusan</p>
                  <p className="text-gray-900 font-medium">{reviewItem.jurusan}</p>
                </div>
                <div>
                  <p className="text-gray-500">Jenis Dokumen</p>
                  <span className={`inline-flex mt-1 px-2 py-0.5 rounded text-[11px] font-semibold ${pengajuanDokumenBadge[reviewItem.jenisDokumen] || 'bg-[#1E376C] text-white'}`}>
                    {reviewItem.jenisDokumen}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-700 mb-2">Keputusan *</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setReviewDecision('Disetujui')}
                    className={`h-11 rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-2 border ${reviewDecision === 'Disetujui' ? 'bg-[#1E376C] text-white border-[#1E376C]' : 'bg-white text-[#1E376C] border-[#C7D2EA]'}`}
                  >
                    <ThumbsUp size={14} />
                    ACC / SETUJUI
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewDecision('Ditolak')}
                    className={`h-11 rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-2 border ${reviewDecision === 'Ditolak' ? 'bg-[#1E376C] text-white border-[#1E376C]' : 'bg-white text-[#1E376C] border-[#C7D2EA]'}`}
                  >
                    <ThumbsDown size={14} />
                    TIDAK ACC / TOLAK
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700">Komentar / Catatan</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={3}
                  placeholder="Berikan catatan atau arahan untuk langkah selanjutnya..."
                  className="mt-1 w-full rounded-lg border border-[#D2D7E5] bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#1E376C]"
                />
              </div>

              <div className="bg-white rounded-lg border border-[#D9DCE4] px-3 py-2 text-[11px] text-gray-600">
                Notifikasi Otomatis: status akan diperbarui dan pengusul mendapat info hasil review.
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReviewItem(null)}
                  className="h-9 px-4 rounded-lg bg-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-300"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={saveReview}
                  className="h-9 px-5 rounded-lg bg-[#1E376C] text-white text-xs font-semibold hover:bg-[#2A4A8F]"
                >
                  Simpan dan kirim notifikasi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editForm && (
        <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-[2px] p-4 flex items-center justify-center">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Edit Pengajuan</h3>
              <button type="button" onClick={() => setEditForm(null)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-slate-700">Judul Pengajuan</label>
                <input
                  type="text"
                  value={editForm.judul}
                  onChange={(e) => setEditForm((prev) => (prev ? { ...prev, judul: e.target.value } : prev))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Mitra Tujuan</label>
                <input
                  type="text"
                  value={editForm.mitra}
                  onChange={(e) => setEditForm((prev) => (prev ? { ...prev, mitra: e.target.value } : prev))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Jurusan/Unit</label>
                <input
                  type="text"
                  value={editForm.jurusan}
                  onChange={(e) => setEditForm((prev) => (prev ? { ...prev, jurusan: e.target.value } : prev))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Jenis Dokumen</label>
                <input
                  type="text"
                  value={editForm.jenisDokumen}
                  onChange={(e) => setEditForm((prev) => (prev ? { ...prev, jenisDokumen: e.target.value } : prev))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Tanggal Mulai</label>
                <input
                  type="date"
                  value={editForm.tanggalMulai}
                  onChange={(e) => setEditForm((prev) => (prev ? { ...prev, tanggalMulai: e.target.value } : prev))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Tanggal Berakhir</label>
                <input
                  type="date"
                  value={editForm.tanggalBerakhir}
                  onChange={(e) => setEditForm((prev) => (prev ? { ...prev, tanggalBerakhir: e.target.value } : prev))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-slate-700">Ruang Lingkup</label>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                  {ruangLingkupOptions.map((option) => {
                    const checked = editForm.ruangLingkup.includes(option);

                    return (
                      <label
                        key={option}
                        className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                          checked
                            ? 'border-[#1E376C] bg-[#EEF2FF] text-[#1E376C]'
                            : 'border-slate-300 bg-white text-slate-700 hover:border-[#1E376C]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            setEditForm((prev) => {
                              if (!prev) {
                                return prev;
                              }

                              const exists = prev.ruangLingkup.includes(option);
                              const ruangLingkup = exists
                                ? prev.ruangLingkup.filter((item) => item !== option)
                                : [...prev.ruangLingkup, option];

                              return { ...prev, ruangLingkup };
                            });
                          }}
                          className="h-4 w-4 accent-[#1E376C]"
                        />
                        {option}
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="px-5 py-4 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditForm(null)}
                className="h-9 px-4 rounded-lg bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={saveEdit}
                className="h-9 px-4 rounded-lg bg-[#1E376C] text-white text-sm font-semibold hover:bg-[#2A4A8F]"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-[75] bg-black/50 backdrop-blur-[2px] p-4 flex items-center justify-center">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="px-5 py-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">Hapus Pengajuan</h3>
            </div>
            <div className="px-5 py-4">
              <p className="text-sm text-slate-700">
                Yakin ingin menghapus pengajuan <span className="font-semibold">{deleteTarget.judul}</span>? Tindakan ini tidak bisa dibatalkan.
              </p>
            </div>
            <div className="px-5 py-4 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="h-9 px-4 rounded-lg bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="h-9 px-4 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {infoModalMessage && (
        <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-[2px] p-4 flex items-center justify-center">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="px-5 py-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">Informasi</h3>
            </div>
            <div className="px-5 py-4">
              <p className="text-sm text-slate-700">{infoModalMessage}</p>
            </div>
            <div className="px-5 py-4 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setInfoModalMessage(null)}
                className="h-9 px-4 rounded-lg bg-[#1E376C] text-white text-sm font-semibold hover:bg-[#2A4A8F]"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
