# CSS設計リファクタリング戦略

## 🎯 概要
CSS-Design-Best-Practices.md準拠への段階的移行戦略

## 📋 段階的リファクタリング手順

### Phase 1: CSS構造統一（推奨開始）
```
1. CSS Modulesの配置統一
   - すべて src/styles/components/ に移動
   - componentsフォルダ内のCSSを削除

2. 命名規則統一
   - BEM記法への完全移行
   - .eldenring.bem.module.css → .module.css

3. デザイントークン完全適用
   - ハードコーディング値をすべて変数化
```

### Phase 2: 画面別リファクタリング
```
優先順位：
1. MainMenu ← 最初（エントリーポイント）
2. RankingScreen
3. SettingsScreen
4. 各種Modal
5. GameScreen（既存保持）
6. ResultScreen（既存保持）
```

### Phase 3: 最終最適化
```
1. レスポンシブ対応強化
2. アクセシビリティ対応
3. パフォーマンス最適化
```

## 🛠️ 実装戦略

### 即座に実行すべき項目
1. **CSS構造クリーンアップ**
   - 重複ファイル削除
   - 統一配置

2. **MainMenu優先修正**
   - 最もユーザーが最初に見る画面
   - 他画面の基盤となる

3. **デザイントークン強化**
   - globals.css整理
   - design-tokens.css完成

## ⚠️ 注意事項
- GameScreen・ResultScreenは動作中なので最後に調整
- 一度に全削除ではなく段階的移行
- 各段階で動作確認必須

## 🚀 期待効果
- 保守性向上
- 開発効率改善
- パフォーマンス最適化
- デザイン統一性確保
