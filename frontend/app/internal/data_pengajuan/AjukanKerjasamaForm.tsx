'use client';

import { useRouter } from 'next/navigation';
import { CalendarDays, Download, Paperclip, Pencil, Upload, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  pengajuanJurusanOptions,
  pengajuanUnitOptions,
  submitPengajuan,
} from '@/services/adminPengajuanService';
import { validateSelectedFile } from '@/lib/fileUploadUtils';

type TemplateDokumenConfig = {
  title: string;
  subtitle: string;
  struktur: string[];
  note: string;
  fileName: string;
  downloadUrl: string;
};

const defaultTemplateDokumenMap: Record<string, TemplateDokumenConfig> = {
  MoU: {
    title: 'Memorandum of Understanding (MoU)',
    subtitle: 'Template untuk kesepahaman awal kerja sama',
    struktur: ['Pembukaan', 'Para Pihak', 'Tujuan Kerja Sama', 'Ruang Lingkup', 'Jangka Waktu', 'Penutup'],
    note: 'Download template MoU terlebih dahulu, lalu unggah kembali dokumen yang sudah diisi.',
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

const jurusanOptions = pengajuanJurusanOptions;

const unitOptions = pengajuanUnitOptions;

const initialForm = {
  namaMitra: '',
  jenisMitra: '',
  teleponMitra: '',
  emailMitra: '',
  alamatMitra: '',
  negara: 'Indonesia',
  jenisKerjasama: '',
  unitPelaksana: '',
  tanggalMulai: '',
  tanggalBerakhir: '',
  judulKerjasama: '',
  deskripsi: '',
  ruangLingkup: '',
  namaKontak: '',
  jabatanKontak: '',
  emailKontak: '',
  teleponKontak: '',
};

const INTERNAL_PENGAJUAN_DRAFT_KEY = 'internal-pengajuan-draft-v1';
const MAX_FILE_SIZE = 10 * 1024 * 1024;

type InternalPengajuanDraft = {
  asal: 'Jurusan' | 'Unit';
  formData: typeof initialForm;
  hasDownloadedTemplate: boolean;
};

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type InternalAjukanKerjasamaFormProps = {
  onCancel?: () => void;
  onSubmitted?: () => void;
  enableAppearanceEdit?: boolean;
  appearanceStorageKey?: string;
};

type FormAppearanceSettings = {
  topBadgeText: string;
  pageTitle: string;
  pageSubtitle: string;
  sectionInformasiMitraTitle: string;
  sectionInformasiMitraSubtitle: string;
  sectionDetailKerjasamaTitle: string;
  sectionDetailKerjasamaSubtitle: string;
  sectionKontakTitle: string;
  sectionKontakSubtitle: string;
  sectionDokumenTitle: string;
  sectionDokumenSubtitle: string;
  labelNamaMitra: string;
  labelJenisMitra: string;
  labelTeleponMitra: string;
  labelEmailMitra: string;
  labelAlamatMitra: string;
  labelJenisKerjasama: string;
  labelDari: string;
  labelTanggalMulai: string;
  labelTanggalBerakhir: string;
  labelJudulKerjasama: string;
  labelDeskripsi: string;
  labelRuangLingkup: string;
  labelNamaKontak: string;
  labelJabatanKontak: string;
  labelEmailKontak: string;
  labelTeleponKontak: string;
};

const defaultAppearanceSettings: FormAppearanceSettings = {
  topBadgeText: 'Pengajuan Kerjasama Baru',
  pageTitle: 'Form Pengajuan Kerjasama',
  pageSubtitle: 'Isi formulir untuk mengajukan kerja sama baru dari unit internal.',
  sectionInformasiMitraTitle: 'Informasi Mitra',
  sectionInformasiMitraSubtitle: 'Data lengkap mitra kerja sama',
  sectionDetailKerjasamaTitle: 'Detail Kerjasama',
  sectionDetailKerjasamaSubtitle: 'Informasi dasar kerja sama yang akan diajukan',
  sectionKontakTitle: 'Kontak Person Mitra',
  sectionKontakSubtitle: 'Informasi kontak person dari pihak mitra',
  sectionDokumenTitle: 'Dokumen Pendukung',
  sectionDokumenSubtitle: 'Silakan pilih template resmi lebih dulu. Saya tampilkan opsinya langsung seperti alur admin.',
  labelNamaMitra: 'Nama Mitra',
  labelJenisMitra: 'Jenis Mitra',
  labelTeleponMitra: 'Telepon',
  labelEmailMitra: 'Email Mitra',
  labelAlamatMitra: 'Alamat Lengkap',
  labelJenisKerjasama: 'Jenis Kerjasama',
  labelDari: 'Dari',
  labelTanggalMulai: 'Tanggal Mulai',
  labelTanggalBerakhir: 'Tanggal Berakhir',
  labelJudulKerjasama: 'Judul Kerjasama',
  labelDeskripsi: 'Deskripsi',
  labelRuangLingkup: 'Ruang Lingkup',
  labelNamaKontak: 'Nama Lengkap',
  labelJabatanKontak: 'Jabatan',
  labelEmailKontak: 'Email',
  labelTeleponKontak: 'Telepon',
};

const DEFAULT_APPEARANCE_STORAGE_KEY = 'internal-pengajuan-appearance-v1';

export default function InternalAjukanKerjasamaForm({
  onCancel,
  onSubmitted,
  enableAppearanceEdit = false,
  appearanceStorageKey = DEFAULT_APPEARANCE_STORAGE_KEY,
}: InternalAjukanKerjasamaFormProps) {
  const router = useRouter();
  const [asal, setAsal] = useState<'Jurusan' | 'Unit'>('Jurusan');
  const asalOptions = asal === 'Jurusan' ? jurusanOptions : unitOptions;
  const [dokumen, setDokumen] = useState<File[]>([]);
  const [formData, setFormData] = useState(initialForm);
  const [hasDownloadedTemplate, setHasDownloadedTemplate] = useState(false);
  const [isAppearanceEditMode, setIsAppearanceEditMode] = useState(false);
  const [appearanceSettings, setAppearanceSettings] = useState<FormAppearanceSettings>(defaultAppearanceSettings);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const storedRaw = window.localStorage.getItem(INTERNAL_PENGAJUAN_DRAFT_KEY);
      if (!storedRaw) {
        return;
      }

      const parsed = JSON.parse(storedRaw) as Partial<InternalPengajuanDraft>;

      if (parsed.asal === 'Jurusan' || parsed.asal === 'Unit') {
        setAsal(parsed.asal);
      }

      if (parsed.formData) {
        setFormData({ ...initialForm, ...parsed.formData });
      }

      if (typeof parsed.hasDownloadedTemplate === 'boolean') {
        setHasDownloadedTemplate(parsed.hasDownloadedTemplate);
      }
    } catch {
      // Abaikan draft rusak agar form tetap bisa dipakai normal.
    }
  }, []);

  useEffect(() => {
    if (!enableAppearanceEdit || typeof window === 'undefined') {
      return;
    }

    try {
      const storedRaw = window.localStorage.getItem(appearanceStorageKey);
      if (!storedRaw) {
        return;
      }

      const parsed = JSON.parse(storedRaw) as Partial<FormAppearanceSettings>;
      setAppearanceSettings((prev) => ({ ...prev, ...parsed }));
    } catch {
      window.localStorage.removeItem(appearanceStorageKey);
    }
  }, [appearanceStorageKey, enableAppearanceEdit]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const draft: InternalPengajuanDraft = {
      asal,
      formData,
      hasDownloadedTemplate,
    };

    window.localStorage.setItem(INTERNAL_PENGAJUAN_DRAFT_KEY, JSON.stringify(draft));
  }, [asal, formData, hasDownloadedTemplate]);

  useEffect(() => {
    if (!enableAppearanceEdit || typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(appearanceStorageKey, JSON.stringify(appearanceSettings));
  }, [appearanceSettings, appearanceStorageKey, enableAppearanceEdit]);

  const updateAppearance = (field: keyof FormAppearanceSettings, value: string) => {
    setAppearanceSettings((prev) => ({ ...prev, [field]: value }));
  };

  const resetAppearance = () => {
    setAppearanceSettings(defaultAppearanceSettings);
  };

  const handleJenisDokumenChange = (value: string) => {
    setFormData((prev) => ({ ...prev, jenisKerjasama: value }));
    setHasDownloadedTemplate(false);
    setDokumen([]);
  };

  const handleDownloadTemplate = () => {
    if (!formData.jenisKerjasama || !defaultTemplateDokumenMap[formData.jenisKerjasama]) return;

    const doc = defaultTemplateDokumenMap[formData.jenisKerjasama];
    const link = document.createElement('a');
    link.href = doc.downloadUrl;
    link.download = doc.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setHasDownloadedTemplate(true);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!hasDownloadedTemplate) return;

    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    for (const file of files) {
      const validationError = validateSelectedFile(file, {
        accept: '.pdf,.doc,.docx',
        maxSizeBytes: MAX_FILE_SIZE,
      });

      if (validationError) {
        alert(`${file.name}: ${validationError}`);
        event.target.value = '';
        return;
      }
    }

    setDokumen((prev) => [...prev, ...files]);
    event.target.value = '';
  };

  const handleRemoveDokumen = (indexToRemove: number) => {
    setDokumen((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleChange = (field: keyof typeof initialForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    submitPengajuan({
      judul: formData.judulKerjasama,
      pengusul: formData.namaKontak || 'Internal Polibatam',
      mitra: formData.namaMitra,
      jenisDokumen: formData.jenisKerjasama,
      jurusan: formData.unitPelaksana,
      kategori: 'Internal',
      negara: formData.negara,
      tanggalMulai: formData.tanggalMulai,
      tanggalBerakhir: formData.tanggalBerakhir,
      emailPengusul: formData.emailKontak,
      whatsappPengusul: formData.teleponKontak,
      ruangLingkup: formData.ruangLingkup
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      fileName: dokumen.map((file) => file.name).join(', ') || 'Dokumen pendukung internal',
    });

    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(INTERNAL_PENGAJUAN_DRAFT_KEY);
    }

    alert('Pengajuan kerjasama berhasil dikirim ke admin untuk direview.');

    if (onSubmitted) {
      onSubmitted();
      return;
    }

    router.push('/internal/data_pengajuan');
  };

  return (
    <div className="mx-auto max-w-6xl rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
        <div>
          <p className="text-sm font-semibold text-[#173B82]">{appearanceSettings.topBadgeText}</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">{appearanceSettings.pageTitle}</h1>
          <p className="mt-1 text-sm text-slate-500">{appearanceSettings.pageSubtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          {enableAppearanceEdit && (
            <button
              type="button"
              onClick={() => setIsAppearanceEditMode((prev) => !prev)}
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition ${isAppearanceEditMode ? 'border-[#1E376C] bg-[#1E376C] text-white' : 'border-slate-300 bg-white text-slate-700 hover:border-[#1E376C] hover:text-[#1E376C]'}`}
            >
              <Pencil size={15} />
              {isAppearanceEditMode ? 'Tutup Ubah Nama Form' : 'Ubah Nama Form'}
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              if (onCancel) {
                onCancel();
                return;
              }

              router.push('/internal/data_pengajuan');
            }}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            aria-label="Tutup"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
        {enableAppearanceEdit && isAppearanceEditMode && (
          <section className="rounded-2xl border border-[#D7E0F0] bg-[#F8FAFF] p-5 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-[#173B82]">Ubah Nama Form</h2>
                <p className="text-sm text-gray-600 mt-1">Sesuaikan label form tanpa mengubah alur submit atau validasi data.</p>
              </div>
              <button
                type="button"
                onClick={resetAppearance}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#1E376C] hover:text-[#1E376C]"
              >
                Reset Default
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900">Judul halaman</label>
                <input value={appearanceSettings.pageTitle} onChange={(e) => updateAppearance('pageTitle', e.target.value)} className="input-field h-10 w-full px-3 text-sm" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900">Subjudul halaman</label>
                <input value={appearanceSettings.pageSubtitle} onChange={(e) => updateAppearance('pageSubtitle', e.target.value)} className="input-field h-10 w-full px-3 text-sm" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900">Nama field jenis kerjasama</label>
                <input value={appearanceSettings.labelJenisKerjasama} onChange={(e) => updateAppearance('labelJenisKerjasama', e.target.value)} className="input-field h-10 w-full px-3 text-sm" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900">Nama field ruang lingkup</label>
                <input value={appearanceSettings.labelRuangLingkup} onChange={(e) => updateAppearance('labelRuangLingkup', e.target.value)} className="input-field h-10 w-full px-3 text-sm" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900">Nama field nama mitra</label>
                <input value={appearanceSettings.labelNamaMitra} onChange={(e) => updateAppearance('labelNamaMitra', e.target.value)} className="input-field h-10 w-full px-3 text-sm" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900">Nama field email kontak</label>
                <input value={appearanceSettings.labelEmailKontak} onChange={(e) => updateAppearance('labelEmailKontak', e.target.value)} className="input-field h-10 w-full px-3 text-sm" />
              </div>
            </div>
          </section>
        )}
        <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h2 className="text-base font-bold text-slate-900">{appearanceSettings.sectionInformasiMitraTitle}</h2>
          <p className="mb-4 text-xs text-slate-500">{appearanceSettings.sectionInformasiMitraSubtitle}</p>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">{appearanceSettings.labelNamaMitra}</label>
              <input value={formData.namaMitra} onChange={(e) => handleChange('namaMitra', e.target.value)} className="input-field h-10 w-full rounded-lg px-3 text-sm" placeholder="PT. Mitra Perusahaan" required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">{appearanceSettings.labelJenisMitra}</label>
              <select value={formData.jenisMitra} onChange={(e) => handleChange('jenisMitra', e.target.value)} className="input-field h-10 w-full rounded-lg px-3 text-sm" required>
                <option value="">Pilih jenis mitra</option>
                <option>Industri</option>
                <option>Perguruan Tinggi</option>
                <option>Instansi Pemerintah</option>
                <option>Komunitas</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">{appearanceSettings.labelTeleponMitra}</label>
              <input value={formData.teleponMitra} onChange={(e) => handleChange('teleponMitra', e.target.value)} className="input-field h-10 w-full rounded-lg px-3 text-sm" placeholder="+62 812 3456 7890" required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">{appearanceSettings.labelEmailMitra}</label>
              <input type="email" value={formData.emailMitra} onChange={(e) => handleChange('emailMitra', e.target.value)} className="input-field h-10 w-full rounded-lg px-3 text-sm" placeholder="mitra@email.com" required />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-semibold text-slate-700">{appearanceSettings.labelAlamatMitra}</label>
              <textarea value={formData.alamatMitra} onChange={(e) => handleChange('alamatMitra', e.target.value)} className="input-field min-h-[90px] w-full rounded-lg px-3 py-2 text-sm" placeholder="Masukkan alamat lengkap mitra" required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Negara Mitra</label>
              <select value={formData.negara} onChange={(e) => handleChange('negara', e.target.value)} className="input-field h-10 w-full rounded-lg px-3 text-sm">
                <option value="Indonesia">Indonesia (Dalam Negeri)</option>
                <option value="Malaysia">Malaysia</option>
                <option value="Singapura">Singapura</option>
                <option value="Amerika Serikat">Amerika Serikat</option>
                <option value="Jepang">Jepang</option>
                <option value="Korea Selatan">Korea Selatan</option>
                <option value="Australia">Australia</option>
                <option value="Jerman">Jerman</option>
                <option value="Belanda">Belanda</option>
                <option value="Inggris">Inggris</option>
                <option value="Tiongkok">Tiongkok</option>
                <option value="Lainnya">Lainnya</option>
              </select>
              <p className="mt-1 text-xs text-slate-500">
                {formData.negara && formData.negara !== 'Indonesia' ? '🌐 Luar Negeri' : '🇮🇩 Dalam Negeri'}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h2 className="text-base font-bold text-slate-900">{appearanceSettings.sectionDetailKerjasamaTitle}</h2>
          <p className="mb-4 text-xs text-slate-500">{appearanceSettings.sectionDetailKerjasamaSubtitle}</p>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">{appearanceSettings.labelJenisKerjasama}</label>
              <select value={formData.jenisKerjasama} onChange={(e) => handleJenisDokumenChange(e.target.value)} className="input-field h-10 w-full rounded-lg px-3 text-sm" required>
                <option value="">Pilih jenis kerjasama</option>
                <option>MoU</option>
                <option>MoA</option>
                <option>IA</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">{appearanceSettings.labelDari}</label>
              <div className="mb-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAsal('Jurusan');
                    handleChange('unitPelaksana', '');
                  }}
                  className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                    asal === 'Jurusan'
                      ? 'border-[#173B82] bg-[#173B82] text-white shadow-sm'
                      : 'border-slate-300 bg-white text-slate-700 hover:border-[#173B82]'
                  }`}
                >
                  Jurusan
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAsal('Unit');
                    handleChange('unitPelaksana', '');
                  }}
                  className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                    asal === 'Unit'
                      ? 'border-[#173B82] bg-[#173B82] text-white shadow-sm'
                      : 'border-slate-300 bg-white text-slate-700 hover:border-[#173B82]'
                  }`}
                >
                  Unit
                </button>
              </div>
              <select value={formData.unitPelaksana} onChange={(e) => handleChange('unitPelaksana', e.target.value)} className="input-field h-10 w-full rounded-lg px-3 text-sm" required>
                <option value="">-- Pilih {asal} --</option>
                {asalOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">{appearanceSettings.labelTanggalMulai}</label>
              <div className="relative">
                <input type="date" value={formData.tanggalMulai} onChange={(e) => handleChange('tanggalMulai', e.target.value)} className="input-field h-10 w-full rounded-lg px-3 pr-10 text-sm" required />
                <CalendarDays size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">{appearanceSettings.labelTanggalBerakhir}</label>
              <div className="relative">
                <input type="date" value={formData.tanggalBerakhir} onChange={(e) => handleChange('tanggalBerakhir', e.target.value)} className="input-field h-10 w-full rounded-lg px-3 pr-10 text-sm" required />
                <CalendarDays size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-semibold text-slate-700">{appearanceSettings.labelJudulKerjasama}</label>
              <input value={formData.judulKerjasama} onChange={(e) => handleChange('judulKerjasama', e.target.value)} className="input-field h-10 w-full rounded-lg px-3 text-sm" placeholder="Judul atau nama kerjasama" required />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-semibold text-slate-700">{appearanceSettings.labelDeskripsi}</label>
              <textarea value={formData.deskripsi} onChange={(e) => handleChange('deskripsi', e.target.value)} className="input-field min-h-[90px] w-full rounded-lg px-3 py-2 text-sm" placeholder="Jelaskan detail kerjasama yang diajukan" required />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-semibold text-slate-700">{appearanceSettings.labelRuangLingkup}</label>
              <textarea value={formData.ruangLingkup} onChange={(e) => handleChange('ruangLingkup', e.target.value)} className="input-field min-h-[80px] w-full rounded-lg px-3 py-2 text-sm" placeholder="Pisahkan dengan koma, misalnya: Penelitian, Magang, Pelatihan" required />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h2 className="text-base font-bold text-slate-900">{appearanceSettings.sectionKontakTitle}</h2>
          <p className="mb-4 text-xs text-slate-500">{appearanceSettings.sectionKontakSubtitle}</p>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">{appearanceSettings.labelNamaKontak}</label>
              <input value={formData.namaKontak} onChange={(e) => handleChange('namaKontak', e.target.value)} className="input-field h-10 w-full rounded-lg px-3 text-sm" placeholder="Nama kontak person" required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">{appearanceSettings.labelJabatanKontak}</label>
              <input value={formData.jabatanKontak} onChange={(e) => handleChange('jabatanKontak', e.target.value)} className="input-field h-10 w-full rounded-lg px-3 text-sm" placeholder="Jabatan di perusahaan" required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">{appearanceSettings.labelEmailKontak}</label>
              <input type="email" value={formData.emailKontak} onChange={(e) => handleChange('emailKontak', e.target.value)} className="input-field h-10 w-full rounded-lg px-3 text-sm" placeholder="email@contoh.com" required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">{appearanceSettings.labelTeleponKontak}</label>
              <input value={formData.teleponKontak} onChange={(e) => handleChange('teleponKontak', e.target.value)} className="input-field h-10 w-full rounded-lg px-3 text-sm" placeholder="+62 812 3457 6789" required />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h2 className="text-base font-bold text-slate-900">{appearanceSettings.sectionDokumenTitle}</h2>
          <p className="mb-4 text-xs text-slate-500">{appearanceSettings.sectionDokumenSubtitle}</p>

          <div className="mb-4 grid gap-3 md:grid-cols-3">
            {Object.entries(defaultTemplateDokumenMap).map(([key, template]) => {
              const active = formData.jenisKerjasama === key;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleJenisDokumenChange(key)}
                  className={`rounded-xl border p-4 text-left transition-all ${
                    active
                      ? 'border-[#173B82] bg-blue-50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-[#173B82] px-2.5 py-1 text-xs font-bold text-white">{key}</span>
                    {active && <span className="text-xs font-semibold text-[#173B82]">Terpilih</span>}
                  </div>
                  <p className="mt-3 text-sm font-bold text-slate-900">{template.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{template.subtitle}</p>
                </button>
              );
            })}
          </div>

          {!formData.jenisKerjasama && (
            <div className="mb-4 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-slate-500">
              Belum ada template dipilih. Pilih salah satu dari MoU, MoA, atau IA di atas.
            </div>
          )}

          {formData.jenisKerjasama && defaultTemplateDokumenMap[formData.jenisKerjasama] && (
            <div className="mb-4 rounded-xl border border-[#D7E0F0] bg-[#F8FAFF] p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-lg font-bold text-[#173B82]">{defaultTemplateDokumenMap[formData.jenisKerjasama].title}</p>
                  <p className="text-sm text-slate-600">{defaultTemplateDokumenMap[formData.jenisKerjasama].subtitle}</p>
                  <p className="mt-2 text-xs text-slate-500">File template: {defaultTemplateDokumenMap[formData.jenisKerjasama].fileName}</p>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#173B82] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0f2c61]"
                >
                  <Download size={16} />
                  Download Template
                </button>
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {defaultTemplateDokumenMap[formData.jenisKerjasama].struktur.map((item) => (
                  <div key={item} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                    {item}
                  </div>
                ))}
              </div>

              <p className="mt-3 text-xs text-slate-600">Catatan: {defaultTemplateDokumenMap[formData.jenisKerjasama].note}</p>
            </div>
          )}

          <div className="space-y-3">
            <label
              className={`block rounded-xl border-2 border-dashed p-5 transition ${
                hasDownloadedTemplate
                  ? 'cursor-pointer border-[#173B82]/30 bg-white hover:border-[#173B82] hover:bg-slate-50'
                  : 'cursor-not-allowed border-slate-200 bg-slate-100'
              }`}
            >
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
                disabled={!hasDownloadedTemplate}
                className="hidden"
              />

              <div className="flex flex-col items-center justify-center text-center">
                <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-full ${hasDownloadedTemplate ? 'bg-[#173B82]/10 text-[#173B82]' : 'bg-slate-200 text-slate-400'}`}>
                  <Upload size={20} />
                </div>
                <p className="text-sm font-semibold text-slate-800">
                  {hasDownloadedTemplate ? 'Klik untuk upload dokumen pendukung' : 'Download template dulu sebelum upload'}
                </p>
                <p className="mt-1 text-xs text-slate-500">Format yang didukung: PDF, DOC, DOCX</p>
                <p className="mt-1 text-xs text-slate-500">Ukuran maksimal per file: 10 MB</p>
              </div>
            </label>

            {dokumen.length > 0 && (
              <div className="space-y-2">
                {dokumen.map((file, index) => (
                  <div key={`${file.name}-${index}`} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                    <div className="flex min-w-0 items-center gap-2">
                      <Paperclip size={15} className="shrink-0 text-slate-500" />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-800">{file.name}</p>
                        <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveDokumen(index)}
                      className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-rose-600"
                      aria-label={`Hapus ${file.name}`}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
          <button
            type="button"
            onClick={() => {
              if (onCancel) {
                onCancel();
                return;
              }

              router.push('/internal/data_pengajuan');
            }}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Batal
          </button>
          <button
            type="submit"
            className="rounded-lg bg-[#173B82] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0f2c61]"
          >
            Ajukan Kerjasama
          </button>
        </div>
      </form>
    </div>
  );
}
