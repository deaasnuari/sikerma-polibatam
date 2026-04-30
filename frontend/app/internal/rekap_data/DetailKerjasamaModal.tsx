'use client';

import { useState } from 'react';
import { ArrowLeft, Calendar, CheckCircle2, Clock, Download, FileText, Mail, Phone, User } from 'lucide-react';
import { generateNoDokumen } from '@/services/adminMonitoringService';

type ApprovalStatus = 'Menunggu' | 'Disetujui' | 'Ditolak';
type Jenis = 'MoU' | 'MoA' | 'IA';
type TabKey = 'informasi' | 'dokumen' | 'kontak' | 'histori';

interface KerjasamaItem {
  noDokumen: string;
  namaMitra: string;
  jenis: Jenis;
  unit: string;
  tanggalMulai: string;
  berlakuHingga: string;
  status: ApprovalStatus;
}

interface DetailKerjasamaModalProps {
  item: KerjasamaItem;
  onClose: () => void;
}

const jenisBadgeMap: Record<Jenis, string> = {
  MoU: 'bg-violet-100 text-violet-700',
  MoA: 'bg-cyan-100 text-cyan-700',
  IA: 'bg-orange-100 text-orange-700',
};

const statusLabelMap: Record<ApprovalStatus, { label: string; className: string }> = {
  Menunggu: { label: 'Menunggu Approval', className: 'bg-amber-400 text-white' },
  Disetujui: { label: 'Disetujui', className: 'bg-green-500 text-white' },
  Ditolak: { label: 'Ditolak', className: 'bg-red-500 text-white' },
};

const tabs: { key: TabKey; label: string }[] = [
  { key: 'informasi', label: 'Informasi' },
  { key: 'dokumen', label: 'Dokumen' },
  { key: 'kontak', label: 'Kontak' },
  { key: 'histori', label: 'Histori' },
];

const jenisFullName: Record<Jenis, string> = {
  MoU: 'Memorandum of Understanding (MoU)',
  MoA: 'Memorandum of Agreement (MoA)',
  IA: 'Implementation Agreement (IA)',
};

interface DokumenTerkait {
  nama: string;
  ukuran: string;
  tanggal: string;
}

const dummyDokumen: DokumenTerkait[] = [
  { nama: 'Draft MoU.pdf', ukuran: '2.5 MB', tanggal: '28 Feb 2026' },
  { nama: 'Proposal Kerjasama.pdf', ukuran: '18 MB', tanggal: '25 Feb 2026' },
  { nama: 'Company Profile.pdf', ukuran: '1.2 MB', tanggal: '24 Feb 2026' },
];

interface KontakMitra {
  nama: string;
  inisial: string;
  jabatan: string;
  email: string;
  telepon: string;
}

const dummyKontak: KontakMitra = {
  nama: 'Budi Santoso',
  inisial: 'BS',
  jabatan: 'Direktur Operasional',
  email: 'budi.santoso@teknologimaju.com',
  telepon: '+62 812-3456-7890',
};

interface HistoriItem {
  judul: string;
  oleh: string;
  tanggal: string;
  ikon: 'dibuat' | 'review';
}

const dummyHistori: HistoriItem[] = [
  { judul: 'Pengajuan dibuat', oleh: 'oleh Admin-mod Ti', tanggal: '28 Feb 2026', ikon: 'dibuat' },
  { judul: 'Menunggu review Jurusan', oleh: 'oleh System', tanggal: '28 Feb 2026', ikon: 'review' },
];

export default function DetailKerjasamaModal({ item, onClose }: DetailKerjasamaModalProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('informasi');
  const statusInfo = statusLabelMap[item.status];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6 backdrop-blur-[2px]">
      <div className="flex w-full max-w-[580px] max-h-[90vh] flex-col rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 pt-5 pb-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Detail Kerjasama</h2>
              <p className="text-xs text-gray-500">{generateNoDokumen({ urutan: 1, jenis: item.jenis, tanggal: item.tanggalMulai })}</p>
            </div>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
          >
            <Download size={15} />
            Download
          </button>
        </div>

        {/* Partner Info Bar */}
        <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1E376C] text-sm font-bold text-white">
              P
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">{item.namaMitra}</p>
              <div className="mt-1 flex items-center gap-2">
                <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${jenisBadgeMap[item.jenis]}`}>
                  {item.jenis}
                </span>
                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-medium text-gray-600">
                  {item.unit}
                </span>
              </div>
            </div>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusInfo.className}`}>
            {statusInfo.label}
          </span>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'border-b-2 border-[#1E376C] text-[#1E376C]'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {activeTab === 'informasi' && <TabInformasi item={item} />}
          {activeTab === 'dokumen' && <TabDokumen dokumenTerkait={(item as any).dokumenTerkait} />}
          {activeTab === 'kontak' && <TabKontak />}
          {activeTab === 'histori' && <TabHistori />}
        </div>

        {/* Bottom Action Bar */}
        {item.status === 'Menunggu' && (
          <div className="flex items-center justify-between gap-3 border-t border-amber-200 bg-amber-50 px-6 py-3">
            <div>
              <p className="text-sm font-semibold text-amber-900">Pengajuan Menunggu Persetujuan</p>
              <p className="text-xs text-amber-700">Tindakan diperlukan untuk melanjutkan proses kerjasama.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                ✕ Tolak
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-lg bg-[#1E376C] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#2B4A93]"
              >
                ✓ Setujui
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TabInformasi({ item }: { item: KerjasamaItem }) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-bold text-gray-900">Informasi Kerjasama</h3>
      </div>

      <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500">Nomor Dokumen</p>
            <p className="mt-0.5 text-sm font-semibold text-gray-900">{item.noDokumen}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Jenis Kerjasama</p>
            <p className="mt-0.5 text-sm font-semibold text-gray-900">{item.jenis}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500">Tanggal Mulai</p>
            <div className="mt-0.5 flex items-center gap-1.5">
              <Calendar size={13} className="text-gray-400" />
              <p className="text-sm font-semibold text-gray-900">{item.tanggalMulai}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500">Tanggal Berakhir</p>
            <div className="mt-0.5 flex items-center gap-1.5">
              <Calendar size={13} className="text-gray-400" />
              <p className="text-sm font-semibold text-gray-900">{item.berlakuHingga}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500">Unit Pelaksana</p>
            <p className="mt-0.5 text-sm font-semibold text-gray-900">{item.unit}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Nilai Kerjasama</p>
            <p className="mt-0.5 text-sm font-semibold text-blue-600">Rp. 500.000.000</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 space-y-3">
        <div>
          <p className="text-xs text-gray-500">Deskripsi</p>
          <p className="mt-1 text-sm text-gray-700 leading-relaxed">
            Kerjasama dalam bentuk {jenisFullName[item.jenis]} untuk pengembangan teknologi informasi dan pelatihan mahasiswa di bidang software development.
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-500">Ruang Lingkup</p>
          <ul className="mt-1 space-y-1">
            {['Program magang mahasiswa', 'Pelatihan dan sertifikasi', 'Penelitian bersama', 'Sharing dan knowledge teknologi'].map((scope) => (
              <li key={scope} className="flex items-center gap-2 text-sm text-gray-700">
                <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                {scope}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function TabDokumen({ dokumenTerkait }: { dokumenTerkait?: { nama: string; url: string; ukuran: string; tanggal: string }[] }) {
  if (!dokumenTerkait || dokumenTerkait.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-900">Dokumen Terkait</h3>
        <div className="text-gray-500 text-sm">Belum ada dokumen terlampir.</div>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-gray-900">Dokumen Terkait</h3>
      <div className="space-y-3">
        {dokumenTerkait.map((doc) => (
          <div key={doc.nama} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                <FileText size={18} className="text-red-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{doc.nama}</p>
                <p className="text-xs text-gray-500">{doc.ukuran} • {doc.tanggal}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 transition-colors hover:text-blue-800 border border-blue-100 rounded px-2 py-1"
                style={{ textDecoration: 'none' }}
              >
                Lihat
              </a>
              <a
                href={doc.url}
                download={doc.nama}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-800"
              >
                <Download size={14} />
                Download
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TabKontak() {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-gray-900">Kontak Mitra</h3>

      <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-5 space-y-5">
        {/* Person */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-sm font-bold text-gray-600">
            {dummyKontak.inisial}
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">{dummyKontak.nama}</p>
            <p className="text-xs text-gray-500">{dummyKontak.jabatan}</p>
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* Email */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100">
            <Mail size={15} className="text-orange-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Email</p>
            <p className="text-sm font-medium text-gray-900">{dummyKontak.email}</p>
          </div>
        </div>

        {/* Phone */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100">
            <Phone size={15} className="text-green-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Telepon</p>
            <p className="text-sm font-medium text-gray-900">{dummyKontak.telepon}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function TabHistori() {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-gray-900">Histori Perubahan</h3>

      <div className="space-y-0">
        {dummyHistori.map((h, index) => (
          <div key={h.judul} className="relative flex gap-4 pb-6">
            {/* Vertical line */}
            {index < dummyHistori.length - 1 && (
              <div className="absolute left-[17px] top-9 bottom-0 w-px bg-gray-200" />
            )}

            {/* Icon */}
            <div className="relative z-10 flex-shrink-0">
              {h.ikon === 'dibuat' ? (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle2 size={16} className="text-green-500" />
                </div>
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100">
                  <Clock size={16} className="text-amber-500" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="pt-1">
              <p className="text-sm font-semibold text-gray-900">{h.judul}</p>
              <p className="text-xs text-gray-500">{h.oleh}</p>
              <p className="text-xs text-gray-400">{h.tanggal}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
