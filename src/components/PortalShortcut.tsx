import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';

/**
 * ポータルを使用したショートカット表示コンポーネント
 * DOMツリー上の固定された位置に直接レンダリング
 * monkeytype × THE FINALS サイバーパンク美学
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
    <div className="shortcut-container">
      {shortcuts.map((s, i) => (
        <span className="shortcut-item" key={i}>
          {Array.isArray(s.key)
            ? s.key.map((k, j) => (
                <React.Fragment key={j}>
                  <kbd className="shortcut-key">{k}</kbd>
                  {j < s.key.length - 1 && <span className="shortcut-plus">+</span>}
                </React.Fragment>
              ))
            : <kbd className="shortcut-key">{s.key}</kbd>
          }
          <span className="shortcut-label">{s.label}</span>
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
