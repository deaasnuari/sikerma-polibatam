'use client';

import Link from 'next/link';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileCheck,
  FileText,
  Globe,
  Landmark,
  Search,
  Shield,
  Users,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

/* ───────── data ───────── */

const statCards = [
  { label: 'Total Kerjasama Aktif', value: 5, icon: FileCheck, bg: 'bg-[#0F2A44]' },
  { label: 'Kerjasama Tidak Aktif', value: 5, icon: FileText, bg: 'bg-[#0F2A44]' },
  { label: 'Dalam Negeri', value: 8, icon: Globe, bg: 'bg-[#0F2A44]' },
  { label: 'Luar Negeri', value: 2, icon: Landmark, bg: 'bg-[#0F2A44]' },
  { label: 'Total Mitra', value: 10, icon: Users, bg: 'bg-[#0F2A44]' },
];

const trendData = {
  years: [2022, 2023, 2024, 2025, 2026],
  total: [40, 60, 90, 100, 120],
  aktif: [20, 30, 50, 55, 60],
  tidakAktif: [10, 10, 15, 10, 15],
};

const approvalItems = [
  {
    title: 'Kerjasama Riset AI dengan MIT',
    mitra: 'Massachusetts Institute of Technology',
    unit: 'Jurusan Teknik Informatika',
    jenis: 'MoU',
    tanggal: '1/4/2025',
  },
  {
    title: 'Program Magang Industri',
    mitra: 'PT. Astra Honda Motor',
    unit: 'Jurusan Teknik Mesin',
    jenis: 'MoA',
    tanggal: '1/4/2025',
  },
  {
    title: 'Pertukaran Mahasiswa ASEAN',
    mitra: 'Nanyang Polytechnic',
    unit: 'Bagian Kemahasiswaan',
    jenis: 'IA',
    tanggal: '1/4/2025',
  },
];

const kpiCards = [
  { label: 'Kerjasama Aktif', value: 5, icon: CheckCircle2, color: 'text-emerald-500' },
  { label: 'Kerjasama Baru (2026)', value: 12, icon: FileText, color: 'text-blue-500' },
  { label: 'Total Mitra Aktif', value: 10, icon: Users, color: 'text-amber-500' },
  { label: 'Mitra Internasional', value: 2, icon: Globe, color: 'text-purple-500' },
];

const quickActions = [
  { label: 'Approval Pengajuan', desc: '3 pengajuan menunggu', icon: Shield, href: '/pimpinan/daftar_kerjasama' },
  { label: 'Monitoring Status', desc: 'Review masa berlaku dokumen', icon: Clock3, href: '/pimpinan/daftar_kerjasama' },
  { label: 'Lihat Semua Data', desc: 'Database kerjasama lengkap', icon: Search, href: '/pimpinan/daftar_kerjasama' },
];

/* ───────── helpers ───────── */

function formatDate() {
  const d = new Date();
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

/* simple SVG line-chart */
function TrendChart() {
  const { years, total, aktif, tidakAktif } = trendData;
  const maxY = 120;
  const w = 600;
  const h = 220;
  const px = 50;
  const py = 20;
  const cw = w - px * 2;
  const ch = h - py * 2;

  function pts(data: number[]) {
    return data
      .map((v, i) => {
        const x = px + (i / (data.length - 1)) * cw;
        const y = h - py - (v / maxY) * ch;
        return `${x},${y}`;
      })
      .join(' ');
  }

  const gridLines = [0, 30, 60, 90, 120];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="xMidYMid meet">
      {/* grid */}
      {gridLines.map((v) => {
        const y = h - py - (v / maxY) * ch;
        return (
          <g key={v}>
            <line x1={px} y1={y} x2={w - px} y2={y} stroke="#e2e8f0" strokeWidth="1" />
            <text x={px - 8} y={y + 4} textAnchor="end" className="fill-slate-400 text-[10px]">
              {v}
            </text>
          </g>
        );
      })}
      {/* x labels */}
      {years.map((yr, i) => {
        const x = px + (i / (years.length - 1)) * cw;
        return (
          <text key={yr} x={x} y={h - 4} textAnchor="middle" className="fill-slate-500 text-[10px]">
            {yr}
          </text>
        );
      })}
      {/* lines */}
      <polyline points={pts(total)} fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinejoin="round" />
      <polyline points={pts(aktif)} fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinejoin="round" />
      <polyline points={pts(tidakAktif)} fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinejoin="round" />
      {/* dots */}
      {[total, aktif, tidakAktif].map((data, si) => {
        const colors = ['#3B82F6', '#10B981', '#EF4444'];
        return data.map((v, i) => {
          const x = px + (i / (data.length - 1)) * cw;
          const y = h - py - (v / maxY) * ch;
          return <circle key={`${si}-${i}`} cx={x} cy={y} r="4" fill="white" stroke={colors[si]} strokeWidth="2" />;
        });
      })}
    </svg>
  );
}

/* donut chart */
function DonutChart({ dalam, luar }: { dalam: number; luar: number }) {
  const total = dalam + luar;
  const dalamPct = dalam / total;
  const r = 60;
  const circ = 2 * Math.PI * r;

  return (
    <div className="flex items-center justify-center gap-6">
      <svg width="160" height="160" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r={r} fill="none" stroke="#E0F2FE" strokeWidth="20" />
        <circle
          cx="80"
          cy="80"
          r={r}
          fill="none"
          stroke="#0F2A44"
          strokeWidth="20"
          strokeDasharray={`${dalamPct * circ} ${circ}`}
          strokeDashoffset={circ * 0.25}
          strokeLinecap="round"
        />
      </svg>
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#0F2A44]" />
          <span className="text-slate-700">Dalam Negeri: {dalam}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#BAE6FD]" />
          <span className="text-slate-700">Luar Negeri: {luar}</span>
        </div>
      </div>
    </div>
  );
}

/* ───────── page ───────── */

export default function PimpinanPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-5">
      {/* ── Welcome Banner ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0B1D34] to-[#163B6E] px-6 py-6 text-white">
        <div className="relative z-10">
          <h1 className="text-2xl font-bold">Dashboard Eksekutif</h1>
          <p className="mt-1 text-sm text-blue-200">
            Selamat datang, {user?.name || 'Dr. Ir. Ahmad Suryadi, M.T.'}
          </p>
          <p className="text-xs text-blue-300">Direktur — Politeknik Negeri Batam</p>
        </div>
        <div className="absolute top-4 right-6 text-right text-xs text-blue-300">
          <p className="font-semibold text-white text-sm">{formatDate()}</p>
        </div>
        {/* decorative circles */}
        <div className="pointer-events-none absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -right-4 -top-8 h-28 w-28 rounded-full bg-white/5" />
      </div>

      {/* ── Alerts ── */}
      <div className="space-y-3">
        {/* approval alert */}
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <AlertCircle size={18} className="mt-0.5 flex-shrink-0 text-amber-500" />
          <div>
            <p className="text-sm font-bold text-amber-800">Menunggu Persetujuan Anda</p>
            <p className="text-xs text-amber-700">
              Ada <span className="font-bold">3 pengajuan kerjasama</span> yang menunggu approval.{' '}
              <Link href="/pimpinan/daftar_kerjasama" className="font-semibold underline">
                Review sekarang →
              </Link>
            </p>
          </div>
        </div>
        {/* monitoring alert */}
        <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
          <Clock3 size={18} className="mt-0.5 flex-shrink-0 text-blue-500" />
          <div>
            <p className="text-sm font-bold text-blue-800">Monitoring Masa Berlaku</p>
            <p className="text-xs text-blue-700">
              <span className="font-bold">3 dokumen</span> akan berakhir dalam 3 bulan dan{' '}
              <span className="font-bold">2 dokumen</span> sudah kadaluarsa.{' '}
              <Link href="/pimpinan/daftar_kerjasama" className="font-semibold underline">
                Lihat detail →
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {statCards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className={`${c.bg} flex items-center gap-3 rounded-xl px-4 py-4 text-white`}>
              <div>
                <p className="text-2xl font-bold">{c.value}</p>
                <p className="text-[11px] leading-tight text-blue-200">{c.label}</p>
              </div>
              <div className="ml-auto flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                <Icon size={18} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Trend Chart ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-1 text-sm font-bold text-slate-900">✦ Trend Kerjasama 5 Tahun Terakhir</h2>
        <TrendChart />
        <div className="mt-3 flex items-center justify-center gap-5 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-500" /> Total Kerjasama
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" /> Aktif
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" /> Tidak Aktif
          </span>
        </div>
      </div>

      {/* ── Distribution + Approval ── */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* donut */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-bold text-slate-900">Distribusi Kerjasama Berdasarkan Wilayah</h2>
          <DonutChart dalam={8} luar={2} />
        </div>
        {/* approval list */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-bold text-slate-900">✦ Pengajuan Menunggu Approval</h2>
          <div className="space-y-3">
            {approvalItems.map((item) => (
              <div key={item.title} className="flex items-start justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{item.title}</p>
                  <p className="text-xs text-slate-500">{item.mitra}</p>
                  <p className="text-xs text-slate-400">{item.unit}</p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold text-white ${
                      item.jenis === 'MoU'
                        ? 'bg-blue-500'
                        : item.jenis === 'MoA'
                          ? 'bg-emerald-500'
                          : 'bg-amber-500'
                    }`}
                  >
                    {item.jenis}
                  </span>
                  <span className="text-[10px] text-slate-400">{item.tanggal}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── KPI ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-bold text-slate-900">Key Performance Indicators (KPI)</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {kpiCards.map((k) => {
            const Icon = k.icon;
            return (
              <div key={k.label} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
                <Icon size={22} className={k.color} />
                <div>
                  <p className="text-xl font-bold text-slate-900">{k.value}</p>
                  <p className="text-[11px] text-slate-500">{k.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Akses Cepat ── */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0B1D34] to-[#163B6E] p-5 text-white">
        <h2 className="text-base font-bold">Akses Cepat</h2>
        <p className="mb-4 text-xs text-blue-300">Menu utama untuk monitoring dan approval</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {quickActions.map((a) => {
            const Icon = a.icon;
            return (
              <Link
                key={a.label}
                href={a.href}
                className="flex items-start gap-3 rounded-xl bg-white p-4 text-slate-800 transition-shadow hover:shadow-lg"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold">{a.label}</p>
                  <p className="text-xs text-slate-500">{a.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
