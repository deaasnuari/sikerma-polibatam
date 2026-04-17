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
    if (onSubmit) {
      onSubmit(formData);
    }
    setFormData(emptyFormData);
    onClose();
  };

  const handleInputChange = (field: keyof DokumenData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
            <Field label="Nomor Dokumen *">
              <TextInput
                placeholder="Contoh: 001/MoU/2026"
                value={formData.nomorDokumen}
                onChange={(e) => handleInputChange('nomorDokumen', e.target.value)}
              />
            </Field>

            <Field label="Jenis Dokumen *">
              <SelectInput
                options={jenisOptions}
                value={formData.jenisDokumen}
                onChange={(e) => handleInputChange('jenisDokumen', e.target.value)}
              />
            </Field>

            <Field label="Nama PIC *">
              <TextInput
                placeholder="Nama PIC"
                value={formData.namaPIC}
                onChange={(e) => handleInputChange('namaPIC', e.target.value)}
              />
            </Field>

            <Field label="Kategori Mitra *">
              <SelectInput
                options={kategoriOptions}
                value={formData.kategoriMitra}
                onChange={(e) => handleInputChange('kategoriMitra', e.target.value)}
              />
            </Field>

            <Field label="Nama Mitra *">
              <TextInput
                placeholder="Nama Perusahaan/Institusi"
                value={formData.namaMitra}
                onChange={(e) => handleInputChange('namaMitra', e.target.value)}
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

            <Field label={`Pilih ${formData.asalKategori} *`}>
              <SelectInput
                options={pilihanUnit}
                value={formData.unitKerja}
                onChange={(e) => handleInputChange('unitKerja', e.target.value)}
              />
            </Field>

            <Field label="Status *">
              <SelectInput
                options={statusOptions}
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
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

            <Field label="Tanggal Mulai *">
              <DateInput
                placeholder="mm/dd/yy"
                value={formData.tanggalMulai}
                onChange={(e) => handleInputChange('tanggalMulai', e.target.value)}
              />
            </Field>

            <Field label="Tanggal Berakhir *">
              <DateInput
                placeholder="mm/dd/yy"
                value={formData.tanggalBerakhir}
                onChange={(e) => handleInputChange('tanggalBerakhir', e.target.value)}
              />
            </Field>

            <Field label="Alamat Mitra *">
              <TextInput
                placeholder="Alamat Lengkap Mitra"
                value={formData.alamatMitra}
                onChange={(e) => handleInputChange('alamatMitra', e.target.value)}
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-gray-900">{label}</span>
      {children}
    </label>
  );
}

function TextInput({ placeholder, type = 'text', value, onChange }: { placeholder: string; type?: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="input-field h-11 w-full px-4 text-sm text-gray-700 placeholder:text-gray-400"
    />
  );
}

function SelectInput({ options, value, onChange }: { options: string[]; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void }) {
  return (
    <select value={value} onChange={onChange} className="input-field h-11 w-full bg-white px-4 text-sm text-gray-700">
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

function DateInput({ placeholder, value, onChange }: { placeholder: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <input
      type="date"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="input-field h-11 w-full px-4 text-sm text-gray-700 [color-scheme:light] [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:text-[#173B82] [&::-webkit-calendar-picker-indicator]:opacity-70 [&::-webkit-calendar-picker-indicator]:hover:opacity-100"
    />
  );
}