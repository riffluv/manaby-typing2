# BGMシステム用ディレクトリ

このディレクトリにBGM用のMP3ファイルを配置してください。

## 🎵 推奨ファイル名

- `lobby-theme.mp3` - ロビー画面用BGM
- `game-battle.mp3` - ゲーム中BGM
- `result-fanfare.mp3` - 結果発表BGM
- `ranking-epic.mp3` - ランキング画面BGM
- `settings-calm.mp3` - 設定画面BGM

## 📋 設定方法

1. 上記ファイル名でMP3を配置
2. `src/utils/BGMPlayer.ts` の `BGM_TRACKS` オブジェクトを更新
3. 自動的にBGMシステムが有効化されます

## 🎯 特徴

- **打撃音との完全分離**: WebAudio打撃音システムに影響なし
- **SPA対応**: ページ遷移で途切れない
- **フェード機能**: 自然な音楽切り替え
- **音量制御**: 独立した音量調整

## 🧪 テスト

`/bgm-test` ページでシステム動作確認が可能です。
