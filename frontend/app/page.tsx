'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading || !isAuthenticated || !user) {
      return;
    }

    const roleRouteMap: Record<string, string> = {
      admin: '/admin',
      pimpinan: '/pimpinan',
      internal: '/internal/dashboard',
      external: '/eksternal',
    };

    router.replace(roleRouteMap[user.role] || '/login');
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navbar */}
        <nav className="flex justify-between items-center py-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-900">SIKERMA POLIBATAM</h1>
              <p className="text-xs text-gray-600">Sistem Informasi Kerjasama</p>
            </div>
          </div>
          <div className="hidden md:flex gap-6">
            <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">Beranda</a>
            <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">Info Kerjasama</a>
            <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">Kontak</a>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">Register</button>
            <a href="/login" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Login</a>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="py-20">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-5xl font-bold text-gray-900 mb-4">Selamat Datang</h2>
            <p className="text-xl text-gray-600 mb-2">di Website Resmi</p>
            <p className="text-xl text-gray-600 mb-8">Bagian Kerjasama Politeknik Negeri Batam</p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <div className="text-4xl font-bold text-blue-600">154</div>
                <p className="text-gray-600 text-sm mt-2">Dua Nasional</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-blue-600">7</div>
                <p className="text-gray-600 text-sm mt-2">Dua Internasional</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-blue-600">292</div>
                <p className="text-gray-600 text-sm mt-2">Institusi Nasional</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-blue-600">24</div>
                <p className="text-gray-600 text-sm mt-2">Institusi Internasional</p>
              </div>
            </div>
          </div>
        </section>

        {/* Info Cards */}
        <section className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-8">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="font-bold text-lg mb-2">Total Kerjasama</h3>
              <p className="text-3xl font-bold text-blue-600 mb-4">478</p>
              <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">Lihat →</a>
            </div>
            <div className="card p-8">
              <div className="text-4xl mb-4">📁</div>
              <h3 className="font-bold text-lg mb-2">Dalam Negeri</h3>
              <p className="text-3xl font-bold text-blue-600 mb-4">447</p>
              <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">Lihat →</a>
            </div>
            <div className="card p-8">
              <div className="text-4xl mb-4">🌍</div>
              <h3 className="font-bold text-lg mb-2">Luar Negeri</h3>
              <p className="text-3xl font-bold text-blue-600 mb-4">31</p>
              <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">Lihat →</a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-200 py-12 mt-20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4">SIKERMA POLIBATAM</h4>
              <p className="text-sm text-gray-600">Sistem Informasi Kerjasama - Politeknik Negeri Batam</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Menu</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900">Beranda</a></li>
                <li><a href="#" className="hover:text-gray-900">Info Kerjasama</a></li>
                <li><a href="#" className="hover:text-gray-900">Kontak</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Kontak</h4>
              <p className="text-sm text-gray-600">📞 +62-778-469829</p>
              <p className="text-sm text-gray-600">📧 info@polibatam.ac.id</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Alamat</h4>
              <p className="text-sm text-gray-600">Jl. Ahmad Yani, Sekupat, Kota Batam, Kepulauan Riau</p>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-8">
            <p className="text-sm text-gray-600 text-center">© 2025 Politeknik Negeri Batam. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </main>
  );
}
