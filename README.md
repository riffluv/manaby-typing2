# タイピングゲーム（monkeytype × THE FINALS サイバーパンクUI）

## プロジェクト概要
- サイバーパンクな世界観（monkeytype + THE FINALS風UI）で遊べるタイピングゲームです。
- タイピングロジックの基盤とランキング登録機能を実装済み。
- CSSは全面リセットし、`globals.css`一本でデザインを統一。




## 主な機能
- 日本語ワードのタイピングゲーム
- リアルタイムスコア・KPM・正確性表示
- ゲーム終了後のリザルト画面
- ランキング登録・表示機能
- サイバーパンクなアニメーション・UI

## セットアップ方法
1. 依存パッケージのインストール
   ```powershell
   npm install
   ```
2. 開発サーバー起動
   ```powershell
   npm run dev
   ```
3. ブラウザで [http://localhost:3000](http://localhost:3000) を開く

## ディレクトリ構成（抜粋）
```
src/
  app/
    globals.css         # 唯一のグローバルCSS（全UIデザインここに集約）
    layout.tsx, page.tsx
  components/          # UIコンポーネント群
  hooks/               # Reactカスタムフック
  store/               # Zustand等の状態管理
  ...
public/
  images/, sounds/     # 画像・効果音アセット
```

## スタイリング方針
- CSSは`src/app/globals.css`に集約（他のCSSは原則使わない）
- クラス名・変数はセクションごとに整理
- 追加・修正はglobals.cssに追記

## 今後の開発方針・TODO
- UI/UXのさらなる強化（アニメーション、レスポンシブ等）
- 難易度選択やワード追加
- テーマ切り替え機能

## 主な変更履歴
- 2025/05/28 CSS全面リセット＆globals.css一本化、不要CSS削除
- 2025/05/28 タイピングロジック・ランキング登録の基盤完成

---

何か追加・修正したい場合はglobals.cssとこのREADMEを更新してください。
