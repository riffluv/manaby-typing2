import { convertHiraganaToRomaji } from './japaneseUtils';

const testWords = [
  'ぷろぐらみんぐ', 'きんかん', 'かんあ', 'かんな', 'かんや', 'たいぴんぐ', 'こんにちは', 'しゃべる', 'きっぷ', 'はっぱ', 'しんあい', 'しじん', 'ほっかいどう'
];

const N = 10000;
const start = Date.now();
for (let i = 0; i < N; i++) {
  for (const word of testWords) {
    convertHiraganaToRomaji(word);
  }
}
const end = Date.now();
console.log(`convertHiraganaToRomaji: ${N * testWords.length}回で${end - start}ms`);
