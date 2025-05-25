import React from 'react';
import styles from '@/styles/MinimalShortcut.module.css';

/**
 * ゲーム画面用のミニマルなショートカット表示（Escキーのみ）
 */

type Shortcut = { key: string | string[]; label: string };
interface MinimalShortcutProps {
  shortcuts: Shortcut[];
}

const MinimalShortcut: React.FC<MinimalShortcutProps> = ({ shortcuts }) => (
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

export default MinimalShortcut;
