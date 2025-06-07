// 🚀 SUB-5MS パフォーマンステスト実行スクリプト
// ブラウザ開発者コンソールで実行してください

console.log('🚀 SUB-5MS入力遅延測定テスト開始');
console.log('==========================================');

// 1. 現在のパフォーマンス統計を取得
function getPerformanceStats() {
  if (typeof window.performanceDebug !== 'undefined') {
    const stats = window.performanceDebug.getStats();
    console.log('📊 現在のパフォーマンス統計:', stats);
    return stats;
  } else {
    console.log('⚠️ window.performanceDebug が見つかりません');
    return null;
  }
}

// 2. 統計をクリア
function clearStats() {
  if (typeof window.performanceDebug !== 'undefined' && window.performanceDebug.clearStats) {
    window.performanceDebug.clearStats();
    console.log('🧹 パフォーマンス統計をクリアしました');
  }
}

// 3. テスト結果の評価
function evaluateResults(stats) {
  if (!stats || !stats.input_delay) {
    console.log('❌ 測定データが不足しています');
    return false;
  }
  
  const inputDelay = stats.input_delay;
  const maxDelay = Math.max(inputDelay.max || 0, inputDelay.avg || 0);
  
  console.log('=== 🎯 SUB-5MS目標評価 ===');
  console.log(`最大遅延: ${maxDelay.toFixed(2)}ms`);
  console.log(`平均遅延: ${(inputDelay.avg || 0).toFixed(2)}ms`);
  console.log(`最小遅延: ${(inputDelay.min || 0).toFixed(2)}ms`);
  console.log(`測定回数: ${inputDelay.count || 0}回`);
  
  if (maxDelay < 5.0) {
    console.log('🎉 ✅ SUB-5MS目標達成！');
    console.log(`🚀 性能向上率: ${((10 - maxDelay) / 10 * 100).toFixed(1)}%`);
    return true;
  } else {
    console.log(`❌ 目標未達成 (${maxDelay.toFixed(2)}ms > 5.0ms)`);
    return false;
  }
}

// 4. 自動テスト実行（オプション）
function runAutomaticTest() {
  console.log('🤖 自動テスト実行中...');
  
  // 統計をクリア
  clearStats();
  
  // 仮想キー入力をシミュレート（実際のタイピングエンジンが動作中の場合）
  const testKeys = ['k', 'o', 'n', 'n', 'i', 'c', 'h', 'i', 'w', 'a'];
  let keyIndex = 0;
  
  const interval = setInterval(() => {
    if (keyIndex >= testKeys.length) {
      clearInterval(interval);
      setTimeout(() => {
        const finalStats = getPerformanceStats();
        evaluateResults(finalStats);
      }, 500);
      return;
    }
    
    // キーイベントを発火
    const keyEvent = new KeyboardEvent('keydown', {
      key: testKeys[keyIndex],
      code: `Key${testKeys[keyIndex].toUpperCase()}`,
      bubbles: true
    });
      document.dispatchEvent(keyEvent);
    keyIndex++;
  }, 100);
}

// 5. テスト実行用関数をグローバルに公開
window.sub5msTest = {
  getStats: getPerformanceStats,
  clearStats: clearStats,
  evaluate: evaluateResults,
  autoTest: runAutomaticTest
};

console.log('=== 📋 テスト実行手順 ===');
console.log('1. タイピングゲームを開始');
console.log('2. 数回のキー入力を実行');
console.log('3. window.sub5msTest.getStats() で統計取得');
console.log('4. window.sub5msTest.evaluate(stats) で評価');
console.log('');
console.log('または');
console.log('window.sub5msTest.autoTest() で自動テスト実行');
console.log('==========================================');
