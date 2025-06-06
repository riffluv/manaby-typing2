# manabytypeII - 超高速タイピングゲーム

## プロジェクト概要
- サイバーパンクな世界観（monkeytype + THE FINALS風UI）で遊べる超高速タイピングゲーム
- **Phase 1完了**: HyperTypingEngineによる革命的性能最適化実装済み
- **「ん」文字分岐処理**: 完全対応済み
- **平均処理時間**: 0.11ms（従来比約50倍高速化）
- CSSは全面リセットし、`globals.css`一本でデザインを統一




## 主な機能
- **超高速タイピングエンジン**: HyperTypingEngine搭載
  - RequestIdleCallback最適化
  - 予測キャッシングシステム（43.8%ヒット率）
  - 差分更新システム
- **「ん」文字分岐処理**: 完全対応
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
    SimpleGameScreen.tsx # メインゲーム画面
    MainMenu.tsx        # メインメニュー
  typing/             # 超高速タイピングエンジン
    HyperTypingEngine.ts # Phase 1最適化完了
    HyperTypingHook.ts  # React統合
  hooks/              # Reactカスタムフック
  store/              # Zustand等の状態管理
public/
  images/, sounds/    # 画像・効果音アセット
```

## スタイリング方針
- CSSは`src/app/globals.css`に集約（他のCSSは原則使わない）
- クラス名・変数はセクションごとに整理
- 追加・修正はglobals.cssに追記

## 今後の開発方針・TODO
- **Phase 2実装**: WebAssembly統合による10-30倍高速化
- UI/UXのさらなる強化（アニメーション、レスポンシブ等）
- 難易度選択やワード追加
- テーマ切り替え機能

## 主な変更履歴
- **2025/06/06 Phase 1完了**: HyperTypingEngine実装、50倍高速化達成
- **2025/06/06**: 「ん」文字分岐処理完全対応、本番環境統合完了
- 2025/05/28 CSS全面リセット＆globals.css一本化、不要CSS削除
- 2025/05/28 タイピングロジック・ランキング登録の基盤完成

## 性能指標（Phase 1完了）
- **平均処理時間**: 0.11ms（従来比約50倍高速化）
- **キャッシュヒット率**: 43.8%
- **RequestIdleCallback**: アクティブ実行中
- **DOM更新最適化**: 効果確認済み

---

## Phase 2準備完了
Phase 2実装計画（WebAssembly統合）は`PHASE2_IMPLEMENTATION_PLAN.md`を参照。  
追加・修正したい場合はglobals.cssとこのREADMEを更新してください。
