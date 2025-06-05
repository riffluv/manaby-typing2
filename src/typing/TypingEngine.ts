/**
 * TypingEngine - typingmania-ref流の超高速タイピングエンジン
 * 
 * typingmania-refのtyping.jsを参考にしつつ、
 * React仮想DOMをバイパスした直接DOM操作で最高パフォーマンスを実現
 */

import type { TypingChar, DisplayInfo } from './TypingChar';
import type { KanaDisplay, PerWordScoreLog } from '@/types';
import OptimizedAudioSystem from '@/utils/OptimizedAudioSystem';
import { debug } from '../utils/debug';

export interface TypingEngineState {
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
 * typingmania-ref流の超高速タイピングエンジン
 * 直接DOM操作で最高パフォーマンスを実現
 */
export class TypingEngine {
  private state: TypingEngineState;
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
   * typingmania-ref流：初期化
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
    this.onComplete = onComplete;

    this.setupDOM();
    this.updateDisplay();
    this.setupKeyListener();
  }

  /**
   * typingmania-ref流：DOM構造セットアップ
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
   * typingmania-ref流：キーリスナーセットアップ
   */
  private setupKeyListener(): void {
    // ページにフォーカスを設定
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
      this.processKey(e.key);
    };

    document.addEventListener('keydown', this.keyHandler, { capture: true });
  }  /**
   * typingmania-ref流：キー処理
   */
  private processKey(key: string): void {
    // 初回キー入力時に音声システムを初期化（ユーザージェスチャー対応）
    if (this.state.keyCount === 0) {
      OptimizedAudioSystem.resumeAudioContext();
    }
    
    if (this.state.startTime === 0) {
      this.state.startTime = Date.now();
    }

    this.state.keyCount++;    const currentChar = this.state.typingChars[this.state.currentIndex];
    if (!currentChar) return;

    debug.typing.log(`キー入力: "${key}" - 現在の文字: kana="${currentChar.kana}", acceptedInput="${currentChar.acceptedInput}", branchingState=${currentChar.branchingState}`);
    
    // 分岐状態の場合の特別処理
    if (currentChar.branchingState) {
      const nextChar = this.state.typingChars[this.state.currentIndex + 1];
      const result = currentChar.typeBranching(key, nextChar);
      
      if (result.success) {
        OptimizedAudioSystem.playClickSound();
        
        // 分岐で'n'パターンが選択された場合（子音が入力された場合）
        if (result.completeWithSingle) {
          debug.typing.branch(`分岐状態で'n'パターン選択。次の文字に進んで子音を処理します`);
          this.state.currentIndex++;
          
          // 次の文字で子音を処理
          if (this.state.currentIndex < this.state.typingChars.length) {
            const nextChar = this.state.typingChars[this.state.currentIndex];
            const nextResult = nextChar.type(key);
            debug.typing.pattern(`次の文字での処理結果: ${nextResult}`);
            
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
          debug.typing.branch(`分岐状態で'nn'パターン完了`);
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
  }  /**
   * typingmania-ref流：表示更新（直接DOM操作）
   */
  private updateDisplay(): void {
    if (!this.displayElements) return;

    const currentChar = this.state.typingChars[this.state.currentIndex];
    if (!currentChar) return;

    const displayInfo = currentChar.getDisplayInfo();

    // かな表示更新
    this.displayElements.kanaElement.textContent = displayInfo.displayText;

    // ローマ字表示更新
    this.updateRomajiDisplay(displayInfo);

    // プログレス更新
    const progress = Math.floor((this.state.currentIndex / this.state.typingChars.length) * 100);
    this.displayElements.progressElement.textContent = `${progress}%`;
  }

  /**
   * typingmania-ref流：ローマ字表示の高速更新
   */
  private updateRomajiDisplay(displayInfo: DisplayInfo): void {
    if (!this.displayElements) return;

    const { acceptedText, remainingText } = displayInfo;
    
    this.displayElements.romajiElement.innerHTML = `
      <span class="accepted">${acceptedText}</span>
      <span class="remaining">${remainingText}</span>
    `;
  }

  /**
   * typingmania-ref流：進捗通知
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

    this.onProgress(this.state.currentIndex, kanaDisplay);
  }

  /**
   * typingmania-ref流：単語完了処理
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
   * typingmania-ref流：詳細進捗取得
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
   * typingmania-ref流：リセット
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
   * typingmania-ref流：クリーンアップ
   */
  cleanup(): void {
    if (this.keyHandler) {
      document.removeEventListener('keydown', this.keyHandler, { capture: true } as any);
      this.keyHandler = undefined;
    }
    
    this.container = null;
    this.displayElements = null;
    this.onProgress = undefined;
    this.onComplete = undefined;
  }
}
