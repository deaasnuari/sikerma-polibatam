'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  ArrowLeft,
  ChevronDown,
  Lock,
  Mail,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const loggedInUser = await login(email, password, role);

      const roleRouteMap: Record<string, string> = {
        admin: '/admin',
        pimpinan: '/pimpinan',
        internal: '/internal/dashboard',
        external: '/eksternal',
      };

      router.push(roleRouteMap[loggedInUser.role] || '/admin');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Login gagal. Silakan coba lagi.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (!email.trim()) {
      setError('Masukkan email terdaftar terlebih dahulu untuk reset password.');
      return;
    }

    const subject = encodeURIComponent('Reset Password SIKERMA');
    const body = encodeURIComponent(
      `Halo Admin SIKERMA,\n\nSaya ingin melakukan reset password untuk akun dengan email: ${email.trim()}\n\nTerima kasih.`
    );

    window.location.href = `mailto:humas@polibatam.ac.id?subject=${subject}&body=${body}`;
  };

  return (
    <div
      className="min-h-screen bg-slate-900 bg-cover bg-center bg-no-repeat px-4 py-6"
      style={{ backgroundImage: "url('/polibatam.jpg')" }}
    >
      <div className="flex min-h-screen items-center justify-center bg-slate-950/55">
        <div className="w-full max-w-[420px] rounded-[30px] border border-white/30 bg-white/90 p-5 text-slate-800 shadow-[0_20px_60px_rgba(15,23,42,0.45)] backdrop-blur-md md:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <ArrowLeft size={14} />
              Home
            </button>

            <img src="/polibatam_logo.png" alt="Logo Polibatam" className="h-9 w-auto object-contain" />
          </div>

          <div className="mb-5 text-center">
            <p className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#173B82]">
              Sikerma Polibatam
            </p>
            <h2 className="mt-3 text-3xl font-extrabold text-[#173B82]">Login</h2>
            <p className="mt-1 text-sm text-slate-500">
              Masuk untuk mengakses sistem kerja sama Polibatam.
            </p>
          </div>

          <div className="mb-4 rounded-xl border border-blue-100 bg-blue-50/90 p-3 text-xs leading-relaxed text-slate-600">
            Registrasi mandiri saat ini hanya untuk <span className="font-semibold text-[#173B82]">mitra eksternal</span>.
            Setelah daftar, akun mitra bisa langsung login tanpa menunggu approval.
          </div>

          {error && (
            <div className="mb-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3">
              <AlertCircle size={17} className="mt-0.5 shrink-0 text-red-600" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[#173B82]">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Masukkan email terdaftar"
                  autoComplete="email"
                  className="input-field h-11 w-full rounded-xl pl-10 pr-4 text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[#173B82]">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password akun"
                  autoComplete="current-password"
                  className="input-field h-11 w-full rounded-xl pl-10 pr-4 text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[#173B82]">
                Role Akses
              </label>
              <div className="relative">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="input-field h-11 w-full appearance-none rounded-xl px-4 text-sm text-slate-600"
                  required
                >
                  <option value="" disabled>
                    Pilih Role
                  </option>
                  <option value="admin">Admin/Humas</option>
                  <option value="pimpinan">Pimpinan</option>
                  <option value="internal">Internal</option>
                  <option value="external">Eksternal</option>
                </select>
                <ChevronDown
                  size={18}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#173B82]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary h-11 w-full rounded-xl font-semibold disabled:cursor-not-allowed disabled:opacity-60"
            >
                {isLoading ? 'Memproses...' : 'Masuk'}
            </button>

            <div className="flex items-center justify-between pt-1 text-xs text-slate-600">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-slate-300 text-[#173B82] focus:ring-[#173B82]"
                />
                Ingat Saya
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="font-semibold text-[#173B82] transition hover:underline"
              >
                Lupa Password?
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Gunakan email yang terdaftar dan password akun Anda untuk masuk.
            </p>
          </form>

          <div className="mt-5 border-t border-slate-200 pt-3 text-center text-sm text-slate-600">
            Belum punya akun mitra?{' '}
            <button
              type="button"
              onClick={() => router.push('/register')}
              className="font-semibold text-[#173B82] hover:underline"
            >
              Registrasi Mitra
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
