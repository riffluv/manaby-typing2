# タイピングゲーム CSS設計ガイドライン

## 概要

このプロジェクトでは、**統一されたデザインシステム**を採用し、CSS の競合や見た目の差異を防ぐための一元化された構造を実装しています。

## 🎯 設計方針

### 1. 一元化されたスタイルシステム
- **globals.css** が全スタイルの中心
- CSS変数（カスタムプロパティ）によるデザイントークン管理
- ユーティリティクラスによる統一的なスタイリング

### 2. コンポーネントCSSの最小化
- `.module.css` ファイルはコンポーネント固有のスタイルのみ
- 一般的なレイアウトやスタイリングは globals.css のクラスを使用
- 重複を徹底的に排除

## 📁 ファイル構造

```
src/
├── app/
│   └── globals.css          # メインのスタイルファイル
├── components/
│   ├── Component.module.css # コンポーネント固有スタイル（最小限）
│   └── ...
└── styles/                  # その他CSSファイル（参考用）
```

## 🎨 デザイントークン（CSS変数）

### カラーシステム
```css
--color-primary: #000000      /* メインテキスト */
--color-secondary: #666666    /* セカンダリテキスト */
--color-accent: #ff9c00       /* アクセント色 */
--color-success: #22c55e      /* 成功色 */
--color-error: #ef4444        /* エラー色 */
```

### スペーシング
```css
--spacing-xs: 0.25rem         /* 4px */
--spacing-sm: 0.5rem          /* 8px */
--spacing-md: 1rem            /* 16px */
--spacing-lg: 1.5rem          /* 24px */
--spacing-xl: 2rem            /* 32px */
```

### アニメーション
```css
--transition-fast: 0.15s ease
--transition-base: 0.2s ease
--transition-slow: 0.3s ease
```

## 🧩 利用可能なユーティリティクラス

### レイアウト
```css
.flex                  /* display: flex */
.flex-col             /* flex-direction: column */
.items-center         /* align-items: center */
.justify-center       /* justify-content: center */
.justify-between      /* justify-content: space-between */
.gap-sm, .gap-md, .gap-lg  /* gap */
.grid                 /* display: grid */
.grid-cols-2, .grid-cols-3 /* grid-template-columns */
```

### テキスト
```css
.text-xs, .text-sm, .text-base, .text-lg, .text-xl, .text-2xl, .text-3xl, .text-4xl
.font-normal, .font-medium, .font-semibold, .font-bold
.text-center, .text-left, .text-right
.text-primary, .text-secondary, .text-accent, .text-success, .text-error
```

### ボタン
```css
.btn                  /* 基本ボタン */
.btn-primary          /* プライマリボタン */
.btn-secondary        /* セカンダリボタン */
.btn-lg, .btn-sm      /* サイズ変更 */
```

### スペーシング
```css
.p-sm, .p-md, .p-lg   /* padding */
.m-sm, .m-md, .m-lg   /* margin */
.mb-sm, .mb-md, .mb-lg /* margin-bottom */
```

### その他
```css
.container            /* コンテナ */
.card                 /* カード */
.input                /* フォーム入力 */
.modal-overlay        /* モーダル */
.hidden, .block       /* 表示/非表示 */
.w-full, .h-full      /* サイズ */
.rounded, .rounded-lg /* 角丸 */
.shadow, .shadow-lg   /* シャドウ */
```

## ⌨️ タイピング機能専用クラス

```css
.typing-area          /* タイピングエリア */
.typing-char          /* 文字の基本スタイル */
.typing-char.current  /* 現在の入力位置 */
.typing-char.completed /* 入力完了文字 */
.typing-char.pending  /* 未入力文字 */
.typing-char.error    /* エラー文字 */
```

## 📝 実装ガイドライン

### ✅ 推奨される実装方法

```tsx
// コンポーネントでの使用例
const MainMenu = () => {
  return (
    <div className="flex flex-col items-center min-h-screen p-lg">
      <div className="container">
        <h1 className="text-4xl font-bold text-center mb-lg">
          タイピングゲーム
        </h1>
        <div className="flex gap-md">
          <button className="btn btn-primary btn-lg">
            START
          </button>
          <button className="btn btn-secondary">
            RANKING
          </button>
        </div>
      </div>
    </div>
  );
};
```

### ❌ 避けるべき実装方法

```tsx
// インラインスタイル（避ける）
<div style={{ display: 'flex', padding: '2rem' }}>

// 個別のmodule.cssで基本レイアウトを定義（避ける）
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
}
```

### 📋 コンポーネントCSS の書き方

コンポーネント固有の `.module.css` ファイルには、以下のみを記述してください：

1. **そのコンポーネントでのみ使用される特殊なスタイル**
2. **globals.css では表現できない複雑なレイアウト**
3. **状態やバリエーションに関する特殊なスタイル**

```css
/* Good: コンポーネント固有のスタイル */
.menuModeButtonNormal {
  background-color: #e8f5e8;
  border-color: #4caf50;
  color: #2e7d32;
}

/* Bad: 一般的なレイアウト（globals.cssを使用） */
.container {
  display: flex;
  flex-direction: column;
}
```

## 🔧 メンテナンス

### CSSの変更時の手順

1. **色やサイズの変更**: `globals.css` の CSS変数を編集
2. **新しいユーティリティの追加**: `globals.css` にクラスを追加
3. **コンポーネント固有の調整**: `.module.css` で最小限の変更

### デバッグ時のチェックポイント

- [ ] `globals.css` の変数が正しく使用されているか
- [ ] 同じスタイルが複数箇所で定義されていないか
- [ ] コンポーネント間でスタイルの一貫性があるか
- [ ] レスポンシブ対応が適切に動作しているか

## 🎨 デザインの拡張

新しいデザインを追加する際は：

1. **デザイントークンの確認**: 既存の変数で表現可能か検討
2. **ユーティリティクラスの活用**: 既存のクラスの組み合わせで実現可能か検討
3. **新しい変数の追加**: 必要に応じて `globals.css` に CSS変数を追加
4. **ドキュメントの更新**: 新しいクラスや変数をこのガイドに追記

## 🤝 チーム開発での注意点

- **globals.css の変更は慎重に**: 全体に影響するため、変更前に影響範囲を確認
- **命名規則の統一**: 既存のクラス名の規則に従う
- **コードレビュー**: CSS変更時は、スタイルの一貫性をチェック
- **このガイドラインの参照**: 迷った時はこのドキュメントを確認

---

このガイドラインに従うことで、一貫性のあるデザインと保守しやすいCSSコードベースを維持できます。
