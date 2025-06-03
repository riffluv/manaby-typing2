/**
 * BasicTypingEngine - typingmania-ref流のシンプル設計
 * 
 * BasicTypingCharを使用してシンプルで効率的なタイピング処理を実現
 * 元のtypingmania-refの33行レベルのシンプルさに回帰
 * 
 * ユーザーの複雑なタイピングロジックは japaneseUtils.ts で完全保持
 */

import type { BasicTypingChar, BasicDisplayInfo } from './BasicTypingChar';
import type { KanaDisplay, PerWordScoreLog } from '@/types';

export interface BasicTypingState {
  typingChars: BasicTypingChar[];
  currentIndex: number;
  keyCount: number;
  mistakeCount: number;
  startTime: number;
}

/**
 * typingmania-ref流のシンプルなタイピングエンジン
 * 複雑な最適化を排除し、基本的な機能のみ実装
 */
export class BasicTypingEngine {
  private state: BasicTypingState;
  private container: HTMLElement | null = null;
  private onProgress?: (index: number, display: KanaDisplay) => void;
  private onComplete?: (scoreLog: PerWordScoreLog) => void;
  private keyHandler?: (e: KeyboardEvent) => void;

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
   * typingmania-ref流: 最小限のセットアップ
   */
  initialize(
    container: HTMLElement,
    typingChars: BasicTypingChar[],
    onProgress?: (index: number, display: KanaDisplay) => void,
    onComplete?: (scoreLog: PerWordScoreLog) => void
  ): void {
    const wordText = typingChars.map(c => c.kana).join('');
    console.log('🚀 [BasicTypingEngine] Initializing engine for word:', wordText);
    
    this.container = container;
    this.state.typingChars = typingChars;
    this.state.currentIndex = 0;
    this.state.keyCount = 0;
    this.state.mistakeCount = 0;
    this.state.startTime = 0;
    this.onProgress = onProgress;
    this.onComplete = onComplete;

    console.log('📊 [BasicTypingEngine] Initial state:', {
      currentIndex: this.state.currentIndex,
      totalChars: this.state.typingChars.length,
      firstChar: this.state.typingChars[0]?.getDisplayInfo().displayText
    });

    // 初期表示の構築
    this.buildDisplay();
    
    // キーリスナーの設定
    this.setupKeyListener();
  }

  /**
   * シンプルな表示構築
   * typingmania-ref流: 最小限のDOM操作
   */
  private buildDisplay(): void {
    if (!this.container) return;

    // コンテナをクリア
    this.container.innerHTML = '';

    // 現在の文字の表示テキストを取得
    const currentChar = this.state.typingChars[this.state.currentIndex];
    if (!currentChar) return;

    const displayInfo = currentChar.getDisplayInfo();
    
    // シンプルなテキスト表示
    const textElement = document.createElement('div');
    textElement.style.fontSize = '2rem';
    textElement.style.fontFamily = 'monospace';
    textElement.style.textAlign = 'center';
    textElement.style.letterSpacing = '0.1em';
    textElement.style.color = '#fff';
    textElement.textContent = displayInfo.displayText || '';
    
    this.container.appendChild(textElement);
  }

  /**
   * キーリスナーの設定
   * typingmania-ref流: グローバルキーハンドラー
   */
  private setupKeyListener(): void {
    this.keyHandler = (e: KeyboardEvent) => {
      // 基本的なフィルタリング
      if (e.key.length !== 1 || e.ctrlKey || e.altKey || e.metaKey) {
        return;
      }

      this.handleKeyInput(e.key);
    };

    document.addEventListener('keydown', this.keyHandler);
  }

  /**
   * キー入力処理
   * typingmania-ref流: シンプルな判定ロジック
   */  private handleKeyInput(key: string): void {
    if (this.state.currentIndex >= this.state.typingChars.length) return;

    // 初回入力時のタイマー開始
    if (this.state.keyCount === 0) {
      this.state.startTime = performance.now();
    }

    this.state.keyCount++;

    const currentChar = this.state.typingChars[this.state.currentIndex];
    const result = currentChar.accept(key);

    // デバッグ情報を追加
    console.log('🔧 BasicTypingEngine key processing:', {
      key,
      currentIndex: this.state.currentIndex,
      currentKana: currentChar.kana,
      acceptedInput: currentChar.acceptedInput,
      remainingText: currentChar.remainingText,
      completed: currentChar.completed,
      result
    });    if (result >= 0) {
      // 正解
      // まず表示更新と進捗通知（現在の文字の状態で）
      this.updateDisplay();
      this.notifyProgress();
      
      if (currentChar.isCompleted()) {
        console.log('✅ Character completed, advancing to next');
        this.state.currentIndex++;
        console.log('🔄 New currentIndex:', this.state.currentIndex);
        
        // 文字完了後の進捗通知も実行
        this.notifyProgress();
        
        // 単語完了チェック
        if (this.state.currentIndex >= this.state.typingChars.length) {
          this.handleWordComplete();
          return;
        }
        
        // 新しい文字への表示更新
        this.updateDisplay();
      }
    } else {
      // ミス
      console.log('❌ Key miss');
      this.state.mistakeCount++;
    }
  }

  /**
   * 表示更新
   * typingmania-ref流: 最小限の更新
   */
  private updateDisplay(): void {
    if (!this.container) return;

    const currentChar = this.state.typingChars[this.state.currentIndex];
    if (!currentChar) return;

    const displayInfo = currentChar.getDisplayInfo();
    const textElement = this.container.querySelector('div');
    
    if (textElement) {
      textElement.textContent = displayInfo.displayText || '';
    }
  }
  /**
   * 進捗通知
   */
  private notifyProgress(): void {
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
   * 詳細な進捗情報を取得（ローマ字文字レベル）
   */
  getDetailedProgress(): {
    currentKanaIndex: number;
    currentRomajiIndex: number;
    totalKanaCount: number;
    totalRomajiCount: number;
    currentKanaDisplay: KanaDisplay | null;
  } {
    const currentChar = this.state.typingChars[this.state.currentIndex];
    if (!currentChar) {
      return {
        currentKanaIndex: this.state.currentIndex,
        currentRomajiIndex: 0,
        totalKanaCount: this.state.typingChars.length,
        totalRomajiCount: 0,
        currentKanaDisplay: null
      };
    }

    const displayInfo = currentChar.getDisplayInfo();
    const kanaDisplay: KanaDisplay = {
      acceptedText: displayInfo.acceptedText,
      remainingText: displayInfo.remainingText,
      displayText: displayInfo.displayText
    };

    // 現在のひらがな文字内でのローマ字進捗を計算
    const currentRomajiIndex = displayInfo.acceptedText.length;
    
    // 全体のローマ字文字数を計算
    let totalRomajiCount = 0;
    for (const char of this.state.typingChars) {
      if (char.patterns.length > 0) {
        totalRomajiCount += char.patterns[0].length; // 最初のパターンの長さを使用
      }
    }

    return {
      currentKanaIndex: this.state.currentIndex,
      currentRomajiIndex,
      totalKanaCount: this.state.typingChars.length,
      totalRomajiCount,
      currentKanaDisplay: kanaDisplay
    };
  }

  /**
   * 単語完了処理
   */
  private handleWordComplete(): void {
    if (!this.onComplete) return;

    const endTime = performance.now();
    const duration = (endTime - this.state.startTime) / 1000;
    const correct = this.state.keyCount - this.state.mistakeCount;
    const kpm = duration > 0 ? (correct / duration) * 60 : 0;
    const accuracy = this.state.keyCount > 0 ? correct / this.state.keyCount : 1;

    const scoreLog: PerWordScoreLog = {
      keyCount: this.state.keyCount,
      correct: Math.max(0, correct),
      miss: this.state.mistakeCount,
      startTime: this.state.startTime,
      endTime: endTime,
      duration,
      kpm: Math.max(0, kpm),
      accuracy: Math.min(1, Math.max(0, accuracy)),
    };

    this.onComplete(scoreLog);
  }
  /**
   * エンジンのクリーンアップ
   */
  destroy(): void {
    const wordText = this.state.typingChars.map(c => c.kana).join('') || 'unknown';
    console.log('🧹 [BasicTypingEngine] Destroying engine for word:', wordText);
    
    if (this.keyHandler) {
      document.removeEventListener('keydown', this.keyHandler);
      this.keyHandler = undefined;
    }
    
    if (this.container) {
      this.container.innerHTML = '';
    }
    
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
   * 単語リセット（新しい単語用）
   */
  resetWord(): void {
    this.state.currentIndex = 0;
    this.state.keyCount = 0;
    this.state.mistakeCount = 0;
    this.state.startTime = 0;

    // 各文字をリセット
    this.state.typingChars.forEach(char => {
      char.reset();
    });

    // 表示をリセット
    this.buildDisplay();
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
}
