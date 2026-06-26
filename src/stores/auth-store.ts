import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import type { User, Workspace, Member } from '@/types';

interface AuthState {
  user: User | null;
  workspace: Workspace | null;
  memberRole: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;

  login: (email: string, password: string, code?: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
  setWorkspace: (workspace: Workspace, role: string) => void;
  updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      workspace: null,
      memberRole: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,

      login: async (email, password, code) => {
        set({ isLoading: true });
        try {
          const { data } = await axios.post('/api/auth/login', { email, password, code });
          set({
            user: data.user,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (email, password, name) => {
        set({ isLoading: true });
        try {
          const { data } = await axios.post('/api/auth/register', { email, password, name });
          set({
            user: data.user,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({ user: null, workspace: null, memberRole: null, accessToken: null, refreshToken: null });
      },

      refreshAuth: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return;
        try {
          const { data } = await axios.post('/api/auth/refresh', { refreshToken });
          set({ accessToken: data.accessToken, refreshToken: data.refreshToken });
        } catch {
          get().logout();
        }
      },

      setWorkspace: (workspace, role) => {
        set({ workspace, memberRole: role });
      },

      updateUser: (updates) => {
        const { user } = get();
        if (user) set({ user: { ...user, ...updates } });
      },
    }),
    { name: 'insightflow-auth', partialize: (state) => ({
      accessToken: state.accessToken,
      refreshToken: state.refreshToken,
      user: state.user,
      workspace: state.workspace,
      memberRole: state.memberRole,
    }) }
  )
);
