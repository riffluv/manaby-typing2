import { create } from 'zustand';

interface GameState {
  score: number;
  accuracy: number;
  highScore: number;
  words: string[];
  currentWordIndex: number;
  typedText: string;
  gameStatus: 'idle' | 'playing' | 'ended';
  startTime: number | null;
  
  startGame: (words: string[]) => void;
  endGame: () => void;
  resetGame: () => void;
  typeChar: (char: string) => void;
  nextWord: () => void;
  setHighScore: (score: number) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  score: 0,
  accuracy: 100,
  highScore: 0,
  words: [],
  currentWordIndex: 0,
  typedText: '',
  gameStatus: 'idle',
  startTime: null,

  startGame: (words) => set({ 
    words, 
    currentWordIndex: 0, 
    typedText: '', 
    score: 0, 
    accuracy: 100, 
    gameStatus: 'playing',
    startTime: Date.now(),
  }),
  endGame: () => {
    const { score, highScore, startTime } = get();
    const endTime = Date.now();
    const timeTaken = startTime ? (endTime - startTime) / 1000 : 0; // seconds
    // 必要に応じてスコア計算やハイスコア更新
    if (score > highScore) {
      set({ highScore: score });
    }
    set({ gameStatus: 'ended' });
  },
  resetGame: () => set({
    score: 0,
    accuracy: 100,
    words: [],
    currentWordIndex: 0,
    typedText: '',
    gameStatus: 'idle',
    startTime: null,
  }),
  typeChar: (char) => {
    const { words, currentWordIndex, typedText } = get();
    const currentWord = words[currentWordIndex];
    if (!currentWord) return;

    if (char === 'Backspace') {
      set({ typedText: typedText.slice(0, -1) });
    } else if (typedText.length < currentWord.length) {
      set({ typedText: typedText + char });
    }
    // 正確性の計算ロジックはここに（必要に応じて）
  },
  nextWord: () => {
    const { words, currentWordIndex, typedText, score } = get();
    const currentWord = words[currentWordIndex];
    if (currentWord && typedText === currentWord) {
      set({ score: score + currentWord.length }); // 簡単なスコアリング
    }
    if (currentWordIndex < words.length - 1) {
      set({ currentWordIndex: currentWordIndex + 1, typedText: '' });
    } else {
      get().endGame();
    }
  },
  setHighScore: (newHighScore) => {
    const { highScore } = get();
    if (newHighScore > highScore) {
      set({ highScore: newHighScore });
    }
  }
}));