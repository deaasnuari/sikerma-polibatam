'use client';

import { useState } from 'react';
import { AlertCircle, Archive, CalendarClock, Eye, HandshakeIcon, Mail, MessageCircle, Phone, RefreshCw } from 'lucide-react';
import LaporanKegiatanTemplateModal from './LaporanKegiatanTemplateModal';
import RenewalHistoryModal from './RenewalHistoryModal';
import NotificationHistoryModal from './NotificationHistoryModal';
import NonactiveConfirmationModal from './NonactiveConfirmationModal';

interface RenewalRecord {
  id: string;
  tanggalPermintaan: string;
  statusResponse: 'menunggu' | 'disetujui' | 'ditolak';
  catatan: string;
  tanggalResponse?: string;
}

interface Notification {
  id: string;
  tanggalKirim: string;
  jenis: 'reminder-3bulan' | 'reminder-1bulan' | 'urgent';
  status: 'terkirim' | 'dibaca' | 'ditindaklanjuti' | 'tidak-direspons';
  pesan: string;
  emailMitra: string;
}

interface NonactiveRecord {
  id: string;
  tanggalDinonaktifkan: string;
  alasan: string;
  buktiFile?: {
    nama: string;
    ukuran: string;
    tipe: string;
    uploadedAt: string;
  };
  status: 'pending' | 'confirmed';
}

type StatusKerjasama = 'Aktif' | 'Akan Berakhir' | 'Kadaluarsa';

interface Kerjasama {
  id: number;
  namaMitra: string;
  noDokumen: string;
  jenis: 'MoU' | 'MoA' | 'IA';
  status: StatusKerjasama;
  tanggalMulai: string;
  tanggalBerakhir: string;
  sisaMasaBerlaku: string | null;
  ruangLingkup: string[];
  whatsappNumber: string;
  emailMitra: string;
}

const dummyData: Kerjasama[] = [
  {
    id: 1,
    namaMitra: 'BADAN PENGUSAHAAN BATAM',
    noDokumen: '00',
    jenis: 'MoU',
    status: 'Aktif',
    tanggalMulai: '01/01/2025',
    tanggalBerakhir: '01/01/2028',
    sisaMasaBerlaku: '20 Bulan',
    ruangLingkup: ['Penelitian', 'Pengabdian Masyarakat'],
    whatsappNumber: '6281234567890',
    emailMitra: 'contact@bpb.go.id',
  },
  {
    id: 2,
    namaMitra: 'PT Feen Marine',
    noDokumen: '00',
    jenis: 'MoA',
    status: 'Akan Berakhir',
    tanggalMulai: '01/01/2025',
    tanggalBerakhir: '01/01/2028',
    sisaMasaBerlaku: null,
    ruangLingkup: ['Magang', 'Kerja Praktek'],
    whatsappNumber: '6289876543210',
    emailMitra: 'admin@feenmarine.com',
  },
  {
    id: 3,
    namaMitra: 'PT. Riseal Propulsion Indonesia',
    noDokumen: '00',
    jenis: 'IA',
    status: 'Kadaluarsa',
    tanggalMulai: '01/01/2025',
    tanggalBerakhir: '01/01/2028',
    sisaMasaBerlaku: '1 Bulan',
    ruangLingkup: ['Magang', 'Kerja Praktek'],
    whatsappNumber: '6281111111111',
    emailMitra: 'contact@riseal.co.id',
  },
  {
    id: 4,
    namaMitra: 'Universitas Negeri Jakarta',
    noDokumen: '01',
    jenis: 'MoU',
    status: 'Aktif',
    tanggalMulai: '15/03/2024',
    tanggalBerakhir: '15/03/2027',
    sisaMasaBerlaku: '11 Bulan',
    ruangLingkup: ['Penelitian', 'Publikasi Bersama'],
    whatsappNumber: '6282222222222',
    emailMitra: 'kerjasama@unj.ac.id',
  },
  {
    id: 5,
    namaMitra: 'PT. Teknologi Maju Indonesia',
    noDokumen: '02',
    jenis: 'MoA',
    status: 'Akan Berakhir',
    tanggalMulai: '10/02/2023',
    tanggalBerakhir: '10/05/2026',
    sisaMasaBerlaku: '1 Bulan',
    ruangLingkup: ['Magang', 'Penelitian'],
    whatsappNumber: '6283333333333',
    emailMitra: 'marketing@teknologimaju.id',
  },
  {
    id: 6,
    namaMitra: 'PT. Digital Solutions',
    noDokumen: '03',
    jenis: 'IA',
    status: 'Kadaluarsa',
    tanggalMulai: '01/06/2022',
    tanggalBerakhir: '01/06/2025',
    sisaMasaBerlaku: null,
    ruangLingkup: ['Kerja Praktek'],
    whatsappNumber: '6284444444444',
    emailMitra: 'hr@digitalsolutions.co.id',
  },
  {
    id: 7,
    namaMitra: 'Politeknik Negeri Semarang',
    noDokumen: '04',
    jenis: 'MoU',
    status: 'Akan Berakhir',
    tanggalMulai: '20/07/2023',
    tanggalBerakhir: '20/07/2026',
    sisaMasaBerlaku: '3 Bulan',
    ruangLingkup: ['Penelitian', 'Pengabdian Masyarakat'],
    whatsappNumber: '6285555555555',
    emailMitra: 'kerjasama@polines.ac.id',
  },
  {
    id: 8,
    namaMitra: 'PT Batam Aero Technic',
    noDokumen: '05',
    jenis: 'IA',
    status: 'Aktif',
    tanggalMulai: '05/01/2025',
    tanggalBerakhir: '05/01/2029',
    sisaMasaBerlaku: '33 Bulan',
    ruangLingkup: ['Magang', 'Kerja Praktek', 'Penelitian'],
    whatsappNumber: '6286666666666',
    emailMitra: 'partnerships@batamtech.com',
  },
  {
    id: 9,
    namaMitra: 'Dinas Pendidikan Kepri',
    noDokumen: '06',
    jenis: 'MoU',
    status: 'Kadaluarsa',
    tanggalMulai: '01/04/2021',
    tanggalBerakhir: '01/04/2024',
    sisaMasaBerlaku: null,
    ruangLingkup: ['Pengabdian Masyarakat'],
    whatsappNumber: '6287777777777',
    emailMitra: 'dinaspendidikan@kepriprov.go.id',
  },
  {
    id: 10,
    namaMitra: 'PT. Samator Gas Industri',
    noDokumen: '07',
    jenis: 'MoA',
    status: 'Aktif',
    tanggalMulai: '12/09/2024',
    tanggalBerakhir: '12/09/2027',
    sisaMasaBerlaku: '17 Bulan',
    ruangLingkup: ['Kerja Praktek'],
    whatsappNumber: '6288888888888',
    emailMitra: 'corporate@samatorgas.com',
  },
];

const jenisBadgeMap: Record<Kerjasama['jenis'], string> = {
  MoU: 'bg-violet-100 text-violet-700',
  MoA: 'bg-cyan-100 text-cyan-700',
  IA: 'bg-orange-100 text-orange-700',
};

const statusConfig: Record<StatusKerjasama, { dot: string; label: string; border: string; bg: string; labelColor: string }> = {
  Aktif: {
    dot: 'bg-green-500',
    label: 'Aktif',
    border: 'border-l-green-500',
    bg: 'bg-green-50',
    labelColor: 'text-green-600',
  },
  'Akan Berakhir': {
    dot: 'bg-orange-400',
    label: 'akan berakhir',
    border: 'border-l-orange-400',
    bg: 'bg-orange-50',
    labelColor: 'text-orange-500',
  },
  Kadaluarsa: {
    dot: 'bg-red-500',
    label: 'kadaluarsa',
    border: 'border-l-red-500',
    bg: 'bg-red-50',
    labelColor: 'text-red-500',
  },
};

type TabKey = 'Semua' | 'Aktif' | 'Akan Berakhir' | 'Kadaluarsa';

export default function MonitoringdanstatusPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('Semua');
  const [selectedLaporan, setSelectedLaporan] = useState<Kerjasama | null>(null);
  const [renewalModal, setRenewalModal] = useState<{ open: boolean; kerjasamaId: number | null }>({ open: false, kerjasamaId: null });
  const [renewalHistories, setRenewalHistories] = useState<Record<number, RenewalRecord[]>>({});
  const [notificationModal, setNotificationModal] = useState<{ open: boolean; kerjasamaId: number | null }>({ open: false, kerjasamaId: null });
  const [notificationHistories, setNotificationHistories] = useState<Record<number, Notification[]>>({
    2: [
      {
        id: 'notif-1',
        tanggalKirim: '10/04/2026',
        jenis: 'reminder-3bulan',
        status: 'terkirim',
        pesan: 'Notifikasi reminder otomatis: Kerjasama akan berakhir dalam 3 bulan',
        emailMitra: 'admin@feenmarine.com',
      },
    ],
    5: [
      {
        id: 'notif-2',
        tanggalKirim: '12/04/2026',
        jenis: 'reminder-1bulan',
        status: 'dibaca',
        pesan: 'Notifikasi reminder otomatis: Kerjasama akan berakhir dalam 1 bulan',
        emailMitra: 'marketing@teknologimaju.id',
      },
    ],
  });
  const [nonactiveModal, setNonactiveModal] = useState<{ open: boolean; kerjasamaId: number | null }>({ open: false, kerjasamaId: null });
  const [nonactiveHistories, setNonactiveHistories] = useState<Record<number, NonactiveRecord[]>>({});

  const totalAktif = dummyData.filter((d) => d.status === 'Aktif').length;
  const totalAkanBerakhir = dummyData.filter((d) => d.status === 'Akan Berakhir').length;
  const totalKadaluarsa = dummyData.filter((d) => d.status === 'Kadaluarsa').length;

  const filtered = activeTab === 'Semua' ? dummyData : dummyData.filter((d) => d.status === activeTab);

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: 'Semua', label: 'Semua Status', count: dummyData.length },
    { key: 'Aktif', label: 'Kerjasama Aktif', count: totalAktif },
    { key: 'Akan Berakhir', label: 'Akan Berakhir', count: totalAkanBerakhir },
    { key: 'Kadaluarsa', label: 'Kadaluarsa', count: totalKadaluarsa },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Monitoring & Status Kerjasama</h1>
        <p className="mt-1 text-sm text-gray-600">Pantau masa berlaku dokumen kerjasama dan status aktivitas</p>
      </div>

      {/* Alert Banner */}
      <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4">
        <AlertCircle size={20} className="mt-0.5 shrink-0 text-red-500" />
        <div>
          <p className="font-bold text-gray-900">Peringatan Monitoring</p>
          <ul className="mt-1 space-y-0.5 text-sm text-gray-700">
            <li>• {totalAkanBerakhir} dokumen akan berakhir dalam waktu kurang dari 3 bulan</li>
            <li>• {totalKadaluarsa} dokumen sudah melewati masa berlaku</li>
          </ul>
          <p className="mt-2 text-sm text-gray-700">Segera lakukan perpanjangan atau hubungi mitra untuk tindak lanjut.</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <button
          type="button"
          onClick={() => setActiveTab('Aktif')}
          className={`flex items-center gap-4 rounded-xl border-2 bg-white p-4 text-left shadow-sm transition-colors ${
            activeTab === 'Aktif' ? 'border-blue-500 ring-2 ring-blue-100' : 'border-blue-400 hover:bg-blue-50/50'
          }`}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
            <HandshakeIcon size={22} className="text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700">Kerjasama Aktif</p>
              <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
            </div>
            <p className="mt-1 text-3xl font-bold text-gray-900">{totalAktif}</p>
            <p className="text-xs text-gray-500">Masa berlaku &gt; 3 bulan</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('Akan Berakhir')}
          className={`flex items-center gap-4 rounded-xl border-2 bg-white p-4 text-left shadow-sm transition-colors ${
            activeTab === 'Akan Berakhir' ? 'border-orange-500 ring-2 ring-orange-100' : 'border-orange-400 hover:bg-orange-50/50'
          }`}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100">
            <CalendarClock size={22} className="text-orange-500" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700">Akan Berakhir</p>
              <span className="h-2.5 w-2.5 rounded-full bg-orange-400" />
            </div>
            <p className="mt-1 text-3xl font-bold text-gray-900">{totalAkanBerakhir}</p>
            <p className="text-xs text-gray-500">perlu perhatian segera</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('Kadaluarsa')}
          className={`flex items-center gap-4 rounded-xl border-2 bg-white p-4 text-left shadow-sm transition-colors ${
            activeTab === 'Kadaluarsa' ? 'border-red-500 ring-2 ring-red-100' : 'border-red-400 hover:bg-red-50/50'
          }`}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100">
            <Archive size={22} className="text-red-500" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700">Kadaluarsa</p>
              <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
            </div>
            <p className="mt-1 text-3xl font-bold text-gray-900">{totalKadaluarsa}</p>
            <p className="text-xs text-gray-500">sudah berakhir</p>
          </div>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-t-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
              activeTab === tab.key
                ? 'border-b-2 border-[#1E376C] bg-[#EEF2FF] text-[#1E376C]'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Cards List */}
      <div className="space-y-4">
        {filtered.map((item) => {
          const cfg = statusConfig[item.status];
          const isUrgent = item.status === 'Akan Berakhir' || item.status === 'Kadaluarsa';

          return (
            <div
              key={item.id}
              className={`overflow-hidden rounded-xl border border-gray-200 border-l-4 ${cfg.border} bg-white shadow-sm`}
            >
              <div className="p-4">
                {/* Top row */}
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <p className="text-base font-extrabold text-gray-900 md:text-lg">{item.namaMitra}</p>
                    <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${jenisBadgeMap[item.jenis]}`}>{item.jenis}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold">
                    <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
                    <span className={cfg.labelColor}>{cfg.label}</span>
                  </div>
                </div>

                {/* Meta info */}
                <p className="mt-1 text-xs text-gray-400">No. Dokumen: {item.noDokumen}</p>

                <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-gray-500 md:grid-cols-4">
                  <div>
                    <p className="font-medium text-gray-600">Tanggal Mulai</p>
                    <p>{item.tanggalMulai}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">Tanggal Berakhir</p>
                    <p>{item.tanggalBerakhir}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">Sisa Masa Berlaku</p>
                    {item.sisaMasaBerlaku ? (
                      <p className={item.status === 'Aktif' ? 'font-semibold text-green-600' : 'font-semibold text-orange-500'}>
                        {item.sisaMasaBerlaku}
                      </p>
                    ) : (
                      <p className="font-semibold text-red-500">Kadaluarsa</p>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">Kontak</p>
                    <div className="flex items-center gap-2 pt-0.5 text-gray-500">
                      <Mail size={13} className="cursor-pointer hover:text-[#1E376C]" />
                      <Phone size={13} className="cursor-pointer hover:text-[#1E376C]" />
                    </div>
                  </div>
                </div>

                {/* Ruang Lingkup */}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <p className="text-xs font-medium text-gray-500">Ruang Lingkup:</p>
                  {item.ruangLingkup.map((tag) => (
                    <span key={tag} className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedLaporan(item)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#1E376C] px-3 py-1.5 text-xs font-semibold text-[#1E376C] transition-colors hover:bg-[#EEF2FF]"
                  >
                    <Eye size={13} />
                    View Laporan Kegiatan
                  </button>

                  {isUrgent && (
                    <>
                      <button
                        type="button"
                        onClick={() => setRenewalModal({ open: true, kerjasamaId: item.id })}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-green-600 px-3 py-1.5 text-xs font-semibold text-green-700 transition-colors hover:bg-green-50"
                      >
                        <RefreshCw size={13} />
                        Perpanjang Kerjasama
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const waLink = `https://wa.me/${item.whatsappNumber}?text=Halo%20${encodeURIComponent(item.namaMitra)},%20saya%20ingin%20membahas%20tentang%20kerjasama%20${encodeURIComponent('No. ' + item.noDokumen)}`;
                          window.open(waLink, '_blank');
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-green-500 bg-green-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-green-600"
                      >
                        <MessageCircle size={13} />
                        Hubungi Mitra
                      </button>
                      <button
                        type="button"
                        onClick={() => setNotificationModal({ open: true, kerjasamaId: item.id })}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500 px-3 py-1.5 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-50"
                      >
                        <Mail size={13} />
                        Riwayat Email
                      </button>
                      <button
                        type="button"
                        onClick={() => setNonactiveModal({ open: true, kerjasamaId: item.id })}
                        className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-500 transition-colors hover:bg-gray-100"
                      >
                        Nonaktifkan
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <LaporanKegiatanTemplateModal
        isOpen={selectedLaporan !== null}
        onClose={() => setSelectedLaporan(null)}
        data={selectedLaporan}
      />

      <RenewalHistoryModal
        isOpen={renewalModal.open}
        onClose={() => setRenewalModal({ open: false, kerjasamaId: null })}
        namaMitra={renewalModal.kerjasamaId ? dummyData.find((d) => d.id === renewalModal.kerjasamaId)?.namaMitra || '' : ''}
        noDokumen={renewalModal.kerjasamaId ? dummyData.find((d) => d.id === renewalModal.kerjasamaId)?.noDokumen || '' : ''}
        history={renewalHistories[renewalModal.kerjasamaId || 0] || []}
        onAddRenewal={(catatan: string) => {
          if (!renewalModal.kerjasamaId) return;
          const newRecord: RenewalRecord = {
            id: `renewal-${renewalModal.kerjasamaId}-${Date.now()}`,
            tanggalPermintaan: new Date().toLocaleDateString('id-ID'),
            statusResponse: 'menunggu',
            catatan,
          };
          setRenewalHistories((prev) => ({
            ...prev,
            [renewalModal.kerjasamaId]: [...(prev[renewalModal.kerjasamaId] || []), newRecord],
          }));
        }}
        onMarkInactive={() => {
          alert('Kerjasama telah ditandai sebagai nonaktif.');
        }}
      />

      <NotificationHistoryModal
        isOpen={notificationModal.open}
        onClose={() => setNotificationModal({ open: false, kerjasamaId: null })}
        namaMitra={notificationModal.kerjasamaId ? dummyData.find((d) => d.id === notificationModal.kerjasamaId)?.namaMitra || '' : ''}
        noDokumen={notificationModal.kerjasamaId ? dummyData.find((d) => d.id === notificationModal.kerjasamaId)?.noDokumen || '' : ''}
        emailMitra={notificationModal.kerjasamaId ? dummyData.find((d) => d.id === notificationModal.kerjasamaId)?.emailMitra || '' : ''}
        notifications={notificationHistories[notificationModal.kerjasamaId || 0] || []}
        onSendNotification={(jenis: string) => {
          if (!notificationModal.kerjasamaId) return;
          const newNotification: Notification = {
            id: `notif-${notificationModal.kerjasamaId}-${Date.now()}`,
            tanggalKirim: new Date().toLocaleDateString('id-ID'),
            jenis: jenis as 'reminder-3bulan' | 'reminder-1bulan' | 'urgent',
            status: 'terkirim',
            pesan: `Notifikasi ${jenis} tentang status kerjasama Anda`,
            emailMitra: dummyData.find((d) => d.id === notificationModal.kerjasamaId)?.emailMitra || '',
          };
          setNotificationHistories((prev) => ({
            ...prev,
            [notificationModal.kerjasamaId]: [...(prev[notificationModal.kerjasamaId] || []), newNotification],
          }));
        }}
      />

      <NonactiveConfirmationModal
        isOpen={nonactiveModal.open}
        onClose={() => setNonactiveModal({ open: false, kerjasamaId: null })}
        namaMitra={nonactiveModal.kerjasamaId ? dummyData.find((d) => d.id === nonactiveModal.kerjasamaId)?.namaMitra || '' : ''}
        noDokumen={nonactiveModal.kerjasamaId ? dummyData.find((d) => d.id === nonactiveModal.kerjasamaId)?.noDokumen || '' : ''}
        tanggalBerakhir={nonactiveModal.kerjasamaId ? dummyData.find((d) => d.id === nonactiveModal.kerjasamaId)?.tanggalBerakhir || '' : ''}
        sisaMasaBerlaku={nonactiveModal.kerjasamaId ? dummyData.find((d) => d.id === nonactiveModal.kerjasamaId)?.sisaMasaBerlaku || null : null}
        nonactiveHistory={nonactiveHistories[nonactiveModal.kerjasamaId || 0] || []}
        onConfirmNonactive={(alasan: string, buktiFile?: { nama: string; ukuran: string; tipe: string }) => {
          if (!nonactiveModal.kerjasamaId) return;
          const newRecord: NonactiveRecord = {
            id: `nonactive-${nonactiveModal.kerjasamaId}-${Date.now()}`,
            tanggalDinonaktifkan: new Date().toLocaleDateString('id-ID'),
            alasan,
            buktiFile: buktiFile ? {
              ...buktiFile,
              uploadedAt: new Date().toLocaleDateString('id-ID'),
            } : undefined,
            status: 'confirmed',
          };
          setNonactiveHistories((prev) => ({
            ...prev,
            [nonactiveModal.kerjasamaId]: [...(prev[nonactiveModal.kerjasamaId] || []), newRecord],
          }));
          alert(`Kerjasama "${dummyData.find((d) => d.id === nonactiveModal.kerjasamaId)?.namaMitra}" telah berhasil dinonaktifkan.`);
          setNonactiveModal({ open: false, kerjasamaId: null });
        }}
      />
    </div>
  );
}
