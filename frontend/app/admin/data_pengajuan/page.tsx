'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FileText, Clock, CheckCircle, XCircle, Search, Filter, Plus, Eye, MessageSquare, X, ThumbsUp, ThumbsDown, CalendarDays, ChevronLeft, ChevronRight, Pencil, Trash2, ExternalLink, Paperclip, Download, Upload } from 'lucide-react';
import AjukanForm from './AjukanForm';
import InternalAjukanKerjasamaForm from '@/app/internal/data_pengajuan/AjukanKerjasamaForm';
import { validateSelectedFile } from '@/lib/fileUploadUtils';
import {
  deletePengajuanItem,
  getFilteredPengajuanData,
  getPengajuanData,
  getPengajuanStats,
  getPengajuanYearOptions,
  pengajuanDokumenBadge,
  pengajuanJurusanOptions,
  pengajuanUnitOptions,
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
  'Magang / PKL',
  'Pelatihan & Workshop',
  'Pertukaran Pelajar',
  'Rekrutmen',
  'Riset Bersama',
  'Pengembangan Kurikulum',
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

type TemplateDokumenConfig = {
  title: string;
  subtitle: string;
  struktur: string[];
  note: string;
  fileName: string;
  downloadUrl: string;
};

const editTemplateDokumenMap: Record<string, TemplateDokumenConfig> = {
  MoU: {
    title: 'Memorandum of Understanding (MoU)',
    subtitle: 'Template untuk kesepahaman awal kerja sama',
    struktur: ['Pembukaan', 'Para Pihak', 'Tujuan Kerja Sama', 'Ruang Lingkup', 'Jangka Waktu', 'Penutup'],
    note: 'Template bisa diunduh sebagai acuan. Anda tetap bisa langsung mengunggah dokumen sendiri.',
    fileName: 'Draft MOU Industri.docx',
    downloadUrl: '/templates/Draft%20MOU%20Industri.docx',
  },
  MoA: {
    title: 'Memorandum of Agreement (MoA)',
    subtitle: 'Template untuk perjanjian teknis pelaksanaan',
    struktur: ['Dasar Kerja Sama', 'Hak dan Kewajiban', 'Program Pelaksanaan', 'Pendanaan', 'Monitoring', 'Penutup'],
    note: 'Gunakan format MoA resmi agar isi dokumen sesuai standar admin.',
    fileName: 'Draft MOA Magang.docx',
    downloadUrl: '/templates/Draft%20MOA%20Magang.docx',
  },
  IA: {
    title: 'Implementation Arrangement (IA)',
    subtitle: 'Template rincian implementasi program',
    struktur: ['Informasi Program', 'Target Kegiatan', 'Peran Tim', 'Timeline', 'Output', 'Pelaporan'],
    note: 'Template IA dipakai untuk detail implementasi kerja sama yang sudah disepakati.',
    fileName: 'DRAFT IA POLIBATAM.docx',
    downloadUrl: '/templates/DRAFT%20IA%20POLIBATAM.docx',
  },
};

const templateFileNameByJenis: Record<string, string> = {
  MoU: 'Draft MOU Industri.docx',
  MoA: 'Draft MOA Magang.docx',
  IA: 'DRAFT IA POLIBATAM.docx',
};

const MAX_EDIT_FILE_SIZE = 10 * 1024 * 1024;

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
  const [editAsal, setEditAsal] = useState<'Jurusan' | 'Unit'>('Jurusan');
  const [editJurusanOpen, setEditJurusanOpen] = useState(false);
  const [editRlOpen, setEditRlOpen] = useState(false);
  const [editJurusanInput, setEditJurusanInput] = useState('');
  const [editRlInput, setEditRlInput] = useState('');
  const [editCustomJurusanOpts, setEditCustomJurusanOpts] = useState<string[]>([]);
  const [editCustomUnitOpts, setEditCustomUnitOpts] = useState<string[]>([]);
  const [editCustomRlOpts, setEditCustomRlOpts] = useState<string[]>([]);
  const [editOriginalJenisDokumen, setEditOriginalJenisDokumen] = useState('');
  const [editUploadedFiles, setEditUploadedFiles] = useState<File[]>([]);
  const [editFileError, setEditFileError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PengajuanItem | null>(null);
  const [editingItem, setEditingItem] = useState<PengajuanItem | null>(null);

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
  const editAllJurusanOptions = [...pengajuanJurusanOptions, ...editCustomJurusanOpts];
  const editAllUnitOptions = [...pengajuanUnitOptions, ...editCustomUnitOpts];
  const editAsalOptions = editAsal === 'Jurusan' ? editAllJurusanOptions : editAllUnitOptions;
  const editAllRlOptions = [...ruangLingkupOptions, ...editCustomRlOpts];
  const editTemplateUrl = editForm ? (templatePreviewUrlByJenis[editForm.jenisDokumen] || '') : '';
  const editTemplateFileName = editForm ? (templateFileNameByJenis[editForm.jenisDokumen] || '') : '';
  const editSelectedTemplate = editForm ? (editTemplateDokumenMap[editForm.jenisDokumen] || null) : null;

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
    setEditingItem(item);
  }

  function openEditLegacy(item: PengajuanItem) {
    const asalDefault: 'Jurusan' | 'Unit' = pengajuanUnitOptions.includes(item.jurusan) ? 'Unit' : 'Jurusan';

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
    setEditAsal(asalDefault);
    setEditJurusanOpen(false);
    setEditRlOpen(false);
    setEditJurusanInput('');
    setEditRlInput('');
    setEditCustomJurusanOpts([]);
    setEditCustomUnitOpts([]);
    setEditCustomRlOpts([]);
    setEditOriginalJenisDokumen(item.jenisDokumen);
    setEditUploadedFiles([]);
    setEditFileError(null);
  }

  function handleEditDownloadTemplate() {
    if (!editForm || !editTemplateUrl || !editTemplateFileName) {
      return;
    }

    const link = document.createElement('a');
    link.href = editTemplateUrl;
    link.download = editTemplateFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function handleEditFileUpload(files: FileList | null) {
    const selected = Array.from(files || []);
    if (selected.length === 0) {
      return;
    }

    for (const file of selected) {
      const validationError = validateSelectedFile(file, {
        accept: '.pdf,.doc,.docx',
        maxSizeBytes: MAX_EDIT_FILE_SIZE,
      });

      if (validationError) {
        setEditFileError(`${file.name}: ${validationError}`);
        return;
      }
    }

    setEditUploadedFiles((prev) => [...prev, ...selected]);
    setEditFileError(null);
  }

  function handleRemoveEditFile(indexToRemove: number) {
    setEditUploadedFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  }

  function addEditJurusanUnitOption() {
    const trimmed = editJurusanInput.trim();
    if (!trimmed) return;

    if (editAsal === 'Jurusan') {
      if (!editAllJurusanOptions.includes(trimmed)) setEditCustomJurusanOpts((prev) => [...prev, trimmed]);
    } else {
      if (!editAllUnitOptions.includes(trimmed)) setEditCustomUnitOpts((prev) => [...prev, trimmed]);
    }

    setEditForm((prev) => (prev ? { ...prev, jurusan: trimmed } : prev));
    setEditJurusanInput('');
    setEditJurusanOpen(false);
  }

  function removeEditJurusanUnitOption(option: string) {
    if (editAsal === 'Jurusan') {
      setEditCustomJurusanOpts((prev) => prev.filter((item) => item !== option));
    } else {
      setEditCustomUnitOpts((prev) => prev.filter((item) => item !== option));
    }

    setEditForm((prev) => {
      if (!prev) return prev;
      if (prev.jurusan === option) {
        return { ...prev, jurusan: '' };
      }
      return prev;
    });
  }

  function addEditRuangLingkupOption() {
    const trimmed = editRlInput.trim();
    if (!trimmed || editAllRlOptions.includes(trimmed)) return;

    setEditCustomRlOpts((prev) => [...prev, trimmed]);
    setEditForm((prev) => (prev ? { ...prev, ruangLingkup: [...prev.ruangLingkup, trimmed] } : prev));
    setEditRlInput('');
  }

  function removeEditRuangLingkupOption(option: string) {
    setEditCustomRlOpts((prev) => prev.filter((item) => item !== option));
    setEditForm((prev) => (prev ? { ...prev, ruangLingkup: prev.ruangLingkup.filter((item) => item !== option) } : prev));
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

    if (editForm.jenisDokumen !== editOriginalJenisDokumen && editUploadedFiles.length === 0) {
      setInfoModalMessage('Karena jenis dokumen diubah, upload dokumen baru wajib dilakukan.');
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
      ...(editUploadedFiles.length > 0
        ? {
            fileName: editUploadedFiles.map((file) => file.name).join(', '),
            fileAttachments: editUploadedFiles.map((file) => ({
              name: file.name,
              type: file.type,
              size: file.size,
              url: URL.createObjectURL(file),
            })),
          }
        : {}),
    });

    setPengajuanData(next);
    setEditForm(null);
    setEditUploadedFiles([]);
    setEditFileError(null);
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

  function handleSubmitEditFromAjukan(payload: {
    formData: {
      namaMitra: string;
      jenisMitra: string;
      teleponMitra: string;
      emailMitra: string;
      alamatMitra: string;
      negara: string;
      jenisKerjasama: string;
      unitPelaksana: string;
      tanggalMulai: string;
      tanggalBerakhir: string;
      judulKerjasama: string;
      deskripsi: string;
      ruangLingkup: string;
      namaKontak: string;
      jabatanKontak: string;
      emailKontak: string;
      teleponKontak: string;
    };
    asal: 'Jurusan' | 'Unit';
    selectedRuangLingkup: string[];
    dokumen: File[];
  }): boolean {
    if (!editingItem) {
      return false;
    }

    if (!payload.formData.judulKerjasama.trim() || !payload.formData.namaMitra.trim() || !payload.formData.unitPelaksana.trim()) {
      setInfoModalMessage('Judul, mitra, dan jurusan/unit wajib diisi untuk menyimpan perubahan.');
      return false;
    }

    if (payload.selectedRuangLingkup.length === 0) {
      setInfoModalMessage('Pilih minimal 1 ruang lingkup pada form edit.');
      return false;
    }

    const next = updatePengajuanItem(editingItem.id, {
      judul: payload.formData.judulKerjasama.trim(),
      mitra: payload.formData.namaMitra.trim(),
      jurusan: payload.formData.unitPelaksana.trim(),
      jenisDokumen: payload.formData.jenisKerjasama.trim() || editingItem.jenisDokumen,
      tanggalMulai: payload.formData.tanggalMulai || undefined,
      tanggalBerakhir: payload.formData.tanggalBerakhir || undefined,
      ruangLingkup: payload.selectedRuangLingkup,
      emailPengusul: payload.formData.emailKontak || editingItem.emailPengusul,
      whatsappPengusul: payload.formData.teleponKontak || editingItem.whatsappPengusul,
      alamatMitra: payload.formData.alamatMitra || editingItem.alamatMitra,
      negara: payload.formData.negara || editingItem.negara,
      ...(payload.dokumen.length > 0
        ? {
            fileName: payload.dokumen.map((file) => file.name).join(', '),
            fileAttachments: payload.dokumen.map((file) => ({
              name: file.name,
              type: file.type,
              size: file.size,
              url: URL.createObjectURL(file),
            })),
          }
        : {}),
    });

    setPengajuanData(next);
    setEditingItem(null);
    setInfoModalMessage('Data pengajuan berhasil diperbarui.');
    return true;
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

      {editingItem && (
        <div
          className="fixed inset-0 z-[70] bg-black/55 backdrop-blur-[2px] p-4"
          onClick={() => setEditingItem(null)}
        >
          <div className="flex min-h-full items-center justify-center">
            <div
              className="w-full max-w-[1120px] max-h-[92vh] overflow-y-auto rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <InternalAjukanKerjasamaForm
                disableDraftPersistence
                lockJenisKerjasama
                submitButtonLabel="Simpan Perubahan"
                initialData={{
                  asal: pengajuanUnitOptions.includes(editingItem.jurusan) ? 'Unit' : 'Jurusan',
                  namaMitra: editingItem.mitra,
                  jenisMitra: '',
                  teleponMitra: editingItem.whatsappPengusul || '',
                  emailMitra: editingItem.emailPengusul || '',
                  alamatMitra: editingItem.alamatMitra || '',
                  negara: editingItem.negara || 'Indonesia',
                  jenisKerjasama: editingItem.jenisDokumen,
                  unitPelaksana: editingItem.jurusan,
                  tanggalMulai: editingItem.tanggalMulai || '',
                  tanggalBerakhir: editingItem.tanggalBerakhir || '',
                  judulKerjasama: editingItem.judul,
                  deskripsi: '',
                  namaKontak: editingItem.pengusul,
                  jabatanKontak: '',
                  emailKontak: editingItem.emailPengusul || '',
                  teleponKontak: editingItem.whatsappPengusul || '',
                  selectedRuangLingkup: editingItem.ruangLingkup,
                }}
                onCancel={() => setEditingItem(null)}
                onSubmitted={() => setEditingItem(null)}
                onSubmitOverride={handleSubmitEditFromAjukan}
              />
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
              <div className="md:col-span-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-700">
                Edit mengikuti form pengajuan. Jika jenis dokumen diubah (MoU/MoA/IA), upload dokumen baru wajib.
              </div>
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
                <div className="mt-2 mb-2 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditAsal('Jurusan');
                      setEditJurusanOpen(false);
                      setEditForm((prev) => (prev ? { ...prev, jurusan: '' } : prev));
                    }}
                    className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                      editAsal === 'Jurusan'
                        ? 'border-[#173B82] bg-[#173B82] text-white'
                        : 'border-slate-300 bg-white text-slate-700 hover:border-[#173B82]'
                    }`}
                  >
                    Jurusan
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditAsal('Unit');
                      setEditJurusanOpen(false);
                      setEditForm((prev) => (prev ? { ...prev, jurusan: '' } : prev));
                    }}
                    className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                      editAsal === 'Unit'
                        ? 'border-[#173B82] bg-[#173B82] text-white'
                        : 'border-slate-300 bg-white text-slate-700 hover:border-[#173B82]'
                    }`}
                  >
                    Unit
                  </button>
                </div>

                <div className="relative mt-1">
                  <button
                    type="button"
                    onClick={() => setEditJurusanOpen((prev) => !prev)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-left text-sm text-slate-700"
                  >
                    <div className="flex items-center justify-between gap-2">
                      {editForm.jurusan ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#173B82] px-2 py-0.5 text-xs font-semibold text-white">
                          {editForm.jurusan}
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditForm((prev) => (prev ? { ...prev, jurusan: '' } : prev));
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                e.stopPropagation();
                                setEditForm((prev) => (prev ? { ...prev, jurusan: '' } : prev));
                              }
                            }}
                            className="cursor-pointer hover:opacity-75"
                            aria-label="Hapus pilihan jurusan atau unit"
                          >
                            <X size={10} />
                          </span>
                        </span>
                      ) : (
                        <span className="text-slate-400">-- Pilih {editAsal} --</span>
                      )}
                      <ChevronRight size={14} className={`text-slate-400 transition-transform ${editJurusanOpen ? 'rotate-90' : ''}`} />
                    </div>
                  </button>

                  {editJurusanOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setEditJurusanOpen(false)} />
                      <div className="absolute left-0 top-full z-20 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-lg">
                        <div className="max-h-48 overflow-y-auto p-1">
                          {editAsalOptions.map((option) => {
                            const isCustom = editAsal === 'Jurusan' ? editCustomJurusanOpts.includes(option) : editCustomUnitOpts.includes(option);

                            return (
                              <div key={option} className="flex items-center gap-2 rounded-lg hover:bg-slate-50">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditForm((prev) => (prev ? { ...prev, jurusan: option } : prev));
                                    setEditJurusanOpen(false);
                                  }}
                                  className={`flex flex-1 items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${
                                    editForm.jurusan === option ? 'bg-slate-100 font-semibold text-slate-900' : 'text-slate-700'
                                  }`}
                                >
                                  <span>{option}</span>
                                  {editForm.jurusan === option && <span className="text-xs text-[#173B82]">Dipilih</span>}
                                </button>
                                {isCustom && (
                                  <span
                                    role="button"
                                    tabIndex={0}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeEditJurusanUnitOption(option);
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        removeEditJurusanUnitOption(option);
                                      }
                                    }}
                                    className="mr-2 inline-flex cursor-pointer rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-red-600"
                                    aria-label={`Hapus opsi ${option}`}
                                  >
                                    <X size={12} />
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex gap-2 border-t border-slate-100 p-2">
                          <input
                            type="text"
                            value={editJurusanInput}
                            onChange={(e) => setEditJurusanInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addEditJurusanUnitOption(); } }}
                            placeholder={`Tambah ${editAsal} baru...`}
                            className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs"
                          />
                          <button type="button" onClick={addEditJurusanUnitOption} className="inline-flex items-center gap-1 rounded-lg bg-[#173B82] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0f2c61]">
                            <Plus size={12} />Tambah
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Jenis Dokumen</label>
                <select
                  value={editForm.jenisDokumen}
                  onChange={(e) => {
                    const nextJenis = e.target.value;
                    setEditForm((prev) => (prev ? { ...prev, jenisDokumen: nextJenis } : prev));
                    setEditUploadedFiles([]);
                    setEditFileError(null);
                  }}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700"
                >
                  <option value="">Pilih jenis kerjasama</option>
                  <option value="MoU">MoU</option>
                  <option value="MoA">MoA</option>
                  <option value="IA">IA</option>
                </select>
                {editForm.jenisDokumen !== editOriginalJenisDokumen && (
                  <p className="mt-1 text-[11px] font-semibold text-amber-700">Jenis dokumen berubah, upload ulang dokumen wajib.</p>
                )}
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
                <div className="relative mt-1">
                  <button
                    type="button"
                    onClick={() => setEditRlOpen((prev) => !prev)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-left text-sm text-slate-700"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap gap-1.5">
                        {editForm.ruangLingkup.length === 0 ? (
                          <span className="text-slate-400">Pilih ruang lingkup kerjasama...</span>
                        ) : (
                          editForm.ruangLingkup.map((rl) => (
                            <span key={rl} className="inline-flex items-center gap-1 rounded-full bg-[#173B82] px-2 py-0.5 text-xs font-semibold text-white">
                              {rl}
                              <span
                                role="button"
                                tabIndex={0}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditForm((prev) => (prev ? { ...prev, ruangLingkup: prev.ruangLingkup.filter((item) => item !== rl) } : prev));
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setEditForm((prev) => (prev ? { ...prev, ruangLingkup: prev.ruangLingkup.filter((item) => item !== rl) } : prev));
                                  }
                                }}
                                className="cursor-pointer hover:opacity-75"
                                aria-label={`Hapus ${rl}`}
                              >
                                <X size={10} />
                              </span>
                            </span>
                          ))
                        )}
                      </div>
                      <ChevronRight size={14} className={`mt-0.5 text-slate-400 transition-transform ${editRlOpen ? 'rotate-90' : ''}`} />
                    </div>
                  </button>

                  {editRlOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setEditRlOpen(false)} />
                      <div className="absolute left-0 top-full z-20 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-lg">
                        <div className="max-h-48 overflow-y-auto p-1">
                          {editAllRlOptions.map((option) => {
                            const checked = editForm.ruangLingkup.includes(option);
                            const isCustom = editCustomRlOpts.includes(option);

                            return (
                              <label key={option} className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-50">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => {
                                    setEditForm((prev) => {
                                      if (!prev) return prev;
                                      const exists = prev.ruangLingkup.includes(option);
                                      const ruangLingkup = exists
                                        ? prev.ruangLingkup.filter((item) => item !== option)
                                        : [...prev.ruangLingkup, option];
                                      return { ...prev, ruangLingkup };
                                    });
                                  }}
                                  className="h-4 w-4 accent-[#173B82]"
                                />
                                <span className="flex flex-1 items-center justify-between gap-2 text-sm text-slate-800">
                                  <span>{option}</span>
                                  {isCustom && (
                                    <span
                                      role="button"
                                      tabIndex={0}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        removeEditRuangLingkupOption(option);
                                      }}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          removeEditRuangLingkupOption(option);
                                        }
                                      }}
                                      className="inline-flex cursor-pointer rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-red-600"
                                      aria-label={`Hapus opsi ${option}`}
                                    >
                                      <X size={12} />
                                    </span>
                                  )}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                        <div className="flex gap-2 border-t border-slate-100 p-2">
                          <input
                            type="text"
                            value={editRlInput}
                            onChange={(e) => setEditRlInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addEditRuangLingkupOption(); } }}
                            placeholder="Tambah opsi baru..."
                            className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs"
                          />
                          <button type="button" onClick={addEditRuangLingkupOption} className="inline-flex items-center gap-1 rounded-lg bg-[#173B82] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0f2c61]">
                            <Plus size={12} />Tambah
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="md:col-span-2 rounded-2xl border border-[#D7E0F0] bg-[#F8FAFF] p-4 sm:p-5">
                <div className="mb-4">
                  <h4 className="text-base font-bold text-slate-900">Template Dokumen</h4>
                  <p className="mt-1 text-xs text-slate-600">Alur edit dokumen sama seperti form pengajuan.</p>
                </div>

                <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div className="rounded-xl border border-[#D7E0F0] bg-white px-4 py-3">
                    <div className="mb-1.5 flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1E376C] text-xs font-bold text-white">1</span>
                      <p className="text-sm font-semibold text-gray-900">Pilih Jenis</p>
                    </div>
                    <p className="text-xs text-gray-600">Pilih MoU, MoA, atau IA sesuai dokumen.</p>
                  </div>
                  <div className="rounded-xl border border-[#D7E0F0] bg-white px-4 py-3">
                    <div className="mb-1.5 flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1E376C] text-xs font-bold text-white">2</span>
                      <p className="text-sm font-semibold text-gray-900">Download Template</p>
                    </div>
                    <p className="text-xs text-gray-600">Opsional sebagai acuan isi dokumen.</p>
                  </div>
                  <div className="rounded-xl border border-[#D7E0F0] bg-white px-4 py-3">
                    <div className="mb-1.5 flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1E376C] text-xs font-bold text-white">3</span>
                      <p className="text-sm font-semibold text-gray-900">Upload Dokumen</p>
                    </div>
                    <p className="text-xs text-gray-600">Jika jenis berubah, upload ulang wajib.</p>
                  </div>
                </div>

                <p className="mb-3 text-xs text-slate-600">Format: PDF, Word (.doc/.docx), maksimal 10MB per file.</p>

                {editSelectedTemplate && editTemplateUrl && (
                  <div className="mb-3 rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-lg font-bold text-[#173B82]">{editSelectedTemplate.title}</p>
                        <p className="text-sm text-slate-600">{editSelectedTemplate.subtitle}</p>
                        <p className="mt-2 text-xs text-slate-500">File template: {editTemplateFileName}</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleEditDownloadTemplate}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#173B82] px-4 text-xs font-semibold text-white hover:bg-[#0f2c61]"
                    >
                      <Download size={14} />
                      Download Template
                    </button>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <p className="mb-2 text-sm font-semibold text-[#173B82]">Isi utama dokumen:</p>
                      <div className="flex flex-wrap gap-2">
                        {editSelectedTemplate.struktur.map((item) => (
                          <span key={item} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    <p className="mt-3 text-xs text-slate-600">Catatan: {editSelectedTemplate.note}</p>
                  </div>
                )}

                <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-white px-4 py-4 text-sm font-medium text-slate-600 hover:border-[#173B82] hover:text-[#173B82]">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    multiple
                    onChange={(e) => {
                      handleEditFileUpload(e.target.files);
                      e.currentTarget.value = '';
                    }}
                    className="hidden"
                  />
                  <Upload size={16} />
                  Upload Dokumen
                </label>

                {editFileError && <p className="mt-2 text-xs text-red-600">{editFileError}</p>}

                {editUploadedFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {editUploadedFiles.map((file, index) => (
                      <div key={`${file.name}-${index}`} className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-slate-800">{file.name}</p>
                          <p className="text-[11px] text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveEditFile(index)}
                          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-red-600"
                          aria-label={`Hapus ${file.name}`}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
