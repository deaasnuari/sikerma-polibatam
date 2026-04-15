export interface AdminNotification {
  id: number;
  title: string;
  message: string;
  from: string;
  read: boolean;
}

export interface DashboardStat {
  label: string;
  value: string;
  color: string;
  textColor: string;
  iconKey: 'handshake' | 'building' | 'globe' | 'chart' | 'zap';
}

export interface ChartItem {
  name: string;
  value: number;
  fill?: string;
}

export interface PopularSchemeItem {
  name: string;
  value: number;
}

export interface QuickAction {
  label: string;
  color: string;
  iconKey: 'handshake' | 'users' | 'trending';
}
