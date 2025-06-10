/**
 * HybridTypingEngine - ローマ字のみCanvas高速化エンジン
 * 
 * 特徴:
 * - 原文・ひらがな: DOM（既存の美しいスタイル維持）
 * - ローマ字: Canvas（1-3ms超高速レスポンス）
 * - 既存DirectTypingEngine2との完全互換性
 * - フォーカス機能完全再現
 */

import { TypingChar, type DisplayInfo } from './TypingChar';
import type { KanaDisplay, PerWordScoreLog, TypingWord } from '@/types';
import UltraFastAudioSystem from '@/utils/UltraFastAudioSystem';

/**
 * ハイブリッドエンジン設定 - 表示制御のみ
 */
interface HybridEngineConfig {
  showKanaDisplay?: boolean;
}

/**
 * Canvas用フォント設定 - 内部管理（ベストプラクティス）
 */
const CANVAS_FONT_CONFIG = {
  fontFamily: '"Courier New", "Consolas", "Liberation Mono", monospace',
  fontSize: '1.6rem',
  fontWeight: 'normal',
  activeColor: '#ffeb3b',
  completedColor: '#87ceeb',
  inactiveColor: '#999'
} as const;

/**
 * Canvas用ローマ字文字クラス - 個別フォーカス対応
 */
class CanvasRomajiChar {
  private state: 'inactive' | 'active' | 'completed' = 'inactive';
  private lastState: 'inactive' | 'active' | 'completed' = 'inactive';

  constructor(
    public character: string,
    public x: number,
    public y: number
  ) {}

  setState(newState: 'inactive' | 'active' | 'completed'): boolean {
    if (this.lastState === newState) return false; // 重複更新防止
    this.lastState = newState;
    this.state = newState;
    return true; // 更新された
  }
  getColor(): string {
    switch (this.state) {
      case 'active': return CANVAS_FONT_CONFIG.activeColor;
      case 'completed': return CANVAS_FONT_CONFIG.completedColor;
      default: return CANVAS_FONT_CONFIG.inactiveColor;
    }
  }

  getShadow(): string {
    switch (this.state) {
      case 'active': return '0 0 8px rgba(255, 235, 59, 0.8)';
      case 'completed': return '0 0 6px rgba(135, 206, 235, 0.6)';
      default: return '0 0 1px rgba(0,0,0,0.5)';
    }
  }
}

/**
 * エンジン状態管理
 */
interface HybridEngineState {
  typingChars: TypingChar[];
  currentIndex: number;
  keyCount: number;
  mistakeCount: number;
  startTime: number;
  totalRomajiLength: number;
}

/**
 * 🚀 HybridTypingEngine - ローマ字のみCanvas超高速化
 */
export class HybridTypingEngine {
  private state: HybridEngineState;
  private container: HTMLElement | null = null;
  private originalTextDisplay: HTMLElement | null = null;
  private kanaDisplay: HTMLElement | null = null;
  
  // Canvas関連 - ローマ字専用
  private romajiCanvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private canvasChars: CanvasRomajiChar[] = [];
  
  private onProgress?: (index: number, display: KanaDisplay) => void;
  private onComplete?: (scoreLog: PerWordScoreLog) => void;
  private keyHandler?: (e: KeyboardEvent) => void;
  private originalText: string = '';
  private config: HybridEngineConfig;

  constructor(customConfig: HybridEngineConfig = {}) {
    this.state = {
      typingChars: [],
      currentIndex: 0,
      keyCount: 0,
      mistakeCount: 0,
      startTime: 0,
      totalRomajiLength: 0
    };

    this.config = {
      showKanaDisplay: false,
      ...customConfig
    };
  }

  /**
   * 初期化 - DirectTypingEngine2と同じインターフェース
   */  initialize(
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
    // 🚀 修正: startTimeは最初のキー入力時に設定（DirectTypingEngine2と同様）
    this.state.startTime = 0;

    // 全ローマ字長を計算
    this.state.totalRomajiLength = typingChars.reduce((sum, char) => sum + char.patterns[0].length, 0);    this.setupHybridDOM();
    this.setupCanvasRomaji();
    this.setupKeyListener();
    this.renderCanvas();
  }

  /**
   * ハイブリッドDOM構築 - 原文・ひらがなはDOM、ローマ字のみCanvas
   */  private setupHybridDOM(): void {
    if (!this.container) return;

    // 基本スタイル設定
    this.container.style.padding = '20px';
    this.container.style.borderRadius = '8px';
    this.container.style.minHeight = '120px';
    this.container.style.display = 'flex';
    this.container.style.flexDirection = 'column';
    this.container.style.gap = '20px';

    // かな表示の条件付きHTML
    const kanaDisplayHTML = this.config.showKanaDisplay ? `
      <div class="hybrid-kana-container" style="
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 60px;
        background: rgba(0,0,0,0.08);
        border-radius: 8px;
        padding: 15px;
        font-size: 1.5rem;
        font-weight: bold;
        color: #d6cbb2;
        text-shadow: 0 0 2px rgba(0,0,0,0.8);
        letter-spacing: 0.04rem;
      "></div>
    ` : '';

    // DOM構築 - フォントはCSS側で管理
    this.container.innerHTML = `
      <div class="hybrid-original-text" style="
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 60px;
        background: rgba(0,0,0,0.08);
        border-radius: 8px;
        padding: 15px;
        font-size: 1.6rem;
        font-weight: bold;
        background: linear-gradient(to right, #c9a76f, #f8e6b0);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-shadow: 0 0 6px rgba(255, 223, 128, 0.2);
        letter-spacing: 0.04rem;
      "></div>
      ${kanaDisplayHTML}
      <div class="hybrid-canvas-container" style="
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 50px;
        background: rgba(0,0,0,0.05);
        border-radius: 8px;
        padding: 15px;
      ">
        <canvas class="romaji-canvas hybrid-romaji-canvas" style="
          background: transparent;
          border-radius: 4px;
        "></canvas>
      </div>
    `;

    // DOM要素参照取得
    this.originalTextDisplay = this.container.querySelector('.hybrid-original-text') as HTMLElement;
    this.originalTextDisplay.textContent = this.originalText;

    if (this.config.showKanaDisplay) {
      this.kanaDisplay = this.container.querySelector('.hybrid-kana-container') as HTMLElement;
      this.setStaticKanaDisplay();
    }

    this.romajiCanvas = this.container.querySelector('.romaji-canvas') as HTMLCanvasElement;
  }

  /**
   * 静的ひらがな表示設定
   */
  private setStaticKanaDisplay(): void {
    if (!this.kanaDisplay) return;
    
    // TypingCharからひらがなを結合
    const kanaText = this.state.typingChars.map(char => char.kana).join('');
    this.kanaDisplay.textContent = kanaText;
  }  /**
   * Canvas ローマ字設定
   */
  private setupCanvasRomaji(): void {
    if (!this.romajiCanvas) return;

    this.ctx = this.romajiCanvas.getContext('2d');
    if (!this.ctx) return;

    // Canvas サイズ設定 - コンテナに合わせて動的調整
    const containerWidth = this.container?.offsetWidth || 800;
    this.romajiCanvas.width = containerWidth - 60; // パディング考慮
    this.romajiCanvas.height = 50; // 少し高さを抑えて日本語テキストとのバランス改善

    // 高DPI対応とアンチエイリアス最適化
    const devicePixelRatio = window.devicePixelRatio || 1;
    this.romajiCanvas.width *= devicePixelRatio;
    this.romajiCanvas.height *= devicePixelRatio;
    this.ctx.scale(devicePixelRatio, devicePixelRatio);
    this.romajiCanvas.style.width = `${containerWidth - 60}px`;
    this.romajiCanvas.style.height = '50px';

    // Canvas描画品質の向上
    this.ctx.imageSmoothingEnabled = true;

    this.createCanvasChars();
  }  /**
   * Canvas用ローマ字文字作成 - 個別フォーカス対応
   */  private createCanvasChars(): void {
    this.canvasChars = [];
    let totalRomaji = '';
    
    // 全ローマ字文字列を構築
    this.state.typingChars.forEach(char => {
      totalRomaji += char.patterns[0];
    });

    if (totalRomaji.length === 0) return;

    // 文字配置計算
    const canvasWidth = (this.container?.offsetWidth || 800) - 60;
    const charSpacing = Math.min(24, Math.max(16, canvasWidth / (totalRomaji.length + 2)));
    const totalTextWidth = totalRomaji.length * charSpacing;
    const startX = (canvasWidth - totalTextWidth) / 2;

    // 各文字のCanvasオブジェクト作成
    for (let i = 0; i < totalRomaji.length; i++) {
      const char = totalRomaji[i];
      this.canvasChars.push(new CanvasRomajiChar(
        char,
        startX + (i * charSpacing) + charSpacing / 2,
        25
      ));
    }
  }

  /**
   * キー入力リスナー設定
   */
  private setupKeyListener(): void {
    this.keyHandler = (e: KeyboardEvent) => {
      // DirectTypingEngine2と同じキー処理
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      if (e.key.length !== 1) return;

      e.preventDefault();
      e.stopPropagation();
      
      this.processKey(e.key);
    };

    // 🚀 低レベルイベント処理で最高速度実現
    window.addEventListener('keydown', this.keyHandler, { 
      passive: false, 
      capture: true 
    });
  }
  /**
   * 🚀 ZERO-LATENCY キー処理 - DirectTypingEngine2完全互換
   */
  private processKey(key: string): void {
    if (this.state.keyCount === 0) {
      UltraFastAudioSystem.resumeAudioContext();
    }

    if (this.state.startTime === 0) {
      this.state.startTime = Date.now();
    }

    this.state.keyCount++;

    const currentChar = this.state.typingChars[this.state.currentIndex];
    if (!currentChar) return;

    // 「ん」の分岐状態処理 - DirectTypingEngine2完全再現
    if (currentChar.branchingState) {
      const nextChar = this.state.typingChars[this.state.currentIndex + 1];
      const result = currentChar.typeBranching(key, nextChar);

      if (result.success) {
        UltraFastAudioSystem.playClickSound();

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
        }

        // 🚀 即座Canvas更新
        this.updateCanvasStates();
        this.renderCanvas();
        this.notifyProgress();
        return;
      } else {
        this.state.mistakeCount++;
        UltraFastAudioSystem.playErrorSound();
        
        // 🚀 即座Canvas更新
        this.updateCanvasStates();
        this.renderCanvas();
        this.notifyProgress();
        return;
      }
    }

    // 通常のタイピング処理
    const isCorrect = currentChar.type(key);

    if (isCorrect) {
      UltraFastAudioSystem.playClickSound();

      if (currentChar.completed) {
        this.state.currentIndex++;

        if (this.state.currentIndex >= this.state.typingChars.length) {
          this.handleWordComplete();
          return;
        }
      }
    } else {
      this.state.mistakeCount++;
      UltraFastAudioSystem.playErrorSound();
    }

    // 🚀 即座Canvas更新 - requestAnimationFrame排除
    this.updateCanvasStates();
    this.renderCanvas();
    this.notifyProgress();
  }

  /**
   * 「ん」分岐処理判定
   */
  private canBranch(nextChar: TypingChar, key: string): boolean {
    return nextChar.patterns.some(pattern => pattern.startsWith(key.toLowerCase()));
  }

  /**
   * 「ん」分岐処理
   */
  private handleNBranching(key: string): void {
    const currentChar = this.state.typingChars[this.state.currentIndex];
    const nextChar = this.state.typingChars[this.state.currentIndex + 1];
    
    // 'nn'パターンで完了
    currentChar.type('n');
    if (currentChar.completed) {
      this.state.currentIndex++;
    }
    
    // 次の文字に入力を渡す
    if (nextChar && this.state.currentIndex < this.state.typingChars.length) {
      const nextResult = nextChar.type(key);
      if (nextResult && nextChar.completed) {
        this.state.currentIndex++;
      }
    }
    
    this.state.keyCount++;
    UltraFastAudioSystem.playClickSound();
    
    this.updateCanvasStates();
    this.renderCanvas();
    this.notifyProgress();
  }
  /**
   * Canvas文字状態更新 - 個別フォーカス完全再現
   */  private updateCanvasStates(): void {
    let romajiIndex = 0;
      for (let i = 0; i < this.state.typingChars.length; i++) {
      const char = this.state.typingChars[i];
      const pattern = char.patterns[0]; // 元データが既に小文字なので変換不要
      
      for (let j = 0; j < pattern.length; j++) {
        if (romajiIndex >= this.canvasChars.length) break;
        
        let newState: 'inactive' | 'active' | 'completed';
        
        if (i < this.state.currentIndex) {
          // 完了済み文字
          newState = 'completed';
        } else if (i === this.state.currentIndex && j < char.acceptedInput.length) {
          // 現在文字の入力済み部分
          newState = 'completed';
        } else if (i === this.state.currentIndex && j === char.acceptedInput.length) {
          // 現在フォーカス位置
          newState = 'active';
        } else {
          // 未入力
          newState = 'inactive';
        }
        
        // 状態更新
        this.canvasChars[romajiIndex].setState(newState);
        romajiIndex++;
      }
    }
  }
  /**
   * 🚀 超高速Canvas描画 - DirectTypingEngine2のフォーカス完全再現
   */  private renderCanvas(): void {
    if (!this.ctx || !this.romajiCanvas) return;

    // Canvas クリア
    this.ctx.clearRect(0, 0, this.romajiCanvas.width, this.romajiCanvas.height);

    // フォント設定 - 内部定数使用
    const fontString = `${CANVAS_FONT_CONFIG.fontWeight} ${CANVAS_FONT_CONFIG.fontSize} ${CANVAS_FONT_CONFIG.fontFamily}`;
    this.ctx.font = fontString;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    // 各文字描画
    this.canvasChars.forEach(char => {
      const shadowColor = char.getShadow();
      this.ctx!.shadowColor = shadowColor;
      this.ctx!.shadowBlur = shadowColor !== '0 0 1px rgba(0,0,0,0.5)' ? 4 : 1;
      this.ctx!.shadowOffsetX = 0;
      this.ctx!.shadowOffsetY = 1;

      this.ctx!.fillStyle = char.getColor();
      this.ctx!.fillText(char.character, char.x, char.y);
    });

    // シャドウリセット
    this.ctx.shadowColor = 'transparent';
    this.ctx.shadowBlur = 0;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;
  }

  /**
   * 進捗通知 - DirectTypingEngine2互換
   */
  private notifyProgress(): void {
    if (!this.onProgress) return;

    const progress = this.getDetailedProgress();
    if (progress) {
      this.onProgress(this.state.currentIndex, progress);
    }
  }
  /**
   * 詳細進捗取得
   */
  private getDetailedProgress(): KanaDisplay | null {
    if (this.state.typingChars.length === 0) return null;

    const currentChar = this.state.typingChars[this.state.currentIndex];
    if (!currentChar) return null;

    const displayInfo = currentChar.getDisplayInfo();
    
    return {
      acceptedText: displayInfo.acceptedText,
      remainingText: displayInfo.remainingText,
      displayText: displayInfo.displayText
    };
  }
  /**
   * 単語完了処理
   */
  private handleWordComplete(): void {
    if (this.onComplete) {
      const endTime = Date.now();
      const elapsedTime = (endTime - this.state.startTime) / 1000;
      const accuracy = this.state.keyCount > 0 
        ? (this.state.keyCount - this.state.mistakeCount) / this.state.keyCount 
        : 1;

      const scoreLog: PerWordScoreLog = {
        keyCount: this.state.keyCount,
        correct: this.state.keyCount - this.state.mistakeCount,
        miss: this.state.mistakeCount,
        startTime: this.state.startTime,
        endTime: endTime,
        duration: elapsedTime,
        kpm: Math.round((this.state.keyCount / elapsedTime) * 60),
        accuracy: accuracy
      };
      
      this.onComplete(scoreLog);
    }
  }

  /**
   * クリーンアップ
   */
  cleanup(): void {
    if (this.keyHandler) {
      window.removeEventListener('keydown', this.keyHandler, true);
      this.keyHandler = undefined;
    }
  }
}
