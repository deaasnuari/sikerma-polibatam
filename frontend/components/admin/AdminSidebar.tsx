'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, FileText, RefreshCw, BarChart3,
  BookOpen, Archive, Users, Menu, X,
  type LucideIcon,
} from 'lucide-react';

export interface SidebarMenuItem {
  icon: LucideIcon;
  label: string;
  href: string;
  children?: Array<{ label: string; href: string }>;
  onClick?: () => void;
}

interface AdminSidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  menuItems?: SidebarMenuItem[];
  portalTitle?: string;
  portalSubtitle?: string;
  backgroundClassName?: string;
  activeItemClassName?: string;
}

const defaultMenuItems: SidebarMenuItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: FileText, label: 'Data Pengajuan', href: '/admin/data_pengajuan' },
  { icon: RefreshCw, label: 'Rekap Data', href: '/admin/rekap_data' },
  {
    icon: BarChart3,
    label: 'Monitoring & Status',
    href: '/admin/monitoring',
    children: [{ label: 'Permintaan Perpanjangan', href: '/admin/monitoring/perpanjangan' }],
  },
  { icon: BookOpen, label: 'Story & Aktivitas', href: '/admin/story_aktivitas' },
  { icon: Archive, label: 'Arsip Dokumen', href: '/admin/arsip_dokumen' },
  { icon: Users, label: 'Manajemen User', href: '/admin/manajemen_users' },
];

export default function AdminSidebar({
  isOpen,
  toggleSidebar,
  menuItems = defaultMenuItems,
  portalTitle = 'SIKERMA',
  portalSubtitle = 'Polibatam',
  backgroundClassName = 'bg-[#091222]',
  activeItemClassName = 'border-l-[#57C9E8] bg-[#57C9E8]/15 text-white shadow-sm',
}: AdminSidebarProps) {
  const pathname = usePathname();

  const exactOnlyRoutes = new Set(['/admin', '/internal/dashboard', '/eksternal', '/pimpinan']);

  const isActive = (href: string) => {
    if (exactOnlyRoutes.has(href)) {
      return pathname === href;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && <div className="fixed inset-0 bg-black/40 z-20 md:hidden" onClick={toggleSidebar} />}

      {/* Sidebar */}
      <aside className={`fixed md:relative top-0 left-0 h-full md:h-full ${backgroundClassName} text-gray-300 z-30 flex flex-col transition-all duration-300 rounded-lg shadow-md overflow-visible
        ${isOpen ? 'w-48 md:w-44' : 'w-20'}
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-4 z-40 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-[#091222] shadow-md transition hover:bg-slate-50 hover:text-[#173B82]"
          title={isOpen ? 'Tutup sidebar' : 'Buka sidebar'}
        >
          {isOpen ? <X size={16} /> : <Menu size={16} />}
        </button>

        {/* Logo */}
        <div className="flex items-center justify-between p-3 md:p-4 border-b border-slate-700/60">
          <div className="flex items-center gap-2 min-w-0">
            <img src="/polibatam_logo.png" alt="Logo" className="w-8 h-8 object-contain flex-shrink-0" />
            {isOpen && (
              <div className="text-xs font-bold truncate">
                <p className="text-white text-sm leading-tight">{portalTitle}</p>
                <p className="text-gray-400 text-xs leading-tight">{portalSubtitle}</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigasi */}
        <nav className="flex-1 flex flex-col px-2 gap-1 overflow-y-auto py-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = item.onClick ? false : isActive(item.href);
            const showChildren = Boolean(
              isOpen &&
              item.children?.length &&
              (pathname === item.href || pathname.startsWith(`${item.href}/`))
            );
            const sharedClassName = `flex w-full items-center ${isOpen ? 'gap-2 px-3 justify-start' : 'justify-center px-2'} rounded-lg border-l-4 py-2.5 transition-all duration-200 text-sm ${
              active
                ? activeItemClassName
                : 'border-l-transparent text-slate-300 hover:bg-white/5 hover:text-white'
            }`;

            if (item.onClick) {
              return (
                <button
                  key={`${item.label}-${item.href}`}
                  type="button"
                  onClick={item.onClick}
                  title={!isOpen ? item.label : undefined}
                  className={sharedClassName}
                >
                  <Icon size={16} className="flex-shrink-0" />
                  {isOpen && <span className="truncate text-xs font-medium">{item.label}</span>}
                </button>
              );
            }

            return (
              <div key={`${item.label}-${item.href}`} className="space-y-1">
                <Link
                  href={item.href}
                  title={!isOpen ? item.label : undefined}
                  className={sharedClassName}
                >
                  <Icon size={16} className="flex-shrink-0" />
                  {isOpen && <span className="truncate text-xs font-medium">{item.label}</span>}
                </Link>

                {showChildren && (
                  <div className="ml-7 space-y-1 border-l border-slate-600/60 pl-3">
                    {item.children?.map((child) => {
                      const childActive = pathname === child.href || pathname.startsWith(`${child.href}/`);

                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`block rounded-md px-2 py-1.5 text-[11px] font-medium transition-colors ${
                            childActive
                              ? 'bg-[#57C9E8]/20 text-white'
                              : 'text-slate-300 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="text-gray-500 text-center p-2 md:p-3 border-t border-slate-700/60 text-xs">
          {isOpen ? '© 2026 Politeknik Negeri Batam' : '©'}
        </div>
      </aside>
    </>
  );
}