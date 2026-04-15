'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, ChevronDown, Lock, User } from 'lucide-react';
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
      await login(email, password, role);
      router.push('/admin');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Login gagal. Silakan coba lagi.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#091222] text-white flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Header Brand */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-3 w-20 h-20 rounded-full bg-cyan-300/90 flex items-center justify-center">
            <div className="w-12 h-6 rounded-full border-4 border-white/80 border-l-transparent border-b-transparent rotate-[-20deg]" />
          </div>
          <p className="text-3xl font-extrabold tracking-wide">SIKERMA POLIBATAM</p>
          <p className="text-sm md:text-base text-blue-100 mt-2 leading-relaxed">
            Sistem Informasi Kerjasama
            <br />
            Politeknik Negeri Batam
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#F4F6FA] text-slate-800 rounded-2xl shadow-2xl px-8 py-8 md:px-10">
          <div className="text-center mb-7">
            <h1 className="text-4xl font-extrabold text-[#173B82]">SELAMAT DATANG</h1>
            <p className="text-sm text-slate-500 mt-1">
              Silakan Login Menggunakan Akun LDPI Anda
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle size={18} className="text-red-600 mt-0.5 shrink-0" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username / Email */}
            <div>
              <label className="block text-sm font-semibold text-[#173B82] mb-2">
                Username / Email
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-slate-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Masukkan Username dan Email"
                  className="input-field w-full h-11 pl-10 pr-4 text-sm"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-[#173B82] mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan Password"
                  className="input-field w-full h-11 pl-10 pr-4 text-sm"
                  required
                />
              </div>
            </div>

            {/* Role */}
            <div className="relative">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="input-field appearance-none w-full h-11 px-4 text-sm text-slate-600"
                required
              >
                <option value="" disabled>
                  Pilih Role
                </option>
                <option value="admin-humas">Admin/Humas</option>
                <option value="pimpinan">Pimpinan</option>
                <option value="internal">Internal</option>
                <option value="external">External</option>
              </select>
              <ChevronDown
                size={18}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#173B82]"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full h-11 font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Memproses...' : 'Login →'}
            </button>

            {/* Bottom Form Actions */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="inline-flex items-center gap-2 text-slate-600">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-[#173B82] focus:ring-[#173B82]"
                />
                Ingat Saya
              </label>
              <button
                type="button"
                className="text-slate-500 hover:text-[#173B82] transition"
              >
                Lupa Password?
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-slate-200 pt-4 text-center text-sm text-slate-600">
            Belum Punya Akses?{' '}
            <button type="button" className="font-semibold text-[#173B82] hover:underline">
              Hubungi Administrator
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-blue-100/90 text-sm mt-8">
          © 2026 Politeknik Negeri Batam - Sistem Informasi Kerjasama
        </p>
      </div>
    </div>
  );
}
