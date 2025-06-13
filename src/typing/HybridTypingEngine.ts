/**
 * HybridTypingEngine - typingmania-ref流超高速タイピングエンジン
 * 
 * 特徴:
 * - 原文・ひらがな: DOM（既存の美しいスタイル維持）
 * - ローマ字: Canvas（1-3ms超高速レスポンス）
 * - typingmania-ref流「シンプルが最速」の哲学を採用
 * - フォーカス機能完全再現
 */

import { TypingChar } from './TypingChar';
import type { KanaDisplay, PerWordScoreLog } from '@/types';

/**
 * ハイブリッドエンジン設定 - 表示制御のみ
 */
interface HybridEngineConfig {
  showKanaDisplay?: boolean;
}

/**
 * Canvas用フォント設定 - プロフェッショナルゲームUI設計
 * 🎯 一流ゲームデザイナーの視覚階層理論に基づく最適化
 */
const CANVAS_FONT_CONFIG = {
  fontFamily: '"Courier New", "Consolas", "Liberation Mono", monospace',
  fontSize: '1.8rem', // 🎨 28.8px - タイピング対象として最適サイズ
  fontWeight: '500', // 🎨 ミディアム - 太すぎず細すぎずの黄金バランス
  // 🎨 プロフェッショナルゲーミング色彩設計
  activeColor: '#FFD700',    // ゴールド - 高級感のあるアクティブ色
  completedColor: '#4FC3F7', // スカイブルー - 美しく目に優しい完了色
  inactiveColor: '#B0BEC5',  // 読みやすいグレー - 長時間プレイ対応
  // 🚀 フォント文字列を事前計算で高速化（プロ仕様）
  fontString: '500 1.8rem "Courier New", "Consolas", "Liberation Mono", monospace'
} as const;

/**
 * Canvas用ローマ字文字クラス - 高速連続入力最適化版
 */
class CanvasRomajiChar {
  private state: 'inactive' | 'active' | 'completed' = 'inactive';
  private needsRedraw: boolean = true; // 🚀 差分描画フラグ

  constructor(
    public character: string,
    public x: number,
    public y: number
  ) {}
  
  setState(newState: 'inactive' | 'active' | 'completed'): boolean {
    if (this.state === newState) return false; // 🚀 無駄な更新を防止
    this.state = newState;
    this.needsRedraw = true; // 🚀 再描画フラグ設定
    return true;
  }
  
  getState(): 'inactive' | 'active' | 'completed' {
    return this.state;
  }
  
  // 🚀 差分描画制御
  needsUpdate(): boolean {
    return this.needsRedraw;
  }
  
  clearUpdateFlag(): void {
    this.needsRedraw = false;
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
      case 'active': return '0 0 12px rgba(255, 215, 0, 0.9)';    // ゴールドグロー強化
      case 'completed': return '0 0 8px rgba(79, 195, 247, 0.7)'; // スカイブルーグロー
      default: return '0 0 2px rgba(0,0,0,0.4)';                  // 控えめシャドウ
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
 * 🚀 HybridTypingEngine - typingmania-ref流超高速レスポンス実装
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
      // 🚀 typingmania-ref流：音響システム事前初期化
    SimpleSfx.init();
    
    // 🚀 初期状態設定：最初の文字をアクティブに設定
    this.updateCanvasStates();
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
    this.container.style.gap = '20px';    // かな表示の条件付きHTML - プロフェッショナル補助UI設計
    const kanaDisplayHTML = this.config.showKanaDisplay ? `
      <div class="hybrid-kana-container" style="
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 50px;
        background: rgba(0,0,0,0.06);
        border-radius: 10px;
        padding: 12px;
        font-size: 1.4rem;
        font-weight: 400;
        color: #d6cbb2;
        text-shadow: 0 0 3px rgba(0,0,0,0.6);
        letter-spacing: 0.05em;
        opacity: 0.85;
      "></div>
    ` : '';// DOM構築 - 🎨 プロフェッショナルゲームUI視覚階層設計
    this.container.innerHTML = `
      <div class="hybrid-original-text" style="
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 70px;
        background: rgba(0,0,0,0.08);
        border-radius: 12px;
        padding: 20px;
        font-size: 2.2rem;
        font-weight: 600;
        background: linear-gradient(135deg, #c9a76f, #f8e6b0, #d4af37);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-shadow: 0 0 8px rgba(255, 223, 128, 0.3);
        letter-spacing: 0.02em;
        line-height: 1.2;
      "></div>
      ${kanaDisplayHTML}
      <div class="hybrid-canvas-container" style="
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 60px;
        background: rgba(0,0,0,0.05);
        border-radius: 12px;
        padding: 20px;
      ">
        <canvas class="romaji-canvas hybrid-romaji-canvas" style="
          background: transparent;
          border-radius: 8px;
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
    if (!this.ctx) return;    // Canvas サイズ設定 - プロフェッショナルゲーミング最適化
    const containerWidth = this.container?.offsetWidth || 800;
    this.romajiCanvas.width = containerWidth - 80; // より広いパディングで洗練された配置
    this.romajiCanvas.height = 60; // ローマ字に十分な高さを確保

    // 高DPI対応とアンチエイリアス最適化
    const devicePixelRatio = window.devicePixelRatio || 1;
    this.romajiCanvas.width *= devicePixelRatio;
    this.romajiCanvas.height *= devicePixelRatio;
    this.ctx.scale(devicePixelRatio, devicePixelRatio);    this.romajiCanvas.style.width = `${containerWidth - 80}px`;
    this.romajiCanvas.style.height = '60px';

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

    if (totalRomaji.length === 0) return;    // 文字配置計算 - 🎨 プロフェッショナルゲーミングUI設計
    const canvasWidth = (this.container?.offsetWidth || 800) - 80;
    // 🎯 最適可読性理論: フォントサイズの10%間隔（1.8rem × 0.1 = 0.18rem ≈ 2.88px）
    const baseFontSize = 28.8; // 1.8rem の実際のピクセル値
    const optimalSpacing = baseFontSize * 0.1; // 10% - ゲーミング最適比率
    const charWidth = baseFontSize * 0.6; // モノスペースフォントの文字幅推定
    const charSpacing = charWidth + optimalSpacing;
    const totalTextWidth = totalRomaji.length * charSpacing;
    const startX = (canvasWidth - totalTextWidth) / 2;

    // 各文字のCanvasオブジェクト作成
    for (let i = 0; i < totalRomaji.length; i++) {
      const char = totalRomaji[i];
      this.canvasChars.push(new CanvasRomajiChar(
        char,        startX + (i * charSpacing) + charSpacing / 2,
        30 // プロポーショナル縦位置調整
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
  }  /**
   * 🚀 ZERO-LATENCY キー処理 - DirectTypingEngine2完全互換
   */
  private processKey(key: string): void {
    // 🚀 typingmania-ref流：初回キー時の音響コンテキスト復旧
    if (this.state.keyCount === 0) {
      SimpleSfx.resumeContext();
    }

    if (this.state.startTime === 0) {
      this.state.startTime = Date.now();
    }

    this.state.keyCount++;

    const currentChar = this.state.typingChars[this.state.currentIndex];
    if (!currentChar) return;

    let shouldUpdate = false; // 🚀 更新フラグで不要な描画を抑制

    // 「ん」の分岐状態処理 - DirectTypingEngine2完全再現
    if (currentChar.branchingState) {
      const nextChar = this.state.typingChars[this.state.currentIndex + 1];
      const result = currentChar.typeBranching(key, nextChar);

      if (result.success) {
        // 🚀 typingmania-ref流：即座音声再生
        SimpleSfx.play('key');
        shouldUpdate = true;

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
      } else {
        this.state.mistakeCount++;
        // 🚀 typingmania-ref流：即座エラー音再生
        SimpleSfx.play('error');
        shouldUpdate = true;
      }
    } else {
      // 通常のタイピング処理
      const isCorrect = currentChar.type(key);

      if (isCorrect) {
        // 🚀 typingmania-ref流：即座音声再生
        SimpleSfx.play('key');
        shouldUpdate = true;

        if (currentChar.completed) {
          this.state.currentIndex++;

          if (this.state.currentIndex >= this.state.typingChars.length) {
            this.handleWordComplete();
            return;
          }
        }
      } else {
        this.state.mistakeCount++;
        // 🚀 typingmania-ref流：即座エラー音再生
        SimpleSfx.play('error');
        shouldUpdate = true;
      }
    }

    // 🚀 高速連続入力最適化：状態変更時のみ描画更新
    if (shouldUpdate) {
      this.updateCanvasStates();
      this.renderCanvas();
      this.notifyProgress();
    }
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
    SimpleSfx.play('key');
    
    this.updateCanvasStates();
    this.renderCanvas();
    this.notifyProgress();
  }  /**
   * Canvas文字状態更新 - 🚀 差分更新最適化
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
          // 🚀 typingmania-ref流：シンプル状態更新
        this.canvasChars[romajiIndex].setState(newState);
        romajiIndex++;
      }
    }
  }  /**
   * 🚀 超高速Canvas描画 - 高速連続入力最適化版
   */
  private renderCanvas(): void {
    if (!this.ctx || !this.romajiCanvas) return;

    // 🚀 差分描画：変更された文字のみを特定
    const changedChars = this.canvasChars.filter(char => char.needsUpdate());
    
    if (changedChars.length === 0) return; // 🚀 変更なしなら描画スキップ

    // 🚀 高速連続入力時の部分描画最適化（閾値拡大）
    if (changedChars.length <= 5) {
      // 少数文字変更時：部分的にクリア＆描画（通常の連続入力は1-2文字のみ）
      this.renderChangedCharsOnly(changedChars);
    } else {
      // 多数文字変更時：全体描画
      this.renderAllChars();
    }

    // 🚀 更新フラグをクリア
    changedChars.forEach(char => char.clearUpdateFlag());
  }  /**
   * 🚀 部分描画：高速連続入力専用最適化
   */
  private renderChangedCharsOnly(changedChars: CanvasRomajiChar[]): void {
    if (!this.ctx) return;

    this.ctx.font = CANVAS_FONT_CONFIG.fontString;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    changedChars.forEach(char => {
      // 🚀 精密クリア：文字サイズベースの最小領域（高速化）
      const fontSizeValue = parseFloat(CANVAS_FONT_CONFIG.fontSize); // rem値を数値化
      const clearWidth = fontSizeValue * 16 * 1.2; // rem → px変換（16px/rem） + マージン
      const clearHeight = fontSizeValue * 16 * 1.4; // rem → px変換 + マージン
      this.ctx!.clearRect(
        char.x - clearWidth/2, 
        char.y - clearHeight/2, 
        clearWidth, 
        clearHeight
      );

      // 🚀 単一文字描画
      const state = char.getState();
      switch (state) {
        case 'active':
          this.ctx!.fillStyle = CANVAS_FONT_CONFIG.activeColor;
          this.ctx!.shadowColor = 'rgba(255, 215, 0, 0.9)';
          this.ctx!.shadowBlur = 8;
          break;
        case 'completed':
          this.ctx!.fillStyle = CANVAS_FONT_CONFIG.completedColor;
          this.ctx!.shadowColor = 'rgba(79, 195, 247, 0.7)';
          this.ctx!.shadowBlur = 6;
          break;
        default:
          this.ctx!.fillStyle = CANVAS_FONT_CONFIG.inactiveColor;
          this.ctx!.shadowColor = 'rgba(0,0,0,0.4)';
          this.ctx!.shadowBlur = 2;
          break;
      }
      
      this.ctx!.fillText(char.character, char.x, char.y);
    });

    // シャドウリセット
    this.ctx.shadowColor = 'transparent';
    this.ctx.shadowBlur = 0;
  }

  /**
   * 🚀 全体描画：初期化・大量変更時用
   */
  private renderAllChars(): void {
    if (!this.ctx || !this.romajiCanvas) return;

    // Canvas クリア
    this.ctx.clearRect(0, 0, this.romajiCanvas.width, this.romajiCanvas.height);

    this.ctx.font = CANVAS_FONT_CONFIG.fontString;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    // 🚀 全文字描画
    this.canvasChars.forEach(char => {
      const state = char.getState();
      
      switch (state) {
        case 'active':
          this.ctx!.fillStyle = CANVAS_FONT_CONFIG.activeColor;
          this.ctx!.shadowColor = 'rgba(255, 215, 0, 0.9)';
          this.ctx!.shadowBlur = 8;
          break;
        case 'completed':
          this.ctx!.fillStyle = CANVAS_FONT_CONFIG.completedColor;
          this.ctx!.shadowColor = 'rgba(79, 195, 247, 0.7)';
          this.ctx!.shadowBlur = 6;
          break;
        default:
          this.ctx!.fillStyle = CANVAS_FONT_CONFIG.inactiveColor;
          this.ctx!.shadowColor = 'rgba(0,0,0,0.4)';
          this.ctx!.shadowBlur = 2;
          break;
      }
      
      this.ctx!.fillText(char.character, char.x, char.y);
    });

    // シャドウリセット
    this.ctx.shadowColor = 'transparent';
    this.ctx.shadowBlur = 0;
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
  }  /**
   * クリーンアップ
   */
  cleanup(): void {
    if (this.keyHandler) {
      window.removeEventListener('keydown', this.keyHandler, true);
      this.keyHandler = undefined;
    }
  }
}

/**
 * typingmania-ref流シンプル音響システム - 高速連続入力最適化版
 */
class SimpleSfx {
  private static audioContext: AudioContext | null = null;
  private static lastPlayTime = 0; // 🚀 高速連続入力制御
  private static THROTTLE_INTERVAL = 20; // 🚀 20msデバウンス（50fps以上を保証）
  
  static async init(): Promise<void> {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }
  
  static async play(soundType: 'key' | 'error'): Promise<void> {
    if (!this.audioContext) await this.init();
    if (!this.audioContext) return;
    
    // 🚀 高速連続入力時の音響負荷軽減
    const now = Date.now();
    if (soundType === 'key' && (now - this.lastPlayTime) < this.THROTTLE_INTERVAL) {
      return; // 高速入力時はキー音を間引き（エラー音は常に再生）
    }
    this.lastPlayTime = now;
    
    // typingmania-ref流：Web Audio API使用（軽量）
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    // 音の設定 - 🔊 ボリューム強化版
    if (soundType === 'key') {
      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime); // 0.1 → 0.3（3倍）
    } else {
      oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime); // 0.15 → 0.4（約2.7倍）
    }
    
    // 短時間再生
    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
    oscillator.stop(this.audioContext.currentTime + 0.1);
  }
  
  static resumeContext(): void {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }
}
