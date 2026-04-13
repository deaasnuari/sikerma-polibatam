'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface DokumenData {
  nomorDokumen: string;
  jenisDokumen: string;
  namaPIC: string;
  kategoriMitra: string;
  namaMitra: string;
  status: string;
  jabatanMitra: string;
  emailMitra: string;
  tanggalMulai: string;
  tanggalBerakhir: string;
  alamatMitra: string;
  whatsappMitra: string;
}

interface TambahDokumenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: DokumenData) => void;
}

const jenisOptions = ['Pilih Jenis', 'MoU', 'MoA', 'IA'];
const kategoriOptions = ['Pilih Kategori', 'Perusahaan', 'Instansi Pemerintah', 'Universitas', 'Organisasi'];
const statusOptions = ['Aktif', 'Akan Berakhir', 'Kadaluarsa'];

export default function TambahDokumenModal({ isOpen, onClose, onSubmit }: TambahDokumenModalProps) {
  const [formData, setFormData] = useState<DokumenData>({
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
  });

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(formData);
    }
    setFormData({
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
    });
    onClose();
  };

  const handleInputChange = (field: keyof DokumenData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/35 px-4 py-8 backdrop-blur-[2px]">
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[24px] bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-5">
          <h2 className="text-[20px] font-bold text-[#1E376C]">+ Tambah Dokumen Baru</h2>
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
              className="inline-flex h-11 items-center justify-center rounded-xl border border-gray-300 px-8 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-[#1E376C] px-8 text-sm font-semibold text-white transition-colors hover:bg-[#294887]"
            >
              Tambah Dokumen
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
      className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm text-gray-700 outline-none transition-colors placeholder:text-gray-400 focus:border-[#1E376C]"
    />
  );
}

function SelectInput({ options, value, onChange }: { options: string[]; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void }) {
  return (
    <select value={value} onChange={onChange} className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-700 outline-none transition-colors focus:border-[#1E376C]">
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
      className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm text-gray-700 outline-none transition-colors [color-scheme:light] focus:border-[#1E376C] [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:text-[#1E376C] [&::-webkit-calendar-picker-indicator]:opacity-70 [&::-webkit-calendar-picker-indicator]:hover:opacity-100"
    />
  );
}