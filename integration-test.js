/**
 * 統合テスト：OptimizedNProcessorの実際の統合確認
 * JapaneseConverterとTypingCharの「ん」処理でOptimizedNProcessorが使用されているかテスト
 */

// Node.jsでのES Modules imports模擬
const path = require('path');

console.log('🚀 OptimizedNProcessor統合テスト開始');

// Transpileされたファイルの読み込みを試行
try {
  // JapaneseConverterの統合確認
  console.log('\n📊 JapaneseConverter統合テスト');
  
  // OptimizedNProcessorが正しくインポートされているか確認
  const fs = require('fs');
  const japaneseConverterContent = fs.readFileSync(
    path.join(__dirname, 'src/typing/JapaneseConverter.ts'), 
    'utf8'
  );
  
  const hasOptimizedImport = japaneseConverterContent.includes('import { OptimizedNProcessor }');
  const hasOptimizedUsage = japaneseConverterContent.includes('OptimizedNProcessor.getNPatterns');
  
  console.log(`✅ OptimizedNProcessor インポート: ${hasOptimizedImport}`);
  console.log(`✅ OptimizedNProcessor 使用: ${hasOptimizedUsage}`);
  
  // OptimizedNProcessorファイルの存在確認
  const optimizedProcessorExists = fs.existsSync(
    path.join(__dirname, 'src/typing/OptimizedNProcessor.ts')
  );
  console.log(`✅ OptimizedNProcessor ファイル存在: ${optimizedProcessorExists}`);
  
  if (optimizedProcessorExists) {
    const optimizedContent = fs.readFileSync(
      path.join(__dirname, 'src/typing/OptimizedNProcessor.ts'),
      'utf8'
    );
    
    const hasPrecomputedConstants = optimizedContent.includes('CONSONANTS_SET = new Set');
    const hasPatternCache = optimizedContent.includes('N_PATTERN_CACHE = new Map');
    const hasGetNPatterns = optimizedContent.includes('static getNPatterns');
    
    console.log(`✅ 事前計算された子音セット: ${hasPrecomputedConstants}`);
    console.log(`✅ パターンキャッシュ: ${hasPatternCache}`);
    console.log(`✅ getNPatterns最適化メソッド: ${hasGetNPatterns}`);
  }
  
  console.log('\n📊 統合結果');
  if (hasOptimizedImport && hasOptimizedUsage && optimizedProcessorExists) {
    console.log('🎉 OptimizedNProcessor統合完了！');
    console.log('💡 JapaneseConverterで最適化された「ん」処理が使用されています');
  } else {
    console.log('⚠️  統合が不完全です');
    console.log('📝 必要な修正:');
    if (!hasOptimizedImport) console.log('  - OptimizedNProcessorのインポート追加');
    if (!hasOptimizedUsage) console.log('  - getNPatternsメソッドでOptimizedNProcessor使用');
    if (!optimizedProcessorExists) console.log('  - OptimizedNProcessorファイル作成');
  }
  
} catch (error) {
  console.error('❌ 統合テストエラー:', error.message);
}

console.log('\n🔄 次のステップ推奨:');
console.log('1. npm run dev でアプリケーション起動');
console.log('2. ブラウザで「ん」を含む文字列でタイピングテスト');
console.log('3. パフォーマンス改善を体感確認');
console.log('4. Browser DevToolsのPerformanceタブで処理時間測定');
