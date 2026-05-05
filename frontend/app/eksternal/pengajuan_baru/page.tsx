'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import InternalAjukanKerjasamaForm from '@/app/internal/data_pengajuan/AjukanKerjasamaForm';
import { submitPengajuan } from '@/services/adminPengajuanService';

type UploadedDokumenLike = File | { file: File; dataUrl?: string };

function normalizeUploadedDokumen(items: UploadedDokumenLike[]) {
  return items
    .map((item) => {
      if (item instanceof File) {
        return { file: item, dataUrl: '' };
      }

      if (item && 'file' in item && item.file instanceof File) {
        return { file: item.file, dataUrl: item.dataUrl || '' };
      }

      return null;
    })
    .filter((item): item is { file: File; dataUrl: string } => item !== null);
}

export default function PengajuanBaruEksternalPage() {
  const router = useRouter();
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Pengajuan Kerjasama</h2>
        <p className="text-sm text-slate-500">Form pengajuan eksternal menggunakan tampilan dan alur yang sama seperti role admin.</p>
      </div>

      <InternalAjukanKerjasamaForm
        disableDraftPersistence
        onCancel={() => router.push('/eksternal/daftar_kerjasama')}
        onSubmitOverride={({ formData, selectedRuangLingkup, dokumen }) => {
          const normalizedDokumen = normalizeUploadedDokumen(dokumen as UploadedDokumenLike[]);

          submitPengajuan({
            judul: formData.judulKerjasama,
            pengusul: formData.namaKontak || 'Mitra Eksternal',
            mitra: formData.namaMitra,
            jenisDokumen: formData.jenisKerjasama,
            jurusan: formData.unitPelaksana,
            kategori: 'Eksternal',
            negara: formData.negara,
            tanggalMulai: formData.tanggalMulai,
            tanggalBerakhir: formData.tanggalBerakhir,
            emailPengusul: formData.emailKontak,
            whatsappPengusul: formData.teleponKontak,
            alamatMitra: formData.alamatMitra,
            ruangLingkup: selectedRuangLingkup,
            fileName: normalizedDokumen.map((item) => item.file.name).join(', ') || 'Dokumen pendukung eksternal',
            fileAttachments: normalizedDokumen.map((item) => ({
              name: item.file.name,
              type: item.file.type,
              size: item.file.size,
              url: item.dataUrl,
            })),
          });

          setIsSuccessModalOpen(true);
          return false;
        }}
      />

      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Pengajuan Berhasil Dikirim</h3>
            <p className="mt-2 text-sm text-slate-600">Pengajuan kerjasama berhasil dikirim ke admin untuk direview.</p>

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setIsSuccessModalOpen(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => router.push('/eksternal/daftar_kerjasama')}
                className="rounded-lg bg-[#1E376C] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#16305c]"
              >
                Lihat Daftar Kerjasama
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
