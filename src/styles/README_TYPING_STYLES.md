# タイピングゲーム 製品版スタイリングガイド（globals.css一元化版）

## デザイン・スタイルの絶対一元化方針

- **全UIスタイルは`src/app/globals.css`に集約**
- 個別のmodule.cssやtyping-theme.cssは廃止し、globals.cssのクラス・変数のみを参照
- 変数（色・サイズ・アニメーション）もglobals.cssで一元管理
- 追加・修正はglobals.cssのみで完結
- コンポーネントはglobals.cssのクラス名（例：typing-area, typing-char, completed, current, pending, error）だけを使う
- ドキュメント・エージェントもglobals.cssのみを参照

---

## globals.cssの設計例

```css
:root {
  --typing-typed-color: #7cffcb;
  --typing-untyped-color: rgba(170, 170, 170, 0.7);
  --typing-error-color: #ff5252;
  --typing-animation-duration: 1s;
  --typing-animation-timing: cubic-bezier(0.4, 0.0, 0.2, 1);
}

.typing-area {
  will-change: transform;
  contain: content;
  /* ... */
}

.typing-char {
  /* ... */
}
.typing-char.completed { color: var(--typing-typed-color); }
.typing-char.current { animation: typingCurrentChar var(--typing-animation-duration) var(--typing-animation-timing) infinite; }
.typing-char.pending { color: var(--typing-untyped-color); }
.typing-char.error { color: var(--typing-error-color); }
```

---

## コンポーネント実装例（globals.cssのみ参照）

```tsx
return (
  <div className="typing-area" aria-live="polite" aria-description={`進捗: ${progress}%`} >
    {allChars.map(({ char, state }, idx) => (
      <span
        key={idx}
        className={`typing-char ${state}`}
        aria-current={state === 'current' ? 'true' : undefined}
        aria-label={`${char} (${state})`}
        data-state={state}
      >
        {char}
      </span>
    ))}
  </div>
);
```

---

## スタイル変更・運用ルール

1. **色・アニメーション等の変更**: globals.cssの変数・クラスを編集
2. **状態追加/変更**: globals.cssにクラスを追加し、コンポーネントもそのクラス名のみ参照
3. **個別CSS・module.cssは禁止**

---

## テスト・品質保証

- globals.cssのみを参照していれば、エージェントと人間のデザイン認識差異はゼロ
- すべてのUI・状態・アニメーションはglobals.cssで一元管理
- StorybookやUIカタログもglobals.cssのクラスで表示

---

この運用で「デザイン差異ゼロ」「一括変更100%反映」が保証されます。
