import { create } from 'zustand';
import type { RankingEntry } from '@/lib/rankingManaby2';

interface RankingState {
  entries: RankingEntry[];
  isLoading: boolean;
  error: string | null;
  setEntries: (entries: RankingEntry[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useRankingStore = create<RankingState>((set) => ({
  entries: [],
  isLoading: false,
  error: null,
  setEntries: (entries) => set({ entries }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
