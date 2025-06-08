/**
 * DirectTypingEngine - typingmania-ref スタイル完全実装
 * 
 * typingmania-refのHTMLTypingCharとHTMLTypingLineを参考に
 * 直接DOM操作による超高速レスポンスを実現
 * 既存の日本語ロジック（すべての日本語が打てる機能）は完全保持
 */

import { TypingChar, type DisplayInfo } from './TypingChar';
import type { KanaDisplay, PerWordScoreLog } from '@/types';
import OptimizedAudioSystem from '@/utils/OptimizedAudioSystem';
import { debug } from '../utils/debug';

/**
 * typingmania-ref風 HTMLTypingChar - 直接DOM操作文字クラス
 */
class DirectTypingChar {
  private char: TypingChar;
  private config: DirectTypingConfig;
  public el: HTMLSpanElement;

  constructor(char: TypingChar, config: DirectTypingConfig) {
    this.char = char;
    this.config = config;
    
    // typingmania-ref スタイル：文字ごとの個別span要素
    this.el = document.createElement('span');
    this.el.style.color = char.completed ? this.config.completedColor : this.config.inactiveColor;
    this.el.textContent = char.kana;
    this.el.style.fontFamily = this.config.fontFamily;
    this.el.style.fontSize = this.config.fontSize;
    this.el.style.fontWeight = this.config.fontWeight;
    this.el.style.transition = 'color 0.1s ease'; // スムーズな色変化
  }

  /**
   * 状態変化通知 - typingmania-ref風の即座な色変更
   */
  updateState(): void {
    if (this.char.completed) {
      this.el.style.color = this.config.completedColor;
    } else if (this.char.acceptedInput.length > 0) {
      this.el.style.color = this.config.progressColor;
    } else {
      this.el.style.color = this.config.activeColor;
    }
  }

  /**
   * アクティブ状態設定
   */
  setActive(active: boolean): void {
    if (active && !this.char.completed) {
      this.el.style.color = this.config.activeColor;
    } else if (!active) {
      this.el.style.color = this.config.inactiveColor;
    }
  }
}

/**
 * typingmania-ref風 HTMLTypingLine - 行レベルDOM管理
 */
class DirectTypingLine {
  public el: HTMLDivElement;
  private chars: DirectTypingChar[] = [];
  private config: DirectTypingConfig;

  constructor(typingChars: TypingChar[], config: DirectTypingConfig) {
    this.config = config;
    
    // typingmania-ref スタイル：flex行コンテナ
    this.el = document.createElement('div');
    this.el.style.display = 'flex';
    this.el.style.flexDirection = 'row';
    this.el.style.flexWrap = 'nowrap';
    this.el.style.alignItems = 'baseline';
    this.el.style.justifyContent = 'flex-start';
    this.el.style.gap = '2px';
    this.el.style.color = config.activeColor;
    this.el.style.lineHeight = '1.2';

    // 各文字のDirectTypingChar要素を作成
    for (const typingChar of typingChars) {
      const directChar = new DirectTypingChar(typingChar, config);
      this.chars.push(directChar);
      this.el.appendChild(directChar.el);
    }
  }

  /**
   * 現在文字インデックスによる表示更新
   */
  updateDisplay(currentIndex: number): void {
    this.chars.forEach((directChar, index) => {
      if (index === currentIndex) {
        directChar.setActive(true);
        directChar.updateState();
      } else if (index < currentIndex) {
        directChar.updateState(); // 完了状態を反映
      } else {
        directChar.setActive(false);
      }
    });
  }
}

/**
 * DirectTypingEngine設定
 */
interface DirectTypingConfig {
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  activeColor: string;
  inactiveColor: string;
  progressColor: string;
  completedColor: string;
  backgroundColor: string;
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
}

/**
 * 🚀 DirectTypingEngine - typingmania-ref完全準拠
 * 
 * 直接DOM操作による最高レスポンス性能
 * 既存の日本語ロジック完全保持
 */
export class DirectTypingEngine {
  // 内部状態
  private state: DirectEngineState;
  private container: HTMLElement | null = null;
  private typingLine: DirectTypingLine | null = null;
  private romajiDisplay: HTMLElement | null = null;
  private onProgress?: (index: number, display: KanaDisplay) => void;
  private onComplete?: (scoreLog: PerWordScoreLog) => void;
  private keyHandler?: (e: KeyboardEvent) => void;

  // デフォルト設定 - typingmania-ref風
  private config: DirectTypingConfig = {
    fontFamily: '"ヒラギノ角ゴ Pro", "Hiragino Kaku Gothic Pro", "メイリオ", Meiryo, "MS PGothic", sans-serif',
    fontSize: '2.5rem',
    fontWeight: 'bold',
    activeColor: '#ffffff',      // 現在入力中の文字
    inactiveColor: '#999999',    // まだ入力していない文字
    progressColor: '#ffff00',    // 入力中の文字（黄色）
    completedColor: '#00ffff',   // 完了した文字（シアン）
    backgroundColor: 'transparent'
  };

  constructor(customConfig?: Partial<DirectTypingConfig>) {
    this.state = {
      typingChars: [],
      currentIndex: 0,
      keyCount: 0,
      mistakeCount: 0,
      startTime: 0
    };

    // カスタム設定をマージ
    if (customConfig) {
      this.config = { ...this.config, ...customConfig };
    }

    debug.log('🚀 DirectTypingEngine - typingmania-refスタイル初期化完了');
  }

  /**
   * 初期化 - typingmania-ref風DOM構築
   */
  initialize(
    container: HTMLElement,
    typingChars: TypingChar[],
    onProgress?: (index: number, display: KanaDisplay) => void,
    onComplete?: (scoreLog: PerWordScoreLog) => void
  ): void {
    this.container = container;
    this.onProgress = onProgress;
    this.onComplete = onComplete;
    this.state.typingChars = typingChars;
    this.state.currentIndex = 0;

    this.setupDOM();
    this.setupKeyListener();
    this.updateDisplay();

    debug.log('🚀 DirectTypingEngine 初期化完了:', {
      charCount: typingChars.length,
      containerSize: container.getBoundingClientRect()
    });
  }

  /**
   * DOM構築 - typingmania-ref完全準拠
   */
  private setupDOM(): void {
    if (!this.container) return;

    // メインコンテナのスタイル設定
    this.container.style.backgroundColor = this.config.backgroundColor;
    this.container.style.padding = '20px';
    this.container.style.borderRadius = '8px';
    this.container.style.minHeight = '100px';
    this.container.style.display = 'flex';
    this.container.style.flexDirection = 'column';
    this.container.style.gap = '15px';

    this.container.innerHTML = `
      <div class="direct-typing-kana-container" style="
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 60px;
        background: rgba(0,0,0,0.1);
        border-radius: 4px;
        padding: 10px;
      "></div>
      <div class="direct-typing-romaji-container" style="
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 40px;
        font-family: 'Courier New', monospace;
        font-size: 1.5rem;
        color: #cccccc;
        background: rgba(0,0,0,0.05);
        border-radius: 4px;
        padding: 8px;
      "></div>
    `;

    // typingmania-ref風 DirectTypingLine作成
    const kanaContainer = this.container.querySelector('.direct-typing-kana-container') as HTMLElement;
    this.typingLine = new DirectTypingLine(this.state.typingChars, this.config);
    kanaContainer.appendChild(this.typingLine.el);

    // ローマ字表示エリア
    this.romajiDisplay = this.container.querySelector('.direct-typing-romaji-container') as HTMLElement;
  }

  /**
   * キーリスナー設定 - typingmania-ref風高速処理
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

      // 🚀 typingmania-ref式：直接処理でデッドタイム解消
      this.processKey(e.key);
    };

    document.addEventListener('keydown', this.keyHandler, { capture: true });
    debug.log('🚀 DirectTypingEngine キーリスナー設定完了');
  }

  /**
   * 🚀 typingmania-ref風：超高速キー処理
   * 既存の日本語ロジック完全保持
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

    // 「ん」の分岐状態処理（既存のロジック完全保持）
    if (currentChar.branchingState) {
      const nextChar = this.state.typingChars[this.state.currentIndex + 1];
      const result = currentChar.typeBranching(key, nextChar);

      if (result.success) {
        OptimizedAudioSystem.playClickSound();

        if (result.completeWithSingle) {
          // 'n'パターン選択の場合
          this.state.currentIndex++;

          if (nextChar) {
            // 次の文字への子音継続処理
            const nextResult = nextChar.type(key);
            if (nextResult && nextChar.completed) {
              this.state.currentIndex++;

              if (this.state.currentIndex >= this.state.typingChars.length) {
                this.handleWordComplete();
                return;
              }
            }
          }
        } else {
          // 'nn'パターン完了
          this.state.currentIndex++;

          if (this.state.currentIndex >= this.state.typingChars.length) {
            this.handleWordComplete();
            return;
          }
        }

        // 🚀 即座にDOM更新（typingmania-ref風）
        this.updateDisplay();
        this.notifyProgress();
        return;
      } else {
        // 分岐状態でのミス
        this.state.mistakeCount++;
        OptimizedAudioSystem.playErrorSound();
        this.updateDisplay();
        this.notifyProgress();
        return;
      }
    }

    // 通常のタイピング処理（既存のロジック完全保持）
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
    }

    // 🚀 typingmania-ref風：即座の表示更新
    this.updateDisplay();
    this.notifyProgress();
  }

  /**
   * 🚀 typingmania-ref風：直接DOM更新
   */
  private updateDisplay(): void {
    if (!this.typingLine || !this.romajiDisplay) return;

    // かな文字表示更新（DirectTypingLineが担当）
    this.typingLine.updateDisplay(this.state.currentIndex);

    // ローマ字表示更新
    const currentChar = this.state.typingChars[this.state.currentIndex];
    if (currentChar) {
      const displayInfo = currentChar.getDisplayInfo();
      this.romajiDisplay.innerHTML = `
        <span style="color: #00ffff;">${displayInfo.acceptedText}</span>
        <span style="color: #ffffff;">${displayInfo.remainingText}</span>
      `;
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
    };

    this.onComplete?.(scoreLog);
    debug.log('🚀 DirectTypingEngine 単語完了:', scoreLog);
  }

  /**
   * 詳細進捗取得
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
    
    debug.log('🚀 DirectTypingEngine リセット完了');
  }

  /**
   * リソース解放
   */
  destroy(): void {
    this.removeKeyListener();
    this.container = null;
    this.typingLine = null;
    this.romajiDisplay = null;
    this.onProgress = undefined;
    this.onComplete = undefined;
    
    debug.log('🚀 DirectTypingEngine リソース解放完了');
  }

  /**
   * 設定変更
   */
  updateConfig(newConfig: Partial<DirectTypingConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // DOM要素が存在する場合は即座に適用
    if (this.typingLine) {
      // 再構築が必要な場合
      if (this.container && this.state.typingChars.length > 0) {
        this.setupDOM();
        this.updateDisplay();
      }
    }
    
    debug.log('🚀 DirectTypingEngine 設定更新:', newConfig);
  }

  /**
   * クリーンアップ（互換性のため）
   */
  cleanup(): void {
    this.destroy();
  }
}

/**
 * typingmania-ref風設定プリセット
 */
export const DirectTypingPresets = {
  // typingmania-ref デフォルト
  default: {
    fontFamily: '"ヒラギノ角ゴ Pro", "Hiragino Kaku Gothic Pro", "メイリオ", Meiryo, sans-serif',
    fontSize: '2.5rem',
    fontWeight: 'bold',
    activeColor: '#ffffff',
    inactiveColor: '#999999',
    progressColor: '#ffff00',
    completedColor: '#00ffff',
    backgroundColor: 'transparent'
  } as DirectTypingConfig,

  // 大きな文字サイズ
  large: {
    fontSize: '3.5rem',
    fontWeight: '900'
  } as Partial<DirectTypingConfig>,

  // 高コントラスト
  highContrast: {
    activeColor: '#ffffff',
    inactiveColor: '#666666',
    progressColor: '#ff6600',
    completedColor: '#00ff00',
    backgroundColor: 'rgba(0,0,0,0.8)'
  } as Partial<DirectTypingConfig>,

  // ダークテーマ
  dark: {
    activeColor: '#e0e0e0',
    inactiveColor: '#555555',
    progressColor: '#ffd700',
    completedColor: '#00bfff',
    backgroundColor: 'rgba(20,20,20,0.9)'
  } as Partial<DirectTypingConfig>
};