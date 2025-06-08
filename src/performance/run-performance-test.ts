/**
 * タイピングパフォーマンステスト実行ファイル
 * 
 * 「ん」の処理によるパフォーマンス劣化を測定し、
 * 最適化のための詳細な分析データを生成する
 */

import { TypingPerformanceBenchmark } from '../performance/TypingPerformanceBenchmark';

/**
 * パフォーマンステストを実行し、結果を出力
 */
async function runPerformanceAnalysis() {
  const benchmark = new TypingPerformanceBenchmark();
  
  console.log("🔬 タイピングエンジンパフォーマンス分析を開始します...");
  console.log("この分析により、「ん」処理によるパフォーマンス劣化を特定します。\n");
  
  try {
    // 1. 詳細ベンチマークスイート実行
    console.log("Phase 1: 詳細パフォーマンス測定");
    const suiteResults = await benchmark.runBenchmarkSuite();
    console.log(benchmark.formatResults(suiteResults));
    
    // 2. 比較ベンチマーク実行
    console.log("Phase 2: typingmania-ref との比較");
    const comparisonResults = await benchmark.runComparisonBenchmark();
    console.log(benchmark.formatComparisonResults(comparisonResults));
    
    // 3. パフォーマンス劣化の分析
    console.log("Phase 3: パフォーマンス劣化分析");
    analyzePerformanceDegradation(suiteResults, comparisonResults);
    
    // 4. 最適化提案
    console.log("Phase 4: 最適化提案");
    generateOptimizationRecommendations(suiteResults, comparisonResults);
    
  } catch (error) {
    console.error("❌ パフォーマンステスト中にエラーが発生しました:", error);
  }
}

/**
 * パフォーマンス劣化の詳細分析
 */
function analyzePerformanceDegradation(suiteResults: any, comparisonResults: any) {
  console.log("\n📊 パフォーマンス劣化分析");
  console.log("=" + "=".repeat(50));
  
  const baseline = suiteResults.simple.averageTime;
  const nLight = suiteResults.nCharacterLight.averageTime;
  const nHeavy = suiteResults.nCharacterHeavy.averageTime;
  const complex = suiteResults.complexSentence.averageTime;
  
  console.log("\n🔍 処理時間の詳細:");
  console.log(`  ベースライン (「ん」なし): ${baseline.toFixed(4)} ms`);
  console.log(`  軽い「ん」処理: ${nLight.toFixed(4)} ms (+${((nLight/baseline-1)*100).toFixed(1)}%)`);
  console.log(`  重い「ん」処理: ${nHeavy.toFixed(4)} ms (+${((nHeavy/baseline-1)*100).toFixed(1)}%)`);
  console.log(`  複雑な文: ${complex.toFixed(4)} ms (+${((complex/baseline-1)*100).toFixed(1)}%)`);
  
  // ボトルネック特定
  console.log("\n🎯 ボトルネック特定:");
  
  if ((nLight / baseline) > 2.0) {
    console.log("  ⚠️  軽い「ん」処理でも2倍以上の処理時間 - 分岐処理の根本的見直しが必要");
  } else if ((nLight / baseline) > 1.5) {
    console.log("  ⚠️  軽い「ん」処理で50%以上の増加 - 分岐処理の最適化が必要");
  } else {
    console.log("  ✅ 軽い「ん」処理のオーバーヘッドは許容範囲");
  }
  
  if ((nHeavy / nLight) > 2.0) {
    console.log("  ⚠️  複雑な「ん」処理で処理時間が倍増 - 分岐アルゴリズムの見直しが必要");
  } else {
    console.log("  ✅ 複雑性によるパフォーマンス劣化は許容範囲");
  }
  
  // 実用性評価
  console.log("\n📱 実用性評価:");
  const targetResponseTime = 16.67; // 60FPS = 16.67ms per frame
  
  if (complex > targetResponseTime) {
    console.log(`  ❌ 複雑な文の処理時間 (${complex.toFixed(2)}ms) が60FPS閾値 (${targetResponseTime}ms) を超過`);
    console.log("     ユーザーが体感できるレベルの遅延が発生している可能性");
  } else if (complex > (targetResponseTime * 0.5)) {
    console.log(`  ⚠️  複雑な文の処理時間 (${complex.toFixed(2)}ms) が60FPS閾値の50%を超過`);
    console.log("     高負荷時に遅延が体感される可能性");
  } else {
    console.log(`  ✅ 処理時間 (${complex.toFixed(2)}ms) は60FPS閾値内で良好`);
  }
}

/**
 * 最適化提案を生成
 */
function generateOptimizationRecommendations(suiteResults: any, comparisonResults: any) {
  console.log("\n💡 最適化提案");
  console.log("=" + "=".repeat(50));
  
  const performanceRatio = comparisonResults.performanceRatio;
  const complexTime = suiteResults.complexSentence.averageTime;
  const lightTime = suiteResults.nCharacterLight.averageTime;
  const baselineTime = suiteResults.simple.averageTime;
  
  console.log("\n🎯 優先度別最適化提案:");
  
  // 高優先度
  if (performanceRatio > 3 || complexTime > 16.67) {
    console.log("\n🔴 高優先度 (即座に対応が必要):");
    console.log("  1. 分岐状態管理の簡素化");
    console.log("     - branchingState の条件チェックを軽量化");
    console.log("     - 不要な次文字参照を削除");
    console.log("  2. パターンマッチングのキャッシュ化");
    console.log("     - よく使用される「ん」パターンをプリコンパイル");
    console.log("  3. 分岐処理のアーリーリターン最適化");
    console.log("     - 無効なケースの早期判定");
  }
  
  // 中優先度
  if (performanceRatio > 2 || (lightTime / baselineTime) > 1.5) {
    console.log("\n🟡 中優先度 (パフォーマンス改善のため):");
    console.log("  1. 「ん」の動的パターン生成を静的化");
    console.log("     - japaneseUtils.ts の generateNPatterns を事前計算");
    console.log("  2. TypingChar.ts の分岐処理をインライン化");
    console.log("     - 関数呼び出しオーバーヘッドを削減");
    console.log("  3. 条件分岐の順序最適化");
    console.log("     - 高頻度パターンを先に判定");
  }
  
  // 低優先度
  console.log("\n🟢 低優先度 (長期的改善のため):");
  console.log("  1. Web Worker での「ん」処理");
  console.log("     - メインスレッドをブロックしない非同期処理");
  console.log("  2. WASM での高速パターンマッチング");
  console.log("     - ネイティブレベルの処理速度");
  console.log("  3. 機械学習による「ん」予測");
  console.log("     - ユーザーの入力パターンを学習して先読み");
  
  // 具体的な実装提案
  console.log("\n🛠️  具体的な実装提案:");
  console.log("  1. 'ん'パターンのルックアップテーブル化");
  console.log("     - 現在: 動的生成 → 提案: 静的テーブル");
  console.log("  2. 分岐条件の最適化");
  console.log("     - 現在: 毎回次文字チェック → 提案: キャッシュ済み結果使用");
  console.log("  3. 処理パイプラインの簡素化");
  console.log("     - 現在: 多層処理 → 提案: 単一最適化ルート");
  
  // パフォーマンス目標
  console.log("\n🎯 パフォーマンス改善目標:");
  const currentThroughput = comparisonResults.current.throughput;
  const referenceThroughput = comparisonResults.reference.throughput;
  const targetImprovement = Math.max(2, performanceRatio * 0.8);
  
  console.log(`  現在のスループット: ${currentThroughput.toFixed(0)} ops/sec`);
  console.log(`  参考実装: ${referenceThroughput.toFixed(0)} ops/sec`);
  console.log(`  目標スループット: ${(currentThroughput * targetImprovement).toFixed(0)} ops/sec`);
  console.log(`  目標改善率: ${((targetImprovement - 1) * 100).toFixed(0)}% 向上`);
}

/**
 * メイン実行
 */
if (require.main === module) {
  runPerformanceAnalysis().catch(console.error);
}

export { runPerformanceAnalysis };
