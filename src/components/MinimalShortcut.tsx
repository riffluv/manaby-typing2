import React from 'react';
import styles from '@/styles/MinimalShortcut.module.css';

/**
 * ゲーム画面用のミニマルなショートカット表示（Escキーのみ）
 */
const MinimalShortcut: React.FC = () => {
  return (
    <div className={styles.minimalShortcut}>
      <kbd className={styles.key}>Esc</kbd>
      <span className={styles.label}>戻る</span>
    </div>
  );
};

export default MinimalShortcut;
