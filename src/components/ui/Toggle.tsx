import React, { forwardRef, useCallback } from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * 最適化されたToggleコンポーネント - React最適化版
 * - React.memoとuseCallbackによる最適化
 * - forwardRefとの組み合わせで最大パフォーマンス
 * - CSS-in-JSの最適化
 */
export const Toggle = React.memo(forwardRef<HTMLButtonElement, ToggleProps>(
  ({ checked, onChange, disabled = false, className = '' }, ref) => {
    // クリックハンドラーのメモ化
    const handleClick = useCallback(() => {
      if (!disabled) {
        onChange(!checked);
      }
    }, [checked, disabled, onChange]);

    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        className={`
          w-[50px] h-6 rounded-xl relative cursor-pointer
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${checked 
            ? 'bg-gradient-to-r from-[#c8b78d] to-[#a08850]' 
            : 'bg-[#333]'
          }
          shadow-[inset_0_0_3px_rgba(255,255,255,0.2)]
          transition-all duration-300 ease-in-out
          flex-shrink-0
          ${className}
        `}
        onClick={handleClick}
      >
        <div
          className={`
            absolute w-5 h-5 rounded-full top-0.5 transition-all duration-300
            ${checked 
              ? 'left-7 bg-[#0b0b0b]' 
              : 'left-0.5 bg-[#c8b78d]'
            }
          `}
        />      </button>
    );
  }
));

Toggle.displayName = 'Toggle';
