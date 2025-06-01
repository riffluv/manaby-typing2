/**
 * 自動化されたパフォーマンステスト
 * 手動でゲームをプレイせずに、自動的にキー入力をシミュレートして
 * 現在の実装の正確なパフォーマンス測定を行う
 */

export class AutomatedPerformanceTest {
  private testSequence: string[] = [
    'a', 'i', 'u', 'e', 'o', // 母音テスト
    'k', 'a', 's', 'a', 't', 'a', // かさた行テスト
    'n', 'a', 'm', 'a', 'e', // なまえテスト
    'h', 'e', 'l', 'l', 'o', // Hello テスト
    'w', 'o', 'r', 'l', 'd' // World テスト
  ];
  
  private intervalMs = 150; // キー間隔（150ms = 400WPM相当）
  private isRunning = false;
  private results: any = null;

  /**
   * 自動パフォーマンステストを実行
   */
  async runAutomatedTest(): Promise<any> {
    if (this.isRunning) {
      throw new Error('テストは既に実行中です');
    }

    console.log('🤖 自動パフォーマンステスト開始');
    console.log(`📝 テストシーケンス: ${this.testSequence.join('')}`);
    console.log(`⏱️ キー間隔: ${this.intervalMs}ms (${Math.round(60000 / this.intervalMs * 5)}WPM相当)`);

    this.isRunning = true;
    
    // パフォーマンス測定開始
    PerformanceTestHelper.startCurrentImplementationTest();
    performanceMeasurer.startRecording();
    
    try {
      // キー入力シミュレーション実行
      await this.simulateKeySequence();
      
      // 測定結果取得
      const testHelperResults = PerformanceTestHelper.stopCurrentImplementationTest();
      const measurerResults = performanceMeasurer.stopRecording();
      
      this.results = {
        testHelper: testHelperResults,
        measurer: measurerResults,
        testInfo: {
          sequence: this.testSequence.join(''),
          keyCount: this.testSequence.length,
          intervalMs: this.intervalMs,
          estimatedWPM: Math.round(60000 / this.intervalMs * 5)
        }
      };
      
      console.log('✅ 自動パフォーマンステスト完了');
      this.printResults();
      
      return this.results;
      
    } catch (error) {
      console.error('❌ 自動テスト中にエラーが発生:', error);
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * キーシーケンスをシミュレート
   */
  private async simulateKeySequence(): Promise<void> {
    return new Promise((resolve) => {
      let keyIndex = 0;
      
      const simulateNextKey = () => {
        if (keyIndex >= this.testSequence.length) {
          console.log('🎯 キーシーケンス完了');
          resolve();
          return;
        }

        const key = this.testSequence[keyIndex];
        const timestamp = performance.now();
        
        // パフォーマンス測定用のキー記録
        performanceMeasurer.recordKeyDown(key, timestamp);
        
        // キーイベント生成とディスパッチ
        const keyEvent = new KeyboardEvent('keydown', {
          key: key,
          code: `Key${key.toUpperCase()}`,
          bubbles: true,
          cancelable: true,
          timeStamp: timestamp
        });
        
        // フォーカスされた要素またはdocumentにイベント送信
        const target = document.activeElement || document;
        target.dispatchEvent(keyEvent);
        
        console.log(`🔤 キー送信: ${key} (${keyIndex + 1}/${this.testSequence.length})`);
        
        keyIndex++;
        setTimeout(simulateNextKey, this.intervalMs);
      };
      
      // 最初のキーを送信
      simulateNextKey();
    });
  }

  /**
   * テスト結果を表示
   */
  private printResults(): void {
    if (!this.results) return;

    console.log('\n📊 ===== 自動パフォーマンステスト結果 =====');
    console.log('🎮 テスト情報:', this.results.testInfo);
    
    if (this.results.measurer) {
      const stats = this.results.measurer;
      console.log('\n⚡ パフォーマンス統計:');
      console.log(`  📈 平均遅延: ${stats.averageLatency?.toFixed(2) || 'N/A'}ms`);
      console.log(`  📉 最小遅延: ${stats.minLatency?.toFixed(2) || 'N/A'}ms`);
      console.log(`  📊 最大遅延: ${stats.maxLatency?.toFixed(2) || 'N/A'}ms`);
      console.log(`  📋 測定回数: ${stats.count || 0}`);
      console.log(`  🎯 typingmania-ref目標達成: ${stats.typingmaniaRefLevel ? '✅' : '❌'}`);
      
      // 性能評価
      const grade = this.getPerformanceGrade(stats);
      console.log(`  🏆 性能評価: ${grade}`);
    }
    
    console.log('\n🔧 改善推奨事項:');
    this.printRecommendations();
    console.log('=======================================\n');
  }

  /**
   * 性能グレード判定
   */
  private getPerformanceGrade(stats: any): string {
    const avg = stats.averageLatency || 999;
    const max = stats.maxLatency || 999;
    
    if (avg <= 3 && max <= 7) {
      return 'S級 - typingmania-ref超越レベル 🚀';
    } else if (avg <= 5 && max <= 10) {
      return 'A級 - typingmania-ref同等レベル 💎';
    } else if (avg <= 8 && max <= 15) {
      return 'B級 - 高速レベル ⚡';
    } else if (avg <= 12 && max <= 25) {
      return 'C級 - 標準レベル 📊';
    } else {
      return 'D級 - 改善要 ⚠️';
    }
  }

  /**
   * 改善推奨事項を表示
   */
  private printRecommendations(): void {
    if (!this.results?.measurer) {
      console.log('  測定データがありません');
      return;
    }

    const stats = this.results.measurer;
    const recommendations: string[] = [];

    if (stats.averageLatency > 5) {
      recommendations.push('📌 平均遅延が5msを超過 - 音声処理の最適化が必要');
    }
    
    if (stats.maxLatency > 10) {
      recommendations.push('📌 最大遅延が10msを超過 - AudioContext設定の見直しが必要');
    }
    
    if (stats.standardDeviation > 3) {
      recommendations.push('📌 遅延のばらつきが大きい - システム安定性の改善が必要');
    }

    if (stats.count < this.testSequence.length * 0.8) {
      recommendations.push('📌 測定データが不足 - イベント処理の確認が必要');
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ 優秀な性能です - typingmania-refレベルを達成');
    }

    recommendations.forEach(rec => console.log(`  ${rec}`));
  }

  /**
   * テスト設定をカスタマイズ
   */
  customize(options: {
    sequence?: string[];
    intervalMs?: number;
  }): void {
    if (options.sequence) {
      this.testSequence = options.sequence;
    }
    if (options.intervalMs) {
      this.intervalMs = options.intervalMs;
    }
  }

  /**
   * 最後のテスト結果を取得
   */
  getLastResults(): any {
    return this.results;
  }

  /**
   * 結果をCSV形式でエクスポート
   */
  exportResultsToCSV(): string {
    if (!this.results?.measurer?.measurements) {
      return '';
    }
    
    return performanceMeasurer.exportToCSV();
  }
}

// グローバルアクセス用インスタンス
const automatedTest = new AutomatedPerformanceTest();

// ブラウザ環境でグローバルアクセス可能にする
if (typeof window !== 'undefined') {
  (window as any).automatedPerformanceTest = automatedTest;
}

export default automatedTest;
