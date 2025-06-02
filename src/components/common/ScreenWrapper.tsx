import React from 'react';
import styles from './ScreenWrapper.bem.module.css';

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
}) => {  const wrapperClasses = [
    styles.screenWrapper,
    border ? styles['screenWrapper--bordered'] : '',
    boxShadow ? styles['screenWrapper--elevated'] : '',
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
