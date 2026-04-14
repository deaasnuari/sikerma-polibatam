'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  FileEdit,
  Download,
  MapPin,
  Mail,
  Phone,
  Clock,
  Activity,
  CheckCircle,
  Timer,
  CalendarClock,
  Plus,
  Pencil,
  Trash2,
  Users,
  Calendar,
  ChevronDown,
} from 'lucide-react';

interface AktivitasItem {
  id: number;
  judul: string;
  jenisAktivitas: string;
  tanggal: string;
  peserta: number;
  deskripsi: string;
  picPolibatam: string;
  picMitra: string;
  status: 'direncanakan' | 'berlangsung' | 'selesai';
}

interface DetailKerjasama {
  id: number;
  nama: string;
  nomorDokumen: string;
  jenisDokumen: 'MoA' | 'MoU' | 'IA';
  kategoriMitra: string;
  tanggalMulai: string;
  tanggalBerakhir: string;
  status: 'Aktif' | 'Akan Berakhir' | 'Kadaluarsa';
  alamat: string;
  email: string;
  telepon: string;
  masaBerlaku: string;
  ruangLingkup: string[];
  jurusanTerlibat: string[];
  totalAktivitas: number;
  selesai: number;
  berlangsung: number;
  direncanakan: number;
  aktivitas: AktivitasItem[];
}

const dummyDetail: Record<string, DetailKerjasama> = {
  '1': {
    id: 1,
    nama: 'BADAN PENGUSAHAAN BATAM',
    nomorDokumen: '000/MOA.PL.29/2025',
    jenisDokumen: 'MoA',
    kategoriMitra: 'Dalam Negeri',
    tanggalMulai: '01/01/2025',
    tanggalBerakhir: '01/01/2028',
    status: 'Aktif',
    alamat: 'Batam, Kepulauan Riau',
    email: 'info@bp-batam.go.id',
    telepon: '+6281234567890',
    masaBerlaku: '20 Bulan',
    ruangLingkup: ['Penelitian', 'Pengabdian Masyarakat'],
    jurusanTerlibat: ['Teknik Informatika', 'Manajemen Bisnis'],
    totalAktivitas: 8,
    selesai: 5,
    berlangsung: 2,
    direncanakan: 6,
    aktivitas: [
      {
        id: 1,
        judul: 'Pengabdian Masyarakat - Pelatihan UMKM',
        jenisAktivitas: 'Pengabdian Masyarakat',
        tanggal: '20/05/2025',
        peserta: 80,
        deskripsi: 'Pelatihan digitalisasi UMKM untuk pelaku usaha di Batam',
        picPolibatam: 'Drs. Bambang Suryono',
        picMitra: 'Bapak Hendri (BP Batam)',
        status: 'direncanakan',
      },
      {
        id: 2,
        judul: 'Penelitian Smart City Batam',
        jenisAktivitas: 'Penelitian',
        tanggal: '01/03/2025',
        peserta: 12,
        deskripsi: 'Penelitian kolaboratif tentang implementasi teknologi smart city di Batam',
        picPolibatam: 'Prof. Siti Nurhaliza',
        picMitra: 'Ibu Rina Kartika (BP Batam)',
        status: 'berlangsung',
      },
      {
        id: 3,
        judul: 'Workshop Kewirausahaan Digital',
        jenisAktivitas: 'Workshop',
        tanggal: '15/02/2025',
        peserta: 45,
        deskripsi: 'Workshop tentang pengembangan bisnis digital untuk mahasiswa Manajemen Bisnis',
        picPolibatam: 'Dr. Ahmad Wijaya',
        picMitra: 'Bapak Suryanto (BP Batam)',
        status: 'selesai',
      },
    ],
  },
  '2': {
    id: 2,
    nama: 'BADAN PENGUSAHAAN BATAM',
    nomorDokumen: '000/MOA.PL.29/2025',
    jenisDokumen: 'MoU',
    kategoriMitra: 'Dalam Negeri',
    tanggalMulai: '01/01/2025',
    tanggalBerakhir: '01/01/2028',
    status: 'Akan Berakhir',
    alamat: 'Batam, Kepulauan Riau',
    email: 'info@bp-batam.go.id',
    telepon: '+6281234567890',
    masaBerlaku: '5 Bulan',
    ruangLingkup: ['Pendidikan', 'Magang'],
    jurusanTerlibat: ['Teknik Informatika', 'Manajemen Bisnis'],
    totalAktivitas: 3,
    selesai: 2,
    berlangsung: 1,
    direncanakan: 0,
    aktivitas: [
      {
        id: 1,
        judul: 'Program Magang Industri',
        jenisAktivitas: 'Magang',
        tanggal: '10/01/2025',
        peserta: 20,
        deskripsi: 'Program magang mahasiswa di BP Batam',
        picPolibatam: 'Dr. Andi Setiawan',
        picMitra: 'Bapak Rizal (BP Batam)',
        status: 'selesai',
      },
      {
        id: 2,
        judul: 'Seminar Ekonomi Digital',
        jenisAktivitas: 'Seminar',
        tanggal: '05/03/2025',
        peserta: 100,
        deskripsi: 'Seminar bersama tentang ekonomi digital di Batam',
        picPolibatam: 'Prof. Maya Sari',
        picMitra: 'Ibu Dewi (BP Batam)',
        status: 'berlangsung',
      },
      {
        id: 3,
        judul: 'Pelatihan Sertifikasi',
        jenisAktivitas: 'Pelatihan',
        tanggal: '20/02/2025',
        peserta: 30,
        deskripsi: 'Pelatihan sertifikasi kompetensi',
        picPolibatam: 'Ir. Budi Santoso',
        picMitra: 'Bapak Eko (BP Batam)',
        status: 'selesai',
      },
    ],
  },
  '3': {
    id: 3,
    nama: 'PT. BATAMINDO INVESTMENT CAKRAWALA',
    nomorDokumen: '001/MOA.PL.30/2025',
    jenisDokumen: 'MoA',
    kategoriMitra: 'Dalam Negeri',
    tanggalMulai: '15/03/2025',
    tanggalBerakhir: '20/12/2027',
    status: 'Aktif',
    alamat: 'Muka Kuning, Batam, Kepulauan Riau',
    email: 'info@batamindo.co.id',
    telepon: '+6277812345678',
    masaBerlaku: '32 Bulan',
    ruangLingkup: ['Magang', 'Penelitian', 'Pelatihan', 'Sertifikasi'],
    jurusanTerlibat: ['Teknik Informatika', 'Teknik Elektro', 'Manajemen Bisnis'],
    totalAktivitas: 3,
    selesai: 1,
    berlangsung: 1,
    direncanakan: 1,
    aktivitas: [
      {
        id: 1,
        judul: 'Program Magang Industri Semester Ganjil',
        jenisAktivitas: 'Magang',
        tanggal: '01/09/2025',
        peserta: 30,
        deskripsi: 'Program magang mahasiswa TI dan TE di kawasan industri Batamindo',
        picPolibatam: 'Dr. Rudi Hartono',
        picMitra: 'Ibu Linda (PT. BIC)',
        status: 'direncanakan',
      },
      {
        id: 2,
        judul: 'Penelitian Automasi Industri',
        jenisAktivitas: 'Penelitian',
        tanggal: '10/04/2025',
        peserta: 8,
        deskripsi: 'Penelitian kolaboratif tentang automasi lini produksi',
        picPolibatam: 'Prof. Hendra Wijaya',
        picMitra: 'Bapak Tono (PT. BIC)',
        status: 'berlangsung',
      },
      {
        id: 3,
        judul: 'Pelatihan K3 Industri',
        jenisAktivitas: 'Pelatihan',
        tanggal: '20/03/2025',
        peserta: 50,
        deskripsi: 'Pelatihan Keselamatan dan Kesehatan Kerja bersama PT. BIC',
        picPolibatam: 'Ir. Santi Dewi',
        picMitra: 'Bapak Agus (PT. BIC)',
        status: 'selesai',
      },
    ],
  },
  '4': {
    id: 4,
    nama: 'UNIVERSITAS TEKNOLOGI MALAYSIA',
    nomorDokumen: '002/MOU.PL.10/2024',
    jenisDokumen: 'MoU',
    kategoriMitra: 'Luar Negeri',
    tanggalMulai: '01/03/2024',
    tanggalBerakhir: '01/03/2026',
    status: 'Akan Berakhir',
    alamat: 'Johor Bahru, Malaysia',
    email: 'international@utm.my',
    telepon: '+607-5530000',
    masaBerlaku: '3 Bulan',
    ruangLingkup: ['Penelitian', 'Pertukaran Mahasiswa'],
    jurusanTerlibat: ['Teknik Informatika'],
    totalAktivitas: 5,
    selesai: 3,
    berlangsung: 2,
    direncanakan: 0,
    aktivitas: [
      {
        id: 1,
        judul: 'Joint Research IoT & Smart Campus',
        jenisAktivitas: 'Penelitian',
        tanggal: '15/05/2024',
        peserta: 10,
        deskripsi: 'Penelitian kolaboratif bidang IoT untuk smart campus antara Polibatam dan UTM',
        picPolibatam: 'Prof. Siti Nurhaliza',
        picMitra: 'Dr. Ahmad Faiz (UTM)',
        status: 'selesai',
      },
      {
        id: 2,
        judul: 'Student Exchange Program Batch 1',
        jenisAktivitas: 'Pertukaran Mahasiswa',
        tanggal: '01/09/2024',
        peserta: 15,
        deskripsi: 'Program pertukaran mahasiswa TI ke UTM selama 1 semester',
        picPolibatam: 'Dr. Andi Setiawan',
        picMitra: 'Prof. Razali (UTM)',
        status: 'selesai',
      },
      {
        id: 3,
        judul: 'International Seminar on AI',
        jenisAktivitas: 'Seminar',
        tanggal: '20/11/2024',
        peserta: 200,
        deskripsi: 'Seminar internasional tentang perkembangan Artificial Intelligence',
        picPolibatam: 'Dr. Ahmad Wijaya',
        picMitra: 'Dr. Nurul (UTM)',
        status: 'selesai',
      },
      {
        id: 4,
        judul: 'Joint Publication Program',
        jenisAktivitas: 'Penelitian',
        tanggal: '10/01/2025',
        peserta: 6,
        deskripsi: 'Program publikasi jurnal bersama di bidang computer science',
        picPolibatam: 'Prof. Siti Nurhaliza',
        picMitra: 'Dr. Ahmad Faiz (UTM)',
        status: 'berlangsung',
      },
      {
        id: 5,
        judul: 'Student Exchange Program Batch 2',
        jenisAktivitas: 'Pertukaran Mahasiswa',
        tanggal: '01/02/2025',
        peserta: 12,
        deskripsi: 'Program pertukaran mahasiswa TI ke UTM batch kedua',
        picPolibatam: 'Dr. Andi Setiawan',
        picMitra: 'Prof. Razali (UTM)',
        status: 'berlangsung',
      },
    ],
  },
  '5': {
    id: 5,
    nama: 'CITY GLASGOW COLLEGE',
    nomorDokumen: '003/IA.PL.05/2024',
    jenisDokumen: 'IA',
    kategoriMitra: 'Luar Negeri',
    tanggalMulai: '10/06/2024',
    tanggalBerakhir: '10/06/2027',
    status: 'Aktif',
    alamat: 'Glasgow, Scotland, United Kingdom',
    email: 'international@cityofglasgowcollege.ac.uk',
    telepon: '+44-141-566-3333',
    masaBerlaku: '26 Bulan',
    ruangLingkup: ['Pertukaran Dosen', 'Workshop', 'Sertifikasi'],
    jurusanTerlibat: ['Teknik Informatika', 'Teknik Elektro'],
    totalAktivitas: 2,
    selesai: 1,
    berlangsung: 0,
    direncanakan: 1,
    aktivitas: [
      {
        id: 1,
        judul: 'International Workshop on Renewable Energy',
        jenisAktivitas: 'Workshop',
        tanggal: '15/09/2024',
        peserta: 35,
        deskripsi: 'Workshop internasional tentang energi terbarukan bersama City Glasgow College',
        picPolibatam: 'Dr. Hendra Wijaya',
        picMitra: 'Prof. James McAllister (CGC)',
        status: 'selesai',
      },
      {
        id: 2,
        judul: 'Lecturer Exchange Program 2025',
        jenisAktivitas: 'Pertukaran Dosen',
        tanggal: '01/08/2025',
        peserta: 4,
        deskripsi: 'Program pertukaran dosen bidang Teknik Elektro dan Informatika',
        picPolibatam: 'Prof. Siti Nurhaliza',
        picMitra: 'Dr. Sarah Campbell (CGC)',
        status: 'direncanakan',
      },
    ],
  },
};

const statusAktivitasColor: Record<string, { bg: string; text: string; icon: string }> = {
  direncanakan: { bg: 'bg-orange-50', text: 'text-orange-600', icon: 'bg-orange-100' },
  berlangsung: { bg: 'bg-green-50', text: 'text-green-600', icon: 'bg-green-100' },
  selesai: { bg: 'bg-blue-50', text: 'text-blue-600', icon: 'bg-blue-100' },
};

const statusKerjasamaColor: Record<string, { dot: string; text: string }> = {
  Aktif: { dot: 'bg-green-500', text: 'text-green-700' },
  'Akan Berakhir': { dot: 'bg-yellow-400', text: 'text-yellow-700' },
  Kadaluarsa: { dot: 'bg-red-500', text: 'text-red-700' },
};

const jenisColor: Record<string, string> = {
  MoA: 'border-blue-500 text-blue-700 bg-blue-50',
  MoU: 'border-purple-500 text-purple-700 bg-purple-50',
  IA: 'border-orange-500 text-orange-700 bg-orange-50',
};

const jenisAktivitasOptions = [
  'Workshop',
  'Seminar',
  'Penelitian',
  'Pengabdian Masyarakat',
  'Magang',
  'Pelatihan',
  'Sertifikasi',
  'Pertukaran Mahasiswa',
  'Pertukaran Dosen',
  'Lainnya',
];

export default function DetailStoryPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const data = dummyDetail[id];

  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    judul: '',
    jenisAktivitas: '',
    tanggal: '',
    peserta: 0,
    status: 'direncanakan' as 'direncanakan' | 'berlangsung' | 'selesai',
    picPolibatam: '',
    picMitra: '',
    deskripsi: '',
  });

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'peserta' ? Number(value) : value,
    }));
  };

  const handleSubmit = () => {
    console.log('Submit:', formData);
    setShowAddForm(false);
    setFormData({
      judul: '',
      jenisAktivitas: '',
      tanggal: '',
      peserta: 0,
      status: 'direncanakan',
      picPolibatam: '',
      picMitra: '',
      deskripsi: '',
    });
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setFormData({
      judul: '',
      jenisAktivitas: '',
      tanggal: '',
      peserta: 0,
      status: 'direncanakan',
      picPolibatam: '',
      picMitra: '',
      deskripsi: '',
    });
  };

  if (!data) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={18} />
          Kembali
        </button>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center text-gray-400">
          Data tidak ditemukan
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
        >
          <ArrowLeft size={18} />
          Kembali
        </button>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium">
            <FileEdit size={15} />
            Edit Dokumen
          </button>
          <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            <Download size={15} />
            Download
          </button>
        </div>
      </div>

      {/* Header Card */}
      <div className="bg-[#0e1d34] rounded-xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{data.nama}</h1>
            <p className="text-sm text-blue-200 mt-1">
              No. Dokumen: {data.nomorDokumen}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${statusKerjasamaColor[data.status].dot}`} />
            <span className="text-sm font-semibold">{data.status}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
          <div>
            <p className="text-xs text-blue-300">Jenis Dokumen</p>
            <span className={`inline-block mt-1 text-xs font-semibold px-3 py-1 rounded-full border ${jenisColor[data.jenisDokumen]}`}>
              {data.jenisDokumen}
            </span>
          </div>
          <div>
            <p className="text-xs text-blue-300">Kategori Mitra</p>
            <p className="font-semibold mt-1">{data.kategoriMitra}</p>
          </div>
          <div>
            <p className="text-xs text-blue-300">Tanggal Mulai</p>
            <p className="font-semibold mt-1">{data.tanggalMulai}</p>
          </div>
          <div>
            <p className="text-xs text-blue-300">Tanggal Berakhir</p>
            <p className="font-semibold mt-1">{data.tanggalBerakhir}</p>
          </div>
        </div>
      </div>

      {/* Info Mitra & Status */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-3">
              <MapPin size={16} className="text-gray-500" />
              Informasi Mitra
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p className="flex items-center gap-2">
                <MapPin size={14} className="text-gray-400" />
                {data.alamat}
              </p>
              <p className="flex items-center gap-2">
                <Mail size={14} className="text-gray-400" />
                {data.email}
              </p>
              <p className="flex items-center gap-2">
                <Phone size={14} className="text-gray-400" />
                {data.telepon}
              </p>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-3">
              <Clock size={16} className="text-gray-500" />
              Status Masa Berlaku
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock size={14} className="text-gray-400" />
              <span>Waktu:</span>
              <span className="text-green-600 font-bold text-lg">{data.masaBerlaku}</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6 pt-6 border-t border-gray-100">
          <div>
            <h4 className="font-bold text-gray-900 text-sm mb-2">Ruang Lingkup Kerjasama</h4>
            <div className="flex flex-wrap gap-2">
              {data.ruangLingkup.map((r) => (
                <span key={r} className="bg-green-50 text-green-700 border border-green-200 text-xs font-medium px-3 py-1 rounded-full">
                  {r}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-sm mb-2">Jurusan Terlibat</h4>
            <div className="flex flex-wrap gap-2">
              {data.jurusanTerlibat.map((j) => (
                <span key={j} className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-medium px-3 py-1 rounded-full">
                  {j}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Statistik Aktivitas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Aktivitas</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{data.totalAktivitas}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <Activity size={20} className="text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Selesai</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{data.selesai}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
            <CheckCircle size={20} className="text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Berlangsung</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{data.berlangsung}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
            <Timer size={20} className="text-purple-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Direncanakan</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{data.direncanakan}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
            <CalendarClock size={20} className="text-orange-600" />
          </div>
        </div>
      </div>

      {/* Story Kerjasama & Aktivitas */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            📋 Story Kerjasama & Aktivitas
          </h2>
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
            >
              <Plus size={15} />
              Tambah Aktivitas
            </button>
          )}
        </div>

        {/* Add Aktivitas Form (inline card) */}
        {showAddForm && (
          <div className="border border-gray-200 rounded-xl p-6 mb-6 bg-gray-50/50">
            <h3 className="text-lg font-bold text-gray-900 mb-5">
              Tambah Aktivitas Baru
            </h3>

            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Judul Aktivitas <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="judul"
                    value={formData.judul}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    placeholder="Contoh: Workshop Teknologi AI"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Jenis Aktivitas <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="jenisAktivitas"
                      value={formData.jenisAktivitas}
                      onChange={handleFormChange}
                      className="appearance-none w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="">Pilih Jenis</option>
                      {jenisAktivitasOptions.map((j) => (
                        <option key={j} value={j}>{j}</option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Tanggal <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="tanggal"
                    value={formData.tanggal}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Jumlah Peserta
                  </label>
                  <input
                    type="number"
                    name="peserta"
                    value={formData.peserta}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    placeholder="0"
                    min={0}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleFormChange}
                      className="appearance-none w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="direncanakan">Direncanakan</option>
                      <option value="berlangsung">Berlangsung</option>
                      <option value="selesai">Selesai</option>
                    </select>
                    <ChevronDown
                      size={14}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    PIC Polibatam <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="picPolibatam"
                    value={formData.picPolibatam}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    placeholder="Nama dosen/staff"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    PIC Mitra
                  </label>
                  <input
                    type="text"
                    name="picMitra"
                    value={formData.picMitra}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    placeholder="Nama PIC dari mitra"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Deskripsi Aktivitas
                </label>
                <textarea
                  name="deskripsi"
                  rows={3}
                  value={formData.deskripsi}
                  onChange={handleFormChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y bg-white"
                  placeholder="Jelaskan detail aktivitas..."
                />
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={handleSubmit}
                  className="bg-[#0e1d34] hover:bg-[#1a2d4a] text-white text-sm font-medium px-5 py-2.5 rounded-lg transition"
                >
                  Simpan Aktivitas
                </button>
                <button
                  onClick={handleCancel}
                  className="border border-gray-300 text-gray-700 text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-gray-50 transition"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Aktivitas List */}
        <div className="space-y-4">
          {data.aktivitas.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              Belum ada aktivitas tercatat
            </div>
          )}

          {data.aktivitas.map((item) => {
            const sc = statusAktivitasColor[item.status];
            return (
              <div
                key={item.id}
                className="border border-gray-100 rounded-xl p-5 flex gap-4"
              >
                <div className={`w-11 h-11 rounded-full ${sc.icon} flex items-center justify-center shrink-0 mt-0.5`}>
                  {item.status === 'direncanakan' && <CalendarClock size={20} className="text-orange-500" />}
                  {item.status === 'berlangsung' && <Timer size={20} className="text-green-500" />}
                  {item.status === 'selesai' && <CheckCircle size={20} className="text-blue-500" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-gray-900">{item.judul}</h4>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {item.tanggal}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users size={12} />
                          {item.peserta} peserta
                        </span>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${sc.bg} ${sc.text} shrink-0`}>
                      {item.status}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mt-2">{item.deskripsi}</p>

                  <div className="mt-2 text-xs text-gray-500 space-y-0.5">
                    <p>
                      <span className="font-medium text-gray-700">PIC Polibatam:</span>{' '}
                      {item.picPolibatam}
                    </p>
                    <p>
                      <span className="font-medium text-gray-700">PIC Mitra:</span>{' '}
                      {item.picMitra}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2 shrink-0">
                  <button className="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center justify-center transition">
                    <Pencil size={14} className="text-blue-600" />
                  </button>
                  <button className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition">
                    <Trash2 size={14} className="text-red-600" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}