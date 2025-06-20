﻿/**
 * HybridTypingEngine - typingmania-ref流超高速タイピングエンジン
 * 
 * 哲学: 「シンプルが最速」
 * - 原文・ひらがな: DOM（美しさ維持）
 * - ローマ字: Canvas（1-3ms超高速）
 * - 最小限のコード、最大のパフォーマンス
 */

import { TypingChar } from './TypingChar';
import type { KanaDisplay, PerWordScoreLog } from '@/types';
import UltraFastAudioSystem from '@/utils/UltraFastAudioSystem';

/**
 * Canvas設定 + HybridTypingEngine最適化定数
 */
const CANVAS_CONFIG = {
  fontString: '500 1.8rem "Courier New", monospace',
  activeColor: '#FFD700',
  completedColor: '#4FC3F7', 
  inactiveColor: '#B0BEC5'
} as const;

/**
 * Canvas文字クラス - 最小限実装
 */
class CanvasRomajiChar {
  private state: 'inactive' | 'active' | 'completed' = 'inactive';
  private needsRedraw = true;

  constructor(public character: string, public x: number, public y: number) {}
  
  setState(newState: 'inactive' | 'active' | 'completed'): boolean {
    if (this.state === newState) return false;
    this.state = newState;
    this.needsRedraw = true;
    return true;
  }
  
  getState() { return this.state; }
  needsUpdate() { return this.needsRedraw; }
  clearUpdateFlag() { this.needsRedraw = false; }
}

/**
 * エンジン状態 - シンプル
 */
interface EngineState {
  typingChars: TypingChar[];
  currentIndex: number;
  keyCount: number;
  mistakeCount: number;
  startTime: number;
}

/**
 * 🚀 HybridTypingEngine - typingmania-ref流実装
 */
export class HybridTypingEngine {
  private state: EngineState = {
    typingChars: [],
    currentIndex: 0,
    keyCount: 0,
    mistakeCount: 0,
    startTime: 0
  };
  private container: HTMLElement | null = null;
  private romajiCanvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private canvasChars: CanvasRomajiChar[] = [];
  
  private onProgress?: (index: number, display: KanaDisplay) => void;
  private onComplete?: (scoreLog: PerWordScoreLog) => void;
  private keyHandler?: (e: KeyboardEvent) => void;
  private focusOutHandler?: (e: FocusEvent) => void;

  /**
   * 初期化 - シンプルインターフェース
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
    this.state.currentIndex = 0;
    this.state.startTime = 0;    this.setupDOM(originalText);
    this.setupCanvas();    this.setupKeyListener();
    
    // 🚀 UltraFastAudioSystem初期化（メカニカルキーボード音対応）
    UltraFastAudioSystem.init();
    this.updateCanvasStates();
    this.renderCanvas();
  }
  /**
   * 🚀 タイピンガーZ級DOM構築
   */
  private setupDOM(originalText: string): void {
    if (!this.container) return;

    this.container.innerHTML = `
      <div style="
        display: flex; flex-direction: column; gap: 20px; padding: 20px;
        min-height: 120px; border-radius: 8px;
      ">
        <div style="
          text-align: center; font-size: 2.2rem; font-weight: bold;
          color: #f0f0f0; padding: 20px; border-radius: 12px;
          background: rgba(0,0,0,0.08); min-height: 70px;
          display: flex; align-items: center; justify-content: center;
        ">${originalText}</div>
        
        <canvas class="romaji-canvas" style="
          display: block; margin: 0 auto; height: 50px;
          image-rendering: crisp-edges;
        "></canvas>
        
        <!-- 🚀 タイピンガーZ級専用入力フィールド -->
        <input 
          id="taipingaz-focus-retriever" 
          style="position: fixed; left: -300px; top: 0; opacity: 0;" 
          type="text" 
          readonly 
          tabindex="-1"
        />
      </div>
    `;
  }
  /**
   * 🚀 タイピンガーZ級Canvas初期化
   */
  private setupCanvas(): void {
    this.romajiCanvas = this.container?.querySelector('.romaji-canvas') as HTMLCanvasElement;
    if (!this.romajiCanvas) return;

    const dpr = window.devicePixelRatio || 1;
    this.romajiCanvas.width = 800 * dpr;
    this.romajiCanvas.height = 50 * dpr;
    this.romajiCanvas.style.width = '800px';
    this.romajiCanvas.style.height = '50px';

    this.ctx = this.romajiCanvas.getContext('2d');
    if (!this.ctx) return;

    // 🔥 GPU加速ヒント設定
    this.ctx.scale(dpr, dpr);
    this.ctx.font = CANVAS_CONFIG.fontString;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    // 🚀 超高速描画設定
    this.ctx.imageSmoothingEnabled = false; // ピクセル完璧
    this.ctx.globalCompositeOperation = 'source-over'; // デフォルト明示

    // Canvas文字配置 - 最適間隔設定
    this.canvasChars = [];
    
    const totalRomaji = this.state.typingChars.reduce((sum, char) => sum + char.patterns[0].length, 0);
    const charSpacing = 18; // 1.8remフォント最適間隔
    const totalWidth = totalRomaji * charSpacing;
    const canvasWidth = 800;
    const startX = (canvasWidth - totalWidth) / 2 + charSpacing / 2;
    
    let x = startX;
    const y = 25;

    this.state.typingChars.forEach(char => {
      const romaji = char.patterns[0];
      for (let i = 0; i < romaji.length; i++) {
        this.canvasChars.push(new CanvasRomajiChar(romaji[i], x, y));
        x += charSpacing;
      }
    });
  }  /**
   * 🚀 Container-Scoped キーリスナー - 他画面と完全分離
   */
  private setupKeyListener(): void {
    if (!this.container) return;

    // 🚀 コンテナをフォーカス可能にする
    this.container.setAttribute('tabindex', '0');
    this.container.style.outline = 'none';
    this.container.focus();

    // 🔥 コンテナレベルでのキーイベント処理（windowレベルではない）
    this.keyHandler = (e: KeyboardEvent) => {
      // 修飾キーや特殊キーは完全スルー（他画面のショートカット用）
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      if (e.key.length !== 1 || e.key < ' ' || e.key > '~') return;
      
      // タイピング処理のみpreventDefault
      e.preventDefault();
      e.stopImmediatePropagation();
      this.processKey(e.key);
    };

    // 🚀 Container-Scopedイベントリスナー（windowではなくcontainer）
    this.container.addEventListener('keydown', this.keyHandler, { 
      passive: false, 
      capture: false
    });

    // 🔥 フォーカス維持管理
    this.setupFocusManagement();
  }

  /**
   * 🚀 Container Focus Management - タイピング中のみフォーカス維持
   */
  private setupFocusManagement(): void {
    if (!this.container) return;

    // フォーカスアウト時の処理
    this.focusOutHandler = (e: FocusEvent) => {
      // タイピング中はフォーカスを戻す
      setTimeout(() => {
        if (this.container && this.state.currentIndex < this.state.typingChars.length) {
          this.container.focus();
        }
      }, 10);
    };

    this.container.addEventListener('focusout', this.focusOutHandler);
  }  /**
   * 🚀 HybridTypingEngine メカニカルキーボード音対応キー処理
   */
  private processKey(key: string): void {
    // 🎯 初回キー：音声コンテキスト + タイマー開始
    if (this.state.keyCount === 0) {
      UltraFastAudioSystem.resumeAudioContext();
      this.state.startTime = Date.now();
    }

    this.state.keyCount++;
    const currentChar = this.state.typingChars[this.state.currentIndex];
    if (!currentChar) return;

    let shouldUpdate = false;

    // 🔥 分岐処理：超高速判定
    if (currentChar.branchingState) {
      const nextChar = this.state.typingChars[this.state.currentIndex + 1];
      const result = currentChar.typeBranching(key, nextChar);

      if (result.success) {
        UltraFastAudioSystem.playClickSound(); // 🚀 メカニカルキーボード音
        shouldUpdate = true;

        if (result.completeWithSingle) {
          this.state.currentIndex++;
          if (nextChar) {
            const nextResult = nextChar.type(key);
            if (nextResult && nextChar.completed) {
              this.state.currentIndex++;
            }
          }
        } else {
          this.state.currentIndex++;
        }

        if (this.state.currentIndex >= this.state.typingChars.length) {
          this.handleWordComplete();
          return;
        }
      } else {
        this.state.mistakeCount++;
        UltraFastAudioSystem.playErrorSound(); // 🚀 メカニカルキーボードエラー音
        shouldUpdate = true;
      }
    } else {
      // 通常処理
      const isCorrect = currentChar.type(key);

      if (isCorrect) {
        UltraFastAudioSystem.playClickSound(); // 🚀 メカニカルキーボード音
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
        UltraFastAudioSystem.playErrorSound(); // 🚀 メカニカルキーボードエラー音
        shouldUpdate = true;
      }
    }

    // 🚀 即座更新：最小チェック
    if (shouldUpdate) {
      this.updateCanvasStates();
      this.renderCanvas();
      this.notifyProgress();
    }
  }

  /**
   * Canvas状態更新 - シンプル
   */
  private updateCanvasStates(): void {
    let romajiIndex = 0;

    this.state.typingChars.forEach((char, i) => {
      const romaji = char.patterns[0];
      
      for (let j = 0; j < romaji.length; j++) {
        if (romajiIndex >= this.canvasChars.length) break;

        let newState: 'inactive' | 'active' | 'completed';
        
        if (i < this.state.currentIndex) {
          newState = 'completed';
        } else if (i === this.state.currentIndex && j < char.acceptedInput.length) {
          newState = 'completed';
        } else if (i === this.state.currentIndex && j === char.acceptedInput.length) {
          newState = 'active';
        } else {
          newState = 'inactive';
        }

        this.canvasChars[romajiIndex].setState(newState);
        romajiIndex++;
      }
    });
  }
  /**
   * 🚀 タイピンガーZ級超高速Canvas描画
   */
  private renderCanvas(): void {
    if (!this.ctx || !this.romajiCanvas) return;

    const changedChars = this.canvasChars.filter(char => char.needsUpdate());
    if (changedChars.length === 0) return;

    // 🔥 GPU最適化：ビットマップキャッシュスタイル設定
    this.ctx.clearRect(0, 0, this.romajiCanvas.width, this.romajiCanvas.height);

    // 🚀 バッチ描画：状態別グループ化
    const activeChars: CanvasRomajiChar[] = [];
    const completedChars: CanvasRomajiChar[] = [];
    const inactiveChars: CanvasRomajiChar[] = [];

    this.canvasChars.forEach(char => {
      const state = char.getState();
      if (state === 'active') activeChars.push(char);
      else if (state === 'completed') completedChars.push(char);
      else inactiveChars.push(char);
    });

    // 🎯 状態別バッチ描画（スタイル変更最小化）
    this.drawCharBatch(inactiveChars, CANVAS_CONFIG.inactiveColor, 'rgba(0,0,0,0.4)', 2);
    this.drawCharBatch(completedChars, CANVAS_CONFIG.completedColor, 'rgba(79, 195, 247, 0.7)', 6);
    this.drawCharBatch(activeChars, CANVAS_CONFIG.activeColor, 'rgba(255, 215, 0, 0.8)', 6);

    // シャドウリセット
    this.ctx.shadowColor = 'transparent';
    this.ctx.shadowBlur = 0;

    changedChars.forEach(char => char.clearUpdateFlag());
  }

  /**
   * 🚀 バッチ描画：状態変更最小化
   */
  private drawCharBatch(chars: CanvasRomajiChar[], fillStyle: string, shadowColor: string, shadowBlur: number): void {
    if (chars.length === 0) return;
    
    this.ctx!.fillStyle = fillStyle;
    this.ctx!.shadowColor = shadowColor;
    this.ctx!.shadowBlur = shadowBlur;
    
    chars.forEach(char => {
      this.ctx!.fillText(char.character, char.x, char.y);
    });
  }

  /**
   * 進捗通知 - シンプル
   */
  private notifyProgress(): void {
    if (!this.onProgress) return;

    const currentChar = this.state.typingChars[this.state.currentIndex];
    if (!currentChar) return;

    const displayInfo = currentChar.getDisplayInfo();
    this.onProgress(this.state.currentIndex, {
      acceptedText: displayInfo.acceptedText,
      remainingText: displayInfo.remainingText,
      displayText: displayInfo.displayText
    });
  }

  /**
   * 完了処理 - シンプル
   */  private handleWordComplete(): void {
    // 🚀 完了時にコンテナからフォーカスを外す
    if (this.container) {
      this.container.blur();
    }

    if (!this.onComplete) return;

    const endTime = Date.now();
    const elapsedTime = (endTime - this.state.startTime) / 1000;
    const accuracy = this.state.keyCount > 0 
      ? (this.state.keyCount - this.state.mistakeCount) / this.state.keyCount 
      : 1;

    this.onComplete({
      keyCount: this.state.keyCount,
      correct: this.state.keyCount - this.state.mistakeCount,
      miss: this.state.mistakeCount,
      startTime: this.state.startTime,
      endTime: endTime,
      duration: elapsedTime,
      kpm: Math.round((this.state.keyCount / elapsedTime) * 60),
      accuracy: accuracy
    });
  }

  /**
   * クリーンアップ - シンプル
   */  cleanup(): void {
    // 🚀 Container-scopedイベントリスナー削除
    if (this.container && this.keyHandler) {
      this.container.removeEventListener('keydown', this.keyHandler, false);
      this.keyHandler = undefined;
    }

    if (this.container && this.focusOutHandler) {
      this.container.removeEventListener('focusout', this.focusOutHandler);
      this.focusOutHandler = undefined;
    }

    // 🚀 コンテナのフォーカス属性をリセット
    if (this.container) {
      this.container.removeAttribute('tabindex');
      this.container.blur();
    }

    // 🚀 状態リセット
    this.state = {
      typingChars: [],
      currentIndex: 0,
      keyCount: 0,
      mistakeCount: 0,
      startTime: 0
    };
    
    this.container = null;
    this.romajiCanvas = null;
    this.ctx = null;
    this.canvasChars = [];
  }
}
