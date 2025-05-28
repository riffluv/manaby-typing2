import { create } from 'zustand';

interface UIState {
  isModalOpen: boolean;
  setModalOpen: (open: boolean) => void;
  // 必要に応じてUI状態を追加
}

export const useUIStore = create<UIState>((set) => ({
  isModalOpen: false,
  setModalOpen: (open) => set({ isModalOpen: open }),
}));
