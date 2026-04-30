'use client';

import { useEffect, useMemo, useState } from 'react';
import { Download, FileText, Upload, X } from 'lucide-react';
import { rekapJurusanOptions, rekapUnitOptions, type DokumenData } from '@/services/adminRekapDataService';
import { validateSelectedFile } from '@/lib/fileUploadUtils';

interface TambahDokumenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: DokumenData) => void;
  initialData?: DokumenData | null;
  title?: string;
  submitLabel?: string;
}

const jenisOptions = ['Pilih Jenis', 'MoU', 'MoA', 'IA'];
const kategoriOptions = ['Pilih Kategori', 'Perusahaan', 'Instansi Pemerintah', 'Universitas', 'Organisasi'];
const statusOptions = ['Aktif', 'Akan Berakhir', 'Kadaluarsa'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

type TemplateKey = 'MoU' | 'MoA' | 'IA';

type TemplateDokumenConfig = {
  title: string;
  subtitle: string;
  struktur: string[];
  note: string;
  fileName: string;
  downloadUrl: string;
};

const defaultTemplateDokumenMap: Record<TemplateKey, TemplateDokumenConfig> = {
  MoU: {
    title: 'Memorandum of Understanding (MoU)',
    subtitle: 'Template untuk kesepahaman awal kerjasama',
    struktur: ['Pembukaan', 'Para Pihak', 'Latar Belakang', 'Tujuan Kerjasama', 'Ruang Lingkup', 'Jangka Waktu', 'Penutup'],
    note: 'Template bersifat opsional. Kamu bisa langsung upload dokumen PDF tanpa download template.',
    fileName: 'Draft MOU Industri.docx',
    downloadUrl: '/templates/Draft%20MOU%20Industri.docx',
  },
  MoA: {
    title: 'Memorandum of Agreement (MoA)',
    subtitle: 'Template untuk perjanjian teknis pelaksanaan kerjasama',
    struktur: ['Pembukaan', 'Dasar Pelaksanaan', 'Hak dan Kewajiban', 'Program Magang', 'Pendanaan', 'Monitoring dan Evaluasi', 'Penutup'],
    note: 'Template bersifat opsional. Kamu bisa langsung upload dokumen PDF tanpa download template.',
    fileName: 'Draft MOA Magang.docx',
    downloadUrl: '/templates/Draft%20MOA%20Magang.docx',
  },
  IA: {
    title: 'Implementation Arrangement (IA)',
    subtitle: 'Template untuk rincian implementasi program/kegiatan',
    struktur: ['Informasi Program', 'Target dan Indikator', 'Peran Tim Pelaksana', 'Timeline', 'Output', 'Pelaporan', 'Penutup'],
    note: 'Template bersifat opsional. Kamu bisa langsung upload dokumen PDF tanpa download template.',
    fileName: 'DRAFT IA POLIBATAM.docx',
    downloadUrl: '/templates/DRAFT%20IA%20POLIBATAM.docx',
  },
};

const emptyFormData: DokumenData = {
  nomorDokumen: '',
  jenisDokumen: '',
  namaPIC: '',
  kategoriMitra: '',
  namaMitra: '',
  status: '',
  jabatanMitra: '',
  emailMitra: '',
  tanggalMulai: '',
  tanggalBerakhir: '',
  alamatMitra: '',
  whatsappMitra: '',
  asalKategori: 'Jurusan',
  unitKerja: '',
};

export default function TambahDokumenModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  title = '+ Tambah Dokumen Baru',
  submitLabel = 'Tambah Dokumen',
}: TambahDokumenModalProps) {
  const [formData, setFormData] = useState<DokumenData>(emptyFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof DokumenData, string>>>({});
  const [uploadErrors, setUploadErrors] = useState<{ fileDokumen?: string }>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const pilihanUnit = useMemo(
    () => (formData.asalKategori === 'Jurusan' ? ['Pilih Jurusan', ...rekapJurusanOptions] : ['Pilih Unit', ...rekapUnitOptions]),
    [formData.asalKategori]
  );
  const selectedTemplate = formData.jenisDokumen && formData.jenisDokumen in defaultTemplateDokumenMap
    ? defaultTemplateDokumenMap[formData.jenisDokumen as TemplateKey]
    : null;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setFormData(initialData ?? emptyFormData);
    setErrors({});
    setUploadErrors({});
    setSelectedFile(null);
  }, [initialData, isOpen]);

  if (!isOpen) {
    return null;
  }


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Partial<Record<keyof DokumenData, string>> = {};
    if (!formData.jenisDokumen || formData.jenisDokumen === 'Pilih Jenis') newErrors.jenisDokumen = 'Jenis dokumen wajib dipilih';
    if (!formData.namaPIC.trim()) newErrors.namaPIC = 'Nama PIC wajib diisi';
    if (!formData.kategoriMitra || formData.kategoriMitra === 'Pilih Kategori') newErrors.kategoriMitra = 'Kategori mitra wajib dipilih';
    if (!formData.namaMitra.trim()) newErrors.namaMitra = 'Nama mitra wajib diisi';
    if (!formData.unitKerja || formData.unitKerja === 'Pilih Jurusan' || formData.unitKerja === 'Pilih Unit') newErrors.unitKerja = `${formData.asalKategori} wajib dipilih`;
    if (!formData.status) newErrors.status = 'Status wajib dipilih';
    if (!formData.tanggalMulai) newErrors.tanggalMulai = 'Tanggal mulai wajib diisi';
    if (!formData.tanggalBerakhir) newErrors.tanggalBerakhir = 'Tanggal berakhir wajib diisi';
    if (!formData.alamatMitra.trim()) newErrors.alamatMitra = 'Alamat mitra wajib diisi';

    const nextUploadErrors: { fileDokumen?: string } = {};
    if (formData.jenisDokumen && !selectedFile) {
      nextUploadErrors.fileDokumen = 'Upload dokumen wajib diisi';
    }

    if (Object.keys(newErrors).length > 0 || Object.keys(nextUploadErrors).length > 0) {
      setErrors(newErrors);
      setUploadErrors(nextUploadErrors);
      return;
    }

    // Ambil data rekap yang sudah ada
    let allData = [];
    try {
      allData = JSON.parse(window.localStorage.getItem('adminRekapDokumenData') || '[]');
    } catch {}
    const lastId = allData.length > 0 ? Math.max(...allData.map((d: any) => d.id ?? 0)) : 0;
    const nextId = lastId + 1;

    // Generate nomor dokumen otomatis
    let nomorDokumen = '';
    try {
      // Import generateNoDokumen secara dinamis
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { generateNoDokumen } = require('@/services/adminMonitoringService');
      nomorDokumen = generateNoDokumen({
        urutan: nextId,
        jenis: formData.jenisDokumen,
        tanggal: formData.tanggalMulai,
      });
    } catch {
      nomorDokumen = nextId.toString().padStart(2, '0');
    }

    setErrors({});
    setUploadErrors({});

    // Siapkan dokumenTerkait jika ada file
    let dokumenTerkait = undefined;
    if (selectedFile) {
      dokumenTerkait = [
        {
          nama: selectedFile.name,
          url: URL.createObjectURL(selectedFile),
          ukuran: `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`,
          tanggal: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
        },
      ];
    }

    if (onSubmit) {
      onSubmit({ ...formData, nomorDokumen, dokumenTerkait });
    }
    setFormData(emptyFormData);
    setSelectedFile(null);
    onClose();
  };

  const handleInputChange = (field: keyof DokumenData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }

    if (field === 'jenisDokumen') {
      setSelectedFile(null);
      setUploadErrors({});
    }
  };

  const handleDownloadTemplate = () => {
    if (!selectedTemplate) {
      return;
    }

    const link = document.createElement('a');
    link.href = selectedTemplate.downloadUrl;
    link.download = selectedTemplate.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (file: File | null) => {
    if (!file) {
      setSelectedFile(null);
      setUploadErrors((prev) => ({ ...prev, fileDokumen: undefined }));
      return;
    }

    const validationError = validateSelectedFile(file, {
      maxSizeBytes: MAX_FILE_SIZE,
      accept: ['.pdf'],
    });

    if (validationError) {
      setSelectedFile(null);
      setUploadErrors((prev) => ({ ...prev, fileDokumen: validationError }));
      return;
    }

    setSelectedFile(file);
    setUploadErrors((prev) => ({ ...prev, fileDokumen: undefined }));
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-slate-900/35 px-2 py-3 backdrop-blur-[2px] sm:items-center sm:px-4 sm:py-8">
      <div className="relative max-h-[96vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-[24px]">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-4 sm:px-6 sm:py-5">
          <h2 className="text-lg font-bold text-[#1E376C] sm:text-[20px]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label="Tutup modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-4 pb-5 pt-4 sm:px-6 sm:pb-6 sm:pt-5">
          <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:gap-y-5 md:grid-cols-2">
            <Field label="Nomor Dokumen *" error={errors.nomorDokumen}>
              <TextInput
                placeholder="Contoh: 001/MoU/2026"
                value={formData.nomorDokumen}
                onChange={(e) => handleInputChange('nomorDokumen', e.target.value)}
                hasError={!!errors.nomorDokumen}
              />
            </Field>

            <Field label="Jenis Dokumen *" error={errors.jenisDokumen}>
              <SelectInput
                options={jenisOptions}
                value={formData.jenisDokumen}
                onChange={(e) => handleInputChange('jenisDokumen', e.target.value)}
                hasError={!!errors.jenisDokumen}
              />
            </Field>

            {selectedTemplate && (
              <div className="space-y-4 rounded-2xl border border-[#D7E0F0] bg-[#F8FAFF] p-3 sm:p-5 md:col-span-2">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 sm:text-xl">Template Dokumen</h3>
                  <p className="mt-1 text-xs text-gray-600 sm:text-sm">Template opsional. Kamu bisa download sebagai referensi atau langsung upload dokumen PDF.</p>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:gap-3 md:grid-cols-3">
                  <div className="rounded-xl border border-[#D7E0F0] bg-white px-4 py-3">
                    <div className="mb-1.5 flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1E376C] text-xs font-bold text-white">1</span>
                      <p className="text-sm font-semibold text-gray-900">Opsional: Download Template</p>
                    </div>
                    <p className="text-xs text-gray-600">Unduh file sesuai jenis dokumen bila diperlukan.</p>
                  </div>
                  <div className="rounded-xl border border-[#D7E0F0] bg-white px-4 py-3">
                    <div className="mb-1.5 flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1E376C] text-xs font-bold text-white">2</span>
                      <p className="text-sm font-semibold text-gray-900">Siapkan Dokumen</p>
                    </div>
                    <p className="text-xs text-gray-600">Siapkan dokumen final dalam format PDF.</p>
                  </div>
                  <div className="rounded-xl border border-[#D7E0F0] bg-white px-4 py-3">
                    <div className="mb-1.5 flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1E376C] text-xs font-bold text-white">3</span>
                      <p className="text-sm font-semibold text-gray-900">Upload PDF</p>
                    </div>
                    <p className="text-xs text-gray-600">Upload dokumen langsung tanpa wajib download template.</p>
                  </div>
                </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-base font-bold text-[#173B82] sm:text-xl">{selectedTemplate.title}</p>
                      <p className="text-xs text-gray-600 sm:text-sm">{selectedTemplate.subtitle}</p>
                      <div className="mt-2 inline-flex items-center gap-2 rounded-lg border border-[#C9D8F5] bg-[#EEF4FF] px-3 py-1.5">
                        <FileText size={14} className="text-[#173B82]" />
                        <span className="text-xs font-bold text-[#0F2F6B]">{selectedTemplate.fileName}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleDownloadTemplate}
                      className="btn-primary inline-flex h-10 w-full items-center justify-center gap-2 px-4 text-sm font-semibold shadow-sm sm:h-11 sm:w-auto"
                    >
                      <Download size={16} />
                      Download Template
                    </button>
                  </div>

                  <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="mb-2 text-sm font-semibold text-[#173B82]">Isi utama dokumen:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedTemplate.struktur.map((item) => (
                        <span key={item} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-gray-700">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-[#173B82]">Catatan: {selectedTemplate.note}</p>
                </div>

                <div>
                  <label className="mb-3 block text-base font-semibold leading-none text-gray-900 sm:text-lg">Upload Dokumen *</label>
                  <p className="mb-2 rounded-lg border border-[#D7E0F0] bg-[#EEF3FF] px-3 py-2 text-xs text-[#1E376C]">
                    Upload dokumen langsung di sini. Download template tidak wajib.
                  </p>

                  <label
                    className={`block w-full rounded-2xl border-2 border-dashed p-4 text-center transition-all sm:p-5 ${
                      selectedFile
                        ? 'cursor-pointer border-green-400 bg-green-50 shadow-sm'
                        : 'cursor-pointer border-[#BFD0EE] bg-[#F5F8FF]'
                    }`}
                  >
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <Upload className={`mx-auto ${selectedFile ? 'text-green-600' : 'text-[#1E376C]'}`} size={22} />
                    <p className={`mt-2 text-base font-semibold ${selectedFile ? 'text-green-700' : 'text-[#1E376C]'}`}>
                      {selectedFile ? 'Dokumen Berhasil Dipilih' : 'Upload Dokumen PDF'}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {selectedFile ? 'File siap dikirim bersama data dokumen.' : 'Upload file PDF dokumen kerjasama di sini'}
                    </p>
                    <span className={`mt-3 inline-flex rounded-lg px-3 py-1 text-xs font-semibold ${selectedFile ? 'bg-green-600 text-white' : 'bg-[#1E376C] text-white'}`}>
                      {selectedFile ? 'Ganti File' : 'Pilih File PDF'}
                    </span>
                    <p className="mt-2 text-[11px] text-gray-500">Format: .pdf</p>
                    <p className="text-[11px] text-gray-500">Ukuran maksimal 10 MB</p>
                    {selectedFile && (
                      <div className="mt-3 space-y-1">
                        <div className="inline-flex items-center rounded-lg border border-green-200 bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700">
                          File dipilih: {selectedFile.name}
                        </div>
                        <p className="text-[11px] text-green-700">Ukuran file: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                    )}
                  </label>

                  {uploadErrors.fileDokumen && <p className="mt-1 text-xs text-red-500">{uploadErrors.fileDokumen}</p>}
                </div>
              </div>
            )}

            <Field label="Nama PIC *" error={errors.namaPIC}>
              <TextInput
                placeholder="Nama PIC"
                value={formData.namaPIC}
                onChange={(e) => handleInputChange('namaPIC', e.target.value)}
                hasError={!!errors.namaPIC}
              />
            </Field>

            <Field label="Kategori Mitra *" error={errors.kategoriMitra}>
              <SelectInput
                options={kategoriOptions}
                value={formData.kategoriMitra}
                onChange={(e) => handleInputChange('kategoriMitra', e.target.value)}
                hasError={!!errors.kategoriMitra}
              />
            </Field>

            <Field label="Nama Mitra *" error={errors.namaMitra}>
              <TextInput
                placeholder="Nama Perusahaan/Institusi"
                value={formData.namaMitra}
                onChange={(e) => handleInputChange('namaMitra', e.target.value)}
                hasError={!!errors.namaMitra}
              />
            </Field>

            <Field label="Status *" error={errors.status}>
              <SelectInput
                options={statusOptions}
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                hasError={!!errors.status}
              />
            </Field>

            <Field label="Kategori Asal *">
              <div className="flex flex-wrap gap-3 rounded-xl border border-gray-200 bg-slate-50 p-2">
                {(['Jurusan', 'Unit'] as const).map((item) => {
                  const isActive = formData.asalKategori === item;

                  return (
                    <label
                      key={item}
                      className={`flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        isActive ? 'bg-[#1E376C] text-white shadow-sm' : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <input
                        type="radio"
                        name="asalKategori"
                        value={item}
                        checked={isActive}
                        onChange={() => {
                          handleInputChange('asalKategori', item);
                          handleInputChange('unitKerja', '');
                        }}
                        className="sr-only"
                      />
                      {item}
                    </label>
                  );
                })}
              </div>
            </Field>

            <Field label={`Pilih ${formData.asalKategori} *`} error={errors.unitKerja}>
              <SelectInput
                options={pilihanUnit}
                value={formData.unitKerja}
                onChange={(e) => handleInputChange('unitKerja', e.target.value)}
                hasError={!!errors.unitKerja}
              />
            </Field>

            <Field label="Jabatan Mitra">
              <TextInput
                placeholder="jabatan"
                value={formData.jabatanMitra}
                onChange={(e) => handleInputChange('jabatanMitra', e.target.value)}
              />
            </Field>

            <Field label="Email Mitra">
              <TextInput
                placeholder="email@mitra.com"
                type="email"
                value={formData.emailMitra}
                onChange={(e) => handleInputChange('emailMitra', e.target.value)}
              />
            </Field>

            <Field label="Tanggal Mulai *" error={errors.tanggalMulai}>
              <DateInput
                placeholder="mm/dd/yy"
                value={formData.tanggalMulai}
                onChange={(e) => handleInputChange('tanggalMulai', e.target.value)}
                hasError={!!errors.tanggalMulai}
              />
            </Field>

            <Field label="Tanggal Berakhir *" error={errors.tanggalBerakhir}>
              <DateInput
                placeholder="mm/dd/yy"
                value={formData.tanggalBerakhir}
                onChange={(e) => handleInputChange('tanggalBerakhir', e.target.value)}
                hasError={!!errors.tanggalBerakhir}
              />
            </Field>

            <Field label="Alamat Mitra *" error={errors.alamatMitra}>
              <TextInput
                placeholder="Alamat Lengkap Mitra"
                value={formData.alamatMitra}
                onChange={(e) => handleInputChange('alamatMitra', e.target.value)}
                hasError={!!errors.alamatMitra}
              />
            </Field>

            <Field label="Whatsapp Mitra">
              <TextInput
                placeholder="+628 ..."
                type="tel"
                value={formData.whatsappMitra}
                onChange={(e) => handleInputChange('whatsappMitra', e.target.value)}
              />
            </Field>
          </div>

          <div className="mt-8 flex flex-col-reverse gap-2 sm:mt-10 sm:flex-row sm:justify-end sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary inline-flex h-11 w-full items-center justify-center px-8 text-sm font-semibold sm:w-auto"
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn-primary inline-flex h-11 w-full items-center justify-center px-8 text-sm font-semibold sm:w-auto"
            >
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-gray-900">{label}</span>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </label>
  );
}

function TextInput({ placeholder, type = 'text', value, onChange, hasError }: { placeholder: string; type?: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; hasError?: boolean }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`input-field h-11 w-full px-4 text-sm text-gray-700 placeholder:text-gray-400 ${hasError ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : ''}`}
    />
  );
}

function SelectInput({ options, value, onChange, hasError }: { options: string[]; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; hasError?: boolean }) {
  return (
    <select value={value} onChange={onChange} className={`input-field h-11 w-full bg-white px-4 text-sm text-gray-700 ${hasError ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : ''}`}>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

function DateInput({ placeholder, value, onChange, hasError }: { placeholder: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; hasError?: boolean }) {
  return (
    <input
      type="date"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`input-field h-11 w-full px-4 text-sm text-gray-700 [color-scheme:light] [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:text-[#173B82] [&::-webkit-calendar-picker-indicator]:opacity-70 [&::-webkit-calendar-picker-indicator]:hover:opacity-100 ${hasError ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : ''}`}
    />
  );
}