/**
 * パフォーマンスプロファイラー
 * 入力遅延の根本原因を特定するための詳細計測ツール
 */

export class PerformanceProfiler {
  private static measurements: Map<string, number[]> = new Map();
  private static isEnabled = true;

  /**
   * 計測開始
   */
  static start(label: string): number {
    if (!this.isEnabled) return 0;
    return performance.now();
  }

  /**
   * 計測終了と記録
   */
  static end(label: string, startTime: number): number {
    if (!this.isEnabled) return 0;
    
    const duration = performance.now() - startTime;
      if (!this.measurements.has(label)) {
      this.measurements.set(label, []);
    }
      this.measurements.get(label)!.push(duration);
      // 即座にコンソール出力（遅延特定用）
    if (duration > 5) { // 5ms以上の処理は警告（sub-5ms目標達成後の閾値）
      // console.warn(`⚠️ 遅延検出: ${label} = ${duration.toFixed(2)}ms`); // sub-5ms optimization: 警告出力除去
    }
    
    return duration;
  }

  /**
   * ワンライナー計測
   */
  static measure<T>(label: string, fn: () => T): T {
    const start = this.start(label);
    const result = fn();
    this.end(label, start);
    return result;
  }

  /**
   * 非同期処理計測
   */
  static async measureAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    const start = this.start(label);
    const result = await fn();
    this.end(label, start);
    return result;
  }

  /**
   * 統計情報取得
   */
  static getStats(label: string) {
    const measurements = this.measurements.get(label) || [];
    if (measurements.length === 0) {
      return null;
    }

    const sorted = [...measurements].sort((a, b) => a - b);
    const count = measurements.length;
    const sum = measurements.reduce((a, b) => a + b, 0);
    const mean = sum / count;
    const median = sorted[Math.floor(count / 2)];
    const min = sorted[0];
    const max = sorted[count - 1];

    return {
      count,
      mean: Number(mean.toFixed(3)),
      median: Number(median.toFixed(3)),
      min: Number(min.toFixed(3)),
      max: Number(max.toFixed(3)),
      total: Number(sum.toFixed(3))
    };
  }

  /**
   * 全ての統計情報を取得
   */
  static getAllStats() {
    const result: Record<string, any> = {};
    for (const [label] of this.measurements) {
      result[label] = this.getStats(label);
    }
    return result;
  }

  /**
   * 計測データをクリア
   */
  static clear(label?: string) {
    if (label) {
      this.measurements.delete(label);
    } else {
      this.measurements.clear();
    }
  }

  /**
   * プロファイリング有効/無効切り替え
   */
  static setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }
}

// グローバルアクセス用（開発時のデバッグ用）
if (typeof window !== 'undefined') {
  (window as any).PerformanceProfiler = PerformanceProfiler;
}
