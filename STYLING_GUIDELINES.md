# スタイリングガイドライン

このプロジェクトのスタイリングシステムは2025年5月に整理され、保守性と拡張性を向上させるため統一された体系に従います。

## ファイル構造

### グローバルスタイル
- `src/app/globals.css` - Tailwind CSS、フォント、アニメーション定義
- `src/styles/theme.css` - CSS変数（カラー、フォント、サイズ、間隔）の統一定義
- `src/styles/base.css` - リセットと基本設定
- `src/styles/components.css` - 共通ユーティリティクラス
- `src/styles/layout.css` - レイアウト関連スタイル
- `src/styles/typing-theme.css` - タイピングゲーム専用テーマ

### CSS Modules（推奨）
- `src/styles/*.module.css` - コンポーネント専用スタイル

## CSS変数命名規則

### カラーシステム
```css
/* 背景色 */
--color-bg-primary: #323437      /* メイン背景 */
--color-bg-secondary: #374151    /* セカンダリ背景 */
--color-bg-tertiary: #2C2E31     /* 3番目の背景 */
--color-bg-overlay: rgba(35, 36, 43, 0.4)

/* テキスト色 */
--color-text-primary: #D1D0C5    /* メインテキスト */
--color-text-secondary: #646669  /* セカンダリテキスト */
--color-text-muted: #9ca3af
--color-text-white: #ffffff

/* アクセント色 */
--color-primary: #7cffcb
--color-accent: #10b981
--color-danger: #ef4444
--color-warning: #f59e0b
--color-success: #22c55e
```

### サイズとスペーシング
```css
/* フォントサイズ */
--font-size-xs: 0.75rem
--font-size-sm: 0.875rem
--font-size-base: 1rem
--font-size-lg: 1.25rem
--font-size-xl: 1.5rem
--font-size-2xl: 2.5rem

/* スペーシング */
--spacing-xs: 0.25rem
--spacing-sm: 0.5rem
--spacing-md: 1rem
--spacing-lg: 1.5rem
--spacing-xl: 2rem
```

## ベストプラクティス

### DO ✅
- CSS Modulesを新しいコンポーネントで使用する
- `theme.css`で定義されたCSS変数を使用する
- 統一された命名規則に従う（--color-bg-primary等）
- フォールバック値を提供する: `var(--color-primary, #7cffcb)`

### DON'T ❌
- インラインスタイルを過度に使用しない
- 古いCSS変数（--color-bg, --color-secondary等）を使用しない
- グローバルCSSに直接スタイルを追加しない
- CSS Modulesファイル内でグローバルクラスを定義しない

## 段階的移行

古いコンポーネントを更新する際：

1. 古いCSS変数を新しいものに置換：
   - `--color-bg` → `--color-bg-primary`
   - `--color-bg2` → `--color-bg-tertiary`
   - `--color-secondary` → `--color-bg-secondary`
   - `--color-light-text` → `--color-text-primary`
   - `--color-soft-text` → `--color-text-secondary`

2. CSS Modulesに移行を検討する

3. フォールバック値を確実に提供する

## 拡張時の注意点

新しいデザインシステムを追加する際：

1. まず`theme.css`にCSS変数を定義
2. 既存の命名規則に従う
3. コンポーネント専用スタイルはCSS Modulesを使用
4. グローバルな影響を最小限に抑える

この体系に従うことで、一貫性があり保守しやすいスタイリングシステムを維持できます。
