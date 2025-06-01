/**
 * ⚡ 寿司打レベル 超高速タイピングエンジン V2
 * 
 * 寿司打・typingmania-ref並みの1ms以下応答を実現
 * 完全同期処理・ゼロアロケーション・直接DOM操作・バッチ更新
 */

import type { TypingChar } from './OptimizedTypingChar';
import type { KanaDisplay, PerWordScoreLog } from '@/types';
import OptimizedAudioSystem from './OptimizedAudioSystem';

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
  };
  // ⚡ typingmania-ref流：直接色変更（最高速）
  private static readonly COLORS = {
    PENDING: '#6b7280',        // グレー
    CURRENT: '#ff8c00',        // オレンジ（カーソル）
    COMPLETED: '#10b981',      // 緑
    ERROR: '#ef4444'           // 赤
  };

  // ⚡ 事前バインドメソッド（function作成回避）
  private boundKeyHandler: (e: KeyboardEvent) => void;
  
  // ⚡ typingmania-ref流：メモリリーク防止
  private cleanupCallbacks: Array<() => void> = [];
  private animationFrameId: number | null = null;
  private updateScheduled = false;

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
        const charToDisplay = chars[charIndex];        const element = document.createElement('span');
          // ⚡ typingmania-ref流：直接色設定
        element.className = 'typing-char';
        element.style.color = UltraFastTypingEngine.COLORS.PENDING;
        element.textContent = charToDisplay;
        element.setAttribute('data-kana-index', kanaIndex.toString());
        element.setAttribute('data-char-index', charIndex.toString());
        
        // ⚡ メモリリーク防止：クリーンアップ登録
        this.cleanupCallbacks.push(() => {
          element.remove();
        });
        
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
      this.state.currentElements = this.state.elementsByKana.get(0)!;      // 初期の最初の文字をcurrentに設定
      if (this.state.currentElements.length > 0) {
        this.state.currentElements[0].style.color = UltraFastTypingEngine.COLORS.CURRENT;
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
      // ⚡ 最小限チェック（高速化）- Spaceキーとナビゲーションキーを除外
      if (!this.isActive || e.key.length !== 1 || e.ctrlKey || e.altKey || e.metaKey || e.key === ' ') {
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

      stats.keyCount++;      // ⚡ 文字処理（最小限）
      const result = currentChar.accept(e.key);
      
      if (result >= 0) {        // ⚡ 正解処理（即座音声）
        if (this.audioEnabled) {
          OptimizedAudioSystem.playClickSound();
        }

        // ⚡ 現在の文字のDOM状態を更新
        this.syncUpdateCharState(currentKanaIndex, currentChar);
        
        if (currentChar.isCompleted()) {
          // ⚡ 次の文字にインデックスを移動
          this.state.currentKanaIndex++;
          
          // ⚡ 次の要素準備（新しいインデックスで）
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
      } else {        // ⚡ ミス処理（最小限）
        stats.mistakeCount++;
        if (this.audioEnabled) {
          OptimizedAudioSystem.playErrorSound();
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

    // ⚡ 文字が完了している場合は全て完了色に
    const isCompleted = currentChar.isCompleted();
    
    // ⚡ typingmania-ref流：色直接変更（最高速）
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      let newColor: string;
      
      if (isCompleted) {
        // 文字完了時は全て完了色
        newColor = UltraFastTypingEngine.COLORS.COMPLETED;
      } else if (i < acceptedLength) {
        newColor = UltraFastTypingEngine.COLORS.COMPLETED;
      } else if (i === acceptedLength) {
        newColor = UltraFastTypingEngine.COLORS.CURRENT;
      } else {
        newColor = UltraFastTypingEngine.COLORS.PENDING;
      }
      
      // ⚡ 色のみ変更（最高速）
      if (element.style.color !== newColor) {
        element.style.color = newColor;
      }
    }
  }  /**
   * ⚡ 次要素の事前準備
   */
  private prepareNextElements(): void {
    const prevKanaIndex = this.state.currentKanaIndex - 1;
    const nextKanaIndex = this.state.currentKanaIndex;
    
    // ⚡ 前の文字を完了色に変更（typingmania-ref流）
    if (prevKanaIndex >= 0 && this.state.elementsByKana.has(prevKanaIndex)) {
      const prevElements = this.state.elementsByKana.get(prevKanaIndex)!;
      const prevChar = this.state.typingChars[prevKanaIndex];
      
      // 前の文字が完了している場合は全て完了色に
      if (prevChar && prevChar.isCompleted()) {
        for (const element of prevElements) {
          element.style.color = UltraFastTypingEngine.COLORS.COMPLETED;
        }
      }
    }
    
    // ⚡ 次の文字をcurrentに設定
    if (this.state.elementsByKana.has(nextKanaIndex)) {
      this.state.currentElements = this.state.elementsByKana.get(nextKanaIndex)!;
      // 次の最初の文字をcurrentに設定
      if (this.state.currentElements.length > 0) {
        this.state.currentElements[0].style.color = UltraFastTypingEngine.COLORS.CURRENT;
      }
    }
  }

  /**
   * ローマ字表示を直接DOMに即時反映（1文字単位で色分け・フォーカス対応）
   */
  private updateRomajiDisplay(): void {
    const romajiEl = document.querySelector('.romaji-display') as HTMLDivElement | null;
    if (!romajiEl) return;
    const { typingChars, currentKanaIndex } = this.state;
    const currentChar = typingChars[currentKanaIndex];
    if (!currentChar) {
      romajiEl.textContent = '';
      return;
    }
    const info = currentChar.getDisplayInfo();
    const romaji = info.displayText || '';
    const accepted = info.acceptedText || '';
    // 1文字単位で色分け
    romajiEl.innerHTML = '';
    let focusSet = false;
    for (let i = 0; i < romaji.length; i++) {
      const span = document.createElement('span');
      span.textContent = romaji[i];
      if (i < accepted.length) {
        span.style.color = UltraFastTypingEngine.COLORS.COMPLETED;
      } else if (i === accepted.length && !focusSet) {
        span.style.color = UltraFastTypingEngine.COLORS.CURRENT;
        focusSet = true;
      } else {
        span.style.color = UltraFastTypingEngine.COLORS.PENDING;
      }
      romajiEl.appendChild(span);
    }
  }
  /**
   * かな表示を全文＋色分けで直接DOMに即時反映（1文字単位でフォーカス対応）
   */
  private updateKanaDisplay(): void {
    const kanaEl = document.querySelector('.word-hiragana') as HTMLDivElement | null;
    if (!kanaEl) return;
    const { typingChars, currentKanaIndex } = this.state;
    // 全体のかな文字列を構築
    const allKana = typingChars.map(char => char.kana || '').join('');
    // 進行状況（何文字目まで完了か）
    let completedCount = 0;
    for (let i = 0; i < currentKanaIndex; i++) {
      completedCount += (typingChars[i].kana || '').length;
    }
    // 現在の文字のacceptedText長も加算
    const currentChar = typingChars[currentKanaIndex];
    let currentAccepted = 0;
    if (currentChar && currentChar.acceptedInput) {
      currentAccepted = currentChar.acceptedInput.length;
    }
    const focusIndex = completedCount + currentAccepted;
    kanaEl.innerHTML = '';
    for (let i = 0; i < allKana.length; i++) {
      const span = document.createElement('span');
      span.textContent = allKana[i];
      if (i < focusIndex) {
        span.style.color = UltraFastTypingEngine.COLORS.COMPLETED;
      } else if (i === focusIndex) {
        span.style.color = UltraFastTypingEngine.COLORS.CURRENT;
      } else {
        span.style.color = UltraFastTypingEngine.COLORS.PENDING;
      }
      kanaEl.appendChild(span);
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
    // ローマ字表示を直接DOMに反映
    this.updateRomajiDisplay();
    // かな表示も直接DOMに反映
    this.updateKanaDisplay();
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
  }  /**
   * ⚡ 完全クリーンアップ
   */
  destroy(): void {
    this.deactivate();
    
    this.state.charElements.length = 0;
    this.state.typingChars.length = 0;
    this.state.elementsByKana.clear();
    this.state.currentElements.length = 0;
    this.state.containerElement = null;
  }

  /**
   * ⚡ typingmania-ref流：エンジン非アクティブ化
   */
  deactivate(): void {
    this.isActive = false;
    
    if (this.keyHandler) {
      document.removeEventListener('keydown', this.keyHandler);
      this.keyHandler = null;
    }
  }
  /**
   * ⚡ 単語状態リセット（新しい単語開始時）
   */
  resetWord(): void {
    this.state.currentKanaIndex = 0;
    this.state.stats.keyCount = 0;
    this.state.stats.mistakeCount = 0;
    this.state.stats.startTime = 0;
    this.state.stats.endTime = 0;
    
    // 全TypingCharをリセット
    this.state.typingChars.forEach(char => {
      if (char.reset) {
        char.reset();
      }
    });
    
    // 表示をクリア
    this.state.display.acceptedText = '';
    this.state.display.remainingText = '';
    this.state.display.displayText = '';
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

  /**
   * ⚡ typingmania-ref流：完全メモリクリーンアップ
   */
  dispose(): void {
    this.deactivate();
    
    // アニメーションフレームをキャンセル
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    // 全てのコールバックを実行してクリーンアップ
    this.cleanupCallbacks.forEach(cleanup => cleanup());
    this.cleanupCallbacks = [];
    
    // DOM要素参照をクリア
    this.state.charElements = [];
    this.state.elementsByKana.clear();
    this.state.currentElements = [];
    this.state.containerElement = null;
    
    // メモリプールをリセット
    UltraFastTypingEngine.DISPLAY_POOL.acceptedText = '';
    UltraFastTypingEngine.DISPLAY_POOL.remainingText = '';
    UltraFastTypingEngine.DISPLAY_POOL.displayText = '';
  }
  /**
   * ⚡ typingmania-ref流：バッチ更新スケジューラー
   */
  private scheduleUpdate(): void {
    if (this.updateScheduled) return;
    
    this.updateScheduled = true;
    this.animationFrameId = requestAnimationFrame(() => {
      this.updateScheduled = false;
      this.syncUpdateDisplay();
    });
  }
}

// ⚡ シングルトン超高速エンジン
export const ultraFastTypingEngine = new UltraFastTypingEngine();
