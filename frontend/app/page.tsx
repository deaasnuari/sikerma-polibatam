'use client';

import { useState } from 'react';
import AdminNavbar from '@/components/admin/AdminNavbar';
import AdminFooter from '@/components/admin/AdminFooter';

// ─── Data ─────────────────────────────────────────────────────────────────────

const heroStats = [
  { value: '154', label: 'Dudi\nNasional' },
  { value: '7',   label: 'Dudi\nInterasional' },
  { value: '292', label: 'Instansi\nNasional' },
  { value: '24',  label: 'Instansi\nInternasional' },
];

const tableData = [
  { nama: 'Koperasi Politeknik Negeri Batam',                                    bidang: 'Pendidikan, layanan',                                                     unit: 'Unit Kerjasama' },
  { nama: 'PT. Batamindo Investment Cakrawala',                                   bidang: 'Pendidikan',                                                              unit: 'Unit Kerjasama' },
  { nama: 'Koperasi Polibatam',                                                   bidang: 'Pendidikan, layanan',                                                     unit: 'Unit Kerjasama' },
  { nama: 'PT. Yogya Presisi Thenikatama Industri',                               bidang: 'Magang, pendidikan, penelitian',                                          unit: 'Unit Kerjasama' },
  { nama: 'PT. Fast Precision Manufacturing Indonesia',                            bidang: 'Magang, pendidikan, penelitian',                                          unit: 'Unit Kerjasama' },
  { nama: 'City Glasgow College',                                                  bidang: 'Pendidikan',                                                              unit: 'Unit Kerjasama' },
  { nama: 'PT. Indina Industri Indonesia',                                         bidang: 'Magang, pendidikan',                                                     unit: 'Unit Kerjasama' },
  { nama: 'Perpustakaan Kantor Perwakilan Bank Indonesia Provinsi Kepulauan Riau', bidang: 'Magang, pendidikan, penelitian pengembangan kelembagaan',                 unit: 'Unit Kerjasama' },
  { nama: 'Badan Informasi Geospasial',                                            bidang: 'Penelitian, pengabdian kepada masyarakat, pengembangan kelembagaan',     unit: 'Unit Kerjasama' },
  { nama: 'Aerocampus Aquitaine',                                                  bidang: 'Pendidikan, penelitian',                                                 unit: 'Unit Kerjasama' },
];

const TOTAL_ENTRIES = 478;
const TOTAL_PAGES   = 48;
const PER_PAGE      = 10;

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Document-style SVG icon used in summary strip */
function DocIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 6h18l8 8v22H8V6z" stroke="#1e376c" strokeWidth="2" />
      <path d="M26 6v8h8"           stroke="#1e376c" strokeWidth="2" />
      <path d="M13 18h16M13 23h16M13 28h10" stroke="#1e376c" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** Doc icon with a small pencil badge (Total Kerjasama) */
function DocEditIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 6h18l8 8v22H8V6z" stroke="#1e376c" strokeWidth="2" />
      <path d="M26 6v8h8"           stroke="#1e376c" strokeWidth="2" />
      <path d="M13 18h16M13 23h16M13 28h10" stroke="#1e376c" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="10" cy="33" r="6" fill="#1e376c" />
      <path d="M8 33h4M10 31v4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** Menu icon for detail button */
function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="white" width={16} height={16}>
      <path d="M3 9h14V7H3v2zm0 4h14v-2H3v2zm0 4h14v-2H3v2zm16 0h2v-2h-2v2zm0-10v2h2V7h-2zm0 6h2v-2h-2v2z" />
    </svg>
  );
}

/** SVG Pie Chart */
function PieChart({ size, segments }: { size: number; segments: { value: number; color: string }[] }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 2;

  let startAngle = -Math.PI / 2; // start from top

  function describeArc(start: number, end: number) {
    const x1 = cx + r * Math.cos(start);
    const y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end);
    const y2 = cy + r * Math.sin(end);
    const largeArc = end - start > Math.PI ? 1 : 0;
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  }

  const paths = segments.map((seg) => {
    const angle = (seg.value / total) * 2 * Math.PI;
    const endAngle = startAngle + angle;
    const d = describeArc(startAngle, endAngle);
    startAngle = endAngle;
    return { d, color: seg.color };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {paths.map((p, i) => (
        <path key={i} d={p.d} fill={p.color} stroke="white" strokeWidth="1.5" />
      ))}
    </svg>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Home() {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');

  // ── Table logic ──────────────────────────────────────────────────────────────
  const filtered = tableData.filter(
    (r) =>
      r.nama.toLowerCase().includes(search.toLowerCase()) ||
      r.bidang.toLowerCase().includes(search.toLowerCase()),
  );

  const startIndex = (currentPage - 1) * PER_PAGE;
  const endIndex   = Math.min(currentPage * PER_PAGE, TOTAL_ENTRIES);

  const changePage = (delta: number) => {
    const next = currentPage + delta;
    if (next < 1 || next > TOTAL_PAGES) return;
    setCurrentPage(next);
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <main className="bg-gradient-to-b from-slate-50 to-white font-sans text-slate-800">
      <div className="sticky top-0 z-50">
        <AdminNavbar isPublic />
      </div>

      {/* ── HERO ── */}
      <section
        id="beranda"
        className="relative overflow-hidden"
        style={{
          backgroundImage: "url('/polibatam.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-[#091222]/70" />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, rgba(9,18,34,0.92) 0%, rgba(9,18,34,0.78) 45%, rgba(9,18,34,0.4) 100%)',
          }}
        />
        <div className="pointer-events-none absolute -left-10 top-14 h-40 w-40 rounded-full bg-[#57C9E8]/15 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-[#F28C00]/10 blur-3xl" />

        <div className="relative mx-auto grid min-h-[520px] max-w-7xl gap-10 px-4 py-12 md:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-16">
          <div>
            <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-blue-100 backdrop-blur-sm">
              Portal Resmi Bagian Kerjasama
            </span>
            <h1 className="mt-4 max-w-2xl text-3xl font-extrabold leading-tight text-white md:text-5xl">
              Bangun kolaborasi strategis bersama Politeknik Negeri Batam
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-200 md:text-base">
              Temukan informasi kerja sama, statistik kemitraan, dan daftar mitra aktif secara lebih cepat, rapi, dan terstruktur.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#info-kerjasama" className="btn-highlight">
                Lihat Informasi
              </a>
              <a
                href="#kontak"
                className="inline-flex min-h-[2.75rem] items-center justify-center rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15"
              >
                Hubungi Kami
              </a>
            </div>

            <div className="mt-6 flex flex-wrap gap-2 text-xs text-slate-200">
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1">MoU &amp; MoA Aktif</span>
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1">Mitra Nasional &amp; Internasional</span>
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1">Data Terpusat</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {heroStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/10 bg-white/10 p-4 text-white shadow-lg backdrop-blur-md"
              >
                <p className="text-2xl font-bold md:text-3xl">{stat.value}</p>
                <div className="my-2 h-1 w-10 rounded-full bg-[#57C9E8]" />
                <p className="text-xs leading-snug text-slate-200 whitespace-pre-line">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SUMMARY CARDS ── */}
      <section className="relative -mt-8 px-4 pb-4">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-2">
                <DocEditIcon className="h-9 w-9" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600">Total Kerjasama</p>
                <p className="text-2xl font-bold text-slate-900">478</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-cyan-50 p-2">
                <DocIcon className="h-9 w-9" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600">Kerjasama Dalam Negeri</p>
                <p className="text-2xl font-bold text-slate-900">447</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-amber-50 p-2">
                <DocIcon className="h-9 w-9" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600">Kerjasama Luar Negeri</p>
                <p className="text-2xl font-bold text-slate-900">31</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATISTIK KERJASAMA ── */}
      <section className="px-4 py-4 md:py-6">
        <div className="mx-auto max-w-7xl rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-8">
          <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold text-[#173B82]">Statistik Kerjasama</p>
              <h2 className="text-2xl font-bold text-slate-900">Gambaran umum kolaborasi Polibatam</h2>
            </div>
            <p className="max-w-2xl text-sm text-slate-500">
              Ringkasan mitra dan dokumen kerja sama ditampilkan dalam visual yang lebih jelas agar mudah dipahami oleh pengunjung.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 md:p-5">
              <h3 className="text-sm font-bold text-slate-800">Jenis Mitra &amp; Wilayah</h3>
              <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-slate-600">
                <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-full bg-[#FFB6C1]" /> Instansi Dalam Negeri</span>
                <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-full bg-[#ADD8E6]" /> Instansi Luar Negeri</span>
                <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-full bg-[#F5F5DC]" /> Dudi Dalam Negeri</span>
                <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-full bg-[#90EE90]" /> Dudi Luar Negeri</span>
              </div>
              <div className="mt-4 flex items-center justify-center">
                <PieChart
                  size={260}
                  segments={[
                    { value: 292, color: '#FFB6C1' },
                    { value: 24, color: '#ADD8E6' },
                    { value: 154, color: '#F5F5DC' },
                    { value: 7, color: '#90EE90' },
                  ]}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 md:p-5">
              <h3 className="text-sm font-bold text-slate-800">Komposisi Dokumen Kerjasama</h3>
              <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-slate-600">
                <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-full bg-[#ADD8E6]" /> MoU</span>
                <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-full bg-[#F5F5DC]" /> MoA</span>
              </div>
              <div className="mt-4 flex items-center justify-center">
                <PieChart
                  size={260}
                  segments={[
                    { value: 263, color: '#ADD8E6' },
                    { value: 215, color: '#F5F5DC' },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── INFORMASI KERJASAMA ── */}
      <section id="info-kerjasama" className="px-4 py-4 pb-6">
        <div className="mx-auto max-w-7xl rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-8">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold text-[#173B82]">Informasi Kerjasama</p>
              <h2 className="text-2xl font-bold text-slate-900">Daftar mitra dan bidang kerja sama</h2>
            </div>
            <p className="max-w-xl text-sm text-slate-500">
              Jelajahi daftar mitra kerja sama berdasarkan bidang dan unit pengaju dengan pencarian yang lebih mudah.
            </p>
          </div>

          <div className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl bg-slate-50 p-3">
            <span className="text-sm text-slate-600">Show</span>
            <select className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm">
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>

            <div className="flex-1" />

            <span className="text-sm text-slate-600">Entries</span>
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600">
              <span>Periode</span>
              <input
                type="month"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-transparent outline-none"
              />
            </div>
            <select className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm">
              <option>Jurusan</option>
              <option>Manajemen dan Bisnis</option>
              <option>Teknik Elektro</option>
              <option>Teknik Informatika</option>
              <option>Teknik Mesin</option>
            </select>
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-blue-400 min-w-[150px]"
            />
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full min-w-[900px] border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-700">
                  <th className="w-10 px-4 py-3 text-left font-semibold">No</th>
                  <th className="px-4 py-3 text-left font-semibold">Nama Mitra</th>
                  <th className="px-4 py-3 text-left font-semibold">Bidang Kerjasama</th>
                  <th className="px-4 py-3 text-left font-semibold">Unit Pengaju</th>
                  <th className="w-16 px-4 py-3 text-left font-semibold">Detail</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/80'}>
                    <td className="px-4 py-3 align-top text-slate-600">{startIndex + i + 1}.</td>
                    <td className="px-4 py-3 align-top text-slate-700">{row.nama}</td>
                    <td className="px-4 py-3 align-top text-slate-600">{row.bidang}</td>
                    <td className="px-4 py-3 align-top text-slate-600">{row.unit}</td>
                    <td className="px-4 py-3 align-top">
                      <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#173B82] transition-colors hover:bg-[#091222]">
                        <MenuIcon />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-500">
              Showing {startIndex + 1} to {endIndex} of {TOTAL_ENTRIES} entries
            </p>

            <div className="flex overflow-hidden rounded-xl border border-slate-200 bg-white">
              <button
                onClick={() => changePage(-1)}
                disabled={currentPage === 1}
                className="border-r border-slate-200 px-3 py-1.5 text-sm text-slate-500 disabled:cursor-default disabled:bg-slate-100"
              >
                Previous
              </button>

              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setCurrentPage(n)}
                  className={`border-r border-slate-200 px-3 py-1.5 text-sm font-medium ${
                    currentPage === n
                      ? 'bg-[#173B82] text-white'
                      : 'bg-white text-[#173B82] hover:bg-blue-50'
                  }`}
                >
                  {n}
                </button>
              ))}

              <button className="cursor-default border-r border-slate-200 bg-slate-100 px-3 py-1.5 text-sm text-[#173B82]">
                ...
              </button>
              <button
                onClick={() => setCurrentPage(48)}
                className={`border-r border-slate-200 px-3 py-1.5 text-sm font-medium ${
                  currentPage === 48 ? 'bg-[#173B82] text-white' : 'bg-white text-[#173B82] hover:bg-blue-50'
                }`}
              >
                48
              </button>

              <button
                onClick={() => changePage(1)}
                disabled={currentPage === TOTAL_PAGES}
                className="px-3 py-1.5 text-sm text-[#173B82] hover:bg-blue-50 disabled:cursor-default disabled:bg-slate-100 disabled:text-slate-400"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </section>

      <div id="kontak" className="px-4 pb-4 pt-2">
        <div className="mx-auto max-w-7xl">
          <AdminFooter />
        </div>
      </div>
    </main>
  );
}