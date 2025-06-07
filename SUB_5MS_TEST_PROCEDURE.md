# 🚀 SUB-5MS入力遅延 実機テスト手順書

## 🎯 テストの目的
HyperTypingEngineの最適化により、入力遅延をsub-5ms（5ms未満）に削減できたかを確認する。

## 📋 事前準備
- ✅ 開発サーバー起動済み: http://localhost:3000
- ✅ ブラウザでサイトアクセス済み
- ✅ 最適化実装完了

## 🔧 テスト実行手順

### 手順1: ブラウザ開発者ツールを開く
1. ブラウザで `F12` キーを押す
2. `Console` タブを選択

### 手順2: テストスクリプトを読み込む
```javascript
// 以下のコードをコンソールに貼り付けて実行
fetch('/sub5ms-performance-test.js')
  .then(response => response.text())
  .then(script => eval(script))
  .catch(err => console.log('スクリプト読み込みエラー:', err));
```

### 手順3A: 手動テスト実行
1. **統計をクリア**
   ```javascript
   window.sub5msTest.clearStats();
   ```

2. **タイピングゲームを開始**
   - ブラウザ画面でタイピングゲームを開始
   - 10-20回のキー入力を実行

3. **結果を取得・評価**
   ```javascript
   const stats = window.sub5msTest.getStats();
   window.sub5msTest.evaluate(stats);
   ```

### 手順3B: 自動テスト実行（オプション）
```javascript
// 自動テスト実行（仮想キー入力）
window.sub5msTest.autoTest();
```

## 📊 期待される結果

### 🎉 成功パターン
```
=== 🎯 SUB-5MS目標評価 ===
最大遅延: 3.2ms
平均遅延: 1.8ms
最小遅延: 0.9ms
測定回数: 15回
🎉 ✅ SUB-5MS目標達成！
🚀 性能向上率: 68.0%
```

### ❌ 失敗パターン
```
=== 🎯 SUB-5MS目標評価 ===
最大遅延: 6.7ms
平均遅延: 4.2ms
最小遅延: 2.1ms
測定回数: 12回
❌ 目標未達成 (6.7ms > 5.0ms)
```

## 🔍 詳細分析コマンド

### パフォーマンス統計の詳細表示
```javascript
// 完全な統計情報を表示
const stats = window.performanceDebug.getStats();
console.table(stats);
```

### 入力遅延の詳細分析
```javascript
// 入力遅延の分布を確認
const stats = window.performanceDebug.getStats();
if (stats.input_delay && stats.input_delay.samples) {
  console.log('入力遅延サンプル:', stats.input_delay.samples);
  console.log('標準偏差:', stats.input_delay.stddev || 'N/A');
}
```

### レンダリング性能の確認
```javascript
// レンダリング時間の確認
const stats = window.performanceDebug.getStats();
console.log('レンダリング統計:', stats.rendering || 'N/A');
```

## 🚨 トラブルシューティング

### window.performanceDebugが未定義の場合
```javascript
// PerformanceDebugUtilsが正しく読み込まれているか確認
console.log('PerformanceDebugUtils:', typeof window.PerformanceDebugUtils);

// 手動で初期化を試行
if (typeof window.PerformanceDebugUtils !== 'undefined') {
  window.performanceDebug = window.PerformanceDebugUtils;
}
```

### タイピングエンジンが動作していない場合
1. ページをリロード
2. タイピングゲーム画面に移動
3. 文字入力エリアにフォーカスを設定

### 測定データが取得できない場合
```javascript
// HyperTypingEngineの状態確認
console.log('HyperTypingEngine:', window.hyperTypingEngine || 'Not found');

// PerformanceProfilerの状態確認
console.log('PerformanceProfiler:', window.PerformanceProfiler || 'Not found');
```

## 📝 結果の記録

### 成功時の記録項目
- 最大入力遅延（ms）
- 平均入力遅延（ms）
- 最小入力遅延（ms）
- 測定回数
- 性能向上率（%）

### 分析すべき追加データ
- レンダリング時間
- DOM更新時間
- 音声処理時間
- 全体的な応答性

## 🎯 合格基準

### ✅ SUB-5MS目標達成条件
- **最大入力遅延** < 5.0ms
- **平均入力遅延** < 3.0ms（推奨）
- **測定の安定性** > 10回の測定

### 🚀 優秀な結果
- **最大入力遅延** < 3.0ms
- **平均入力遅延** < 2.0ms
- **性能向上率** > 50%

---

## 📞 次のステップ

### テスト成功時
1. 最終レポートに実測値記録
2. 成果の総括
3. プロジェクト完了宣言

### テスト失敗時
1. 追加最適化の検討
2. ボトルネックの特定
3. 段階的改善計画の策定

**🚀 準備完了！テストを開始してください！**
