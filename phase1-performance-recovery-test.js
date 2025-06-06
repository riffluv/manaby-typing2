// Phase 1 Performance Recovery Verification
// ブラウザのコンソールで実行してください

console.log('🚀 Phase 1 Performance Recovery Test 開始');

// パフォーマンステスト用の関数
function testTypingPerformance() {
  const startTime = performance.now();
  let totalTime = 0;
  const iterations = 1000;
  
  console.log(`📊 ${iterations}回のタイピング処理性能テスト開始...`);
  
  for (let i = 0; i < iterations; i++) {
    const iterationStart = performance.now();
    
    // デバッグ関数の呼び出しをシミュレート（実際のタイピング処理と同等）
    window.debug?.typing?.branch?.('テスト');
    window.debug?.typing?.log?.('テスト');
    window.debug?.typing?.cache?.('テスト');
    
    const iterationEnd = performance.now();
    totalTime += (iterationEnd - iterationStart);
  }
  
  const endTime = performance.now();
  const totalTestTime = endTime - startTime;
  const averageTime = totalTime / iterations;
  
  console.log(`✅ テスト完了!`);
  console.log(`📈 総実行時間: ${totalTestTime.toFixed(3)}ms`);
  console.log(`⚡ 平均処理時間: ${averageTime.toFixed(6)}ms`);
  console.log(`🎯 期待値: 0.001ms以下 (Phase 1目標)`);
  
  if (averageTime < 0.001) {
    console.log('🎉 Phase 1パフォーマンス目標達成！');
  } else if (averageTime < 0.01) {
    console.log('✅ 良好なパフォーマンス');
  } else {
    console.log('⚠️ パフォーマンス改善が必要');
  }
  
  return {
    totalTime: totalTestTime,
    averageTime: averageTime,
    iterations: iterations
  };
}

// グローバルに公開
window.testTypingPerformance = testTypingPerformance;

console.log('💡 window.testTypingPerformance() を実行してパフォーマンステストを開始してください');
