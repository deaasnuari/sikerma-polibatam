import { useState } from 'react';

interface RenewalFormProps {
  kerjasamaId: number | null;
  onSuccess: (data: { catatan: string; tanggalMulaiBaru: string; tanggalBerakhirBaru: string }) => void;
}

export default function RenewalForm({ kerjasamaId, onSuccess }: RenewalFormProps) {
  const [catatan, setCatatan] = useState('');
  const [tanggalMulaiBaru, setTanggalMulaiBaru] = useState('');
  const [tanggalBerakhirBaru, setTanggalBerakhirBaru] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!tanggalMulaiBaru || !tanggalBerakhirBaru) {
      setError('Silakan isi tanggal mulai dan tanggal berakhir perpanjangan.');
      return;
    }
    if (new Date(tanggalBerakhirBaru) < new Date(tanggalMulaiBaru)) {
      setError('Tanggal berakhir tidak boleh lebih kecil dari tanggal mulai.');
      return;
    }
    onSuccess({ catatan, tanggalMulaiBaru, tanggalBerakhirBaru });
    setCatatan('');
    setTanggalMulaiBaru('');
    setTanggalBerakhirBaru('');
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-blue-200 bg-blue-50 p-4 mb-4">
      <p className="mb-3 text-sm font-semibold text-gray-900">Ajukan Permintaan Perpanjangan Baru</p>
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-700">Dari Tanggal</label>
          <input
            type="date"
            value={tanggalMulaiBaru}
            onChange={(e) => setTanggalMulaiBaru(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-700">Sampai Tanggal</label>
          <input
            type="date"
            value={tanggalBerakhirBaru}
            onChange={(e) => setTanggalBerakhirBaru(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
          />
        </div>
      </div>
      <textarea
        value={catatan}
        onChange={(e) => setCatatan(e.target.value)}
        placeholder="Catatan perpanjangan (opsional)..."
        rows={2}
        className="mt-3 w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
      />
      {error && <div className="mt-2 text-xs text-red-600">{error}</div>}
      <button
        type="submit"
        className="mt-3 inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
      >
        Ajukan Perpanjangan
      </button>
    </form>
  );
}
