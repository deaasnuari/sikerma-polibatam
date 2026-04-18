'use client';

import { useState } from 'react';
import { Calendar, Plus, Upload, X } from 'lucide-react';

const jenisMitraOptions = ['Pilih jenis mitra', 'Perusahaan Swasta', 'BUMN', 'Instansi Pemerintah', 'Lembaga Pendidikan', 'Organisasi Non-Profit', 'Lembaga Internasional'];
const jenisKerjasamaOptions = ['Pilih jenis kerjasama (MOA/MOU/IA)', 'MoA', 'MoU', 'IA'];
const unitPelaksanaOptions = ['Pilih unit pelaksana', 'Teknik Informatika', 'Teknik Elektro', 'Teknik Mesin', 'Manajemen Bisnis'];

export default function PengajuanBaruEksternalPage() {
  const [namaMitra, setNamaMitra] = useState('');
  const [jenisMitra, setJenisMitra] = useState('');
  const [teleponMitra, setTeleponMitra] = useState('');
  const [emailMitra, setEmailMitra] = useState('');
  const [alamatLengkap, setAlamatLengkap] = useState('');

  const [jenisKerjasama, setJenisKerjasama] = useState('');
  const [unitPelaksana, setUnitPelaksana] = useState('');
  const [tanggalMulai, setTanggalMulai] = useState('');
  const [tanggalBerakhir, setTanggalBerakhir] = useState('');
  const [judulKerjasama, setJudulKerjasama] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [ruangLingkup, setRuangLingkup] = useState('');

  const [kontakNama, setKontakNama] = useState('');
  const [kontakJabatan, setKontakJabatan] = useState('');
  const [kontakEmail, setKontakEmail] = useState('');
  const [kontakTelepon, setKontakTelepon] = useState('');

  const [dokumen, setDokumen] = useState<File[]>([]);

  function handleAddDokumen() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setDokumen((prev) => [...prev, file]);
      }
    };
    input.click();
  }

  function handleRemoveDokumen(index: number) {
    setDokumen((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit() {
    if (!namaMitra.trim()) { alert('Nama Mitra wajib diisi.'); return; }
    if (!jenisMitra || jenisMitra === 'Pilih jenis mitra') { alert('Jenis Mitra wajib dipilih.'); return; }
    if (!teleponMitra.trim()) { alert('Telepon wajib diisi.'); return; }
    if (!emailMitra.trim()) { alert('Email Mitra wajib diisi.'); return; }
    if (!alamatLengkap.trim()) { alert('Alamat Lengkap wajib diisi.'); return; }
    if (!jenisKerjasama || jenisKerjasama.startsWith('Pilih')) { alert('Jenis Kerjasama wajib dipilih.'); return; }
    if (!unitPelaksana || unitPelaksana.startsWith('Pilih')) { alert('Unit Pelaksana wajib dipilih.'); return; }
    if (!tanggalMulai) { alert('Tanggal Mulai wajib diisi.'); return; }
    if (!tanggalBerakhir) { alert('Tanggal Berakhir wajib diisi.'); return; }
    if (!judulKerjasama.trim()) { alert('Judul Kerjasama wajib diisi.'); return; }
    if (!deskripsi.trim()) { alert('Deskripsi wajib diisi.'); return; }
    if (!kontakNama.trim()) { alert('Nama kontak person wajib diisi.'); return; }
    if (!kontakJabatan.trim()) { alert('Jabatan kontak person wajib diisi.'); return; }
    if (!kontakEmail.trim()) { alert('Email kontak person wajib diisi.'); return; }
    if (!kontakTelepon.trim()) { alert('Telepon kontak person wajib diisi.'); return; }

    alert('Pengajuan kerjasama berhasil dikirim! Silahkan tunggu verifikasi dari pihak Polibatam.');
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="page-title">Pengajuan Kerjasama Baru</h1>
        <p className="page-subtitle mt-1">Isi Formulir Untuk Mengajukan Kerjasama Baru</p>
      </div>

      {/* Section: Informasi Mitra */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
        <div>
          <h2 className="text-base font-bold text-gray-900">Informasi mitra</h2>
          <p className="text-xs text-gray-500">Data lengkap mitra kerjasama</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">
              Nama Mitra <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={namaMitra}
              onChange={(e) => setNamaMitra(e.target.value)}
              placeholder="PT. Nama Perusahaan"
              className="input-field h-10 w-full px-3 text-sm text-gray-700 placeholder:text-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">
              Jenis Mitra <span className="text-red-500">*</span>
            </label>
            <select
              value={jenisMitra}
              onChange={(e) => setJenisMitra(e.target.value)}
              className="input-field h-10 w-full px-3 text-sm text-gray-700"
            >
              {jenisMitraOptions.map((opt) => (
                <option key={opt} value={opt === 'Pilih jenis mitra' ? '' : opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">
              Telepon / WA Aktif <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={teleponMitra}
              onChange={(e) => setTeleponMitra(e.target.value)}
              placeholder="+62 812 3456 1738"
              className="input-field h-10 w-full px-3 text-sm text-gray-700 placeholder:text-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">
              Email Mitra <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={emailMitra}
              onChange={(e) => setEmailMitra(e.target.value)}
              placeholder="Masukkan alamat email"
              className="input-field h-10 w-full px-3 text-sm text-gray-700 placeholder:text-gray-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1.5">
            Alamat Lengkap <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={alamatLengkap}
            onChange={(e) => setAlamatLengkap(e.target.value)}
            placeholder="Masukkan alamat lengkap mitra"
            className="input-field h-10 w-full px-3 text-sm text-gray-700 placeholder:text-gray-400"
          />
        </div>
      </section>

      {/* Section: Detail Kerjasama */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
        <div>
          <h2 className="text-base font-bold text-gray-900">Detail Kerjasama</h2>
          <p className="text-xs text-gray-500">Informasi detail kerjasama yang akan diajukan</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">
              Jenis Kerjasama <span className="text-red-500">*</span>
            </label>
            <select
              value={jenisKerjasama}
              onChange={(e) => setJenisKerjasama(e.target.value)}
              className="input-field h-10 w-full px-3 text-sm text-gray-700"
            >
              {jenisKerjasamaOptions.map((opt) => (
                <option key={opt} value={opt.startsWith('Pilih') ? '' : opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">
              Unit Pelaksana <span className="text-red-500">*</span>
            </label>
            <select
              value={unitPelaksana}
              onChange={(e) => setUnitPelaksana(e.target.value)}
              className="input-field h-10 w-full px-3 text-sm text-gray-700"
            >
              {unitPelaksanaOptions.map((opt) => (
                <option key={opt} value={opt.startsWith('Pilih') ? '' : opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">
              Tanggal Mulai <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={tanggalMulai}
              onChange={(e) => setTanggalMulai(e.target.value)}
              className="input-field h-10 w-full px-3 text-sm text-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">
              Tanggal Berakhir <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={tanggalBerakhir}
              onChange={(e) => setTanggalBerakhir(e.target.value)}
              className="input-field h-10 w-full px-3 text-sm text-gray-700"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1.5">
            Judul Kerjasama <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={judulKerjasama}
            onChange={(e) => setJudulKerjasama(e.target.value)}
            placeholder="Judul atau nama kerjasama"
            className="input-field h-10 w-full px-3 text-sm text-gray-700 placeholder:text-gray-400"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1.5">
            Deskripsi <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={3}
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
            placeholder="Jelaskan detail kerjasama yang diharapkan"
            className="input-field w-full px-3 py-2 text-sm text-gray-700 resize-y placeholder:text-gray-400"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1.5">Ruang Lingkup</label>
          <input
            type="text"
            value={ruangLingkup}
            onChange={(e) => setRuangLingkup(e.target.value)}
            placeholder="Sebutkan ruang lingkup kerjasama"
            className="input-field h-10 w-full px-3 text-sm text-gray-700 placeholder:text-gray-400"
          />
        </div>
      </section>

      {/* Section: Kontak Person Mitra */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
        <div>
          <h2 className="text-base font-bold text-gray-900">Kontak Person Mitra</h2>
          <p className="text-xs text-gray-500">Informasi kontak person dari pihak mitra</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={kontakNama}
              onChange={(e) => setKontakNama(e.target.value)}
              placeholder="Nama kontak person"
              className="input-field h-10 w-full px-3 text-sm text-gray-700 placeholder:text-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">
              Jabatan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={kontakJabatan}
              onChange={(e) => setKontakJabatan(e.target.value)}
              placeholder="Jabatan di Perusahaan"
              className="input-field h-10 w-full px-3 text-sm text-gray-700 placeholder:text-gray-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={kontakEmail}
              onChange={(e) => setKontakEmail(e.target.value)}
              placeholder="email@example.com"
              className="input-field h-10 w-full px-3 text-sm text-gray-700 placeholder:text-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">
              Telepon / WA Aktif <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={kontakTelepon}
              onChange={(e) => setKontakTelepon(e.target.value)}
              placeholder="+62 824 67726 26"
              className="input-field h-10 w-full px-3 text-sm text-gray-700 placeholder:text-gray-400"
            />
          </div>
        </div>
      </section>

      {/* Section: Dokumen Pendukung */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
        <div>
          <h2 className="text-base font-bold text-gray-900">Dokumen Pendukung</h2>
          <p className="text-xs text-gray-500">Upload dokumen yang diperlukan</p>
        </div>

        {dokumen.length > 0 && (
          <div className="space-y-2">
            {dokumen.map((file, index) => (
              <div key={`${file.name}-${index}`} className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <Upload size={14} className="text-gray-400" />
                  <span className="text-sm text-gray-700">{file.name}</span>
                  <span className="text-xs text-gray-400">({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveDokumen(index)}
                  className="text-red-500 transition-colors hover:text-red-700"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={handleAddDokumen}
          className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 py-4 text-sm font-medium text-gray-500 transition-colors hover:border-gray-400 hover:text-gray-700"
        >
          <Plus size={16} />
          Tambah Dokumen
        </button>
      </section>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
        >
          Batal
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="btn-primary px-6 py-2.5 text-sm font-semibold"
        >
          Ajukan Kerjasama
        </button>
      </div>
    </div>
  );
}
