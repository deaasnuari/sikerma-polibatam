'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Download, Upload, X } from 'lucide-react';
import { submitPengajuan } from '@/services/adminPengajuanService';

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

const jurusanOptions = [
  'Manajemen dan Bisnis',
  'Teknik Elektro',
  'Teknik Informatika',
  'Teknik Mesin',
];

const unitOptions = [
  'SHILAU (Satuan Hilirisasi Inovasi dan Layanan Usaha)',
  'P4M (Pusat Penjaminan Mutu dan Pengembangan Pembelajaran)',
  'P3M (Pusat Penelitian dan Pengabdian Kepada Masyarakat)',
  'SPI (Satuan Pengawas Internal)',
  'Akademik (Subag Akademik)',
  'SBUM (Sub Bagian Umum)',
  'UPA PKK (Pengembangan Karier dan Kewirausahaan)',
  'UPA Perpustakaan',
  'UPA PP (Perbaikan dan Perawatan)',
  'UPA TIK (Teknologi Informasi dan Komunikasi)',
  'Pokja OSDM (Organisasi dan SDM)',
  'Pokja Perencanaan',
  'Pokja Kemahasiswaan',
  'Pokja BMN & Pengadaan',
  'Pokja Keuangan',
  'Pokja Humas dan Kerjasama',
];

type TemplateDokumenConfig = {
  title: string;
  subtitle: string;
  struktur: string[];
  note: string;
  fileName: string;
  downloadUrl: string;
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const defaultTemplateDokumenMap: Record<string, TemplateDokumenConfig> = {
  MoU: {
    title: 'Memorandum of Understanding (MoU)',
    subtitle: 'Template untuk kesepahaman awal kerjasama',
    struktur: [
      'Pembukaan',
      'Para Pihak',
      'Latar Belakang',
      'Tujuan Kerjasama',
      'Ruang Lingkup',
      'Jangka Waktu',
      'Penutup',
    ],
    note: 'Gunakan template MOU asli ini, lalu edit dan upload kembali hasilnya.',
    fileName: 'Draft MOU Industri.docx',
    downloadUrl: '/templates/Draft%20MOU%20Industri.docx',
  },
  MoA: {
    title: 'Memorandum of Agreement (MoA)',
    subtitle: 'Template untuk perjanjian teknis pelaksanaan kerjasama',
    struktur: [
      'Pembukaan',
      'Dasar Pelaksanaan',
      'Hak dan Kewajiban',
      'Program Magang',
      'Pendanaan',
      'Monitoring dan Evaluasi',
      'Penutup',
    ],
    note: 'Gunakan template MOA asli ini, lalu edit dan upload kembali hasilnya.',
    fileName: 'Draft MOA Magang.docx',
    downloadUrl: '/templates/Draft%20MOA%20Magang.docx',
  },
  IA: {
    title: 'Implementation Arrangement (IA)',
    subtitle: 'Template untuk rincian implementasi program/kegiatan',
    struktur: [
      'Informasi Program',
      'Target dan Indikator',
      'Peran Tim Pelaksana',
      'Timeline',
      'Output',
      'Pelaporan',
      'Penutup',
    ],
    note: 'Gunakan template IA asli ini, lalu edit dan upload kembali hasilnya.',
    fileName: 'DRAFT IA POLIBATAM.docx',
    downloadUrl: '/templates/DRAFT%20IA%20POLIBATAM.docx',
  },
};

type AjukanFormProps = {
  onClose?: () => void;
};

type DialogState = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
};

export default function AjukanForm({ onClose }: AjukanFormProps) {
  const router = useRouter();
  const [asal, setAsal] = useState<'Jurusan' | 'Unit'>('Jurusan');
  const asalOptions = asal === 'Jurusan' ? jurusanOptions : unitOptions;
  const [formData, setFormData] = useState({
    judulPengajuan: '',
    namaPengusul: '',
    namaMitraTujuan: '',
    asalUnit: '',
    jenisDokumen: '',
    tanggalMulai: '',
    tanggalBerakhir: '',
    ruangLingkup: [] as string[],
    deskripsi: '',
    emailPengusul: '',
    whatsappPengusul: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasDownloadedTemplate, setHasDownloadedTemplate] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dialog, setDialog] = useState<DialogState | null>(null);

  function closeFormView() {
    if (onClose) {
      onClose();
      return;
    }

    router.push('/admin/data_pengajuan');
  }

  function handleInputChange(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  }

  function handleJenisDokumenChange(value: string) {
    setFormData((prev) => ({ ...prev, jenisDokumen: value }));
    setHasDownloadedTemplate(false);
    setSelectedFile(null);
    setErrors((prev) => ({ ...prev, jenisDokumen: '', templateDownload: '', fileDokumen: '' }));
  }

  function handleDownloadTemplate() {
    if (!formData.jenisDokumen || !defaultTemplateDokumenMap[formData.jenisDokumen]) return;

    const doc = defaultTemplateDokumenMap[formData.jenisDokumen];
    const link = document.createElement('a');
    link.href = doc.downloadUrl;
    link.download = doc.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setHasDownloadedTemplate(true);
    setErrors((prev) => ({ ...prev, templateDownload: '' }));
  }

  function handleFileChange(file: File | null) {
    if (!file) {
      setSelectedFile(null);
      setErrors((prev) => ({ ...prev, fileDokumen: '' }));
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setSelectedFile(null);
      setErrors((prev) => ({
        ...prev,
        fileDokumen: 'Ukuran file melebihi batas 10 MB. Silakan pilih file yang lebih kecil.',
      }));
      return;
    }

    setSelectedFile(file);
    setErrors((prev) => ({ ...prev, fileDokumen: '' }));
  }

  function updateTemplateField(_field: 'title' | 'subtitle' | 'note', _value: string) {}
  function updateTemplateStruktur(_rawText: string) {}

  function handleRuangLingkupChange(option: string) {
    setFormData((prev) => {
      const exists = prev.ruangLingkup.includes(option);
      const next = exists
        ? prev.ruangLingkup.filter((item) => item !== option)
        : [...prev.ruangLingkup, option];
      return { ...prev, ruangLingkup: next };
    });
    setErrors((prev) => ({ ...prev, ruangLingkup: '' }));
  }

  function validateForm() {
    const nextErrors: Record<string, string> = {};

    if (!formData.judulPengajuan.trim()) nextErrors.judulPengajuan = 'Judul pengajuan wajib diisi';
    if (!formData.namaPengusul.trim()) nextErrors.namaPengusul = 'Nama pengusul wajib diisi';
    if (!formData.namaMitraTujuan.trim()) nextErrors.namaMitraTujuan = 'Nama mitra tujuan wajib diisi';
    if (!formData.asalUnit.trim()) nextErrors.asalUnit = `Silakan pilih ${asal.toLowerCase()}`;
    if (!formData.jenisDokumen.trim()) nextErrors.jenisDokumen = 'Silakan pilih jenis dokumen';
    if (!formData.tanggalMulai) nextErrors.tanggalMulai = 'Tanggal mulai wajib diisi';
    if (!formData.tanggalBerakhir) nextErrors.tanggalBerakhir = 'Tanggal berakhir wajib diisi';
    if (formData.tanggalMulai && formData.tanggalBerakhir && formData.tanggalBerakhir < formData.tanggalMulai) {
      nextErrors.tanggalBerakhir = 'Tanggal berakhir tidak boleh lebih awal dari tanggal mulai';
    }
    if (formData.ruangLingkup.length === 0) nextErrors.ruangLingkup = 'Pilih minimal 1 ruang lingkup';
    if (!formData.deskripsi.trim()) nextErrors.deskripsi = 'Deskripsi dan tujuan kerjasama wajib diisi';
    if (formData.jenisDokumen && !hasDownloadedTemplate) nextErrors.templateDownload = 'Download template terlebih dahulu';
    if (formData.jenisDokumen && !selectedFile) nextErrors.fileDokumen = 'Upload dokumen wajib diisi';
    if (!formData.emailPengusul.trim()) nextErrors.emailPengusul = 'Email pengusul wajib diisi';
    if (!formData.whatsappPengusul.trim()) nextErrors.whatsappPengusul = 'Whatsapp pengusul wajib diisi';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!validateForm()) {
      setDialog({
        title: 'Form Belum Lengkap',
        message: 'Harap isi semua form wajib sebelum submit.',
        confirmLabel: 'OK',
      });
      return;
    }

    submitPengajuan({
      judul: formData.judulPengajuan,
      pengusul: formData.namaPengusul,
      mitra: formData.namaMitraTujuan,
      jenisDokumen: formData.jenisDokumen,
      jurusan: formData.asalUnit,
      kategori: asal === 'Unit' ? 'Internal' : 'Eksternal',
      tanggalMulai: formData.tanggalMulai,
      tanggalBerakhir: formData.tanggalBerakhir,
      emailPengusul: formData.emailPengusul,
      whatsappPengusul: formData.whatsappPengusul,
      ruangLingkup: formData.ruangLingkup,
      fileName: selectedFile?.name || '',
    });

    setDialog({
      title: 'Pengajuan Berhasil',
      message: 'Pengajuan berhasil dikirim. Verifikasi email sedang dimatikan sementara.',
      confirmLabel: 'OK',
      onConfirm: closeFormView,
    });
  }

  function handleCancel() {
    const hasChanges =
      formData.judulPengajuan ||
      formData.namaPengusul ||
      formData.namaMitraTujuan ||
      formData.asalUnit ||
      formData.jenisDokumen ||
      formData.tanggalMulai ||
      formData.tanggalBerakhir ||
      formData.ruangLingkup.length > 0 ||
      formData.deskripsi ||
      formData.emailPengusul ||
      formData.whatsappPengusul ||
      selectedFile;

    if (hasChanges) {
      setDialog({
        title: 'Batalkan Perubahan?',
        message: 'Perubahan belum disimpan. Yakin ingin batal?',
        confirmLabel: 'Ya, Batalkan',
        cancelLabel: 'Lanjut Edit',
        onConfirm: closeFormView,
      });
      return;
    }

    closeFormView();
  }

  return (
    <div className="card mx-auto max-w-[1100px]">
      <div className="px-7 py-6 flex items-start justify-between gap-4 border-b border-slate-200">
        <div>
          <h1 className="page-title">Form Pengajuan Kerjasama Baru</h1>
        </div>
        <button
          type="button"
          onClick={handleCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors mt-1"
          aria-label="Kembali ke daftar pengajuan"
        >
          <X size={24} />
        </button>
      </div>

      <form className="px-7 pb-7 space-y-6" onSubmit={handleSubmit}>
        <section className="space-y-5">
          <h2 className="text-2xl leading-none font-bold text-gray-900">Informasi Dasar</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-5">
              <div>
                <label className="block text-lg leading-none font-semibold text-gray-900 mb-3">Judul Pengajuan *</label>
                <input
                  type="text"
                  value={formData.judulPengajuan}
                  onChange={(e) => handleInputChange('judulPengajuan', e.target.value)}
                  className="input-field w-full px-4 h-11 text-base text-gray-700"
                />
                {errors.judulPengajuan && <p className="text-xs text-red-600 mt-1.5">{errors.judulPengajuan}</p>}
              </div>

              <div>
                <label className="block text-lg leading-none font-semibold text-gray-900 mb-3">Nama Pengusul*</label>
                <input
                  type="text"
                  value={formData.namaPengusul}
                  onChange={(e) => handleInputChange('namaPengusul', e.target.value)}
                  className="input-field w-full px-4 h-11 text-base text-gray-700"
                />
                {errors.namaPengusul && <p className="text-xs text-red-600 mt-1.5">{errors.namaPengusul}</p>}
              </div>

              <div>
                <label className="block text-lg leading-none font-semibold text-gray-900 mb-3">Nama Mitra Tujuan *</label>
                <input
                  type="text"
                  value={formData.namaMitraTujuan}
                  onChange={(e) => handleInputChange('namaMitraTujuan', e.target.value)}
                  className="input-field w-full px-4 h-11 text-base text-gray-700"
                />
                {errors.namaMitraTujuan && <p className="text-xs text-red-600 mt-1.5">{errors.namaMitraTujuan}</p>}
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="block text-lg leading-none font-semibold text-gray-900 mb-3">Tanggal Mulai *</label>
                  <input
                    type="date"
                    value={formData.tanggalMulai}
                    onChange={(e) => handleInputChange('tanggalMulai', e.target.value)}
                    className="input-field w-full px-4 h-11 text-base text-gray-700"
                  />
                  {errors.tanggalMulai && <p className="text-xs text-red-600 mt-1.5">{errors.tanggalMulai}</p>}
                </div>

                <div>
                  <label className="block text-lg leading-none font-semibold text-gray-900 mb-3">Tanggal Berakhir *</label>
                  <input
                    type="date"
                    value={formData.tanggalBerakhir}
                    min={formData.tanggalMulai || undefined}
                    onChange={(e) => handleInputChange('tanggalBerakhir', e.target.value)}
                    className="input-field w-full px-4 h-11 text-base text-gray-700"
                  />
                  {errors.tanggalBerakhir && <p className="text-xs text-red-600 mt-1.5">{errors.tanggalBerakhir}</p>}
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-lg leading-none font-semibold text-gray-900 mb-3">Dari *</label>
                <div className="flex items-center gap-8 mb-3">
                  <label className="inline-flex items-center gap-2 text-base text-gray-700">
                    <input
                      type="radio"
                      name="asal"
                      value="Jurusan"
                      checked={asal === 'Jurusan'}
                      onChange={() => {
                        setAsal('Jurusan');
                        handleInputChange('asalUnit', '');
                      }}
                      className="accent-[#1E376C] h-4 w-4"
                    />
                    Jurusan
                  </label>
                  <label className="inline-flex items-center gap-2 text-base text-gray-700">
                    <input
                      type="radio"
                      name="asal"
                      value="Unit"
                      checked={asal === 'Unit'}
                      onChange={() => {
                        setAsal('Unit');
                        handleInputChange('asalUnit', '');
                      }}
                      className="accent-[#1E376C] h-4 w-4"
                    />
                    Unit
                  </label>
                </div>
                <select
                  value={formData.asalUnit}
                  onChange={(e) => handleInputChange('asalUnit', e.target.value)}
                  className="input-field w-full px-4 h-11 text-sm text-gray-700 bg-white"
                >
                  <option value="">-- Pilih {asal} --</option>
                  {asalOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {errors.asalUnit && <p className="text-xs text-red-600 mt-1.5">{errors.asalUnit}</p>}
              </div>

              <div>
                <label className="block text-lg leading-none font-semibold text-gray-900 mb-3">Jenis Dokumen *</label>
                <select
                  value={formData.jenisDokumen}
                  onChange={(e) => handleJenisDokumenChange(e.target.value)}
                  className={`input-field w-full px-4 h-11 text-base bg-white ${formData.jenisDokumen ? 'text-gray-700' : 'text-gray-500'}`}
                >
                  <option value="">-- Pilih Jenis --</option>
                  <option value="MoU">MoU</option>
                  <option value="MoA">MoA</option>
                  <option value="IA">IA</option>
                </select>
                {errors.jenisDokumen && <p className="text-xs text-red-600 mt-1.5">{errors.jenisDokumen}</p>}
              </div>
            </div>
          </div>

          {formData.jenisDokumen && defaultTemplateDokumenMap[formData.jenisDokumen] && (
            <div className="rounded-2xl border border-[#D7E0F0] bg-[#F8FAFF] p-4 sm:p-5 space-y-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Template Dokumen</h3>
                <p className="text-sm text-gray-600 mt-1">Alurnya sederhana: download template, isi dokumen, lalu upload kembali.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-xl border border-[#D7E0F0] bg-white px-4 py-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1E376C] text-white text-xs font-bold">1</span>
                    <p className="text-sm font-semibold text-gray-900">Download Template</p>
                  </div>
                  <p className="text-xs text-gray-600">Unduh file sesuai jenis dokumen yang dipilih.</p>
                </div>
                <div className="rounded-xl border border-[#D7E0F0] bg-white px-4 py-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1E376C] text-white text-xs font-bold">2</span>
                    <p className="text-sm font-semibold text-gray-900">Isi Dokumen</p>
                  </div>
                  <p className="text-xs text-gray-600">Lengkapi template Word sesuai kebutuhan pengajuan.</p>
                </div>
                <div className="rounded-xl border border-[#D7E0F0] bg-white px-4 py-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1E376C] text-white text-xs font-bold">3</span>
                    <p className="text-sm font-semibold text-gray-900">Upload Hasil</p>
                  </div>
                  <p className="text-xs text-gray-600">Upload kembali file yang sudah kamu edit.</p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="text-xl font-bold text-[#173B82]">{defaultTemplateDokumenMap[formData.jenisDokumen].title}</p>
                    <p className="text-sm text-gray-600">{defaultTemplateDokumenMap[formData.jenisDokumen].subtitle}</p>
                    <div className="mt-2 inline-flex items-center gap-2 rounded-lg border border-[#C9D8F5] bg-[#EEF4FF] px-3 py-1.5">
                      <span className="text-[11px] font-semibold text-[#173B82]">Template aktif:</span>
                      <span className="text-xs font-bold text-[#0F2F6B]">
                        {defaultTemplateDokumenMap[formData.jenisDokumen].fileName}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="btn-primary inline-flex items-center justify-center gap-2 h-11 px-4 text-sm font-semibold shadow-sm"
                  >
                    <Download size={16} />
                    Download Template
                  </button>
                </div>

                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-sm font-semibold text-[#173B82] mb-2">Isi utama dokumen:</p>
                  <div className="flex flex-wrap gap-2">
                    {defaultTemplateDokumenMap[formData.jenisDokumen].struktur.map((item) => (
                      <span key={item} className="rounded-full bg-white border border-slate-200 px-3 py-1 text-xs text-gray-700">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="mt-3 text-xs text-[#173B82] bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                  Catatan: {defaultTemplateDokumenMap[formData.jenisDokumen].note}
                </p>
              </div>

              <div>
                <label className="block text-lg leading-none font-semibold text-gray-900 mb-3">Upload Dokumen *</label>

                {!hasDownloadedTemplate ? (
                  <p className="text-xs text-[#1E376C] bg-[#EEF3FF] border border-[#D7E0F0] rounded-lg px-3 py-2 mb-2">
                    Download template terlebih dahulu, lalu isi dan upload file hasilnya di sini.
                  </p>
                ) : (
                  <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-2">
                    Template sudah diunduh. Sekarang kamu bisa upload file hasil editnya.
                  </p>
                )}

                <label
                  className={`w-full rounded-2xl border-2 border-dashed p-5 text-center block transition-all ${!hasDownloadedTemplate
                    ? 'border-gray-300 bg-gray-100 cursor-not-allowed'
                    : selectedFile
                      ? 'border-green-400 bg-green-50 cursor-pointer shadow-sm'
                      : 'border-[#BFD0EE] bg-[#F5F8FF] cursor-pointer'} `}
                >
                  <input
                    type="file"
                    accept=".doc,.docx"
                    disabled={!hasDownloadedTemplate}
                    onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <Upload className={`mx-auto ${selectedFile ? 'text-green-600' : 'text-[#1E376C]'}`} size={22} />
                  <p className={`text-base font-semibold mt-2 ${selectedFile ? 'text-green-700' : 'text-[#1E376C]'}`}>
                    {selectedFile ? 'Dokumen Berhasil Dipilih' : 'Upload Hasil Template yang Sudah Diisi'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedFile ? 'File siap dikirim bersama pengajuan.' : 'Setelah download dan edit template, upload file Word-nya di sini'}
                  </p>
                  <span className={`inline-flex mt-3 px-3 py-1 rounded-lg text-xs font-semibold ${selectedFile ? 'bg-green-600 text-white' : 'bg-[#1E376C] text-white'}`}>
                    {selectedFile ? 'Ganti File' : 'Pilih File Word'}
                  </span>
                  <p className="text-[11px] text-gray-500 mt-2">Format: .doc, .docx</p>
                  <p className="text-[11px] text-gray-500">Ukuran maksimal 10 MB</p>
                  {selectedFile && (
                    <div className="mt-3 space-y-1">
                      <div className="inline-flex items-center rounded-lg border border-green-200 bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700">
                        File dipilih: {selectedFile.name}
                      </div>
                      <p className="text-[11px] text-green-700">
                        Ukuran file: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  )}
                </label>

                {errors.templateDownload && <p className="text-xs text-red-600 mt-1.5">{errors.templateDownload}</p>}
                {errors.fileDokumen && <p className="text-xs text-red-600 mt-1.5">{errors.fileDokumen}</p>}
              </div>
            </div>
          )}

          <div>
            <label className="block text-lg leading-none font-semibold text-gray-900 mb-4">Ruang Lingkup Kerjasama *</label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-y-3 gap-x-5">
              {ruangLingkupOptions.map((option) => (
                <label key={option} className="inline-flex items-start gap-2 text-sm leading-tight text-gray-700">
                  <input
                    type="checkbox"
                    checked={formData.ruangLingkup.includes(option)}
                    onChange={() => handleRuangLingkupChange(option)}
                    className="mt-1 accent-[#1E376C] h-4 w-4"
                  />
                  <span className="max-w-[120px]">{option}</span>
                </label>
              ))}
            </div>
            {errors.ruangLingkup && <p className="text-xs text-red-600 mt-1.5">{errors.ruangLingkup}</p>}
          </div>

          <div>
            <label className="block text-lg leading-none font-semibold text-gray-900 mb-3">Deskripsi & Tujuan Kerjasama</label>
            <textarea
              rows={4}
              placeholder="Jelaskan tujuan dan manfaat kerjasama..."
              value={formData.deskripsi}
              onChange={(e) => handleInputChange('deskripsi', e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-700 outline-none focus:border-[#1E376C]"
            />
            {errors.deskripsi && <p className="text-xs text-red-600 mt-1.5">{errors.deskripsi}</p>}
          </div>
        </section>

        <section className="pt-5 border-t border-gray-300 -mx-7 px-7 space-y-5">
          <h2 className="text-3xl leading-none font-bold text-gray-900">Kontak Pengusul</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <label className="block text-lg leading-none font-semibold text-gray-900 mb-3">Email Pengusul</label>
              <input
                type="email"
                placeholder="email@mitra.com"
                value={formData.emailPengusul}
                onChange={(e) => handleInputChange('emailPengusul', e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 h-11 text-base text-gray-700 outline-none focus:border-[#1E376C]"
              />
              {errors.emailPengusul && <p className="text-xs text-red-600 mt-1.5">{errors.emailPengusul}</p>}
              <p className="text-xs text-gray-400 mt-2">Email untuk notifikasi status pengajuan</p>
            </div>
            <div>
              <label className="block text-lg leading-none font-semibold text-gray-900 mb-3">Whatsapp Pengusul</label>
              <input
                type="text"
                placeholder="+628 ..."
                value={formData.whatsappPengusul}
                onChange={(e) => handleInputChange('whatsappPengusul', e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 h-11 text-base text-gray-700 outline-none focus:border-[#1E376C]"
              />
              {errors.whatsappPengusul && <p className="text-xs text-red-600 mt-1.5">{errors.whatsappPengusul}</p>}
              <p className="text-xs text-gray-400 mt-2">Nomor Whatsapp aktif untuk komunikasi</p>
            </div>
          </div>
        </section>

        <div className="pt-1 flex items-center gap-3">
          <button
            type="submit"
            className="btn-primary h-11 w-[190px] text-lg leading-none font-semibold"
          >
            Submit Pengajuan
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="btn-secondary h-11 w-[100px] text-lg leading-none font-semibold inline-flex items-center justify-center"
          >
            Batal
          </button>
        </div>
      </form>

      {dialog && (
        <div className="fixed inset-0 z-[80] bg-black/55 backdrop-blur-[2px] p-4 flex items-center justify-center">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="px-5 py-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">{dialog.title}</h3>
            </div>
            <div className="px-5 py-4">
              <p className="text-sm text-slate-700 leading-relaxed">{dialog.message}</p>
            </div>
            <div className="px-5 py-4 border-t border-slate-200 flex justify-end gap-2">
              {dialog.cancelLabel && (
                <button
                  type="button"
                  onClick={() => setDialog(null)}
                  className="h-9 px-4 rounded-lg bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200"
                >
                  {dialog.cancelLabel}
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  const onConfirm = dialog.onConfirm;
                  setDialog(null);
                  onConfirm?.();
                }}
                className="h-9 px-4 rounded-lg bg-[#1E376C] text-white text-sm font-semibold hover:bg-[#2A4A8F]"
              >
                {dialog.confirmLabel || 'OK'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
