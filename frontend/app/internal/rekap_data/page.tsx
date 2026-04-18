export default function InternalRekapDataPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-[#173B82]">Rekap Data</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Ringkasan Kerja Sama Internal</h1>
        <p className="mt-2 text-sm text-slate-600">
          Halaman ini menampilkan rekapitulasi data kerja sama per unit dan jurusan.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Total Pengajuan</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">148</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Disetujui</p>
          <p className="mt-2 text-2xl font-bold text-emerald-600">121</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Dalam Proses</p>
          <p className="mt-2 text-2xl font-bold text-amber-500">27</p>
        </div>
      </div>
    </div>
  );
}
