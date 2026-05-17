'use client';

import { useState } from 'react';
import { X, FileText, User, Building2, CalendarDays, Tag, CheckCircle2, Clock3, XCircle, MessageSquareText, ExternalLink, Paperclip } from 'lucide-react';
import type { PengajuanItem, PengajuanStatus } from '@/services/adminPengajuanService';
import { pengajuanDokumenBadge } from '@/services/adminPengajuanService';

interface Props {
  item: PengajuanItem;
  onClose: () => void;
  scrollToReview?: boolean;
}

const statusConfig: Record<PengajuanStatus, { className: string; icon: React.ReactNode; label: string }> = {
  Menunggu: {
    className: 'bg-amber-100 text-amber-700',
    icon: <Clock3 size={14} />,
    label: 'Menunggu',
  },
  Diproses: {
    className: 'bg-sky-100 text-sky-700',
    icon: <Clock3 size={14} />,
    label: 'Diproses',
  },
  Disetujui: {
    className: 'bg-emerald-100 text-emerald-700',
    icon: <CheckCircle2 size={14} />,
    label: 'Disetujui',
  },
  Ditolak: {
    className: 'bg-rose-100 text-rose-700',
    icon: <XCircle size={14} />,
    label: 'Ditolak',
  },
};

const reviewCopy: Record<PengajuanStatus, string> = {
  Menunggu: 'Pengajuan sudah masuk dan sedang menunggu review dari admin.',
  Diproses: 'Admin sedang memeriksa detail pengajuan kerja sama ini.',
  Disetujui: 'Pengajuan sudah disetujui admin dan siap ditindaklanjuti.',
  Ditolak: 'Pengajuan belum disetujui admin. Silakan cek catatan review.',
};

const templatePreviewUrlByJenis: Record<string, string> = {
  MoU: '/templates/Draft%20MOU%20Industri.docx',
  MoA: '/templates/Draft%20MOA%20Magang.docx',
  IA: '/templates/DRAFT%20IA%20POLIBATAM.docx',
};

export default function DetailPengajuanModal({ item, onClose, scrollToReview }: Props) {
  const sc = statusConfig[item.status];
  const fallbackTemplateUrl = templatePreviewUrlByJenis[item.jenisDokumen] || '';
  const fileEntries = item.fileAttachments?.length
    ? item.fileAttachments
    : (item.fileName || '')
        .split(',')
        .map((name) => name.trim())
        .filter(Boolean)
        .map((name) => ({ name, url: '' }));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{item.judul}</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {item.tanggal} · {item.pengusul}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>
        {/* ...konten detail pengajuan... */}
        <div className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${sc.className}`}>
              {sc.icon}
              {sc.label}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold bg-slate-100 text-slate-700">
              <FileText size={13} />
              {item.jenisDokumen}
            </span>
          </div>
          <div className="mb-2 text-lg font-bold text-slate-900">{item.judul}</div>
          <div className="mb-2 text-sm text-slate-600">{item.deskripsi || '-'}</div>
          <div className="mb-2 text-xs text-slate-500">Pengusul: {item.pengusul}</div>
          <div className="mb-2 text-xs text-slate-500">Tanggal: {item.tanggal}</div>
          <div className="mb-2 text-xs text-slate-500">Jurusan/Unit: {item.jurusan}</div>
          <div className="mb-2 text-xs text-slate-500">Mitra: {item.mitra}</div>
          <div className="mb-2 text-xs text-slate-500">Ruang Lingkup: {item.ruangLingkup?.join(', ')}</div>
          <div className="mb-2 text-xs text-slate-500">Review: {item.reviewComment || reviewCopy[item.status]}</div>
          {/* Lampiran file */}
          {fileEntries.length > 0 && (
            <div className="mt-4">
              <div className="mb-1 text-xs font-semibold text-slate-700">Lampiran:</div>
              <ul className="list-disc pl-5 text-xs text-slate-700">
                {fileEntries.map((file, idx) => (
                  <li key={idx}>
                    {file.url ? (
                      <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{file.name}</a>
                    ) : (
                      file.name
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
