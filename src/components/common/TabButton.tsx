import React from 'react';
import styles from '../NewRankingScreen.module.css';

interface TabButtonProps {
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  tabIndex?: number;
  ariaLabel?: string;
}

const TabButton: React.FC<TabButtonProps> = ({
  active = false,
  children,
  onClick,
  className = '',
  tabIndex = 0,
  ariaLabel
}) => {
  const tabClass = [
    styles.difficultyTab,
    active ? styles.difficultyTabActive : styles.difficultyTabInactive,
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type="button"
      className={tabClass}
      onClick={onClick}
      tabIndex={tabIndex}
      aria-pressed={active}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
};

export default TabButton;
