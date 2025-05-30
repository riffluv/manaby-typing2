// PerformanceMeasurer.js - typingmania-ref比較用パフォーマンス測定
'use client';

/**
 * WebAudio打撃音システムのパフォーマンス測定
 * typingmania-refとの反応速度比較を行うための測定ツール
 */
class PerformanceMeasurer {
  constructor() {
    this.measurements = [];
    this.isRecording = false;
    this.keyDownTimes = new Map();
    this.audioPlayTimes = new Map();
    this.maxMeasurements = 100; // 直近100回の測定を保持
  }

  // 測定開始
  startRecording() {
    this.isRecording = true;
    this.measurements = [];
    console.log('[Performance] 測定開始 - typingmania-ref比較モード');
  }

  // 測定停止
  stopRecording() {
    this.isRecording = false;
    console.log('[Performance] 測定停止');
    return this.getStatistics();
  }

  // キー押下時刻の記録
  recordKeyDown(key, timestamp = performance.now()) {
    if (!this.isRecording) return;
    
    this.keyDownTimes.set(key, timestamp);
  }

  // 音声再生時刻の記録
  recordAudioPlay(key, timestamp = performance.now()) {
    if (!this.isRecording) return;
    
    const keyDownTime = this.keyDownTimes.get(key);
    if (keyDownTime) {
      const latency = timestamp - keyDownTime;
      
      this.measurements.push({
        key: key,
        keyDownTime: keyDownTime,
        audioPlayTime: timestamp,
        latency: latency,
        timestamp: new Date().toISOString()
      });

      // 最大測定数を超えた場合は古いデータを削除
      if (this.measurements.length > this.maxMeasurements) {
        this.measurements.shift();
      }

      this.keyDownTimes.delete(key);
      
      // リアルタイム表示（10回毎）
      if (this.measurements.length % 10 === 0) {
        this.logCurrentStats();
      }
    }
  }

  // 現在の統計情報をログ出力
  logCurrentStats() {
    const stats = this.getStatistics();
    console.log(`[Performance] 現在の統計 (${this.measurements.length}回測定):`, {
      平均遅延: `${stats.averageLatency.toFixed(2)}ms`,
      最小遅延: `${stats.minLatency.toFixed(2)}ms`,
      最大遅延: `${stats.maxLatency.toFixed(2)}ms`,
      'typingmania-ref目標': '< 5ms',
      '達成状況': stats.averageLatency < 5 ? '✅ 達成' : '❌ 要改善'
    });
  }

  // 統計情報の計算
  getStatistics() {
    if (this.measurements.length === 0) {
      return {
        count: 0,
        averageLatency: 0,
        minLatency: 0,
        maxLatency: 0,
        standardDeviation: 0,
        typingmaniaRefLevel: false
      };
    }

    const latencies = this.measurements.map(m => m.latency);
    const sum = latencies.reduce((a, b) => a + b, 0);
    const average = sum / latencies.length;
    const min = Math.min(...latencies);
    const max = Math.max(...latencies);
    
    // 標準偏差計算
    const variance = latencies.reduce((sum, latency) => {
      return sum + Math.pow(latency - average, 2);
    }, 0) / latencies.length;
    const standardDeviation = Math.sqrt(variance);

    // typingmania-refレベル判定（平均5ms以下、最大10ms以下）
    const typingmaniaRefLevel = average <= 5 && max <= 10;

    return {
      count: this.measurements.length,
      averageLatency: average,
      minLatency: min,
      maxLatency: max,
      standardDeviation: standardDeviation,
      typingmaniaRefLevel: typingmaniaRefLevel,
      measurements: [...this.measurements] // コピーを返す
    };
  }

  // 詳細レポートの生成
  generateDetailedReport() {
    const stats = this.getStatistics();
    
    const report = {
      summary: {
        測定回数: stats.count,
        平均遅延: `${stats.averageLatency.toFixed(2)}ms`,
        最小遅延: `${stats.minLatency.toFixed(2)}ms`,
        最大遅延: `${stats.maxLatency.toFixed(2)}ms`,
        標準偏差: `${stats.standardDeviation.toFixed(2)}ms`,
        'typingmania-refレベル': stats.typingmaniaRefLevel ? '✅ 達成' : '❌ 要改善'
      },
      benchmark: {
        'typingmania-ref目標平均': '< 5ms',
        'typingmania-ref目標最大': '< 10ms',
        '現在の性能評価': this.getPerformanceGrade(stats)
      },
      recommendations: this.getRecommendations(stats)
    };

    return report;
  }

  // 性能グレードの判定
  getPerformanceGrade(stats) {
    if (stats.averageLatency <= 3 && stats.maxLatency <= 7) {
      return 'S級 - typingmania-ref超越レベル';
    } else if (stats.averageLatency <= 5 && stats.maxLatency <= 10) {
      return 'A級 - typingmania-ref同等レベル';
    } else if (stats.averageLatency <= 8 && stats.maxLatency <= 15) {
      return 'B級 - 高速レベル';
    } else if (stats.averageLatency <= 12 && stats.maxLatency <= 25) {
      return 'C級 - 標準レベル';
    } else {
      return 'D級 - 改善要';
    }
  }

  // 改善推奨事項の生成
  getRecommendations(stats) {
    const recommendations = [];

    if (stats.averageLatency > 5) {
      recommendations.push('平均遅延が5msを超過 - minInterval設定の見直しが必要');
    }
    
    if (stats.maxLatency > 10) {
      recommendations.push('最大遅延が10msを超過 - AudioContext最適化が必要');
    }
    
    if (stats.standardDeviation > 3) {
      recommendations.push('遅延のばらつきが大きい - システム安定性の改善が必要');
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ 優秀な性能です - typingmania-refレベルを達成');
    }

    return recommendations;
  }

  // 測定データのクリア
  clearMeasurements() {
    this.measurements = [];
    this.keyDownTimes.clear();
    this.audioPlayTimes.clear();
    console.log('[Performance] 測定データをクリアしました');
  }

  // CSV形式でデータをエクスポート
  exportToCSV() {
    if (this.measurements.length === 0) {
      return '';
    }

    const headers = ['Key', 'KeyDownTime', 'AudioPlayTime', 'Latency(ms)', 'Timestamp'];
    const csvData = [headers.join(',')];
    
    this.measurements.forEach(m => {
      csvData.push([
        m.key,
        m.keyDownTime.toFixed(3),
        m.audioPlayTime.toFixed(3),
        m.latency.toFixed(3),
        m.timestamp
      ].join(','));
    });

    return csvData.join('\n');
  }
}

// グローバルインスタンス
const performanceMeasurer = new PerformanceMeasurer();

export default performanceMeasurer;
