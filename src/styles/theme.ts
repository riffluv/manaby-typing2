/**
 * アプリケーション全体で使用するテーマ変数
 * デザインの一貫性を保ちます
 */
export const theme = {
  colors: {
    background: {
      primary: 'bg-gray-900',
      secondary: 'bg-gray-800',
      accent: 'bg-amber-500',
    },
    text: {
      primary: 'text-white',
      secondary: 'text-gray-300',
      accent: 'text-amber-400',
      dark: 'text-gray-900',
    },
    border: {
      primary: 'border-gray-700',
      accent: 'border-amber-500',
    },
    button: {
      primary: 'bg-amber-500 hover:bg-amber-600 text-gray-900',
      secondary: 'bg-gray-800 hover:bg-gray-700 text-white',
      disabled: 'bg-gray-800/50 text-gray-400',
    }
  },
  spacing: {
    container: 'py-10',
    section: 'my-8',
    gap: {
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
    }
  },
  animation: {
    transition: 'transition-all duration-200',
  },
  roundness: {
    sm: 'rounded-md',
    md: 'rounded-lg',
    lg: 'rounded-xl',
  }
};
