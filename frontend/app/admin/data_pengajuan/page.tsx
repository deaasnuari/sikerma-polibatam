'use client';

import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FileText, Clock, CheckCircle, XCircle, Search, Filter, Plus, Eye, MessageSquare, X, ThumbsUp, ThumbsDown, CalendarDays, ChevronLeft, ChevronRight, Pencil, Trash2, ExternalLink, Paperclip, Download, Upload } from 'lucide-react';
import AdminAjukanKerjasamaForm from './AjukanKerjasamaForm';
import InternalAjukanKerjasamaForm from '@/app/internal/data_pengajuan/AjukanKerjasamaForm';
import { validateSelectedFile } from '@/lib/fileUploadUtils';
import {
  createMasterUnitProdi,
  deleteMasterUnitProdi,
  getCachedMasterUnitProdiTree,
  getMasterUnitProdi,
  updateMasterUnitProdi,
  type MasterUnitProdi,
} from '@/services/masterUnitProdiService';
import {
  createMasterRuangLingkup,
  deleteMasterRuangLingkup,
  getCachedMasterRuangLingkup,
  getMasterRuangLingkup,
  updateMasterRuangLingkup,
  type MasterRuangLingkup,
} from '@/services/masterRuangLingkupService';
import {
  deletePengajuanItemApi,
  fetchPengajuanDataFromApi,
  getFilteredPengajuanData,
  getPengajuanStats,
  getPengajuanYearOptions,
  pengajuanDokumenBadge,
  savePengajuanReviewApi,
  updatePengajuanItemApi,
  pengajuanJurusanOptions,
  pengajuanUnitOptions,
  type PengajuanItem,
  type PengajuanStatus,
} from '@/services/adminPengajuanService';

type EditFormState = {
  id: number;
  judulPengajuan: string;
  namaMitra: string;
  namaUnitProdi: string;
  jenisDokumen: string;
  tanggalMulai: string;
  tanggalBerakhir: string;
  ruangLingkup: string[];
};

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

function triggerBrowserDownload(url: string, fileName: string) {
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

async function downloadAttachmentFile(url: string, fileName: string) {
  if (url.startsWith('data:')) {
    const response = await fetch(url);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);

    try {
      triggerBrowserDownload(objectUrl, fileName);
    } finally {
      URL.revokeObjectURL(objectUrl);
    }

    return;
  }

  triggerBrowserDownload(url, fileName);
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
    reader.onerror = () => reject(new Error(`Gagal membaca file ${file.name}.`));

    reader.readAsDataURL(file);
  });
}

async function buildPersistentFileAttachments(files: File[]) {
  return Promise.all(
    files.map(async (file) => ({
      name: file.name,
      type: file.type,
      size: file.size,
      url: await readFileAsDataUrl(file),
    }))
  );
}

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
  const [pengajuanLoading, setPengajuanLoading] = useState(true);
  const [detailItem, setDetailItem] = useState<PengajuanItem | null>(null);
  const [reviewItem, setReviewItem] = useState<PengajuanItem | null>(null);
  const [reviewDecision, setReviewDecision] = useState<PengajuanStatus>('Disetujui');
  const [reviewComment, setReviewComment] = useState('');
  const [ajukanModalOpen, setAjukanModalOpen] = useState(false);
  const [masterModalOpen, setMasterModalOpen] = useState(false);
  const [ruangLingkupModalOpen, setRuangLingkupModalOpen] = useState(false);
  const [ruangLingkupRows, setRuangLingkupRows] = useState<MasterRuangLingkup[]>(() => getCachedMasterRuangLingkup());
  const [ruangLingkupNama, setRuangLingkupNama] = useState('');
  const [editingRuangLingkupId, setEditingRuangLingkupId] = useState<number | null>(null);
  const [editingRuangLingkupNama, setEditingRuangLingkupNama] = useState('');
  const [ruangLingkupSaving, setRuangLingkupSaving] = useState(false);
  const [ruangLingkupMessage, setRuangLingkupMessage] = useState<string | null>(null);
  const [masterJenis, setMasterJenis] = useState<'jurusan' | 'unit_kerja'>('jurusan');
  const [masterKode, setMasterKode] = useState('');
  const [masterNama, setMasterNama] = useState('');
  const [masterSaving, setMasterSaving] = useState(false);
  const [masterMessage, setMasterMessage] = useState<string | null>(null);
  const [masterSearch, setMasterSearch] = useState('');
  const [masterJurusanRows, setMasterJurusanRows] = useState<MasterUnitProdi[]>(() => getCachedMasterUnitProdiTree().filter((item) => item.jenis_node === 'unit' && item.kategori_unit === 'jurusan'));
  const [masterUnitRows, setMasterUnitRows] = useState<MasterUnitProdi[]>(() => getCachedMasterUnitProdiTree().filter((item) => item.jenis_node === 'unit' && item.kategori_unit === 'unit_kerja'));
  const [masterProdiRows, setMasterProdiRows] = useState<MasterUnitProdi[]>(() => getCachedMasterUnitProdiTree().filter((item) => item.jenis_node === 'prodi'));
  const [prodiDraftByJurusan, setProdiDraftByJurusan] = useState<Record<number, { kode: string; nama: string }>>({});
  const [editingProdiId, setEditingProdiId] = useState<number | null>(null);
  const [editingProdiKode, setEditingProdiKode] = useState('');
  const [editingProdiNama, setEditingProdiNama] = useState('');
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
    let mounted = true;

    const loadFromApi = async () => {
      if (mounted) {
        setPengajuanLoading(true);
      }

      try {
        const rows = await fetchPengajuanDataFromApi({ perPage: 500 });
        if (mounted) {
          setPengajuanData(rows);
        }
      } catch {
        if (mounted) {
          setInfoModalMessage('Gagal memuat data pengajuan dari server.');
        }
      } finally {
        if (mounted) {
          setPengajuanLoading(false);
        }
      }
    };

    loadFromApi();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (isAjukanView) {
      setAjukanModalOpen(true);
    }
  }, [isAjukanView]);

  const refreshMasterReferenceData = useCallback(async () => {
    const [jurusanRows, unitRows, prodiRows] = await Promise.all([
      getMasterUnitProdi({ jenis_node: 'unit', kategori_unit: 'jurusan', aktif: true }),
      getMasterUnitProdi({ jenis_node: 'unit', kategori_unit: 'unit_kerja', aktif: true }),
      getMasterUnitProdi({ jenis_node: 'prodi', aktif: true }),
    ]);

    setMasterJurusanRows(jurusanRows);
    setMasterUnitRows(unitRows);
    setMasterProdiRows(prodiRows);

    return { jurusanRows, unitRows, prodiRows };
  }, []);

  const refreshMasterRuangLingkup = useCallback(async () => {
    const rows = await getMasterRuangLingkup();
    setRuangLingkupRows(rows);
    return rows;
  }, []);

  const masterUnitProdiTreeForForm = useMemo(() => {
    const prodiByParent = new Map<number, MasterUnitProdi[]>();

    masterProdiRows.forEach((prodi) => {
      if (typeof prodi.parent_id !== 'number') {
        return;
      }

      const current = prodiByParent.get(prodi.parent_id) || [];
      current.push(prodi);
      prodiByParent.set(prodi.parent_id, current);
    });

    return masterJurusanRows.map((jurusan) => ({
      ...jurusan,
      children: prodiByParent.get(jurusan.id) || [],
    }));
  }, [masterJurusanRows, masterProdiRows]);

  useEffect(() => {
    let isMounted = true;

    async function loadMasterReferenceData() {
      try {
        await refreshMasterReferenceData();
      } catch {
        if (isMounted) {
          setMasterMessage('Gagal memuat data master. Pastikan backend aktif.');
        }
      }
    }

    loadMasterReferenceData();

    return () => {
      isMounted = false;
    };
  }, [refreshMasterReferenceData]);

  useEffect(() => {
    let isMounted = true;

    async function loadRuangLingkupAtMount() {
      try {
        await refreshMasterRuangLingkup();
      } catch {
        if (isMounted) {
          setRuangLingkupMessage('Gagal memuat data ruang lingkup. Pastikan backend aktif.');
        }
      }
    }

    loadRuangLingkupAtMount();

    return () => {
      isMounted = false;
    };
  }, [refreshMasterRuangLingkup]);

  async function handleSubmitRuangLingkup() {
    const nama = ruangLingkupNama.trim();
    if (!nama) {
      setRuangLingkupMessage('Nama ruang lingkup wajib diisi.');
      return;
    }

    try {
      setRuangLingkupSaving(true);
      setRuangLingkupMessage(null);

      await createMasterRuangLingkup({
        nama_ruang_lingkup: nama,
        aktif: true,
      });

      await refreshMasterRuangLingkup();
      setRuangLingkupNama('');
      setRuangLingkupMessage('Ruang lingkup berhasil ditambahkan.');
    } catch (error) {
      const message = error instanceof Error && error.message ? error.message : 'Gagal menambah ruang lingkup.';
      setRuangLingkupMessage(message);
    } finally {
      setRuangLingkupSaving(false);
    }
  }

  function startEditRuangLingkup(item: MasterRuangLingkup) {
    setEditingRuangLingkupId(item.id);
    setEditingRuangLingkupNama(item.nama_ruang_lingkup);
    setRuangLingkupMessage(null);
  }

  function cancelEditRuangLingkup() {
    setEditingRuangLingkupId(null);
    setEditingRuangLingkupNama('');
  }

  async function saveEditRuangLingkup(id: number) {
    const nextName = editingRuangLingkupNama.trim();
    if (!nextName) {
      setRuangLingkupMessage('Nama ruang lingkup wajib diisi.');
      return;
    }

    try {
      setRuangLingkupSaving(true);
      setRuangLingkupMessage(null);

      await updateMasterRuangLingkup(id, {
        nama_ruang_lingkup: nextName,
      });

      await refreshMasterRuangLingkup();
      setRuangLingkupMessage('Ruang lingkup berhasil diperbarui.');
      cancelEditRuangLingkup();
    } catch (error) {
      const message = error instanceof Error && error.message ? error.message : 'Gagal mengubah ruang lingkup.';
      setRuangLingkupMessage(message);
    } finally {
      setRuangLingkupSaving(false);
    }
  }

  async function handleDeleteRuangLingkup(id: number) {
    const confirmed = window.confirm('Yakin ingin menghapus ruang lingkup ini?');
    if (!confirmed) {
      return;
    }

    try {
      setRuangLingkupSaving(true);
      setRuangLingkupMessage(null);

      await deleteMasterRuangLingkup(id);
      await refreshMasterRuangLingkup();
      setRuangLingkupMessage('Ruang lingkup berhasil dihapus.');

      if (editingRuangLingkupId === id) {
        cancelEditRuangLingkup();
      }
    } catch (error) {
      const message = error instanceof Error && error.message ? error.message : 'Gagal menghapus ruang lingkup.';
      setRuangLingkupMessage(message);
    } finally {
      setRuangLingkupSaving(false);
    }
  }

  const setProdiDraftField = (jurusanId: number, field: 'kode' | 'nama', value: string) => {
    setProdiDraftByJurusan((prev) => {
      const current = prev[jurusanId] || { kode: '', nama: '' };
      return {
        ...prev,
        [jurusanId]: {
          ...current,
          [field]: value,
        },
      };
    });
  };

  const filteredJurusanRows = masterJurusanRows.filter((jurusan) => {
    const keyword = masterSearch.trim().toLowerCase();
    if (!keyword) {
      return true;
    }

    const jurusanText = `${jurusan.kode || ''} ${jurusan.nama}`.toLowerCase();
    if (jurusanText.includes(keyword)) {
      return true;
    }

    const prodis = masterProdiRows.filter((prodi) => prodi.parent_id === jurusan.id);
    return prodis.some((prodi) => `${prodi.kode || ''} ${prodi.nama}`.toLowerCase().includes(keyword));
  });

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

  // Deduplikasi data berdasarkan id sebelum render
  const filteredRaw = getFilteredPengajuanData(pengajuanData, {
    filterStatus,
    filterJurusan,
    filterTahun,
    search,
  });
  const seen = new Set();
  const filtered = [];
  for (const item of filteredRaw) {
    if (!seen.has(item.id)) {
      filtered.push(item);
      seen.add(item.id);
    }
  }

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
  const editAllRlOptions = Array.from(new Set([...ruangLingkupRows.map((item) => item.nama_ruang_lingkup), ...editCustomRlOpts]));
  const editTemplateUrl = editForm ? (templatePreviewUrlByJenis[editForm.jenisDokumen] || '') : '';
  const editTemplateFileName = editForm ? (templateFileNameByJenis[editForm.jenisDokumen] || '') : '';
  const editSelectedTemplate = editForm ? (editTemplateDokumenMap[editForm.jenisDokumen] || null) : null;


  function openReview(item: PengajuanItem) {
    setReviewItem(item);
    setReviewDecision(item.statusPengajuan === 'Ditolak' ? 'Ditolak' : 'Disetujui');
    setReviewComment('');
  }

  async function saveReview() {
    if (!reviewItem) return;

    try {
      const updated = await savePengajuanReviewApi(reviewItem.id, reviewDecision, reviewComment);
      setPengajuanData((prev) => prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)));
    } catch {
      setInfoModalMessage('Gagal menyimpan review ke server.');
      return;
    }

    setReviewItem(null);
    setReviewComment('');
    setInfoModalMessage('Review pengajuan berhasil disimpan.');
  }

  function openEdit(item: PengajuanItem) {

    setEditingItem(item);
  }

  function openEditLegacy(item: PengajuanItem) {
    const asalDefault: 'Jurusan' | 'Unit' = pengajuanUnitOptions.includes(item.namaUnitProdi) ? 'Unit' : 'Jurusan';

    setEditForm({
      id: item.id,
      judulPengajuan: item.judulPengajuan,
      namaMitra: item.namaMitra,
      namaUnitProdi: item.namaUnitProdi,
      jenisDokumen: item.jenisDokumen,
      tanggalMulai: item.tanggalMulai || '',
      tanggalBerakhir: item.tanggalBerakhir || '',
      ruangLingkup: item.ruangLingkup || [],
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

    setEditForm((prev) => (prev ? { ...prev, namaUnitProdi: trimmed } : prev));
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
      if (prev.namaUnitProdi === option) {
        return { ...prev, namaUnitProdi: '' };
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

  async function saveEdit() {
    if (!editForm) return;

    if (!editForm.judulPengajuan.trim() || !editForm.namaMitra.trim() || !editForm.namaUnitProdi.trim()) {
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

    const persistentAttachments = editUploadedFiles.length > 0
      ? await buildPersistentFileAttachments(editUploadedFiles)
      : [];

    const editPayload = {
      judulPengajuan: editForm.judulPengajuan.trim(),
      namaMitra: editForm.namaMitra.trim(),
      namaUnitProdi: editForm.namaUnitProdi.trim(),
      jenisDokumen: editForm.jenisDokumen.trim() || 'MoU',
      tanggalMulai: editForm.tanggalMulai || undefined,
      tanggalBerakhir: editForm.tanggalBerakhir || undefined,
      ruangLingkup: editForm.ruangLingkup,
      ruangLingkupIds: (editForm.ruangLingkup || []).map((name) => ruangLingkupRows.find((r) => r.nama_ruang_lingkup === name)?.id).filter(Boolean) as number[],
      ...(editUploadedFiles.length > 0
        ? {
            fileName: editUploadedFiles.map((file) => file.name).join(', '),
            fileAttachments: persistentAttachments,
          }
        : {}),
    };

    try {
      const updated = await updatePengajuanItemApi(editForm.id, editPayload);
      setPengajuanData((prev) => prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)));
    } catch {
      setInfoModalMessage('Gagal memperbarui data pengajuan di server.');
      return;
    }

    setEditForm(null);
    setEditUploadedFiles([]);
    setEditFileError(null);
    setInfoModalMessage('Data pengajuan berhasil diperbarui.');
  }

  async function confirmDelete() {
    if (!deleteTarget) return;

    const deletedId = deleteTarget.id;
    try {
      await deletePengajuanItemApi(deletedId);
      setPengajuanData((prev) => prev.filter((item) => item.id !== deletedId));
    } catch {
      setInfoModalMessage('Gagal menghapus pengajuan di server.');
      return;
    }

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
    dokumenAttachments: { file: File; dataUrl?: string }[];
    selectedProdiId: number | null;
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

    const editPayload = {
      judulPengajuan: payload.formData.judulKerjasama.trim(),
      namaMitra: payload.formData.namaMitra.trim(),
      namaUnitProdi: payload.formData.unitPelaksana.trim(),
      unitProdiId: payload.selectedProdiId ?? undefined,
      jenisDokumen: payload.formData.jenisKerjasama.trim() || editingItem.jenisDokumen,
      tanggalMulai: payload.formData.tanggalMulai || undefined,
      tanggalBerakhir: payload.formData.tanggalBerakhir || undefined,
      ruangLingkup: payload.selectedRuangLingkup,
      ruangLingkupIds: (payload.selectedRuangLingkup || []).map((name) => ruangLingkupRows.find((r) => r.nama_ruang_lingkup === name)?.id).filter(Boolean) as number[],
      emailPengusul: payload.formData.emailKontak || editingItem.emailPengusul,
      whatsappPengusul: payload.formData.teleponKontak || editingItem.whatsappPengusul,
      deskripsiPengajuan: payload.formData.deskripsi.trim() || undefined,
      jabatanPengusul: payload.formData.jabatanKontak.trim() || undefined,
      ...(payload.dokumen.length > 0
        ? {
            fileName: payload.dokumen.map((file) => file.name).join(', '),
            fileAttachments: payload.dokumenAttachments.map((item) => ({
              name: item.file.name,
              type: item.file.type,
              size: item.file.size,
              url: item.dataUrl || '',
            })),
          }
        : {}),
    };

    updatePengajuanItemApi(editingItem.id, editPayload)
      .then((updated) => {
        setPengajuanData((prev) => prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)));
      })
      .catch(() => {
        setInfoModalMessage('Gagal memperbarui data pengajuan di server.');
      });

    setEditingItem(null);
    setInfoModalMessage('Data pengajuan berhasil diperbarui.');
    return true;
  }

  async function handleSubmitMasterReference() {
    const nama = masterNama.trim();
    if (!nama) {
      setMasterMessage('Nama master wajib diisi.');
      return;
    }

    try {
      setMasterSaving(true);
      setMasterMessage(null);

      await createMasterUnitProdi({
        parent_id: null,
        jenis_node: 'unit',
        kategori_unit: masterJenis,
        kode: masterKode.trim() || undefined,
        nama,
        aktif: true,
      });

      await refreshMasterReferenceData();
      setMasterKode('');
      setMasterNama('');
      setMasterMessage('Master berhasil disimpan.');
    } catch (error) {
      const message = error instanceof Error && error.message ? error.message : 'Gagal menyimpan master.';
      setMasterMessage(message);
    } finally {
      setMasterSaving(false);
    }
  }

  async function handleAddProdiToJurusan(jurusanId: number) {
    const draft = prodiDraftByJurusan[jurusanId] || { kode: '', nama: '' };
    const nama = draft.nama.trim();

    if (!nama) {
      setMasterMessage('Nama prodi wajib diisi.');
      return;
    }

    try {
      setMasterSaving(true);
      setMasterMessage(null);

      await createMasterUnitProdi({
        parent_id: jurusanId,
        jenis_node: 'prodi',
        kategori_unit: null,
        kode: draft.kode.trim() || undefined,
        nama,
        aktif: true,
      });

      const prodiRows = await getMasterUnitProdi({ jenis_node: 'prodi', aktif: true });
      setMasterProdiRows(prodiRows);
      setProdiDraftByJurusan((prev) => ({
        ...prev,
        [jurusanId]: { kode: '', nama: '' },
      }));
      setMasterMessage('Prodi berhasil ditambahkan.');
    } catch (error) {
      const message = error instanceof Error && error.message ? error.message : 'Gagal menyimpan prodi.';
      setMasterMessage(message);
    } finally {
      setMasterSaving(false);
    }
  }

  function startEditProdi(prodi: MasterUnitProdi) {
    setEditingProdiId(prodi.id);
    setEditingProdiKode(prodi.kode || '');
    setEditingProdiNama(prodi.nama || '');
  }

  function cancelEditProdi() {
    setEditingProdiId(null);
    setEditingProdiKode('');
    setEditingProdiNama('');
  }

  async function saveEditProdi(prodiId: number) {
    const nama = editingProdiNama.trim();
    if (!nama) {
      setMasterMessage('Nama prodi wajib diisi.');
      return;
    }

    try {
      setMasterSaving(true);
      setMasterMessage(null);

      await updateMasterUnitProdi(prodiId, {
        kode: editingProdiKode.trim() || '',
        nama,
      });

      const prodiRows = await getMasterUnitProdi({ jenis_node: 'prodi', aktif: true });
      setMasterProdiRows(prodiRows);
      cancelEditProdi();
      setMasterMessage('Prodi berhasil diperbarui.');
    } catch (error) {
      const message = error instanceof Error && error.message ? error.message : 'Gagal memperbarui prodi.';
      setMasterMessage(message);
    } finally {
      setMasterSaving(false);
    }
  }

  async function handleDeleteProdi(prodiId: number) {
    const confirmed = window.confirm('Yakin ingin menghapus prodi ini?');
    if (!confirmed) {
      return;
    }

    try {
      setMasterSaving(true);
      setMasterMessage(null);

      const deleted = await deleteMasterUnitProdi(prodiId);
      if (!deleted) {
        throw new Error('Gagal menghapus prodi.');
      }
      const prodiRows = await getMasterUnitProdi({ jenis_node: 'prodi', aktif: true });
      if (prodiRows.some((item) => item.id === prodiId)) {
        throw new Error('Delete prodi tidak tersinkron ke backend. Silakan refresh halaman lalu coba lagi.');
      }
      setMasterProdiRows(prodiRows);
      setMasterMessage('Prodi berhasil dihapus.');
    } catch (error) {
      const message = error instanceof Error && error.message ? error.message : 'Gagal menghapus prodi.';
      setMasterMessage(message);
    } finally {
      setMasterSaving(false);
    }
  }

  async function handleDeleteJurusan(jurusanId: number) {
    const confirmed = window.confirm('Yakin ingin menghapus jurusan ini? Semua prodi di bawah jurusan ini juga akan ikut dihapus.');
    if (!confirmed) {
      return;
    }

    try {
      setMasterSaving(true);
      setMasterMessage(null);

      const deleted = await deleteMasterUnitProdi(jurusanId);
      if (!deleted) {
        throw new Error('Gagal menghapus jurusan.');
      }

      const { jurusanRows } = await refreshMasterReferenceData();

      if (jurusanRows.some((item) => item.id === jurusanId)) {
        throw new Error('Delete jurusan tidak tersinkron ke backend. Silakan refresh halaman lalu coba lagi.');
      }
      setMasterMessage('Jurusan berhasil dihapus beserta prodi terkait.');
    } catch (error) {
      let message = 'Gagal menghapus jurusan.';
      if (error instanceof Error && error.message) {
        message = error.message;
      }
      if (message.toLowerCase().includes('children')) {
        message = 'Jurusan masih memiliki prodi turunan. Silakan coba lagi atau hapus prodi terlebih dahulu.';
      }
      setMasterMessage(message);
    } finally {
      setMasterSaving(false);
    }
  }

  async function handleDeleteUnitKerja(unitId: number) {
    const confirmed = window.confirm('Yakin ingin menghapus unit kerja ini?');
    if (!confirmed) {
      return;
    }

    try {
      setMasterSaving(true);
      setMasterMessage(null);

      const deleted = await deleteMasterUnitProdi(unitId);
      if (!deleted) {
        throw new Error('Gagal menghapus unit kerja.');
      }

      const { unitRows } = await refreshMasterReferenceData();
      if (unitRows.some((item) => item.id === unitId)) {
        throw new Error('Delete unit kerja tidak tersinkron ke backend. Silakan refresh halaman lalu coba lagi.');
      }
      setMasterMessage('Unit kerja berhasil dihapus.');
    } catch (error) {
      const message = error instanceof Error && error.message ? error.message : 'Gagal menghapus unit kerja.';
      setMasterMessage(message);
    } finally {
      setMasterSaving(false);
    }
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Pengajuan Kerjasama</h1>
          <p className="page-subtitle mt-2">Kelola data pengajuan kerjasama dari seluruh jurusan dan unit di Polibatam</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMasterModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-[#1E376C] bg-white px-4 py-2.5 text-sm font-semibold text-[#1E376C] shadow-sm transition hover:bg-[#EEF2FF]"
          >
            <Plus size={16} />
            Referensi Kampus
          </button>
          <button
            type="button"
            onClick={() => {
              setRuangLingkupModalOpen(true);
              setRuangLingkupMessage(null);
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-[#1E376C] bg-white px-4 py-2.5 text-sm font-semibold text-[#1E376C] shadow-sm transition hover:bg-[#EEF2FF]"
          >
            <Plus size={16} />
            Tambah Ruang Lingkup
          </button>
          <button
            type="button"
            onClick={() => setAjukanModalOpen(true)}
            className="btn-primary flex items-center gap-2 px-4 py-2.5 text-sm font-semibold shadow-sm flex-shrink-0"
          >
            <Plus size={18} />
            Ajukan Kerjasama Baru
          </button>
        </div>
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
          const sc = statusConfig[item.statusPengajuan] || statusConfig['Menunggu'];
          return (
            <div
              key={item.id}
              className="card p-5 hover:shadow-md transition-shadow"
            >
              {/* Top row */}
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-0.5">Judul Pengajuan:</p>
                  <h3 className="text-base font-bold text-gray-900">{item.judulPengajuan}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Pengusul: {item.namaPengusul} &bull; {item.diajukanPada}
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
                  <p className="text-sm font-semibold text-gray-900">{item.namaMitra}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Jenis Dokumen</p>
                  <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${pengajuanDokumenBadge[item.jenisDokumen] || 'bg-[#1E376C] text-white'}`}>
                    {item.jenisDokumen}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Jurusan</p>
                  <p className="text-sm text-gray-700">{item.namaUnitProdi}</p>
                </div>
                {item.keputusan && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Keputusan</p>
                    <p className="text-sm font-semibold text-gray-900">{item.keputusan}</p>
                  </div>
                )}
                {item.catatan && (
                  <div className="max-w-[200px]">
                    <p className="text-xs text-gray-400 mb-1">Catatan Review</p>
                    <p className="text-sm text-gray-700 truncate" title={item.catatan}>{item.catatan}</p>
                  </div>
                )}
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
          pengajuanLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="card animate-pulse p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-3 flex-1">
                      <div className="h-4 w-3/5 rounded bg-slate-200" />
                      <div className="h-3 w-1/3 rounded bg-slate-200" />
                    </div>
                    <div className="h-6 w-24 rounded-full bg-slate-200" />
                  </div>

                  <div className="mt-4 flex flex-wrap items-start gap-6">
                    <div className="space-y-2">
                      <div className="h-3 w-20 rounded bg-slate-200" />
                      <div className="h-4 w-36 rounded bg-slate-200" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 w-20 rounded bg-slate-200" />
                      <div className="h-5 w-20 rounded bg-slate-200" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 w-16 rounded bg-slate-200" />
                      <div className="h-4 w-28 rounded bg-slate-200" />
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      <div className="h-8 w-20 rounded-lg bg-slate-200" />
                      <div className="h-8 w-20 rounded-lg bg-slate-200" />
                      <div className="h-8 w-20 rounded-lg bg-slate-200" />
                      <div className="h-8 w-20 rounded-lg bg-slate-200" />
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {Array.from({ length: 3 }).map((__, rlIndex) => (
                      <div key={rlIndex} className="h-6 w-24 rounded bg-slate-200" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-12 text-center text-gray-400">
              Tidak ada data yang sesuai dengan filter.
            </div>
          )
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
                  <AdminAjukanKerjasamaForm
                    onCancel={() => setAjukanModalOpen(false)}
                    onSubmitted={() => setAjukanModalOpen(false)}
                    initialMasterUnitProdiTree={masterUnitProdiTreeForForm}
                    initialMasterRuangLingkupRows={ruangLingkupRows}
                  />
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
                initialMasterUnitProdiTree={masterUnitProdiTreeForForm}
                initialMasterRuangLingkupRows={ruangLingkupRows}
                initialData={{
                  asal: pengajuanUnitOptions.includes(editingItem.namaUnitProdi) ? 'Unit' : 'Jurusan',
                  namaMitra: editingItem.namaMitra,
                  jenisMitra: editingItem.mitraKategori || '',
                  teleponMitra: editingItem.mitraTelepon || editingItem.whatsappPengusul || '',
                  emailMitra: editingItem.mitraEmail || editingItem.emailPengusul || '',
                  alamatMitra: editingItem.mitraAlamat || '',
                  negara: editingItem.mitraNegara || 'Indonesia',
                  jenisKerjasama: editingItem.jenisDokumen,
                  unitPelaksana: editingItem.namaUnitProdi,
                  tanggalMulai: editingItem.tanggalMulai || '',
                  tanggalBerakhir: editingItem.tanggalBerakhir || '',
                  judulKerjasama: editingItem.judulPengajuan,
                  deskripsi: editingItem.deskripsiPengajuan || '',
                  namaKontak: editingItem.namaPengusul,
                  jabatanKontak: editingItem.jabatanPengusul || '',
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
        <div className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-[1px] p-4 flex items-center justify-center">
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
                <p className="text-sm font-semibold text-gray-900 mt-0.5">{statusConfig[detailItem.statusPengajuan]?.label || 'Menunggu'}</p>
              </div>

              <div className="bg-white rounded-lg px-4 py-3 border border-[#D9DCE4]">
                <p className="text-sm font-semibold text-gray-900">{detailItem.judulPengajuan}</p>
                <p className="text-xs text-gray-600 mt-1">Diajukan oleh: {detailItem.namaPengusul}</p>
              </div>

              <div className="bg-white rounded-lg px-4 py-3 border border-[#D9DCE4]">
                <p className="text-sm font-semibold text-gray-900 mb-3">Informasi Pengajuan</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                  <div>
                    <p className="text-gray-500">Tanggal Pengajuan</p>
                    <p className="text-gray-900 font-medium">{detailItem.diajukanPada}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Jenis Dokumen</p>
                    <span className={`inline-flex mt-1 px-2 py-0.5 rounded text-[11px] font-semibold ${pengajuanDokumenBadge[detailItem.jenisDokumen] || 'bg-[#1E376C] text-white'}`}>
                      {detailItem.jenisDokumen}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-500">Jurusan/Unit</p>
                    <p className="text-gray-900 font-medium">{detailItem.namaUnitProdi}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Mitra Tujuan</p>
                    <p className="text-gray-900 font-medium">{detailItem.namaMitra}</p>
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
                      const sourceUrl = doc.url || detailFallbackTemplateUrl || `http://localhost:8000/storage/uploads/${doc.name}`;

                      return (
                        <div key={`${doc.name}-${index}`} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                          <div className="min-w-0 flex items-center gap-2">
                            <Paperclip size={14} className="shrink-0 text-slate-500" />
                            <a 
                              href={sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="truncate text-xs font-medium text-blue-600 underline hover:text-blue-800"
                            >
                              {doc.name}
                            </a>
                          </div>
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
        <div className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-[1px] p-4 flex items-center justify-center">
          <div className="w-full max-w-[680px] bg-[#EFEFF1] rounded-xl shadow-xl border border-[#DBDDE3]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#D5D7DD]">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Review Pengajuan</h3>
                <p className="text-sm text-gray-700 mt-0.5">{reviewItem.judulPengajuan}</p>
              </div>
              <button type="button" onClick={() => setReviewItem(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-white rounded-lg px-4 py-3 border border-[#D9DCE4] grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                <div>
                  <p className="text-gray-500">Pengusul:</p>
                  <p className="text-gray-900 font-medium">{reviewItem.namaPengusul}</p>
                </div>
                <div>
                  <p className="text-gray-500">Mitra Tujuan:</p>
                  <p className="text-gray-900 font-medium">{reviewItem.namaMitra}</p>
                </div>
                <div>
                  <p className="text-gray-500">Jurusan</p>
                  <p className="text-gray-900 font-medium">{reviewItem.namaUnitProdi}</p>
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

      {masterModalOpen && (
        <div className="fixed inset-0 z-[75] bg-black/40 backdrop-blur-[1px] p-4 flex items-center justify-center" onClick={() => setMasterModalOpen(false)}>
          <div className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Kelola Referensi Kampus</h3>
                <p className="text-xs text-slate-500">Tambah Jurusan/Unit kampus di atas, lalu kelola Prodi langsung per jurusan.</p>
              </div>
              <button type="button" onClick={() => setMasterModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 p-5 bg-slate-50/70">
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="mb-3 text-xs font-semibold text-slate-700">Tambah Jurusan / Unit Kerja</p>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                <select
                  value={masterJenis}
                  onChange={(e) => setMasterJenis(e.target.value as 'jurusan' | 'unit_kerja')}
                  className="input-field h-10 rounded-lg px-3 text-sm"
                >
                  <option value="jurusan">Jurusan</option>
                  <option value="unit_kerja">Unit</option>
                </select>
                <input
                  value={masterKode}
                  onChange={(e) => setMasterKode(e.target.value)}
                  placeholder="Kode"
                  className="input-field h-10 rounded-lg px-3 text-sm"
                />
                <input
                  value={masterNama}
                  onChange={(e) => setMasterNama(e.target.value)}
                  placeholder="Nama master"
                  className="input-field h-10 rounded-lg px-3 text-sm"
                />
                <button
                  type="button"
                  onClick={() => {
                    void handleSubmitMasterReference();
                  }}
                  disabled={masterSaving}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#1E376C] px-4 text-sm font-semibold text-white hover:bg-[#2A4A8F] disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  <Plus size={14} />
                  {masterSaving ? 'Menyimpan...' : 'Simpan'}
                </button>
                </div>
              </div>

              {masterMessage && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
                  {masterMessage}
                </div>
              )}

              <input
                value={masterSearch}
                onChange={(e) => setMasterSearch(e.target.value)}
                placeholder="Cari jurusan atau prodi..."
                className="input-field h-10 w-full rounded-lg border-slate-300 bg-white px-3 text-sm"
              />

              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-xs font-semibold text-slate-700">Jurusan dan Daftar Prodi</p>
                <div className="mt-2 space-y-3">
                  {filteredJurusanRows.map((jurusan) => {
                    const prodis = masterProdiRows.filter((prodi) => prodi.parent_id === jurusan.id);
                    const draft = prodiDraftByJurusan[jurusan.id] || { kode: '', nama: '' };

                    return (
                      <div key={jurusan.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
                        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">{jurusan.kode || '-'}</span>
                            <p className="text-sm font-semibold text-[#173B82]">{jurusan.nama}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              void handleDeleteJurusan(jurusan.id);
                            }}
                            disabled={masterSaving}
                            className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Hapus Jurusan
                          </button>
                        </div>

                        <div className="grid gap-2 sm:grid-cols-[96px_1fr_auto]">
                          <input
                            value={draft.kode}
                            onChange={(e) => setProdiDraftField(jurusan.id, 'kode', e.target.value)}
                            placeholder="Kode prodi"
                            className="input-field h-9 rounded-lg px-2 text-xs"
                          />
                          <input
                            value={draft.nama}
                            onChange={(e) => setProdiDraftField(jurusan.id, 'nama', e.target.value)}
                            placeholder="Nama prodi"
                            className="input-field h-9 rounded-lg px-2 text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              void handleAddProdiToJurusan(jurusan.id);
                            }}
                            disabled={masterSaving}
                            className="inline-flex h-9 items-center justify-center rounded-lg bg-[#1E376C] px-3 text-xs font-semibold text-white hover:bg-[#2A4A8F] disabled:cursor-not-allowed disabled:bg-slate-300"
                          >
                            + Prodi
                          </button>
                        </div>

                        <div className="mt-3 space-y-2">
                          {prodis.length === 0 ? (
                            <span className="text-[11px] text-slate-400">Belum ada prodi</span>
                          ) : (
                            prodis.map((prodi) => {
                              const isEditing = editingProdiId === prodi.id;

                              if (isEditing) {
                                return (
                                  <div key={prodi.id} className="grid gap-1.5 rounded-lg border border-slate-200 bg-white p-2 sm:grid-cols-[96px_1fr_auto_auto]">
                                    <input
                                      value={editingProdiKode}
                                      onChange={(e) => setEditingProdiKode(e.target.value)}
                                      placeholder="Kode"
                                      className="input-field h-8 rounded-md px-2 text-[11px]"
                                    />
                                    <input
                                      value={editingProdiNama}
                                      onChange={(e) => setEditingProdiNama(e.target.value)}
                                      placeholder="Nama prodi"
                                      className="input-field h-8 rounded-md px-2 text-[11px]"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        void saveEditProdi(prodi.id);
                                      }}
                                      disabled={masterSaving}
                                      className="h-8 rounded-md bg-[#1E376C] px-2 text-[11px] font-semibold text-white hover:bg-[#2A4A8F]"
                                    >
                                      Simpan
                                    </button>
                                    <button
                                      type="button"
                                      onClick={cancelEditProdi}
                                      className="h-8 rounded-md border border-slate-300 bg-white px-2 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
                                    >
                                      Batal
                                    </button>
                                  </div>
                                );
                              }

                              return (
                                <div key={prodi.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white p-2">
                                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                                    {prodi.kode ? `${prodi.kode} - ` : ''}{prodi.nama}
                                  </span>
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => startEditProdi(prodi)}
                                      className="rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-100"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        void handleDeleteProdi(prodi.id);
                                      }}
                                      className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-700 hover:bg-red-100"
                                    >
                                      Hapus Prodi
                                    </button>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {filteredJurusanRows.length === 0 && (
                    <div className="rounded-md border border-slate-200 bg-white p-3 text-center text-[11px] text-slate-500">
                      Tidak ada jurusan/prodi yang cocok dengan pencarian.
                    </div>
                  )}
                </div>

                <p className="mt-3 text-xs font-semibold text-slate-700">Daftar Unit Kerja</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {masterUnitRows.length === 0 ? (
                    <span className="text-[11px] text-slate-400">Belum ada unit kerja.</span>
                  ) : (
                    masterUnitRows.map((unit) => (
                      <div key={unit.id} className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-700">
                        <span>{unit.kode ? `${unit.kode} - ` : ''}{unit.nama}</span>
                        <button
                          type="button"
                          onClick={() => {
                            void handleDeleteUnitKerja(unit.id);
                          }}
                          disabled={masterSaving}
                          className="rounded px-1 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Hapus Unit
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {ruangLingkupModalOpen && (
        <div className="fixed inset-0 z-[76] bg-black/40 backdrop-blur-[1px] p-4 flex items-center justify-center" onClick={() => setRuangLingkupModalOpen(false)}>
          <div className="w-full max-w-xl max-h-[90vh] flex flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex-none flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Tambah Ruang Lingkup</h3>
                <p className="text-xs text-slate-500">Tambahkan opsi ruang lingkup untuk form pengajuan.</p>
              </div>
              <button
                type="button"
                onClick={() => setRuangLingkupModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 p-5">
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  value={ruangLingkupNama}
                  onChange={(e) => setRuangLingkupNama(e.target.value)}
                  placeholder="Contoh: Publikasi Bersama"
                  className="input-field h-10 flex-1 rounded-lg px-3 text-sm"
                />
                <button
                  type="button"
                  onClick={() => {
                    void handleSubmitRuangLingkup();
                  }}
                  disabled={ruangLingkupSaving}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#1E376C] px-4 text-sm font-semibold text-white hover:bg-[#2A4A8F] disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  <Plus size={14} />
                  {ruangLingkupSaving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
              <p className="text-xs text-slate-500">Data tersimpan ke DB dan langsung dipakai di Form Pengajuan.</p>

              {ruangLingkupMessage && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
                  {ruangLingkupMessage}
                </div>
              )}

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-semibold text-slate-700">Daftar Ruang Lingkup</p>
                <div className="mt-2 space-y-2">
                  {ruangLingkupRows.length === 0 ? (
                    <span className="text-[11px] text-slate-400">Belum ada data ruang lingkup.</span>
                  ) : (
                    ruangLingkupRows.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1.5">
                        {editingRuangLingkupId === item.id ? (
                          <input
                            value={editingRuangLingkupNama}
                            onChange={(e) => setEditingRuangLingkupNama(e.target.value)}
                            className="input-field h-8 flex-1 rounded-md px-2 text-xs"
                            placeholder="Nama ruang lingkup"
                          />
                        ) : (
                          <span className="text-xs font-medium text-slate-700">{item.nama_ruang_lingkup}</span>
                        )}

                        <div className="flex items-center gap-1.5">
                          {editingRuangLingkupId === item.id ? (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  void saveEditRuangLingkup(item.id);
                                }}
                                disabled={ruangLingkupSaving}
                                className="h-7 rounded-md bg-[#1E376C] px-2 text-[11px] font-semibold text-white hover:bg-[#2A4A8F] disabled:cursor-not-allowed disabled:bg-slate-300"
                              >
                                Simpan
                              </button>
                              <button
                                type="button"
                                onClick={cancelEditRuangLingkup}
                                className="h-7 rounded-md border border-slate-300 bg-white px-2 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
                              >
                                Batal
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => startEditRuangLingkup(item)}
                                className="rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-100"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  void handleDeleteRuangLingkup(item.id);
                                }}
                                disabled={ruangLingkupSaving}
                                className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                Hapus
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
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
                  value={editForm.judulPengajuan}
                  onChange={(e) => setEditForm((prev) => (prev ? { ...prev, judulPengajuan: e.target.value } : prev))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Mitra Tujuan</label>
                <input
                  type="text"
                  value={editForm.namaMitra}
                  onChange={(e) => setEditForm((prev) => (prev ? { ...prev, namaMitra: e.target.value } : prev))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Jurusan/Unit</label>
                <input
                  type="text"
                  value={editForm.namaUnitProdi}
                  onChange={(e) => setEditForm((prev) => (prev ? { ...prev, namaUnitProdi: e.target.value } : prev))}
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
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                  {editAllRlOptions.map((option) => {
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
                  {editAllRlOptions.length === 0 && (
                    <span className="text-[11px] text-slate-500">Belum ada ruang lingkup di master.</span>
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
                Apakah Anda yakin ingin menghapus data pengajuan <span className="font-semibold">{deleteTarget.judulPengajuan}</span>? Tindakan ini tidak bisa dibatalkan.
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

