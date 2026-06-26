import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Minimum 6 caractères'),
  code: z.string().optional(), // 2FA code
});

export const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Minimum 8 caractères'),
  name: z.string().min(2, 'Minimum 2 caractères'),
});

export const trackEventSchema = z.object({
  name: z.string().min(1).max(255),
  properties: z.record(z.any()).optional().default({}),
  timestamp: z.string().datetime().optional(),
  distinctId: z.string().optional(),
  sessionId: z.string().optional(),
  url: z.string().optional(),
  referrer: z.string().optional(),
  utm: z.object({
    source: z.string().optional(),
    medium: z.string().optional(),
    campaign: z.string().optional(),
    term: z.string().optional(),
    content: z.string().optional(),
  }).optional(),
});

export const trackBatchSchema = z.object({
  events: z.array(trackEventSchema).max(500),
});

export const createWorkspaceSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/),
});

export const createProjectSchema = z.object({
  name: z.string().min(2).max(100),
  platform: z.enum(['WEB', 'MOBILE', 'API']).default('WEB'),
  timezone: z.string().default('UTC'),
});

export const createDashboardSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

export const createWidgetSchema = z.object({
  type: z.enum(['LINE_CHART', 'BAR_CHART', 'PIE_CHART', 'HEATMAP', 'TABLE', 'COUNTER', 'FUNNEL', 'RETENTION', 'MAP']),
  title: z.string().min(1).max(100),
  config: z.record(z.any()).default({}),
  position: z.object({ x: z.number(), y: z.number() }).optional(),
  size: z.object({ w: z.number(), h: z.number() }).optional(),
});

export const updateLayoutSchema = z.object({
  layout: z.array(z.object({
    i: z.string(),
    x: z.number(),
    y: z.number(),
    w: z.number(),
    h: z.number(),
  })),
});

export const analyticsQuerySchema = z.object({
  projectId: z.string(),
  metric: z.string(),
  period: z.enum(['1h', '24h', '7d', '30d', '90d', 'custom']).default('30d'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  granularity: z.enum(['minute', 'hour', 'day', 'week', 'month']).default('day'),
  filters: z.record(z.string()).optional(),
  groupBy: z.string().optional(),
});

export const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['ADMIN', 'MEMBER', 'VIEWER']).default('MEMBER'),
});

export const createFunnelSchema = z.object({
  name: z.string().min(1).max(100),
  projectId: z.string(),
  steps: z.array(z.object({
    name: z.string(),
    path: z.string().optional(),
    properties: z.record(z.any()).optional(),
  })).min(2),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type TrackEventInput = z.infer<typeof trackEventSchema>;
export type AnalyticsQuery = z.infer<typeof analyticsQuerySchema>;
