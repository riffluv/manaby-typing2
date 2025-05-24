import React from 'react';
import styles from './ScreenWrapper.module.css';

type ScreenWrapperProps = {
  children: React.ReactNode;
  border?: boolean;
  boxShadow?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  border = false,
  boxShadow = false,
  className = '',
  style = {},
}) => {
  const wrapperClasses = [
    styles.screenWrapper,
    border ? styles.withBorder : '',
    boxShadow ? styles.withBoxShadow : '',
    className,
  ]
    .filter(Boolean) // 空文字列を除外
    .join(' ');

  return (
    <div className={wrapperClasses} style={style}>
      {children}
    </div>
  );
};

export default ScreenWrapper;
