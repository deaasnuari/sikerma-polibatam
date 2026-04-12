'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Download, Upload, X } from 'lucide-react';

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

type TemplateDokumenConfig = {
  title: string;
  subtitle: string;
  struktur: string[];
  note: string;
};

const defaultTemplateDokumenMap: Record<string, TemplateDokumenConfig> = {
  MoU: {
    title: 'Memorandum of Understanding (MoU)',
    subtitle: 'Template untuk kesepahaman awal kerjasama',
    struktur: [
      'Pembukaan',
      'Para Pihak',
      'Latar Belakang',
      'Tujuan Kerjasama',
      'Ruang Lingkup Kerjasama',
      'Jangka Waktu',
      'Penutup',
    ],
    note: 'Template ini sudah disesuaikan dengan format standar Politeknik Negeri Batam.',
  },
  MoA: {
    title: 'Memorandum of Agreement (MoA)',
    subtitle: 'Template untuk perjanjian teknis pelaksanaan kerjasama',
    struktur: [
      'Pembukaan',
      'Dasar Pelaksanaan',
      'Hak dan Kewajiban',
      'Rencana Kegiatan',
      'Pendanaan',
      'Monitoring dan Evaluasi',
      'Penutup',
    ],
    note: 'Template ini sudah disesuaikan dengan format standar Politeknik Negeri Batam.',
  },
  IA: {
    title: 'Implementation Arrangement (IA)',
    subtitle: 'Template untuk rincian implementasi program/kegiatan',
    struktur: [
      'Informasi Program',
      'Target dan Indikator',
      'Peran Tim Pelaksana',
      'Timeline Kegiatan',
      'Output yang Diharapkan',
      'Pelaporan',
      'Penutup',
    ],
    note: 'Template ini sudah disesuaikan dengan format standar Politeknik Negeri Batam.',
  },
};

export default function AjukanForm() {
  const router = useRouter();
  const [asal, setAsal] = useState<'Jurusan' | 'Unit'>('Jurusan');
  const [formData, setFormData] = useState({
    judulPengajuan: '',
    namaPengusul: '',
    namaMitraTujuan: '',
    asalUnit: '',
    jenisDokumen: '',
    ruangLingkup: [] as string[],
    deskripsi: '',
    emailPengusul: '',
    whatsappPengusul: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasDownloadedTemplate, setHasDownloadedTemplate] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
    const content = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office"
            xmlns:w="urn:schemas-microsoft-com:office:word"
            xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="utf-8" />
          <title>${doc.title}</title>
        </head>
        <body>
          <h1>${doc.title}</h1>
          <p>${doc.subtitle}</p>
          <h3>Struktur Dokumen</h3>
          <ol>
            ${doc.struktur.map((item) => `<li>${item}</li>`).join('')}
          </ol>
          <p><strong>Catatan:</strong> ${doc.note}</p>
        </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Template_${formData.jenisDokumen}_Polibatam.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setHasDownloadedTemplate(true);
    setErrors((prev) => ({ ...prev, templateDownload: '' }));
  }

  function handleFileChange(file: File | null) {
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
      alert('Harap isi semua form wajib sebelum submit.');
      return;
    }

    const payload = {
      id: Date.now(),
      judul: formData.judulPengajuan,
      pengusul: formData.namaPengusul,
      tanggal: new Date().toISOString().slice(0, 10),
      mitra: formData.namaMitraTujuan,
      jenisDokumen: formData.jenisDokumen,
      jurusan: formData.asalUnit,
      ruangLingkup: formData.ruangLingkup,
      status: 'Menunggu',
      fileName: selectedFile?.name || '',
    };

    const existingDataRaw = localStorage.getItem('pengajuanKerjasamaData');
    const existingData = existingDataRaw ? JSON.parse(existingDataRaw) : [];
    localStorage.setItem('pengajuanKerjasamaData', JSON.stringify([payload, ...existingData]));

    alert('Pengajuan berhasil disimpan');

    router.push('/admin/data_pengajuan');
  }

  function handleCancel() {
    const hasChanges =
      formData.judulPengajuan ||
      formData.namaPengusul ||
      formData.namaMitraTujuan ||
      formData.asalUnit ||
      formData.jenisDokumen ||
      formData.ruangLingkup.length > 0 ||
      formData.deskripsi ||
      formData.emailPengusul ||
      formData.whatsappPengusul ||
      selectedFile;

    if (hasChanges && !window.confirm('Perubahan belum disimpan. Yakin ingin batal?')) {
      return;
    }

    router.push('/admin/data_pengajuan');
  }

  return (
    <div className="mx-auto max-w-[1100px] bg-white rounded-lg border border-gray-200">
      <div className="px-7 py-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl leading-none font-extrabold text-[#1E376C]">Form Pengajuan Kerjasama Baru</h1>
        </div>
        <Link
          href="/admin/data_pengajuan"
          className="text-gray-400 hover:text-gray-600 transition-colors mt-1"
          aria-label="Kembali ke daftar pengajuan"
        >
          <X size={24} />
        </Link>
      </div>

      <form className="px-7 pb-7 space-y-6" onSubmit={handleSubmit}>
        <section className="space-y-5">
          <h2 className="text-3xl leading-none font-bold text-gray-900">Informasi Dasar</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-5">
              <div>
                <label className="block text-lg leading-none font-semibold text-gray-900 mb-3">Judul Pengajuan *</label>
                <input
                  type="text"
                  value={formData.judulPengajuan}
                  onChange={(e) => handleInputChange('judulPengajuan', e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 h-11 text-base text-gray-700 outline-none focus:border-[#1E376C]"
                />
                {errors.judulPengajuan && <p className="text-xs text-red-600 mt-1.5">{errors.judulPengajuan}</p>}
              </div>

              <div>
                <label className="block text-lg leading-none font-semibold text-gray-900 mb-3">Nama Pengusul*</label>
                <input
                  type="text"
                  value={formData.namaPengusul}
                  onChange={(e) => handleInputChange('namaPengusul', e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 h-11 text-base text-gray-700 outline-none focus:border-[#1E376C]"
                />
                {errors.namaPengusul && <p className="text-xs text-red-600 mt-1.5">{errors.namaPengusul}</p>}
              </div>

              <div>
                <label className="block text-lg leading-none font-semibold text-gray-900 mb-3">Nama Mitra Tujuan *</label>
                <input
                  type="text"
                  value={formData.namaMitraTujuan}
                  onChange={(e) => handleInputChange('namaMitraTujuan', e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 h-11 text-base text-gray-700 outline-none focus:border-[#1E376C]"
                />
                {errors.namaMitraTujuan && <p className="text-xs text-red-600 mt-1.5">{errors.namaMitraTujuan}</p>}
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
                  className="w-full border border-gray-300 rounded-xl px-4 h-11 text-base text-gray-500 outline-none focus:border-[#1E376C] bg-white"
                >
                  <option value="">-- Pilih {asal} --</option>
                  <option value="Teknik Informatika">Teknik Informatika</option>
                  <option value="Teknik Elektro">Teknik Elektro</option>
                  <option value="Akuntansi Manajerial">Akuntansi Manajerial</option>
                  <option value="UPT Kerjasama">UPT Kerjasama</option>
                </select>
                {errors.asalUnit && <p className="text-xs text-red-600 mt-1.5">{errors.asalUnit}</p>}
              </div>

              <div>
                <label className="block text-lg leading-none font-semibold text-gray-900 mb-3">Jenis Dokumen *</label>
                <select
                  value={formData.jenisDokumen}
                  onChange={(e) => handleJenisDokumenChange(e.target.value)}
                  className={`w-full border rounded-xl px-4 h-11 text-base outline-none bg-white focus:border-[#1E376C] ${formData.jenisDokumen ? 'border-[#BFCBE3] text-gray-700' : 'border-gray-300 text-gray-500'}`}
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
            <div className="rounded-3xl border border-[#D7E0F0] bg-[#F7FAFF] p-4 sm:p-5 space-y-4">
              <h3 className="text-xl font-bold text-gray-900">Template Dokumen</h3>

              {false && (
                <div className="rounded-2xl border border-[#D7E0F0] bg-white p-4 grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1.5">Judul Template</label>
                    <input
                      type="text"
                      value={defaultTemplateDokumenMap[formData.jenisDokumen].title}
                      onChange={(e) => updateTemplateField('title', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 h-10 text-sm text-gray-700 outline-none focus:border-[#1E376C]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1.5">Subjudul Template</label>
                    <input
                      type="text"
                      value={defaultTemplateDokumenMap[formData.jenisDokumen].subtitle}
                      onChange={(e) => updateTemplateField('subtitle', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 h-10 text-sm text-gray-700 outline-none focus:border-[#1E376C]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1.5">Struktur Dokumen (1 baris = 1 poin)</label>
                    <textarea
                      rows={5}
                      value={defaultTemplateDokumenMap[formData.jenisDokumen].struktur.join('\n')}
                      onChange={(e) => updateTemplateStruktur(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#1E376C]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1.5">Catatan</label>
                    <textarea
                      rows={2}
                      value={defaultTemplateDokumenMap[formData.jenisDokumen].note}
                      onChange={(e) => updateTemplateField('note', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#1E376C]"
                    />
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-[#D7E0F0] bg-white p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="text-2xl font-bold text-[#1E376C]">{defaultTemplateDokumenMap[formData.jenisDokumen].title}</p>
                    <p className="text-sm text-gray-600">{defaultTemplateDokumenMap[formData.jenisDokumen].subtitle}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-[#1E376C] text-white text-sm font-semibold hover:bg-[#2A4A8F] transition-colors shadow-sm"
                  >
                    <Download size={16} />
                    Download
                  </button>
                </div>

                <div className="mt-3 rounded-xl border border-[#D7E0F0] bg-[#F3F7FF] p-3">
                  <p className="text-sm font-semibold text-[#1E376C] mb-1">Struktur Dokumen:</p>
                  <ol className="list-decimal list-inside text-sm text-gray-700 space-y-0.5">
                    {defaultTemplateDokumenMap[formData.jenisDokumen].struktur.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ol>
                </div>

                <p className="mt-3 text-xs text-[#1E376C] bg-[#EEF3FF] border border-[#D7E0F0] rounded-lg px-3 py-2">
                  Catatan: {defaultTemplateDokumenMap[formData.jenisDokumen].note}
                </p>
              </div>

              <div>
                <label className="block text-lg leading-none font-semibold text-gray-900 mb-3">Upload Dokumen *</label>

                {!hasDownloadedTemplate && (
                  <p className="text-xs text-[#1E376C] bg-[#EEF3FF] border border-[#D7E0F0] rounded-lg px-3 py-2 mb-2">
                    Download template terlebih dahulu sebelum upload dokumen.
                  </p>
                )}

                <label
                  className={`w-full rounded-2xl border-2 border-dashed p-5 text-center block ${hasDownloadedTemplate ? 'border-[#BFD0EE] bg-[#F5F8FF] cursor-pointer' : 'border-gray-300 bg-gray-100 cursor-not-allowed'}`}
                >
                  <input
                    type="file"
                    accept=".doc,.docx,.pdf"
                    disabled={!hasDownloadedTemplate}
                    onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <Upload className="mx-auto text-[#1E376C]" size={22} />
                  <p className="text-base font-semibold text-[#1E376C] mt-2">Upload Dokumen MoU/MoA/IA</p>
                  <p className="text-xs text-gray-500 mt-1">Drag & drop atau klik untuk memilih file</p>
                  <span className="inline-flex mt-3 px-3 py-1 rounded-lg bg-[#1E376C] text-white text-xs font-semibold">
                    Pilih File Word
                  </span>
                  <p className="text-[11px] text-gray-500 mt-2">Format: .doc, .docx, .pdf</p>
                  <p className="text-[11px] text-gray-500">Ukuran maksimal 10MB</p>
                  {selectedFile && (
                    <p className="text-xs text-green-700 font-semibold mt-2">
                      File dipilih: {selectedFile.name}
                    </p>
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
            className="bg-[#1E376C] hover:bg-[#2A4A8F] text-white h-11 w-[190px] rounded-xl text-lg leading-none font-semibold transition-colors"
          >
            Submit Pengajuan
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 h-11 w-[100px] rounded-xl text-lg leading-none font-semibold transition-colors inline-flex items-center justify-center"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}
