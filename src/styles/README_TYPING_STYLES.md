# タイピングゲーム スタイルガイド

## ローマ字タイピング表示のスタイル保護について

このプロジェクトではタイピングゲームのローマ字表示スタイルを意図せず変更することを防ぐため、以下の対策を実施しています。

### 1. スタイルの分離

ローマ字タイピング表示のスタイルは `src/styles/TypingCharacters.module.css` に分離されています。
このファイルには入力中のローマ字の表示に必要なすべてのスタイルが含まれています。

- `.typingArea` - タイピング領域全体のスタイル
- `.typingChar` - 個々の文字のスタイル
- `.completed` - 入力済み文字のスタイル
- `.current` - 現在入力中の文字のスタイル
- `.pending` - 未入力の文字のスタイル
- `.error` - エラー文字のスタイル

### 2. 色の定義

タイピング文字の色は `src/styles/theme.css` の以下の変数で定義されています：

```css
--typing-typed-color: #7cffcb;     /* 入力済み文字の色（水色） */
--typing-untyped-color: rgba(170, 170, 170, 0.6); /* 未入力文字の色（薄いグレー） */
--typing-error-color: #ef4444;     /* エラー文字の色（赤） */
--typing-focus-color: #ffffff;     /* フォーカス中の色（白） */
--typing-shadow-color: rgba(124, 255, 203, 0.4); /* タイプ済み影の色 */
--typing-focus-shadow-color: rgba(255, 255, 255, 0.8); /* フォーカス影の色 */
```

### 3. 注意事項

リファクタリングやUI変更を行う際は、以下の点に注意してください：

1. `TypingCharacters.module.css` ファイルの変更は慎重に行い、視覚的効果を確認してください
2. `theme.css` のタイピング関連変数を変更する場合も、事前に確認してください
3. `TypingArea.tsx` コンポーネントは `TypingCharacters.module.css` を使用し、他のスタイルに影響を受けません

この分離によって、一般的なUIのリファクタリングがタイピングゲームのUXを損なうことがなくなります。
