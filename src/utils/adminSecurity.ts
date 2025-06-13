/**
 * 管理者機能の設定
 * セキュリティ設定とアクセス制御
 */

/**
 * 管理者パネルが有効かどうかを判定
 * 本番環境では必ず false を返す
 */
export const isAdminEnabled = (): boolean => {
  // 本番環境では管理者機能を完全に無効化
  if (process.env.NODE_ENV === 'production') {
    return false;
  }
  
  // 開発環境でも環境変数で制御可能
  if (process.env.DISABLE_ADMIN === 'true') {
    return false;
  }
  
  // 開発環境でのみ有効
  return process.env.NODE_ENV === 'development';
};

/**
 * 管理者機能のアクセスログ
 */
export const logAdminAccess = (action: string, details?: unknown) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔐 [Admin] ${action}`, details || '');
  }
};

/**
 * セキュリティ警告の表示
 */
export const showSecurityWarning = () => {
  if (process.env.NODE_ENV !== 'development') {
    console.warn('🚨 [Security] Admin panel access attempted in production environment');
  }
};
