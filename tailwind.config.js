module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{css,scss}", // CSSモジュールを含む
  ],
  theme: {
    extend: {
      backgroundImage: {
        'sf-bg': "url('/assets/space-bg.jpg')", // public/assets/space-bg.jpg を配置
      },
      boxShadow: {
        'sf-glow': '0 0 32px #00f2ff88',
      },
      colors: {
        primary: '#f59e0b',
        secondary: '#374151',
        accent: '#10b981',
        danger: '#ef4444',
      },
      fontFamily: {
        mono: ['Roboto Mono', 'JetBrains Mono', 'monospace'],
        sans: ['Noto Sans JP', 'sans-serif'],
      },
    },
  },
  plugins: [],
};