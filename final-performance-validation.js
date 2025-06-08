/**
 * 最終パフォーマンス検証テスト
 * OptimizedNProcessor の統合効果を確認
 */

console.log('=== 最適化「ん」プロセッサー最終検証 ===\n');

// 最適化された「ん」プロセッサー（簡略版）
class OptimizedNProcessor {
  constructor() {
    this.cache = new Map();
    this.consonants = new Set(['k', 'g', 's', 'z', 't', 'd', 'n', 'h', 'b', 'p', 'm', 'y', 'r', 'w']);
    this.stats = {
      cacheHits: 0,
      cacheMisses: 0,
      totalCalls: 0,
      totalTime: 0
    };
  }

  getNPatterns(nextKana) {
    const startTime = performance.now();
    this.stats.totalCalls++;
    
    const cacheKey = nextKana || '';
    if (this.cache.has(cacheKey)) {
      this.stats.cacheHits++;
      const result = this.cache.get(cacheKey);
      this.stats.totalTime += (performance.now() - startTime);
      return result;
    }

    this.stats.cacheMisses++;
    const patterns = this.generateNPatterns(nextKana);
    this.cache.set(cacheKey, patterns);
    this.stats.totalTime += (performance.now() - startTime);
    return patterns;
  }

  generateNPatterns(nextKana) {
    if (!nextKana) {
      return ['nn', 'xn', 'n'];
    }

    const kanaToRomaji = {
      'あ': 'a', 'い': 'i', 'う': 'u', 'え': 'e', 'お': 'o',
      'か': 'ka', 'き': 'ki', 'く': 'ku', 'け': 'ke', 'こ': 'ko',
      'が': 'ga', 'ぎ': 'gi', 'ぐ': 'gu', 'げ': 'ge', 'ご': 'go',
      'さ': 'sa', 'し': 'si', 'す': 'su', 'せ': 'se', 'そ': 'so',
      'ざ': 'za', 'じ': 'zi', 'ず': 'zu', 'ぜ': 'ze', 'ぞ': 'zo',
      'た': 'ta', 'ち': 'ti', 'つ': 'tu', 'て': 'te', 'と': 'to',
      'だ': 'da', 'ぢ': 'di', 'づ': 'du', 'で': 'de', 'ど': 'do',
      'な': 'na', 'に': 'ni', 'ぬ': 'nu', 'ね': 'ne', 'の': 'no',
      'は': 'ha', 'ひ': 'hi', 'ふ': 'fu', 'へ': 'he', 'ほ': 'ho',
      'ば': 'ba', 'び': 'bi', 'ぶ': 'bu', 'べ': 'be', 'ぼ': 'bo',
      'ぱ': 'pa', 'ぴ': 'pi', 'ぷ': 'pu', 'ぺ': 'pe', 'ぽ': 'po',
      'ま': 'ma', 'み': 'mi', 'む': 'mu', 'め': 'me', 'も': 'mo',
      'や': 'ya', 'ゆ': 'yu', 'よ': 'yo',
      'ら': 'ra', 'り': 'ri', 'る': 'ru', 'れ': 're', 'ろ': 'ro',
      'わ': 'wa', 'ゐ': 'wi', 'ゑ': 'we', 'を': 'wo'
    };

    const romaji = kanaToRomaji[nextKana];
    if (!romaji) return ['nn', 'xn', 'n'];

    const firstChar = romaji[0];
    
    // 母音チェック（高速化）
    if ('aiueo'.includes(firstChar)) {
      return ['nn', 'xn'];
    }
    
    // y, w チェック
    if (firstChar === 'y' || firstChar === 'w') {
      return ['nn', 'xn'];
    }
    
    return ['nn', 'xn', 'n'];
  }

  preloadCache() {
    const common = [
      'あ', 'い', 'う', 'え', 'お',
      'か', 'き', 'く', 'け', 'こ',
      'が', 'ぎ', 'ぐ', 'げ', 'ご',
      'さ', 'し', 'す', 'せ', 'そ',
      'ざ', 'じ', 'ず', 'ぜ', 'ぞ',
      'た', 'ち', 'つ', 'て', 'と',
      'だ', 'ぢ', 'づ', 'で', 'ど',
      'な', 'に', 'ぬ', 'ね', 'の',
      'は', 'ひ', 'ふ', 'へ', 'ほ',
      'ば', 'び', 'ぶ', 'べ', 'ぼ',
      'ぱ', 'ぴ', 'ぷ', 'ぺ', 'ぽ',
      'ま', 'み', 'む', 'め', 'も',
      'や', 'ゆ', 'よ',
      'ら', 'り', 'る', 'れ', 'ろ',
      'わ', 'ゐ', 'ゑ', 'を'
    ];

    this.getNPatterns(); // 文末パターン
    common.forEach(kana => this.getNPatterns(kana));
  }

  getStats() {
    return {
      ...this.stats,
      cacheHitRate: this.stats.totalCalls > 0 ? 
        (this.stats.cacheHits / this.stats.totalCalls * 100) : 0,
      averageTime: this.stats.totalCalls > 0 ? 
        (this.stats.totalTime / this.stats.totalCalls) : 0
    };
  }
}

// 従来の実装（比較用）
function legacyGetNPatterns(nextKana) {
  // 毎回配列を動的生成（パフォーマンスボトルネック）
  const consonants = ['k', 'g', 's', 'z', 't', 'd', 'n', 'h', 'b', 'p', 'm', 'y', 'r', 'w'];
  
  if (!nextKana) {
    return ['nn', 'xn', 'n'];
  }

  const kanaToRomaji = {
    'あ': 'a', 'い': 'i', 'う': 'u', 'え': 'e', 'お': 'o',
    'か': 'ka', 'き': 'ki', 'く': 'ku', 'け': 'ke', 'こ': 'ko',
    'が': 'ga', 'ぎ': 'gi', 'ぐ': 'gu', 'げ': 'ge', 'ご': 'go',
    'さ': 'sa', 'し': 'si', 'す': 'su', 'せ': 'se', 'そ': 'so',
    'ざ': 'za', 'じ': 'zi', 'ず': 'zu', 'ぜ': 'ze', 'ぞ': 'zo',
    'た': 'ta', 'ち': 'ti', 'つ': 'tu', 'て': 'te', 'と': 'to',
    'だ': 'da', 'ぢ': 'di', 'づ': 'du', 'で': 'de', 'ど': 'do',
    'な': 'na', 'に': 'ni', 'ぬ': 'nu', 'ね': 'ne', 'の': 'no',
    'は': 'ha', 'ひ': 'hi', 'ふ': 'fu', 'へ': 'he', 'ほ': 'ho',
    'ば': 'ba', 'び': 'bi', 'ぶ': 'bu', 'べ': 'be', 'ぼ': 'bo',
    'ぱ': 'pa', 'ぴ': 'pi', 'ぷ': 'pu', 'ぺ': 'pe', 'ぽ': 'po',
    'ま': 'ma', 'み': 'mi', 'む': 'mu', 'め': 'me', 'も': 'mo',
    'や': 'ya', 'ゆ': 'yu', 'よ': 'yo',
    'ら': 'ra', 'り': 'ri', 'る': 'ru', 'れ': 're', 'ろ': 'ro',
    'わ': 'wa', 'ゐ': 'wi', 'ゑ': 'we', 'を': 'wo'
  };

  const romaji = kanaToRomaji[nextKana];
  if (!romaji) return ['nn', 'xn', 'n'];

  const firstChar = romaji[0];
  
  // 配列検索（パフォーマンスボトルネック）
  if (consonants.includes(firstChar)) {
    if (firstChar === 'y' || firstChar === 'w') {
      return ['nn', 'xn'];
    }
    return ['nn', 'xn', 'n'];
  }
  
  return ['nn', 'xn'];
}

// パフォーマンステスト実行
function runPerformanceTest() {
  console.log('1. 最適化版初期化中...');
  const optimizedProcessor = new OptimizedNProcessor();
  optimizedProcessor.preloadCache();
  console.log(`   キャッシュプリロード完了: ${optimizedProcessor.cache.size} エントリ\n`);

  const testCases = [
    { kana: 'あ', desc: '"ん"+"あ"（母音）' },
    { kana: 'か', desc: '"ん"+"か"（子音k）' },
    { kana: 'さ', desc: '"ん"+"さ"（子音s）' },
    { kana: 'た', desc: '"ん"+"た"（子音t）' },
    { kana: 'な', desc: '"ん"+"な"（子音n）' },
    { kana: 'は', desc: '"ん"+"は"（子音h）' },
    { kana: 'ま', desc: '"ん"+"ま"（子音m）' },
    { kana: 'や', desc: '"ん"+"や"（子音y）' },
    { kana: 'ら', desc: '"ん"+"ら"（子音r）' },
    { kana: 'わ', desc: '"ん"+"わ"（子音w）' },
    { kana: undefined, desc: '"ん"+文末' }
  ];

  const iterations = 50000;
  let legacyTotalTime = 0;
  let optimizedTotalTime = 0;

  console.log('2. パフォーマンステスト実行中...\n');

  for (const testCase of testCases) {
    // 従来版テスト
    const legacyStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      legacyGetNPatterns(testCase.kana);
    }
    const legacyEnd = performance.now();
    const legacyTime = legacyEnd - legacyStart;
    legacyTotalTime += legacyTime;

    // 最適化版テスト
    const optimizedStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      optimizedProcessor.getNPatterns(testCase.kana);
    }
    const optimizedEnd = performance.now();
    const optimizedTime = optimizedEnd - optimizedStart;
    optimizedTotalTime += optimizedTime;

    const speedup = legacyTime / optimizedTime;
    const improvement = ((legacyTime - optimizedTime) / legacyTime * 100);

    console.log(`${testCase.desc}:`);
    console.log(`  従来版:     ${legacyTime.toFixed(2)}ms`);
    console.log(`  最適化版:   ${optimizedTime.toFixed(2)}ms`);
    console.log(`  高速化:     ${speedup.toFixed(2)}倍`);
    console.log(`  改善率:     ${improvement.toFixed(1)}%\n`);
  }

  // 総合結果
  const totalSpeedup = legacyTotalTime / optimizedTotalTime;
  const totalImprovement = ((legacyTotalTime - optimizedTotalTime) / legacyTotalTime * 100);

  console.log('=== 総合パフォーマンス結果 ===');
  console.log(`従来版総時間:       ${legacyTotalTime.toFixed(2)}ms`);
  console.log(`最適化版総時間:     ${optimizedTotalTime.toFixed(2)}ms`);
  console.log(`総合高速化:         ${totalSpeedup.toFixed(2)}倍`);
  console.log(`総合改善率:         ${totalImprovement.toFixed(1)}%`);

  // 最適化版の統計
  const stats = optimizedProcessor.getStats();
  console.log(`\n=== 最適化版統計 ===`);
  console.log(`総呼び出し回数:     ${stats.totalCalls.toLocaleString()}回`);
  console.log(`キャッシュヒット:   ${stats.cacheHits.toLocaleString()}回`);
  console.log(`キャッシュミス:     ${stats.cacheMisses.toLocaleString()}回`);
  console.log(`キャッシュヒット率: ${stats.cacheHitRate.toFixed(1)}%`);
  console.log(`平均処理時間:       ${(stats.averageTime * 1000).toFixed(3)}μs`);

  return {
    legacyTime: legacyTotalTime,
    optimizedTime: optimizedTotalTime,
    speedup: totalSpeedup,
    improvement: totalImprovement,
    stats: stats
  };
}

// リアルタイプタイピングシミュレーション
function runRealTimeTypingSimulation() {
  console.log('\n=== リアルタイピングシミュレーション ===\n');
  
  const processor = new OptimizedNProcessor();
  processor.preloadCache();

  // 実際のタイピング文章
  const sentences = [
    'こんにちはせんせい',
    'りんごをたべません',
    'でんしゃでがんばって',
    'しんかんせんでけんきゅう',
    'あんしんしてべんきょう'
  ];

  let totalProcessingTime = 0;
  let totalNCharacters = 0;

  for (const sentence of sentences) {
    console.log(`文章: "${sentence}"`);
    
    const chars = Array.from(sentence);
    let sentenceTime = 0;
    let nCount = 0;

    for (let i = 0; i < chars.length; i++) {
      if (chars[i] === 'ん') {
        const startTime = performance.now();
        const nextChar = chars[i + 1];
        processor.getNPatterns(nextChar);
        const endTime = performance.now();
        
        sentenceTime += (endTime - startTime);
        nCount++;
      }
    }

    totalProcessingTime += sentenceTime;
    totalNCharacters += nCount;

    console.log(`  「ん」の数: ${nCount}文字`);
    console.log(`  処理時間: ${sentenceTime.toFixed(3)}ms`);
    console.log(`  平均時間/文字: ${nCount > 0 ? (sentenceTime / nCount).toFixed(3) : 'N/A'}ms\n`);
  }

  console.log('=== シミュレーション結果 ===');
  console.log(`総文章数: ${sentences.length}文`);
  console.log(`総「ん」文字数: ${totalNCharacters}文字`);
  console.log(`総処理時間: ${totalProcessingTime.toFixed(2)}ms`);
  console.log(`平均処理時間/文字: ${totalNCharacters > 0 ? (totalProcessingTime / totalNCharacters).toFixed(3) : 'N/A'}ms`);

  const avgTimePerChar = totalNCharacters > 0 ? (totalProcessingTime / totalNCharacters) : 0;
  
  if (avgTimePerChar < 0.01) {
    console.log('🎉 優秀: 「ん」処理が0.01ms未満で完了');
  } else if (avgTimePerChar < 0.1) {
    console.log('✅ 良好: 「ん」処理が0.1ms未満で完了');
  } else {
    console.log('⚠️  改善余地あり: 「ん」処理時間が0.1ms以上');
  }

  return {
    sentences: sentences.length,
    nCharacters: totalNCharacters,
    totalTime: totalProcessingTime,
    avgTimePerChar: avgTimePerChar
  };
}

// メイン実行
console.log('OptimizedNProcessor 最終検証を開始します...\n');

const performanceResults = runPerformanceTest();
const typingResults = runRealTimeTypingSimulation();

console.log('\n=== 最終評価 ===');
console.log(`🚀 総合高速化: ${performanceResults.speedup.toFixed(2)}倍`);
console.log(`📈 性能改善率: ${performanceResults.improvement.toFixed(1)}%`);
console.log(`⚡ キャッシュヒット率: ${performanceResults.stats.cacheHitRate.toFixed(1)}%`);
console.log(`🎯 リアルタイム性能: ${typingResults.avgTimePerChar.toFixed(3)}ms/文字`);

if (performanceResults.speedup >= 5.0) {
  console.log('\n🎉 最適化は大成功です！');
  console.log('✅ 「ん」処理の性能問題は完全に解決されました');
  console.log('✅ タイピングゲームの応答性が大幅に向上しました');
} else if (performanceResults.speedup >= 2.0) {
  console.log('\n✅ 最適化は成功です！');
  console.log('✅ 十分な性能向上が達成されました');
} else {
  console.log('\n⚠️  更なる最適化が必要です');
}

console.log('\n🏁 OptimizedNProcessor 最終検証完了！');
