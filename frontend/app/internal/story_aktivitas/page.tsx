export default function InternalStoryAktivitasPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-[#173B82]">Story Aktivitas</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Aktivitas Kerja Sama Internal</h1>
        <p className="mt-2 text-sm text-slate-600">
          Dokumentasi aktivitas dan perkembangan kerja sama unit internal kampus.
        </p>
      </div>

      <div className="space-y-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="font-semibold text-slate-900">Koordinasi Mitra Industri</p>
          <p className="mt-1 text-sm text-slate-600">Pertemuan lanjutan untuk evaluasi implementasi kerja sama semester berjalan.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="font-semibold text-slate-900">Monitoring Dokumen</p>
          <p className="mt-1 text-sm text-slate-600">Pemeriksaan status dokumen dan tindak lanjut unit pengusul.</p>
        </div>
      </div>
    </div>
  );
}
