'use client';

import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { Menu, LogOut, User, Bell } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getAdminNotifications } from '@/services/adminService';
import { useRouter } from 'next/navigation';

interface AdminNavbarProps {
  toggleSidebar: () => void;
}

export default function AdminNavbar({ toggleSidebar }: AdminNavbarProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const router = useRouter();

  const notifications = getAdminNotifications();
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setShowUserMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(target)) {
        setShowNotifications(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white sticky top-0 z-40 shadow-sm border border-slate-200 rounded-lg">
      <div className="px-4 py-3 md:py-3.5 flex justify-between items-center">
        {/* Left - Logo/Brand */}
        <div className="flex items-center gap-2 flex-1">
          <button
            onClick={toggleSidebar}
            className="text-[#091222] hover:bg-slate-100 rounded p-2 transition-all duration-200 md:hidden flex-shrink-0"
            title="Toggle sidebar"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center justify-center flex-shrink-0">
              <Image
                src="/logo-polibatam.png"
                alt="Logo Polibatam"
                width={30}
                height={30}
                className="h-14 w-auto object-contain"
                priority
              />
            </div>
            <div className="min-w-0 hidden sm:block">
              <p className="text-[#091222] font-extrabold text-sm leading-tight tracking-wide">SIKERMA POLIBATAM</p>
              <p className="text-gray-600 text-[11px] leading-tight">Sistem Informasi Kerjasama</p>
            </div>
          </div>
        </div>

        {/* Right - Notification & User Menu */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Notification Button */}
          <div className="relative" ref={notifRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative text-gray-700 hover:bg-gray-100 rounded-lg p-2 transition-all duration-200"
              title="Notifikasi"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Bell size={18} className="text-[#173B82]" />
                    Notifikasi Terbaru
                  </h3>
                  <a href="#" className="text-xs text-[#173B82] hover:text-[#091222] font-medium">Lihat Semua</a>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div key={notif.id} className={`px-4 py-3 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors ${!notif.read ? 'bg-slate-50' : ''}`}>
                        <div className="flex gap-3">
                          <div className="w-2 h-2 bg-[#173B82] rounded-full mt-2 flex-shrink-0"></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900">{notif.title}</p>
                            <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
                            <p className="text-xs text-gray-500 mt-1">📌 dari: {notif.from}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-6 text-center text-gray-600">Tidak ada notifikasi</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative flex-shrink-0" ref={userMenuRef}>
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 text-gray-700 hover:bg-gray-100 rounded-lg px-3 py-2 transition-all duration-200"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user?.name?.split(' ')[0] || 'User'}</p>
                <p className="text-xs text-gray-600">Admin</p>
              </div>
              <div className="w-9 h-9 bg-[#091222] border border-slate-700 rounded-full flex items-center justify-center text-white hover:bg-[#173B82] transition-all">
                <User size={18} />
              </div>
            </button>

            {/* User Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-lg shadow-xl py-0 z-50 overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-semibold text-gray-900">{user?.email}</p>
                  <p className="text-xs text-gray-600">Administrator</p>
                </div>
                <div className="p-2">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors rounded font-medium"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
