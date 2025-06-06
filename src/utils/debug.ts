/**
 * デバッグユーティリティ
 * manabytypeII デバッグシステム
 */

// 開発環境でのみデバッグログを出力
const isDevelopment = process.env.NODE_ENV === 'development';
const enableTypingDebug = isDevelopment && process.env.NEXT_PUBLIC_ENABLE_TYPING_DEBUG !== 'false';

export const debug = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log('[DEBUG]', ...args);
    }
  },
  
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn('[DEBUG WARN]', ...args);
    }
  },
  
  error: (...args: any[]) => {
    if (isDevelopment) {
      console.error('[DEBUG ERROR]', ...args);
    }
  },
  
  performance: (label: string, fn: () => any) => {
    if (isDevelopment) {
      const start = performance.now();
      const result = fn();
      const end = performance.now();
      console.log(`[PERFORMANCE] ${label}: ${(end - start).toFixed(3)}ms`);
      return result;
    }
    return fn();
  },
  
  time: (label: string) => {
    if (isDevelopment) {
      console.time(`[DEBUG TIME] ${label}`);
    }
  },
    timeEnd: (label: string) => {
    if (isDevelopment) {
      console.timeEnd(`[DEBUG TIME] ${label}`);
    }
  },
  // HyperTypingEngine用のタイピングデバッグ機能 (パフォーマンス最優先)
  typing: {
    log: () => {
      // no-op for maximum performance
    },
    
    performance: (label: string, fn: () => any) => {
      // パフォーマンス最優先: 条件分岐なしで即座に実行
      return fn();
    },
    
    cache: () => {
      // no-op for maximum performance
    },
    
    optimization: () => {
      // no-op for maximum performance  
    },
    
    branch: () => {
      // no-op for maximum performance
    }
  }
};

export default debug;
