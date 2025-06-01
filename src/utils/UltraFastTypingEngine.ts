/**
 * ⚡ 寿司打レベル 超高速タイピングエンジン V2
 * 
 * 寿司打・typingmania-ref並みの1ms以下応答を実現
 * 完全同期処理・ゼロアロケーション・直接DOM操作・バッチ更新
 */

import type { TypingChar } from './OptimizedTypingChar';
import type { KanaDisplay, PerWordScoreLog } from '@/types';
import UnifiedAudioSystem from './UnifiedAudioSystem';

interface FastTypingState {
  typingChars: TypingChar[];
  currentKanaIndex: number;
  containerElement: HTMLElement | null;
  charElements: HTMLSpanElement[];
  // ⚡ 超高速DOM更新用キャッシュ
  elementsByKana: Map<number, HTMLSpanElement[]>;
  currentElements: HTMLSpanElement[];
  // ⚡ メモリプール（完全ゼロアロケーション）
  display: KanaDisplay;
  // スコア管理
  stats: {
    keyCount: number;
    mistakeCount: number;
    startTime: number;
    endTime: number;
  };
}

export class UltraFastTypingEngine {
  private state: FastTypingState;
  private keyHandler: ((e: KeyboardEvent) => void) | null = null;
  private isActive = false;
  private audioEnabled = true;
  private onWordComplete: ((scoreLog: PerWordScoreLog) => void) | null = null;
  private onProgress: ((kanaIndex: number, display: KanaDisplay) => void) | null = null;

  // ⚡ 完全静的メモリプール
  private static readonly DISPLAY_POOL: KanaDisplay = {
    acceptedText: '',
    remainingText: '',
    displayText: ''
  };  // ⚡ 事前定義CSS（文字列作成ゼロ）
  private static readonly CLASSES = {
    PENDING: 'typing-char pending',
    CURRENT: 'typing-char current',
    COMPLETED: 'typing-char completed',
    NEXT: 'typing-char next-char'
  };

  // ⚡ 事前バインドメソッド（function作成回避）
  private boundKeyHandler: (e: KeyboardEvent) => void;

  constructor() {
    this.state = {
      typingChars: [],
      currentKanaIndex: 0,
      containerElement: null,
      charElements: [],
      elementsByKana: new Map(),
      currentElements: [],
      display: UltraFastTypingEngine.DISPLAY_POOL,
      stats: {
        keyCount: 0,
        mistakeCount: 0,
        startTime: 0,
        endTime: 0,
      },
    };

    // ⚡ 事前バインド（リスナー作成回避）
    this.boundKeyHandler = this.createKeyHandler();
  }

  /**
   * ⚡ 寿司打流: 超高速初期化
   */  initialize(
    containerElement: HTMLElement,
    typingChars: TypingChar[],
    onProgress?: (kanaIndex: number, display: KanaDisplay) => void,
    onWordComplete?: (scoreLog: PerWordScoreLog) => void,
    audioEnabled = true
  ): void {
    // ステート初期化
    this.state.containerElement = containerElement;
    this.state.typingChars = typingChars;
    this.state.currentKanaIndex = 0;
    this.state.charElements.length = 0;
    this.state.elementsByKana.clear();
    this.state.currentElements.length = 0;
    this.audioEnabled = audioEnabled;
    this.onProgress = onProgress || null;
    this.onWordComplete = onWordComplete || null;

    // スコア初期化
    this.state.stats.keyCount = 0;
    this.state.stats.mistakeCount = 0;
    this.state.stats.startTime = 0;
    this.state.stats.endTime = 0;

    // ⚡ DOM完全クリア（innerHTML避けて高速化）
    while (containerElement.firstChild) {
      containerElement.removeChild(containerElement.firstChild);
    }

    // ⚡ 超高速DOM構築（DocumentFragment + 事前キャッシュ）
    this.buildDOMStructure(containerElement, typingChars);

    // ⚡ 即座キーイベントバインド
    this.bindKeyEvents();

    // 初期表示
    this.syncUpdateDisplay();
    this.isActive = true;
  }/**
   * ⚡ 超高速DOM構築 + 要素キャッシュ
   */  private buildDOMStructure(container: HTMLElement, typingChars: TypingChar[]): void {
    const fragment = document.createDocumentFragment();
    
    for (let kanaIndex = 0; kanaIndex < typingChars.length; kanaIndex++) {
      const typingChar = typingChars[kanaIndex];
      const displayInfo = typingChar.getDisplayInfo();
      const displayText = displayInfo.displayText;
      const kanaElements: HTMLSpanElement[] = [];
      
      // displayTextが空でないことを確認
      if (!displayText || displayText.length === 0) {
        continue;
      }

      // displayTextを文字単位で分割して処理
      const chars = [...displayText];
      for (let charIndex = 0; charIndex < chars.length; charIndex++) {
        const charToDisplay = chars[charIndex];
        const element = document.createElement('span');
        
        // ⚡ 正しいCSS クラス設定
        element.className = 'typing-char pending';
        element.textContent = charToDisplay;
        element.setAttribute('data-kana-index', kanaIndex.toString());
        element.setAttribute('data-char-index', charIndex.toString());
        
        fragment.appendChild(element);
        this.state.charElements.push(element);
        kanaElements.push(element);
      }
      
      // ⚡ かな文字ごとの要素キャッシュ
      this.state.elementsByKana.set(kanaIndex, kanaElements);
    }
    
    container.appendChild(fragment);

    // ⚡ 初期現在要素設定
    if (this.state.elementsByKana.has(0)) {
      this.state.currentElements = this.state.elementsByKana.get(0)!;
      // 初期の最初の文字をcurrentに設定
      if (this.state.currentElements.length > 0) {
        this.state.currentElements[0].className = 'typing-char current';
      }
    }
  }

  /**
   * ⚡ 即座キーイベントバインド
   */  private bindKeyEvents(): void {
    if (this.keyHandler) {
      document.removeEventListener('keydown', this.keyHandler);
    }

    this.keyHandler = this.boundKeyHandler;
    // ⚡ 高性能オプション
    document.addEventListener('keydown', this.keyHandler, { 
      passive: false, 
      capture: true 
    });
  }/**
   * ⚡ 超軽量キーハンドラー（事前作成）
   */  private createKeyHandler() {
    return (e: KeyboardEvent) => {
      // ⚡ 最小限チェック（高速化）
      if (!this.isActive || e.key.length !== 1 || e.ctrlKey || e.altKey || e.metaKey) {
        return;
      }
      
      // ⚡ 軽量イベント制御
      e.preventDefault();

      const { typingChars, currentKanaIndex, stats } = this.state;
      
      if (currentKanaIndex >= typingChars.length) {
        return;
      }
      
      const currentChar = typingChars[currentKanaIndex];
      if (!currentChar) {
        return;
      }

      // ⚡ 初回タイムスタンプ
      if (stats.keyCount === 0) {
        stats.startTime = performance.now();
      }

      stats.keyCount++;

      // ⚡ 文字処理（最小限）
      const result = currentChar.accept(e.key);
      
      if (result >= 0) {
        // ⚡ 正解処理（即座音声）
        if (this.audioEnabled) {
          UnifiedAudioSystem.playClickSound();
        }

        // ⚡ DOM更新（必要時のみ）
        this.syncUpdateCharState(currentKanaIndex, currentChar);
        
        if (currentChar.isCompleted()) {
          this.state.currentKanaIndex++;
          
          // ⚡ 次の要素準備
          this.prepareNextElements();
          
          // ⚡ 単語完了チェック（即座）
          if (this.state.currentKanaIndex >= typingChars.length) {
            this.handleWordComplete();
            return;
          }
        }

        // ⚡ 表示更新（正解時のみ）
        this.syncUpdateDisplay();
        
        // ⚡ コールバック（正解時のみ）
        if (this.onProgress) {
          this.onProgress(this.state.currentKanaIndex, this.state.display);
        }
      } else {
        // ⚡ ミス処理（最小限）
        stats.mistakeCount++;
        if (this.audioEnabled) {
          UnifiedAudioSystem.playErrorSound();
        }
      }
    };
  }

  /**
   * ⚡ 単一かな文字の即座更新（バッチ処理）
   */  private syncUpdateCharState(kanaIndex: number, currentChar: TypingChar): void {
    const displayInfo = currentChar.getDisplayInfo();
    const acceptedLength = displayInfo.acceptedText.length;
    const elements = this.state.elementsByKana.get(kanaIndex);
    
    if (!elements) return;

    // ⚡ 高速DOM更新（変更時のみ）
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      let newClass: string;
      
      if (i < acceptedLength) {
        newClass = UltraFastTypingEngine.CLASSES.COMPLETED;
      } else if (i === acceptedLength) {
        newClass = UltraFastTypingEngine.CLASSES.CURRENT;
      } else {
        newClass = UltraFastTypingEngine.CLASSES.PENDING;
      }
      
      // ⚡ 変更時のみ更新（高速化）
      if (element.className !== newClass) {
        element.className = newClass;
      }
    }
  }

  /**
   * ⚡ 次要素の事前準備
   */  private prepareNextElements(): void {
    const nextKanaIndex = this.state.currentKanaIndex;
    if (this.state.elementsByKana.has(nextKanaIndex)) {
      this.state.currentElements = this.state.elementsByKana.get(nextKanaIndex)!;
      // 次の最初の文字をcurrentに設定
      if (this.state.currentElements.length > 0) {
        this.state.currentElements[0].className = 'typing-char current';
      }
    }
  }

  /**
   * ⚡ 完全同期表示更新
   */
  private syncUpdateDisplay(): void {
    const { typingChars, currentKanaIndex } = this.state;
    
    if (currentKanaIndex >= typingChars.length) return;
    
    const currentChar = typingChars[currentKanaIndex];
    if (!currentChar) return;

    const displayInfo = currentChar.getDisplayInfo();
    
    // ⚡ メモリプール使用（文字列作成ゼロ）
    this.state.display.acceptedText = displayInfo.acceptedText;
    this.state.display.remainingText = displayInfo.remainingText;
    this.state.display.displayText = displayInfo.displayText;
  }
  /**
   * ⚡ 単語完了処理（即座）
   */  private handleWordComplete(): void {
    const { stats } = this.state;
    stats.endTime = performance.now();
    
    // ⚡ エンジンは次の単語のためアクティブのまま維持
    // this.isActive = false; // コメントアウト：次の単語のため継続

    // ⚡ 高速スコア計算
    const duration = (stats.endTime - stats.startTime) / 1000;
    const correct = stats.keyCount - stats.mistakeCount;
    const kpm = duration > 0 ? correct / duration * 60 : 0;
    const accuracy = stats.keyCount > 0 ? correct / stats.keyCount : 1;

    const scoreLog: PerWordScoreLog = {
      keyCount: stats.keyCount,
      correct: correct < 0 ? 0 : correct,
      miss: stats.mistakeCount,
      startTime: stats.startTime,
      endTime: stats.endTime,
      duration,
      kpm: kpm < 0 ? 0 : kpm,
      accuracy: accuracy < 0 ? 0 : accuracy > 1 ? 1 : accuracy,
    };

    // ⚡ 即座コールバック（同期）
    if (this.onWordComplete) {
      this.onWordComplete(scoreLog);
    }
  }

  /**
   * ⚡ 完全クリーンアップ
   */
  destroy(): void {
    this.isActive = false;
    
    if (this.keyHandler) {
      document.removeEventListener('keydown', this.keyHandler);
      this.keyHandler = null;
    }
    
    this.state.charElements.length = 0;
    this.state.typingChars.length = 0;
    this.state.elementsByKana.clear();
    this.state.currentElements.length = 0;
    this.state.containerElement = null;
  }

  /**
   * 現在状態取得
   */
  getCurrentState(): { kanaIndex: number; display: KanaDisplay } {
    return {
      kanaIndex: this.state.currentKanaIndex,
      display: this.state.display
    };
  }

  /**
   * アクティブ状態チェック
   */
  isEngineActive(): boolean {
    return this.isActive;
  }

  /**
   * 強制音声切り替え
   */
  setAudioEnabled(enabled: boolean): void {
    this.audioEnabled = enabled;
  }
}

// ⚡ シングルトン超高速エンジン
export const ultraFastTypingEngine = new UltraFastTypingEngine();
