import React from 'react';

/**
 * Monkeytypeクローン完全準拠のショートカット案内バー
 * https://github.com/harikarthik-s/Monkeytype-Clone のfooterを参考にデザイン
 */
export type Shortcut = { key: string; label: string };

const ShortcutFooter: React.FC<{ shortcuts: Shortcut[] }> = ({ shortcuts }) => (
  <div className="footerContainer">
    <div className="shortcutLayout">
      {shortcuts.map((sc, idx) => (
        <div
          key={idx}
          className="shortcutItem"
        >
          <span className="shortcutKey">
            {sc.key}
          </span>
          <span className="shortcutLabel">
            {sc.label}
          </span>
        </div>
      ))}
    </div>
  </div>
);

export default ShortcutFooter;
