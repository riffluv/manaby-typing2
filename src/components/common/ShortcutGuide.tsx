'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ShortcutItem {
  key: string | string[];
  description: string;
  enabled: boolean;
  category?: 'game' | 'navigation' | 'system';
  note?: string;
}

interface ShortcutGuideProps {
  currentScreen: 'menu' | 'game' | 'result' | 'ranking';
  className?: string;
  variant?: 'footer' | 'overlay' | 'sidebar';
  compact?: boolean;
}

const ShortcutGuide: React.FC<ShortcutGuideProps> = ({
  currentScreen,
  className,
  variant = 'footer',
  compact = false
}) => {  const getShortcuts = (screen: string): ShortcutItem[] => {
    const baseShortcuts: ShortcutItem[] = [
      {
        key: 'Space',
        description: 'ゲーム開始',
        enabled: screen === 'menu',
        category: 'game',
        note: screen !== 'menu' ? 'メニュー画面でのみ利用可能' : undefined
      },
      {
        key: ['Alt', 'R'],
        description: 'ランキング',
        enabled: screen === 'menu' || screen === 'result',
        category: 'navigation',
        note: screen === 'game' || screen === 'ranking' ? 'メニューまたはリザルト画面でのみ利用可能' : undefined
      },
      {
        key: 'R',
        description: 'リトライ',
        enabled: screen === 'result',
        category: 'game',
        note: screen !== 'result' ? 'リザルト画面でのみ利用可能' : undefined
      },
      {
        key: 'Escape',
        description: '戻る',
        enabled: screen === 'game' || screen === 'result' || screen === 'ranking',
        category: 'navigation',
        note: screen === 'menu' ? 'サブ画面でのみ利用可能' : undefined
      }
    ];

    return baseShortcuts;
  };

  const shortcuts = getShortcuts(currentScreen);

  const renderKey = (key: string | string[]) => {
    if (Array.isArray(key)) {
      return (
        <div className="flex items-center gap-1">
          {key.map((k, index) => (
            <React.Fragment key={k}>
              <kbd className="kbd-key">{k}</kbd>
              {index < key.length - 1 && (
                <span className="text-neutral-500 text-xs">+</span>
              )}
            </React.Fragment>
          ))}
        </div>
      );
    }
    return <kbd className="kbd-key">{key}</kbd>;
  };

  const variantClasses = {
    footer: 'bg-neutral-900/95 backdrop-blur-sm border-t border-neutral-800',
    overlay: 'bg-neutral-900/90 backdrop-blur-md rounded-lg border border-neutral-700',
    sidebar: 'bg-transparent'
  };
  if (compact) {
    return (
      <div className={cn(
        'shortcut-guide-compact flex items-center gap-3 px-4 py-2 text-xs',
        variantClasses[variant],
        className
      )}>        {shortcuts.filter(s => s.enabled).map((shortcut, index) => (
          <div key={index} className={cn(
            'shortcut-container',
            `shortcut-category-${shortcut.category}`
          )}>
            {renderKey(shortcut.key)}
            <span className="text-gray-300">{shortcut.description}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn(
      'px-6 py-4',
      variantClasses[variant],
      className
    )}>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap gap-x-8 gap-y-3 items-center justify-center">          {shortcuts.map((shortcut, index) => (
            <div
              key={index}              className={cn(
                'shortcut-container transition-all duration-200',
                `shortcut-category-${shortcut.category}`,
                shortcut.enabled 
                  ? 'opacity-100' 
                  : 'opacity-60 cursor-not-allowed shortcut-disabled'
              )}
              title={shortcut.note}
            >
              {renderKey(shortcut.key)}
              <span className={cn(
                'text-xs font-medium',
                shortcut.enabled 
                  ? 'text-gray-200' 
                  : 'text-gray-500'
              )}>
                {shortcut.description}
              </span>
              {shortcut.note && !shortcut.enabled && (
                <span className="text-xs text-gray-600 italic ml-1">
                  ({shortcut.note})
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShortcutGuide;
