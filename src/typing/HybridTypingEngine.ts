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
 * Canvas設定 + タイピンガーZ級最適化定数
 */
const CANVAS_CONFIG = {
  fontString: '500 1.8rem "Courier New", monospace',
  activeColor: '#FFD700',
  completedColor: '#4FC3F7', 
  inactiveColor: '#B0BEC5'
} as const;

/**
 * 🚀 タイピンガーZ級音響システム
 */
class TaipingazSfx {
  private static context: AudioContext | null = null;
  private static sounds: Map<string, AudioBuffer> = new Map();
  private static volume = 0.8; // タイピンガーZ級音量

  static async init() {
    if (!this.context) {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // 🎯 タイピンガーZ級効果音プリロード
      await this.loadSound('correct', this.generateTone(800, 0.1));
      await this.loadSound('incorrect', this.generateTone(400, 0.15));
    }
  }

  private static generateTone(frequency: number, duration: number): AudioBuffer {
    const sampleRate = this.context!.sampleRate;
    const buffer = this.context!.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate) * 0.3;
    }
    return buffer;
  }

  private static async loadSound(name: string, buffer: AudioBuffer) {
    this.sounds.set(name, buffer);
  }

  static play(soundName: string) {
    if (!this.context || !this.sounds.has(soundName)) return;
    
    const buffer = this.sounds.get(soundName)!;
    const source = this.context.createBufferSource();
    const gainNode = this.context.createGain();
    
    source.buffer = buffer;
    gainNode.gain.value = this.volume;
    
    source.connect(gainNode);
    gainNode.connect(this.context.destination);
    source.start();
  }

  static resumeContext() {
    this.context?.resume();
  }
}

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
    this.setupCanvas();    this.setupKeyListener();
    
    // 🚀 タイピンガーZ級音響初期化
    TaipingazSfx.init();
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
  }
  /**
   * 🚀 タイピンガーZ級超高速キーリスナー
   */
  private setupKeyListener(): void {
    this.keyHandler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.metaKey || e.key.length !== 1) return;
      e.preventDefault();
      e.stopImmediatePropagation(); // 🔥 即座停止
      this.processKey(e.key);
    };

    // 🚀 最高優先度キャプチャ + パッシブ無効
    window.addEventListener('keydown', this.keyHandler, { 
      passive: false, 
      capture: true,
      once: false
    });
  }
  /**
   * 🚀 タイピンガーZ級キー処理
   */
  private processKey(key: string): void {
    // 🎯 初回キー：音声コンテキスト + タイマー開始
    if (this.state.keyCount === 0) {
      TaipingazSfx.resumeContext();
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
        TaipingazSfx.play('correct'); // 🚀 タイピンガーZ級効果音
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
        TaipingazSfx.play('incorrect'); // 🚀 タイピンガーZ級エラー音
        shouldUpdate = true;
      }
    } else {
      // 通常処理
      const isCorrect = currentChar.type(key);

      if (isCorrect) {
        TaipingazSfx.play('correct'); // 🚀 タイピンガーZ級効果音
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
        TaipingazSfx.play('incorrect'); // 🚀 タイピンガーZ級エラー音
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
