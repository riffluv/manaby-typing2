# タイピングゲーム スタイルガイド

## 🎯 概要

このドキュメントは、タイピングゲームプロジェクトの統一されたCSS設計システムです。
すべてのスタイルは `src/app/globals.css` に集約され、エージェントとの協働でも一貫したデザインを保証します。

## 📁 ファイル構造

```
src/
├── app/
│   └── globals.css          # 🔥 メインスタイルファイル（すべてここに集約）
├── components/
│   ├── *.module.css         # 最小限のコンポーネント固有スタイル
│   └── common/
└── styles/
    └── STYLE_GUIDE.md      # このドキュメント
```

## 🎨 デザインシステム

### カラーパレット
```css
:root {
  /* プライマリカラー */
  --color-primary: #000000        /* メインテキスト */
  --color-secondary: #666666      /* セカンダリテキスト */
  --color-accent: #ff9c00         /* アクセントカラー（オレンジ） */
  
  /* ステータスカラー */
  --color-success: #22c55e        /* 成功・正解 */
  --color-error: #ef4444          /* エラー・不正解 */
  --color-warning: #f59e0b        /* 警告 */
  --color-info: #3b82f6           /* 情報 */
  
  /* 背景色 */
  --bg-primary: #ffffff           /* メイン背景 */
  --bg-secondary: #f8f9fa         /* セカンダリ背景 */
  --bg-surface: #ffffff           /* カード・サーフェス */
}
```

### タイポグラフィ
```css
/* サイズ */
.text-xs     /* 0.75rem */
.text-sm     /* 0.875rem */
.text-base   /* 1rem */
.text-lg     /* 1.125rem */
.text-xl     /* 1.25rem */
.text-2xl    /* 1.5rem */
.text-3xl    /* 1.875rem */
.text-4xl    /* 2.25rem */

/* ウェイト */
.font-normal   /* 400 */
.font-medium   /* 500 */
.font-semibold /* 600 */
.font-bold     /* 700 */

/* 色 */
.text-primary   /* メインテキスト */
.text-secondary /* セカンダリテキスト */
.text-accent    /* アクセント */
.text-success   /* 成功 */
.text-error     /* エラー */
```

### レイアウト
```css
/* フレックス */
.flex           /* display: flex */
.flex-col       /* flex-direction: column */
.items-center   /* align-items: center */
.justify-center /* justify-content: center */
.justify-between /* justify-content: space-between */

/* グリッド */
.grid           /* display: grid */
.grid-cols-2    /* grid-template-columns: repeat(2, 1fr) */
.grid-cols-3    /* grid-template-columns: repeat(3, 1fr) */

/* スペーシング */
.gap-sm, .gap-md, .gap-lg    /* gap */
.p-sm, .p-md, .p-lg          /* padding */
.m-sm, .m-md, .m-lg          /* margin */
.mb-sm, .mb-md, .mb-lg       /* margin-bottom */
```

### ボタン
```css
/* 基本ボタン */
.btn            /* ベースボタンスタイル */
.btn-primary    /* プライマリボタン（オレンジ） */
.btn-secondary  /* セカンダリボタン */

/* サイズ */
.btn-sm         /* 小サイズ */
.btn-lg         /* 大サイズ */
```

## 🎮 タイピング機能専用スタイル

### タイピングエリア
```css
.typing-area           /* タイピング文字表示エリア */
.typing-char           /* 各文字の基本スタイル */
.typing-char.current   /* 現在入力位置（オレンジ背景） */
.typing-char.completed /* 入力完了文字（緑色） */
.typing-char.pending   /* 未入力文字（グレー） */
.typing-char.error     /* エラー文字（赤色） */
```

## 📝 使用ルール

### ✅ 推奨パターン

1. **globals.cssのクラスを優先使用**
```tsx
// 良い例
<div className="flex flex-col items-center gap-md p-lg">
  <h1 className="text-2xl font-bold text-primary">タイトル</h1>
  <button className="btn btn-primary btn-lg">スタート</button>
</div>
```

2. **コンポーネント固有スタイルは最小限**
```css
/* Component.module.css - 良い例 */
.specialButton {
  min-width: 200px; /* globals.cssにない固有プロパティのみ */
}
```

3. **変数を活用**
```css
.customElement {
  color: var(--color-accent);
  padding: var(--spacing-md);
  border-radius: var(--border-radius);
}
```

### ❌ 避けるべきパターン

1. **直接的な値の指定**
```css
/* 悪い例 */
.element {
  color: #ff9c00;        /* var(--color-accent) を使用 */
  padding: 16px;         /* var(--spacing-md) を使用 */
  background: #f0f0f0;   /* var(--bg-secondary) を使用 */
}
```

2. **重複スタイルの作成**
```css
/* 悪い例 */
.myButton {
  padding: 0.5rem 1rem;     /* .btn を使用 */
  border: 1px solid #ccc;   /* .btn を使用 */
  border-radius: 0.375rem;  /* .btn を使用 */
}
```

## 🤖 エージェント協働ガイドライン

### デザイン依頼時の注意点

1. **globals.cssベースで依頼**
   - 「`.btn-primary`を使ってボタンを作成」
   - 「`.typing-area`のスタイルを調整」

2. **新しいスタイルが必要な場合**
   - globals.cssに追加を依頼
   - CSS変数を使用した実装を依頼

3. **レスポンシブ対応**
   - globals.cssに既にモバイル対応が含まれています
   - 追加調整が必要な場合は変数で対応

### 例：エージェントへの依頼文

```
「メインメニューのボタンデザインを改善してください。
 globals.cssの.btn-primaryを基に、
 ホバー時のアニメーションを追加し、
 フォントサイズを1.2remに調整してください。」
```

## 🔧 メンテナンス

### 定期チェック項目

1. **未使用スタイルの削除**
   - module.cssファイルの見直し
   - globals.css内の不要クラス削除

2. **一貫性の確認**
   - 色の統一性
   - スペーシングの統一性
   - フォントサイズの統一性

3. **パフォーマンス最適化**
   - CSSファイルサイズの確認
   - 重複スタイルの統合

## 📊 現在の状況

✅ **完了済み**
- globals.css の統一デザインシステム構築
- タイピング機能のコアスタイル整備
- レスポンシブ対応
- アクセシビリティ対応

🔄 **進行中**
- 既存コンポーネントのglobals.css移行
- module.cssファイルの最小化

📋 **今後の予定**
- 新機能開発時のスタイル統一性確保
- パフォーマンス最適化
- デザインシステムの拡張

---

**重要**: このスタイルガイドに従うことで、エージェントとの協働時も一貫したデザインが保証されます。
