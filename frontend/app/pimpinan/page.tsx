'use client';

import Link from 'next/link';
import { ArrowRight, BarChart3, BriefcaseBusiness, Building2, CheckCircle2, Clock3, FileText } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const summaryCards = [
  {
    title: 'Total Kerjasama',
    value: '32',
    icon: FileText,
    accent: 'bg-white border-slate-200 text-slate-900',
    iconStyle: 'bg-slate-100 text-slate-700',
  },
  {
    title: 'Aktif',
    value: '18',
    icon: CheckCircle2,
    accent: 'bg-white border-slate-200 text-slate-900',
    iconStyle: 'bg-emerald-100 text-emerald-600',
  },
  {
    title: 'Dalam Proses',
    value: '7',
    icon: Clock3,
    accent: 'bg-white border-slate-200 text-slate-900',
    iconStyle: 'bg-amber-100 text-amber-600',
  },
  {
    title: 'Unit Terlibat',
    value: '12',
    icon: Building2,
    accent: 'bg-white border-slate-200 text-slate-900',
    iconStyle: 'bg-blue-100 text-blue-600',
  },
];

const recentItems = [
  { title: 'Kerjasama Magang Mahasiswa', status: 'Aktif', type: 'MoU' },
  { title: 'Program Sertifikasi Industri', status: 'Diproses', type: 'MoA' },
  { title: 'Pengembangan Kurikulum Bersama', status: 'Menunggu', type: 'IA' },
];

export default function PimpinanPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Pimpinan</h1>
        <p className="text-sm text-slate-500">Ringkasan strategis kerjasama dan monitoring institusi</p>
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

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Kerjasama Terbaru</h2>
              <p className="text-sm text-slate-500">Ringkasan kerjasama yang perlu perhatian pimpinan.</p>
            </div>
            <Link href="/pimpinan/daftar_kerjasama" className="text-sm font-semibold text-[#102A43] hover:text-[#1A3B5D]">
              Lihat Semua
            </Link>
          </div>

          <div className="space-y-3">
            {recentItems.map((item) => (
              <div key={item.title} className="flex flex-col gap-3 rounded-xl border border-slate-200 p-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold text-slate-800">{item.title}</p>
                  <p className="text-xs text-slate-500">Jenis: {item.type}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.status === 'Aktif' ? 'bg-emerald-100 text-emerald-700' : item.status === 'Diproses' ? 'bg-sky-100 text-sky-700' : 'bg-amber-100 text-amber-700'}`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-base font-bold text-slate-900">Aksi Cepat</h2>
            <div className="mt-3 space-y-3">
              <Link
                href="/pimpinan/daftar_kerjasama"
                className="flex w-full items-center justify-between rounded-xl bg-[#102A43] px-4 py-3 text-sm font-semibold text-white hover:bg-[#1A3B5D]"
              >
                Lihat Daftar Kerjasama
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-[#F8FBFF] p-4 shadow-sm">
            <div className="mb-2 flex items-center gap-2 text-[#102A43]">
              <BriefcaseBusiness size={18} />
              <p className="font-bold">Akun Pimpinan</p>
            </div>
            <p className="text-sm text-slate-600">{user?.name || 'Pimpinan'} • {user?.email || '-'}</p>
            <div className="mt-4 rounded-lg bg-white px-3 py-2 text-xs text-slate-500">
              Akses ini dipakai untuk pemantauan, evaluasi, dan pengambilan keputusan.
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2 text-slate-800">
          <BarChart3 size={18} />
          <p className="font-bold">Ringkasan Monitoring</p>
        </div>
        <p className="text-sm text-slate-600">
          Halaman pimpinan sekarang sudah menggunakan navbar dan footer yang sama seperti admin, dengan sidebar khusus pimpinan dan tampilan monitoring yang lebih ringkas.
        </p>
      </div>
    </div>
  );
}
