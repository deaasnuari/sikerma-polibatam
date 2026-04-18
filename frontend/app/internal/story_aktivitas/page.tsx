'use client';

import { useMemo, useState } from 'react';
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

// ── Data ───────────────────────────────────────────────

const kerjasamaData: KerjasamaStory[] = [
  {
    id: '1',
    namaMitra: 'BADAN PENGUSAHAAN BATAM',
    noDokumen: '000/MOA.PL29/2025',
    jenis: 'MoA',
    status: 'Aktif',
    tanggalMulai: '01/01/2025',
    tanggalBerakhir: '01/01/2028',
    kategoriMitra: 'Dalam Negeri',
    alamat: 'Batam, Kepulauan Riau',
    email: 'info@bp-batam.go.id',
    telepon: '+6281234578',
    sisaWaktu: '20 Bulan',
    ruangLingkup: ['Penelitian', 'Pengabdian Masyarakat'],
    jurusanTerlibat: ['Teknik Informatika', 'Manajemen Bisnis'],
    aktivitas: [
      {
        id: 'a1',
        judul: 'Pengabdian Masyarakat - Pelatihan UMKM',
        tanggal: '20/05/2025',
        peserta: 80,
        deskripsi: 'Pelatihan digitalisasi UMKM untuk pelaku usaha di Batam',
        picPolibatam: 'Drs. Bambang Suryono',
        picMitra: 'Bapak Hendi (BP Batam)',
        status: 'direncanakan',
      },
      {
        id: 'a2',
        judul: 'Penelitian Smart City Batam',
        tanggal: '01/03/2025',
        peserta: 12,
        deskripsi: 'Penelitian kolaboratif tentang implementasi teknologi smart city di Batam',
        picPolibatam: 'Prof. Siti Nurhaliza',
        picMitra: 'Ibu Rina Kartika (BP Batam)',
        status: 'berlangsung',
      },
      {
        id: 'a3',
        judul: 'Workshop Kewirausahaan Digital',
        tanggal: '15/02/2025',
        peserta: 45,
        deskripsi: 'Workshop tentang pengembangan bisnis digital untuk mahasiswa Manajemen Bisnis',
        picPolibatam: 'Dr. Ahmad Wijaya',
        picMitra: 'Bapak Suryanto (BP Batam)',
        status: 'selesai',
      },
    ],
  },
  {
    id: '2',
    namaMitra: 'PT Feen Marine',
    noDokumen: '000/MOU.PL27/2025',
    jenis: 'MoU',
    status: 'Akan Berakhir',
    tanggalMulai: '01/01/2025',
    tanggalBerakhir: '10/05/2026',
    kategoriMitra: 'Dalam Negeri',
    alamat: 'Batam, Kepulauan Riau',
    email: 'info@feenmarine.com',
    telepon: '+6281298765432',
    sisaWaktu: '1 Bulan',
    ruangLingkup: ['Magang', 'Rekrutmen'],
    jurusanTerlibat: ['Teknik Mesin'],
    aktivitas: [],
  },
];

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
  const [search, setSearch] = useState('');
  const [filterJenis, setFilterJenis] = useState('Semua Jenis');
  const [filterStatus, setFilterStatus] = useState('Semua Status');
  const [selectedStory, setSelectedStory] = useState<KerjasamaStory | null>(null);

  const allAktivitas = kerjasamaData.flatMap((k) => k.aktivitas);
  const totalAktivitas = allAktivitas.length;
  const kerjasamaAktif = kerjasamaData.filter((k) => k.status === 'Aktif').length;
  const bulanIni = allAktivitas.filter((a) => {
    const parts = a.tanggal.split('/');
    const month = Number(parts[1]);
    const year = Number(parts[2]);
    const now = new Date();
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
  }, [search, filterJenis, filterStatus]);

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
