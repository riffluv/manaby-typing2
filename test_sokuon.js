// 促音処理のテスト
// Node.jsで直接実行してテスト

const { hiraganaToRomaji } = require('./src/utils/japaneseUtils.ts');

function testSokuon() {
  console.log('=== 促音処理テスト ===');
  
  const testCases = [
    'なった',
    'きって',
    'やっぱり',
    'がっこう',
    'いっしょ',
    'さっき'
  ];
  
  testCases.forEach(hiragana => {
    console.log(`\n"${hiragana}":`)
    try {
      const result = hiraganaToRomaji(hiragana);
      const romaji = result.map(item => item.alternatives[0] || item.romaji).join('');
      console.log(`  → "${romaji}" (${romaji.length}文字)`);
      console.log(`  詳細:`, result.map(item => ({
        kana: item.kana,
        romaji: item.romaji,
        alternatives: item.alternatives
      })));
    } catch (error) {
      console.error(`  エラー: ${error.message}`);
    }
  });
}

// CommonJS形式では実行
if (typeof module !== 'undefined' && module.exports) {
  testSokuon();
}
