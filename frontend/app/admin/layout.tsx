'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminNavbar from '@/components/admin/AdminNavbar';
import AdminFooter from '@/components/admin/AdminFooter';
import ProtectedRoute from '@/app/components/ProtectedRoute';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Handle hydration to prevent mismatch between server and client
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Handle responsive sidebar behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Auto close sidebar on mobile, auto open on desktop
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Don't render until hydrated to prevent hydration mismatch
  if (!isHydrated) {
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="flex flex-col h-screen bg-gray-100">
        {/* Fixed Navbar - Full Width */}
        <AdminNavbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* Main Container - Sidebar + Content with gaps */}
        <div className="flex flex-1 overflow-hidden gap-4 px-4 pt-4">
          {/* Sidebar with gap */}
          <div className="flex-shrink-0">
            <AdminSidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          </div>

          {/* Main Content Area */}
          <main className="flex-1 flex flex-col overflow-hidden pb-4">
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto bg-white rounded-lg shadow-sm p-6">
              {children}
            </div>
          </main>
        </div>

        {/* Footer - Full Width at Bottom */}
        <div className="flex-shrink-0 px-4 pb-4">
          <AdminFooter />
        </div>
      </div>
    </ProtectedRoute>
  );
}