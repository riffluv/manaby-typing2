import { create } from 'zustand';

interface AdminState {
  isAdminMode: boolean;
  setAdminMode: (open: boolean) => void;
  // 必要に応じて管理者用状態を追加
}

export const useAdminStore = create<AdminState>((set) => ({
  isAdminMode: false,
  setAdminMode: (open) => set({ isAdminMode: open }),
}));
