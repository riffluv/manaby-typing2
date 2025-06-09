# ランキング画面 CSS リファクタリング計画

## 📊 現状分析

### 問題点
1. **複数ファイル散在**: メイン、最適化版、レスポンシブ版が存在
2. **過度なDPI対応**: 125%, 150%, 200%の個別対応が複雑
3. **過剰パフォーマンス最適化**: GPU加速、will-changeの多用
4. **重複するレスポンシブルール**: 一貫性のないブレークポイント

### ファイル構成（現在）
```
src/styles/components/
├── RankingScreen.module.css (287行) - メイン
├── RankingScreen.optimized.module.css - パフォーマンス最適化版
└── ranking-responsive.css - レスポンシブ対応
```

## 🎯 リファクタリング目標

### 1. **シンプル化**
- 1つのファイルに統合
- 不要な最適化を削除
- DPI対応をシンプルに

### 2. **保守性向上**  
- 明確なコメント
- 論理的なセクション分け
- 一貫したネーミング

### 3. **モダンCSS活用**
- Container Queries
- CSS Grid/Flexbox
- clamp()関数でレスポンシブ

## 🏗️ 新しい設計

### ファイル構成（提案）
```
src/styles/components/
└── RankingScreen.module.css (シンプル版、約100行)
```

### CSS構造
```css
/* 1. レイアウト基本 */
.ranking {
  display: grid;
  place-items: center;
  min-height: 100vh;
  background: radial-gradient(ellipse at center, #0a0f1b, #000);
}

/* 2. コンテナ */
.container {
  width: min(90vw, 960px);
  padding: clamp(1rem, 5vh, 3rem) clamp(1rem, 3vw, 2rem);
}

/* 3. レスポンシブ（Container Queries使用） */
@container (width < 768px) {
  .title { font-size: clamp(1.5rem, 8vw, 2rem); }
}

/* 4. DPI対応（シンプルに） */
@media (min-resolution: 1.25dppx) {
  .ranking { font-size: 16px; }
}
```

## ✅ 実装ステップ

1. **バックアップ作成**
2. **新しいCSSファイル作成** 
3. **段階的テスト**
4. **不要ファイル削除**

## 📏 期待効果

- **ファイルサイズ**: 287行 → 約100行 (65%削減)
- **保守性**: 大幅向上
- **パフォーマンス**: 適切な最適化
- **一貫性**: 他画面との統一
