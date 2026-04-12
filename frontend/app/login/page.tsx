'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'Login gagal. Coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-lg mb-4">
              <Lock className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
            <p className="text-gray-600 text-sm mt-1">Masuk ke sistem manajemen</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                Ingat saya
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              {isLoading ? 'Sedang masuk...' : 'Masuk'}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-600 text-center mb-3">Demo Credentials:</p>
            <div className="bg-gray-50 p-3 rounded text-xs text-gray-700 space-y-1">
              <p>Email: <span className="font-mono">admin@example.com</span></p>
              <p>Password: <span className="font-mono">admin123</span></p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-300 text-sm mt-6">
          © 2026 SIKERMA. All rights reserved.
        </p>
      </div>
    </div>
  );
}
