'use client';

import Link from 'next/link';
import { Send, ShieldCheck } from 'lucide-react';

export default function PengajuanBaruEksternalPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Pengajuan Baru</h1>
        <p className="text-sm text-slate-500">Ajukan inisiasi kerjasama baru sebagai mitra eksternal.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-[#071B3C]">
          <ShieldCheck size={18} />
          <p className="font-bold">Alur Pengajuan Mitra</p>
        </div>

        <ol className="space-y-3 text-sm text-slate-600">
          <li>1. Siapkan informasi mitra dan ruang lingkup kerjasama.</li>
          <li>2. Kirim detail awal melalui admin SIKERMA.</li>
          <li>3. Tunggu verifikasi dan tindak lanjut dari pihak Polibatam.</li>
        </ol>

        <div className="mt-5">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-lg bg-[#071B3C] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0d2b5b]"
          >
            <Send size={16} />
            Hubungi Admin SIKERMA
          </Link>
        </div>
      </div>
    </div>
  );
}
