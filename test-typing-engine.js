// Simple Node.js test for our typing engine
const fs = require('fs');

// Read our JavaScript files as strings and execute them
const latinTableCode = fs.readFileSync('./latin-table-converter.js', 'utf8');
const typingCharCode = fs.readFileSync('./TypingChar.js', 'utf8');
const typingEngineCode = fs.readFileSync('./TypingEngine.js', 'utf8');

// Global console.log simulation
global.console = { log: console.log };

// Execute the code
eval(latinTableCode);
eval(typingCharCode);
eval(typingEngineCode);

// Test the typing engine
console.log('\n=== タイピングエンジンテスト ===');

const engine = new TypingEngine();
engine.setWord('プログラミング');

console.log('\n=== 初期状態 ===');
const chars = engine.getChars();
chars.forEach((char, i) => {
    console.log(`${i}: ${char.getCharacter()} -> パターン: ${char.patterns}`);
});

console.log('\n=== 「ん」パターン切り替えテスト ===');

// Simulate typing "pu" for プ
console.log('\n1. "p" を入力');
let result = engine.processKey('p');
console.log(`結果: ${result}, 現在のインデックス: ${engine.getCurrentIndex()}`);

console.log('\n2. "u" を入力 (プ完成)');
result = engine.processKey('u');
console.log(`結果: ${result}, 現在のインデックス: ${engine.getCurrentIndex()}`);

// ロ
console.log('\n3. "r" を入力');
result = engine.processKey('r');
console.log(`結果: ${result}, 現在のインデックス: ${engine.getCurrentIndex()}`);

console.log('\n4. "o" を入力 (ロ完成)');
result = engine.processKey('o');
console.log(`結果: ${result}, 現在のインデックス: ${engine.getCurrentIndex()}`);

// グ (first gu)
console.log('\n5. "g" を入力');
result = engine.processKey('g');
console.log(`結果: ${result}, 現在のインデックス: ${engine.getCurrentIndex()}`);

console.log('\n6. "u" を入力 (グ完成)');
result = engine.processKey('u');
console.log(`結果: ${result}, 現在のインデックス: ${engine.getCurrentIndex()}`);

// ラ
console.log('\n7. "r" を入力');
result = engine.processKey('r');
console.log(`結果: ${result}, 現在のインデックス: ${engine.getCurrentIndex()}`);

console.log('\n8. "a" を入力 (ラ完成)');
result = engine.processKey('a');
console.log(`結果: ${result}, 現在のインデックス: ${engine.getCurrentIndex()}`);

// ミ
console.log('\n9. "m" を入力');
result = engine.processKey('m');
console.log(`結果: ${result}, 現在のインデックス: ${engine.getCurrentIndex()}`);

console.log('\n10. "i" を入力 (ミ完成)');
result = engine.processKey('i');
console.log(`結果: ${result}, 現在のインデックス: ${engine.getCurrentIndex()}`);

// ン - ここで「ん」パターン切り替えが発生するべき
console.log('\n11. "n" を入力 (ンでnnパターンの一部)');
result = engine.processKey('n');
console.log(`結果: ${result}, 現在のインデックス: ${engine.getCurrentIndex()}`);
const currentChar = chars[engine.getCurrentIndex()];
if (currentChar) {
    console.log(`現在の文字: ${currentChar.getCharacter()}, 入力済み: "${currentChar.getTyped()}", パターン: ${currentChar.getCurrentPattern()}`);
}

console.log('\n12. "g" を入力 - 「ん」パターン切り替えテスト');
result = engine.processKey('g');
console.log(`結果: ${result}, 現在のインデックス: ${engine.getCurrentIndex()}`);

// 状態確認
chars.forEach((char, i) => {
    if (char.isCompleted()) {
        console.log(`${i}: ${char.getCharacter()} - 完成`);
    } else if (i === engine.getCurrentIndex()) {
        console.log(`${i}: ${char.getCharacter()} - 現在 (入力済み: "${char.getTyped()}", パターン: ${char.getCurrentPattern()})`);
    }
});

console.log('\n=== テスト完了 ===');
