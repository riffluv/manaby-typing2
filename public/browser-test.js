// ブラウザ開発者コンソール用テストスクリプト
// F12 → Console で実行してください

console.log('🚀 OptimizedJapaneseProcessor テスト開始');

// テスト1: 基本的な変換テスト
async function testBasicConversion() {
  console.log('\n📝 テスト1: 基本的な日本語変換');
  
  const testWords = ['こんにちは', 'プログラミング', 'インターネット'];
  
  for (const word of testWords) {
    try {
      const { OptimizedJapaneseProcessor } = await import('/src/typing/OptimizedJapaneseProcessor.ts');
      const result = OptimizedJapaneseProcessor.convertToTypingChars(word);
      
      console.log(`"${word}" → ${result.length}文字`);
      result.slice(0, 3).forEach((char, i) => {
        console.log(`  [${i}] ${char.kana}: ${char.patterns.join(', ')}`);
      });
    } catch (error) {
      console.error(`❌ "${word}": ${error.message}`);
    }
  }
}

// テスト2: 「ん」の分岐処理テスト
async function testNBranching() {
  console.log('\n🔄 テスト2: 「ん」の分岐処理');
  
  const nWords = ['プログラミング', 'コンピューター', 'レストラン'];
  
  for (const word of nWords) {
    try {
      const { OptimizedJapaneseProcessor } = await import('/src/typing/OptimizedJapaneseProcessor.ts');
      const result = OptimizedJapaneseProcessor.convertToTypingChars(word);
      
      const nChars = result.filter(char => char.kana === 'ん');
      if (nChars.length > 0) {
        console.log(`"${word}" の「ん」:`, nChars.map(n => n.patterns));
      }
    } catch (error) {
      console.error(`❌ "${word}": ${error.message}`);
    }
  }
}

// テスト3: パフォーマンステスト
async function testPerformance() {
  console.log('\n⏱️ テスト3: パフォーマンステスト');
  
  const iterations = 100;
  const testWord = 'プログラミング';
  
  try {
    const { OptimizedJapaneseProcessor } = await import('/src/typing/OptimizedJapaneseProcessor.ts');
    
    const startTime = performance.now();
    
    for (let i = 0; i < iterations; i++) {
      OptimizedJapaneseProcessor.convertToTypingChars(testWord);
    }
    
    const endTime = performance.now();
    const avgTime = (endTime - startTime) / iterations;
    
    console.log(`${iterations}回実行の平均処理時間: ${avgTime.toFixed(3)}ms`);
    
    // 統計情報を取得
    if (OptimizedJapaneseProcessor.getPerformanceStats) {
      const stats = OptimizedJapaneseProcessor.getPerformanceStats();
      console.log('キャッシュ統計:', stats);
    }
    
  } catch (error) {
    console.error(`❌ パフォーマンステストエラー: ${error.message}`);
  }
}

// 全てのテストを実行
async function runAllTests() {
  console.log('==========================================');
  await testBasicConversion();
  await testNBranching();
  await testPerformance();
  console.log('\n✅ 全テスト完了');
  console.log('==========================================');
}

// テスト実行
runAllTests().catch(console.error);

// 個別テスト関数もエクスポート
window.testBasicConversion = testBasicConversion;
window.testNBranching = testNBranching;
window.testPerformance = testPerformance;
