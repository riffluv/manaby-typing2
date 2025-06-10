/**
 * HybridTypingEngine パフォーマンス比較テスト
 * 過度な最適化による逆効果を検証
 */

export class PerformanceComparison {
  private static measurements: { [key: string]: number[] } = {};

  // 🔬 測定開始
  static startMeasure(label: string): number {
    return performance.now();
  }

  // 🔬 測定終了・記録
  static endMeasure(label: string, startTime: number): number {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    if (!this.measurements[label]) {
      this.measurements[label] = [];
    }
    this.measurements[label].push(duration);
    
    return duration;
  }

  // 📊 統計取得
  static getStats(label: string) {
    const measures = this.measurements[label] || [];
    if (measures.length === 0) return null;

    const sorted = [...measures].sort((a, b) => a - b);
    const avg = measures.reduce((a, b) => a + b, 0) / measures.length;
    const median = sorted[Math.floor(sorted.length / 2)];
    const min = Math.min(...measures);
    const max = Math.max(...measures);

    return {
      count: measures.length,
      average: avg.toFixed(3),
      median: median.toFixed(3),
      min: min.toFixed(3),
      max: max.toFixed(3),
      p95: sorted[Math.floor(sorted.length * 0.95)].toFixed(3)
    };
  }

  // 📈 全統計表示
  static logAllStats(): void {
    console.log('🔬 === Performance Comparison Results ===');
    Object.keys(this.measurements).forEach(label => {
      const stats = this.getStats(label);
      if (stats) {
        console.log(`📊 ${label}:`, stats);
      }
    });
  }

  // 🗑️ クリア
  static clear(): void {
    this.measurements = {};
  }
}

/**
 * Canvas描画方式の比較テスト
 */
export class CanvasRenderingComparison {
  
  // 🚀 現在の「最適化版」描画
  static optimizedRender(ctx: CanvasRenderingContext2D, chars: any[]): void {
    const start = PerformanceComparison.startMeasure('Optimized Render');
    
    // 変更文字のフィルタリング
    const changedChars = chars.filter(char => char.shouldRedraw());
    if (changedChars.length === 0) {
      PerformanceComparison.endMeasure('Optimized Render', start);
      return;
    }

    // 部分クリア
    changedChars.forEach(char => {
      if (char.shouldClear()) {
        const bounds = char.getBounds();
        ctx.clearRect(bounds.x, bounds.y, bounds.width, bounds.height);
      }
    });

    // 変更文字のみ描画
    changedChars.forEach(char => {
      ctx.fillStyle = char.getColor();
      ctx.fillText(char.character, char.x, char.y);
      char.markRedrawn();
    });
    
    PerformanceComparison.endMeasure('Optimized Render', start);
  }

  // 🔧 シンプル版描画（比較用）
  static simpleRender(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, chars: any[]): void {
    const start = PerformanceComparison.startMeasure('Simple Render');
    
    // 全画面クリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 全文字描画
    chars.forEach(char => {
      ctx.fillStyle = char.getColor();
      ctx.fillText(char.character, char.x, char.y);
    });
    
    PerformanceComparison.endMeasure('Simple Render', start);
  }
}
