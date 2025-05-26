"use client";

import React, { useEffect, useState } from 'react';
import styles from '@/styles/MinimalShortcut.module.css';

/**
 * ゲーム画面用のミニマルなショートカット表示
 * ページ初期表示時の位置ずれ対策済み
 */

type Shortcut = { key: string | string[]; label: string };
interface MinimalShortcutProps {
  shortcuts: Shortcut[];
}

const MinimalShortcut: React.FC<MinimalShortcutProps> = ({ shortcuts }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  // マウント後に表示することで初期レンダリング時の位置ズレを防止
  useEffect(() => {
    // 次のフレームで表示
    const timer = requestAnimationFrame(() => {
      setIsVisible(true);
    });
    return () => cancelAnimationFrame(timer);
  }, []);

  return (
    <div 
      className={`${styles.minimalShortcut} ${isVisible ? styles.visible : styles.hidden}`}
      style={{ 
        opacity: isVisible ? 1 : 0,
        transform: `translateY(${isVisible ? '0' : '15px'}) translateZ(0)`
      }}
    >
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
};

export default MinimalShortcut;
