'use client';

import { useRouter } from 'next/navigation';
import { CalendarDays, ChevronDown, Download, Paperclip, Pencil, Plus, Upload, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  pengajuanJurusanOptions,
  pengajuanUnitOptions,
  submitPengajuan,
} from '@/services/adminPengajuanService';
import { validateSelectedFile } from '@/lib/fileUploadUtils';

type TemplateDokumenConfig = {
  title: string;
  subtitle: string;
  struktur: string[];
  note: string;
  fileName: string;
  downloadUrl: string;
};

const defaultTemplateDokumenMap: Record<string, TemplateDokumenConfig> = {
  MoU: {
    title: 'Memorandum of Understanding (MoU)',
    subtitle: 'Template untuk kesepahaman awal kerja sama',
    struktur: ['Pembukaan', 'Para Pihak', 'Tujuan Kerja Sama', 'Ruang Lingkup', 'Jangka Waktu', 'Penutup'],
    note: 'Template bisa diunduh sebagai acuan. Anda tetap bisa langsung mengunggah dokumen sendiri.',
    fileName: 'Draft MOU Industri.docx',
    downloadUrl: '/templates/Draft%20MOU%20Industri.docx',
  },
  MoA: {
    title: 'Memorandum of Agreement (MoA)',
    subtitle: 'Template untuk perjanjian teknis pelaksanaan',
    struktur: ['Dasar Kerja Sama', 'Hak dan Kewajiban', 'Program Pelaksanaan', 'Pendanaan', 'Monitoring', 'Penutup'],
    note: 'Gunakan format MoA resmi agar isi dokumen sesuai standar admin.',
    fileName: 'Draft MOA Magang.docx',
    downloadUrl: '/templates/Draft%20MOA%20Magang.docx',
  },
  IA: {
    title: 'Implementation Arrangement (IA)',
    subtitle: 'Template rincian implementasi program',
    struktur: ['Informasi Program', 'Target Kegiatan', 'Peran Tim', 'Timeline', 'Output', 'Pelaporan'],
    note: 'Template IA dipakai untuk detail implementasi kerja sama yang sudah disepakati.',
    fileName: 'DRAFT IA POLIBATAM.docx',
    downloadUrl: '/templates/DRAFT%20IA%20POLIBATAM.docx',
  },
};

const jurusanOptions = pengajuanJurusanOptions;
const unitOptions = pengajuanUnitOptions;

const defaultRuangLingkupOptions = [
  'Penelitian',
  'Pengabdian Masyarakat',
  'Magang / PKL',
  'Pelatihan & Workshop',
  'Pertukaran Pelajar',
  'Rekrutmen',
  'Riset Bersama',
  'Pengembangan Kurikulum',
];

const initialForm = {
  namaMitra: '',
  jenisMitra: '',
  teleponMitra: '',
  emailMitra: '',
  alamatMitra: '',
  negara: 'Indonesia',
  jenisKerjasama: '',
  unitPelaksana: '',
  tanggalMulai: '',
  tanggalBerakhir: '',
  judulKerjasama: '',
  deskripsi: '',
  ruangLingkup: '',
  namaKontak: '',
  jabatanKontak: '',
  emailKontak: '',
};

export default function AjukanKerjasamaForm() {
  // Dummy form, implementasi sesuai kebutuhan
  return <div>Form pengajuan kerjasama (dummy, silakan lengkapi sesuai kebutuhan)</div>;
}
