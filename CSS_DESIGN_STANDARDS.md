# 🎨 デザイン実装統一ガイドライン

## 📐 デザイン依頼時のテンプレート

### ✅ 推奨する依頼形式
```
機能: [具体的な機能名]
場所: [ファイル名・コンポーネント名]
デザイン要件:
- レイアウト: [既存クラス使用を明記]
- カラー: [CSS変数を指定]
- スペーシング: [CSS変数を指定]
- インタラクション: [ホバー・フォーカス等]
- レスポンシブ: [必要な画面サイズ対応]
```

### 🎯 実装例テンプレート

#### ボタンコンポーネント
```tsx
// 推奨実装パターン
<button className="btn btn--primary btn--lg">
  送信する
</button>

// 対応CSS (globals.css使用)
.btn {
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-accent);
  color: white;
  border-radius: var(--border-radius);
}
```

#### カードコンポーネント  
```tsx
// 推奨実装パターン
<div className="card p-lg mb-md">
  <div className="card-header">
    <h3 className="text-xl text-primary">タイトル</h3>
  </div>
  <div className="card-body">
    コンテンツ
  </div>
</div>
```

## 🚫 避けるべきパターン

### ❌ インラインスタイルの多用
```tsx
// 避けるべき
<div style={{marginTop: "20px", color: "#ff0000"}}>
```

### ❌ ハードコードされた値
```css
/* 避けるべき */
.custom-button {
  padding: 12px 24px;  /* var(--spacing-md) を使用すべき */
  color: #ff9c00;      /* var(--color-accent) を使用すべき */
}
```

## 📱 レスポンシブ実装標準

### 統一ブレークポイント
```css
/* モバイル優先 */
.component { /* デフォルトはモバイル */ }

@media (min-width: 768px) {
  .component { /* タブレット */ }
}

@media (min-width: 1024px) {
  .component { /* デスクトップ */ }
}
```

## 🎨 色使用ガイドライン

### プライマリカラー
- `var(--color-primary)`: メインテキスト
- `var(--color-accent)`: アクションボタン、リンク
- `var(--color-success)`: 成功メッセージ
- `var(--color-error)`: エラーメッセージ

### 背景色
- `var(--bg-primary)`: メイン背景
- `var(--bg-secondary)`: セカンダリ背景
- `var(--bg-surface)`: カード・モーダル背景

## 📏 スペーシング使用基準

- `var(--spacing-xs)`: アイコンとテキストの間隔
- `var(--spacing-sm)`: 小さな要素間の間隔  
- `var(--spacing-md)`: 標準的な要素間の間隔
- `var(--spacing-lg)`: セクション間の間隔
- `var(--spacing-xl)`: 大きなセクション間の間隔

## 🚀 開発効率化のコツ

### 1. 既存クラスの活用
新しいスタイルを作る前に `globals.css` を確認

### 2. CSS変数の優先使用  
直接値を書かず、必ず変数を使用

### 3. BEMの活用
`.block__element--modifier` の命名規則を遵守

### 4. レスポンシブファーストThinking
モバイルから設計を開始

---

## 📞 デザイン相談時の質問例

1. "このスタイルは既存のどのクラスに近いですか？"
2. "既存のCSS変数で表現できますか？"  
3. "レスポンシブ対応はどこまで必要ですか？"
4. "アクセシビリティの考慮事項はありますか？"

このガイドラインに従うことで、一貫性のある美しいデザインを効率的に実装できます！
