import type {
  AdminNotification,
  ChartItem,
  DashboardStat,
  PopularSchemeItem,
  QuickAction,
} from '@/types/admin';

const notifications: AdminNotification[] = [
  {
    id: 1,
    title: 'Pengajuan Disetujui',
    message: "Pengajuan 'Kerja Sama Magong dengan PT Solusi Digital' telah disetujui.",
    from: 'Admin SIKERMA',
    read: false,
  },
  {
    id: 2,
    title: 'Komentar Baru pada Pengajuan',
    message: "Pengajuan 'Kerja Sama Magong dengan PT Solusi Digital' telah mendapat komentar baru.",
    from: 'Admin SIKERMA',
    read: false,
  },
];

const dashboardStats: DashboardStat[] = [
  { label: 'Total Kerjasama Aktif', value: '6', color: 'bg-green-100', textColor: 'text-green-700', iconKey: 'handshake' },
  { label: 'Total Dalam Negeri', value: '154', color: 'bg-red-100', textColor: 'text-red-700', iconKey: 'building' },
  { label: 'Total Luar Negeri', value: '31', color: 'bg-blue-100', textColor: 'text-blue-700', iconKey: 'globe' },
  { label: 'Total Dokumen', value: '185', color: 'bg-orange-100', textColor: 'text-orange-700', iconKey: 'chart' },
  { label: 'Total Proses', value: '5', color: 'bg-indigo-100', textColor: 'text-indigo-700', iconKey: 'zap' },
];

const quickActions: QuickAction[] = [
  { label: 'Buat Kerjasama Baru', iconKey: 'handshake', color: 'bg-blue-50 border-blue-200' },
  { label: 'Lihat User', iconKey: 'users', color: 'bg-green-50 border-green-200' },
  { label: 'Monitoring', iconKey: 'trending', color: 'bg-purple-50 border-purple-200' },
];

const regionalDistribution: ChartItem[] = [
  { name: 'Dalam Negeri', value: 8, fill: '#3B82F6' },
  { name: 'Luar Negeri', value: 2, fill: '#A78BFA' },
];

const documentTypeDistribution: ChartItem[] = [
  { name: 'MoU', value: 4, fill: '#10B981' },
  { name: 'MoA', value: 5, fill: '#F59E0B' },
  { name: 'IA', value: 1, fill: '#EF4444' },
];

const popularSchemes: PopularSchemeItem[] = [
  { name: 'Pelatihan', value: 3 },
  { name: 'Maggang', value: 3 },
  { name: 'Penelitian', value: 2 },
  { name: 'Pertukaran Mahasiswa', value: 2 },
  { name: 'Sertifikasi', value: 2 },
];

export function getAdminNotifications(): AdminNotification[] {
  return notifications;
}

export function getDashboardStats(): DashboardStat[] {
  return dashboardStats;
}

export function getQuickActions(): QuickAction[] {
  return quickActions;
}

export function getRegionalDistribution(): ChartItem[] {
  return regionalDistribution;
}

export function getDocumentTypeDistribution(): ChartItem[] {
  return documentTypeDistribution;
}

export function getPopularSchemes(): PopularSchemeItem[] {
  return popularSchemes;
}
