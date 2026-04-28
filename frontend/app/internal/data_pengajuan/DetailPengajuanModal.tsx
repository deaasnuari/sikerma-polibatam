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

        {/* Body */}
        <div className="space-y-5 px-6 py-5">
          {/* Status badge */}
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${sc.className}`}>
              {sc.icon}
              {sc.label}
            </span>
            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${pengajuanDokumenBadge[item.jenisDokumen] || 'bg-slate-100 text-slate-700'}`}>
              {item.jenisDokumen}
            </span>
          </div>

          {/* Informasi Umum */}
          <section>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-400">
              Informasi Umum
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoRow icon={<Building2 size={15} />} label="Mitra" value={item.mitra} />
              <InfoRow icon={<User size={15} />} label="Pengusul" value={item.pengusul} />
              <InfoRow icon={<Tag size={15} />} label="Jurusan / Unit" value={item.jurusan} />
              <InfoRow icon={<FileText size={15} />} label="Jenis Dokumen" value={item.jenisDokumen} />
              {item.tanggalMulai && (
                <InfoRow icon={<CalendarDays size={15} />} label="Tanggal Mulai" value={item.tanggalMulai} />
              )}
              {item.tanggalBerakhir && (
                <InfoRow icon={<CalendarDays size={15} />} label="Tanggal Berakhir" value={item.tanggalBerakhir} />
              )}
            </div>
          </section>

          {/* Ruang Lingkup */}
          {item.ruangLingkup.length > 0 && (
            <section>
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-400">
                Ruang Lingkup
              </h3>
              <div className="flex flex-wrap gap-2">
                {item.ruangLingkup.map((scope) => (
                  <span
                    key={scope}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                  >
                    {scope}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Kontak / info tambahan */}
          {(item.emailPengusul || item.whatsappPengusul || item.alamatMitra) && (
            <section>
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-400">
                Kontak
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {item.emailPengusul && (
                  <InfoRow icon={<User size={15} />} label="Email Pengusul" value={item.emailPengusul} />
                )}
                {item.whatsappPengusul && (
                  <InfoRow icon={<User size={15} />} label="WhatsApp" value={item.whatsappPengusul} />
                )}
                {item.alamatMitra && (
                  <InfoRow icon={<Building2 size={15} />} label="Alamat Mitra" value={item.alamatMitra} />
                )}
              </div>
            </section>
          )}



          {/* Hasil Review Admin */}
          <section
            id="review-section"
            className={`rounded-xl border p-4 ${
              scrollToReview
                ? 'border-[#173B82] bg-[#173B82]/5 ring-2 ring-[#173B82]/20'
                : 'border-slate-200 bg-slate-50'
            }`}
          >
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#173B82]">
              <MessageSquareText size={15} />
              Hasil Review Admin
            </div>
            <p className="text-sm text-slate-700">
              {item.reviewComment || reviewCopy[item.status]}
            </p>
            {item.reviewedAt && (
              <p className="mt-2 text-xs text-slate-500">
                Diperbarui oleh {item.reviewedBy || 'Admin'} pada {item.reviewedAt}
              </p>
            )}
          </section>
        </div>
      </div>


    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
      <span className="mt-0.5 text-slate-400">{icon}</span>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <p className="mt-0.5 text-sm font-medium text-slate-800">{value || '-'}</p>
      </div>
    </div>
  );
}
