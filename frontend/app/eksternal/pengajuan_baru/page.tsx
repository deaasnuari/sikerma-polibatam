'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, Calendar, CheckCircle, Download, Plus, Send, Upload, X } from 'lucide-react';
import { compressImageFileIfNeeded, validateSelectedFile } from '@/lib/fileUploadUtils';
import { submitPengajuan } from '@/services/adminPengajuanService';

const jenisMitraOptions = ['Pilih jenis mitra', 'Perusahaan Swasta', 'BUMN', 'Instansi Pemerintah', 'Lembaga Pendidikan', 'Organisasi Non-Profit', 'Lembaga Internasional'];
const jenisKerjasamaOptions = ['Pilih jenis kerjasama (MOA/MOU/IA)', 'MoA', 'MoU', 'IA'];
const unitPelaksanaOptions = ['Pilih unit pelaksana', 'Teknik Informatika', 'Teknik Elektro', 'Teknik Mesin', 'Manajemen Bisnis'];

const EKSTERNAL_PENGAJUAN_DRAFT_KEY = 'eksternal-pengajuan-draft-v1';

type EksternalPengajuanDraft = {
  namaMitra: string;
  jenisMitra: string;
  teleponMitra: string;
  emailMitra: string;
  alamatLengkap: string;
  jenisKerjasama: string;
  unitPelaksana: string;
  tanggalMulai: string;
  tanggalBerakhir: string;
  judulKerjasama: string;
  deskripsi: string;
  ruangLingkup: string;
  kontakNama: string;
  kontakJabatan: string;
  kontakEmail: string;
  kontakTelepon: string;
};

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

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const storedRaw = window.localStorage.getItem(EKSTERNAL_PENGAJUAN_DRAFT_KEY);
      if (!storedRaw) {
        return;
      }

      const draft = JSON.parse(storedRaw) as Partial<EksternalPengajuanDraft>;

      setNamaMitra(draft.namaMitra ?? '');
      setJenisMitra(draft.jenisMitra ?? '');
      setTeleponMitra(draft.teleponMitra ?? '');
      setEmailMitra(draft.emailMitra ?? '');
      setAlamatLengkap(draft.alamatLengkap ?? '');
      setJenisKerjasama(draft.jenisKerjasama ?? '');
      setUnitPelaksana(draft.unitPelaksana ?? '');
      setTanggalMulai(draft.tanggalMulai ?? '');
      setTanggalBerakhir(draft.tanggalBerakhir ?? '');
      setJudulKerjasama(draft.judulKerjasama ?? '');
      setDeskripsi(draft.deskripsi ?? '');
      setRuangLingkup(draft.ruangLingkup ?? '');
      setKontakNama(draft.kontakNama ?? '');
      setKontakJabatan(draft.kontakJabatan ?? '');
      setKontakEmail(draft.kontakEmail ?? '');
      setKontakTelepon(draft.kontakTelepon ?? '');
    } catch {
      // Abaikan draft yang tidak valid.
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const draft: EksternalPengajuanDraft = {
      namaMitra,
      jenisMitra,
      teleponMitra,
      emailMitra,
      alamatLengkap,
      jenisKerjasama,
      unitPelaksana,
      tanggalMulai,
      tanggalBerakhir,
      judulKerjasama,
      deskripsi,
      ruangLingkup,
      kontakNama,
      kontakJabatan,
      kontakEmail,
      kontakTelepon,
    };

    window.localStorage.setItem(EKSTERNAL_PENGAJUAN_DRAFT_KEY, JSON.stringify(draft));
  }, [
    namaMitra,
    jenisMitra,
    teleponMitra,
    emailMitra,
    alamatLengkap,
    jenisKerjasama,
    unitPelaksana,
    tanggalMulai,
    tanggalBerakhir,
    judulKerjasama,
    deskripsi,
    ruangLingkup,
    kontakNama,
    kontakJabatan,
    kontakEmail,
    kontakTelepon,
  ]);

  function handleAddDokumen() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        return;
      }

      const validationError = validateSelectedFile(file, {
        accept: '.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png',
        maxSizeBytes: 10 * 1024 * 1024,
      });

      if (validationError) {
        alert(validationError);
        return;
      }

      const processedFile = await compressImageFileIfNeeded(file, {
        maxDimension: 1920,
        quality: 0.8,
        minBytesToCompress: 400 * 1024,
      });

      setDokumen((prev) => [...prev, processedFile]);
    };
    input.click();
  }

  function handleRemoveDokumen(index: number) {
    setDokumen((prev) => prev.filter((_, i) => i !== index));
  }

  function validateAndOpenModal() {
    const newErrors: Record<string, string> = {};
    if (!namaMitra.trim()) newErrors.namaMitra = 'Nama Mitra wajib diisi.';
    if (!jenisMitra) newErrors.jenisMitra = 'Jenis Mitra wajib dipilih.';
    if (!teleponMitra.trim()) newErrors.teleponMitra = 'Telepon wajib diisi.';
    if (!emailMitra.trim()) newErrors.emailMitra = 'Email Mitra wajib diisi.';
    if (!alamatLengkap.trim()) newErrors.alamatLengkap = 'Alamat Lengkap wajib diisi.';
    if (!jenisKerjasama) newErrors.jenisKerjasama = 'Jenis Kerjasama wajib dipilih.';
    if (!unitPelaksana) newErrors.unitPelaksana = 'Unit Pelaksana wajib dipilih.';
    if (!tanggalMulai) newErrors.tanggalMulai = 'Tanggal Mulai wajib diisi.';
    if (!tanggalBerakhir) newErrors.tanggalBerakhir = 'Tanggal Berakhir wajib diisi.';
    if (!judulKerjasama.trim()) newErrors.judulKerjasama = 'Judul Kerjasama wajib diisi.';
    if (!deskripsi.trim()) newErrors.deskripsi = 'Deskripsi wajib diisi.';
    if (!kontakNama.trim()) newErrors.kontakNama = 'Nama Lengkap wajib diisi.';
    if (!kontakJabatan.trim()) newErrors.kontakJabatan = 'Jabatan wajib diisi.';
    if (!kontakEmail.trim()) newErrors.kontakEmail = 'Email wajib diisi.';
    if (!kontakTelepon.trim()) newErrors.kontakTelepon = 'Telepon wajib diisi.';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      // Scroll ke error pertama
      const firstKey = Object.keys(newErrors)[0];
      document.getElementById(`field-${firstKey}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setShowConfirmModal(true);
  }

  function handleConfirmSubmit() {
    submitPengajuan({
      judul: judulKerjasama,
      pengusul: kontakNama,
      mitra: namaMitra,
      jenisDokumen: jenisKerjasama,
      jurusan: unitPelaksana,
      kategori: 'Eksternal',
      tanggalMulai,
      tanggalBerakhir,
      emailPengusul: kontakEmail,
      whatsappPengusul: kontakTelepon,
      alamatMitra: alamatLengkap,
      ruangLingkup: ruangLingkup
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      fileName: dokumen.map((f) => f.name).join(', ') || 'Dokumen pendukung eksternal',
    });

    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(EKSTERNAL_PENGAJUAN_DRAFT_KEY);
    }

    setShowConfirmModal(false);
    setShowSuccessModal(true);
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
          <div id="field-namaMitra">
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">
              Nama Mitra <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={namaMitra}
              onChange={(e) => { setNamaMitra(e.target.value); setErrors((p) => ({ ...p, namaMitra: '' })); }}
              placeholder="PT. Nama Perusahaan"
              className={`input-field h-10 w-full px-3 text-sm text-gray-700 placeholder:text-gray-400 ${errors.namaMitra ? 'border-red-400' : ''}`}
            />
            {errors.namaMitra && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={11} />{errors.namaMitra}</p>}
          </div>
          <div id="field-jenisMitra">
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">
              Jenis Mitra <span className="text-red-500">*</span>
            </label>
            <select
              value={jenisMitra}
              onChange={(e) => { setJenisMitra(e.target.value); setErrors((p) => ({ ...p, jenisMitra: '' })); }}
              className={`input-field h-10 w-full px-3 text-sm text-gray-700 ${errors.jenisMitra ? 'border-red-400' : ''}`}
            >
              {jenisMitraOptions.map((opt) => (
                <option key={opt} value={opt === 'Pilih jenis mitra' ? '' : opt}>{opt}</option>
              ))}
            </select>
            {errors.jenisMitra && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={11} />{errors.jenisMitra}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div id="field-teleponMitra">
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">
              Telepon / WA Aktif <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={teleponMitra}
              onChange={(e) => { setTeleponMitra(e.target.value); setErrors((p) => ({ ...p, teleponMitra: '' })); }}
              placeholder="+62 812 3456 1738"
              className={`input-field h-10 w-full px-3 text-sm text-gray-700 placeholder:text-gray-400 ${errors.teleponMitra ? 'border-red-400' : ''}`}
            />
            {errors.teleponMitra && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={11} />{errors.teleponMitra}</p>}
          </div>
          <div id="field-emailMitra">
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">
              Email Mitra <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={emailMitra}
              onChange={(e) => { setEmailMitra(e.target.value); setErrors((p) => ({ ...p, emailMitra: '' })); }}
              placeholder="Masukkan alamat email"
              className={`input-field h-10 w-full px-3 text-sm text-gray-700 placeholder:text-gray-400 ${errors.emailMitra ? 'border-red-400' : ''}`}
            />
            {errors.emailMitra && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={11} />{errors.emailMitra}</p>}
          </div>
        </div>

        <div id="field-alamatLengkap">
          <label className="block text-sm font-semibold text-gray-800 mb-1.5">
            Alamat Lengkap <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={alamatLengkap}
            onChange={(e) => { setAlamatLengkap(e.target.value); setErrors((p) => ({ ...p, alamatLengkap: '' })); }}
            placeholder="Masukkan alamat lengkap mitra"
            className={`input-field h-10 w-full px-3 text-sm text-gray-700 placeholder:text-gray-400 ${errors.alamatLengkap ? 'border-red-400' : ''}`}
          />
          {errors.alamatLengkap && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={11} />{errors.alamatLengkap}</p>}
        </div>
      </section>

      {/* Section: Detail Kerjasama */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
        <div>
          <h2 className="text-base font-bold text-gray-900">Detail Kerjasama</h2>
          <p className="text-xs text-gray-500">Informasi detail kerjasama yang akan diajukan</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div id="field-jenisKerjasama">
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">
              Jenis Kerjasama <span className="text-red-500">*</span>
            </label>
            <select
              value={jenisKerjasama}
              onChange={(e) => { setJenisKerjasama(e.target.value); setErrors((p) => ({ ...p, jenisKerjasama: '' })); }}
              className={`input-field h-10 w-full px-3 text-sm text-gray-700 ${errors.jenisKerjasama ? 'border-red-400' : ''}`}
            >
              {jenisKerjasamaOptions.map((opt) => (
                <option key={opt} value={opt.startsWith('Pilih') ? '' : opt}>{opt}</option>
              ))}
            </select>
            {errors.jenisKerjasama && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={11} />{errors.jenisKerjasama}</p>}
          </div>
          <div id="field-unitPelaksana">
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">
              Unit Pelaksana <span className="text-red-500">*</span>
            </label>
            <select
              value={unitPelaksana}
              onChange={(e) => { setUnitPelaksana(e.target.value); setErrors((p) => ({ ...p, unitPelaksana: '' })); }}
              className={`input-field h-10 w-full px-3 text-sm text-gray-700 ${errors.unitPelaksana ? 'border-red-400' : ''}`}
            >
              {unitPelaksanaOptions.map((opt) => (
                <option key={opt} value={opt.startsWith('Pilih') ? '' : opt}>{opt}</option>
              ))}
            </select>
            {errors.unitPelaksana && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={11} />{errors.unitPelaksana}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div id="field-tanggalMulai">
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">
              Tanggal Mulai <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={tanggalMulai}
              onChange={(e) => { setTanggalMulai(e.target.value); setErrors((p) => ({ ...p, tanggalMulai: '' })); }}
              className={`input-field h-10 w-full px-3 text-sm text-gray-700 ${errors.tanggalMulai ? 'border-red-400' : ''}`}
            />
            {errors.tanggalMulai && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={11} />{errors.tanggalMulai}</p>}
          </div>
          <div id="field-tanggalBerakhir">
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">
              Tanggal Berakhir <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={tanggalBerakhir}
              onChange={(e) => { setTanggalBerakhir(e.target.value); setErrors((p) => ({ ...p, tanggalBerakhir: '' })); }}
              className={`input-field h-10 w-full px-3 text-sm text-gray-700 ${errors.tanggalBerakhir ? 'border-red-400' : ''}`}
            />
            {errors.tanggalBerakhir && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={11} />{errors.tanggalBerakhir}</p>}
          </div>
        </div>

        <div id="field-judulKerjasama">
          <label className="block text-sm font-semibold text-gray-800 mb-1.5">
            Judul Kerjasama <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={judulKerjasama}
            onChange={(e) => { setJudulKerjasama(e.target.value); setErrors((p) => ({ ...p, judulKerjasama: '' })); }}
            placeholder="Judul atau nama kerjasama"
            className={`input-field h-10 w-full px-3 text-sm text-gray-700 placeholder:text-gray-400 ${errors.judulKerjasama ? 'border-red-400' : ''}`}
          />
          {errors.judulKerjasama && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={11} />{errors.judulKerjasama}</p>}
        </div>

        <div id="field-deskripsi">
          <label className="block text-sm font-semibold text-gray-800 mb-1.5">
            Deskripsi <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={3}
            value={deskripsi}
            onChange={(e) => { setDeskripsi(e.target.value); setErrors((p) => ({ ...p, deskripsi: '' })); }}
            placeholder="Jelaskan detail kerjasama yang diharapkan"
            className={`input-field w-full px-3 py-2 text-sm text-gray-700 resize-y placeholder:text-gray-400 ${errors.deskripsi ? 'border-red-400' : ''}`}
          />
          {errors.deskripsi && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={11} />{errors.deskripsi}</p>}
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
          <div id="field-kontakNama">
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={kontakNama}
              onChange={(e) => { setKontakNama(e.target.value); setErrors((p) => ({ ...p, kontakNama: '' })); }}
              placeholder="Nama kontak person"
              className={`input-field h-10 w-full px-3 text-sm text-gray-700 placeholder:text-gray-400 ${errors.kontakNama ? 'border-red-400' : ''}`}
            />
            {errors.kontakNama && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={11} />{errors.kontakNama}</p>}
          </div>
          <div id="field-kontakJabatan">
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">
              Jabatan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={kontakJabatan}
              onChange={(e) => { setKontakJabatan(e.target.value); setErrors((p) => ({ ...p, kontakJabatan: '' })); }}
              placeholder="Jabatan di Perusahaan"
              className={`input-field h-10 w-full px-3 text-sm text-gray-700 placeholder:text-gray-400 ${errors.kontakJabatan ? 'border-red-400' : ''}`}
            />
            {errors.kontakJabatan && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={11} />{errors.kontakJabatan}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div id="field-kontakEmail">
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={kontakEmail}
              onChange={(e) => { setKontakEmail(e.target.value); setErrors((p) => ({ ...p, kontakEmail: '' })); }}
              placeholder="email@example.com"
              className={`input-field h-10 w-full px-3 text-sm text-gray-700 placeholder:text-gray-400 ${errors.kontakEmail ? 'border-red-400' : ''}`}
            />
            {errors.kontakEmail && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={11} />{errors.kontakEmail}</p>}
          </div>
          <div id="field-kontakTelepon">
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">
              Telepon / WA Aktif <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={kontakTelepon}
              onChange={(e) => { setKontakTelepon(e.target.value); setErrors((p) => ({ ...p, kontakTelepon: '' })); }}
              placeholder="+62 824 67726 26"
              className={`input-field h-10 w-full px-3 text-sm text-gray-700 placeholder:text-gray-400 ${errors.kontakTelepon ? 'border-red-400' : ''}`}
            />
            {errors.kontakTelepon && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={11} />{errors.kontakTelepon}</p>}
          </div>
        </div>
      </section>

      {/* Section: Dokumen Pendukung */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
        <div>
          <h2 className="text-base font-bold text-gray-900">Dokumen Pendukung</h2>
          <p className="text-xs text-gray-500">Upload dokumen yang diperlukan</p>
          <p className="text-[11px] text-gray-500">Format: PDF, Word, Excel, JPG, PNG | Maksimal ukuran: 10MB</p>
        </div>

        {/* Template download */}
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 space-y-2">
          <p className="text-xs font-semibold text-blue-700">Template Dokumen</p>
          <p className="text-[11px] text-blue-600">Download template sesuai jenis kerjasama, isi, lalu upload di bawah.</p>
          <div className="flex flex-wrap gap-2 pt-1">
            <a
              href="/templates/Draft MOU Industri.docx"
              download
              className="inline-flex items-center gap-1.5 rounded-md border border-blue-300 bg-white px-3 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100"
            >
              <Download size={12} />
              Template MoU
            </a>
            <a
              href="/templates/Draft MOA Magang.docx"
              download
              className="inline-flex items-center gap-1.5 rounded-md border border-blue-300 bg-white px-3 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100"
            >
              <Download size={12} />
              Template MoA
            </a>
            <a
              href="/templates/DRAFT IA POLIBATAM.docx"
              download
              className="inline-flex items-center gap-1.5 rounded-md border border-blue-300 bg-white px-3 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100"
            >
              <Download size={12} />
              Template IA
            </a>
          </div>
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
      <div className="flex items-center justify-between border-t border-gray-200 pt-4">
        {Object.keys(errors).some((k) => errors[k]) && (
          <p className="flex items-center gap-1.5 text-xs text-red-500 font-medium">
            <AlertCircle size={13} />
            Mohon lengkapi semua field yang wajib diisi.
          </p>
        )}
        <div className="flex items-center gap-3 ml-auto">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={validateAndOpenModal}
            className="btn-primary px-6 py-2.5 text-sm font-semibold"
          >
            Ajukan Kerjasama
          </button>
        </div>
      </div>
      {/* Confirm Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h3 className="text-base font-bold text-gray-900">Konfirmasi Pengajuan</h3>
              <button type="button" onClick={() => setShowConfirmModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <p className="text-sm text-gray-600">Pastikan semua data sudah benar sebelum mengirimkan pengajuan kerjasama.</p>
              <div className="rounded-lg bg-gray-50 border border-gray-200 divide-y divide-gray-100 text-sm">
                <div className="flex justify-between px-4 py-2.5">
                  <span className="text-gray-500">Nama Mitra</span>
                  <span className="font-medium text-gray-800 text-right max-w-[55%]">{namaMitra}</span>
                </div>
                <div className="flex justify-between px-4 py-2.5">
                  <span className="text-gray-500">Jenis</span>
                  <span className="font-medium text-gray-800">{jenisKerjasama}</span>
                </div>
                <div className="flex justify-between px-4 py-2.5">
                  <span className="text-gray-500">Judul</span>
                  <span className="font-medium text-gray-800 text-right max-w-[55%]">{judulKerjasama}</span>
                </div>
                <div className="flex justify-between px-4 py-2.5">
                  <span className="text-gray-500">Unit Pelaksana</span>
                  <span className="font-medium text-gray-800">{unitPelaksana}</span>
                </div>
                <div className="flex justify-between px-4 py-2.5">
                  <span className="text-gray-500">Periode</span>
                  <span className="font-medium text-gray-800">{tanggalMulai} s/d {tanggalBerakhir}</span>
                </div>
                <div className="flex justify-between px-4 py-2.5">
                  <span className="text-gray-500">Kontak</span>
                  <span className="font-medium text-gray-800">{kontakNama}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Periksa Kembali
              </button>
              <button
                type="button"
                onClick={handleConfirmSubmit}
                className="btn-primary flex items-center gap-2 px-5 py-2 text-sm font-semibold"
              >
                <Send size={14} />
                Kirim Pengajuan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl">
            <div className="flex flex-col items-center px-8 py-10 text-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle size={32} className="text-emerald-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Pengajuan Berhasil Dikirim!</h3>
              <p className="text-sm text-gray-500">Pengajuan kerjasama Anda telah diterima. Silahkan tunggu verifikasi dari pihak Polibatam.</p>
              <button
                type="button"
                onClick={() => setShowSuccessModal(false)}
                className="btn-primary w-full py-2.5 text-sm font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
