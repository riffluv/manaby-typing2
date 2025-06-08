/**
 * DirectTypingEngine2 - 高度タイピングエンジン
 * 
 * 表示内容:
 * 1. 上部: 原文（漢字入り）
 * 2. 中部: ひらがな文字列（個別フォーカス機能付き）- 設定で切り替え可能
 * 3. 下部: ローマ字文字列（個別フォーカス機能付き）
 * 
 * 機能:
 * - 文字単位でのビジュアルフォーカス
 * - 完了状態の視覚的フィードバック
 * - 「ん」の分岐入力対応
 * - リアルタイム進捗表示
 */

import { TypingChar, type DisplayInfo } from './TypingChar';
import type { KanaDisplay, PerWordScoreLog, TypingWord } from '@/types';
import OptimizedAudioSystem from '@/utils/OptimizedAudioSystem';
import { debug } from '../utils/debug';

/**
 * ひらがな文字クラス - 個別span要素
 */
class KanaChar {
  public el: HTMLSpanElement;
  private isCompleted: boolean = false;
  private isActive: boolean = false;
  constructor(char: string) {
    this.el = document.createElement('span');
    this.el.textContent = char;
    this.el.style.fontFamily = '"ヒラギノ角ゴ Pro", "Hiragino Kaku Gothic Pro", "メイリオ", Meiryo, sans-serif';
    this.el.style.fontSize = '1.3rem';
    this.el.style.fontWeight = 'bold';
    this.el.style.transition = 'all 0.15s ease';
    this.el.style.padding = '2px 4px';
    this.el.style.borderRadius = '3px';
    this.el.style.marginRight = '1px';
    this.el.style.letterSpacing = '0.04rem';
    this.setInactive();
  }

  setActive(): void {
    this.isActive = true;
    this.el.style.color = '#fff';
    this.el.style.background = 'rgba(255, 245, 170, 0.2)';
    this.el.style.textShadow = '0 0 8px rgba(255, 245, 170, 0.8), 0 0 1px #fff';
    this.el.style.transform = 'scale(1.1)';
  }

  setCompleted(): void {
    this.isCompleted = true;
    this.isActive = false;
    this.el.style.color = '#87ceeb';
    this.el.style.background = 'rgba(135, 206, 235, 0.1)';
    this.el.style.textShadow = '0 0 6px rgba(135, 206, 235, 0.6)';
    this.el.style.transform = 'scale(1)';
  }

  setInactive(): void {
    this.isActive = false;
    this.el.style.color = '#999';
    this.el.style.background = 'transparent';
    this.el.style.textShadow = '0 0 1px rgba(0,0,0,0.5)';
    this.el.style.transform = 'scale(1)';
  }
}

/**
 * ローマ字文字クラス - 個別span要素
 */
class RomajiChar {
  public el: HTMLSpanElement;
  private isCompleted: boolean = false;
  private isActive: boolean = false;
  constructor(char: string) {
    this.el = document.createElement('span');
    this.el.textContent = char;
    this.el.style.fontFamily = "'Courier New', 'Consolas', monospace";
    this.el.style.fontSize = '1.2rem';
    this.el.style.fontWeight = 'bold';
    this.el.style.transition = 'all 0.15s ease';
    this.el.style.padding = '2px 4px';
    this.el.style.borderRadius = '3px';
    this.el.style.marginRight = '1px';
    this.el.style.letterSpacing = '0.04rem';
    this.setInactive();
  }

  setActive(): void {
    this.isActive = true;
    this.el.style.color = '#fff';
    this.el.style.background = 'rgba(255, 245, 170, 0.2)';
    this.el.style.textShadow = '0 0 8px rgba(255, 245, 170, 0.8), 0 0 1px #fff';
    this.el.style.transform = 'scale(1.1)';
  }

  setCompleted(): void {
    this.isCompleted = true;
    this.isActive = false;
    this.el.style.color = '#87ceeb';
    this.el.style.background = 'rgba(135, 206, 235, 0.1)';
    this.el.style.textShadow = '0 0 6px rgba(135, 206, 235, 0.6)';
    this.el.style.transform = 'scale(1)';
  }

  setInactive(): void {
    this.isActive = false;
    this.el.style.color = '#999';
    this.el.style.background = 'transparent';
    this.el.style.textShadow = '0 0 1px rgba(0,0,0,0.5)';
    this.el.style.transform = 'scale(1)';
  }
}

/**
 * DirectTypingEngine設定
 */
interface DirectTypingConfig {
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  backgroundColor: string;
  showKanaDisplay: boolean;
}

/**
 * エンジン状態管理
 */
interface DirectEngineState {
  typingChars: TypingChar[];
  currentIndex: number;
  keyCount: number;
  mistakeCount: number;
  startTime: number;
  totalRomajiLength: number;
}

/**
 * 🚀 DirectTypingEngine2 - 高度タイピングエンジン
 * 
 * 特徴:
 * - 原文、ひらがな、ローマ字の3段階表示
 * - 個別文字フォーカス機能
 * - 設定による表示切り替え
 * - 高精度の進捗管理
 */
export class DirectTypingEngine2 {
  private state: DirectEngineState;
  private container: HTMLElement | null = null;
  private originalTextDisplay: HTMLElement | null = null;
  private kanaDisplay: HTMLElement | null = null;
  private kanaChars: KanaChar[] = [];
  private romajiChars: RomajiChar[] = [];
  private romajiContainer: HTMLElement | null = null;
  private onProgress?: (index: number, display: KanaDisplay) => void;
  private onComplete?: (scoreLog: PerWordScoreLog) => void;
  private keyHandler?: (e: KeyboardEvent) => void;
  private originalText: string = '';

  private config: DirectTypingConfig = {
    fontFamily: '"ヒラギノ角ゴ Pro", "Hiragino Kaku Gothic Pro", "メイリオ", Meiryo, sans-serif',
    fontSize: '2.5rem',
    fontWeight: 'bold',
    backgroundColor: 'transparent',
    showKanaDisplay: false
  };
  constructor(customConfig?: Partial<DirectTypingConfig>) {
    this.state = {
      typingChars: [],
      currentIndex: 0,
      keyCount: 0,
      mistakeCount: 0,
      startTime: 0,
      totalRomajiLength: 0
    };

    if (customConfig) {
      this.config = { ...this.config, ...customConfig };
    }

    debug.log('🚀 DirectTypingEngine2 初期化完了');
  }
  /**
   * 初期化
   */
  initialize(
    container: HTMLElement,
    typingChars: TypingChar[],
    originalText: string,
    onProgress?: (index: number, display: KanaDisplay) => void,
    onComplete?: (scoreLog: PerWordScoreLog) => void
  ): void {
    this.container = container;
    this.onProgress = onProgress;
    this.onComplete = onComplete;
    this.state.typingChars = typingChars;
    this.originalText = originalText;
    this.state.currentIndex = 0;

    // 全ローマ字長を計算
    this.state.totalRomajiLength = typingChars.reduce((sum, char) => sum + char.patterns[0].length, 0);

    this.setupDOM();
    this.setupKeyListener();
    this.updateDisplay();

    debug.log('🚀 DirectTypingEngine2 初期化完了:', {
      charCount: typingChars.length,
      totalRomajiLength: this.state.totalRomajiLength,
      originalText: this.originalText
    });
  }
  /**
   * DOM構築
   */
  private setupDOM(): void {
    if (!this.container) return;

    this.container.style.backgroundColor = this.config.backgroundColor;
    this.container.style.padding = '20px';
    this.container.style.borderRadius = '8px';
    this.container.style.minHeight = '120px';
    this.container.style.display = 'flex';
    this.container.style.flexDirection = 'column';
    this.container.style.gap = '20px';    // かな表示の条件付きスタイル
    const kanaDisplayHTML = this.config.showKanaDisplay ? `
      <div class="direct-typing-kana-container" style="
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 60px;
        background: rgba(0,0,0,0.08);
        border-radius: 8px;
        padding: 15px;
        font-family: ${this.config.fontFamily};
        font-size: 1.3rem;
        font-weight: bold;
        color: #d6cbb2;
        text-shadow: 0 0 2px rgba(0,0,0,0.8);
        letter-spacing: 0.04rem;
      "></div>
    ` : '';    this.container.innerHTML = `
      <div class="direct-typing-original-text" style="
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 60px;
        background: rgba(0,0,0,0.08);
        border-radius: 8px;
        padding: 15px;
        font-family: ${this.config.fontFamily};
        font-size: 1.4rem;
        font-weight: bold;
        background: linear-gradient(to right, #c9a76f, #f8e6b0);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-shadow: 0 0 6px rgba(255, 223, 128, 0.2);
        letter-spacing: 0.04rem;
      "></div>
      ${kanaDisplayHTML}
      <div class="direct-typing-romaji-container" style="
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 50px;
        background: rgba(0,0,0,0.05);
        border-radius: 8px;
        padding: 15px;
        flex-wrap: wrap;
        gap: 2px;
      "></div>
    `;// 原文表示
    this.originalTextDisplay = this.container.querySelector('.direct-typing-original-text') as HTMLElement;
    this.originalTextDisplay.textContent = this.originalText;

    // かな表示（設定で有効な場合のみ）
    if (this.config.showKanaDisplay) {
      this.kanaDisplay = this.container.querySelector('.direct-typing-kana-container') as HTMLElement;
      this.createKanaChars();
    }

    // ローマ字表示エリア
    this.romajiContainer = this.container.querySelector('.direct-typing-romaji-container') as HTMLElement;
    this.createRomajiChars();
  }  /**
   * ひらがな文字要素作成
   */
  private createKanaChars(): void {
    if (!this.kanaDisplay) return;

    this.kanaChars = [];
    this.kanaDisplay.innerHTML = '';

    // 全ひらがな文字列を構築
    const fullKana = this.state.typingChars.map(char => char.kana).join('');
    
    for (let i = 0; i < fullKana.length; i++) {
      const kanaChar = new KanaChar(fullKana[i]);
      this.kanaChars.push(kanaChar);
      this.kanaDisplay.appendChild(kanaChar.el);
    }
  }

  /**
   * ローマ字文字要素作成
   */
  private createRomajiChars(): void {
    if (!this.romajiContainer) return;

    this.romajiChars = [];
    this.romajiContainer.innerHTML = '';

    // 全ローマ字文字列を構築
    const fullRomaji = this.state.typingChars.map(char => char.patterns[0]).join('');
    
    for (let i = 0; i < fullRomaji.length; i++) {
      const romajiChar = new RomajiChar(fullRomaji[i]);
      this.romajiChars.push(romajiChar);
      this.romajiContainer.appendChild(romajiChar.el);
    }
  }

  /**
   * キーリスナー設定
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

      this.processKey(e.key);
    };

    document.addEventListener('keydown', this.keyHandler, { capture: true });
    debug.log('🚀 DirectTypingEngine2 キーリスナー設定完了');
  }

  /**
   * キー処理
   */
  private processKey(key: string): void {
    if (this.state.keyCount === 0) {
      OptimizedAudioSystem.resumeAudioContext();
    }

    if (this.state.startTime === 0) {
      this.state.startTime = Date.now();
    }

    this.state.keyCount++;    const currentChar = this.state.typingChars[this.state.currentIndex];
    if (!currentChar) return;

    // 「ん」の分岐状態処理
    if (currentChar.branchingState) {
      const nextChar = this.state.typingChars[this.state.currentIndex + 1];
      const result = currentChar.typeBranching(key, nextChar);

      if (result.success) {
        OptimizedAudioSystem.playClickSound();

        if (result.completeWithSingle) {
          // 'n'パターン: 「ん」完了後、次文字に継続
          this.state.currentIndex++;

          if (nextChar) {
            const nextResult = nextChar.type(key);
            if (nextResult && nextChar.completed) {
              this.state.currentIndex++;
            }
          }
        } else {
          // 'nn'パターン完了
          this.state.currentIndex++;
        }

        if (this.state.currentIndex >= this.state.typingChars.length) {
          this.handleWordComplete();
          return;
        }        this.updateDisplay();
        this.notifyProgress();
        return;
      } else {
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

        if (this.state.currentIndex >= this.state.typingChars.length) {
          this.handleWordComplete();
          return;
        }
      }
    } else {
      this.state.mistakeCount++;
      OptimizedAudioSystem.playErrorSound();
    }    this.updateDisplay();
    this.notifyProgress();
  }

  /**
   * 表示更新
   */
  private updateDisplay(): void {
    // 正しいromaji位置を動的に計算
    const progress = this.getDetailedProgress();
    if (!progress) return;
    
    const currentRomajiIndex = progress.currentRomajiIndex;
    
    // ローマ字フォーカス更新
    this.romajiChars.forEach((romajiChar, index) => {
      if (index < currentRomajiIndex) {
        romajiChar.setCompleted();
      } else if (index === currentRomajiIndex) {
        romajiChar.setActive();
      } else {
        romajiChar.setInactive();
      }
    });

    // かな文字フォーカス更新（設定で有効な場合のみ）
    if (this.config.showKanaDisplay && this.kanaChars.length > 0) {
      this.updateKanaCharFocus();
    }
  }
  private updateKanaCharFocus(): void {
    // 完了したひらがな文字数を計算
    const completedKanaCount = this.calculateCompletedKanaCount();
    
    // 現在アクティブなひらがな文字のインデックスを計算
    const currentActiveKanaIndex = this.calculateCurrentActiveKanaIndex(completedKanaCount);
    
    // 各ひらがな文字の状態を更新
    this.updateKanaCharStates(completedKanaCount, currentActiveKanaIndex);
  }

  /**
   * 完了したひらがな文字数を計算
   */
  private calculateCompletedKanaCount(): number {
    let count = 0;
    for (let i = 0; i < this.state.currentIndex && i < this.state.typingChars.length; i++) {
      count += this.state.typingChars[i].kana.length;
    }
    return count;
  }

  /**
   * 現在アクティブなひらがな文字のインデックスを計算
   */
  private calculateCurrentActiveKanaIndex(completedKanaCount: number): number {
    const currentChar = this.state.typingChars[this.state.currentIndex];
    
    // 入力がない場合はアクティブなし
    if (!currentChar || currentChar.acceptedInput.length === 0) {
      return -1;
    }

    const totalPatternLength = currentChar.patterns[0].length;
    const progressRatio = currentChar.acceptedInput.length / totalPatternLength;
    const kanaLength = currentChar.kana.length;

    if (kanaLength > 1) {
      // 複数文字（例：「きゃ」）の場合は進捗に応じて段階的にアクティブ
      const activeKanaSubIndex = Math.floor(progressRatio * kanaLength);
      return completedKanaCount + Math.min(activeKanaSubIndex, kanaLength - 1);
    } else {
      // 単一文字の場合は10%進捗でアクティブ
      return progressRatio > 0.1 ? completedKanaCount : -1;
    }
  }

  /**
   * ひらがな文字の状態を更新
   */
  private updateKanaCharStates(completedKanaCount: number, currentActiveKanaIndex: number): void {
    this.kanaChars.forEach((kanaChar, index) => {
      if (index < completedKanaCount) {
        kanaChar.setCompleted();
      } else if (index === currentActiveKanaIndex) {
        kanaChar.setActive();
      } else {
        kanaChar.setInactive();
      }
    });
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
      displayText: displayInfo.displayText,
    };

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
    };    this.onComplete?.(scoreLog);
    debug.log('🚀 DirectTypingEngine2 単語完了:', scoreLog);
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
      // かな文字もリセット
    this.kanaChars.forEach(kanaChar => kanaChar.setInactive());
    
    this.updateDisplay();
    
    debug.log('🚀 DirectTypingEngine2 リセット完了');
  }

  /**
   * リソース解放
   */
  destroy(): void {
    if (this.keyHandler) {
      document.removeEventListener('keydown', this.keyHandler, { capture: true });
      this.keyHandler = undefined;
    }
    this.container = null;
    this.originalTextDisplay = null;
    this.kanaDisplay = null;
    this.romajiContainer = null;
    this.romajiChars = [];
    this.kanaChars = [];
    this.onProgress = undefined;
    this.onComplete = undefined;
      debug.log('🚀 DirectTypingEngine2 リソース解放完了');
  }

  /**
   * 詳細進捗取得（HyperTypingEngine互換の正しい方式）
   */
  getDetailedProgress() {
    const currentChar = this.state.typingChars[this.state.currentIndex];
    if (!currentChar) return null;

    const displayInfo = currentChar.getDisplayInfo();
    
    // HyperTypingEngine方式：全体のromaji位置を動的計算
    let totalRomajiIndex = 0;
    for (let i = 0; i < this.state.currentIndex && i < this.state.typingChars.length; i++) {
      const charPattern = this.state.typingChars[i].patterns[0] || '';
      totalRomajiIndex += charPattern.length;
    }
    // 現在の文字での進行分を追加
    totalRomajiIndex += currentChar.acceptedInput.length;
    
    return {
      currentKanaIndex: this.state.currentIndex,
      currentRomajiIndex: totalRomajiIndex, // 正しい全体位置
      totalKanaCount: this.state.typingChars.length,
      totalRomajiCount: this.state.totalRomajiLength,
      currentKanaDisplay: {
        acceptedText: displayInfo.acceptedText,
        remainingText: displayInfo.remainingText,
        displayText: displayInfo.displayText,
      },
    };
  }

  cleanup(): void {
    this.destroy();
  }
}
