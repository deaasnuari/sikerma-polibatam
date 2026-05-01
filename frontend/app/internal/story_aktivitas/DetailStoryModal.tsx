'use client';

import { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  ClipboardList,
  Download,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Trash2,
  Users,
} from 'lucide-react';
import { saveAktivitasByKerjasamaId, type AktivitasItem } from '@/services/adminStoryAktivitasService';
import type { KerjasamaStory, Aktivitas } from './page';

type Jenis = 'MoA' | 'MoU' | 'IA';
type StatusKerjasama = 'Aktif' | 'Akan Berakhir' | 'Kadaluarsa';
type StatusAktivitas = 'direncanakan' | 'berlangsung' | 'selesai';

interface DetailStoryModalProps {
  story: KerjasamaStory;
  onBack: () => void;
}

const jenisBadgeMap: Record<Jenis, string> = {
  MoA: 'bg-cyan-100 text-cyan-700',
  MoU: 'bg-violet-100 text-violet-700',
  IA: 'bg-orange-100 text-orange-700',
};

const statusDotMap: Record<StatusKerjasama, string> = {
  Aktif: 'bg-green-500',
  'Akan Berakhir': 'bg-orange-500',
  Kadaluarsa: 'bg-red-500',
};

const statusTextMap: Record<StatusKerjasama, string> = {
  Aktif: 'text-green-700',
  'Akan Berakhir': 'text-orange-700',
  Kadaluarsa: 'text-red-700',
};

const aktivitasStatusBadge: Record<StatusAktivitas, { label: string; className: string }> = {
  direncanakan: { label: 'direncanakan', className: 'bg-purple-100 text-purple-700' },
  berlangsung: { label: 'berlangsung', className: 'bg-blue-100 text-blue-700' },
  selesai: { label: 'selesai', className: 'bg-green-100 text-green-700' },
};

const aktivitasIconBg: Record<StatusAktivitas, string> = {
  direncanakan: 'bg-purple-100',
  berlangsung: 'bg-blue-100',
  selesai: 'bg-green-100',
};

const aktivitasIconColor: Record<StatusAktivitas, string> = {
  direncanakan: 'text-purple-500',
  berlangsung: 'text-blue-500',
  selesai: 'text-green-500',
};

function toAktivitasItems(items: Aktivitas[]): AktivitasItem[] {
  return items.map((a) => ({
    id: Number(a.id),
    judul: a.judul,
    jenisAktivitas: a.judul.split(' - ')[0] || 'Lainnya',
    tanggal: a.tanggal,
    peserta: a.peserta,
    deskripsi: a.deskripsi,
    picPolibatam: a.picPolibatam,
    picMitra: a.picMitra,
    status: a.status,
  }));
}

export default function DetailStoryModal({ story, onBack }: DetailStoryModalProps) {
  const [aktivitasList, setAktivitasList] = useState<Aktivitas[]>(story.aktivitas);
  const [showTambah, setShowTambah] = useState(false);

  const totalAktivitas = aktivitasList.length;
  const selesai = aktivitasList.filter((a) => a.status === 'selesai').length;
  const berlangsung = aktivitasList.filter((a) => a.status === 'berlangsung').length;
  const direncanakan = aktivitasList.filter((a) => a.status === 'direncanakan').length;

  function handleDeleteAktivitas(id: string) {
    if (!window.confirm('Yakin ingin menghapus aktivitas ini?')) return;
    const updated = aktivitasList.filter((a) => a.id !== id);
    setAktivitasList(updated);
    saveAktivitasByKerjasamaId(Number(story.id), toAktivitasItems(updated));
    window.dispatchEvent(new Event('story-data-updated'));
  }

  function handleTambahAktivitas(data: Aktivitas) {
    const updated = [data, ...aktivitasList];
    setAktivitasList(updated);
    setShowTambah(false);
    saveAktivitasByKerjasamaId(Number(story.id), toAktivitasItems(updated));
    window.dispatchEvent(new Event('story-data-updated'));
  }

  return (
    <div className="space-y-5">
      {/* Top Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
        >
          <ArrowLeft size={16} />
          Kembali
        </button>
<div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.open(`/api/backend/dokumen/${story.noDokumen}`, '_blank')}
            className="btn-primary inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold"
          >
            <Download size={14} />
            Download
          </button>
        </div>
      </div>

      {/* Partner Header Card */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        {/* Name + Status */}
        <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{story.namaMitra}</h2>
            <p className="mt-0.5 text-xs text-gray-500">No. Dokumen: {story.noDokumen}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${statusDotMap[story.status]}`} />
            <span className={`text-sm font-semibold ${statusTextMap[story.status]}`}>{story.status}</span>
          </div>
        </div>

        {/* Info Row */}
        <div className="grid grid-cols-2 gap-4 border-t border-gray-100 px-6 py-4 md:grid-cols-4">
          <div>
            <p className="text-[11px] text-gray-500">Jenis Dokumen</p>
            <span className={`mt-1 inline-block rounded-md px-2 py-0.5 text-xs font-bold ${jenisBadgeMap[story.jenis]}`}>
              {story.jenis}
            </span>
          </div>
          <div>
            <p className="text-[11px] text-gray-500">Kategori Mitra</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{story.kategoriMitra}</p>
          </div>
          <div>
            <p className="text-[11px] text-gray-500">Tanggal Mulai</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{story.tanggalMulai}</p>
          </div>
          <div>
            <p className="text-[11px] text-gray-500">Tanggal Berakhir</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{story.tanggalBerakhir}</p>
          </div>
        </div>

        {/* Mitra Info + Status Masa Berlaku */}
        <div className="grid grid-cols-1 gap-4 border-t border-gray-100 px-6 py-4 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-800">
              <span className="mr-1">📄</span> Informasi Mitra
            </p>
            <div className="space-y-1.5 text-sm text-gray-600">
              <p className="flex items-center gap-2">
                <MapPin size={13} className="text-gray-400" />
                {story.alamat}
              </p>
              <p className="flex items-center gap-2">
                <Mail size={13} className="text-gray-400" />
                {story.email}
              </p>
              <p className="flex items-center gap-2">
                <Phone size={13} className="text-gray-400" />
                {story.telepon}
              </p>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-800">
              <span className="mr-1">📋</span> Status Masa Berlaku
            </p>
            <p className="mt-1 text-xs text-gray-500">Sisa Waktu:</p>
            <p className="mt-0.5 text-2xl font-bold text-[#1E376C]">{story.sisaWaktu}</p>
          </div>
        </div>

        {/* Ruang Lingkup + Jurusan */}
        <div className="grid grid-cols-1 gap-4 border-t border-gray-100 px-6 py-4 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold text-gray-800">Ruang Lingkup Kerjasama</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {story.ruangLingkup.map((r) => (
                <span key={r} className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                  {r}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-800">Jurusan Terlibat</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {story.jurusanTerlibat.map((j) => (
                <span key={j} className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-700">
                  {j}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MiniStat icon={<ClipboardList size={18} className="text-gray-500" />} iconBg="bg-gray-100" label="Total Aktivitas" value={totalAktivitas} />
        <MiniStat icon={<CheckCircle2 size={18} className="text-green-500" />} iconBg="bg-green-100" label="Selesai" value={selesai} />
        <MiniStat icon={<Clock size={18} className="text-blue-500" />} iconBg="bg-blue-100" label="Berlangsung" value={berlangsung} />
        <MiniStat icon={<Calendar size={18} className="text-purple-500" />} iconBg="bg-purple-100" label="Direncanakan" value={direncanakan} />
      </div>

      {/* Story Kerjasama & Aktivitas */}
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-900">
            <span className="mr-1">📖</span> Story Kerjasama & Aktivitas
          </h3>
          <button
            type="button"
            onClick={() => setShowTambah((prev) => !prev)}
            className="relative z-10 inline-flex items-center gap-1.5 rounded-xl bg-[#091222] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#173B82] hover:shadow-md"
          >
            <Plus size={14} />
            Tambah Aktivitas
          </button>
        </div>

        {/* Tambah Aktivitas Inline Form */}
        {showTambah && (
          <div className="mt-4">
            <TambahAktivitasForm
              onClose={() => setShowTambah(false)}
              onSave={handleTambahAktivitas}
            />
          </div>
        )}

        <div className="mt-4 space-y-4">
          {aktivitasList.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-10 text-center text-sm text-gray-500">
              Belum ada aktivitas tercatat.
            </div>
          ) : (
            aktivitasList.map((a) => {
              const badge = aktivitasStatusBadge[a.status];
              return (
                <div key={a.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${aktivitasIconBg[a.status]}`}>
                        <ClipboardList size={18} className={aktivitasIconColor[a.status]} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-gray-900">{a.judul}</p>
                        </div>
                        <div className="mt-0.5 flex items-center gap-3 text-xs text-gray-500">
                          <span className="inline-flex items-center gap-1">
                            <Calendar size={11} />
                            {a.tanggal}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Users size={11} />
                            {a.peserta} peserta
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-gray-600 leading-relaxed">{a.deskripsi}</p>
                        <div className="mt-2 space-y-0.5 text-xs text-gray-500">
                          <p>PIC Polibatam: {a.picPolibatam}</p>
                          <p>PIC Mitra: {a.picMitra}</p>
                        </div>
                      </div>
                    </div>

<div className="flex flex-col items-end gap-2">
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${badge.className}`}>
                        {badge.label}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function MiniStat({
  icon,
  iconBg,
  label,
  value,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: number;
}) {
  return (
    <div className="stat-card flex items-center gap-3 p-4">
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="mt-0.5 text-2xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`ml-auto flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
        {icon}
      </div>
    </div>
  );
}

function TambahAktivitasForm({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (data: Aktivitas) => void;
}) {
  const [judul, setJudul] = useState('');
  const [jenisAktivitas, setJenisAktivitas] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [peserta, setPeserta] = useState('');
  const [status, setStatus] = useState<StatusAktivitas>('direncanakan');
  const [picPolibatam, setPicPolibatam] = useState('');
  const [picMitra, setPicMitra] = useState('');
  const [deskripsi, setDeskripsi] = useState('');

  function handleSubmit() {
    if (!judul.trim()) {
      alert('Judul aktivitas wajib diisi.');
      return;
    }
    if (!jenisAktivitas) {
      alert('Jenis aktivitas wajib dipilih.');
      return;
    }
    if (!tanggal) {
      alert('Tanggal wajib diisi.');
      return;
    }
    if (!picPolibatam.trim()) {
      alert('PIC Polibatam wajib diisi.');
      return;
    }
    const dateStr = tanggal
      ? new Date(tanggal).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
      : '';
    onSave({
      id: `a-${Date.now()}`,
      judul: `${jenisAktivitas} - ${judul}`,
      tanggal: dateStr,
      peserta: Number(peserta) || 0,
      deskripsi,
      picPolibatam,
      picMitra,
      status,
    });
  }

  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 space-y-5">
      <h3 className="text-base font-bold text-gray-900">Tambah Aktivitas Baru</h3>

      {/* Row 1: Judul & Jenis */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1.5">
            Judul Aktivitas <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={judul}
            onChange={(e) => setJudul(e.target.value)}
            placeholder="Contoh: Workshop Teknologi AI"
            className="input-field h-10 w-full px-3 text-sm text-gray-700 placeholder:text-gray-400"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1.5">
            Jenis Aktivitas <span className="text-red-500">*</span>
          </label>
          <select
            value={jenisAktivitas}
            onChange={(e) => setJenisAktivitas(e.target.value)}
            className="input-field h-10 w-full px-3 text-sm text-gray-700"
          >
            <option value="">Pilih Jenis</option>
            <option value="Workshop">Workshop</option>
            <option value="Penelitian">Penelitian</option>
            <option value="Pengabdian Masyarakat">Pengabdian Masyarakat</option>
            <option value="Pelatihan">Pelatihan</option>
            <option value="Seminar">Seminar</option>
            <option value="Magang">Magang</option>
          </select>
        </div>
      </div>

      {/* Row 2: Tanggal, Jumlah Peserta, Status */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1.5">
            Tanggal <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            className="input-field h-10 w-full px-3 text-sm text-gray-700"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1.5">Jumlah Peserta</label>
          <input
            type="number"
            value={peserta}
            onChange={(e) => setPeserta(e.target.value)}
            placeholder="0"
            className="input-field h-10 w-full px-3 text-sm text-gray-700 placeholder:text-gray-400"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1.5">
            Status <span className="text-red-500">*</span>
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusAktivitas)}
            className="input-field h-10 w-full px-3 text-sm text-gray-700"
          >
            <option value="direncanakan">Direncanakan</option>
            <option value="berlangsung">Berlangsung</option>
            <option value="selesai">Selesai</option>
          </select>
        </div>
      </div>

      {/* Row 3: PIC Polibatam & PIC Mitra */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1.5">
            PIC Polibatam <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={picPolibatam}
            onChange={(e) => setPicPolibatam(e.target.value)}
            placeholder="Nama dosen/staff"
            className="input-field h-10 w-full px-3 text-sm text-gray-700 placeholder:text-gray-400"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1.5">PIC Mitra</label>
          <input
            type="text"
            value={picMitra}
            onChange={(e) => setPicMitra(e.target.value)}
            placeholder="Nama PIC dari mitra"
            className="input-field h-10 w-full px-3 text-sm text-gray-700 placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Row 4: Deskripsi */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-1.5">Deskripsi Aktivitas</label>
        <textarea
          rows={4}
          value={deskripsi}
          onChange={(e) => setDeskripsi(e.target.value)}
          placeholder="Jelaskan detail aktivitas..."
          className="input-field w-full px-3 py-2 text-sm text-gray-700 resize-y placeholder:text-gray-400"
        />
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          className="btn-primary px-5 py-2 text-sm font-semibold"
        >
          Simpan Aktivitas
        </button>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
        >
          Batal
        </button>
      </div>
    </div>
  );
}
