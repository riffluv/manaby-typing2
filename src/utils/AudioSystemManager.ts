/**
 * 音声システム統合マネージャー - シンプル化版
 * 重複システムを除去し、遅延を最小化
 */
'use client';

import OptimizedAudioSystem from './OptimizedAudioSystem';

// 音声システム設定（シンプル化）
export interface AudioSystemConfig {
  engine: 'current' | 'silent';  // optimizedを削除
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
   * 音声システム初期化（シンプル化版）
   */
  static async initialize() {
    if (this.isInitialized) return;

    try {      // 現在の実装のみ使用（遅延最小化）
      switch (this.config.engine) {
        case 'current':
          OptimizedAudioSystem.init();
          console.log('🔊 OptimizedAudioSystem初期化完了');
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
   * クリック音再生（シンプル化版）
   */
  static playClickSound() {
    if (!this.isInitialized) {
      this.initialize();
    }    switch (this.config.engine) {
      case 'current':
        OptimizedAudioSystem.playClickSound();
        break;
      case 'silent':
        // 音声なし
        break;
    }
  }

  /**
   * エラー音再生（シンプル化版）
   */
  static playErrorSound() {
    if (!this.isInitialized) {
      this.initialize();
    }    switch (this.config.engine) {
      case 'current':
        OptimizedAudioSystem.playErrorSound();
        break;
      case 'silent':
        // 音声なし
        break;
    }
  }

  /**
   * 成功音再生（シンプル化版）
   */
  static playSuccessSound() {
    if (!this.isInitialized) {
      this.initialize();
    }    switch (this.config.engine) {
      case 'current':
        OptimizedAudioSystem.playSuccessSound();
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
      engine: 'current',
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
   * 統計情報を取得（シンプル化版）
   */
  static getStats() {
    return {
      engine: this.config.engine,
      initialized: this.isInitialized,
      currentConfig: this.config
    };
  }
  /**
   * パフォーマンステスト用：シンプル化版（遅延測定のみ）
   */
  static async benchmarkEngines(testCount = 50) {
    console.log('🏁 音声システム遅延測定開始');
    
    const results = {
      current: await this.benchmarkEngine('current', testCount)
    };

    console.log('📊 遅延測定結果:');
    console.log(`  現在の実装: ${results.current.averageLatency.toFixed(2)}ms`);

    return { results, improvement: 0, improvementPercent: 0 };
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
