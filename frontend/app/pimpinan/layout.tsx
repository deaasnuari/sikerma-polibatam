'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import AdminNavbar from '@/components/admin/AdminNavbar';
import AdminFooter from '@/components/admin/AdminFooter';
import AdminSidebar, { type SidebarMenuItem } from '@/components/admin/AdminSidebar';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function PimpinanLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setSidebarOpen(!mobile);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const menuItems: SidebarMenuItem[] = [
    {
      label: 'Dashboard',
      href: '/pimpinan',
      icon: LayoutDashboard,
    },
    {
      label: 'Daftar Kerjasama',
      href: '/pimpinan/daftar_kerjasama',
      icon: FileText,
    },
  ];

  return (
    <ProtectedRoute requiredRole="pimpinan">
      <div className="flex h-screen flex-col bg-gray-100">
        <div className="sticky top-0 z-50 px-4 pt-4">
          <AdminNavbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        </div>

        <div className="flex min-h-0 flex-1 gap-4 overflow-hidden px-4 pt-4 pb-2">
          <div className="h-full flex-shrink-0 self-stretch">
            <AdminSidebar
              isOpen={sidebarOpen}
              toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
              menuItems={menuItems}
              portalTitle="SIKERMA"
              portalSubtitle="Pimpinan"
              backgroundClassName="bg-[#091222]"
              activeItemClassName="border-l-[#f5c542] bg-white/12 text-white shadow-sm"
            />
          </div>

          <main className="flex flex-1 flex-col overflow-hidden pb-4">
            <div className="flex-1 overflow-y-auto rounded-lg bg-white p-6 shadow-sm">
              {children}
            </div>
          </main>
        </div>

        <div className="flex-shrink-0 px-4 pb-4">
          <AdminFooter />
        </div>
      </div>
    </ProtectedRoute>
  );
}
