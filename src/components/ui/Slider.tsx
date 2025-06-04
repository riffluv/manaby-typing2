import { forwardRef } from 'react';

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  ({ 
    value, 
    onChange, 
    min = 0, 
    max = 10, 
    step = 1, 
    disabled = false,
    className = '' 
  }, ref) => {
    return (
      <input
        ref={ref}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`
          w-[200px] h-2 appearance-none bg-[#1f1f1f] rounded outline-none
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          slider
          ${className}
        `}
        style={{
          background: '#1f1f1f',
        }}
      />
    );
  }
);

Slider.displayName = 'Slider';
