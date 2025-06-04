/**
 * OptimizedTypingEngine - typingmania-ref流の超高速タイピングエンジン
 * 
 * React仮想DOMをバイパスし、直接DOM操作で最高速を実現
 * デモページレベルの応答性をメインアプリケーションで実現
 */

import type { BasicTypingChar, BasicDisplayInfo } from './BasicTypingChar';
import type { KanaDisplay, PerWordScoreLog } from '@/types';
import OptimizedAudioSystem from './OptimizedAudioSystem';

export interface OptimizedTypingState {
  typingChars: BasicTypingChar[];
  currentIndex: number;
  keyCount: number;
  mistakeCount: number;
  startTime: number;
}

interface DisplayElements {
  kanaElement: HTMLElement;
  romajiElement: HTMLElement;
  progressElement: HTMLElement;
}

/**
 * typingmania-ref流の超高速タイピングエンジン
 * 直接DOM操作で最高パフォーマンスを実現
 */
export class OptimizedTypingEngine {
  private state: OptimizedTypingState;
  private container: HTMLElement | null = null;
  private displayElements: DisplayElements | null = null;
  private onProgress?: (index: number, display: KanaDisplay) => void;
  private onComplete?: (scoreLog: PerWordScoreLog) => void;
  private keyHandler?: (e: KeyboardEvent) => void;
  
  // 高速化のためのキャッシュ
  private romajiCache: string = '';
  private totalRomajiLength: number = 0;

  constructor() {
    this.state = {
      typingChars: [],
      currentIndex: 0,
      keyCount: 0,
      mistakeCount: 0,
      startTime: 0,
    };
  }

  /**
   * エンジンの初期化
   * typingmania-ref流: 直接DOM構築 + 最適化されたキーハンドリング
   */
  initialize(
    container: HTMLElement,
    typingChars: BasicTypingChar[],
    onProgress?: (index: number, display: KanaDisplay) => void,
    onComplete?: (scoreLog: PerWordScoreLog) => void
  ): void {
    const wordText = typingChars.map(c => c.kana).join('');
    console.log('🚀 [OptimizedTypingEngine] Initializing ultra-fast engine for word:', wordText);
    
    // 🎵 音響システムの初期化確認
    OptimizedAudioSystem.init();
    
    this.container = container;
    this.state.typingChars = typingChars;
    this.state.currentIndex = 0;
    this.state.keyCount = 0;
    this.state.mistakeCount = 0;
    this.state.startTime = 0;
    
    this.onProgress = onProgress;
    this.onComplete = onComplete;

    // ローマ字キャッシュを構築
    this.buildRomajiCache();
    
    // 最適化されたUI構築
    this.buildOptimizedDisplay();
    
    // 高速キーリスナーの設定
    this.setupOptimizedKeyListener();
  }

  /**
   * ローマ字キャッシュの構築
   */
  private buildRomajiCache(): void {
    this.romajiCache = this.state.typingChars
      .map(char => char.patterns[0] || '')
      .join('');
    this.totalRomajiLength = this.romajiCache.length;
  }

  /**
   * 最適化された表示構築
   * typingmania-ref流: 最小限のDOM + 直接スタイル設定
   */
  private buildOptimizedDisplay(): void {
    if (!this.container) return;

    // コンテナをクリア
    this.container.innerHTML = '';
    this.container.style.textAlign = 'center';
    this.container.style.userSelect = 'none';

    // かな表示要素
    const kanaElement = document.createElement('div');
    kanaElement.style.fontSize = '3rem';
    kanaElement.style.fontFamily = 'Noto Sans JP, sans-serif';
    kanaElement.style.color = '#fff';
    kanaElement.style.marginBottom = '1rem';
    kanaElement.style.letterSpacing = '0.1em';
    kanaElement.style.lineHeight = '1.2';

    // ローマ字表示要素
    const romajiElement = document.createElement('div');
    romajiElement.style.fontSize = '2rem';
    romajiElement.style.fontFamily = 'monospace';
    romajiElement.style.color = '#ccc';
    romajiElement.style.letterSpacing = '0.2em';
    romajiElement.style.lineHeight = '1.2';

    // 進捗表示要素
    const progressElement = document.createElement('div');
    progressElement.style.fontSize = '1rem';
    progressElement.style.fontFamily = 'monospace';
    progressElement.style.color = '#888';
    progressElement.style.marginTop = '1rem';

    this.container.appendChild(kanaElement);
    this.container.appendChild(romajiElement);
    this.container.appendChild(progressElement);

    this.displayElements = {
      kanaElement,
      romajiElement,
      progressElement
    };

    // 初期表示を更新
    this.updateDisplayDirect();
  }  /**
   * 高速キーリスナーの設定
   * typingmania-ref流: グローバルハンドラー + 最小処理 + 全文字対応
   */
  private setupOptimizedKeyListener(): void {
    this.keyHandler = (e: KeyboardEvent) => {
      // 基本的なフィルタリング（BasicTypingEngineと同じ方式）
      if (e.key.length !== 1 || e.ctrlKey || e.altKey || e.metaKey) {
        return;
      }

      // 全ての1文字入力を受け付け（伸ばし棒やひらがなも含む）
      this.handleKeyInputOptimized(e.key);
      e.preventDefault();
    };

    document.addEventListener('keydown', this.keyHandler);
  }

  /**
   * 最適化されたキー入力処理
   * typingmania-ref流: 最小限の処理 + 直接DOM更新
   */
  private handleKeyInputOptimized(key: string): void {
    if (this.state.currentIndex >= this.state.typingChars.length) return;

    // 初回入力時のタイマー開始
    if (this.state.keyCount === 0) {
      this.state.startTime = performance.now();
    }

    this.state.keyCount++;

    const currentChar = this.state.typingChars[this.state.currentIndex];
    const result = currentChar.accept(key);

    if (result >= 0) {      // 🎵 正しい入力音
      OptimizedAudioSystem.playClickSound();

      // 直接DOM更新（React をバイパス）
      this.updateDisplayDirect();

      // 文字完了チェック
      if (currentChar.isCompleted()) {
        this.state.currentIndex++;
        
        // 全体完了チェック
        if (this.state.currentIndex >= this.state.typingChars.length) {
          this.handleWordCompleteOptimized();
          return;
        }
      }

      // 高速プログレス通知（最小限のデータ）
      this.notifyProgressOptimized();
    } else {      // 🎵 エラー音
      OptimizedAudioSystem.playErrorSound();
      this.state.mistakeCount++;
    }
  }

  /**
   * 直接DOM更新
   * typingmania-ref流: React仮想DOMをバイパス
   */
  private updateDisplayDirect(): void {
    if (!this.displayElements) return;

    const currentChar = this.state.typingChars[this.state.currentIndex];
    if (!currentChar) return;

    const displayInfo = currentChar.getDisplayInfo();

    // かな表示の更新
    this.displayElements.kanaElement.textContent = displayInfo.displayText || '';

    // ローマ字表示の更新（高速計算）
    const acceptedRomaji = this.calculateAcceptedRomaji();
    const remainingRomaji = this.romajiCache.substring(acceptedRomaji.length);
    
    this.displayElements.romajiElement.innerHTML = 
      `<span style="color: #4ade80;">${acceptedRomaji}</span>` +
      `<span style="color: #ccc;">${remainingRomaji}</span>`;

    // 進捗表示の更新
    this.displayElements.progressElement.textContent = 
      `${this.state.currentIndex + 1} / ${this.state.typingChars.length} | ${acceptedRomaji.length} / ${this.totalRomajiLength}`;
  }

  /**
   * 高速ローマ字進捗計算
   */
  private calculateAcceptedRomaji(): string {
    let accepted = '';
    for (let i = 0; i < this.state.currentIndex; i++) {
      const char = this.state.typingChars[i];
      accepted += char.patterns[0] || '';
    }
    
    // 現在の文字の受け入れ済み部分を追加
    if (this.state.currentIndex < this.state.typingChars.length) {
      const currentChar = this.state.typingChars[this.state.currentIndex];
      const displayInfo = currentChar.getDisplayInfo();
      accepted += displayInfo.acceptedText || '';
    }
    
    return accepted;
  }

  /**
   * 最適化されたプログレス通知
   */
  private notifyProgressOptimized(): void {
    if (!this.onProgress) return;

    const currentChar = this.state.typingChars[this.state.currentIndex];
    if (!currentChar) return;

    const displayInfo = currentChar.getDisplayInfo();
    const kanaDisplay: KanaDisplay = {
      acceptedText: displayInfo.acceptedText,
      remainingText: displayInfo.remainingText,
      displayText: displayInfo.displayText
    };
    
    this.onProgress(this.state.currentIndex, kanaDisplay);
  }

  /**
   * 最適化された単語完了処理
   */
  private handleWordCompleteOptimized(): void {
    const endTime = performance.now();
    const duration = endTime - this.state.startTime;    // 🎵 完了音
    OptimizedAudioSystem.playSuccessSound();    const scoreLog: PerWordScoreLog = {
      keyCount: this.state.keyCount,
      correct: this.state.keyCount - this.state.mistakeCount,
      miss: this.state.mistakeCount,
      startTime: this.state.startTime,
      endTime: endTime,
      duration: duration / 1000, // 秒に変換
      kpm: this.calculateKPM(duration),
      accuracy: this.calculateAccuracy() / 100, // 0-1に変換
    };

    if (this.onComplete) {
      this.onComplete(scoreLog);
    }
  }

  /**
   * KPM計算
   */
  private calculateKPM(duration: number): number {
    if (duration <= 0) return 0;
    return Math.round((this.state.keyCount / duration) * 60000);
  }

  /**
   * 正確性計算
   */
  private calculateAccuracy(): number {
    const total = this.state.keyCount;
    if (total === 0) return 100;
    return Math.round(((total - this.state.mistakeCount) / total) * 100);
  }

  /**
   * エンジンのクリーンアップ
   */
  destroy(): void {
    const wordText = this.state.typingChars.map(c => c.kana).join('') || 'unknown';
    console.log('🧹 [OptimizedTypingEngine] Destroying ultra-fast engine for word:', wordText);
    
    if (this.keyHandler) {
      document.removeEventListener('keydown', this.keyHandler);
      this.keyHandler = undefined;
    }
    
    if (this.container) {
      this.container.innerHTML = '';
    }
    
    this.displayElements = null;
    
    // 状態リセット
    this.state = {
      typingChars: [],
      currentIndex: 0,
      keyCount: 0,
      mistakeCount: 0,
      startTime: 0,
    };
  }

  /**
   * クリーンアップ（destroyのエイリアス）
   */
  cleanup(): void {
    this.destroy();
  }

  /**
   * 現在の状態を取得
   */
  getCurrentState(): { index: number; display: KanaDisplay } {
    const currentChar = this.state.typingChars[this.state.currentIndex];
    const displayInfo = currentChar?.getDisplayInfo();
    
    const display: KanaDisplay = {
      acceptedText: displayInfo?.acceptedText || '',
      remainingText: displayInfo?.remainingText || '',
      displayText: displayInfo?.displayText || ''
    };

    return {
      index: this.state.currentIndex,
      display
    };
  }

  /**
   * 詳細な進捗情報を取得
   */
  getDetailedProgress(): {
    currentKanaIndex: number;
    currentRomajiIndex: number;
    totalKanaCount: number;
    totalRomajiCount: number;
    currentKanaDisplay: KanaDisplay | null;
  } {
    const currentChar = this.state.typingChars[this.state.currentIndex];
    const displayInfo = currentChar?.getDisplayInfo();
    
    const acceptedRomaji = this.calculateAcceptedRomaji();
    
    return {
      currentKanaIndex: this.state.currentIndex,
      currentRomajiIndex: acceptedRomaji.length,
      totalKanaCount: this.state.typingChars.length,
      totalRomajiCount: this.totalRomajiLength,
      currentKanaDisplay: displayInfo ? {
        acceptedText: displayInfo.acceptedText,
        remainingText: displayInfo.remainingText,
        displayText: displayInfo.displayText
      } : null
    };
  }
}
