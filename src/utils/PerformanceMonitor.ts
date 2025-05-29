/**
 * パフォーマンス監視ユーティリティ（typingmania-ref流）
 * タイピングゲーム最適化のための性能測定・監視ツール
 */

export interface PerformanceMetrics {
  inputLatency: number;
  renderTime: number;
  frameRate: number;
  memoryUsage: number;
  domUpdateCount: number;
}

export interface TypingPerformanceData {
  timestamp: number;
  keystroke: string;
  inputToRenderDelay: number;
  totalRenderTime: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    inputLatency: 0,
    renderTime: 0,
    frameRate: 60,
    memoryUsage: 0,
    domUpdateCount: 0
  };

  private typingData: TypingPerformanceData[] = [];
  private frameCount = 0;
  private lastFrameTime = 0;
  private observer: PerformanceObserver | null = null;

  constructor() {
    this.initPerformanceObserver();
    this.startFrameRateMonitoring();
  }

  /**
   * Performance Observer 初期化
   */
  private initPerformanceObserver() {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'measure') {
            this.metrics.renderTime = entry.duration;
          }
        }
      });
      
      try {
        this.observer.observe({ entryTypes: ['measure'] });
      } catch (e) {
        console.warn('Performance Observer not supported:', e);
      }
    }
  }

  /**
   * フレームレート監視開始
   */
  private startFrameRateMonitoring() {
    if (typeof window === 'undefined') return;

    const measureFrameRate = (timestamp: number) => {
      if (this.lastFrameTime) {
        const delta = timestamp - this.lastFrameTime;
        this.frameCount++;
        
        if (this.frameCount >= 60) {
          this.metrics.frameRate = Math.round(1000 / (delta));
          this.frameCount = 0;
        }
      }
      this.lastFrameTime = timestamp;
      requestAnimationFrame(measureFrameRate);
    };

    requestAnimationFrame(measureFrameRate);
  }

  /**
   * タイピング入力のパフォーマンス計測開始
   */
  public startInputMeasurement(keystroke: string): number {
    const timestamp = performance.now();
    performance.mark('input-start');
    return timestamp;
  }

  /**
   * レンダリング完了のパフォーマンス計測
   */
  public endRenderMeasurement(keystroke: string, inputTimestamp: number) {
    const renderEndTime = performance.now();
    performance.mark('render-end');
    
    try {
      performance.measure('input-to-render', 'input-start', 'render-end');
      
      const inputToRenderDelay = renderEndTime - inputTimestamp;
      
      this.typingData.push({
        timestamp: inputTimestamp,
        keystroke,
        inputToRenderDelay,
        totalRenderTime: this.metrics.renderTime
      });

      this.metrics.inputLatency = inputToRenderDelay;
      this.metrics.domUpdateCount++;
      
      // 過去100回分のデータのみ保持
      if (this.typingData.length > 100) {
        this.typingData.shift();
      }
    } catch (e) {
      console.warn('Performance measurement failed:', e);
    }
  }

  /**
   * メモリ使用量更新
   */
  public updateMemoryUsage() {
    if (typeof window !== 'undefined' && 'performance' in window && 'memory' in performance) {
      const memory = (performance as any).memory;
      this.metrics.memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
    }
  }

  /**
   * 現在のメトリクス取得
   */
  public getMetrics(): PerformanceMetrics {
    this.updateMemoryUsage();
    return { ...this.metrics };
  }

  /**
   * タイピングパフォーマンスデータ取得
   */
  public getTypingData(): TypingPerformanceData[] {
    return [...this.typingData];
  }

  /**
   * 平均入力遅延計算
   */
  public getAverageInputLatency(): number {
    if (this.typingData.length === 0) return 0;
    
    const total = this.typingData.reduce((sum, data) => sum + data.inputToRenderDelay, 0);
    return total / this.typingData.length;
  }

  /**
   * パフォーマンス統計取得
   */
  public getPerformanceStats() {
    const latencies = this.typingData.map(d => d.inputToRenderDelay);
    
    return {
      averageLatency: this.getAverageInputLatency(),
      minLatency: latencies.length > 0 ? Math.min(...latencies) : 0,
      maxLatency: latencies.length > 0 ? Math.max(...latencies) : 0,
      currentFrameRate: this.metrics.frameRate,
      memoryUsage: this.metrics.memoryUsage,
      totalDomUpdates: this.metrics.domUpdateCount
    };
  }

  /**
   * リセット
   */
  public reset() {
    this.typingData = [];
    this.metrics.domUpdateCount = 0;
    this.frameCount = 0;
  }

  /**
   * 破棄
   */
  public dispose() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}

// シングルトンインスタンス
export const performanceMonitor = new PerformanceMonitor();

/**
 * カスタムhook：パフォーマンス監視
 */
export function usePerformanceMonitor() {
  return {
    startInputMeasurement: performanceMonitor.startInputMeasurement.bind(performanceMonitor),
    endRenderMeasurement: performanceMonitor.endRenderMeasurement.bind(performanceMonitor),
    getMetrics: performanceMonitor.getMetrics.bind(performanceMonitor),
    getPerformanceStats: performanceMonitor.getPerformanceStats.bind(performanceMonitor),
    reset: performanceMonitor.reset.bind(performanceMonitor)
  };
}
