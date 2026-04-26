'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  TrendingUp,
  Handshake,
  Building2,
  Globe,
  BarChart3,
  Zap,
  FileText,
} from 'lucide-react';
import {
  getAdminNotifications,
  getDashboardStats,
  getDocumentTypeDistribution,
  getPopularSchemes,
  getQuickActions,
  getRegionalDistribution,
  markNotificationAsRead,
} from '@/services/adminService';
import type { AdminNotification } from '@/types/admin';

const AdminDashboardCharts = dynamic(() => import('./components/AdminDashboardCharts'), {
  ssr: false,
  loading: () => (
    <div className="card p-6 text-sm text-gray-500">Memuat statistik...</div>
  ),
});

const statIcons = {
  handshake: Handshake,
  building: Building2,
  globe: Globe,
  chart: BarChart3,
  zap: Zap,
  file: FileText,
  users: Users,
};

const actionIcons = {
  handshake: Handshake,
  users: Users,
  trending: TrendingUp,
};

export default function AdminDashboard() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const router = useRouter();
  const dashboardStats = getDashboardStats();
  const quickActions = getQuickActions();
  const regionalDistribution = getRegionalDistribution();
  const documentTypeDistribution = getDocumentTypeDistribution();
  const popularSchemes = getPopularSchemes();

  useEffect(() => {
    const syncNotifications = () => {
      setNotifications(getAdminNotifications());
    };

    syncNotifications();
    window.addEventListener('admin-notifications-updated', syncNotifications);

    return () => window.removeEventListener('admin-notifications-updated', syncNotifications);
  }, []);

  const handleOpenNotification = (notification: AdminNotification) => {
    setNotifications(markNotificationAsRead(notification.id));
    router.push(notification.href || '/admin/notifikasi');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 text-sm md:text-base mt-2">
          Selamat datang di SIKERMA v2.0 - Sistem Informasi Kerjasama Politeknik Negeri Batam
        </p>
      </div>

      <div className="card p-4 md:p-6">
        <div className="flex items-center justify-between mb-4 gap-3">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            Notifikasi Terbaru
          </h2>
          <Link href="/admin/notifikasi" className="text-sm text-[#173B82] hover:text-[#091222] font-medium">
            Lihat Semua
          </Link>
        </div>

        <div className="space-y-3">
          {notifications.length > 0 ? (
            notifications.slice(0, 3).map((notification, index) => (
              <button
                key={notification.id}
                onClick={() => handleOpenNotification(notification)}
                className={`w-full text-left bg-white border-l-4 ${index === 0 ? 'border-green-500' : 'border-[#173B82]'} rounded-lg p-4 flex gap-3 hover:shadow-md transition-shadow cursor-pointer ${!notification.read ? 'bg-slate-50/70' : ''}`}
              >
                <div className={`w-6 h-6 ${index === 0 ? 'bg-green-100' : 'bg-slate-100'} rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <svg className={`w-4 h-4 ${index === 0 ? 'text-green-600' : 'text-[#173B82]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {index === 0 ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    )}
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-900">{notification.title}</p>
                    <span className="text-[11px] text-slate-400 whitespace-nowrap">{notification.createdAt}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">📌 dari: {notification.from}</p>
                </div>
              </button>
            ))
          ) : (
            <div className="rounded-lg border border-dashed border-slate-200 px-4 py-6 text-center text-gray-500">
              Belum ada notifikasi terbaru.
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        {dashboardStats.map((stat, idx) => {
          const IconComponent = statIcons[stat.iconKey];
          return (
            <button key={idx} className={`${stat.color} rounded-lg p-3 md:p-4 text-center hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer`}>
              <div className="flex justify-center mb-2">
                <IconComponent size={24} className={stat.textColor} />
              </div>
              <p className={`text-xs md:text-sm font-medium ${stat.textColor}`}>{stat.label}</p>
              <p className="text-lg md:text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </button>
          );
        })}
      </div>

      <div className="card p-5 md:p-6">
        <div className="mb-4">
          <h2 className="text-lg md:text-xl font-bold text-gray-900">Quick Access</h2>
          <p className="text-sm text-gray-600 mt-1">Akses cepat ke menu utama yang sering digunakan.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
          {quickActions.map((action, idx) => {
            const IconComponent = actionIcons[action.iconKey];
            const isPrimary = idx === 0;

            return (
              <Link
                key={action.href}
                href={action.href}
                className={`${action.color} border rounded-xl p-4 md:p-5 hover:shadow-md transition-all block`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${isPrimary ? 'bg-white/15' : 'bg-white'} border ${isPrimary ? 'border-white/20' : 'border-slate-200'}`}>
                    <IconComponent size={22} className={isPrimary ? 'text-white' : 'text-[#173B82]'} />
                  </div>
                  <span className={`text-xs font-semibold ${isPrimary ? 'text-sky-100' : 'text-[#173B82]'}`}>Quick Access</span>
                </div>

                <h3 className={`text-sm md:text-base font-bold ${isPrimary ? 'text-white' : 'text-gray-900'}`}>{action.label}</h3>
                <p className={`text-xs mt-1 ${isPrimary ? 'text-slate-200' : 'text-gray-600'}`}>{action.description}</p>
                <p className={`text-xs font-semibold mt-3 ${isPrimary ? 'text-sky-100' : 'text-[#173B82]'}`}>Buka menu →</p>
              </Link>
            );
          })}
        </div>
      </div>

      <AdminDashboardCharts
        regionalDistribution={regionalDistribution}
        documentTypeDistribution={documentTypeDistribution}
        popularSchemes={popularSchemes}
      />
    </div>
  );
}

