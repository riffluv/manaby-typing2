/**
 * パフォーマンステスト支援ツール
 * 現在の実装とPureTypingEngineの性能比較を行う
 */

import performanceMeasurer from './PerformanceMeasurer';

export class PerformanceTestHelper {
  private static instance: PerformanceTestHelper;
  private isTestingMode = false;
  private testResults: {
    current: any;
    pure: any;
  } = { current: null, pure: null };

  static getInstance() {
    if (!this.instance) {
      this.instance = new PerformanceTestHelper();
    }
    return this.instance;
  }
  /**
   * 現在の実装のパフォーマンステストを開始
   */
  startCurrentImplementationTest() {
    console.log('🚀 現在の実装のパフォーマンステスト開始');
    performanceMeasurer.startRecording();
    this.isTestingMode = true;
  }

  /**
   * リアルタイムパフォーマンス情報を取得
   */
  getCurrentPerformanceStats() {
    if (!this.isTestingMode) return null;
    
    return performanceMeasurer.getCurrentStats?.() || null;
  }

  /**
   * 現在の実装のパフォーマンステストを終了
   */
  stopCurrentImplementationTest() {
    if (!this.isTestingMode) return;
    
    const results = performanceMeasurer.stopRecording();
    this.testResults.current = results;
    this.isTestingMode = false;
    
    console.log('📊 現在の実装 測定結果:', results);
    console.log(performanceMeasurer.generateDetailedReport());
    
    return results;
  }

  /**
   * PureTypingEngineのテスト結果を記録（将来用）
   */
  recordPureEngineResults(results: any) {
    this.testResults.pure = results;
  }

  /**
   * 比較レポートを生成
   */
  generateComparisonReport() {
    if (!this.testResults.current) {
      return '現在の実装の測定結果がありません';
    }

    const current = this.testResults.current;
    const report = {
      '現在の実装': {
        '平均遅延': `${current.averageLatency?.toFixed(2) || 'N/A'}ms`,
        '最大遅延': `${current.maxLatency?.toFixed(2) || 'N/A'}ms`,
        '最小遅延': `${current.minLatency?.toFixed(2) || 'N/A'}ms`,
        'typingmania-ref目標達成': current.typingmaniaRefLevel ? '✅' : '❌'
      }
    };

    if (this.testResults.pure) {
      const pure = this.testResults.pure;
      report['PureTypingEngine'] = {
        '平均遅延': `${pure.averageLatency?.toFixed(2) || 'N/A'}ms`,
        '最大遅延': `${pure.maxLatency?.toFixed(2) || 'N/A'}ms`,
        '最小遅延': `${pure.minLatency?.toFixed(2) || 'N/A'}ms`,
        'typingmania-ref目標達成': pure.typingmaniaRefLevel ? '✅' : '❌'
      };

      // 改善度計算
      if (current.averageLatency && pure.averageLatency) {
        const improvement = ((current.averageLatency - pure.averageLatency) / current.averageLatency * 100);
        report['改善度'] = {
          '平均遅延改善': `${improvement.toFixed(1)}%`,
          '推奨': improvement > 20 ? '🚀 PureTypingEngine導入推奨' : '📊 現在の実装で十分'
        };
      }
    }

    return report;
  }

  /**
   * テスト用のキー入力シミュレーション（開発用）
   */
  simulateTypingTest(keys: string[], intervalMs = 100) {
    let keyIndex = 0;
    const simulate = () => {
      if (keyIndex >= keys.length) {
        console.log('✅ シミュレーションテスト完了');
        return;
      }

      const key = keys[keyIndex];
      const event = new KeyboardEvent('keydown', {
        key: key,
        code: `Key${key.toUpperCase()}`,
        bubbles: true,
        cancelable: true
      });

      document.dispatchEvent(event);
      keyIndex++;
      
      setTimeout(simulate, intervalMs);
    };

    console.log(`🎮 タイピングシミュレーション開始: ${keys.join('')}`);
    simulate();
  }
}

// グローバルアクセス用
declare global {
  interface Window {
    performanceTest: PerformanceTestHelper;
  }
}

if (typeof window !== 'undefined') {
  window.performanceTest = PerformanceTestHelper.getInstance();
}

export default PerformanceTestHelper.getInstance();
