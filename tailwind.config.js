module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    // 他のパス
  ],
  theme: {
    extend: {
      backgroundImage: {
        'sf-bg': "url('/assets/space-bg.jpg')", // public/assets/space-bg.jpg を配置
      },
      boxShadow: {
        'sf-glow': '0 0 32px #00f2ff88',
      },
    },
  },
  plugins: [],
};