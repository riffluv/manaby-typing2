/**
 * デバッグユーティリティ
 * 環境変数による細やかなログ制御を提供
 */

const isDevelopment = process.env.NODE_ENV === 'development';
const isDebugEnabled = process.env.DEBUG === 'true';
const isTypingDebugEnabled = process.env.DEBUG_TYPING === 'true';

export const debug = {
  /**
   * 開発環境でのみconsole.logを実行
   */
  log: (...args: unknown[]) => {
    if (isDevelopment && isDebugEnabled) {
      console.log('[DEBUG]', ...args);
    }
  },

  /**
   * 開発環境でのみconsole.warnを実行
   */
  warn: (...args: unknown[]) => {
    if (isDevelopment) {
      console.warn('[WARN]', ...args);
    }
  },

  /**
   * 常にconsole.errorを実行（本番環境でもエラーは重要）
   */
  error: (...args: unknown[]) => {
    console.error('[ERROR]', ...args);
  },

  /**
   * タイピング関連のデバッグログ（詳細レベル）
   */
  typing: {
    log: (...args: unknown[]) => {
      if (isDevelopment && isTypingDebugEnabled) {
        console.log('⌨️ [TYPING]', ...args);
      }
    },
    
    branch: (...args: unknown[]) => {
      if (isDevelopment && isTypingDebugEnabled) {
        console.log('🌿 [BRANCH]', ...args);
      }
    },
    
    pattern: (...args: unknown[]) => {
      if (isDevelopment && isTypingDebugEnabled) {
        console.log('🎯 [PATTERN]', ...args);
      }
    }
  }
};
