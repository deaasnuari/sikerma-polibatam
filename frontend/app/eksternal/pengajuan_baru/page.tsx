'use client';

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

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Pengajuan Kerjasama</h2>
        <p className="text-sm text-slate-500">Form pengajuan eksternal menggunakan tampilan dan alur yang sama seperti role admin.</p>
      </div>

      <InternalAjukanKerjasamaForm
        disableDraftPersistence
        onCancel={() => router.push('/eksternal/daftar_kerjasama')}
        onSubmitted={() => router.push('/eksternal/daftar_kerjasama')}
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

          alert('Pengajuan kerjasama berhasil dikirim ke admin untuk direview.');
          return true;
        }}
      />
    </div>
  );
}
