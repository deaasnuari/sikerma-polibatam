'use client';

const kerjasamaItems = [
  {
    title: 'Kerjasama Magang Mahasiswa',
    jenis: 'MoU',
    status: 'Aktif',
    mitra: 'Politeknik Negeri Batam',
    periode: 'Jan 2026 - Jan 2028',
  },
  {
    title: 'Program Sertifikasi Industri',
    jenis: 'MoA',
    status: 'Aktif',
    mitra: 'Politeknik Negeri Batam',
    periode: 'Des 2025 - Des 2027',
  },
  {
    title: 'Pengembangan Kurikulum Bersama',
    jenis: 'IA',
    status: 'Menunggu',
    mitra: 'Politeknik Negeri Batam',
    periode: 'Feb 2026 - Proses Review',
  },
];

export default function DaftarKerjasamaEksternalPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Daftar Kerjasama</h1>
        <p className="text-sm text-slate-500">Daftar kerjasama yang sedang berjalan dari sisi mitra eksternal.</p>
      </div>

      <div className="space-y-3">
        {kerjasamaItems.map((item) => (
          <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-lg font-bold text-slate-900">{item.title}</p>
                <p className="mt-1 text-sm text-slate-500">{item.mitra}</p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1">{item.jenis}</span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1">{item.periode}</span>
                </div>
              </div>

              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.status === 'Aktif' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                {item.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
