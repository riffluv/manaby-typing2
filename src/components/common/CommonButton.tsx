import React from 'react';
import styles from '../NewRankingScreen.module.css';

interface CommonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

const CommonButton: React.FC<CommonButtonProps> = ({
  variant = 'primary',
  children,
  className = '',
  ...props
}) => {
  const btnClass = [
    variant === 'primary' ? 'btn-primary' : styles.difficultyTab,
    variant === 'secondary' && styles.difficultyTabActive,
    className
  ].filter(Boolean).join(' ');

  return (
    <button type="button" className={btnClass} {...props}>
      {children}
    </button>
  );
};

export default CommonButton;
