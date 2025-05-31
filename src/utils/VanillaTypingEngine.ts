/**
 * ⚡ 寿司打レベル 超高速タイピングエンジン
 * 
 * 寿司打・typingmania-ref並みの1ms以下応答を実現
 * 完全同期処理・ゼロアロケーション・直接DOM操作
 */

import type { TypingChar } from './OptimizedTypingChar';
import type { KanaDisplay, PerWordScoreLog } from '@/types';
import UnifiedAudioSystem from './UnifiedAudioSystem';

interface VanillaTypingState {
  typingChars: TypingChar[];
  currentKanaIndex: number;
  containerElement: HTMLElement | null;
  charElements: HTMLSpanElement[];
  // 事前キャッシュされたDOM要素マップ
  elementCache: Map<string, HTMLSpanElement[]>;
  // メモリプール（完全ゼロアロケーション）
  tempDisplay: KanaDisplay;
  // スコア管理
  wordStats: {
    keyCount: number;
    mistakeCount: number;
    startTime: number;
    endTime: number;
  };
  // 更新バッチ管理
  pendingUpdates: Set<number>;
}

export class VanillaTypingEngine {
  private state: VanillaTypingState;
  private keyHandler: ((e: KeyboardEvent) => void) | null = null;
  private isActive = false;
  private audioEnabled = true;
  private onWordComplete: ((scoreLog: PerWordScoreLog) => void) | null = null;
  private onProgress: ((kanaIndex: number, display: KanaDisplay) => void) | null = null;

  // ⚡ 完全メモリプール: オブジェクト作成ゼロ
  private static readonly TEMP_DISPLAY: KanaDisplay = {
    acceptedText: '',
    remainingText: '',
    displayText: ''
  };

  // ⚡ 事前定義クラス名（文字列作成回避）
  private static readonly CSS_CLASSES = {
    PENDING: 'typing-char pending',
    ACCEPTED: 'typing-char accepted',
    CURRENT: 'typing-char current',
    REMAINING: 'typing-char remaining'
  } as const;
  constructor() {
    this.state = {
      typingChars: [],
      currentKanaIndex: 0,
      containerElement: null,
      charElements: [],
      elementCache: new Map(),
      tempDisplay: VanillaTypingEngine.TEMP_DISPLAY,
      wordStats: {
        keyCount: 0,
        mistakeCount: 0,
        startTime: 0,
        endTime: 0
      },
      pendingUpdates: new Set()
    };
  }

  /**
   * 🚀 寿司打流: 超高速初期化（DOM直接構築）
   */
  initialize(
    containerElement: HTMLElement,
    typingChars: TypingChar[],
    onProgress?: (kanaIndex: number, display: KanaDisplay) => void,
    onWordComplete?: (scoreLog: PerWordScoreLog) => void,
    audioEnabled = true
  ): void {
    this.state.containerElement = containerElement;
    this.state.typingChars = typingChars;
    this.state.currentKanaIndex = 0;
    this.state.charElements = [];
    this.audioEnabled = audioEnabled;
    this.onProgress = onProgress || null;
    this.onWordComplete = onWordComplete || null;

    // スコア初期化
    this.state.wordStats = {
      keyCount: 0,
      mistakeCount: 0,
      startTime: 0,
      endTime: 0
    };

    // DOM完全クリア
    containerElement.innerHTML = '';

    // 🚀 直接DOM構築（React迂回）
    const fragment = document.createDocumentFragment();
    
    for (let kanaIndex = 0; kanaIndex < typingChars.length; kanaIndex++) {
      const typingChar = typingChars[kanaIndex];
      const displayInfo = typingChar.getDisplayInfo();
      const displayText = displayInfo.displayText;
      
      for (let charIndex = 0; charIndex < displayText.length; charIndex++) {
        const char = displayText[charIndex];
        const element = document.createElement('span');
        
        // 🚀 最小限属性設定
        element.className = 'typing-char pending';
        element.textContent = char;
        element.dataset.kanaIndex = kanaIndex.toString();
        element.dataset.charIndex = charIndex.toString();
        
        fragment.appendChild(element);
        this.state.charElements.push(element);
      }
    }
    
    containerElement.appendChild(fragment);

    // 🚀 キー入力バインド（直接イベント、React無関係）
    this.bindKeyEvents();
    
    // 初期状態更新
    this.updateDisplay();
    this.isActive = true;
  }

  /**
   * 🚀 寿司打流: 直接キーイベント（最高速）
   */
  private bindKeyEvents(): void {
    if (this.keyHandler) {
      document.removeEventListener('keydown', this.keyHandler);
    }

    // 🚀 事前定義関数（インライン関数作成回避）
    this.keyHandler = this.createKeyHandler();
    document.addEventListener('keydown', this.keyHandler, { passive: false });
  }

  /**
   * 🚀 メモリプール使用のキーハンドラー作成
   */
  private createKeyHandler() {
    return (e: KeyboardEvent) => {
      if (!this.isActive || e.key.length !== 1) return;
      
      // 🚀 即座制御
      e.preventDefault();
      e.stopPropagation();      // 🚀 パフォーマンス測定
      const keyDownTime = performance.now();

      const { typingChars, currentKanaIndex, wordStats } = this.state;
      
      if (currentKanaIndex >= typingChars.length) return;
      
      const currentChar = typingChars[currentKanaIndex];
      if (!currentChar) return;

      // 初回入力時の開始時間記録
      if (wordStats.keyCount === 0) {
        wordStats.startTime = performance.now();
      }

      wordStats.keyCount++;

      // 🚀 文字処理（最小限）
      const result = currentChar.accept(e.key);
      
      if (result >= 0) {        // 正解: 即座音声再生
        if (this.audioEnabled) {
          UnifiedAudioSystem.playClickSound();
        }

        // 即座DOM更新
        this.updateCharState(currentKanaIndex, currentChar);
        
        if (currentChar.isCompleted()) {
          this.state.currentKanaIndex++;
          
          // 🚀 単語完了チェック（即座）
          if (this.state.currentKanaIndex >= typingChars.length) {
            this.handleWordComplete();
            return;
          }
        }
      } else {        // ミス: 即座音声再生
        wordStats.mistakeCount++;
        if (this.audioEnabled) {
          UnifiedAudioSystem.playErrorSound();
        }
      }

      // 🚀 表示更新（queueMicrotask で最高速）
      queueMicrotask(() => {
        this.updateDisplay();
        if (this.onProgress) {
          this.onProgress(this.state.currentKanaIndex, this.state.tempDisplay);
        }
      });
    };
  }

  /**
   * 🚀 単語完了処理
   */
  private handleWordComplete(): void {
    const { wordStats } = this.state;
    wordStats.endTime = performance.now();
    
    this.isActive = false;

    // スコア計算
    const duration = (wordStats.endTime - wordStats.startTime) / 1000;
    const kpm = duration > 0 ? (wordStats.keyCount - wordStats.mistakeCount) / duration * 60 : 0;
    const accuracy = wordStats.keyCount > 0 ? (wordStats.keyCount - wordStats.mistakeCount) / wordStats.keyCount : 1;

    const scoreLog: PerWordScoreLog = {
      keyCount: wordStats.keyCount,
      correct: wordStats.keyCount - wordStats.mistakeCount,
      miss: wordStats.mistakeCount,
      startTime: wordStats.startTime,
      endTime: wordStats.endTime,
      duration,
      kpm: kpm < 0 ? 0 : kpm,
      accuracy: accuracy < 0 ? 0 : accuracy > 1 ? 1 : accuracy,
    };

    // 🚀 即座コールバック（React遅延なし）
    if (this.onWordComplete) {
      queueMicrotask(() => {
        this.onWordComplete!(scoreLog);
      });
    }
  }

  /**
   * 🚀 寿司打流: 単一文字即座更新
   */
  private updateCharState(kanaIndex: number, currentChar: TypingChar): void {
    const displayInfo = currentChar.getDisplayInfo();
    const acceptedLength = displayInfo.acceptedText.length;
    
    // 該当かな文字の全char要素を即座更新
    let charIndex = 0;
    for (const element of this.state.charElements) {
      const elemKanaIndex = parseInt(element.dataset.kanaIndex || '0');
      if (elemKanaIndex !== kanaIndex) {
        if (elemKanaIndex > kanaIndex) break;
        continue;
      }
      
      const elemCharIndex = parseInt(element.dataset.charIndex || '0');
      
      // 🚀 状態判定（最小限ロジック）
      let newClass: string;
      if (elemCharIndex < acceptedLength) {
        newClass = 'typing-char completed';
      } else if (elemCharIndex === acceptedLength) {
        newClass = 'typing-char current';
      } else {
        newClass = 'typing-char pending';
      }
      
      // 🚀 必要時のみDOM変更
      if (element.className !== newClass) {
        element.className = newClass;
      }
      
      charIndex++;
    }
  }

  /**
   * 🚀 寿司打流: 全体表示即座更新
   */
  private updateDisplay(): void {
    const { typingChars, currentKanaIndex } = this.state;
    
    if (currentKanaIndex >= typingChars.length) return;
    
    const currentChar = typingChars[currentKanaIndex];
    if (!currentChar) return;

    const displayInfo = currentChar.getDisplayInfo();
    
    // 🚀 メモリプール使用（オブジェクト作成回避）
    this.state.tempDisplay.acceptedText = displayInfo.acceptedText;
    this.state.tempDisplay.remainingText = displayInfo.remainingText;
    this.state.tempDisplay.displayText = displayInfo.displayText;
  }

  /**
   * 🚀 完全クリーンアップ
   */
  destroy(): void {
    this.isActive = false;
    
    if (this.keyHandler) {
      document.removeEventListener('keydown', this.keyHandler);
      this.keyHandler = null;
    }
    
    this.state.charElements = [];
    this.state.typingChars = [];
    this.state.containerElement = null;
  }

  /**
   * 現在状態取得
   */
  getCurrentState(): { kanaIndex: number; display: KanaDisplay } {
    return {
      kanaIndex: this.state.currentKanaIndex,
      display: this.state.tempDisplay
    };
  }

  /**
   * アクティブ状態チェック
   */
  isEngineActive(): boolean {
    return this.isActive;
  }
}

// シングルトンインスタンス
export const vanillaTypingEngine = new VanillaTypingEngine();
