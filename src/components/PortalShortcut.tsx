import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import styles from '@/styles/MinimalShortcut.module.css';

/**
 * ポータルを使用したショートカット表示コンポーネント
 * DOMツリー上の固定された位置に直接レンダリングし、
 * 初期位置ずれを防ぐ
 */
type Shortcut = { key: string | string[]; label: string };
interface PortalShortcutProps {
  shortcuts: Shortcut[];
}

const PortalShortcut: React.FC<PortalShortcutProps> = ({ shortcuts }) => {
  const [mounted, setMounted] = useState(false);
  const portalRef = useRef<HTMLDivElement | null>(null);
  
  useEffect(() => {
    // マウント時に処理を実行
    if (typeof document !== 'undefined') {
      // ポータル用のコンテナを取得または作成
      let container = document.getElementById('shortcut-portal-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'shortcut-portal-container';
        document.body.appendChild(container);
      }
      portalRef.current = container as HTMLDivElement;
      setMounted(true);
    }
    
    // アンマウント時の処理
    return () => {
      setMounted(false);
    };
  }, []);
  
  // ショートカット表示のコンテンツ
  const content = (
    <div className={styles.minimalShortcut}>
      {shortcuts.map((s, i) => (
        <span className={styles.shortcutItem} key={i}>
          {Array.isArray(s.key)
            ? s.key.map((k, j) => (
                <React.Fragment key={j}>
                  <kbd className={styles.key}>{k}</kbd>
                  {j < s.key.length - 1 && <span className={styles.plus}>+</span>}
                </React.Fragment>
              ))
            : <kbd className={styles.key}>{s.key}</kbd>
          }
          <span className={styles.label}>{s.label}</span>
        </span>
      ))}
    </div>
  );
  
  // クライアントサイドでのみポータル作成
  if (!mounted || !portalRef.current) return null;
  
  // 固定された位置にポータル経由でレンダリング
  return createPortal(content, portalRef.current);
};

export default PortalShortcut;
