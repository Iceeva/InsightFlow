export interface User {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  role: 'USER' | 'ADMIN' | 'SUPERADMIN';
  twoFactorEnabled: boolean;
  createdAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  plan: 'FREE' | 'PRO' | 'BUSINESS' | 'ENTERPRISE';
  logoUrl: string | null;
  _count?: { members: number; projects: number };
}

export interface Team {
  id: string;
  name: string;
  workspaceId: string;
  _count?: { members: number };
}

export interface Member {
  id: string;
  userId: string;
  workspaceId: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
  user: User;
}

export interface Project {
  id: string;
  name: string;
  workspaceId: string;
  platform: 'WEB' | 'MOBILE' | 'API';
  timezone: string;
  _count?: { events: number };
}

export interface TrackEvent {
  id: string;
  name: string;
  projectId: string;
  sessionId: string | null;
  distinctId: string | null;
  properties: Record<string, any>;
  timestamp: string;
  country: string | null;
  city: string | null;
  os: string | null;
  browser: string | null;
  device: string | null;
  url: string | null;
  path: string | null;
  referrer: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
}

export interface Dashboard {
  id: string;
  name: string;
  description: string | null;
  workspaceId: string;
  isDefault: boolean;
  layout: LayoutItem[];
  widgets: Widget[];
  createdAt: string;
}

export interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Widget {
  id: string;
  dashboardId: string;
  type: WidgetType;
  title: string;
  config: Record<string, any>;
  position: { x: number; y: number };
  size: { w: number; h: number };
}

export type WidgetType =
  | 'LINE_CHART' | 'BAR_CHART' | 'PIE_CHART' | 'HEATMAP'
  | 'TABLE' | 'COUNTER' | 'FUNNEL' | 'RETENTION' | 'MAP';

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  workspaceId: string;
  scopes: string[];
  isActive: boolean;
  lastUsedAt: string | null;
  createdAt: string;
}

export interface Funnel {
  id: string;
  name: string;
  projectId: string;
  steps: FunnelStep[];
}

export interface FunnelStep {
  name: string;
  path?: string;
  properties?: Record<string, any>;
  count?: number;
  conversionRate?: number;
}

export interface AnalyticsData {
  labels: string[];
  datasets: DataSet[];
  total?: number;
  change?: number;
}

export interface DataSet {
  label: string;
  data: number[];
  color?: string;
}

export interface Notification {
  id: string;
  type: 'ALERT' | 'ANOMALY' | 'REPORT' | 'INVITATION' | 'SYSTEM';
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export interface AuditEntry {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  metadata: Record<string, any> | null;
  user: { name: string; email: string };
  createdAt: string;
}

export interface RetentionData {
  cohort: string;
  users: number;
  weeks: number[];
}

export interface HeatmapCell {
  day: number;
  hour: number;
  value: number;
}

export interface GeoData {
  country: string;
  count: number;
  percentage: number;
}

export interface AIPrediction {
  metric: string;
  predicted: number[];
  confidence: number;
  trend: 'up' | 'down' | 'stable';
  anomalies: { date: string; value: number; expected: number; severity: 'low' | 'medium' | 'high' }[];
}
