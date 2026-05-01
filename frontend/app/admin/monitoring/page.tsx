'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, Archive, CalendarClock, Eye, HandshakeIcon, Mail, MessageCircle, Phone, RefreshCw, Search, Trash2, X } from 'lucide-react';
import LaporanKegiatanTemplateModal from './LaporanKegiatanTemplateModal';
// import RenewalHistoryModal from './RenewalHistoryModal';
import RenewalFullForm from './RenewalFullForm';
import RenewalForm from './RenewalForm';
// import RenewalForm from './RenewalForm';
import NotificationHistoryModal from './NotificationHistoryModal';
import NonactiveConfirmationModal from './NonactiveConfirmationModal';
import {
  createNonactiveRecord,
  createNotificationRecord,
  createRenewalRecord,
  createWhatsAppLink,
  deleteMonitoringItem,
  findKerjasamaById,
  getDefaultNotificationHistories,
  getFilteredMonitoringData,
  getMonitoringData,
  getMonitoringStats,
  getMonitoringTabs,
  monitoringJenisBadgeMap,
  monitoringStatusConfig,
  type Kerjasama,
  type MonitoringNotification,
  type NonactiveRecord,
  type RenewalRecord,
  type TabKey,
} from '@/services/adminMonitoringService';
import { addAdminNotification } from '@/services/adminService';
import { addRenewalRequest } from '@/services/adminRenewalRequestService';


export default function MonitoringdanstatusPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('Semua');
  const [searchInput, setSearchInput] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedLaporan, setSelectedLaporan] = useState<Kerjasama | null>(null);
  const [renewalModal, setRenewalModal] = useState<{ open: boolean; kerjasamaId: number | null }>({ open: false, kerjasamaId: null });
  const [renewalHistories, setRenewalHistories] = useState<Record<number, RenewalRecord[]>>({});
  const [notificationModal, setNotificationModal] = useState<{ open: boolean; kerjasamaId: number | null }>({ open: false, kerjasamaId: null });
  const [notificationHistories, setNotificationHistories] = useState<Record<number, MonitoringNotification[]>>(getDefaultNotificationHistories());
  const [nonactiveModal, setNonactiveModal] = useState<{ open: boolean; kerjasamaId: number | null }>({ open: false, kerjasamaId: null });
  const [nonactiveHistories, setNonactiveHistories] = useState<Record<number, NonactiveRecord[]>>({});
  const [monitoringData, setMonitoringData] = useState<Kerjasama[]>([]);
  // State untuk toggle form sederhana/baru
  const [showSimpleForm, setShowSimpleForm] = useState(false);

  useEffect(() => {
    const syncMonitoringData = () => {
      setMonitoringData(getMonitoringData());
    };

    syncMonitoringData();
    window.addEventListener('monitoring-data-updated', syncMonitoringData);

    return () => window.removeEventListener('monitoring-data-updated', syncMonitoringData);
  }, []);
  const { totalAktif, totalAkanBerakhir, totalKadaluarsa } = getMonitoringStats(monitoringData);
  const filteredByTab = getFilteredMonitoringData(monitoringData, activeTab);
  const normalizedKeyword = searchKeyword.trim().toLowerCase();
  const filtered = normalizedKeyword
    ? filteredByTab.filter((item) => {
        const searchText = [
          item.namaMitra,
          item.noDokumen,
          item.jenis,
          item.status,
          item.tanggalMulai,
          item.tanggalBerakhir,
          ...item.ruangLingkup,
        ]
          .join(' ')
          .toLowerCase();

        return searchText.includes(normalizedKeyword);
      })
    : filteredByTab;
  const tabs = getMonitoringTabs(monitoringData);
  const selectedRenewalItem = findKerjasamaById(monitoringData, renewalModal.kerjasamaId);
  const selectedNotificationItem = findKerjasamaById(monitoringData, notificationModal.kerjasamaId);
  const selectedNonactiveItem = findKerjasamaById(monitoringData, nonactiveModal.kerjasamaId);

  const handleDeleteMonitoring = (item: Kerjasama) => {
    const isConfirmed = window.confirm(`Yakin ingin menghapus data monitoring untuk ${item.namaMitra}?`);
    if (!isConfirmed) {
      return;
    }

    deleteMonitoringItem(item.id);
  };

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

      {/* Export Button & Stat Cards */}
      <div className="flex flex-wrap gap-2 items-center mb-2">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500 bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
          onClick={() => {
            // Export monitoringData to CSV
            const csvRows = [
              [
                'Nama Mitra',
                'No Dokumen',
                'Jenis',
                'Status',
                'Tanggal Mulai',
                'Tanggal Berakhir',
                'Sisa Masa Berlaku',
                'Email Mitra',
                'WhatsApp',
                'Ruang Lingkup'
              ].join(','),
              ...monitoringData.map(item => [
                `"${item.namaMitra}"`,
                `"${item.noDokumen}"`,
                `"${item.jenis}"`,
                `"${item.status}"`,
                `"${item.tanggalMulai}"`,
                `"${item.tanggalBerakhir}"`,
                `"${item.sisaMasaBerlaku || ''}"`,
                `"${item.emailMitra}"`,
                `"${item.whatsappNumber}"`,
                `"${item.ruangLingkup.join('; ')}"`
              ].join(','))
            ];
            const csvContent = csvRows.join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'monitoring-kerjasama.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }}
        >
          Export Data
        </button>
      </div>
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

      {/* Search */}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setSearchKeyword(searchInput);
        }}
        className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-3 md:flex-row md:items-center"
      >
        <div className="relative flex-1">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Cari mitra, nomor dokumen, jenis, atau ruang lingkup"
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:border-[#1E376C]"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#1E376C] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#162c56]"
          >
            <Search size={14} />
            Cari
          </button>

          <button
            type="button"
            onClick={() => {
              setSearchInput('');
              setSearchKeyword('');
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100"
          >
            <X size={14} />
            Reset
          </button>
        </div>
      </form>

      {searchKeyword.trim() !== '' && (
        <p className="text-sm text-gray-600">
          Hasil pencarian untuk <span className="font-semibold">&quot;{searchKeyword}&quot;</span>: {filtered.length} record ditemukan.
        </p>
      )}

      {/* Cards List */}
      <div className="space-y-4">
        {filtered.map((item) => {
          const cfg = monitoringStatusConfig[item.status];
          const isUrgent = item.status === 'Akan Berakhir' || item.status === 'Kadaluarsa';

          return (
            <div
              key={item.id}
              className={`overflow-hidden rounded-xl border border-gray-200 border-l-4 ${cfg.border} bg-white shadow-sm`}
            >
              <div className="p-4">
                {/* Top row */}
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex flex-col gap-0.5 md:gap-1">
                    <div className="flex items-center gap-2">
                      <p className="text-base font-extrabold text-gray-900 md:text-lg">{item.namaMitra}</p>
                      <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${monitoringJenisBadgeMap[item.jenis]}`}>{item.jenis}</span>
                    </div>
                    {item.judul && (
                      <p className="text-sm font-semibold text-blue-900 whitespace-pre-line break-words">{item.judul}</p>
                    )}
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
                    Tambah Laporan Pelaksanaan
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
                          window.open(createWhatsAppLink(item), '_blank');
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

                  <button
                    type="button"
                    onClick={() => handleDeleteMonitoring(item)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50"
                  >
                    <Trash2 size={13} />
                    Hapus
                  </button>
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


      {renewalModal.open && selectedRenewalItem && (
        <div className="fixed inset-0 z-40 flex items-start justify-center bg-slate-900/40 px-2 pt-32 pb-4">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl p-0 flex flex-col" style={{ maxHeight: 'calc(100vh - 9rem)' }}>
            <div className="overflow-auto p-4" style={{ maxHeight: 'calc(100vh - 11rem)' }}>
            <h2 className="text-lg font-bold text-[#1E376C] mb-2">Perpanjangan Kerjasama</h2>
            {/* Form lengkap selalu tampil di atas */}
            <RenewalFullForm
              initialData={{
                namaMitra: selectedRenewalItem.namaMitra || '',
                jenisMitra: '',
                teleponMitra: selectedRenewalItem.whatsappNumber || '',
                emailMitra: selectedRenewalItem.emailMitra || '',
                alamatLengkap: '',
                negara: 'Indonesia',
                jenisKerjasama: selectedRenewalItem.jenis || '',
                unitPelaksana: '',
                tanggalMulai: selectedRenewalItem.tanggalMulai || '',
                tanggalBerakhir: selectedRenewalItem.tanggalBerakhir || '',
                judulKerjasama: selectedRenewalItem.judul || '',
                deskripsi: '',
                ruangLingkup: selectedRenewalItem.ruangLingkup || [],
                kontakNama: '',
                kontakJabatan: '',
                kontakEmail: '',
                kontakTelepon: '',
                dokumenTerakhir: undefined,
                tanggalMulaiBaru: '',
                tanggalBerakhirBaru: '',
                catatanPerpanjangan: '',
              }}
              onSubmit={(data) => {
                setRenewalModal({ open: false, kerjasamaId: null });
                alert('Perpanjangan kerjasama berhasil diajukan!');
              }}
            />
            <button
              type="button"
              onClick={() => { setRenewalModal({ open: false, kerjasamaId: null }); }}
              className="mt-4 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              Tutup
            </button>
          </div>
          </div>
        </div>
      )}


      <NotificationHistoryModal
        isOpen={notificationModal.open}
        onClose={() => setNotificationModal({ open: false, kerjasamaId: null })}
        namaMitra={selectedNotificationItem?.namaMitra || ''}
        noDokumen={selectedNotificationItem?.noDokumen || ''}
        emailMitra={selectedNotificationItem?.emailMitra || ''}
        notifications={notificationHistories[notificationModal.kerjasamaId || 0] || []}
        onSendNotification={(jenis: string) => {
          if (!notificationModal.kerjasamaId || !selectedNotificationItem) return;
          const newNotification = createNotificationRecord(
            notificationModal.kerjasamaId,
            jenis as 'reminder-3bulan' | 'reminder-1bulan' | 'urgent',
            selectedNotificationItem.emailMitra
          );
          setNotificationHistories((prev) => ({
            ...prev,
            [notificationModal.kerjasamaId]: [...(prev[notificationModal.kerjasamaId] || []), newNotification],
          }));
        }}
      />

      <NonactiveConfirmationModal
        isOpen={nonactiveModal.open}
        onClose={() => setNonactiveModal({ open: false, kerjasamaId: null })}
        namaMitra={selectedNonactiveItem?.namaMitra || ''}
        noDokumen={selectedNonactiveItem?.noDokumen || ''}
        tanggalBerakhir={selectedNonactiveItem?.tanggalBerakhir || ''}
        sisaMasaBerlaku={selectedNonactiveItem?.sisaMasaBerlaku || null}
        nonactiveHistory={nonactiveHistories[nonactiveModal.kerjasamaId || 0] || []}
        onConfirmNonactive={(alasan: string, buktiFile?: { nama: string; ukuran: string; tipe: string }) => {
          if (!nonactiveModal.kerjasamaId) return;
          const newRecord = createNonactiveRecord(nonactiveModal.kerjasamaId, alasan, buktiFile);
          setNonactiveHistories((prev) => ({
            ...prev,
            [nonactiveModal.kerjasamaId]: [...(prev[nonactiveModal.kerjasamaId] || []), newRecord],
          }));
          alert(`Kerjasama "${selectedNonactiveItem?.namaMitra || ''}" telah berhasil dinonaktifkan.`);
          setNonactiveModal({ open: false, kerjasamaId: null });
        }}
      />
    </div>
  );
}
