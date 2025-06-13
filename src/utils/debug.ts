/**
 * デバッグユーティリティ
 * manabytypeII デバッグシステム
 */

// 開発環境でのみデバッグログを出力
const isDevelopment = process.env.NODE_ENV === 'development';

export const debug = {
  log: (...args: unknown[]) => {
    if (isDevelopment) {
      console.log('[DEBUG]', ...args);
    }
  },
  
  warn: (...args: unknown[]) => {
    if (isDevelopment) {
      console.warn('[DEBUG-WARN]', ...args);
    }  },
  
  error: (...args: unknown[]) => {
    if (isDevelopment) {
      console.error('[DEBUG-ERROR]', ...args);
    }
  },
  
  performance: <T>(fn: () => T): T => {
    // 🚀 ZERO-LATENCY: パフォーマンス測定無効化、直接実行
    return fn();
  },

  time: () => {
    // 🚀 ZERO-LATENCY: time系ログ完全無効化
  },
  
  timeEnd: () => {
    // 🚀 ZERO-LATENCY: timeEnd系ログ完全無効化
  },
    // 🚀 HyperTypingEngine用のタイピングデバッグ機能 (完全パフォーマンス最優先)
  typing: {
    log: () => {
      // 🚀 完全no-op - 詰まり防止のため一切のログを出力しない
    },
    
    performance: <T>(fn: () => T): T => {
      // 🚀 完全パフォーマンス最優先: 一切の計測なしで即座に実行
      return fn();
    },
      cache: () => {
      // 🚀 完全no-op - キャッシュログ無効化
    },
    
    optimization: () => {
      // 🚀 完全no-op - 最適化ログ無効化
    },
    
    branch: () => {
      // 🚀 完全no-op - 分岐ログ無効化（詰まりの最大原因）
    },
    
    idle: () => {
      // 🚀 完全no-op - アイドル処理ログ無効化
    },
      prediction: () => {
      // 🚀 完全no-op - 予測処理ログ無効化
    }
  }
};

export default debug;
