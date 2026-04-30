import { useState } from 'react';
import { Plus, Upload, X, Download } from 'lucide-react';
import { compressImageFileIfNeeded, validateSelectedFile } from '@/lib/fileUploadUtils';

export interface RenewalFullFormProps {
  initialData: {
    namaMitra: string;
    jenisMitra: string;
    teleponMitra: string;
    emailMitra: string;
    alamatLengkap: string;
    negara: string;
    jenisKerjasama: string;
    unitPelaksana: string;
    tanggalMulai: string;
    tanggalBerakhir: string;
    judulKerjasama: string;
    deskripsi: string;
    ruangLingkup: string[];
    kontakNama: string;
    kontakJabatan: string;
    kontakEmail: string;
    kontakTelepon: string;
    dokumenTerakhir?: { nama: string; url: string; ukuran: string; tanggal: string };
    tanggalMulaiBaru?: string;
    tanggalBerakhirBaru?: string;
    catatanPerpanjangan?: string;
  };
  onSubmit: (data: any) => void;
}

export default function RenewalFullForm({ initialData, onSubmit }: RenewalFullFormProps) {
  const [form, setForm] = useState({ ...initialData });
  const [dokumen, setDokumen] = useState(initialData.dokumenTerakhir ? [initialData.dokumenTerakhir] : []);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'mitra' | 'perpanjangan'>('mitra');

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddDokumen = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const validationError = validateSelectedFile(file, {
        accept: '.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png',
        maxSizeBytes: 10 * 1024 * 1024,
      });
      if (validationError) {
        alert(validationError);
        return;
      }
      const processedFile = await compressImageFileIfNeeded(file, {
        maxDimension: 1920,
        quality: 0.8,
        minBytesToCompress: 400 * 1024,
      });
      setDokumen([{ nama: processedFile.name, url: URL.createObjectURL(processedFile), ukuran: (processedFile.size / 1024 / 1024).toFixed(1) + ' MB', tanggal: new Date().toLocaleDateString('id-ID') }]);
    };
    input.click();
  };

  const handleRemoveDokumen = () => {
    setDokumen([]);
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (!form.catatanPerpanjangan || form.catatanPerpanjangan.trim() === '') {
      setError('Alasan perpanjangan wajib diisi.');
      return;
    }
    if (dokumen.length === 0) {
      setError('Silakan upload dokumen perpanjangan.');
      return;
    }
    setError('');
    onSubmit({ ...form, dokumen: dokumen[0] });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-0 md:p-0 bg-white">
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 md:p-4 mb-3">
        <h3 className="font-bold text-blue-900 mb-2 text-base">Data Mitra</h3>
        <div className="grid md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold mb-1">Nama Instansi</label>
          <input name="namaMitra" value={form.namaMitra} onChange={handleChange} className="input-field w-full" />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Jenis Mitra</label>
          <input name="jenisMitra" value={form.jenisMitra} onChange={handleChange} className="input-field w-full" />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">WhatsApp Aktif</label>
          <input name="teleponMitra" value={form.teleponMitra} onChange={handleChange} className="input-field w-full" />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Email Mitra</label>
          <input name="emailMitra" value={form.emailMitra} onChange={handleChange} className="input-field w-full" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold mb-1">Alamat Lengkap</label>
          <input name="alamatLengkap" value={form.alamatLengkap} onChange={handleChange} className="input-field w-full" />
        </div>
      </div>
      </div>
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 md:p-4 mb-3">
        <h3 className="font-bold text-blue-900 mb-2 text-base">Detail Kerjasama</h3>
        <div className="grid md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold mb-1">Negara Mitra</label>
          <input name="negara" value={form.negara} onChange={handleChange} className="input-field w-full" />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Jenis Kerjasama</label>
          <input name="jenisKerjasama" value={form.jenisKerjasama} onChange={handleChange} className="input-field w-full" />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Unit Pelaksana</label>
          <input name="unitPelaksana" value={form.unitPelaksana} onChange={handleChange} className="input-field w-full" />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Tanggal Mulai</label>
          <input type="date" name="tanggalMulai" value={form.tanggalMulai} onChange={handleChange} className="input-field w-full" />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Tanggal Berakhir</label>
          <input type="date" name="tanggalBerakhir" value={form.tanggalBerakhir} onChange={handleChange} className="input-field w-full" />
        </div>
        {/* Field tanggal baru dan catatan dari form sederhana */}
        {/* Hapus field tanggal perpanjangan baru yang ganda, cukup gunakan tanggal berakhir baru jika perlu. */}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold mb-1">Catatan Perpanjangan (opsional)</label>
          <textarea
            name="catatanPerpanjangan"
            value={form.catatanPerpanjangan || ''}
            onChange={handleChange}
            placeholder="Catatan perpanjangan (opsional)..."
            rows={2}
            className="input-field w-full"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold mb-1">Judul Kerjasama</label>
          <input name="judulKerjasama" value={form.judulKerjasama} onChange={handleChange} className="input-field w-full" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold mb-1">Deskripsi</label>
          <textarea name="deskripsi" value={form.deskripsi} onChange={handleChange} className="input-field w-full" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold mb-1">Ruang Lingkup</label>
          <input name="ruangLingkup" value={form.ruangLingkup.join(', ')} onChange={e => setForm({ ...form, ruangLingkup: e.target.value.split(',').map((s: string) => s.trim()) })} className="input-field w-full" />
        </div>
      </div>
      </div>
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 md:p-4 mb-3">
        <h3 className="font-bold text-blue-900 mb-2 text-base">Kontak Person Mitra</h3>
        <div className="grid md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold mb-1">Nama Kontak Person</label>
          <input name="kontakNama" value={form.kontakNama} onChange={handleChange} className="input-field w-full" />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Jabatan</label>
          <input name="kontakJabatan" value={form.kontakJabatan} onChange={handleChange} className="input-field w-full" />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Email</label>
          <input name="kontakEmail" value={form.kontakEmail} onChange={handleChange} className="input-field w-full" />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">WhatsApp Aktif</label>
          <input name="kontakTelepon" value={form.kontakTelepon} onChange={handleChange} className="input-field w-full" />
        </div>
      </div>
      </div>
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 md:p-4 mb-3">
        <h3 className="font-bold text-blue-900 mb-2 text-base">Pengajuan Perpanjangan</h3>
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1">Dari Tanggal (Perpanjangan Baru)</label>
            <input
              type="date"
              name="tanggalMulaiBaru"
              value={form.tanggalMulaiBaru || ''}
              onChange={handleChange}
              className="input-field w-full"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Sampai Tanggal (Perpanjangan Baru)</label>
            <input
              type="date"
              name="tanggalBerakhirBaru"
              value={form.tanggalBerakhirBaru || ''}
              onChange={handleChange}
              className="input-field w-full"
            />
          </div>
        </div>
        <div className="mt-3">
          <label className="block text-xs font-semibold mb-1">Alasan Perpanjangan <span className="text-red-500">*</span></label>
          <textarea
            name="catatanPerpanjangan"
            value={form.catatanPerpanjangan || ''}
            onChange={handleChange}
            placeholder="Jelaskan alasan perpanjangan kerjasama..."
            rows={2}
            className="input-field w-full"
            required
          />
        </div>
        {/* Step pengajuan ke mitra */}
        {step === 'mitra' && (
          <button
            type="button"
            className="mt-4 w-full rounded-lg bg-blue-600 text-white font-semibold py-2.5 text-sm hover:bg-blue-700 transition-colors"
            onClick={() => setStep('perpanjangan')}
            disabled={!form.catatanPerpanjangan || form.catatanPerpanjangan.trim() === ''}
          >
            Ajukan Kerjasama
          </button>
        )}
        {step === 'perpanjangan' && (
          <div className="mt-4">
            <div className="mb-2 text-green-700 text-sm font-semibold">Sudah hubungi mitra untuk perpanjangan terlebih dahulu. Silakan lengkapi dokumen dan ajukan perpanjangan.</div>
            <button type="submit" className="btn-primary w-full mt-2">Ajukan Perpanjangan</button>
          </div>
        )}
      </div>
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 mb-2">
        <h3 className="font-bold text-blue-900 mb-2 text-base">Dokumen Pendukung (MoU/MoA/IA)</h3>
        {dokumen.length > 0 && (
          <div className="flex items-center gap-2 mb-2">
            <a href={dokumen[0].url} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline text-xs">
              <Upload size={14} className="inline mr-1" />
              {dokumen[0].nama} ({dokumen[0].ukuran})
            </a>
            <button type="button" onClick={handleRemoveDokumen} className="text-red-500 hover:text-red-700 text-xs"><X size={14} /></button>
          </div>
        )}
        <button type="button" onClick={handleAddDokumen} className="flex items-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 py-2 px-3 text-xs font-medium text-gray-500 transition-colors hover:border-gray-400 hover:text-gray-700">
          <Plus size={14} /> {dokumen.length > 0 ? 'Ganti Dokumen' : 'Upload Dokumen MoU/MoA/IA'}
        </button>
        <div className="text-xs text-gray-500 mt-1">Hanya file MoU, MoA, IA yang didukung (.pdf, .doc, .docx, .xls, .xlsx, .jpg, .jpeg, .png)</div>
      </div>
      {error && <div className="text-xs text-red-600 mt-2">{error}</div>}
    </form>
  );
}
