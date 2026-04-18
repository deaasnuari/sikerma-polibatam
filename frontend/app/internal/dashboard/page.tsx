'use client';

import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  FileText,
  TrendingUp,
} from 'lucide-react';

const summaryCards = [
  {
    title: 'Total Dokumen Kerjasama',
    value: '32',
    icon: FileText,
    accent: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  },
  {
    title: 'Kerjasama Aktif',
    value: '24',
    icon: CheckCircle2,
    accent: 'bg-cyan-50 text-cyan-700 border-cyan-100',
  },
  {
    title: 'Dalam Progres',
    value: '5',
    icon: TrendingUp,
    accent: 'bg-amber-50 text-amber-700 border-amber-100',
  },
  {
    title: 'Pertumbuhan Baru',
    value: '+15',
    icon: BarChart3,
    accent: 'bg-rose-50 text-rose-700 border-rose-100',
  },
];

const kerjasamaItems = [
  { name: 'PT Teknologi Industri', type: 'Magang', status: 'Aktif' },
  { name: 'Universitas Malaysia', type: 'Penelitian', status: 'Diproses' },
  { name: 'PT Inovasi Batam', type: 'Pelatihan', status: 'Aktif' },
];

const unitStats = [
  { label: 'Teknik Informatika', value: '80%' },
  { label: 'Teknik Elektro', value: '72%' },
];

const jenisKerjasama = [
  { label: 'Magang', total: 10 },
  { label: 'MoA', total: 8 },
  { label: 'IA', total: 7 },
];

export default function InternalDashboardPage() {
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.title} className={`rounded-2xl border p-4 shadow-sm ${item.accent}`}>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide">{item.title}</p>
                <Icon size={18} />
              </div>
              <p className="text-3xl font-bold">{item.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Kerjasama Terbaru</h2>
              <p className="text-sm text-slate-500">Daftar kerja sama aktif di unit internal.</p>
            </div>
            <button className="text-sm font-semibold text-teal-700 hover:text-teal-800">Lihat Semua</button>
          </div>

          <div className="space-y-3">
            {kerjasamaItems.map((item) => (
              <div key={item.name} className="flex flex-col gap-3 rounded-xl border border-slate-200 p-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold text-slate-800">{item.name}</p>
                  <p className="text-xs text-slate-500">Jenis: {item.type}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.status === 'Aktif' ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-100 text-sky-700'}`}>
                    {item.status}
                  </span>
                  <button className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                    Detail
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <h2 className="text-base font-bold text-slate-900">Aksi Cepat</h2>
            <div className="mt-3 space-y-3">
              <Link
                href="/internal/data_pengajuan?mode=ajukan"
                className="flex w-full items-center justify-between rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Ajukan Kerjasama Baru
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/internal/data_pengajuan"
                className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Lihat Pengajuan
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-teal-900 p-4 text-white shadow-sm">
            <p className="text-sm font-semibold">Ringkasan Nilai Kerjasama</p>
            <div className="mt-3 grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-lg font-bold">Rp 12.5 M</p>
                <p className="text-[11px] text-slate-300">Total Nilai</p>
              </div>
              <div>
                <p className="text-lg font-bold">Rp 100 Jt</p>
                <p className="text-[11px] text-slate-300">Rata-rata</p>
              </div>
              <div>
                <p className="text-lg font-bold">99</p>
                <p className="text-[11px] text-slate-300">Keberhasilan</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="text-base font-bold text-slate-900">Statistik per Unit</h2>
          <p className="mb-4 text-sm text-slate-500">Distribusi kerjasama berdasarkan unit pelaksana.</p>

          <div className="space-y-4">
            {unitStats.map((item) => (
              <div key={item.label}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-700">{item.label}</span>
                  <span className="text-slate-500">{item.value}</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full w-[72%] rounded-full bg-emerald-500" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="text-base font-bold text-slate-900">Jenis Kerjasama</h2>
          <p className="mb-4 text-sm text-slate-500">Unit berdasarkan jenis dokumen.</p>

          <div className="space-y-3">
            {jenisKerjasama.map((item) => (
              <div key={item.label}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-700">{item.label}</span>
                  <span className="text-slate-500">{item.total}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-slate-700 to-teal-500"
                    style={{ width: `${Math.min(item.total * 9, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
