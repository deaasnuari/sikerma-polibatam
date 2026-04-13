'use client';

import { useEffect, useState } from 'react';
import { Download, Save, X } from 'lucide-react';

interface LaporanKegiatanTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    namaMitra: string;
    noDokumen: string;
    jenis: 'MoU' | 'MoA' | 'IA';
    ruangLingkup: string[];
  } | null;
}

interface TemplateFormState {
  judulKerjasama: string;
  referensiKerjasama: string;
  mitraKerjasama: string;
  ruangLingkupText: string;
  hasilPelaksanaanText: string;
  tautanDokumentasi: string;
  namaPenanggungJawab: string;
  nipPenanggungJawab: string;
  jabatanMengetahui: string;
  namaMengetahui: string;
  nipMengetahui: string;
}

const detailRuangLingkup = [
  'Penyelenggaraan program pelatihan Bahasa Mandarin dan keterampilan vokasi (Garuda Talent Program) secara online bagi mahasiswa.',
  'Seleksi, penempatan, serta pengelompokan mahasiswa peserta program oleh Polibatam dan mitra.',
  'Pelaksanaan kegiatan pembelajaran, monitoring kehadiran, serta evaluasi program oleh pengajar dari mitra.',
  'Fasilitasi sertifikasi (HSK) dan dukungan rekomendasi kerja bagi peserta setelah program.',
];

const hasilPelaksanaan = [
  'Dokumentasi pelaksanaan program.',
  'Sertifikat program (joint certificate) bagi peserta yang memenuhi syarat (kehadiran dan HSK).',
  'Rekomendasi peluang kerja ke perusahaan mitra (khususnya perusahaan investasi Tiongkok), meskipun tidak bersifat jaminan.',
];

export default function LaporanKegiatanTemplateModal({ isOpen, onClose, data }: LaporanKegiatanTemplateModalProps) {
  const [judulKerjasama, setJudulKerjasama] = useState('');
  const [referensiKerjasama, setReferensiKerjasama] = useState('');
  const [mitraKerjasama, setMitraKerjasama] = useState('');
  const [ruangLingkupText, setRuangLingkupText] = useState('');
  const [hasilPelaksanaanText, setHasilPelaksanaanText] = useState('');
  const [tautanDokumentasi, setTautanDokumentasi] = useState('');
  const [namaPenanggungJawab, setNamaPenanggungJawab] = useState('');
  const [nipPenanggungJawab, setNipPenanggungJawab] = useState('');
  const [jabatanMengetahui, setJabatanMengetahui] = useState('');
  const [namaMengetahui, setNamaMengetahui] = useState('');
  const [nipMengetahui, setNipMengetahui] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

  function getStorageKey(currentData: NonNullable<LaporanKegiatanTemplateModalProps['data']>) {
    return `laporan-kegiatan-template-${currentData.noDokumen}-${currentData.jenis}`;
  }

  function buildDefaultState(currentData: NonNullable<LaporanKegiatanTemplateModalProps['data']>): TemplateFormState {
    const defaultJudul = `Program ${currentData.ruangLingkup[0] || 'Kerja Sama'} dengan ${currentData.namaMitra}`;
    const defaultReferensi = `${currentData.noDokumen}/${currentData.jenis}/${new Date().getFullYear()}`;
    const defaultRuangLingkup = [...detailRuangLingkup, `Fokus tambahan: ${currentData.ruangLingkup.join(', ') || '-'}`].join('\n');

    return {
      judulKerjasama: defaultJudul,
      referensiKerjasama: defaultReferensi,
      mitraKerjasama: currentData.namaMitra,
      ruangLingkupText: defaultRuangLingkup,
      hasilPelaksanaanText: hasilPelaksanaan.join('\n'),
      tautanDokumentasi: 'https://polibatam.ac.id/kerjasama/laporan-kegiatan',
      namaPenanggungJawab: 'Siti Noor Chayati',
      nipPenanggungJawab: '199203192022032006',
      jabatanMengetahui: 'Wakil Direktur Bidang Kemahasiswaan, Alumni dan Kerja Sama',
      namaMengetahui: 'Dr. Muhammad Zaenuddin',
      nipMengetahui: '197602142014041008',
    };
  }

  function applyState(next: TemplateFormState) {
    setJudulKerjasama(next.judulKerjasama);
    setReferensiKerjasama(next.referensiKerjasama);
    setMitraKerjasama(next.mitraKerjasama);
    setRuangLingkupText(next.ruangLingkupText);
    setHasilPelaksanaanText(next.hasilPelaksanaanText);
    setTautanDokumentasi(next.tautanDokumentasi);
    setNamaPenanggungJawab(next.namaPenanggungJawab);
    setNipPenanggungJawab(next.nipPenanggungJawab);
    setJabatanMengetahui(next.jabatanMengetahui);
    setNamaMengetahui(next.namaMengetahui);
    setNipMengetahui(next.nipMengetahui);
  }

  useEffect(() => {
    if (!data) return;

    const defaultState = buildDefaultState(data);
    const key = getStorageKey(data);
    const saved = localStorage.getItem(key);

    if (saved) {
      try {
        const parsed = JSON.parse(saved) as TemplateFormState;
        applyState({ ...defaultState, ...parsed });
      } catch {
        applyState(defaultState);
      }
    } else {
      applyState(defaultState);
    }
  }, [data]);

  function getCurrentState(): TemplateFormState {
    return {
      judulKerjasama,
      referensiKerjasama,
      mitraKerjasama,
      ruangLingkupText,
      hasilPelaksanaanText,
      tautanDokumentasi,
      namaPenanggungJawab,
      nipPenanggungJawab,
      jabatanMengetahui,
      namaMengetahui,
      nipMengetahui,
    };
  }

  function handleSave() {
    if (!data) return;

    localStorage.setItem(getStorageKey(data), JSON.stringify(getCurrentState()));
    setSaveMessage('Template berhasil disimpan.');
    window.setTimeout(() => setSaveMessage(''), 2200);
  }

  function escapeHtml(value: string) {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function formatMultiline(value: string) {
    return escapeHtml(value).replaceAll('\n', '<br />');
  }

  function handleDownloadWord() {
    if (!data) return;

    const docHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
        <head>
          <meta charset='utf-8' />
          <title>Laporan Pelaksanaan Kerja Sama</title>
          <style>
            body { font-family: Arial, sans-serif; font-size: 12px; }
            table { border-collapse: collapse; width: 100%; }
            td { border: 1px solid #888; padding: 6px; vertical-align: top; }
            .title { text-align: center; font-weight: 700; margin: 10px 0; }
            .label { width: 220px; font-weight: 700; }
            .no { width: 30px; text-align: center; }
          </style>
        </head>
        <body>
          <div class='title'>LAPORAN PELAKSANAAN KERJA SAMA</div>
          <table>
            <tr><td class='no'>1</td><td class='label'>JUDUL KERJASAMA</td><td>${escapeHtml(judulKerjasama)}</td></tr>
            <tr><td class='no'>2</td><td class='label'>REFERENSI KERJA SAMA (MOA/IA)</td><td>${escapeHtml(referensiKerjasama)}</td></tr>
            <tr><td class='no'>3</td><td class='label'>MITRA KERJA SAMA</td><td>${escapeHtml(mitraKerjasama)}</td></tr>
            <tr><td class='no'>4</td><td class='label'>RUANG LINGKUP</td><td>${formatMultiline(ruangLingkupText)}</td></tr>
            <tr><td class='no'>5</td><td class='label'>HASIL PELAKSANAAN (OUTPUT & OUTCOME)</td><td>${formatMultiline(hasilPelaksanaanText)}</td></tr>
            <tr><td class='no'>6</td><td class='label'>TAUTAN/LINK DOKUMENTASI KEGIATAN DAN LAPORAN KEGIATAN</td><td>${escapeHtml(tautanDokumentasi)}</td></tr>
          </table>
          <br />
          <table>
            <tr>
              <td style='width:50%'>
                <strong>PENANGGUNG JAWAB KEGIATAN</strong><br /><br /><br />
                <strong>${escapeHtml(namaPenanggungJawab)}</strong><br />
                NIP. ${escapeHtml(nipPenanggungJawab)}
              </td>
              <td style='width:50%'>
                <strong>Mengetahui</strong><br />
                <strong>${escapeHtml(jabatanMengetahui)}</strong><br /><br />
                <strong>${escapeHtml(namaMengetahui)}</strong><br />
                NIP. ${escapeHtml(nipMengetahui)}
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', docHtml], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Laporan_Kerjasama_${data.noDokumen}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  if (!isOpen || !data) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-3 py-6">
      <div className="relative max-h-[92vh] w-full max-w-5xl overflow-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-5 py-3">
          <h2 className="text-base font-bold text-[#1E376C]">Template Laporan Kegiatan Kerjasama</h2>
          <div className="flex items-center gap-2">
            {saveMessage && <p className="text-xs font-semibold text-green-600">{saveMessage}</p>}
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              <Save size={13} />
              Save
            </button>
            <button
              type="button"
              onClick={handleDownloadWord}
              className="inline-flex items-center gap-1 rounded-md bg-[#1E376C] px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#28478A]"
            >
              <Download size={13} />
              Save Word
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100"
              aria-label="Tutup"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="p-5">
          <div className="overflow-hidden rounded-lg border-2 border-[#2A3DA8]">
            <div className="grid grid-cols-2 items-center border-b border-gray-300 bg-[#F9FAFF] px-4 py-3">
              <div>
                <p className="text-xl font-black tracking-wide text-[#1F429A]">HOPE INTERNATIONAL</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-[#1A4EA1]">polibatam</p>
              </div>
            </div>

            <div className="border-b border-gray-300 px-3 py-2 text-center">
              <p className="text-sm font-black tracking-wide text-gray-900">LAPORAN PELAKSANAAN KERJA SAMA</p>
            </div>

            <table className="w-full border-collapse text-[13px] text-gray-900">
              <tbody>
                <TemplateRow
                  no="1"
                  label="JUDUL KERJASAMA"
                  value={
                    <input
                      type="text"
                      value={judulKerjasama}
                      onChange={(event) => setJudulKerjasama(event.target.value)}
                      className="w-full rounded border border-transparent bg-transparent px-1 py-0.5 text-[13px] outline-none transition-colors focus:border-blue-300 focus:bg-blue-50"
                    />
                  }
                />
                <TemplateRow
                  no="2"
                  label="REFERENSI KERJA SAMA (MOA/IA)"
                  value={
                    <input
                      type="text"
                      value={referensiKerjasama}
                      onChange={(event) => setReferensiKerjasama(event.target.value)}
                      className="w-full rounded border border-transparent bg-transparent px-1 py-0.5 text-[13px] outline-none transition-colors focus:border-blue-300 focus:bg-blue-50"
                    />
                  }
                />
                <TemplateRow
                  no="3"
                  label="MITRA KERJA SAMA"
                  value={
                    <input
                      type="text"
                      value={mitraKerjasama}
                      onChange={(event) => setMitraKerjasama(event.target.value)}
                      className="w-full rounded border border-transparent bg-transparent px-1 py-0.5 text-[13px] outline-none transition-colors focus:border-blue-300 focus:bg-blue-50"
                    />
                  }
                />
                <TemplateRow
                  no="4"
                  label="RUANG LINGKUP"
                  value={
                    <textarea
                      value={ruangLingkupText}
                      onChange={(event) => setRuangLingkupText(event.target.value)}
                      rows={6}
                      className="w-full resize-y rounded border border-transparent bg-transparent px-1 py-0.5 text-[13px] leading-relaxed outline-none transition-colors focus:border-blue-300 focus:bg-blue-50"
                    />
                  }
                />
                <TemplateRow
                  no="5"
                  label="HASIL PELAKSANAAN (OUTPUT & OUTCOME)"
                  value={
                    <textarea
                      value={hasilPelaksanaanText}
                      onChange={(event) => setHasilPelaksanaanText(event.target.value)}
                      rows={5}
                      className="w-full resize-y rounded border border-transparent bg-transparent px-1 py-0.5 text-[13px] leading-relaxed outline-none transition-colors focus:border-blue-300 focus:bg-blue-50"
                    />
                  }
                />
                <TemplateRow
                  no="6"
                  label="TAUTAN/LINK DOKUMENTASI KEGIATAN DAN LAPORAN KEGIATAN"
                  value={
                    <input
                      type="text"
                      value={tautanDokumentasi}
                      onChange={(event) => setTautanDokumentasi(event.target.value)}
                      className="w-full rounded border border-transparent bg-transparent px-1 py-0.5 text-[13px] text-blue-700 underline outline-none transition-colors focus:border-blue-300 focus:bg-blue-50"
                    />
                  }
                />
              </tbody>
            </table>

            <div className="grid grid-cols-2 border-t border-gray-300">
              <div className="border-r border-gray-300 p-3 text-sm">
                <p className="font-semibold">PENANGGUNG JAWAB KEGIATAN</p>
                <div className="mt-5 h-16" />
                <input
                  type="text"
                  value={namaPenanggungJawab}
                  onChange={(event) => setNamaPenanggungJawab(event.target.value)}
                  className="w-full rounded border border-transparent bg-transparent px-1 py-0.5 font-bold underline outline-none transition-colors focus:border-blue-300 focus:bg-blue-50"
                />
                <div className="mt-1 flex items-center gap-1">
                  <span>NIP.</span>
                  <input
                    type="text"
                    value={nipPenanggungJawab}
                    onChange={(event) => setNipPenanggungJawab(event.target.value)}
                    className="w-full rounded border border-transparent bg-transparent px-1 py-0.5 outline-none transition-colors focus:border-blue-300 focus:bg-blue-50"
                  />
                </div>
              </div>
              <div className="p-3 text-sm">
                <p className="font-semibold">Mengetahui</p>
                <textarea
                  value={jabatanMengetahui}
                  onChange={(event) => setJabatanMengetahui(event.target.value)}
                  rows={2}
                  className="mt-1 w-full resize-none rounded border border-transparent bg-transparent px-1 py-0.5 font-semibold leading-snug outline-none transition-colors focus:border-blue-300 focus:bg-blue-50"
                />
                <div className="mt-5 h-16" />
                <input
                  type="text"
                  value={namaMengetahui}
                  onChange={(event) => setNamaMengetahui(event.target.value)}
                  className="w-full rounded border border-transparent bg-transparent px-1 py-0.5 font-bold underline outline-none transition-colors focus:border-blue-300 focus:bg-blue-50"
                />
                <div className="mt-1 flex items-center gap-1">
                  <span>NIP.</span>
                  <input
                    type="text"
                    value={nipMengetahui}
                    onChange={(event) => setNipMengetahui(event.target.value)}
                    className="w-full rounded border border-transparent bg-transparent px-1 py-0.5 outline-none transition-colors focus:border-blue-300 focus:bg-blue-50"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TemplateRow({
  no,
  label,
  value,
}: {
  no: string;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <tr className="align-top">
      <td className="w-8 border-b border-r border-gray-300 px-2 py-2 text-center">{no}</td>
      <td className="w-64 border-b border-r border-gray-300 px-3 py-2 font-semibold">{label}</td>
      <td className="border-b border-gray-300 px-3 py-2">{value}</td>
    </tr>
  );
}