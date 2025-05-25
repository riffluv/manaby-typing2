import React from 'react';
import styles from '@/styles/ShortcutFooter.module.css';

/**
 * Monkeytypeクローン完全準拠のショートカット案内バー
 * https://github.com/harikarthik-s/Monkeytype-Clone のfooterを参考にデザイン
 */
export type Shortcut = { key: string; label: string };

const ShortcutFooter: React.FC<{ shortcuts: Shortcut[] }> = ({ shortcuts }) => (
  <div className={styles.footer}>
    {shortcuts.map((sc, idx) => (
      <div
        key={idx}
        className={styles.shortcutContainer}
      >
        <span className={styles.shortcutKey}>
          {sc.key}
        </span>
        <span className={styles.shortcutLabel}>
          {sc.label}
        </span>
      </div>
    ))}
  </div>
);

export default ShortcutFooter;
