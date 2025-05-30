import React from 'react';

interface TabButtonProps {
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  tabIndex?: number;
  ariaLabel?: string;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

const TabButton: React.FC<TabButtonProps> = ({
  active = false,
  children,
  onClick,
  tabIndex = 0,
  ariaLabel,
  variant = 'secondary',
  disabled = false
}) => {
  // globals.cssのbtn-primary/btn-secondaryのみを使用
  const tabClass = [
    variant === 'primary' ? 'btn-primary' : 'btn-secondary',
    active && 'is-active', // active状態用（必要ならglobals.cssに.is-activeを追加）
    disabled && 'is-disabled'
  ].filter(Boolean).join(' ');

  return (
    <button
      type="button"
      className={tabClass}
      onClick={onClick}
      tabIndex={tabIndex}
      aria-pressed={active}
      aria-label={ariaLabel}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default TabButton;
