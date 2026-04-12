'use client';

import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, FileText, RefreshCw, BarChart3,
  BookOpen, Archive, Users, Menu, X,
} from 'lucide-react';

interface AdminSidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: FileText, label: 'Data Pengajuan', href: '/admin/data_pengajuan' },
  { icon: RefreshCw, label: 'Rekap Data', href: '/admin/rekap_data' },
  { icon: BarChart3, label: 'Monitoring & Status', href: '/admin/monitoring' },
  { icon: BookOpen, label: 'Story & Aktivitas', href: '/admin/story_aktivitas' },
  { icon: Archive, label: 'Arsip Dokumen', href: '/admin/arsip_dokumen' },
  { icon: Users, label: 'Manajemen User', href: '/admin/manajemen_users' },
];

export default function AdminSidebar({ isOpen, toggleSidebar }: AdminSidebarProps) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/40 z-20 md:hidden" onClick={toggleSidebar} />}

      <aside className={`fixed md:relative top-0 left-0 h-[calc(100vh-250px)] md:h-auto bg-[#1E376C] text-gray-300 z-30 flex flex-col transition-all duration-300 rounded-lg shadow-md
        ${isOpen ? 'w-48 md:w-44' : 'w-20'}
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between p-3 md:p-4 border-b border-[#1E376C]/50">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">S</div>
            {isOpen && (
              <div className="text-xs font-bold truncate">
                <p className="text-white leading-tight">SIKERMA</p>
                <p className="text-gray-400 text-xs leading-tight">Polibatam</p>
              </div>
            )}
          </div>
          <button onClick={toggleSidebar} className="text-gray-400 hover:text-white md:hidden flex-shrink-0">
            {isOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 flex flex-col px-2 gap-0.5 overflow-y-auto py-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <a
                key={item.href}
                href={item.href}
                title={!isOpen ? item.label : undefined}
                className={`flex items-center gap-2 px-3 py-2 rounded transition-colors duration-200 text-sm
                  ${active ? 'bg-blue-500 text-white' : 'text-gray-400 hover:bg-[#2A4A8F] hover:text-white'}
                `}
              >
                <Icon size={16} className="flex-shrink-0" />
                {isOpen && <span className="truncate text-xs">{item.label}</span>}
              </a>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="text-gray-500 text-center p-2 md:p-3 border-t border-[#1E376C]/50 text-xs">
          {isOpen ? '© 2025' : '©'}
        </div>
      </aside>
    </>
  );
}