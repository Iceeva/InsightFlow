import { create } from 'zustand';

interface AnalyticsFilters {
  period: '1h' | '24h' | '7d' | '30d' | '90d' | 'custom';
  startDate?: string;
  endDate?: string;
  country?: string;
  city?: string;
  os?: string;
  browser?: string;
  device?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  eventName?: string;
  projectId?: string;
  granularity: 'minute' | 'hour' | 'day' | 'week' | 'month';
}

interface AnalyticsState {
  filters: AnalyticsFilters;
  isLive: boolean;
  liveCount: number;

  setFilters: (filters: Partial<AnalyticsFilters>) => void;
  resetFilters: () => void;
  setLive: (live: boolean) => void;
  setLiveCount: (count: number) => void;
}

const defaultFilters: AnalyticsFilters = {
  period: '30d',
  granularity: 'day',
};

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  filters: defaultFilters,
  isLive: false,
  liveCount: 0,

  setFilters: (updates) =>
    set((state) => ({ filters: { ...state.filters, ...updates } })),

  resetFilters: () => set({ filters: defaultFilters }),

  setLive: (live) => set({ isLive: live }),

  setLiveCount: (count) => set({ liveCount: count }),
}));
