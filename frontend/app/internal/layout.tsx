'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  ClipboardList,
  LayoutDashboard,
  NotebookPen,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import AdminNavbar from '@/components/admin/AdminNavbar';
import AdminFooter from '@/components/admin/AdminFooter';
import AdminSidebar, { type SidebarMenuItem } from '@/components/admin/AdminSidebar';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const menuItems: SidebarMenuItem[] = [
  {
    label: 'Dashboard',
    href: '/internal/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Data Pengajuan',
    href: '/internal/data_pengajuan',
    icon: NotebookPen,
  },
  {
    label: 'Rekap Data',
    href: '/internal/rekap_data',
    icon: BookOpen,
  },
  {
    label: 'Story Aktivitas',
    href: '/internal/story_aktivitas',
    icon: ClipboardList,
  },
];

export default function InternalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { logout } = useAuth();
  const [isHydrated, setIsHydrated] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

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

  if (!isHydrated) {
    return null;
  }

  return (
    <ProtectedRoute requiredRole="internal">
      <div className="flex h-screen flex-col bg-gray-100">
        <div className="sticky top-0 z-50 px-4 pt-4">
          <AdminNavbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        </div>

        <div className="flex flex-1 overflow-hidden gap-4 px-4 pt-4 pb-2 min-h-0">
          <div className="flex-shrink-0 h-full self-stretch">
            <AdminSidebar
              isOpen={sidebarOpen}
              toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
              menuItems={menuItems}
              portalTitle="SIKERMA"
              portalSubtitle="Internal"
              backgroundClassName="bg-[#16396b]"
            />
          </div>

          <main className="flex-1 flex flex-col overflow-hidden pb-4">
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
