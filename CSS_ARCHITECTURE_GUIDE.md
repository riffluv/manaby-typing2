# 🏗️ CSS技術アーキテクチャガイド - manaby-premia

## 📋 概要
本ガイドは、manaby-premiaプロジェクトのCSS設計原則、Design Tokensシステム、およびベストプラクティスを定義します。

## 🎨 Design Tokensシステム

### 基本原則
1. **全ての色彩値は`colors.css`で定義**
2. **ハードコーディング禁止**
3. **コンポーネント間の一貫性確保**
4. **保守性・拡張性の最大化**

### 色彩Token定義

#### プライマリカラー
```css
/* 金色系メインテーマ */
--color-gaming-text-accent: #d4af37;        /* ゴールドアクセント */
--color-accent-secondary-hover: #e6c563;    /* セカンダリホバー */
--accent-primary: var(--color-gaming-text-accent);
--accent-hover: #e6c563;

/* インタラクティブ要素 */
--color-interactive-hover: rgba(212, 175, 55, 0.2);
--color-text-primary-inverted: #000000;
```

#### 使用例
```css
/* ✅ 正しい使用方法 */
.button:hover {
  color: var(--color-gaming-text-accent);
  background: var(--color-interactive-hover);
}

/* ❌ 避けるべき記述 */
.button:hover {
  color: #88ccff;  /* ハードコーディング禁止 */
  background: rgba(136, 204, 255, 0.1);
}
```

## 🔧 コンポーネント設計パターン

### 1. モジュラーCSS構造
```
src/styles/
├── design-tokens/
│   ├── colors.css          # 色彩Token定義
│   ├── typography.css      # 文字Token定義
│   └── spacing.css         # 間隔Token定義
├── components/
│   ├── Button.module.css   # ボタンコンポーネント
│   ├── Table.module.css    # テーブルコンポーネント
│   └── ...
└── screens/
    ├── RankingScreen.module.css
    └── ...
```

### 2. BEM命名規則
```css
/* Block-Element-Modifier */
.rankingScreen {}                    /* Block */
.rankingScreen__table {}             /* Element */
.rankingScreen__table--loading {}    /* Modifier */
```

## 🎯 実装済みコンポーネント

### ランキング画面
**ファイル**: `RankingScreen.module.css`
- ✅ Design Tokens完全準拠
- ✅ 8箇所の青色ハードコーディング除去済み
- ✅ 金色系テーマ統一済み

### ゲーム画面群
**修正済みファイル**: 6個
- `MainMenu.module.css`
- `SimpleGameScreen.module.css`
- `SimpleGameResultScreen.module.css`
- `StandaloneTypingGameScreen.module.css`
- `SimpleUnifiedTypingGame.module.css`
- `Table.module.css`

### メインメニュー
**ファイル**: `MainMenu.eldenring.bem.module.css`
- ✅ BEM命名規則準拠
- ✅ Elden Ringスタイル統一
- ✅ レスポンシブ対応

## 📐 設計ガイドライン

### 色彩使用原則
1. **プライマリ**: `var(--color-gaming-text-accent)` - 主要アクセント
2. **ホバー**: `var(--color-interactive-hover)` - インタラクション
3. **セカンダリ**: `var(--accent-hover)` - 補助アクセント

### レスポンシブ設計
```css
/* モバイルファースト */
@media (max-width: 768px) {
  .component {
    font-size: 1rem;
  }
}

@media (min-width: 769px) {
  .component {
    font-size: 1.2rem;
  }
}
```

### アニメーション原則
```css
/* 統一されたトランジション */
.interactive-element {
  transition: all 0.3s ease;
}

/* 統一されたホバー効果 */
.interactive-element:hover {
  color: var(--color-gaming-text-accent);
  text-shadow: 0 2px 10px var(--color-gaming-text-accent);
}
```

## 🔍 品質保証チェックリスト

### 新規CSS作成時
- [ ] ハードコーディングされた色彩値がないか
- [ ] Design Tokensを適切に使用しているか
- [ ] BEM命名規則に準拠しているか
- [ ] レスポンシブ対応が適切か
- [ ] アクセシビリティを考慮しているか

### 既存CSS修正時
- [ ] 既存のDesign Tokensとの整合性
- [ ] 他コンポーネントへの影響確認
- [ ] パフォーマンスへの影響評価
- [ ] 後方互換性の確保

## 🚀 拡張・保守ガイドライン

### 新しい色彩追加時
1. `colors.css`に適切なToken名で定義
2. 既存Token体系との整合性確認
3. 全コンポーネントでの使用例テスト
4. ドキュメント更新

### 新しいコンポーネント作成時
1. Design Tokensベースの設計
2. BEM命名規則の適用
3. レスポンシブ対応の実装
4. アクセシビリティ配慮

## 📊 継続的監視

### 定期確認項目
- Design Tokens使用率
- ハードコーディング箇所の発生
- パフォーマンス指標
- アクセシビリティスコア

### 品質メトリクス
- **Design Tokens準拠率**: 100%維持
- **CSS重複率**: 5%以下
- **バンドルサイズ**: 最適化維持
- **レンダリング性能**: 高水準維持

## 🔗 関連リソース

### 開発ツール
- VS Code CSS拡張機能
- PostCSS設定
- Stylelint設定

### 参考資料
- [CSS Architecture Best Practices](https://github.com/suitcss/suit/blob/master/doc/naming-conventions.md)
- [BEM Methodology](https://en.bem.info/methodology/)
- [Design Tokens Community Group](https://design-tokens.github.io/community-group/)

---

**作成日**: 2024年  
**バージョン**: 1.0  
**メンテナー**: 開発チーム全体
