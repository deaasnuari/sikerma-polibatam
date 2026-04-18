'use client';

import Link from 'next/link';
import {
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Clock3,
  FileBadge2,
  FolderOpen,
  Plus,
  UserRound,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const summaryCards = [
  {
    title: 'Total Kerjasama',
    value: '8',
    icon: FileBadge2,
    accent: 'border-slate-200 bg-white text-slate-900',
    iconStyle: 'bg-orange-100 text-orange-600',
  },
  {
    title: 'Aktif',
    value: '5',
    icon: CheckCircle2,
    accent: 'border-slate-200 bg-white text-slate-900',
    iconStyle: 'bg-emerald-100 text-emerald-600',
  },
  {
    title: 'Dalam Proses',
    value: '2',
    icon: Clock3,
    accent: 'border-slate-200 bg-white text-slate-900',
    iconStyle: 'bg-amber-100 text-amber-600',
  },
  {
    title: 'Unit Terlibat',
    value: '6',
    icon: Building2,
    accent: 'border-slate-200 bg-white text-slate-900',
    iconStyle: 'bg-blue-100 text-blue-600',
  },
];

const kerjasamaItems = [
  {
    title: 'Kerjasama Magang Mahasiswa',
    badge: 'Aktif',
    badgeClass: 'bg-emerald-500 text-white',
    jenis: 'MoU',
    unit: 'Teknik Informatika',
    mulai: '20 Jan 2026',
    berakhir: '20 Jan 2028',
  },
  {
    title: 'Program Sertifikasi Industri',
    badge: 'Aktif',
    badgeClass: 'bg-emerald-500 text-white',
    jenis: 'MoA',
    unit: 'Teknik Mesin',
    mulai: '10 Des 2025',
    berakhir: '10 Des 2027',
  },
  {
    title: 'Kerjasama Magang Mahasiswa',
    badge: 'Menunggu',
    badgeClass: 'bg-amber-400 text-white',
    jenis: 'MoA',
    unit: 'Jurusan Teknik',
    mulai: '23 Feb 2026',
    berakhir: '-',
  },
];

export default function EksternalPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Mitra Eksternal</h1>
        <p className="text-sm text-slate-500">Kelola kerjasama dengan Politeknik Negeri Batam</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.title} className={`rounded-2xl border p-4 shadow-sm ${item.accent}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.title}</p>
                  <p className="mt-3 text-3xl font-bold text-slate-900">{item.value}</p>
                </div>
                <div className={`flex h-8 w-8 items-center justify-center rounded-md ${item.iconStyle}`}>
                  <Icon size={16} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Kerjasama Anda</h2>
            <p className="text-sm text-slate-500">Daftar kerjasama dengan institusi</p>
          </div>
          <Link
            href="/eksternal/daftar_kerjasama"
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Lihat Semua
          </Link>
        </div>

        <div className="space-y-3">
          {kerjasamaItems.map((item) => (
            <div key={`${item.title}-${item.mulai}`} className="rounded-xl border border-slate-200 p-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-800">{item.title}</p>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${item.badgeClass}`}>
                      {item.badge}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-500">
                    <span className="rounded-full border border-slate-200 px-2 py-0.5">{item.jenis}</span>
                    <span className="rounded-full border border-slate-200 px-2 py-0.5">{item.unit}</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">Tanggal Mulai: {item.mulai}</p>
                  <p className="text-xs text-slate-500">Berlaku Hingga: {item.berakhir}</p>
                </div>

                <Link href="/eksternal/daftar_kerjasama" className="text-xs font-semibold text-slate-700 hover:text-slate-900">
                  Detail
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2 text-orange-600">
            <BriefcaseBusiness size={18} />
            <p className="text-sm font-bold text-slate-900">Ajukan Kerjasama Baru</p>
          </div>
          <p className="mb-4 text-sm text-slate-500">Buat proposal kerjasama dengan institusi</p>
          <Link
            href="/eksternal/pengajuan_baru"
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <Plus size={15} />
            Buat Pengajuan
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2 text-blue-600">
            <UserRound size={18} />
            <p className="text-sm font-bold text-slate-900">Profil Mitra</p>
          </div>
          <p className="text-sm text-slate-500">Lihat dan update informasi mitra</p>
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
            {user?.name || 'Mitra Eksternal'} • {user?.email || '-'}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-[#F8FBFF] p-4 shadow-sm">
        <div className="flex items-center gap-2 text-[#0A2A66]">
          <FolderOpen size={18} />
          <p className="font-bold">Ringkasan Akses Mitra</p>
        </div>
        <p className="mt-2 text-sm text-slate-600">
          Area eksternal memakai navbar dan footer yang sama seperti admin, dengan sidebar khusus mitra eksternal dan warna portal yang berbeda.
        </p>
      </div>
    </div>
  );
}
