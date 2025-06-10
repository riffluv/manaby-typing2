/**
 * デバッグユーティリティ
 * manabytypeII デバッグシステム
 */

// 開発環境でのみデバッグログを出力
const isDevelopment = process.env.NODE_ENV === 'development';
// 🚀 詰まり防止: タイピングデバッグを完全無効化 (パフォーマンス最優先)
const enableTypingDebug = false; // 完全無効化で詰まり解消

export const debug = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log('[DEBUG]', ...args);
    }
  },
  
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn('[DEBUG-WARN]', ...args);
    }
  },
    error: (...args: any[]) => {
    if (isDevelopment) {
      console.error('[DEBUG-ERROR]', ...args);
    }
  },
  
  performance: (label: string, fn: () => any) => {
    // 🚀 ZERO-LATENCY: パフォーマンス測定無効化、直接実行
    return fn();
  },  time: (label: string) => {
    // 🚀 ZERO-LATENCY: time系ログ完全無効化
  },
  
  timeEnd: (label: string) => {
    // 🚀 ZERO-LATENCY: timeEnd系ログ完全無効化
  },
  
  // 🚀 HyperTypingEngine用のタイピングデバッグ機能 (完全パフォーマンス最優先)
  typing: {
    log: (...args: any[]) => {
      // 🚀 完全no-op - 詰まり防止のため一切のログを出力しない
    },
    
    performance: (label: string, fn: () => any) => {
      // 🚀 完全パフォーマンス最優先: 一切の計測なしで即座に実行
      return fn();
    },
    
    cache: (...args: any[]) => {
      // 🚀 完全no-op - キャッシュログ無効化
    },
    
    optimization: (...args: any[]) => {
      // 🚀 完全no-op - 最適化ログ無効化
    },
    
    branch: (...args: any[]) => {
      // 🚀 完全no-op - 分岐ログ無効化（詰まりの最大原因）
    },
    
    idle: (...args: any[]) => {
      // 🚀 完全no-op - アイドル処理ログ無効化
    },
    
    prediction: (...args: any[]) => {
      // 🚀 完全no-op - 予測処理ログ無効化
    }
  }
};

export default debug;
