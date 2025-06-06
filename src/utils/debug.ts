/**
 * デバッグユーティリティ
 * manabytypeII デバッグシステム
 */

// 開発環境でのみデバッグログを出力
const isDevelopment = process.env.NODE_ENV === 'development';

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

  // HyperTypingEngine用のタイピングデバッグ機能
  typing: {
    log: (...args: any[]) => {
      if (isDevelopment) {
        console.log('[TYPING DEBUG]', ...args);
      }
    },
    
    performance: (label: string, fn: () => any) => {
      if (isDevelopment) {
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        console.log(`[TYPING PERFORMANCE] ${label}: ${(end - start).toFixed(3)}ms`);
        return result;
      }
      return fn();
    },
    
    cache: (...args: any[]) => {
      if (isDevelopment) {
        console.log('[TYPING CACHE]', ...args);
      }
    },
      optimization: (...args: any[]) => {
      if (isDevelopment) {
        console.log('[TYPING OPTIMIZATION]', ...args);
      }
    },
    
    branch: (...args: any[]) => {
      if (isDevelopment) {
        console.log('[TYPING BRANCH]', ...args);
      }
    }
  }
};

export default debug;
