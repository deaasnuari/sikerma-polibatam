'use client';

import { useRouter } from 'next/navigation';
import { BarChart3, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function PimpinanPage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between rounded-2xl bg-white p-6 shadow-sm">
          <div>
            <p className="text-sm font-semibold text-rose-700">Dashboard Pimpinan</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">Selamat datang, {user?.name || 'Pimpinan'}</h1>
            <p className="mt-2 text-sm text-slate-600">Halaman ini dipakai untuk pemantauan ringkas dan akses pimpinan.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              logout();
              router.push('/login');
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-slate-800">
              <ShieldCheck size={18} />
              <p className="font-semibold">Akses Pengguna</p>
            </div>
            <p className="text-sm text-slate-600">Nama: {user?.name || '-'}</p>
            <p className="text-sm text-slate-600">Email: {user?.email || '-'}</p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-slate-800">
              <BarChart3 size={18} />
              <p className="font-semibold">Ringkasan</p>
            </div>
            <p className="text-sm text-slate-600">Dashboard pimpinan sudah aktif dan siap digunakan untuk monitoring.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
