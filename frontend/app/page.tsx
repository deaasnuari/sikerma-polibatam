'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import AdminNavbar from '@/components/admin/AdminNavbar';
import AdminFooter from '@/components/admin/AdminFooter';
import { getCarouselImages, type CarouselImageItem } from '@/services/carouselService';
import { apiRequest } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

type KerjasamaRow = { id: number; nama: string; bidang: string; jenis: string; unit: string; wilayah: string };

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
  const [selectedWilayah, setSelectedWilayah] = useState('Semua Wilayah');
  const [selectedJenisDokumen, setSelectedJenisDokumen] = useState('Semua Jenis');
  const [selectedUnit, setSelectedUnit] = useState('Semua Unit');
  const [carouselImages, setCarouselImages] = useState<CarouselImageItem[]>([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [kerjasamaList, setKerjasamaList] = useState<KerjasamaRow[]>([]);
  const [isLoadingTable, setIsLoadingTable] = useState(true);
  const [perPage, setPerPage] = useState(10);

  // Daftar unit untuk dropdown — diambil dari master unit di database
  const [unitOptions, setUnitOptions] = useState<string[]>(['Semua Unit']);

  // Stat cards — diambil dari database
  const [stats, setStats] = useState({
    total: 478,
    dalam_negeri: 447,
    luar_negeri: 31,
    dudi_nasional: 154,
    dudi_internasional: 7,
    instansi_nasional: 292,
    instansi_internasional: 24,
  });

  const carouselSlides = useMemo(() => {
    if (carouselImages.length > 0) {
      return carouselImages.slice(0, 7).map((item, index) => ({
        id: item.id,
        title: item.title || `Aktivitas Kerjasama ${index + 1}`,
        imageUrl: item.image_url,
      }));
    }

    return Array.from({ length: 7 }, (_, index) => ({
      id: index + 1,
      title: `Aktivitas Kerjasama ${index + 1}`,
      imageUrl: '/polibatam.jpg',
    }));
  }, [carouselImages]);

  useEffect(() => {
    let mounted = true;

    getCarouselImages()
      .then((items) => {
        if (mounted) {
          setCarouselImages(items);
        }
      })
      .catch(() => {
        if (mounted) {
          setCarouselImages([]);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Fetch semua unit dari master database untuk mengisi dropdown "Semua Unit"
  useEffect(() => {
    let mounted = true;

    apiRequest<{ success: boolean; data: string[] }>('/public/unit-prodi')
      .then((res) => {
        if (!mounted) return;
        console.log('[UnitDropdown] API response:', res);
        const names: string[] = Array.isArray(res.data) ? res.data : [];
        console.log('[UnitDropdown] Unit count:', names.length, '| Units:', names);
        if (names.length > 0) {
          setUnitOptions(['Semua Unit', ...names]);
        }
      })
      .catch((err: unknown) => {
        console.error('[UnitDropdown] Gagal memuat unit dari database:', err);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    apiRequest<{ success: boolean; data: { total: number; dalam_negeri: number; luar_negeri: number; dudi_nasional: number; dudi_internasional: number; instansi_nasional: number; instansi_internasional: number } }>('/public/stats')
      .then((res) => {
        if (mounted && res.data) setStats(res.data);
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    setIsLoadingTable(true);

    apiRequest<{ success: boolean; data: { data: KerjasamaRow[]; total: number } }>('/public/kerjasama')
      .then((res) => {
        if (!mounted) return;
        const rows = res.data?.data;
        if (Array.isArray(rows)) setKerjasamaList(rows);
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setIsLoadingTable(false);
      });

    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (carouselSlides.length <= 1) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % carouselSlides.length);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [carouselSlides.length]);

  useEffect(() => {
    if (activeSlide >= carouselSlides.length) {
      setActiveSlide(0);
    }
  }, [activeSlide, carouselSlides.length]);

  // ── Table logic ──────────────────────────────────────────────────────────────
  const filtered = useMemo(() =>
    kerjasamaList.filter((r) =>
      (selectedWilayah === 'Semua Wilayah' || r.wilayah === selectedWilayah) &&
      (selectedJenisDokumen === 'Semua Jenis' || r.jenis === selectedJenisDokumen) &&
      (selectedUnit === 'Semua Unit' || r.unit === selectedUnit) &&
      (search === '' ||
        r.nama.toLowerCase().includes(search.toLowerCase()) ||
        r.bidang.toLowerCase().includes(search.toLowerCase()))
    ),
    [kerjasamaList, selectedWilayah, selectedJenisDokumen, selectedUnit, search]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const startIndex = (currentPage - 1) * perPage;
  const endIndex   = Math.min(currentPage * perPage, filtered.length);
  const pagedItems = filtered.slice(startIndex, endIndex);

  const changePage = (delta: number) => {
    const next = currentPage + delta;
    if (next < 1 || next > totalPages) return;
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
      >
        <Image
          src="/polibatam.jpg"
          alt="Kampus Politeknik Negeri Batam"
          fill
          priority
          quality={65}
          sizes="100vw"
          className="object-cover"
        />
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

        <div className="relative mx-auto grid min-h-[600px] max-w-7xl gap-10 px-4 py-16 md:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-24">
          <div>
            <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-semibold text-blue-100 backdrop-blur-sm">
              Portal Resmi Bagian Kerjasama
            </span>
            <h1 className="mt-4 max-w-2xl text-[25px] font-extrabold leading-tight text-white md:text-[40px]">
              Bangun kolaborasi strategis bersama Politeknik Negeri Batam
            </h1>
            <p className="mt-4 max-w-xl text-[11.5px] leading-6 text-slate-200 md:text-[13.5px]">
              Temukan informasi kerja sama, statistik kemitraan, dan daftar mitra aktif secara lebih cepat, rapi, dan terstruktur.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#info-kerjasama" className="btn-highlight">
                Lihat Informasi
              </a>
              <a
                href="#kontak"
                className="inline-flex min-h-[2.75rem] items-center justify-center rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-[11.5px] font-semibold text-white backdrop-blur-sm transition hover:bg-white/15"
              >
                Hubungi Kami
              </a>
            </div>

            <div className="mt-6 flex flex-wrap gap-2 text-[10px] text-slate-200">
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1">MoU &amp; MoA Aktif</span>
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1">Mitra Nasional &amp; Internasional</span>
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1">Data Terpusat</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {([
              { key: 'dudi_nasional',          label: 'Dudi\nNasional' },
              { key: 'dudi_internasional',      label: 'Dudi\nInternasional' },
              { key: 'instansi_nasional',       label: 'Instansi\nNasional' },
              { key: 'instansi_internasional',  label: 'Instansi\nInternasional' },
            ] as const).map((item) => (
              <div
                key={item.key}
                className="rounded-2xl border border-white/10 bg-white/10 p-4 text-white shadow-lg backdrop-blur-md"
              >
                <p className="text-[20px] font-bold md:text-[25px]">{stats[item.key]}</p>
                <div className="my-2 h-1 w-10 rounded-full bg-[#57C9E8]" />
                <p className="text-[10px] leading-snug text-slate-200 whitespace-pre-line">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AKTIVITAS CAROUSEL ── */}
      <section id="aktivitas" className="px-4 py-8 md:py-12">
        <div className="mx-auto max-w-7xl rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-8">
          <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11.5px] font-semibold text-[#173B82]">Aktivitas Kerjasama</p>
              <h2 className="text-[20px] font-bold text-slate-900">Dokumentasi Kegiatan Kolaborasi</h2>
            </div>
            <p className="max-w-2xl text-[11.5px] text-slate-500">
              Galeri ini otomatis mengikuti gambar terbaru yang diupload admin melalui dashboard.
            </p>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${activeSlide * 100}%)` }}
            >
              {carouselSlides.map((slide) => (
                <div key={slide.id} className="relative h-[260px] w-full flex-shrink-0 sm:h-[340px] lg:h-[420px]">
                  <img
                    src={slide.imageUrl}
                    alt={slide.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/55 via-slate-900/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                    <p className="text-[11.5px] font-semibold text-white sm:text-[13.5px]">{slide.title}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setActiveSlide((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length)}
              className="absolute left-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-slate-900/45 text-white transition hover:bg-slate-900/65"
              aria-label="Slide sebelumnya"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => setActiveSlide((prev) => (prev + 1) % carouselSlides.length)}
              className="absolute right-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-slate-900/45 text-white transition hover:bg-slate-900/65"
              aria-label="Slide berikutnya"
            >
              ›
            </button>

            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2">
              {carouselSlides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setActiveSlide(index)}
                  className={`h-2.5 rounded-full transition-all ${activeSlide === index ? 'w-7 bg-white' : 'w-2.5 bg-white/60'}`}
                  aria-label={`Buka slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SUMMARY CARDS ── */}
      <section className="relative -mt-6 px-6 pb-3 md:pb-4">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-2">
                <DocEditIcon className="h-9 w-9" />
              </div>
              <div>
                <p className="text-[11.5px] font-semibold text-slate-600">Total Kerjasama</p>
                <p className="text-[20px] font-bold text-slate-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-cyan-50 p-2">
                <DocIcon className="h-9 w-9" />
              </div>
              <div>
                <p className="text-[11.5px] font-semibold text-slate-600">Kerjasama Dalam Negeri</p>
                <p className="text-[20px] font-bold text-slate-900">{stats.dalam_negeri}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-amber-50 p-2">
                <DocIcon className="h-9 w-9" />
              </div>
              <div>
                <p className="text-[11.5px] font-semibold text-slate-600">Kerjasama Luar Negeri</p>
                <p className="text-[20px] font-bold text-slate-900">{stats.luar_negeri}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATISTIK KERJASAMA ── */}
      <section className="px-4 pt-4 md:pt-4 pb-18 md:pb-12">
        <div className="mx-auto max-w-7xl rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-8">
          <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11.5px] font-semibold text-[#173B82]">Statistik Kerjasama</p>
              <h2 className="text-[20px] font-bold text-slate-900">Gambaran umum kolaborasi Polibatam</h2>
            </div>
            <p className="max-w-2xl text-[11.5px] text-slate-500">
              Ringkasan mitra dan dokumen kerja sama ditampilkan dalam visual yang lebih jelas agar mudah dipahami oleh pengunjung.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 md:p-5">
              <h3 className="text-[11.5px] font-bold text-slate-800">Jenis Mitra &amp; Wilayah</h3>
              <div className="mt-3 flex flex-wrap gap-3 text-[10.5px] text-slate-600">
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
              <h3 className="text-[11.5px] font-bold text-slate-800">Komposisi Dokumen Kerjasama</h3>
              <div className="mt-3 flex flex-wrap gap-3 text-[10.5px] text-slate-600">
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
      <section id="info-kerjasama" className="px-4 pt-4 md:pt-2 pb-14">
        <div className="mx-auto max-w-7xl rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-8">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11.5px] font-semibold text-[#173B82]">Informasi Kerjasama</p>
              <h2 className="text-[20px] font-bold text-slate-900">Daftar mitra dan bidang kerja sama</h2>
            </div>
            <p className="max-w-xl text-[11.5px] text-slate-500">
              Jelajahi daftar mitra kerja sama berdasarkan bidang dan unit pengaju dengan pencarian yang lebih mudah.
            </p>
          </div>

          <div className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl bg-slate-50 p-3">
            <span className="text-[11.5px] text-slate-600">Show</span>
            <select
              value={perPage}
              onChange={(e) => { setPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[11.5px]"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>

            <div className="flex-1" />

            <span className="text-[11.5px] text-slate-600">Entries</span>
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11.5px] text-slate-600">
              <span>Periode</span>
              <input
                type="month"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-transparent outline-none"
              />
            </div>
            <select
              value={selectedWilayah}
              onChange={(e) => {
                setSelectedWilayah(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[11.5px]"
            >
              <option>Semua Wilayah</option>
              <option>Dalam Negeri</option>
              <option>Luar Negeri</option>
            </select>
            <select
              value={selectedJenisDokumen}
              onChange={(e) => {
                setSelectedJenisDokumen(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[11.5px]"
            >
              <option>Semua Jenis</option>
              <option>MoU</option>
              <option>MoA</option>
              <option>IA</option>
            </select>
            <select
              value={selectedUnit}
              onChange={(e) => {
                setSelectedUnit(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[11.5px]"
            >
              {unitOptions.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11.5px] outline-none focus:border-blue-400 min-w-[150px]"
            />
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full min-w-[900px] border-collapse text-[11.5px]">
              <thead>
                <tr className="bg-slate-50 text-slate-700">
                  <th className="w-10 px-4 py-3 text-left font-semibold">No</th>
                  <th className="px-4 py-3 text-left font-semibold">Nama Mitra</th>
                  <th className="px-4 py-3 text-left font-semibold">Bidang Kerjasama</th>
                  <th className="px-4 py-3 text-left font-semibold">Jenis Dokumen</th>
                  <th className="px-4 py-3 text-left font-semibold">Unit Pengaju</th>
                  <th className="w-16 px-4 py-3 text-left font-semibold">Detail</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingTable ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-[11.5px] text-slate-500">Memuat data kerjasama...</td>
                  </tr>
                ) : pagedItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-[11.5px] text-slate-500">Tidak ada data yang sesuai.</td>
                  </tr>
                ) : pagedItems.map((row, i) => (
                  <tr key={row.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/80'}>
                    <td className="px-4 py-3 align-top text-slate-600">{startIndex + i + 1}.</td>
                    <td className="px-4 py-3 align-top text-slate-700">{row.nama}</td>
                    <td className="px-4 py-3 align-top text-slate-600">{row.bidang}</td>
                    <td className="px-4 py-3 align-top text-slate-600">{row.jenis}</td>
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
            <p className="text-[11.5px] text-slate-500">
              Showing {filtered.length === 0 ? 0 : startIndex + 1} to {endIndex} of {filtered.length} entries
            </p>

            <div className="flex overflow-hidden rounded-xl border border-slate-200 bg-white">
              <button
                onClick={() => changePage(-1)}
                disabled={currentPage === 1}
                className="border-r border-slate-200 px-3 py-1.5 text-[11.5px] text-slate-500 disabled:cursor-default disabled:bg-slate-100"
              >
                Previous
              </button>

              {(() => {
                const maxVisible = 5;
                const start = Math.max(1, Math.min(currentPage - 2, totalPages - maxVisible + 1));
                const pages = Array.from({ length: Math.min(maxVisible, totalPages) }, (_, i) => start + i);
                return pages.map((n) => (
                  <button
                    key={n}
                    onClick={() => setCurrentPage(n)}
                    className={`border-r border-slate-200 px-3 py-1.5 text-[11.5px] font-medium ${
                      currentPage === n ? 'bg-[#173B82] text-white' : 'bg-white text-[#173B82] hover:bg-blue-50'
                    }`}
                  >
                    {n}
                  </button>
                ));
              })()}

              {totalPages > 5 && currentPage < totalPages - 2 && (
                <>
                  <button className="cursor-default border-r border-slate-200 bg-slate-100 px-3 py-1.5 text-[11.5px] text-[#173B82]">
                    ...
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className={`border-r border-slate-200 px-3 py-1.5 text-[11.5px] font-medium ${
                      currentPage === totalPages ? 'bg-[#173B82] text-white' : 'bg-white text-[#173B82] hover:bg-blue-50'
                    }`}
                  >
                    {totalPages}
                  </button>
                </>
              )}

              <button
                onClick={() => changePage(1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-[11.5px] text-[#173B82] hover:bg-blue-50 disabled:cursor-default disabled:bg-slate-100 disabled:text-slate-400"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </section>

      <div id="kontak" className="px-4 py-8 md:py-12">
        <AdminFooter />
      </div>
    </main>
  );
}