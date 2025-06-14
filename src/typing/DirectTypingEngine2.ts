/**
 * DirectTypingEngine2 - 🚀 ZERO-LATENCY 高速レスポンス最適化版タイピングエンジン
 * 
 * 表示内容:
 * 1. 上部: 原文（漢字入り）
 * 2. 中部: ひらがな文字列（静的表示）- 設定で切り替え可能
 * 3. 下部: ローマ字文字列（個別フォーカス機能付き）
 * 
 * 機能:
 * - ローマ字文字単位でのビジュアルフォーカス
 * - 完了状態の視覚的フィードバック
 * - 「ん」の分岐入力対応
 * - リアルタイム進捗表示
 * 
 * 🚀 ZERO-LATENCY 最適化 (2025/6/9):
 * - requestAnimationFrame完全排除 → 即座実行（16.67ms遅延削除）
 * - ひらがなハイライト機能を削除（パフォーマンス向上）
 * - CSS遷移を削除（0.15s ease → 即座のフィードバック）
 * - スケール変換を削除（GPU負荷軽減） * - OptimizedAudioSystem採用（高速音響システム）
 * - 40年タイピング経験者の感覚に対応した遅延ゼロ実装
 */

import { TypingChar } from './TypingChar';
import type { KanaDisplay, PerWordScoreLog } from '@/types';
import OptimizedAudioSystem from '@/utils/OptimizedAudioSystem';



/**
 * ローマ字文字クラス - 個別span要素
 */
class RomajiChar {
  public el: HTMLSpanElement;
  private isCompleted: boolean = false;
  private isActive: boolean = false;
  private lastState: 'inactive' | 'active' | 'completed' = 'inactive'; // 状態キャッシュ
  constructor(char: string) {
    this.el = document.createElement('span');
    this.el.textContent = char;    this.el.style.fontFamily = "'Courier New', 'Consolas', monospace";
    this.el.style.fontSize = '1.2rem';
    this.el.style.fontWeight = 'bold';
    // 高速レスポンス: 遷移を削除して即座のフィードバックを実現
    // this.el.style.transition = 'all 0.15s ease';
    this.el.style.padding = '1px 1px'; // パディングを最小限に
    this.el.style.borderRadius = '3px';
    this.el.style.marginRight = '0px'; // 文字間隔を詰める
    this.el.style.letterSpacing = '0.02rem'; // レターリングを詰める
    // GPU最適化（背景色を削除）
    this.el.style.willChange = 'color';
    this.setInactive();
  }  setActive(): void {
    if (this.lastState === 'active') return; // 重複更新防止
    this.lastState = 'active';
    this.isActive = true;
    this.isCompleted = false;
    
    // 🚀 ZERO-LATENCY: requestAnimationFrameを排除して即座実行
    this.el.style.color = '#ffeb3b'; // 世界観に合う黄色系
    this.el.style.background = 'transparent'; // バックグラウンドは透明
    this.el.style.textShadow = '0 0 8px rgba(255, 235, 59, 0.8), 0 0 1px #fff';
    // 高速レスポンス: スケール変換を削除
    // this.el.style.transform = 'scale(1.1)';
  }  setCompleted(): void {
    if (this.lastState === 'completed') return; // 重複更新防止
    this.lastState = 'completed';
    this.isCompleted = true;
    this.isActive = false;
    
    // 🚀 ZERO-LATENCY: requestAnimationFrameを排除して即座実行
    this.el.style.color = '#87ceeb';
    this.el.style.background = 'transparent'; // バックグラウンドカラーを削除（RomajiChar）
    this.el.style.textShadow = '0 0 6px rgba(135, 206, 235, 0.6)';
    // 高速レスポンス: スケール変換を削除
    // this.el.style.transform = 'scale(1)';
  }
  setInactive(): void {
    if (this.lastState === 'inactive') return; // 重複更新防止
    this.lastState = 'inactive';
    this.isActive = false;
    this.isCompleted = false;
    
    // 🚀 ZERO-LATENCY: requestAnimationFrameを排除して即座実行
    this.el.style.color = '#999';
    this.el.style.background = 'transparent';
    this.el.style.textShadow = '0 0 1px rgba(0,0,0,0.5)';
    // 高速レスポンス: スケール変換を削除
    // this.el.style.transform = 'scale(1)';
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
 * - 原文、ひらがな（静的）、ローマ字の3段階表示
 * - ローマ字の個別文字フォーカス機能
 * - 設定による表示切り替え
 * - 高精度の進捗管理
 */
export class DirectTypingEngine2 {  private state: DirectEngineState;
  private container: HTMLElement | null = null;
  private originalTextDisplay: HTMLElement | null = null;
  private kanaDisplay: HTMLElement | null = null;
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
    };    if (customConfig) {
      this.config = { ...this.config, ...customConfig };
    }

    // 🚀 DirectTypingEngine2 初期化完了
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
    this.state.totalRomajiLength = typingChars.reduce((sum, char) => sum + char.patterns[0].length, 0);    this.setupDOM();
    this.setupKeyListener();
    this.updateDisplay();

    // 🚀 DirectTypingEngine2 初期化完了
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
        font-size: 1.5rem;
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
        font-size: 1.6rem;
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
    this.originalTextDisplay.textContent = this.originalText;    // かな表示（設定で有効な場合のみ）
    if (this.config.showKanaDisplay) {
      this.kanaDisplay = this.container.querySelector('.direct-typing-kana-container') as HTMLElement;
      this.setStaticKanaDisplay();
    }

    // ローマ字表示エリア
    this.romajiContainer = this.container.querySelector('.direct-typing-romaji-container') as HTMLElement;
    this.createRomajiChars();
  }  /**
   * ひらがな静的表示設定
   */
  private setStaticKanaDisplay(): void {
    if (!this.kanaDisplay) return;

    // 全ひらがな文字列を構築
    const fullKana = this.state.typingChars.map(char => char.kana).join('');
    this.kanaDisplay.textContent = fullKana;
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
    };    document.addEventListener('keydown', this.keyHandler, { capture: true });
    // 🚀 DirectTypingEngine2 キーリスナー設定完了
  }/**
   * キー処理
   */
  private processKey(key: string): void {
    if (this.state.keyCount === 0) {
      OptimizedAudioSystem.resumeAudioContext();
    }

    if (this.state.startTime === 0) {
      this.state.startTime = Date.now();
    }

    this.state.keyCount++;const currentChar = this.state.typingChars[this.state.currentIndex];
    if (!currentChar) return;

    // 「ん」の分岐状態処理
    if (currentChar.branchingState) {
      const nextChar = this.state.typingChars[this.state.currentIndex + 1];
      const result = currentChar.typeBranching(key, nextChar);      if (result.success) {
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
        }        if (this.state.currentIndex >= this.state.typingChars.length) {
          this.handleWordComplete();
          return;
        }

        // 🚀 ZERO-LATENCY: DOM更新を即座実行
        this.updateDisplay();
        this.notifyProgress();
        return;
      } else {
        this.state.mistakeCount++;
        OptimizedAudioSystem.playErrorSound();
        
        // 🚀 ZERO-LATENCY: DOM更新を即座実行
        this.updateDisplay();
        this.notifyProgress();
        return;
      }
    }    // 通常のタイピング処理
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

    // 🚀 ZERO-LATENCY: DOM更新を即座実行
    this.updateDisplay();
    this.notifyProgress();
  }/**
   * 表示更新
   */
  private updateDisplay(): void {
    // 🚀 ZERO-LATENCY: requestAnimationFrameを排除して即座実行
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
      accuracy: (this.state.keyCount - this.state.mistakeCount) / this.state.keyCount,    };

    this.onComplete?.(scoreLog);
    // 🚀 DirectTypingEngine2 単語完了
  }
  /**
   * リセット
   */
  reset(): void {
    this.state.currentIndex = 0;
    this.state.keyCount = 0;
    this.state.mistakeCount = 0;
    this.state.startTime = 0;    this.state.typingChars.forEach(char => char.reset());
    
    this.updateDisplay();
    
    // 🚀 DirectTypingEngine2 リセット完了
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
    this.romajiContainer = null;    this.romajiChars = [];
    this.onProgress = undefined;
    this.onComplete = undefined;
    
    // 🚀 DirectTypingEngine2 リソース解放完了
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
