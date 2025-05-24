import React from 'react';

/**
 * Monkeytypeクローン完全準拠のショートカット案内バー
 * https://github.com/harikarthik-s/Monkeytype-Clone のfooterを参考にデザイン
 */
export type Shortcut = { key: string; label: string };

const ShortcutFooter: React.FC<{ shortcuts: Shortcut[] }> = ({ shortcuts }) => (
  <div className="fixed left-0 right-0 bottom-0 z-40 flex justify-center items-center gap-2 md:gap-4 bg-[#181A20]/95 text-gray-200 text-xs md:text-sm h-8 md:h-10 border-t border-[#23242b] select-none font-mono">
    {shortcuts.map((sc, idx) => (
      <div
        key={idx}
        className="flex items-center gap-1 md:gap-2 bg-[#23242b]/80 rounded px-2 py-0.5 md:px-3 md:py-1 shadow-sm border border-[#23242b]"
      >
        <span className="inline-block font-bold bg-[#23242b] text-amber-400 rounded px-1.5 py-0.5 text-xs md:text-sm tracking-wide mr-1 border border-[#23242b]">
          {sc.key}
        </span>
        <span className="text-gray-200 opacity-90 text-xs md:text-sm">
          {sc.label}
        </span>
      </div>
    ))}
  </div>
);

export default ShortcutFooter;
