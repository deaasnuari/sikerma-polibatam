'use client';

import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { rekapJurusanOptions, rekapUnitOptions, type DokumenData } from '@/services/adminRekapDataService';

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
  const pilihanUnit = useMemo(
    () => (formData.asalKategori === 'Jurusan' ? ['Pilih Jurusan', ...rekapJurusanOptions] : ['Pilih Unit', ...rekapUnitOptions]),
    [formData.asalKategori]
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setFormData(initialData ?? emptyFormData);
  }, [initialData, isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Partial<Record<keyof DokumenData, string>> = {};
    if (!formData.nomorDokumen.trim()) newErrors.nomorDokumen = 'Nomor dokumen wajib diisi';
    if (!formData.jenisDokumen || formData.jenisDokumen === 'Pilih Jenis') newErrors.jenisDokumen = 'Jenis dokumen wajib dipilih';
    if (!formData.namaPIC.trim()) newErrors.namaPIC = 'Nama PIC wajib diisi';
    if (!formData.kategoriMitra || formData.kategoriMitra === 'Pilih Kategori') newErrors.kategoriMitra = 'Kategori mitra wajib dipilih';
    if (!formData.namaMitra.trim()) newErrors.namaMitra = 'Nama mitra wajib diisi';
    if (!formData.unitKerja || formData.unitKerja === 'Pilih Jurusan' || formData.unitKerja === 'Pilih Unit') newErrors.unitKerja = `${formData.asalKategori} wajib dipilih`;
    if (!formData.status) newErrors.status = 'Status wajib dipilih';
    if (!formData.tanggalMulai) newErrors.tanggalMulai = 'Tanggal mulai wajib diisi';
    if (!formData.tanggalBerakhir) newErrors.tanggalBerakhir = 'Tanggal berakhir wajib diisi';
    if (!formData.alamatMitra.trim()) newErrors.alamatMitra = 'Alamat mitra wajib diisi';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    if (onSubmit) {
      onSubmit(formData);
    }
    setFormData(emptyFormData);
    onClose();
  };

  const handleInputChange = (field: keyof DokumenData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/35 px-4 py-8 backdrop-blur-[2px]">
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[24px] bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-5">
          <h2 className="text-[20px] font-bold text-[#1E376C]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label="Tutup modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 pt-5">
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
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

          <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary inline-flex h-11 items-center justify-center px-8 text-sm font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn-primary inline-flex h-11 items-center justify-center px-8 text-sm font-semibold"
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