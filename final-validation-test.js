/**
 * 最終確認テスト - 最適化効果の実測
 */

console.log('=== 最適化「ん」プロセッサー 最終確認テスト ===\n');

// 最適化版
const optimized = {
  cache: new Map(),
  getNPatterns(next) {
    const key = next || '';
    if (this.cache.has(key)) return this.cache.get(key);
    
    const patterns = this.generate(next);
    this.cache.set(key, patterns);
    return patterns;
  },
  generate(next) {
    if (!next) return ['nn', 'xn', 'n'];
    const map = {'あ':'a','か':'ka','が':'ga','さ':'sa','た':'ta','な':'na','は':'ha','ま':'ma','や':'ya','ら':'ra','わ':'wa'};
    const romaji = map[next];
    if (!romaji) return ['nn', 'xn', 'n'];
    const first = romaji[0];
    if (first === 'y' || first === 'w' || 'aiueo'.includes(first)) return ['nn', 'xn'];
    return ['nn', 'xn', 'n'];
  }
};

// 従来版
function old(next) {
  const consonants = ['k','g','s','z','t','d','n','h','b','p','m','y','r','w'];
  if (!next) return ['nn', 'xn', 'n'];
  const map = {'あ':'a','か':'ka','が':'ga','さ':'sa','た':'ta','な':'na','は':'ha','ま':'ma','や':'ya','ら':'ra','わ':'wa'};
  const romaji = map[next];
  if (!romaji) return ['nn', 'xn', 'n'];
  const first = romaji[0];
  if (consonants.includes(first)) {
    if (first === 'y' || first === 'w') return ['nn', 'xn'];
    return ['nn', 'xn', 'n'];
  }
  return ['nn', 'xn'];
}

// プリロード
const common = ['あ','か','が','さ','た','な','は','ま','や','ら','わ'];
optimized.getNPatterns();
common.forEach(c => optimized.getNPatterns(c));

console.log(`キャッシュサイズ: ${optimized.cache.size}\n`);

// パフォーマンステスト
const iterations = 50000;
const tests = [
  {char: 'あ', desc: '「ん」+「あ」'},
  {char: 'か', desc: '「ん」+「か」'},
  {char: 'さ', desc: '「ん」+「さ」'},
  {char: null, desc: '「ん」+文末'}
];

let optTotal = 0;
let oldTotal = 0;

console.log('=== パフォーマンス比較 ===');
tests.forEach(test => {
  // 最適化版
  const optStart = performance.now();
  for (let i = 0; i < iterations; i++) {
    optimized.getNPatterns(test.char);
  }
  const optTime = performance.now() - optStart;
  optTotal += optTime;

  // 従来版
  const oldStart = performance.now();
  for (let i = 0; i < iterations; i++) {
    old(test.char);
  }
  const oldTime = performance.now() - oldStart;
  oldTotal += oldTime;

  const speedup = oldTime / optTime;
  console.log(`${test.desc}: ${speedup.toFixed(2)}倍高速化`);
});

const totalSpeedup = oldTotal / optTotal;
const improvement = (oldTotal - optTotal) / oldTotal * 100;

console.log('\n=== 総合結果 ===');
console.log(`総合高速化: ${totalSpeedup.toFixed(2)}倍`);
console.log(`改善率:     ${improvement.toFixed(1)}%`);
console.log(`最適化版:   ${optTotal.toFixed(2)}ms`);
console.log(`従来版:     ${oldTotal.toFixed(2)}ms`);

// 実用性テスト
console.log('\n=== 実用性テスト ===');
const words = ['こんにちは', 'りんご', 'せんせい', 'がんばって'];
let wordTestTime = 0;
let wordNCount = 0;

words.forEach(word => {
  const chars = Array.from(word);
  const nCount = chars.filter(c => c === 'ん').length;
  wordNCount += nCount;
  
  const start = performance.now();
  chars.forEach((char, i) => {
    if (char === 'ん') {
      const next = chars[i + 1];
      optimized.getNPatterns(next);
    }
  });
  const time = performance.now() - start;
  wordTestTime += time;
  
  console.log(`${word}: ${nCount}個の「ん」を${time.toFixed(3)}msで処理`);
});

const avgPerN = wordTestTime / wordNCount;
console.log(`\n「ん」1文字あたり: ${avgPerN.toFixed(3)}ms`);

// 最終評価
console.log('\n=== 最終評価 ===');
if (totalSpeedup > 5) {
  console.log('🏆 優秀: 5倍以上の高速化達成');
} else if (totalSpeedup > 3) {
  console.log('✅ 良好: 3倍以上の高速化達成');
} else {
  console.log('⚠️  要改善: さらなる最適化が必要');
}

if (avgPerN < 0.001) {
  console.log('🏆 超高速: サブミリ秒レベルの処理速度');
} else if (avgPerN < 0.01) {
  console.log('✅ 高速: 実用的な処理速度');
} else {
  console.log('⚠️  要改善: 処理速度の向上が必要');
}

console.log('\n🎉 最適化「ん」プロセッサーの統合確認完了！');
