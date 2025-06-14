/**
 * UltraFastTypingEngine - タイピングコロシアム級超高速エンジン
 * 
 * 目標: 0.3ms以下のキー入力→画面反映レスポンス
 */

import { TypingChar } from './TypingChar';
import type { KanaDisplay, PerWordScoreLog } from '@/types';
import OptimizedAudioSystem from '@/utils/OptimizedAudioSystem';

/**
 * 🚀 超高速Canvas設定
 */
const ULTRA_CANVAS_CONFIG = {
  fontString: '500 24px "Courier New", monospace',
  activeColor: '#FFD700',
  completedColor: '#4FC3F7', 
  inactiveColor: '#B0BEC5',
  backgroundColor: 'transparent'
} as const;

/**
 * 🚀 オブジェクトプール：GC停止防止
 */
class CanvasCharPool {
  private static pool: CanvasChar[] = [];
  private static maxSize = 1000;

  static get(): CanvasChar {
    return this.pool.pop() || new CanvasChar();
  }

  static release(char: CanvasChar) {
    if (this.pool.length < this.maxSize) {
      char.reset();
      this.pool.push(char);
    }
  }
}

/**
 * 🚀 Ultra Canvas文字クラス - 最小限実装
 */
class CanvasChar {
  public state: 'inactive' | 'active' | 'completed' = 'inactive';
  public x = 0;
  public y = 0;
  public width = 0;
  public height = 20;
  public character = '';
  public needsRedraw = true;

  reset() {
    this.state = 'inactive';
    this.needsRedraw = true;
  }

  setState(newState: 'inactive' | 'active' | 'completed'): boolean {
    if (this.state === newState) return false;
    this.state = newState;
    this.needsRedraw = true;
    return true;
  }
}

/**
 * 🚀 予測キャッシュシステム - 99%ヒット率目標
 */
class UltraPredictionCache {
  private static cache = new Map<string, ProcessedResult>();
  private static maxSize = 10000;
  private static hitCount = 0;
  private static totalCount = 0;

  static get(key: string): ProcessedResult | null {
    this.totalCount++;
    const result = this.cache.get(key);
    if (result) {
      this.hitCount++;
      return result;
    }
    return null;
  }

  static set(key: string, value: ProcessedResult) {    if (this.cache.size >= this.maxSize) {
      // LRU削除（簡易版）
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }

  static getHitRate(): number {
    return this.totalCount > 0 ? (this.hitCount / this.totalCount) * 100 : 0;
  }
}

interface ProcessedResult {
  chars: CanvasChar[];
  timestamp: number;
}

/**
 * 🚀 UltraFastTypingEngine - 0.3ms目標
 */
export class UltraFastTypingEngine {
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private chars: CanvasChar[] = [];
  private currentIndex = 0;
  private isProcessing = false;
  private onWordComplete?: (scoreLog: any) => void;
  
  // 🚀 パフォーマンス監視
  private responseTimeSum = 0;
  private responseTimeCount = 0;
  private maxResponseTime = 0;
  constructor(private container: HTMLElement) {
    this.setupUltraCanvas();
    this.setupUltraKeyHandler();
    this.preloadFont();
    
    // 🚀 音響システム初期化
    OptimizedAudioSystem.init();
  }

  /**
   * 🚀 Canvas究極最適化セットアップ
   */
  private setupUltraCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 800;
    this.canvas.height = 100;
    this.canvas.style.cssText = `
      position: absolute;
      top: 50px;
      left: 0;
      width: 100%;
      height: 100px;
      will-change: transform;
      transform: translateZ(0);
    `;
    
    this.ctx = this.canvas.getContext('2d', {
      alpha: false,           // 🚀 アルファチャンネル無効で高速化
      desynchronized: true   // 🚀 非同期描画
    })!;

    // 🚀 高DPI対応
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width *= dpr;
    this.canvas.height *= dpr;
    this.ctx.scale(dpr, dpr);
    
    this.container.appendChild(this.canvas);
  }

  /**
   * 🚀 フォント事前読み込み
   */
  private preloadFont() {
    this.ctx.font = ULTRA_CANVAS_CONFIG.fontString;
    this.ctx.fillStyle = ULTRA_CANVAS_CONFIG.inactiveColor;
    this.ctx.fillText('', 0, 0); // フォント初期化
  }

  /**
   * 🚀 低レベルキーイベントハンドラー
   */
  private setupUltraKeyHandler() {
    // 🚀 DOM伝播前にキャプチャ
    window.addEventListener('keydown', (e) => {
      if (!this.isProcessing && /^[a-zA-Z]$/.test(e.key)) {
        this.processKeyUltraFast(e.key.toLowerCase());
      }
    }, { passive: false, capture: true });
  }

  /**
   * 🚀 0.3ms目標キー処理
   */
  private processKeyUltraFast(key: string) {
    const startTime = performance.now();
    
    this.isProcessing = true;
    
    try {
      const currentChar = this.chars[this.currentIndex];
      if (!currentChar) return;      // 🚀 即座文字状態更新
      if (this.isCorrectKey(key, currentChar)) {
        // 🎵 正解音を即座再生
        OptimizedAudioSystem.playClickSound();
        
        currentChar.setState('completed');
        this.currentIndex++;
          // 🚀 次の文字をアクティブ化
        const nextChar = this.chars[this.currentIndex];
        if (nextChar) {
          nextChar.setState('active');
        } else {
          // 🎉 単語完了！
          this.handleWordComplete();
        }
      } else {
        // 🎵 エラー音を再生
        OptimizedAudioSystem.playErrorSound();
      }
      
      // 🚀 Canvas即座更新（部分描画のみ）
      this.updateCanvasChar(currentChar);
      
    } finally {
      this.isProcessing = false;
      
      // 🚀 パフォーマンス測定
      const responseTime = performance.now() - startTime;
      this.recordResponseTime(responseTime);
    }
  }

  /**
   * 🚀 部分Canvas更新 - 最小範囲のみ
   */
  private updateCanvasChar(char: CanvasChar) {
    if (!char.needsRedraw) return;
    
    // 🚀 最小範囲クリア
    this.ctx.clearRect(char.x - 2, char.y - 20, char.width + 4, 24);
    
    // 🚀 色設定（分岐最小化）
    this.ctx.fillStyle = char.state === 'active' ? ULTRA_CANVAS_CONFIG.activeColor :
                        char.state === 'completed' ? ULTRA_CANVAS_CONFIG.completedColor :
                        ULTRA_CANVAS_CONFIG.inactiveColor;
    
    // 🚀 即座描画
    this.ctx.fillText(char.character, char.x, char.y);
    
    char.needsRedraw = false;
  }
  /**
   * 🚀 テキスト設定（予測キャッシュ活用）
   */
  setText(text: string, onComplete?: (scoreLog: any) => void) {
    this.onWordComplete = onComplete;
    
    const cacheKey = `text_${text}`;
    let result = UltraPredictionCache.get(cacheKey);
    
    if (!result) {
      // 🚀 キャッシュミス：新規作成
      const chars: CanvasChar[] = [];
      
      for (let i = 0; i < text.length; i++) {
        const char = CanvasCharPool.get();
        char.character = text[i];
        char.x = i * 20;
        char.y = 40;
        char.width = 18;
        char.setState(i === 0 ? 'active' : 'inactive');
        chars.push(char);
      }
      
      result = { chars, timestamp: Date.now() };
      UltraPredictionCache.set(cacheKey, result);
    }
    
    // 🚀 古いキャラクターをプールに返却
    this.chars.forEach(char => CanvasCharPool.release(char));
    
    this.chars = result.chars;
    this.currentIndex = 0;
    this.renderAllChars();
  }

  /**
   * 🚀 全文字一括描画
   */
  private renderAllChars() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    for (const char of this.chars) {
      char.needsRedraw = true;
      this.updateCanvasChar(char);
    }
  }
  /**
   * 🚀 キー判定
   */
  private isCorrectKey(key: string, char: CanvasChar): boolean {
    return key === char.character.toLowerCase();
  }

  /**
   * 🎉 単語完了処理
   */
  private handleWordComplete() {
    // 🎵 成功音を再生
    OptimizedAudioSystem.playSuccessSound();
    
    // 簡易的なスコアログを作成
    const scoreLog = {
      japanese: '', // 実際の日本語は外部から取得する必要あり
      startTime: Date.now() - 5000, // 仮の開始時間
      endTime: Date.now(),
      accuracy: 100, // 仮の精度
      speed: this.responseTimeCount > 0 ? (this.responseTimeSum / this.responseTimeCount) : 0
    };
    
    if (this.onWordComplete) {
      this.onWordComplete(scoreLog);
    }
  }

  /**
   * 🚀 パフォーマンス記録
   */
  private recordResponseTime(time: number) {
    this.responseTimeSum += time;
    this.responseTimeCount++;
    this.maxResponseTime = Math.max(this.maxResponseTime, time);
    
    // 🚀 0.5ms超過警告
    if (time > 0.5) {
      console.warn(`⚠️ Slow response: ${time.toFixed(3)}ms`);
    }
  }

  /**
   * 🚀 パフォーマンス統計取得
   */
  getPerformanceStats() {
    return {
      averageResponseTime: this.responseTimeCount > 0 
        ? (this.responseTimeSum / this.responseTimeCount) 
        : 0,
      maxResponseTime: this.maxResponseTime,
      cacheHitRate: UltraPredictionCache.getHitRate(),
      totalProcessed: this.responseTimeCount
    };
  }

  /**
   * 🚀 クリーンアップ
   */
  destroy() {
    // イベントリスナー削除
    // キャンバス削除
    this.container.removeChild(this.canvas);
    
    // オブジェクトプールに返却
    this.chars.forEach(char => CanvasCharPool.release(char));
    this.chars = [];
  }
}
