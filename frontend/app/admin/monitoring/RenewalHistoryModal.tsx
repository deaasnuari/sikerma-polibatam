'use client';

import { useState } from 'react';
import { Check, Clock, X } from 'lucide-react';

interface RenewalRecord {
  id: string;
  tanggalPermintaan: string;
  statusResponse: 'menunggu' | 'disetujui' | 'ditolak';
  catatan: string;
  tanggalResponse?: string;
}

interface RenewalHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  namaMitra: string;
  noDokumen: string;
  history: RenewalRecord[];
  onMarkInactive: () => void;
  onAddRenewal: (catatan: string) => void;
}

export default function RenewalHistoryModal({
  isOpen,
  onClose,
  namaMitra,
  noDokumen,
  history,
  onMarkInactive,
  onAddRenewal,
}: RenewalHistoryModalProps) {
  const [newCatatan, setNewCatatan] = useState('');

  if (!isOpen) {
    return null;
  }

  const handleAddRenewal = () => {
    if (newCatatan.trim()) {
      onAddRenewal(newCatatan);
      setNewCatatan('');
    }
  };

  const statusConfig = {
    menunggu: { label: 'Menunggu Respons', color: 'text-orange-600', bg: 'bg-orange-50', icon: Clock },
    disetujui: { label: 'Disetujui', color: 'text-green-600', bg: 'bg-green-50', icon: Check },
    ditolak: { label: 'Ditolak', color: 'text-red-600', bg: 'bg-red-50', icon: X },
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 px-3 py-6">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-4">
          <h2 className="text-lg font-bold text-[#1E376C]">History Perpanjangan Kerjasama</h2>
          <p className="mt-0.5 text-sm text-gray-600">
            {namaMitra} ({noDokumen})
          </p>
        </div>

        <div className="space-y-4 p-6">
          {/* New Renewal Request */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="mb-3 text-sm font-semibold text-gray-900">Ajukan Permintaan Perpanjangan Baru</p>
            <div className="flex gap-2">
              <textarea
                value={newCatatan}
                onChange={(event) => setNewCatatan(event.target.value)}
                placeholder="Catatan perpanjangan (opsional)..."
                rows={2}
                className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
              />
              <button
                type="button"
                onClick={handleAddRenewal}
                className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Ajukan
              </button>
            </div>
          </div>

          {/* History Timeline */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-700">Riwayat Permintaan ({history.length})</p>
            {history.length === 0 ? (
              <div className="rounded-lg bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
                Belum ada riwayat perpanjangan.
              </div>
            ) : (
              history
                .sort((a, b) => new Date(b.tanggalPermintaan).getTime() - new Date(a.tanggalPermintaan).getTime())
                .map((record) => {
                  const status = statusConfig[record.statusResponse];
                  const Icon = status.icon;

                  return (
                    <div key={record.id} className={`rounded-lg border border-gray-200 p-4 ${status.bg}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex gap-3">
                          <Icon className={`mt-1 shrink-0 ${status.color}`} size={18} />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">{status.label}</p>
                            <p className="mt-0.5 text-xs text-gray-600">Tanggal Permintaan: {record.tanggalPermintaan}</p>
                            {record.tanggalResponse && (
                              <p className="text-xs text-gray-600">Tanggal Respons: {record.tanggalResponse}</p>
                            )}
                            {record.catatan && <p className="mt-1.5 whitespace-pre-wrap text-xs text-gray-700">{record.catatan}</p>}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
            )}
          </div>

          {/* Actions */}
          <div className="border-t border-gray-200 pt-4">
            <p className="mb-3 text-sm font-semibold text-gray-700">Aksi</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  onMarkInactive();
                  onClose();
                }}
                className="flex-1 rounded-lg border border-red-300 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100"
              >
                Nonaktifkan Kerjasama
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
