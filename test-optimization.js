/**
 * 最適化されたJapaneseProcessor テストスクリプト
 * 「ん」の分岐処理とパフォーマンスをテスト
 */

const { OptimizedJapaneseProcessor } = require('./src/typing/OptimizedJapaneseProcessor.ts');

// テスト用の日本語単語（「ん」を含む複雑なパターン）
const testWords = [
  'プログラミング',     // 'n' 分岐: puroguramingu vs puroguraminngu
  'コンピューター',     // 'n' 分岐: konpyu-ta- vs kompyu-ta-
  'インターネット',     // 'n' 分岐: inta-netto vs iNta-netto
  'プレゼンテーション', // 'n' 分岐: purezenteshon vs purezeNteshon
  'マンション',         // 'n' 分岐: manshon vs maIshon
  'レストラン',         // 文末の「ん」
  'ガンダム',           // 'n' + 'd'の組み合わせ
  'ワンダフル',         // 'n' + w/d の組み合わせ
];

console.log('🚀 最適化されたJapaneseProcessor テスト開始\n');

// パフォーマンステスト
console.log('⏱️  パフォーマンステスト:');
const startTime = performance.now();

testWords.forEach((word, index) => {
  console.log(`\n${index + 1}. テスト単語: "${word}"`);
  
  try {
    // TypingCharの生成をテスト
    const typingChars = OptimizedJapaneseProcessor.convertToTypingChars(word);
    
    console.log(`   - 生成された文字数: ${typingChars.length}`);
    console.log(`   - パターン例: `);
    
    typingChars.slice(0, 3).forEach((char, i) => {
      console.log(`     [${i}] ${char.kana}: ${char.patterns.join(', ')}`);
    });
    
    // 「ん」の文字をチェック
    const nChars = typingChars.filter(char => char.kana === 'ん');
    if (nChars.length > 0) {
      console.log(`   - 「ん」文字数: ${nChars.length}`);
      nChars.forEach((nChar, i) => {
        console.log(`     「ん」[${i}]: ${nChar.patterns.join(', ')}`);
      });
    }
    
  } catch (error) {
    console.error(`   ❌ エラー: ${error.message}`);
  }
});

const endTime = performance.now();
console.log(`\n⏱️  総処理時間: ${(endTime - startTime).toFixed(2)}ms`);

// キャッシュ統計の表示
console.log('\n📊 パフォーマンス統計:');
try {
  const stats = OptimizedJapaneseProcessor.getPerformanceStats();
  console.log(`   - キャッシュサイズ: ${stats.cacheSize}`);
  console.log(`   - キャッシュヒット率: ${stats.cacheHitRate}%`);
  console.log(`   - 総パターン数: ${stats.totalPatterns || 'N/A'}`);
} catch (error) {
  console.log(`   - 統計取得エラー: ${error.message}`);
}

console.log('\n✅ テスト完了');
