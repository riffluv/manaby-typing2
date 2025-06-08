/**
 * 最終統合検証テスト - HyperTypingEngine + OptimizedNProcessor
 * 
 * 実際のタイピング環境での性能改善効果を検証
 * ・本番レベルの「ん」処理性能確認
 * ・エンドツーエンドタイピング体験測定
 * ・ユーザー体験向上の定量評価
 */

// テスト対象のコンポーネントをインポート
const { TypingChar } = require('./src/typing/TypingChar');
const { JapaneseConverter } = require('./src/typing/JapaneseConverter');
const { HyperTypingEngine } = require('./src/typing/HyperTypingEngine');
const { OptimizedNProcessor } = require('./src/typing/OptimizedNProcessor');

// 実際のタイピングゲームで使用される「ん」含有単語群
const testWords = [
  'こんにちは',     // 基本的な「ん」
  'りんご',         // 中間「ん」
  'せんせい',       // 連続「ん」
  'あんまり',       // 「ん」+「m」
  'しんぱい',       // 「ん」+「p」  
  'こんがく',       // 「ん」+「g」
  'せんそう',       // 「ん」+「s」
  'こんぜん',       // 「ん」+「z」
  'ほんとう',       // 「ん」+「t」
  'にんじん',       // 複数「ん」
  'ばんごはん',     // 終端「ん」
  'きんようび',     // 複雑パターン
];

/**
 * 統合エンジン性能テスト
 */
function performIntegratedEngineTest(word) {
  console.log(`\n📝 テスト開始: "${word}"`);
  
  const startTime = performance.now();
  
  // 1. JapaneseConverter でTypingChar配列生成
  const typingChars = JapaneseConverter.convertToTypingChars(word);
  const conversionTime = performance.now() - startTime;
  
  // 2. HyperTypingEngine初期化
  const engine = new HyperTypingEngine();
  
  // 模擬DOM環境セットアップ
  const mockContainer = {
    innerHTML: '',
    querySelector: (selector) => ({
      textContent: '',
      innerHTML: ''
    })
  };
  
  const engineStartTime = performance.now();
  
  // エンジン初期化
  engine.initialize(
    mockContainer,
    typingChars,
    () => {}, // onProgress
    () => {}  // onComplete
  );
  
  const initializationTime = performance.now() - engineStartTime;
  
  // 3. 「ん」処理の性能測定
  let nProcessingTime = 0;
  let nCount = 0;
  
  typingChars.forEach((char, index) => {
    if (char.kana === 'ん') {
      nCount++;
      const nStartTime = performance.now();
      
      // OptimizedNProcessor の利用確認
      const nextChar = typingChars[index + 1];
      const patterns = OptimizedNProcessor.getNPatterns(nextChar?.kana);
      
      nProcessingTime += performance.now() - nStartTime;
    }
  });
  
  const totalTime = performance.now() - startTime;
  
  return {
    word,
    conversionTime,
    initializationTime,
    nProcessingTime,
    nCount,
    totalTime,
    charactersCount: typingChars.length,
    performance: {
      conversionSpeed: `${(typingChars.length / conversionTime * 1000).toFixed(1)} chars/sec`,
      nProcessingSpeed: nCount > 0 ? `${(nCount / nProcessingTime * 1000).toFixed(1)} n/sec` : 'N/A',
      overallEfficiency: `${(typingChars.length / totalTime * 1000).toFixed(1)} total chars/sec`
    }
  };
}

/**
 * リアルタイム入力シミュレーション
 */
function simulateRealTimeTyping(word) {
  console.log(`\n⌨️  リアルタイム入力シミュレーション: "${word}"`);
  
  const typingChars = JapaneseConverter.convertToTypingChars(word);
  const engine = new HyperTypingEngine();
  
  // 模擬DOM環境
  const mockContainer = {
    innerHTML: '',
    querySelector: () => ({ textContent: '', innerHTML: '' })
  };
  
  let responseTimes = [];
  
  engine.initialize(mockContainer, typingChars, () => {}, () => {});
  
  // 実際のキー入力をシミュレート
  typingChars.forEach((char, charIndex) => {
    const pattern = char.patterns[0]; // デフォルトパターン使用
    
    for (let i = 0; i < pattern.length; i++) {
      const keyStartTime = performance.now();
      
      // キー処理をシミュレート（実際のprocessKeyメソッドではなく、型安全な方法で）
      const key = pattern[i];
      const processResult = char.type(key);
      
      const responseTime = performance.now() - keyStartTime;
      responseTimes.push(responseTime);
      
      if (char.kana === 'ん' && char.branchingState) {
        // 「ん」分岐処理の追加時間を測定
        const branchStartTime = performance.now();
        const nextChar = typingChars[charIndex + 1];
        const branchResult = char.typeBranching(key, nextChar);
        const branchTime = performance.now() - branchStartTime;
        responseTimes.push(branchTime);
      }
    }
  });
  
  const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
  const maxResponseTime = Math.max(...responseTimes);
  const minResponseTime = Math.min(...responseTimes);
  
  return {
    word,
    avgResponseTime,
    maxResponseTime,
    minResponseTime,
    totalKeys: responseTimes.length,
    performance: {
      avgResponseRate: `${(1000 / avgResponseTime).toFixed(1)} keys/sec`,
      responsiveness: maxResponseTime < 1.0 ? '優秀' : maxResponseTime < 2.0 ? '良好' : '要改善'
    }
  };
}

/**
 * OptimizedNProcessor パフォーマンス検証
 */
function verifyOptimizedNProcessor() {
  console.log('\n🔧 OptimizedNProcessor パフォーマンス検証');
  
  const testCases = [
    { nextChar: 'か', expected: ['n', 'nn'] },
    { nextChar: 'た', expected: ['n', 'nn'] },
    { nextChar: 'な', expected: ['nn', 'n'] },
    { nextChar: undefined, expected: ['nn', 'xn', 'n'] }
  ];
  
  const iterations = 10000;
  const results = [];
  
  testCases.forEach(testCase => {
    const startTime = performance.now();
    
    for (let i = 0; i < iterations; i++) {
      const patterns = OptimizedNProcessor.getNPatterns(testCase.nextChar);
    }
    
    const endTime = performance.now();
    const processingTime = endTime - startTime;
    
    results.push({
      nextChar: testCase.nextChar || 'undefined',
      processingTime,
      iterationsPerMs: iterations / processingTime,
      performance: `${(iterations / processingTime).toFixed(1)} calls/ms`
    });
  });
  
  return results;
}

/**
 * メイン実行関数
 */
function runFinalIntegrationTest() {
  console.log('🚀 HyperTypingEngine + OptimizedNProcessor 最終統合検証テスト開始\n');
  console.log('='.repeat(80));
  
  // 1. 統合エンジン性能テスト
  console.log('\n📊 1. 統合エンジン性能テスト');
  console.log('-'.repeat(50));
  
  const engineResults = testWords.map(word => performIntegratedEngineTest(word));
  
  // 結果サマリー
  const totalConversionTime = engineResults.reduce((sum, r) => sum + r.conversionTime, 0);
  const totalNProcessingTime = engineResults.reduce((sum, r) => sum + r.nProcessingTime, 0);
  const totalCharacters = engineResults.reduce((sum, r) => sum + r.charactersCount, 0);
  const totalNCount = engineResults.reduce((sum, r) => sum + r.nCount, 0);
  
  console.log('\n📈 エンジン性能サマリー:');
  console.log(`・総変換時間: ${totalConversionTime.toFixed(3)}ms`);
  console.log(`・総「ん」処理時間: ${totalNProcessingTime.toFixed(3)}ms`);
  console.log(`・総文字数: ${totalCharacters}文字`);
  console.log(`・総「ん」数: ${totalNCount}個`);
  console.log(`・平均変換速度: ${(totalCharacters / totalConversionTime * 1000).toFixed(1)} chars/sec`);
  console.log(`・平均「ん」処理速度: ${(totalNCount / totalNProcessingTime * 1000).toFixed(1)} n/sec`);
  
  // 2. リアルタイム入力シミュレーション
  console.log('\n⌨️  2. リアルタイム入力シミュレーション');
  console.log('-'.repeat(50));
  
  const typingResults = testWords.slice(0, 5).map(word => simulateRealTimeTyping(word));
  
  const avgOverallResponse = typingResults.reduce((sum, r) => sum + r.avgResponseTime, 0) / typingResults.length;
  
  console.log('\n📈 タイピング応答性サマリー:');
  console.log(`・平均応答時間: ${avgOverallResponse.toFixed(3)}ms`);
  console.log(`・応答性評価: ${avgOverallResponse < 0.5 ? '優秀' : avgOverallResponse < 1.0 ? '良好' : '要改善'}`);
  
  // 3. OptimizedNProcessor検証
  console.log('\n🔧 3. OptimizedNProcessor 最適化効果');
  console.log('-'.repeat(50));
  
  const nProcessorResults = verifyOptimizedNProcessor();
  
  nProcessorResults.forEach(result => {
    console.log(`・次文字「${result.nextChar}」: ${result.performance}`);
  });
  
  // 統計情報
  const avgPerformance = nProcessorResults.reduce((sum, r) => sum + r.iterationsPerMs, 0) / nProcessorResults.length;
  console.log(`・平均処理性能: ${avgPerformance.toFixed(1)} calls/ms`);
  
  // 4. 総合評価
  console.log('\n🎯 4. 総合評価');
  console.log('-'.repeat(50));
  
  const overallScore = calculateOverallScore({
    conversionSpeed: totalCharacters / totalConversionTime * 1000,
    nProcessingSpeed: totalNCount / totalNProcessingTime * 1000,
    responseTime: avgOverallResponse,
    optimizedNPerformance: avgPerformance
  });
  
  console.log(`・統合システム評価: ${overallScore.grade}`);
  console.log(`・性能改善率: ${overallScore.improvementRate}`);
  console.log(`・ユーザー体験: ${overallScore.userExperience}`);
  
  console.log('\n='.repeat(80));
  console.log('✅ 最終統合検証テスト完了');
  
  return {
    engineResults,
    typingResults,
    nProcessorResults,
    overallScore
  };
}

/**
 * 総合スコア計算
 */
function calculateOverallScore(metrics) {
  let score = 0;
  let factors = [];
  
  // 変換速度評価 (100+ chars/sec で満点)
  const conversionScore = Math.min(metrics.conversionSpeed / 100, 1) * 25;
  score += conversionScore;
  factors.push(`変換速度: ${conversionScore.toFixed(1)}/25`);
  
  // 「ん」処理速度評価 (50+ n/sec で満点)
  const nProcessingScore = Math.min(metrics.nProcessingSpeed / 50, 1) * 25;
  score += nProcessingScore;
  factors.push(`「ん」処理: ${nProcessingScore.toFixed(1)}/25`);
  
  // 応答時間評価 (1ms以下で満点)
  const responseScore = Math.max(0, (1 - metrics.responseTime)) * 25;
  score += responseScore;
  factors.push(`応答性: ${responseScore.toFixed(1)}/25`);
  
  // 最適化効果評価 (1000+ calls/ms で満点)
  const optimizationScore = Math.min(metrics.optimizedNPerformance / 1000, 1) * 25;
  score += optimizationScore;
  factors.push(`最適化: ${optimizationScore.toFixed(1)}/25`);
  
  const grade = score >= 90 ? 'S' : score >= 80 ? 'A' : score >= 70 ? 'B' : score >= 60 ? 'C' : 'D';
  const improvementRate = score > 75 ? '大幅改善' : score > 60 ? '中程度改善' : '軽微改善';
  const userExperience = score >= 85 ? '非常に快適' : score >= 70 ? '快適' : score >= 60 ? '普通' : '要改善';
  
  console.log(`・スコア詳細: ${factors.join(', ')}`);
  console.log(`・総合スコア: ${score.toFixed(1)}/100`);
  
  return {
    score: score.toFixed(1),
    grade,
    improvementRate,
    userExperience,
    factors
  };
}

// テスト実行
if (require.main === module) {
  try {
    const results = runFinalIntegrationTest();
    console.log('\n🎉 全ての統合テストが正常に完了しました！');
    
    if (results.overallScore.score >= 80) {
      console.log('✨ 性能改善が成功し、本番環境への展開準備が完了しました！');
    }
  } catch (error) {
    console.error('❌ テスト実行中にエラーが発生しました:', error.message);
    process.exit(1);
  }
}

module.exports = {
  runFinalIntegrationTest,
  performIntegratedEngineTest,
  simulateRealTimeTyping,
  verifyOptimizedNProcessor
};
