# HTML→React デザイン移行ガイド

## 🎯 シンプル指示ガイドライン

### ✅ 推奨指示方法

```bash
# 🎯 基本パターン
〇〇〇.htmlと完全一致な見た目にして！

# 例：
game.htmlと完全一致な見た目にして！
result.htmlと完全一致な見た目にして！
```

## 🤖 AI側の自動処理ルール

### 1. 既存CSS完全削除（最重要！）
- 対象コンポーネントの`.module.css`ファイルを**完全にクリア**
- 古いスタイルが残ると予期しない表示になる
- **絶対にやること**: 既存CSS削除 → 新CSS作成

### 2. HTMLスタイル抽出
- インラインスタイル(`style="..."`)をCSS Modulesに変換
- ハードコーディング値をデザイントークンに置換
- BEM記法でクラス名を統一

### 3. CSS Modules作成
```css
/* ComponentName.module.css */
.componentName {
  /* HTMLから抽出したスタイル */
  /* デザイントークンを使用 */
}
```

### 4. 自動適用される最適化
- レスポンシブ対応（モバイル・タブレット・デスクトップ）
- パフォーマンス最適化（GPU加速、will-change）
- アクセシビリティ（focus、contrast）
- ブラウザ互換性（Webkit、Firefox）

---

## 🚨 重要なポイント

### 絶対にやること
1. **古いCSS削除** - 既存ファイルを必ずクリア
2. **HTMLと完全一致** - 指定されたHTMLファイルの見た目を正確に再現
3. **CSS Modules使用** - コンポーネント固有のスタイル

### やってはいけないこと
1. **既存CSSの上書き** - 必ず削除してから作成
2. **グローバルCSS追加** - CSS Modulesのみ使用
3. **勝手な改善** - HTMLと異なるデザインにしない

---

## 📋 シンプル作業フロー

1. **指示受領** → `〇〇〇.htmlと完全一致な見た目にして！`
2. **既存CSS削除** → 対象ファイルを完全クリア
3. **HTML解析** → インラインスタイル抽出
4. **CSS変換** → デザイントークン + BEM記法
5. **完成確認** → HTMLと見た目が一致しているか確認

---

## 🧮 HTMLからプロジェクトルールへの変換計算

### 📐 スペーシング変換計算表
```markdown
HTML値     → プロジェクトトークン
4px       → var(--spacing-xs)
8px       → var(--spacing-sm) 
12px      → var(--spacing-3)
16px      → var(--spacing-md)
20px      → var(--spacing-lg)
24px      → var(--spacing-6)
32px      → var(--spacing-xl)
```

### 🎨 カラー変換計算表
```markdown
HTML色             → プロジェクトトークン
#e0e0e0           → var(--color-text-primary)
#ccc, #cccccc     → var(--color-text-secondary)
#000, #000000     → var(--color-bg-primary)
#0a0f1b           → var(--color-gaming-bg-primary)
#ffd88a           → var(--color-gaming-text-accent)
rgba(0,0,0,0.8)   → var(--color-overlay-dark)
```

### ✍️ フォントサイズ変換計算表
```markdown
HTML値     → プロジェクトトークン
12px      → var(--font-size-xs)
14px      → var(--font-size-sm)
16px      → var(--font-size-base)
18px      → var(--font-size-lg)
20px      → var(--font-size-xl)
24px      → var(--font-size-2xl)
```

### 🏗️ CSS Reset除外計算ルール
```markdown
HTMLで書いた以下は**削除**（プロジェクトで自動適用済み）:
- margin: 0
- padding: 0  
- box-sizing: border-box
- font-family の基本設定
- line-height の基本設定
```

### 🎯 BEM記法変換計算
```markdown
HTML BEM            → CSS Modules BEM
game-screen         → .gameScreen
game-screen__title  → .gameScreen__title
game-screen--large  → .gameScreen--large
```

---

## 📝 **実際の変換計算例**

### 例1: シンプルなゲーム画面
```html
<!-- あなたのHTML -->
<div class="game-screen" style="background: #000; color: #e0e0e0; padding: 20px;">
  <h1 style="font-size: 24px; text-align: center; color: #ffd88a;">ゲームタイトル</h1>
  <div class="game-screen__container" style="margin: 16px 0;">
    <button style="padding: 12px 24px; background: #333; border: 1px solid #666;">
      スタート
    </button>
  </div>
</div>
```

### 変換後のCSS Modules
```css
/* GameScreen.module.css */
.gameScreen {
  background: var(--color-bg-primary);         /* #000 → トークン */
  color: var(--color-text-primary);           /* #e0e0e0 → トークン */
  padding: var(--spacing-lg);                 /* 20px → トークン */
}

.gameScreen__title {
  font-size: var(--font-size-2xl);           /* 24px → トークン */
  text-align: center;
  color: var(--color-gaming-text-accent);     /* #ffd88a → トークン */
}

.gameScreen__container {
  margin: var(--spacing-md) 0;               /* 16px → トークン */
}

.gameScreen__button {
  padding: var(--spacing-3) var(--spacing-6); /* 12px 24px → トークン */
  background: var(--color-bg-secondary);      /* #333 → トークン */
  border: 1px solid var(--color-border-primary); /* #666 → トークン */
}
```

### 例2: CSS Reset部分の除外計算
```html
<!-- あなたのHTML（CSS Reset込み） -->
<div style="margin: 0; padding: 0; box-sizing: border-box; font-family: Arial;">
  <div style="background: #0a0f1b; height: 100vh; padding: 20px;">
    <!-- コンテンツ -->
  </div>
</div>
```

### 変換後（Reset部分除外）
```css
/* CSS Modules - Reset部分は除外 */
.container {
  /* margin: 0; padding: 0; box-sizing: border-box; ← 削除（globals.cssで適用済み） */
  /* font-family: Arial; ← 削除（globals.cssで適用済み） */
  
  background: var(--color-gaming-bg-primary);  /* #0a0f1b → トークン */
  height: 100vh;                               /* そのまま */
  padding: var(--spacing-lg);                  /* 20px → トークン */
}
```

---

**⚠️ 注意**: このガイドは実際のデザイン移行作業時のみ参照してください。CSS設計の準拠チェックとは別の用途です。
