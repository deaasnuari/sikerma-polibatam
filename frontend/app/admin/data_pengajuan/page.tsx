'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FileText, Clock, CheckCircle, XCircle, Search, Filter, Plus, Eye, MessageSquare, X, ThumbsUp, ThumbsDown } from 'lucide-react';
import AjukanForm from './AjukanForm';
import {
  filterPengajuanData,
  getPengajuanData,
  getPengajuanStats,
  type PengajuanItem,
  type PengajuanStatus,
  updatePengajuanStatus,
} from '@/services/adminPengajuanService';

const statusConfig: Record<PengajuanStatus, { label: string; className: string; iconEl: React.ReactNode }> = {
  Menunggu: {
    label: 'Menunggu',
    className: 'badge badge-warning',
    iconEl: <Clock size={13} />,
  },
  Diproses: {
    label: 'Diproses',
    className: 'badge badge-info',
    iconEl: <Clock size={13} />,
  },
  Disetujui: {
    label: 'Disetujui',
    className: 'badge badge-success',
    iconEl: <CheckCircle size={13} />,
  },
  Ditolak: {
    label: 'Ditolak',
    className: 'badge badge-danger',
    iconEl: <XCircle size={13} />,
  },
};

const dokumenBadge: Record<string, string> = {
  MoA: 'bg-[#1E376C] text-white',
  MoU: 'bg-purple-700 text-white',
  PKS: 'bg-teal-700 text-white',
};

export default function PengajuanKerjasama() {
  const searchParams = useSearchParams();
  const [filterJurusan, setFilterJurusan] = useState('Semua Kategori Kerjasama');
  const [filterStatus, setFilterStatus] = useState('Semua Status');
  const [filterTahun, setFilterTahun] = useState('Semua Tahun');
  const [search, setSearch] = useState('');
  const [pengajuanData, setPengajuanData] = useState<PengajuanItem[]>([]);
  const [detailItem, setDetailItem] = useState<PengajuanItem | null>(null);
  const [reviewItem, setReviewItem] = useState<PengajuanItem | null>(null);
  const [reviewDecision, setReviewDecision] = useState<PengajuanStatus>('Disetujui');
  const [reviewComment, setReviewComment] = useState('');

  const isAjukanView = searchParams.get('view') === 'ajukan';

  useEffect(() => {
    if (isAjukanView) {
      return;
    }

    const syncPengajuan = () => {
      setPengajuanData(getPengajuanData());
    };

    syncPengajuan();
    window.addEventListener('pengajuan-data-updated', syncPengajuan);

    return () => window.removeEventListener('pengajuan-data-updated', syncPengajuan);
  }, [isAjukanView]);

  if (isAjukanView) {
    return <AjukanForm />;
  }

  const { totalPengajuan, menunggu, diproses, disetujui } = getPengajuanStats(pengajuanData);

  const statCards = [
    {
      key: 'Semua Status',
      label: 'Total Pengajuan',
      value: totalPengajuan,
      icon: FileText,
      iconWrap: 'bg-gray-100',
      iconText: 'text-gray-600',
      valueText: 'text-gray-900',
    },
    {
      key: 'Menunggu',
      label: 'Menunggu',
      value: menunggu,
      icon: Clock,
      iconWrap: 'bg-yellow-50',
      iconText: 'text-yellow-600',
      valueText: 'text-yellow-600',
    },
    {
      key: 'Diproses',
      label: 'Diproses',
      value: diproses,
      icon: Clock,
      iconWrap: 'bg-blue-50',
      iconText: 'text-blue-600',
      valueText: 'text-blue-600',
    },
    {
      key: 'Disetujui',
      label: 'Disetujui',
      value: disetujui,
      icon: CheckCircle,
      iconWrap: 'bg-green-50',
      iconText: 'text-green-600',
      valueText: 'text-green-600',
    },
  ];

  const filtered = filterPengajuanData(pengajuanData, filterStatus, filterJurusan, search).filter((item) => {
    if (filterTahun === 'Semua Tahun') return true;
    return item.tanggal.startsWith(filterTahun);
  });

  function openReview(item: PengajuanItem) {
    setReviewItem(item);
    setReviewDecision(item.status === 'Ditolak' ? 'Ditolak' : 'Disetujui');
    setReviewComment('');
  }

  function saveReview() {
    if (!reviewItem) return;

    const next = updatePengajuanStatus(reviewItem.id, reviewDecision, reviewComment);

    setPengajuanData(next);
    setReviewItem(null);
    setReviewComment('');
    alert('Review pengajuan berhasil disimpan.');
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Pengajuan Kerjasama</h1>
          <p className="page-subtitle mt-2">Kelola data pengajuan kerjasama dari seluruh jurusan dan unit di Polibatam</p>
        </div>
        <Link
          href="/admin/data_pengajuan?view=ajukan"
          className="btn-primary flex items-center gap-2 px-4 py-2.5 text-sm font-semibold shadow-sm flex-shrink-0"
        >
          <Plus size={18} />
          Ajukan Kerjasama Baru
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          const isActive = filterStatus === card.key;

          return (
            <button
              key={card.key}
              type="button"
              onClick={() => setFilterStatus(card.key)}
              className={`rounded-lg p-4 shadow-sm flex items-center gap-4 text-left border transition-all ${
                isActive
                  ? 'bg-sky-50 border-sky-300 ring-2 ring-sky-200 shadow-md'
                  : 'bg-white border-slate-200 hover:border-sky-200 hover:shadow-md'
              }`}
            >
              <div className={`w-10 h-10 ${card.iconWrap} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <Icon size={20} className={card.iconText} />
              </div>
              <div>
                <p className="text-xs text-gray-500">{card.label}</p>
                <p className={`text-2xl font-bold ${card.valueText}`}>{card.value}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Filter Row */}
      <div className="toolbar-shell p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-sm text-gray-700 font-medium">
            <Filter size={15} />
            Filter:
          </div>
          <select
            value={filterJurusan}
            onChange={(e) => setFilterJurusan(e.target.value)}
            className="input-field px-3 py-2 text-sm text-gray-700 cursor-pointer"
          >
            <option>Semua Kategori Kerjasama</option>
            <option>Internal</option>
            <option>Eksternal</option>
          </select>
          <select
            value={filterTahun}
            onChange={(e) => setFilterTahun(e.target.value)}
            className="input-field px-3 py-2 text-sm text-gray-700 cursor-pointer"
          >
            <option>Semua Tahun</option>
            <option>2026</option>
            <option>2025</option>
            <option>2024</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field px-3 py-2 text-sm text-gray-700 cursor-pointer"
          >
            <option>Semua Status</option>
            <option>Menunggu</option>
            <option>Diproses</option>
            <option>Disetujui</option>
            <option>Ditolak</option>
          </select>
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama mitra atau judul..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field w-full pl-9 pr-3 py-2 text-sm text-gray-700"
            />
          </div>
        </div>
      </div>

      {/* Cards List */}
      <div className="space-y-4">
        {filtered.map((item) => {
          const sc = statusConfig[item.status];
          return (
            <div
              key={item.id}
              className="card p-5 hover:shadow-md transition-shadow"
            >
              {/* Top row */}
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-gray-900">{item.judul}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Pengusul: {item.pengusul} &bull; {item.tanggal}
                  </p>
                </div>
                <span className={`flex items-center gap-1.5 flex-shrink-0 ${sc.className}`}>
                  {sc.iconEl}
                  {sc.label}
                </span>
              </div>

              {/* Info row */}
              <div className="flex flex-wrap items-start gap-6 mt-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Mitra Tujuan</p>
                  <p className="text-sm font-semibold text-gray-900">{item.mitra}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Jenis Dokumen</p>
                  <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${dokumenBadge[item.jenisDokumen] || 'bg-[#1E376C] text-white'}`}>
                    {item.jenisDokumen}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Jurusan</p>
                  <p className="text-sm text-gray-700">{item.jurusan}</p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDetailItem(item)}
                    className="btn-secondary flex items-center gap-1.5 text-sm px-3 py-1.5"
                  >
                    <Eye size={14} />
                    Detail
                  </button>
                  <button
                    type="button"
                    onClick={() => openReview(item)}
                    className="flex items-center gap-1.5 text-sm text-green-700 border border-green-300 bg-green-50 rounded-lg px-3 py-1.5 font-medium transition-colors hover:bg-green-100"
                  >
                    <MessageSquare size={14} />
                    Review
                  </button>
                </div>
              </div>

              {/* Ruang Lingkup */}
              <div className="flex flex-wrap items-center gap-2 mt-4">
                <span className="text-xs text-gray-500">Ruang Lingkup:</span>
                {item.ruangLingkup.map((rl) => (
                  <span
                    key={rl}
                    className="bg-gray-100 text-gray-700 rounded text-xs font-medium px-3 py-1"
                  >
                    {rl}
                  </span>
                ))}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="card p-12 text-center text-gray-400">
            Tidak ada data yang sesuai dengan filter.
          </div>
        )}
      </div>

      {detailItem && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px] p-4 flex items-center justify-center">
          <div className="w-full max-w-[640px] bg-[#EFEFF1] rounded-xl shadow-xl border border-[#DBDDE3]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#D5D7DD]">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Detail Pengajuan</h3>
                <p className="text-xs text-gray-600">ID: {detailItem.id}</p>
              </div>
              <button type="button" onClick={() => setDetailItem(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-white rounded-lg px-4 py-3 border border-[#D9DCE4]">
                <p className="text-xs text-gray-500">Status:</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">{statusConfig[detailItem.status].label}</p>
              </div>

              <div className="bg-white rounded-lg px-4 py-3 border border-[#D9DCE4]">
                <p className="text-sm font-semibold text-gray-900">{detailItem.judul}</p>
                <p className="text-xs text-gray-600 mt-1">Diajukan oleh: {detailItem.pengusul}</p>
              </div>

              <div className="bg-white rounded-lg px-4 py-3 border border-[#D9DCE4]">
                <p className="text-sm font-semibold text-gray-900 mb-3">Informasi Pengajuan</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                  <div>
                    <p className="text-gray-500">Tanggal Pengajuan</p>
                    <p className="text-gray-900 font-medium">{detailItem.tanggal}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Jenis Dokumen</p>
                    <span className={`inline-flex mt-1 px-2 py-0.5 rounded text-[11px] font-semibold ${dokumenBadge[detailItem.jenisDokumen] || 'bg-[#1E376C] text-white'}`}>
                      {detailItem.jenisDokumen}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-500">Jurusan/Unit</p>
                    <p className="text-gray-900 font-medium">{detailItem.jurusan}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Mitra Tujuan</p>
                    <p className="text-gray-900 font-medium">{detailItem.mitra}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg px-4 py-3 border border-[#D9DCE4]">
                <p className="text-xs text-gray-500 mb-2">Ruang Lingkup Kerjasama:</p>
                <div className="flex flex-wrap gap-2">
                  {detailItem.ruangLingkup.map((rl) => (
                    <span key={rl} className="bg-[#ECEFF6] text-[#1E376C] rounded-md text-[11px] font-semibold px-2.5 py-1">
                      {rl}
                    </span>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDetailItem(null)}
                className="w-full h-10 rounded-lg bg-[#1E376C] text-white text-sm font-semibold hover:bg-[#2A4A8F]"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {reviewItem && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px] p-4 flex items-center justify-center">
          <div className="w-full max-w-[680px] bg-[#EFEFF1] rounded-xl shadow-xl border border-[#DBDDE3]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#D5D7DD]">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Review Pengajuan</h3>
                <p className="text-sm text-gray-700 mt-0.5">{reviewItem.judul}</p>
              </div>
              <button type="button" onClick={() => setReviewItem(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-white rounded-lg px-4 py-3 border border-[#D9DCE4] grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                <div>
                  <p className="text-gray-500">Pengusul:</p>
                  <p className="text-gray-900 font-medium">{reviewItem.pengusul}</p>
                </div>
                <div>
                  <p className="text-gray-500">Mitra Tujuan:</p>
                  <p className="text-gray-900 font-medium">{reviewItem.mitra}</p>
                </div>
                <div>
                  <p className="text-gray-500">Jurusan</p>
                  <p className="text-gray-900 font-medium">{reviewItem.jurusan}</p>
                </div>
                <div>
                  <p className="text-gray-500">Jenis Dokumen</p>
                  <span className={`inline-flex mt-1 px-2 py-0.5 rounded text-[11px] font-semibold ${dokumenBadge[reviewItem.jenisDokumen] || 'bg-[#1E376C] text-white'}`}>
                    {reviewItem.jenisDokumen}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-700 mb-2">Keputusan *</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setReviewDecision('Disetujui')}
                    className={`h-11 rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-2 border ${reviewDecision === 'Disetujui' ? 'bg-[#1E376C] text-white border-[#1E376C]' : 'bg-white text-[#1E376C] border-[#C7D2EA]'}`}
                  >
                    <ThumbsUp size={14} />
                    ACC / SETUJUI
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewDecision('Ditolak')}
                    className={`h-11 rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-2 border ${reviewDecision === 'Ditolak' ? 'bg-[#1E376C] text-white border-[#1E376C]' : 'bg-white text-[#1E376C] border-[#C7D2EA]'}`}
                  >
                    <ThumbsDown size={14} />
                    TIDAK ACC / TOLAK
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700">Komentar / Catatan</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={3}
                  placeholder="Berikan catatan atau arahan untuk langkah selanjutnya..."
                  className="mt-1 w-full rounded-lg border border-[#D2D7E5] bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#1E376C]"
                />
              </div>

              <div className="bg-white rounded-lg border border-[#D9DCE4] px-3 py-2 text-[11px] text-gray-600">
                Notifikasi Otomatis: status akan diperbarui dan pengusul mendapat info hasil review.
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReviewItem(null)}
                  className="h-9 px-4 rounded-lg bg-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-300"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={saveReview}
                  className="h-9 px-5 rounded-lg bg-[#1E376C] text-white text-xs font-semibold hover:bg-[#2A4A8F]"
                >
                  Simpan dan kirim notifikasi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
