/**
 * 🔍 Input Delay Performance Investigation Utilities
 * ブラウザコンソールで入力遅延調査を行うためのユーティリティ
 */

import { PerformanceProfiler } from './PerformanceProfiler';
import { globalBGMPlayer } from './BGMPlayer';

declare global {
  interface Window {
    performanceDebug: any;
  }
}

/**
 * パフォーマンス調査ユーティリティ
 */
export class PerformanceDebugUtils {
    /**
   * 🔍 BGM システム調査
   */
  static testBGMImpact() {
    // console.log('🔍 BGM システムの入力遅延への影響を調査中...'); // sub-5ms optimization
    
    // BGMを無効化
    globalBGMPlayer.setPerformanceDebugMode(true);
    
    // console.log('✅ BGM システムを無効化しました'); // sub-5ms optimization
    // console.log('📝 タイピングを行い、入力遅延を確認してください'); // sub-5ms optimization
    // console.log('📊 統計確認: window.performanceDebug.getStats()'); // sub-5ms optimization
  }

  /**
   * 🔍 BGM システム復旧
   */
  static restoreBGM() {
    // console.log('🔄 BGM システムを復旧中...'); // sub-5ms optimization
    
    // BGMを有効化
    globalBGMPlayer.setPerformanceDebugMode(false);
    
    // console.log('✅ BGM システムを復旧しました'); // sub-5ms optimization
  }
  /**
   * 📊 パフォーマンス統計表示
   */
  static getStats() {
    const stats = PerformanceProfiler.getAllStats();
    
    // console.log('📊 入力遅延パフォーマンス統計:'); // sub-5ms optimization
    // console.table(stats); // sub-5ms optimization
    
    // 重要な指標の分析
    if (stats['end_to_end_input_delay']) {
      const endToEnd = stats['end_to_end_input_delay'];
      // console.log(`🎯 End-to-End遅延: 平均 ${endToEnd.mean}ms, 最大 ${endToEnd.max}ms`); // sub-5ms optimization
      
      if (endToEnd.mean > 5) {
        // console.warn('⚠️ 目標の5ms以下を超過しています'); // sub-5ms optimization
      } else {
        // console.log('✅ 目標の5ms以下を達成しています'); // sub-5ms optimization
      }
    }

    if (stats['hyper_typing_process_key']) {
      const processKey = stats['hyper_typing_process_key'];
      // console.log(`⚡ HyperTypingEngine処理: 平均 ${processKey.mean}ms, 最大 ${processKey.max}ms`); // sub-5ms optimization
    }

    if (stats['react_render_complete']) {
      const reactRender = stats['react_render_complete'];
      // console.log(`⚛️ React渲染: 平均 ${reactRender.mean}ms, 最大 ${reactRender.max}ms`); // sub-5ms optimization
      
      if (reactRender.max > 10) {
        // console.warn('⚠️ React渲染で10ms以上の重い処理が検出されました'); // sub-5ms optimization
      }
    }

    return stats;
  }
  /**
   * 🗑️ 統計データクリア
   */
  static clearStats() {
    PerformanceProfiler.clear();
    // console.log('🗑️ パフォーマンス統計をクリアしました'); // sub-5ms optimization
  }

  /**
   * 🚀 自動パフォーマンステスト（30秒間計測）
   */
  static runAutomaticTest(duration: number = 30000) {
    // console.log(`🚀 自動パフォーマンステストを開始します（${duration/1000}秒間）`); // sub-5ms optimization
    // console.log('📝 この間にタイピングを行ってください'); // sub-5ms optimization
    
    // 統計をクリア
    PerformanceDebugUtils.clearStats();
    
    setTimeout(() => {
      // console.log('⏰ 自動テスト完了！'); // sub-5ms optimization
      PerformanceDebugUtils.getStats();
    }, duration);
  }

  /**
   * 🔧 React渲染最適化テスト
   */
  static testReactOptimization() {
    // console.log('🔧 React渲染最適化の効果を測定中...'); // sub-5ms optimization
    
    // React渲染関連の統計のみを表示
    const stats = PerformanceProfiler.getAllStats();
    const reactStats = Object.keys(stats)
      .filter(key => key.includes('react'))
      .reduce((obj, key) => {
        obj[key] = stats[key];
        return obj;
      }, {} as any);

    // console.table(reactStats); // sub-5ms optimization
    
    return reactStats;
  }
}

// ブラウザのwindowオブジェクトに追加
if (typeof window !== 'undefined') {
  window.performanceDebug = {
    testBGM: PerformanceDebugUtils.testBGMImpact,
    restoreBGM: PerformanceDebugUtils.restoreBGM,
    getStats: PerformanceDebugUtils.getStats,
    clear: PerformanceDebugUtils.clearStats,
    autoTest: PerformanceDebugUtils.runAutomaticTest,
    testReact: PerformanceDebugUtils.testReactOptimization
  };

  // console.log('🔍 パフォーマンス調査ツールを初期化しました:'); // sub-5ms optimization
  // console.log('📊 統計表示: window.performanceDebug.getStats()'); // sub-5ms optimization
  // console.log('🔍 BGMテスト: window.performanceDebug.testBGM()'); // sub-5ms optimization
  // console.log('🔄 BGM復旧: window.performanceDebug.restoreBGM()'); // sub-5ms optimization
  // console.log('🚀 自動テスト: window.performanceDebug.autoTest()'); // sub-5ms optimization
  // console.log('⚛️ React最適化テスト: window.performanceDebug.testReact()'); // sub-5ms optimization
}

export default PerformanceDebugUtils;
