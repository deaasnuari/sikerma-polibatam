'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

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
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch]           = useState('');

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/admin');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

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
    <main className="bg-[#f8f9fa] font-sans">

      {/* ── NAVBAR ── */}
      <nav className="sticky top-0 z-50 bg-white shadow-md h-[72px] flex items-center justify-between px-8">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <img src="/polibatam_logo.png" alt="Logo Polibatam" className="w-12 h-12 object-contain flex-shrink-0" />
          <div>
            <p className="font-bold text-[#1e376c] text-[15px] leading-tight">SIKERMA POLIBATAM</p>
            <p className="text-[11px] text-gray-500">Sistem Informasi Kerjasama - Politeknik Negeri Batam</p>
          </div>
        </div>

        {/* Nav links */}
        <div className="hidden md:flex gap-7">
          {[
            { label: 'Beranda', href: '#beranda' },
            { label: 'Info Kerjasama', href: '#info-kerjasama' },
            { label: 'Kontak Kami', href: '#kontak' },
          ].map((item) => (
            <a key={item.label} href={item.href} className="text-sm text-gray-700 hover:text-[#1e376c] active:text-[#FF7F00] focus:text-[#FF7F00] transition-colors" style={{ outline: 'none', boxShadow: 'none' }}>
              {item.label}
            </a>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <a
            href="/register"
            className="px-5 py-2 rounded-md bg-[#1e376c] text-white text-sm font-medium hover:bg-[#162a55] transition-colors"
          >
            Register
          </a>
          <a
            href="/login"
            className="px-5 py-2 rounded-md bg-[#1e376c] text-white text-sm font-medium hover:bg-[#162a55] transition-colors"
          >
            Login
          </a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section
        id="beranda"
        className="relative min-h-[380px] flex flex-col justify-end px-12 pb-10 overflow-hidden"
        style={{
          backgroundImage: "url('/polibatam.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Layer 1: fill color 50% opacity */}
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(14,29,52,0.5)' }} />
        {/* Layer 2: gradient overlay for text readability */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to right, rgba(14,29,52,0.88) 45%, rgba(14,29,52,0.35) 100%)',
          }}
        />

        <div className="relative z-10">
          <h1 className="text-[42px] font-bold text-white leading-tight">Selamat Datang</h1>
          <p className="text-lg font-medium text-white/90 mt-1 mb-12">
            di Website Resmi
            <br />
            Bagian Kerjasama Politeknik Negeri Batam
          </p>

          {/* Stats */}
          <div className="flex gap-12">
            {heroStats.map((stat) => (
              <div key={stat.label}>
                <p className="text-[34px] font-bold text-white">{stat.value}</p>
                <div className="w-14 h-1 bg-white/60 rounded my-2" />
                <p className="text-xs text-white/85 leading-snug whitespace-pre-line">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SUMMARY STRIP ── */}
      <div className="bg-white shadow-md flex items-center px-12 py-5 gap-0">
        {/* Total */}
        <div className="flex items-center gap-4 flex-1 pr-8 border-r border-gray-100">
          <DocEditIcon className="w-11 h-11 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-gray-700">Total Kerjasama</p>
            <p className="text-2xl font-bold text-gray-900">478</p>
          </div>
        </div>

        {/* Dalam Negeri */}
        <div className="flex items-center gap-4 flex-1 px-8 border-r border-gray-100">
          <DocIcon className="w-11 h-11 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-gray-700">Dalam Negeri</p>
            <p className="text-2xl font-bold text-gray-900">447</p>
            <a href="#" className="text-xs text-gray-500 hover:text-gray-700">
              Lihat &nbsp;→
            </a>
          </div>
        </div>

        {/* Luar Negeri */}
        <div className="flex items-center gap-4 pl-8">
          <DocIcon className="w-11 h-11 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-gray-700">Luar Negeri</p>
            <p className="text-2xl font-bold text-gray-900">31</p>
            <a href="#" className="text-xs text-gray-500 hover:text-gray-700">
              Lihat &nbsp;→
            </a>
          </div>
        </div>
      </div>

      {/* ── STATISTIK KERJASAMA ── */}
      <section className="bg-white shadow-sm mt-0 px-12 py-10">
        <h2 className="text-center text-lg font-bold text-gray-900 tracking-wide mb-2">
          STATISTIK KERJASAMA
        </h2>
        <div className="mx-auto mb-8 h-1 w-10 rounded bg-[#1e376c]" />

        <div className="flex gap-10 justify-center items-start flex-wrap">
          {/* Chart 1 — Berdasarkan Jenis Mitra & Wilayah */}
          <div className="flex flex-col items-center">
            {/* Legend */}
            <div className="flex flex-wrap gap-x-5 gap-y-1 mb-4 text-[11px] text-gray-600">
              <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-5 rounded-sm bg-[#FFB6C1]" /> Instansi Dalam Negeri</span>
              <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-5 rounded-sm bg-[#ADD8E6]" /> Instansi Luar Negeri</span>
              <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-5 rounded-sm bg-[#F5F5DC]" /> Dudi Dalam Negeri</span>
              <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-5 rounded-sm bg-[#90EE90]" /> Dudi Luar Negeri</span>
            </div>
            <div className="flex items-end gap-1">
              {/* Y-axis */}
              <div className="flex flex-col justify-between h-[240px] text-[10px] text-gray-400 pr-1 pb-0">
                {['1.0','0.9','0.8','0.7','0.6','0.5','0.4','0.3','0.2','0.1','0'].map((v) => (
                  <span key={v} className="leading-none">{v}</span>
                ))}
              </div>
              {/* Pie */}
              <PieChart
                size={240}
                segments={[
                  { value: 292, color: '#FFB6C1' },
                  { value: 24,  color: '#ADD8E6' },
                  { value: 154, color: '#F5F5DC' },
                  { value: 7,   color: '#90EE90' },
                ]}
              />
            </div>
          </div>

          {/* Chart 2 — Berdasarkan Jenis Dokumen */}
          <div className="flex flex-col items-center">
            {/* Legend */}
            <div className="flex gap-x-5 gap-y-1 mb-4 text-[11px] text-gray-600">
              <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-5 rounded-sm bg-[#ADD8E6]" /> MoU</span>
              <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-5 rounded-sm bg-[#F5F5DC]" /> MoA</span>
            </div>
            <div className="flex items-end gap-1">
              {/* Y-axis */}
              <div className="flex flex-col justify-between h-[240px] text-[10px] text-gray-400 pr-1 pb-0">
                {['1.0','0.9','0.8','0.7','0.6','0.5','0.4','0.3','0.2','0.1','0'].map((v) => (
                  <span key={v} className="leading-none">{v}</span>
                ))}
              </div>
              {/* Pie */}
              <PieChart
                size={240}
                segments={[
                  { value: 263, color: '#ADD8E6' },
                  { value: 215, color: '#F5F5DC' },
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── INFORMASI KERJASAMA ── */}
      <section id="info-kerjasama" className="bg-white shadow-sm mt-4 px-12 py-9">
        <h2 className="text-center text-[17px] font-semibold text-gray-900 mb-6">
          Informasi Kerjasama
        </h2>

        {/* Controls */}
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <span className="text-sm text-gray-600">Show</span>
          <select className="border border-gray-300 rounded px-2 py-1 text-sm">
            <option>10</option>
            <option>25</option>
            <option>50</option>
          </select>

          <div className="flex-1" />

          <span className="text-sm text-gray-600">Entries</span>
          <select className="border border-gray-300 rounded px-2 py-1 text-sm">
            <option>Tahun</option>
            <option>2024</option>
            <option>2023</option>
          </select>
          <select className="border border-gray-300 rounded px-2 py-1 text-sm">
            <option>Jurusan</option>
            <option>Teknik</option>
            <option>Bisnis</option>
          </select>
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded px-3 py-1 text-sm outline-none focus:border-blue-400 min-w-[130px]"
          />
        </div>

        {/* Table */}
        <div className="border border-gray-200 rounded overflow-hidden">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-white border-b border-gray-200">
                <th className="text-left px-4 py-2.5 font-semibold text-gray-800 w-10">No</th>
                <th className="text-left px-4 py-2.5 font-semibold text-gray-800">Nama Mitra</th>
                <th className="text-left px-4 py-2.5 font-semibold text-gray-800">Bidang Kerjasama</th>
                <th className="text-left px-4 py-2.5 font-semibold text-gray-800">Unit Pengaju</th>
                <th className="text-left px-4 py-2.5 font-semibold text-gray-800 w-16">Detail</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <tr
                  key={i}
                  className={i % 2 === 1 ? 'bg-[#d9d9d9]' : 'bg-white'}
                >
                  <td className="px-4 py-2 text-gray-600 align-top">{startIndex + i + 1}.</td>
                  <td className="px-4 py-2 text-gray-600 align-top">{row.nama}</td>
                  <td className="px-4 py-2 text-gray-600 align-top">{row.bidang}</td>
                  <td className="px-4 py-2 text-gray-600 align-top">{row.unit}</td>
                  <td className="px-4 py-2 align-top">
                    <button className="w-9 h-7 bg-[#0a6ffb] rounded flex items-center justify-center hover:bg-blue-700 transition-colors">
                      <MenuIcon />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
          <p className="text-sm text-gray-600">
            Showing {startIndex + 1} to {endIndex} of {TOTAL_ENTRIES} entries
          </p>

          <div className="flex border border-gray-300 rounded overflow-hidden">
            <button
              onClick={() => changePage(-1)}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm bg-[#d9d9d9] text-gray-500 border-r border-gray-300 disabled:cursor-default"
            >
              Previous
            </button>

            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setCurrentPage(n)}
                className={`px-3 py-1.5 text-sm border-r border-gray-300 font-medium transition-colors ${
                  currentPage === n
                    ? 'bg-[#0a6ffb] text-white'
                    : 'bg-white text-[#0a6ffb] hover:bg-blue-50'
                }`}
              >
                {n}
              </button>
            ))}

            <button className="px-3 py-1.5 text-sm bg-[#d9d9d9] text-[#0a6ffb] border-r border-gray-300 cursor-default">
              ...
            </button>
            <button
              onClick={() => setCurrentPage(48)}
              className={`px-3 py-1.5 text-sm border-r border-gray-300 font-medium ${
                currentPage === 48 ? 'bg-[#0a6ffb] text-white' : 'bg-white text-[#0a6ffb] hover:bg-blue-50'
              }`}
            >
              48
            </button>

            <button
              onClick={() => changePage(1)}
              disabled={currentPage === TOTAL_PAGES}
              className="px-3 py-1.5 text-sm bg-white text-[#0a6ffb] hover:bg-blue-50 disabled:bg-[#d9d9d9] disabled:text-gray-500 disabled:cursor-default"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer id="kontak" className="bg-[#0e1d34] px-12 pt-9 pb-0">
        {/* Top row */}
        <div className="flex items-start justify-between pb-6 flex-wrap gap-6">
          {/* Left: brand */}
          <div className="flex items-center gap-3">
            <img src="/polibatam_logo.png" alt="Logo Polibatam" className="w-14 h-14 object-contain flex-shrink-0" />
            <div>
              <p className="text-white font-bold text-[15px]">SIKERMA POLIBATAM</p>
              <p className="text-white/55 text-[11px] mt-0.5">
                Sistem Informasi Kerjasama - Politeknik Negeri Batam
              </p>
            </div>
          </div>

          {/* Right: contact */}
          <div className="text-right">
            <p className="text-white/65 text-[11px] leading-relaxed mb-1">
              Alamat: Jl. Ahmad Yani Batam Kota, Kota Batam,
              <br />
              Kepulauan Riau, Indonesia
            </p>
            <p className="text-white/65 text-[11px] leading-loose">
              Phone : +62-778-469858 Ext.1017
              <br />
              Fax : +62-778-463620
              <br />
              Email : info@polibatam.ac.id
            </p>
          </div>
        </div>

        {/* Divider + copyright */}
        <div className="border-t border-white/15 py-4 text-center">
          <p className="text-white/55 text-[13px]">© 2025 Politeknik Negeri Batam</p>
        </div>
      </footer>
    </main>
  );
}