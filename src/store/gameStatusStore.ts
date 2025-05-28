import { create } from 'zustand';

export type GameStatus = 'ready' | 'playing' | 'finished';

interface GameStatusState {
  status: GameStatus;
  setStatus: (status: GameStatus) => void;
}

export const useGameStatusStore = create<GameStatusState>((set) => ({
  status: 'ready',
  setStatus: (status) => set({ status }),
}));
