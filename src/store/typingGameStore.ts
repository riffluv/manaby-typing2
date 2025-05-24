import { create } from 'zustand';
import { createSelectors } from '@/store/createSelectors';
import { wordList } from '@/data/wordList';
import { createTypingChars, TypingChar } from '@/utils/japaneseUtils';
import { shallow } from 'zustand/shallow';

// タイピングゲーム向けの状態型定義
interface TypingGameState {
  // ゲーム全体の状態
  gameStatus: 'ready' | 'playing' | 'finished';
  currentWordIndex: number;
  currentWord: {
    japanese: string;
    hiragana: string;
    romaji: string;
    typingChars: TypingChar[];
    displayChars: string[];
  };
  mode: TypingMode;
  
  // アクション
  setGameStatus: (status: 'ready' | 'playing' | 'finished') => void;
  setCurrentWordIndex: (index: number) => void;
  setMode: (mode: TypingMode) => void;
  resetGame: () => void;
  advanceToNextWord: () => void;
  setupCurrentWord: () => void; // 現在の単語をセットアップする
}

// --- 追加: モード管理 ---
export type TypingMode = 'normal' | 'hard';

// 現在の単語の初期状態
const initialCurrentWord = {
  japanese: '',
  hiragana: '',
  romaji: '',
  typingChars: [] as TypingChar[],
  displayChars: [] as string[]
};

// ゲーム状態の初期値
const initialTypingGameState = {
  gameStatus: 'ready' as const,
  currentWordIndex: 0,
  currentWord: initialCurrentWord,
  mode: 'normal' as TypingMode
};

// Zustandストアの作成
const useTypingGameStoreBase = create<TypingGameState>((set, get) => ({
  // 初期状態
  ...initialTypingGameState,
  
  // アクション
  setGameStatus: (status) => set({ gameStatus: status }),
  
  setCurrentWordIndex: (index) => {
    set({ currentWordIndex: index });
    get().setupCurrentWord();
  },
  
  setMode: (mode) => set({ mode }),
  
  resetGame: () => {
    set({ 
      gameStatus: 'ready',
      currentWordIndex: 0
    });
    get().setupCurrentWord();
  },
  
  advanceToNextWord: () => {
    const { currentWordIndex, mode } = get();
    const list = mode === 'hard' ? require('@/data/hardQuestions').hardQuestions : wordList;
    // 8問で終了（0〜7まで出題、8問目終了でリザルト）
    if (currentWordIndex + 1 >= 8 || currentWordIndex + 1 >= list.length) {
      set({ gameStatus: 'finished' });
    } else {
      set({ currentWordIndex: currentWordIndex + 1 });
      get().setupCurrentWord();
    }
  },
  
  setupCurrentWord: () => {
    const { currentWordIndex, mode } = get();
    const list = mode === 'hard' ? require('@/data/hardQuestions').hardQuestions : wordList;
    
    if (list.length > 0 && currentWordIndex < list.length) {
      const word = list[currentWordIndex];
      // タイピング文字オブジェクトの配列を作成
      const typingChars = createTypingChars(word.hiragana);
      // 表示用のローマ字の配列を作成
      const displayChars = typingChars.map(char => char.getDisplayInfo().displayText);
      
      set({
        currentWord: {
          japanese: word.japanese || word.kanji,
          hiragana: word.hiragana,
          romaji: displayChars.join(''),
          typingChars: typingChars,
          displayChars: displayChars
        }
      });
    }
  }
}));

// セレクターを使用して最適化されたストアをエクスポート
export const useTypingGameStore = createSelectors(useTypingGameStoreBase);

// より細かく分割したセレクターの例（パフォーマンス最適化のために重要）
export const useGameStatus = () => useTypingGameStoreBase((state) => state.gameStatus);
export const useCurrentWord = () => useTypingGameStoreBase((state) => state.currentWord);
export const useCurrentWordIndex = () => useTypingGameStoreBase((state) => state.currentWordIndex);
export const useWordListLength = () => wordList.length;

// 特定の用途に合わせたセレクター（表示のみに必要なもの）
let lastJapanese = '';
let lastHiragana = '';
let lastResult = { japanese: '', hiragana: '' };
export const useDisplayWord = () =>
  useTypingGameStoreBase((state) => {
    if (
      state.currentWord.japanese === lastJapanese &&
      state.currentWord.hiragana === lastHiragana
    ) {
      return lastResult;
    }
    lastJapanese = state.currentWord.japanese;
    lastHiragana = state.currentWord.hiragana;
    lastResult = {
      japanese: state.currentWord.japanese,
      hiragana: state.currentWord.hiragana
    };
    return lastResult;
  });
// 利用側で const [japanese, hiragana] = useDisplayWord(); とする
