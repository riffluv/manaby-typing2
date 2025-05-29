import { create } from 'zustand';
import { createSelectors } from '@/store/createSelectors';
import { wordList } from '@/data/wordList';
import { createTypingChars, TypingChar } from '@/utils/japaneseUtils';
import { shallow } from 'zustand/shallow';

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
    typingChars: TypingChar[];
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
  typingChars: [] as TypingChar[],
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

// 履歴をLocalStorageに保存する関数
const saveQuestionHistory = (history: QuestionHistory): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('typingQuestionHistory', JSON.stringify(history));
    } catch (e) {
      console.error('Failed to save question history:', e);
    }
  }
};

// 次の問題インデックスを選択する関数
const selectNextQuestionIndex = (mode: TypingMode, list: any[], history: number[]): number => {
  // 未出題の問題インデックスを見つける
  const unseenIndices = list.map((_, index) => index).filter(idx => !history.includes(idx));
  
  if (unseenIndices.length > 0) {
    // 未出題の問題からランダムに選択
    const randomIndex = Math.floor(Math.random() * unseenIndices.length);
    return unseenIndices[randomIndex];
  } else {
    // すべての問題が出題済みの場合は、すべてから再度ランダムに選択
    // ただし直前に出題された問題は避ける
    let newIndex = Math.floor(Math.random() * list.length);
    const lastIndex = history.length > 0 ? history[history.length - 1] : -1;
    
    // 直前と同じ問題が選ばれそうな場合は違う問題を選ぶ（リストが複数ある場合）
    if (newIndex === lastIndex && list.length > 1) {
      // 異なるインデックスを強制的に選択
      newIndex = (lastIndex + 1) % list.length;
    }
    
    return newIndex;
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
  
  setQuestionCount: (count) => set({ questionCount: count }),
  
  resetGame: () => {
    // モードを保持したままゲームをリセット
    const currentMode = get().mode;
    set({ 
      gameStatus: 'ready',
      currentWordIndex: 0,
      mode: currentMode // モードを明示的に保持
    });
    get().setupCurrentWord();
  },
  
  advanceToNextWord: () => {
    const { currentWordIndex, mode, questionCount, questionHistory } = get();
    // モードに応じてリストを取得
    let list;
    if (mode === 'hard') {
      list = require('@/data/hardQuestions').hardQuestions;
    } else if (mode === 'sonkeigo') {
      list = require('@/data/sonkeigoQuestions').sonkeigoQuestions;
    } else if (mode === 'kenjougo') {
      list = require('@/data/kenjougoQuestions').kenjougoQuestions;
    } else if (mode === 'business') {
      list = require('@/data/businessQuestions').businessQuestions;
    } else {
      // normal
      list = wordList;
    }
    
    // questionCount問で終了
    if (currentWordIndex + 1 >= questionCount || currentWordIndex + 1 >= list.length) {
      set({ gameStatus: 'finished' });
    } else {
      // インデックスのみインクリメント（実際の問題選択はsetupCurrentWordで行う）
      const newIndex = currentWordIndex + 1;
      set({ currentWordIndex: newIndex });
      get().setupCurrentWord();
    }
  },
  
  setupCurrentWord: () => {
    const { currentWordIndex, mode, questionHistory } = get();
    
    // モードに応じてリストを取得
    let list;
    if (mode === 'hard') {
      list = require('@/data/hardQuestions').hardQuestions;
    } else if (mode === 'sonkeigo') {
      list = require('@/data/sonkeigoQuestions').sonkeigoQuestions;
    } else if (mode === 'kenjougo') {
      list = require('@/data/kenjougoQuestions').kenjougoQuestions;
    } else if (mode === 'business') {
      list = require('@/data/businessQuestions').businessQuestions;
    } else {
      // normal
      list = wordList;
    }
    
    // 問題データがある場合は処理を続行
    if (list.length > 0) {
      // 履歴に基づいてランダムに問題を選択
      const previousIndices = questionHistory[mode];
      
      // 過去の出題履歴を考慮して次の問題インデックスを選択
      const randomIndex = selectNextQuestionIndex(mode, list, previousIndices);
      
      // 履歴が長すぎる場合は古いものを削除（最新の10問程度を保持）
      const newHistory = [...previousIndices];
      if (newHistory.length > Math.min(20, list.length)) {
        newHistory.shift(); // 最も古い履歴を削除
      }
      newHistory.push(randomIndex);
      
      // 履歴を更新
      const updatedHistory = {
        ...questionHistory,
        [mode]: newHistory
      };
      
      // 選択した問題の情報を取得
      const word = list[randomIndex];
      
      // タイピング文字オブジェクトの配列を作成
      const typingChars = createTypingChars(word.hiragana);
      // 表示用のローマ字の配列を作成
      const displayChars = typingChars.map(char => char.getDisplayInfo().displayText);
      
      // 状態を更新
      set({
        currentWord: {
          japanese: word.japanese || word.kanji,
          hiragana: word.hiragana,
          romaji: displayChars.join(''),
          typingChars: typingChars,
          displayChars: displayChars,
          explanation: word.explanation || null
        },
        questionHistory: updatedHistory
      });
      
      // ローカルストレージに保存
      saveQuestionHistory(updatedHistory);
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
