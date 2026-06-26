import { create } from 'zustand';
import type { Dashboard, Widget, LayoutItem } from '@/types';

interface DashboardState {
  dashboards: Dashboard[];
  current: Dashboard | null;
  isEditing: boolean;
  isLoading: boolean;

  setDashboards: (dashboards: Dashboard[]) => void;
  setCurrent: (dashboard: Dashboard) => void;
  setEditing: (editing: boolean) => void;
  setLoading: (loading: boolean) => void;
  updateLayout: (layout: LayoutItem[]) => void;
  addWidget: (widget: Widget) => void;
  removeWidget: (widgetId: string) => void;
  updateWidget: (widgetId: string, updates: Partial<Widget>) => void;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  dashboards: [],
  current: null,
  isEditing: false,
  isLoading: false,

  setDashboards: (dashboards) => set({ dashboards }),
  setCurrent: (dashboard) => set({ current: dashboard }),
  setEditing: (editing) => set({ isEditing: editing }),
  setLoading: (loading) => set({ isLoading: loading }),

  updateLayout: (layout) => {
    const { current } = get();
    if (current) {
      set({ current: { ...current, layout } });
    }
  },

  addWidget: (widget) => {
    const { current } = get();
    if (current) {
      set({
        current: {
          ...current,
          widgets: [...current.widgets, widget],
          layout: [...current.layout, { i: widget.id, x: 0, y: Infinity, w: widget.size.w, h: widget.size.h }],
        },
      });
    }
  },

  removeWidget: (widgetId) => {
    const { current } = get();
    if (current) {
      set({
        current: {
          ...current,
          widgets: current.widgets.filter((w) => w.id !== widgetId),
          layout: current.layout.filter((l) => l.i !== widgetId),
        },
      });
    }
  },

  updateWidget: (widgetId, updates) => {
    const { current } = get();
    if (current) {
      set({
        current: {
          ...current,
          widgets: current.widgets.map((w) => (w.id === widgetId ? { ...w, ...updates } : w)),
        },
      });
    }
  },
}));
