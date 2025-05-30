import React from 'react';

interface CommonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
  disabled?: boolean;
}

const CommonButton: React.FC<CommonButtonProps> = ({
  variant = 'primary',
  children,
  disabled = false,
  ...props
}) => {
  const btnClass = [
    variant === 'primary' ? 'btn-primary' : 'btn-secondary',
    disabled && 'is-disabled'
  ].filter(Boolean).join(' ');

  return (
    <button type="button" className={btnClass} disabled={disabled} {...props}>
      {children}
    </button>
  );
};

export default CommonButton;
