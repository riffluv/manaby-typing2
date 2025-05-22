# TypingGame 高速化設計メモ（typingmania-ref流）

## このファイルの目的

このプロジェクトのタイピングゲーム（`src/components/TypingGame.tsx`）は、typingmania-refの設計思想を取り入れた**超高速レスポンス設計**を採用しています。

今後、他の開発者やAIエージェントがこの設計を壊さないよう、以下の方針を必ず守ってください。

---

## typingmania-ref流 高速化設計の要点

- **タイピング進行の状態（typingChars, indexなど）はuseRefで管理し、useStateやZustandで管理しないこと**
    - 進行状況は「再レンダリング不要」な限りuseRefで直接ミューテート
- **画面表示用の状態だけuseStateで管理すること**
    - 例: 進行中のかな表示（kanaDisplay）など
- **キー入力ごとにuseRefの値を直接書き換え、必要な部分だけsetStateで再描画すること**
- **ZustandやuseStateは「お題切り替え」や「スコア・履歴」などグローバル共有が必要な部分だけに限定すること**
- **キー入力イベントはグローバルで1回だけ購読し、進行はuseRefで管理すること**
- **Reactの再レンダリングを極力減らし、DOMの一部だけを更新する設計に寄せること**

---

## 禁止事項

- タイピング進行の状態（typingChars, index, acceptedTextなど）をuseStateやZustandで管理しないこと
- 進行ごとにsetStateやZustandのsetで再レンダリングを発生させないこと
- 進行状態をZustandストアに戻す設計に「絶対に」戻さないこと

---

## 参考
- typingmania-ref: クラスインスタンス直接ミューテート＋最小限のDOM更新で超高速レスポンスを実現
- この設計を壊すと、タイピングレスポンスが大幅に劣化します

---

**この設計方針を必ず守ってください！**

（最終更新: 2025-05-22）
