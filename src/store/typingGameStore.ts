import { create } from 'zustand';
import { createSelectors } from '@/store/createSelectors';
import { wordList } from '@/data/wordList';
import { JapaneseConverter } from '@/typing';
import type { TypingChar } from '@/types/typing';
import { hardQuestions } from '@/data/hardQuestions';
import { sonkeigoQuestions } from '@/data/sonkeigoQuestions';
import { kenjougoQuestions } from '@/data/kenjougoQuestions_fixed';
import { businessQuestions } from '@/data/businessQuestions';

/**
 * タイピングゲーム状態管理ストア
 * @module typingGameStore
 */

// 問題履歴を管理するための型定義
interface QuestionHistory {
  normal: number[];
  hard: number[];
  sonkeigo: number[];
  kenjougo: number[];
  business: number[];
}

// タイピングゲーム向けの状態型定義
interface TypingGameState {
  // ゲーム全体の状態
  gameStatus: 'ready' | 'playing' | 'finished';
  currentWordIndex: number;
  currentWord: {
    japanese: string;
    hiragana: string;
    romaji: string;
    typingChars: TypingChar[]; // 新システム対応：適切な型を使用
    displayChars: string[];
    explanation?: string | null;  // マナビー解説（将来的に使用）
  };
  mode: TypingMode;
  questionCount: number; // 出題数を可変に
  questionHistory: QuestionHistory; // 各モードの出題履歴
  
  // アクション
  setGameStatus: (status: 'ready' | 'playing' | 'finished') => void;
  setCurrentWordIndex: (index: number) => void;
  setMode: (mode: TypingMode) => void;
  setQuestionCount: (count: number) => void;
  resetGame: () => void;
  advanceToNextWord: () => void;
  setupCurrentWord: () => void; // 現在の単語をセットアップする
}

// --- 追加: モード管理 ---
export type TypingMode = 'normal' | 'hard' | 'sonkeigo' | 'kenjougo' | 'business';

// 現在の単語の初期状態
const initialCurrentWord = {
  japanese: '',
  hiragana: '',
  romaji: '',
  typingChars: [] as TypingChar[], // 新システム対応
  displayChars: [] as string[],
  explanation: null
};

// 履歴をLocalStorageからロードする関数
const loadQuestionHistory = (): QuestionHistory => {
  if (typeof window === 'undefined') {
    return {
      normal: [],
      hard: [],
      sonkeigo: [],
      kenjougo: [],
      business: []
    };
  }
  
  const savedHistory = localStorage.getItem('typingQuestionHistory');
  if (savedHistory) {
    try {
      return JSON.parse(savedHistory);
    } catch (e) {
      console.error('Failed to parse question history:', e);
      return {
        normal: [],
        hard: [],
        sonkeigo: [],
        kenjougo: [],
        business: []
      };
    }
  } else {
    return {
      normal: [],
      hard: [],
      sonkeigo: [],
      kenjougo: [],
      business: []
    };
  }
};

// ゲーム状態の初期値
const initialTypingGameState = {
  gameStatus: 'ready' as const,
  currentWordIndex: 0,
  currentWord: initialCurrentWord,
  mode: 'normal' as TypingMode,
  questionCount: 8, // デフォルト8問
  questionHistory: loadQuestionHistory() // LocalStorageから履歴をロード
};

// --- シャッフル関数（Fisher-Yates） ---
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// --- ゲームごとの出題リストを管理 ---
let currentGameQuestions: unknown[] = [];

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
  
  setQuestionCount: (count) => set({ questionCount: count }),
  
  resetGame: () => {
    const currentMode = get().mode;
    let list;
    if (currentMode === 'hard') {
      list = hardQuestions;
    } else if (currentMode === 'sonkeigo') {
      list = sonkeigoQuestions;
    } else if (currentMode === 'kenjougo') {
      list = kenjougoQuestions;
    } else if (currentMode === 'business') {
      list = businessQuestions;
    } else {
      list = wordList;
    }
    // 出題数をリスト長以下に制限
    const questionCount = Math.min(get().questionCount, list.length);
    // シャッフルして先頭から必要数だけ抽出
    currentGameQuestions = shuffleArray([...list]).slice(0, questionCount);
    set({
      gameStatus: 'ready',
      currentWordIndex: 0,
      mode: currentMode
    });
    get().setupCurrentWord();
  },
  
  advanceToNextWord: () => {
    const { currentWordIndex, questionCount } = get();
    if (currentWordIndex + 1 >= questionCount) {
      set({ gameStatus: 'finished' });
    } else {
      set({ currentWordIndex: currentWordIndex + 1 });
      get().setupCurrentWord();
    }
  },
  
  setupCurrentWord: () => {
    const { currentWordIndex } = get();
    const word = currentGameQuestions[currentWordIndex] as { 
      japanese?: string; 
      kanji?: string; 
      hiragana: string; 
      explanation?: string 
    };
    if (!word) return;
    
    // 🚀 新システム：JapaneseConverterを使用してTypingChar配列を生成  
    const typingChars = JapaneseConverter.convertToTypingChars(word.hiragana);
    
    // ローマ字表示用：各文字の最初のパターンを使用
    const romajiString = typingChars.map((char: TypingChar) => char.patterns[0] || '').join('');
    
    set({
      currentWord: {
        japanese: word.japanese || word.kanji || '',
        hiragana: word.hiragana,
        romaji: romajiString,
        typingChars: typingChars,
        displayChars: typingChars.map((char: TypingChar) => char.kana), // ひらがな表示用
        explanation: word.explanation || null
      }
    });
  }
}));

// セレクターを使用して最適化されたストアをエクスポート
export const useTypingGameStore = createSelectors(useTypingGameStoreBase);

// より細かく分割したセレクターの例（パフォーマンス最適化のために重要）
export const useGameStatus = () => useTypingGameStoreBase((state) => state.gameStatus);
export const useCurrentWord = () => useTypingGameStoreBase((state) => state.currentWord);
export const useCurrentWordIndex = () => useTypingGameStoreBase((state) => state.currentWordIndex);
export const useWordListLength = () => wordList.length;
export const useQuestionCount = () => useTypingGameStoreBase((state) => state.questionCount);

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
