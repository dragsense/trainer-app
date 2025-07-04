import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { DashboardResponse } from '@/@types/dashboard.type';
import { getDashboardStats } from '@/services/dashboard.api';

interface DashboardState {
  data: DashboardResponse | null;
  loading: boolean;
  error: string | null;
  fetchDashboard: () => Promise<void>;
  reset: () => void;
}

export const useDashboardStore = create<DashboardState>()(
  immer((set) => ({
    data: null,
    loading: false,
    error: null,

    fetchDashboard: async () => {
      try {
        set({ loading: true, error: null });
        const data = await getDashboardStats();
        set({ data, loading: false });
      } catch (error) {
        set({ error: 'Failed to fetch dashboard data', loading: false });
      }
    },

    reset: () => {
      set({ data: null, loading: false, error: null });
    },
  }))
);
