import { useEffect } from 'react';

export type ShortcutConfig = {
  key: string; // 例: 'r', 'Escape', ' ' (Space)
  altKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  allowInputFocus?: boolean; // trueならinput/textarea/selectでも発火
  handler: (e: KeyboardEvent) => void;
};

/**
 * グローバルショートカット管理フック
 * @returns 登録・解除関数
 */
export function useGlobalShortcuts(shortcuts: ShortcutConfig[], deps: any[] = []) {  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 入力系要素へのフォーカス時はデフォルトで無効化
      const tag = (e.target as HTMLElement)?.tagName;
      const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (e.target as HTMLElement)?.isContentEditable;
      for (const sc of shortcuts) {
        if (
          (sc.key.length === 1 ? e.key.toLowerCase() === sc.key.toLowerCase() : e.key === sc.key) &&
          (!!sc.altKey === e.altKey) &&
          (!!sc.ctrlKey === e.ctrlKey) &&
          (!!sc.metaKey === e.metaKey) &&
          (!!sc.shiftKey === e.shiftKey)
        ) {
          if (!sc.allowInputFocus && isInput) return;
          sc.handler(e);
          break;
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
