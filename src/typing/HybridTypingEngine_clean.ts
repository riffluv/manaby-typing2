/**
 * HybridTypingEngine - typingmania-ref流超高速タイピングエンジン
 * 
 * 哲学: 「シンプルが最速」
 * - 原文・ひらがな: DOM（美しさ維持）
 * - ローマ字: Canvas（1-3ms超高速）
 * - 最小限のコード、最大のパフォーマンス
 */

import { TypingChar } from './TypingChar';
import type { KanaDisplay, PerWordScoreLog } from '@/types';

/**
 * Canvas設定 - typingmania-ref流シンプル設計
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
    this.state.startTime = 0;

    this.setupDOM(originalText);
    this.setupCanvas();
    this.setupKeyListener();
    
    SimpleSfx.init();
    this.updateCanvasStates();
    this.renderCanvas();
  }

  /**
   * DOM構築 - 最小限
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
      </div>
    `;
  }

  /**
   * Canvas初期化 - シンプル
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

    this.ctx.scale(dpr, dpr);
    this.ctx.font = CANVAS_CONFIG.fontString;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    // Canvas文字配置
    this.canvasChars = [];
    let x = 50;
    const y = 25;

    this.state.typingChars.forEach(char => {
      const romaji = char.patterns[0];
      for (let i = 0; i < romaji.length; i++) {
        this.canvasChars.push(new CanvasRomajiChar(romaji[i], x, y));
        x += 25;
      }
    });
  }

  /**
   * キーリスナー - シンプル
   */
  private setupKeyListener(): void {
    this.keyHandler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.metaKey || e.key.length !== 1) return;
      e.preventDefault();
      e.stopPropagation();
      this.processKey(e.key);
    };

    window.addEventListener('keydown', this.keyHandler, { passive: false, capture: true });
  }

  /**
   * キー処理 - typingmania-ref流
   */
  private processKey(key: string): void {
    if (this.state.keyCount === 0) {
      SimpleSfx.resumeContext();
      this.state.startTime = Date.now();
    }

    this.state.keyCount++;
    const currentChar = this.state.typingChars[this.state.currentIndex];
    if (!currentChar) return;

    let shouldUpdate = false;

    // 分岐処理
    if (currentChar.branchingState) {
      const nextChar = this.state.typingChars[this.state.currentIndex + 1];
      const result = currentChar.typeBranching(key, nextChar);

      if (result.success) {
        SimpleSfx.play('key');
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
        SimpleSfx.play('error');
        shouldUpdate = true;
      }
    } else {
      // 通常処理
      const isCorrect = currentChar.type(key);

      if (isCorrect) {
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
        SimpleSfx.play('error');
        shouldUpdate = true;
      }
    }

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
   * Canvas描画 - typingmania-ref流シンプル
   */
  private renderCanvas(): void {
    if (!this.ctx || !this.romajiCanvas) return;

    const changedChars = this.canvasChars.filter(char => char.needsUpdate());
    if (changedChars.length === 0) return;

    // シンプルが最速：常に全体描画
    this.ctx.clearRect(0, 0, this.romajiCanvas.width, this.romajiCanvas.height);

    this.canvasChars.forEach(char => {
      const state = char.getState();
      
      switch (state) {
        case 'active':
          this.ctx!.fillStyle = CANVAS_CONFIG.activeColor;
          this.ctx!.shadowColor = 'rgba(255, 215, 0, 0.8)';
          this.ctx!.shadowBlur = 6;
          break;
        case 'completed':
          this.ctx!.fillStyle = CANVAS_CONFIG.completedColor;
          this.ctx!.shadowColor = 'rgba(79, 195, 247, 0.7)';
          this.ctx!.shadowBlur = 6;
          break;
        default:
          this.ctx!.fillStyle = CANVAS_CONFIG.inactiveColor;
          this.ctx!.shadowColor = 'rgba(0,0,0,0.4)';
          this.ctx!.shadowBlur = 2;
          break;
      }
      
      this.ctx!.fillText(char.character, char.x, char.y);
    });

    // シャドウリセット
    this.ctx.shadowColor = 'transparent';
    this.ctx.shadowBlur = 0;

    changedChars.forEach(char => char.clearUpdateFlag());
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
   */
  private handleWordComplete(): void {
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
   */
  cleanup(): void {
    if (this.keyHandler) {
      window.removeEventListener('keydown', this.keyHandler, true);
      this.keyHandler = undefined;
    }
  }
}

/**
 * typingmania-ref流音響システム - 最小限実装
 */
class SimpleSfx {
  private static audioContext: AudioContext | null = null;
  private static lastPlayTime = 0;
  private static THROTTLE_INTERVAL = 20; // 50fps保証

  static async init(): Promise<void> {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  static async play(soundType: 'key' | 'error'): Promise<void> {
    if (!this.audioContext) await this.init();
    if (!this.audioContext) return;

    const now = Date.now();
    if (soundType === 'key' && (now - this.lastPlayTime) < this.THROTTLE_INTERVAL) {
      return;
    }
    this.lastPlayTime = now;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    if (soundType === 'key') {
      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    } else {
      oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime);
    }

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
