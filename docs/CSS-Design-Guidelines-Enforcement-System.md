# CSS Design Guidelines Enforcement System
# 2025年版 - 将来のデザイン指示対応

## 概要
このシステムは、将来のデザイン指示が適切に反映されるよう、CSS設計の一貫性と品質を保証します。

## 現在の状況 (2025年6月13日)

### ✅ 改善完了項目
1. **MainMenu.module.css**: CSS-Design-Best-Practices.md完全準拠版に更新完了
   - `!important`使用を53個→1個に削減
   - BEM記法統一、デザイントークン導入済み

2. **animation-disable-global.css**: 最適化完了
   - `!important`使用を45個→1個に削減
   - CSS特異性による適切な優先順位制御

### 🔧 要対応項目（優先順位順）

#### 🚨 高優先度 (HIGH Priority)
1. **SimpleGameScreen.module.css** (16個の!important)
2. **RankingScreen.module.css** (14個の!important) 
3. **HybridTypingEngine.module.css** (13個の!important)
4. **AdminModal.module.css** (11個の!important)
5. **SimpleGameResultScreen.module.css** (11個の!important)
6. **globals-2025.css** (20個の!important)

#### ⚠️ 中優先度 (MEDIUM Priority)
1. **2025-modern.css** (9個の!important)
2. **CommonModal.bem.module.css** (7個の!important)
3. **ScreenWrapper.bem.module.css** (7個の!important)
4. **RPGTransitionSystem.module.css** (7個の!important)
5. **SettingsScreen.module.css** (7個の!important)
6. **SimpleUnifiedTypingGame.module.css** (7個の!important)

#### ✅ 低優先度 (LOW Priority) - 管理可能
1. **design-tokens.css** (4個の!important)
2. **MainMenu.module.css** (1個の!important) ✓ 完了
3. **animation-disable-global.css** (1個の!important) ✓ 完了

### 📊 統計情報
- **総CSS/重要宣言数**: 142個
- **総CSSファイル数**: 30個 (Module: 15個, Global: 15個)
- **総CSSサイズ**: 280.48KB
- **大容量ファイル**: 5個 (>20KB)

## デザイン指示反映システム

### 1. デザイントークンシステム
```css
/* 設計指示用のトークンファイル構造 */
/src/styles/
  ├── design-tokens.css        # 基本トークン
  ├── elden-ring-tokens.css   # テーマトークン
  ├── globals-2025.css        # グローバル設定
  └── components/
      └── *.module.css        # コンポーネント個別CSS
```

### 2. CSS競合防止システム
```css
/* CSS Modules + BEM記法による名前空間分離 */
.menu-item__button--primary {
  /* デザイントークン駆動 */
  background-color: var(--color-primary);
  padding: var(--spacing-md);
  /* !importantの代わりにCSS特異性を利用 */
}
```

### 3. 将来のデザイン指示対応フロー
1. **デザイン指示受信** → CSS-Design-Best-Practices.md更新
2. **デザイントークン更新** → design-tokens.css, theme-tokens.css
3. **コンポーネント自動反映** → CSS Modules経由での段階的適用
4. **競合チェック** → scripts/css-analysis-fixed.ps1実行
5. **品質保証** → !important使用量のモニタリング

## 実装ルール

### ✅ 推奨パターン
```css
/* 良い例: デザイントークン + CSS特異性 */
.component__element {
  color: var(--text-primary);
  font-size: var(--font-size-base);
}

/* Container Queriesによるレスポンシブ */
@container (min-width: 480px) {
  .component__element {
    font-size: var(--font-size-lg);
  }
}
```

### ❌ 避けるべきパターン
```css
/* 悪い例: !important多用 */
.component {
  color: red !important;
  font-size: 16px !important;
}

/* 悪い例: ハードコーディング */
.component {
  margin: 10px;
  background: #ff0000;
}
```

## 品質管理コマンド

```powershell
# CSS競合と設計準拠チェック
.\scripts\css-analysis-fixed.ps1

# 推奨: 定期実行
# - コミット前
# - デザイン指示受信時
# - 週次品質チェック
```

## 今後のロードマップ

### Phase 1: 緊急対応 (今日-来週)
- [ ] SimpleGameScreen.module.css (!important削減)
- [ ] RankingScreen.module.css (!important削減)
- [ ] globals-2025.css (グローバルCSS最適化)

### Phase 2: 中期改善 (2-4週間)
- [ ] 全CSS Modulesのデザイントークン統一
- [ ] BEM記法への段階的移行
- [ ] 大容量ファイルの分割

### Phase 3: 長期最適化 (1-2ヶ月)
- [ ] 自動CSS品質チェック導入
- [ ] デザインシステム完全自動化
- [ ] パフォーマンス最適化

---

**最終更新**: 2025年6月13日
**次回チェック予定**: 2025年6月20日
