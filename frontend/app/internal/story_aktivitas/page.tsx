'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  BookOpen,
  Calendar,
  CalendarCheck,
  Eye,
  FileText,
  Filter,
  Search,
  Users,
} from 'lucide-react';
import DetailStoryModal from './DetailStoryModal';
import { getPengajuanData, type PengajuanItem } from '@/services/adminPengajuanService';
import { getAktivitasByKerjasamaId } from '@/services/adminStoryAktivitasService';

// ── Types ──────────────────────────────────────────────

type Jenis = 'MoA' | 'MoU' | 'IA';
type StatusKerjasama = 'Aktif' | 'Akan Berakhir' | 'Kadaluarsa';
type StatusAktivitas = 'direncanakan' | 'berlangsung' | 'selesai';

export interface Aktivitas {
  id: string;
  judul: string;
  tanggal: string;
  peserta: number;
  deskripsi: string;
  picPolibatam: string;
  picMitra: string;
  status: StatusAktivitas;
}

export interface KerjasamaStory {
  id: string;
  namaMitra: string;
  noDokumen: string;
  jenis: Jenis;
  status: StatusKerjasama;
  tanggalMulai: string;
  tanggalBerakhir: string;
  kategoriMitra: string;
  alamat: string;
  email: string;
  telepon: string;
  sisaWaktu: string;
  ruangLingkup: string[];
  jurusanTerlibat: string[];
  aktivitas: Aktivitas[];
}

// ── Helpers ────────────────────────────────────────────

function computeStatus(tanggalBerakhir?: string): StatusKerjasama {
  if (!tanggalBerakhir) return 'Aktif';
  const end = new Date(tanggalBerakhir);
  if (Number.isNaN(end.getTime())) return 'Aktif';
  const diffDays = Math.ceil((end.getTime() - Date.now()) / 86400000);
  if (diffDays < 0) return 'Kadaluarsa';
  if (diffDays <= 120) return 'Akan Berakhir';
  return 'Aktif';
}

function computeSisaWaktu(tanggalBerakhir?: string): string {
  if (!tanggalBerakhir) return '-';
  const end = new Date(tanggalBerakhir);
  if (Number.isNaN(end.getTime())) return '-';
  const diffDays = Math.ceil((end.getTime() - Date.now()) / 86400000);
  if (diffDays < 0) return 'Kadaluarsa';
  const months = Math.floor(diffDays / 30);
  const days = diffDays % 30;
  if (months > 0) return days > 0 ? `${months} Bulan ${days} Hari` : `${months} Bulan`;
  return `${diffDays} Hari`;
}

function toDisplayDate(value?: string): string {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-GB');
}

function mapPengajuanToStory(item: PengajuanItem): KerjasamaStory {
  const jenis = (['MoA', 'MoU', 'IA'].includes(item.jenisDokumen) ? item.jenisDokumen : 'MoU') as Jenis;
  const tahun = item.tanggal?.slice(0, 4) || String(new Date().getFullYear());
  const activities = getAktivitasByKerjasamaId(item.id).map((a) => ({
    id: String(a.id),
    judul: a.judul,
    tanggal: a.tanggal,
    peserta: a.peserta,
    deskripsi: a.deskripsi,
    picPolibatam: a.picPolibatam,
    picMitra: a.picMitra,
    status: a.status as StatusAktivitas,
  }));

  return {
    id: String(item.id),
    namaMitra: item.mitra,
    noDokumen: `${jenis}/${String(item.id).padStart(3, '0')}/${tahun}`,
    jenis,
    status: computeStatus(item.tanggalBerakhir),
    tanggalMulai: toDisplayDate(item.tanggalMulai),
    tanggalBerakhir: toDisplayDate(item.tanggalBerakhir),
    kategoriMitra: item.kategori || '-',
    alamat: item.alamatMitra || '-',
    email: item.emailPengusul || '-',
    telepon: item.whatsappPengusul || '-',
    sisaWaktu: computeSisaWaktu(item.tanggalBerakhir),
    ruangLingkup: [...item.ruangLingkup],
    jurusanTerlibat: item.jurusan ? [item.jurusan] : [],
    aktivitas: activities,
  };
}

// ── Badges ─────────────────────────────────────────────

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

const jenisOptions = ['Semua Jenis', 'MoA', 'MoU', 'IA'];
const statusOptions = ['Semua Status', 'Aktif', 'Akan Berakhir', 'Kadaluarsa'];

// ── Component ──────────────────────────────────────────

export default function InternalStoryAktivitasPage() {
  const [kerjasamaData, setKerjasamaData] = useState<KerjasamaStory[]>([]);
  const [search, setSearch] = useState('');
  const [filterJenis, setFilterJenis] = useState('Semua Jenis');
  const [filterStatus, setFilterStatus] = useState('Semua Status');
  const [selectedStory, setSelectedStory] = useState<KerjasamaStory | null>(null);

  useEffect(() => {
    const sync = () => {
      const disetujui = getPengajuanData().filter((item) => item.status === 'Disetujui');
      setKerjasamaData(disetujui.map(mapPengajuanToStory));
    };
    sync();
    window.addEventListener('pengajuan-data-updated', sync);
    window.addEventListener('story-data-updated', sync);
    return () => {
      window.removeEventListener('pengajuan-data-updated', sync);
      window.removeEventListener('story-data-updated', sync);
    };
  }, []);

  const allAktivitas = kerjasamaData.flatMap((k) => k.aktivitas);
  const totalAktivitas = allAktivitas.length;
  const kerjasamaAktif = kerjasamaData.filter((k) => k.status === 'Aktif').length;
  const now = new Date();
  const bulanIni = allAktivitas.filter((a) => {
    const parts = a.tanggal.split('/');
    const month = Number(parts[1]);
    const year = Number(parts[2]);
    return month === now.getMonth() + 1 && year === now.getFullYear();
  }).length;
  const rataRata = kerjasamaData.length > 0 ? Math.round(totalAktivitas / kerjasamaData.length) : 0;

  const filtered = useMemo(() => {
    return kerjasamaData.filter((k) => {
      const keyword = search.toLowerCase().trim();
      const matchSearch = keyword === '' || k.namaMitra.toLowerCase().includes(keyword) || k.noDokumen.toLowerCase().includes(keyword);
      const matchJenis = filterJenis === 'Semua Jenis' || k.jenis === filterJenis;
      const matchStatus = filterStatus === 'Semua Status' || k.status === filterStatus;
      return matchSearch && matchJenis && matchStatus;
    });
  }, [kerjasamaData, search, filterJenis, filterStatus]);

  if (selectedStory) {
    return <DetailStoryModal story={selectedStory} onBack={() => setSelectedStory(null)} />;
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="page-title">Story & Aktivitas Kerjasama</h1>
        <p className="page-subtitle mt-1">Timeline dan monitoring aktivitas dari setiap kerjasama yang sedang berjalan</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard icon={<Activity size={20} className="text-blue-500" />} iconBg="bg-blue-100" title="Total Aktivitas" value={totalAktivitas} caption="Semua aktivitas tercatat" />
        <StatCard icon={<CalendarCheck size={20} className="text-green-500" />} iconBg="bg-green-100" title="Kerjasama Aktif" value={kerjasamaAktif} caption="Memiliki aktivitas" />
        <StatCard icon={<Calendar size={20} className="text-purple-500" />} iconBg="bg-purple-100" title="Bulan Ini" value={bulanIni} caption="Aktivitas di bulan ini" />
        <StatCard icon={<BookOpen size={20} className="text-orange-500" />} iconBg="bg-orange-100" title="Rata-rata" value={rataRata} caption="Aktivitas per kerjasama" />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700">
            <Filter size={15} />
            Filter:
          </span>

          <select
            value={filterJenis}
            onChange={(e) => setFilterJenis(e.target.value)}
            className="input-field px-3 py-2 text-sm text-gray-700"
          >
            {jenisOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field px-3 py-2 text-sm text-gray-700"
          >
            {statusOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <label className="relative w-full md:max-w-sm md:ml-auto">
          <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari berdasarkan nama mitra..."
            className="input-field h-10 w-full pl-10 pr-3 text-sm text-gray-700 placeholder:text-gray-400"
          />
        </label>
      </div>

      {/* Kerjasama Cards */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-10 text-center text-sm text-gray-500">
            Data tidak ditemukan.
          </div>
        ) : (
          filtered.map((k) => (
            <div key={k.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
              {/* Top row */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-base font-bold text-gray-900">{k.namaMitra}</h3>
                    <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${jenisBadgeMap[k.jenis]}`}>{k.jenis}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {k.noDokumen}
                    <span className="mx-2 text-gray-300">•</span>
                    Berakhir: {k.tanggalBerakhir}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${statusDotMap[k.status]}`} />
                  <span className="text-sm font-medium text-gray-700">{k.status}</span>
                </div>
              </div>

              {/* Meta */}
              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                <span className="inline-flex items-center gap-1">
                  <Activity size={13} />
                  {k.aktivitas.length} Aktivitas
                </span>
                <span className="inline-flex items-center gap-1">
                  <Users size={13} />
                  {k.jurusanTerlibat.length} Jurusan Terlibat
                </span>
                <span className="inline-flex items-center gap-1">
                  <FileText size={13} />
                  {k.ruangLingkup.length} Ruang Lingkup
                </span>

                <button
                  type="button"
                  onClick={() => setSelectedStory(k)}
                  className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-[#1E376C] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#2B4A93]"
                >
                  <Eye size={13} />
                  Lihat Detail & Story
                </button>
              </div>

              {/* Tags */}
              <div className="mt-3 flex flex-wrap gap-2">
                {k.jurusanTerlibat.map((j) => (
                  <span key={j} className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700">
                    {j}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  iconBg,
  title,
  value,
  caption,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  value: number;
  caption: string;
}) {
  return (
    <div className="stat-card flex items-start gap-3 p-4">
      <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500">{title}</p>
        <p className="mt-0.5 text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-[11px] text-gray-400">{caption}</p>
      </div>
    </div>
  );
}
