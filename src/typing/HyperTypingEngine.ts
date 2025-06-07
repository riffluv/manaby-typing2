/**
 * HyperTypingEngine - typingmania-ref スタイル リファクタリング版
 * 
 * 複雑な最適化システムを削除し、シンプルで高速な実装に変更
 * 「ん」の分岐処理は完璧に保持
 */

import { TypingChar, type DisplayInfo } from './TypingChar';
import type { KanaDisplay, PerWordScoreLog } from '@/types';
import OptimizedAudioSystem from '@/utils/OptimizedAudioSystem';
import { debug } from '../utils/debug';

// シンプルなエンジン状態管理
interface HyperEngineState {
  typingChars: TypingChar[];
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
 * 🚀 HyperTypingEngine - typingmania-ref スタイル簡素化版
 * 
 * デッドタイム解消のため複雑な最適化を削除し、
 * シンプルで直接的なキー処理を実装
 */
export class HyperTypingEngine {
  // 内部状態管理
  private state: HyperEngineState;
  private container: HTMLElement | null = null;
  private displayElements: DisplayElements | null = null;
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
   * 初期化
   */
  initialize(
    container: HTMLElement,
    typingChars: TypingChar[],
    onProgress?: (index: number, display: KanaDisplay) => void,
    onComplete?: (scoreLog: PerWordScoreLog) => void
  ): void {
    this.container = container;
    this.state.typingChars = typingChars;
    this.state.currentIndex = 0;
    this.state.keyCount = 0;
    this.state.mistakeCount = 0;
    this.state.startTime = 0;
    this.onProgress = onProgress;
    this.onComplete = onComplete;    this.setupDOM();
    this.updateDisplay();
    this.setupKeyListener();

    // 初期化完了（本番環境ではログ削除推奨）
    if (process.env.NODE_ENV === 'development') {
      debug.log('🚀 HyperTypingEngine初期化完了 - シンプルモード');
    }
  }

  /**
   * DOM要素のセットアップ
   */
  private setupDOM(): void {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="typing-display">
        <div class="kana-display"></div>
        <div class="romaji-display"></div>
        <div class="progress-display"></div>
      </div>
    `;

    this.displayElements = {
      kanaElement: this.container.querySelector('.kana-display') as HTMLElement,
      romajiElement: this.container.querySelector('.romaji-display') as HTMLElement,
      progressElement: this.container.querySelector('.progress-display') as HTMLElement,
    };
  }

  /**
   * キーリスナーセットアップ
   */
  private setupKeyListener(): void {
    if (document.body) {
      document.body.tabIndex = -1;
      document.body.focus();
    }
    
    this.keyHandler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.metaKey || e.key.length !== 1) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      
      // 🚀 typingmania-ref スタイル: 直接キー処理（デッドタイム解消）
      this.processKey(e.key);
    };

    document.addEventListener('keydown', this.keyHandler, { capture: true });
  }

  /**
   * 🚀 typingmania-ref流: シンプルで直接的なキー処理
   * 複雑な最適化を削除し、デッドタイムを解消する核心部分
   */
  private processKey(key: string): void {
    // 初回キー入力時に音声システムを初期化
    if (this.state.keyCount === 0) {
      OptimizedAudioSystem.resumeAudioContext();
    }
    
    if (this.state.startTime === 0) {
      this.state.startTime = Date.now();
    }

    this.state.keyCount++;

    const currentChar = this.state.typingChars[this.state.currentIndex];
    if (!currentChar) return;

    // 「ん」の分岐状態処理（完璧な実装を保持）
    if (currentChar.branchingState) {
      const nextChar = this.state.typingChars[this.state.currentIndex + 1];
      const result = currentChar.typeBranching(key, nextChar);
      
      if (result.success) {
        OptimizedAudioSystem.playClickSound();
        
        if (result.completeWithSingle) {
          // 'n'パターン選択の場合 - 次の文字に進んで子音処理
          this.state.currentIndex++;
          
          if (nextChar) {
            // 次の文字への子音継続処理
            const nextResult = nextChar.type(key);
            if (nextResult && nextChar.completed) {
              this.state.currentIndex++;
              
              // 単語完了チェック
              if (this.state.currentIndex >= this.state.typingChars.length) {
                this.handleWordComplete();
                return;
              }
            }
          }
        } else {
          // 'nn'パターンで完了した場合
          this.state.currentIndex++;
          
          // 単語完了チェック
          if (this.state.currentIndex >= this.state.typingChars.length) {
            this.handleWordComplete();
            return;
          }
        }
        
        this.updateDisplay();
        this.notifyProgress();
        return;
      } else {
        // 分岐状態で無効なキーが入力された場合
        this.state.mistakeCount++;
        OptimizedAudioSystem.playErrorSound();
        this.updateDisplay();
        this.notifyProgress();
        return;
      }
    }

    // 通常のタイピング処理
    const isCorrect = currentChar.type(key);

    if (isCorrect) {
      OptimizedAudioSystem.playClickSound();

      if (currentChar.completed) {
        this.state.currentIndex++;
        
        // 単語完了チェック
        if (this.state.currentIndex >= this.state.typingChars.length) {
          this.handleWordComplete();
          return;
        }
      }
    } else {
      this.state.mistakeCount++;
      OptimizedAudioSystem.playErrorSound();
    }

    this.updateDisplay();
    this.notifyProgress();
  }

  /**
   * 軽量DOM更新
   */
  private updateDisplay(): void {
    if (!this.displayElements) return;

    const currentChar = this.state.typingChars[this.state.currentIndex];
    if (!currentChar) return;

    const displayInfo = currentChar.getDisplayInfo();

    // 直接DOM更新
    this.displayElements.kanaElement.textContent = displayInfo.displayText;
    
    this.displayElements.romajiElement.innerHTML = `
      <span class="accepted">${displayInfo.acceptedText}</span>
      <span class="remaining">${displayInfo.remainingText}</span>
    `;

    const progress = Math.floor((this.state.currentIndex / this.state.typingChars.length) * 100);
    this.displayElements.progressElement.textContent = `${progress}%`;
  }

  /**
   * 軽量進捗通知
   */
  private notifyProgress(): void {
    if (!this.onProgress) return;

    const currentChar = this.state.typingChars[this.state.currentIndex];
    if (!currentChar) return;

    const displayInfo = currentChar.getDisplayInfo();
    const kanaDisplay: KanaDisplay = {
      acceptedText: displayInfo.acceptedText,
      remainingText: displayInfo.remainingText,
      displayText: displayInfo.displayText,
    };

    // 直接コールバック実行
    this.onProgress(this.state.currentIndex, kanaDisplay);
  }

  /**
   * 単語完了処理
   */
  private handleWordComplete(): void {
    const endTime = Date.now();
    const elapsedTime = (endTime - this.state.startTime) / 1000;

    const scoreLog: PerWordScoreLog = {
      keyCount: this.state.keyCount,
      correct: this.state.keyCount - this.state.mistakeCount,
      miss: this.state.mistakeCount,
      startTime: this.state.startTime,
      endTime: endTime,
      duration: elapsedTime,
      kpm: Math.round((this.state.keyCount / elapsedTime) * 60),
      accuracy: (this.state.keyCount - this.state.mistakeCount) / this.state.keyCount,
    };

    this.onComplete?.(scoreLog);
  }

  /**
   * 詳細進捗取得（従来のTypingEngineと互換性のある形式）
   */
  getDetailedProgress() {
    const currentChar = this.state.typingChars[this.state.currentIndex];
    if (!currentChar) return null;

    const displayInfo = currentChar.getDisplayInfo();
    return {
      currentKanaIndex: this.state.currentIndex,
      currentRomajiIndex: currentChar.acceptedInput.length,
      totalKanaCount: this.state.typingChars.length,
      totalRomajiCount: this.state.typingChars.reduce((sum, char) => sum + char.patterns[0].length, 0),
      currentKanaDisplay: {
        acceptedText: displayInfo.acceptedText,
        remainingText: displayInfo.remainingText,
        displayText: displayInfo.displayText,
      },
    };
  }

  /**
   * キーリスナー削除
   */
  private removeKeyListener(): void {
    if (this.keyHandler) {
      document.removeEventListener('keydown', this.keyHandler, { capture: true });
      this.keyHandler = undefined;
    }
  }

  /**
   * リセット
   */
  reset(): void {
    this.state.currentIndex = 0;
    this.state.keyCount = 0;
    this.state.mistakeCount = 0;
    this.state.startTime = 0;

    this.state.typingChars.forEach(char => char.reset());
    this.updateDisplay();
  }

  /**
   * リソース解放
   */
  destroy(): void {
    this.removeKeyListener();
    this.container = null;
    this.displayElements = null;
    this.onProgress = undefined;
    this.onComplete = undefined;
  }
  /**
   * クリーンアップ（互換性のため）
   */
  cleanup(): void {
    this.destroy();
    if (process.env.NODE_ENV === 'development') {
      debug.log('🚀 HyperTypingEngine クリーンアップ完了');
    }
  }
}
