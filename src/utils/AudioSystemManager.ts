/**
 * 音声システム統合マネージャー
 * 現在の実装と最適化版を切り替え可能にし、段階的な導入をサポート
 */
'use client';

import UnifiedAudioSystem from './UnifiedAudioSystem';
import OptimizedTypingAudio from './OptimizedTypingAudio';

// 音声システム設定
export interface AudioSystemConfig {
  engine: 'current' | 'optimized' | 'silent';
  enablePerformanceMeasurement: boolean;
  enableConsoleLogging: boolean;
}

// デフォルト設定（段階的導入のため）
const DEFAULT_CONFIG: AudioSystemConfig = {
  engine: 'current', // まずは現在の実装のまま
  enablePerformanceMeasurement: true,
  enableConsoleLogging: false, // パフォーマンス向上のためログ無効化
};

class AudioSystemManager {
  private static config: AudioSystemConfig = { ...DEFAULT_CONFIG };
  private static isInitialized = false;

  /**
   * 音声システム設定を更新
   */
  static configure(newConfig: Partial<AudioSystemConfig>) {
    this.config = { ...this.config, ...newConfig };
    
    if (!this.config.enableConsoleLogging) {
      // コンソールログを無効化してパフォーマンス向上
      this.disableAudioLogging();
    }
    
    console.log('🔧 AudioSystemManager設定更新:', this.config);
  }

  /**
   * 音声システム初期化
   */
  static async initialize() {
    if (this.isInitialized) return;

    try {
      // 選択されたエンジンを初期化
      switch (this.config.engine) {
        case 'optimized':
          OptimizedTypingAudio.init();
          console.log('🚀 OptimizedTypingAudio初期化完了');
          break;
        case 'current':
          await UnifiedAudioSystem.initialize();
          console.log('🔊 UnifiedAudioSystem初期化完了');
          break;
        case 'silent':
          console.log('🔇 音声無効モード');
          break;
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('❌ 音声システム初期化失敗:', error);
      // フォールバックとしてsilentモードに切り替え
      this.config.engine = 'silent';
      this.isInitialized = true;
    }
  }

  /**
   * クリック音再生（統合インターフェース）
   */
  static playClickSound() {
    if (!this.isInitialized) {
      this.initialize();
    }

    switch (this.config.engine) {
      case 'optimized':
        OptimizedTypingAudio.playClick();
        break;
      case 'current':
        UnifiedAudioSystem.playClickSound();
        break;
      case 'silent':
        // 音声なし
        break;
    }
  }

  /**
   * エラー音再生（統合インターフェース）
   */
  static playErrorSound() {
    if (!this.isInitialized) {
      this.initialize();
    }

    switch (this.config.engine) {
      case 'optimized':
        OptimizedTypingAudio.playError();
        break;
      case 'current':
        UnifiedAudioSystem.playErrorSound();
        break;
      case 'silent':
        // 音声なし
        break;
    }
  }

  /**
   * 成功音再生（統合インターフェース）
   */
  static playSuccessSound() {
    if (!this.isInitialized) {
      this.initialize();
    }

    switch (this.config.engine) {
      case 'optimized':
        OptimizedTypingAudio.playSuccess();
        break;
      case 'current':
        UnifiedAudioSystem.playSuccessSound();
        break;
      case 'silent':
        // 音声なし
        break;
    }
  }

  /**
   * 現在の設定を取得
   */
  static getConfig(): AudioSystemConfig {
    return { ...this.config };
  }

  /**
   * 音声エンジンの切り替え（リアルタイム）
   */
  static switchEngine(engine: AudioSystemConfig['engine']) {
    console.log(`🔄 音声エンジン切り替え: ${this.config.engine} → ${engine}`);
    
    this.config.engine = engine;
    this.isInitialized = false; // 再初期化を促す
    
    // 即座に初期化
    this.initialize();
  }

  /**
   * パフォーマンスモード切り替え（遅延を最小化）
   */
  static enablePerformanceMode() {
    this.configure({
      engine: 'optimized',
      enableConsoleLogging: false,
      enablePerformanceMeasurement: false
    });
    console.log('⚡ パフォーマンスモード有効化');
  }

  /**
   * デバッグモード切り替え（詳細ログ有効）
   */
  static enableDebugMode() {
    this.configure({
      enableConsoleLogging: true,
      enablePerformanceMeasurement: true
    });
    console.log('🐛 デバッグモード有効化');
  }

  /**
   * 音声ログを無効化してパフォーマンス向上
   */
  private static disableAudioLogging() {
    // console.logの一時的な無効化（音声関連のみ）
    const originalConsoleLog = console.log;
    console.log = (...args: any[]) => {
      const message = args.join(' ');
      // 音声関連のログをフィルタリング
      if (!message.includes('[AudioPerformance]') && 
          !message.includes('[UltraFast]') && 
          !message.includes('[WebAudioOnly]')) {
        originalConsoleLog.apply(console, args);
      }
    };
  }

  /**
   * 統計情報を取得
   */
  static getStats() {
    return {
      engine: this.config.engine,
      initialized: this.isInitialized,
      optimizedReady: OptimizedTypingAudio.isReady(),
      currentConfig: this.config
    };
  }

  /**
   * パフォーマンステスト用：エンジン比較
   */
  static async benchmarkEngines(testCount = 50) {
    console.log('🏁 音声エンジンベンチマーク開始');
    
    const results = {
      current: await this.benchmarkEngine('current', testCount),
      optimized: await this.benchmarkEngine('optimized', testCount)
    };

    const improvement = results.current.averageLatency - results.optimized.averageLatency;
    const improvementPercent = (improvement / results.current.averageLatency * 100);

    console.log('📊 ベンチマーク結果:');
    console.log(`  現在の実装: ${results.current.averageLatency.toFixed(2)}ms`);
    console.log(`  最適化版: ${results.optimized.averageLatency.toFixed(2)}ms`);
    console.log(`  改善度: ${improvement.toFixed(2)}ms (${improvementPercent.toFixed(1)}%)`);

    return { results, improvement, improvementPercent };
  }

  /**
   * 単一エンジンのベンチマーク
   */
  private static async benchmarkEngine(engine: AudioSystemConfig['engine'], testCount: number) {
    const originalEngine = this.config.engine;
    this.switchEngine(engine);

    const measurements: number[] = [];

    for (let i = 0; i < testCount; i++) {
      const startTime = performance.now();
      this.playClickSound();
      const endTime = performance.now();
      
      measurements.push(endTime - startTime);
      
      // 短時間待機
      await new Promise(resolve => setTimeout(resolve, 20));
    }

    // 元のエンジンに戻す
    this.switchEngine(originalEngine);

    const averageLatency = measurements.reduce((a, b) => a + b, 0) / measurements.length;
    const minLatency = Math.min(...measurements);
    const maxLatency = Math.max(...measurements);

    return {
      engine,
      averageLatency,
      minLatency,
      maxLatency,
      measurements: measurements.length
    };
  }
}

// グローバルアクセス用
if (typeof window !== 'undefined') {
  (window as any).audioSystemManager = AudioSystemManager;
}

export default AudioSystemManager;
