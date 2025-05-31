/**
 * ⚡ 寿司打レベル タイピングパフォーマンス監視システム
 * 
 * リアルタイム応答時間測定・最適化ガイダンス提供
 */

interface PerformanceMetrics {
  keyToRenderTime: number;
  keyToCallbackTime: number;
  domUpdateTime: number;
  eventProcessingTime: number;
  totalResponseTime: number;
  inputLag: number;
  frameDrops: number;
  memoryUsage: number;
}

interface PerformanceThresholds {
  excellent: number;   // 寿司打レベル: < 1ms
  good: number;        // 良好: < 3ms
  acceptable: number;  // 許容: < 8ms
  poor: number;        // 問題: >= 8ms
}

export class TypingPerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private currentMetric: Partial<PerformanceMetrics> = {};
  private keyStartTime = 0;
  private isMonitoring = false;
  
  // 🎯 寿司打レベル閾値（1ms以下目標）
  private static readonly THRESHOLDS: PerformanceThresholds = {
    excellent: 1,    // 寿司打レベル
    good: 3,         // typingmania-ref レベル
    acceptable: 8,   // 一般的なタイピングゲーム
    poor: 16         // 問題レベル
  };

  private static readonly MAX_SAMPLES = 1000; // メモリ制限
  
  /**
   * ⚡ 監視開始
   */
  startMonitoring(): void {
    this.isMonitoring = true;
    this.metrics.length = 0;
    console.log('🚀 寿司打レベル パフォーマンス監視開始');
  }

  /**
   * ⚡ 監視停止
   */
  stopMonitoring(): void {
    this.isMonitoring = false;
    this.logPerformanceReport();
  }

  /**
   * ⚡ キー入力開始時刻記録
   */
  markKeyStart(): void {
    if (!this.isMonitoring) return;
    
    this.keyStartTime = performance.now();
    this.currentMetric = {};
  }

  /**
   * ⚡ DOM更新完了時刻記録
   */
  markDOMUpdateComplete(): void {
    if (!this.isMonitoring || this.keyStartTime === 0) return;
    
    const now = performance.now();
    this.currentMetric.domUpdateTime = now - this.keyStartTime;
  }

  /**
   * ⚡ コールバック完了時刻記録
   */
  markCallbackComplete(): void {
    if (!this.isMonitoring || this.keyStartTime === 0) return;
    
    const now = performance.now();
    this.currentMetric.keyToCallbackTime = now - this.keyStartTime;
  }

  /**
   * ⚡ レンダリング完了時刻記録
   */
  markRenderComplete(): void {
    if (!this.isMonitoring || this.keyStartTime === 0) return;
    
    const now = performance.now();
    this.currentMetric.keyToRenderTime = now - this.keyStartTime;
    this.currentMetric.totalResponseTime = now - this.keyStartTime;
    
    // メトリクス完了
    this.finalizeMetrics();
  }

  /**
   * ⚡ イベント処理時間記録
   */
  markEventProcessingTime(time: number): void {
    if (!this.isMonitoring) return;
    this.currentMetric.eventProcessingTime = time;
  }

  /**
   * ⚡ メトリクス確定
   */
  private finalizeMetrics(): void {
    const metric: PerformanceMetrics = {
      keyToRenderTime: this.currentMetric.keyToRenderTime || 0,
      keyToCallbackTime: this.currentMetric.keyToCallbackTime || 0,
      domUpdateTime: this.currentMetric.domUpdateTime || 0,
      eventProcessingTime: this.currentMetric.eventProcessingTime || 0,
      totalResponseTime: this.currentMetric.totalResponseTime || 0,
      inputLag: this.currentMetric.totalResponseTime || 0,
      frameDrops: 0, // 後で実装
      memoryUsage: this.getMemoryUsage()
    };

    this.metrics.push(metric);
    
    // メモリ制限
    if (this.metrics.length > TypingPerformanceMonitor.MAX_SAMPLES) {
      this.metrics.shift();
    }

    // リアルタイム警告
    this.checkPerformanceWarnings(metric);
    
    this.keyStartTime = 0;
    this.currentMetric = {};
  }

  /**
   * ⚡ パフォーマンス警告チェック
   */
  private checkPerformanceWarnings(metric: PerformanceMetrics): void {
    const threshold = TypingPerformanceMonitor.THRESHOLDS;
    
    if (metric.totalResponseTime > threshold.poor) {
      console.warn(`🐌 応答遅延検出: ${metric.totalResponseTime.toFixed(2)}ms (目標: ${threshold.excellent}ms)`);
    } else if (metric.totalResponseTime > threshold.acceptable) {
      console.warn(`⚠️ 応答やや遅延: ${metric.totalResponseTime.toFixed(2)}ms (寿司打レベル: ${threshold.excellent}ms)`);
    } else if (metric.totalResponseTime <= threshold.excellent) {
      console.log(`🚀 寿司打レベル達成: ${metric.totalResponseTime.toFixed(2)}ms`);
    }
  }

  /**
   * ⚡ メモリ使用量取得
   */
  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    return 0;
  }

  /**
   * ⚡ パフォーマンスレポート出力
   */
  private logPerformanceReport(): void {
    if (this.metrics.length === 0) {
      console.log('📊 パフォーマンスデータなし');
      return;
    }

    const totalResponse = this.metrics.map(m => m.totalResponseTime);
    const domUpdate = this.metrics.map(m => m.domUpdateTime);
    const eventProcessing = this.metrics.map(m => m.eventProcessingTime);

    const report = {
      サンプル数: this.metrics.length,
      総応答時間: {
        平均: this.average(totalResponse).toFixed(2) + 'ms',
        最小: Math.min(...totalResponse).toFixed(2) + 'ms',
        最大: Math.max(...totalResponse).toFixed(2) + 'ms',
        'P95': this.percentile(totalResponse, 95).toFixed(2) + 'ms'
      },
      DOM更新時間: {
        平均: this.average(domUpdate).toFixed(2) + 'ms',
        最小: Math.min(...domUpdate).toFixed(2) + 'ms',
        最大: Math.max(...domUpdate).toFixed(2) + 'ms'
      },
      イベント処理時間: {
        平均: this.average(eventProcessing).toFixed(2) + 'ms',
        最小: Math.min(...eventProcessing).toFixed(2) + 'ms',
        最大: Math.max(...eventProcessing).toFixed(2) + 'ms'
      },
      寿司打レベル判定: this.getPerformanceGrade(this.average(totalResponse))
    };

    console.table(report);
  }

  /**
   * ⚡ パフォーマンスグレード判定
   */
  private getPerformanceGrade(avgResponseTime: number): string {
    const threshold = TypingPerformanceMonitor.THRESHOLDS;
    
    if (avgResponseTime <= threshold.excellent) return '🚀 寿司打レベル (EXCELLENT)';
    if (avgResponseTime <= threshold.good) return '⚡ typingmania-ref レベル (GOOD)';
    if (avgResponseTime <= threshold.acceptable) return '✅ 一般的 (ACCEPTABLE)';
    return '🐌 要改善 (POOR)';
  }

  /**
   * ⚡ 平均値計算
   */
  private average(numbers: number[]): number {
    return numbers.reduce((a, b) => a + b, 0) / numbers.length;
  }

  /**
   * ⚡ パーセンタイル計算
   */
  private percentile(numbers: number[], p: number): number {
    const sorted = [...numbers].sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[index] || 0;
  }

  /**
   * ⚡ 現在のメトリクス取得
   */
  getCurrentMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  /**
   * ⚡ リアルタイム統計取得
   */
  getRealTimeStats(): { avgResponseTime: number; grade: string } | null {
    if (this.metrics.length === 0) return null;
    
    const recent = this.metrics.slice(-50); // 直近50サンプル
    const avgResponseTime = this.average(recent.map(m => m.totalResponseTime));
    
    return {
      avgResponseTime,
      grade: this.getPerformanceGrade(avgResponseTime)
    };
  }
}

// ⚡ シングルトン監視システム
export const typingPerformanceMonitor = new TypingPerformanceMonitor();
