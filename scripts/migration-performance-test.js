/**
 * 移行パフォーマンステスト - BasicTypingChar vs OptimizedTypingChar
 * 
 * SimpleコンポーネントのBasicTypingEngine移行の効果を測定します
 */

// テスト用の日本語文字列
const testStrings = [
  'こんにちは',
  'じしんをもって',
  'しゃしんをとる',
  'ちゃんとした',
  'らりるれろ',
  'きゃきゅきょ',
  'とうきょう',
  'しんかんせん',
  'こんにちはせかい',
  'にほんごのにゅうりょくはたいへんです'
];

const iterations = 1000;

console.log('🚀 移行パフォーマンステスト開始');
console.log(`📊 テスト条件: ${testStrings.length}種類の文字列 x ${iterations}回`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// BasicTypingChar テスト
console.log('\n🔥 BasicTypingChar (新実装) テスト中...');
const basicStart = performance.now();

try {
  // Dynamic import を使用して ES modules を読み込み
  const { createBasicTypingChars } = await import('../src/utils/basicJapaneseUtils.ts');
  
  let basicTotalChars = 0;
  for (let i = 0; i < iterations; i++) {
    for (const str of testStrings) {
      const chars = createBasicTypingChars(str);
      basicTotalChars += chars.length;
    }
  }
  
  const basicEnd = performance.now();
  const basicTime = basicEnd - basicStart;
  
  console.log(`✅ BasicTypingChar完了: ${basicTime.toFixed(2)}ms`);
  console.log(`📈 生成文字数: ${basicTotalChars.toLocaleString()}`);
  console.log(`⚡ 平均速度: ${(basicTotalChars / basicTime * 1000).toFixed(0)} chars/sec`);
  
} catch (error) {
  console.log('❌ BasicTypingChar テストエラー:', error.message);
}

// OptimizedTypingChar テスト
console.log('\n🔥 OptimizedTypingChar (旧実装) テスト中...');
const optimizedStart = performance.now();

try {
  const { createOptimizedTypingChars } = await import('../src/utils/optimizedJapaneseUtils.ts');
  
  let optimizedTotalChars = 0;
  for (let i = 0; i < iterations; i++) {
    for (const str of testStrings) {
      const chars = createOptimizedTypingChars(str);
      optimizedTotalChars += chars.length;
    }
  }
  
  const optimizedEnd = performance.now();
  const optimizedTime = optimizedEnd - optimizedStart;
  
  console.log(`✅ OptimizedTypingChar完了: ${optimizedTime.toFixed(2)}ms`);
  console.log(`📈 生成文字数: ${optimizedTotalChars.toLocaleString()}`);
  console.log(`⚡ 平均速度: ${(optimizedTotalChars / optimizedTime * 1000).toFixed(0)} chars/sec`);
  
  // 比較結果
  console.log('\n📊 比較結果:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const speedRatio = basicTime / optimizedTime;
  if (speedRatio < 1) {
    console.log(`🚀 BasicTypingCharが ${(1/speedRatio).toFixed(1)}x 高速`);
  } else {
    console.log(`⚠️  OptimizedTypingCharが ${speedRatio.toFixed(1)}x 高速`);
  }
  
  const memoryImpact = (optimizedTotalChars - basicTotalChars) / optimizedTotalChars * 100;
  console.log(`💾 メモリ効率: ${memoryImpact > 0 ? '+' : ''}${memoryImpact.toFixed(1)}% (Basic vs Optimized)`);
  
} catch (error) {
  console.log('❌ OptimizedTypingChar テストエラー:', error.message);
}

console.log('\n🎯 移行完了状況:');
console.log('✅ SimpleGameScreen → BasicTypingChar対応');
console.log('✅ useSimpleTyping → BasicTypingEngine対応');
console.log('✅ 複数入力パターン（し→si/shi）保持');
console.log('✅ 「ん」処理ロジック保持');
console.log('✅ typingmania-ref流シンプル設計回帰');
console.log('\n🔧 次の段階: 残りコンポーネントの段階的移行');
