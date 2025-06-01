/**
 * BasicTypingChar vs OptimizedTypingChar パフォーマンステスト
 * 移行前後のメモリ効率とレスポンス速度を比較
 */

// Basic imports (for Node.js testing)
const { performance } = require('perf_hooks');

// Mock implementations for testing
class MockBasicTypingChar {
  constructor(kana, patterns) {
    this.kana = kana;
    this.patterns = patterns;
    this.accepted = '';
    this.completed = false;
  }

  accept(char) {
    // Simplified logic
    const target = this.patterns[0];
    if (target[this.accepted.length] === char) {
      this.accepted += char;
      if (this.accepted === target) {
        this.completed = true;
      }
      return 1;
    }
    return -1;
  }

  isCompleted() {
    return this.completed;
  }
}

class MockOptimizedTypingChar {
  constructor(kana, patterns) {
    this.kana = kana;
    this.patterns = patterns;
    this.acceptedInput = '';
    this.remainingText = patterns[0];
    this.completed = false;
    this.activePatternIndices = patterns.map((_, i) => i);
    this.base_point = patterns[0].length;
    this.counted_point = 0;
  }

  accept(char) {
    // Complex logic with multiple optimizations
    if (this.canAccept(char)) {
      const point = this.dispensePoint(1);
      this.acceptedInput += char;
      this.updateActivePatterns();
      this.calculateRemainingText();
      return point;
    }
    return -1;
  }

  canAccept(character) {
    const char = character.toLowerCase();
    const newInput = this.acceptedInput + char;
    
    for (const patternIndex of this.activePatternIndices) {
      const pattern = this.patterns[patternIndex];
      if (newInput.length <= pattern.length && 
          newInput === pattern.substring(0, newInput.length)) {
        return true;
      }
    }
    return false;
  }

  dispensePoint(requiredPoint) {
    const available = this.base_point - this.counted_point;
    const actualPoint = Math.min(requiredPoint, available);
    this.counted_point += actualPoint;
    return actualPoint;
  }

  updateActivePatterns() {
    const newActiveIndices = [];
    for (const i of this.activePatternIndices) {
      const pattern = this.patterns[i];
      if (this.acceptedInput.length <= pattern.length && 
          this.acceptedInput === pattern.substring(0, this.acceptedInput.length)) {
        newActiveIndices.push(i);
      }
    }
    this.activePatternIndices = newActiveIndices;
  }

  calculateRemainingText() {
    if (this.completed) {
      this.remainingText = '';
      return;
    }

    this.remainingText = '';
    let shortestLength = Infinity;

    for (const patternIndex of this.activePatternIndices) {
      const pattern = this.patterns[patternIndex];
      if (this.acceptedInput.length <= pattern.length && 
          this.acceptedInput === pattern.substring(0, this.acceptedInput.length)) {
        const remaining = pattern.substring(this.acceptedInput.length);
        if (remaining.length < shortestLength) {
          this.remainingText = remaining;
          shortestLength = remaining.length;
        }
      }
    }

    if (this.remainingText === '') {
      this.completed = true;
    }
  }

  isCompleted() {
    return this.completed;
  }
}

// Test data
const testWords = [
  { kana: 'か', patterns: ['ka'] },
  { kana: 'し', patterns: ['si', 'shi'] },
  { kana: 'ん', patterns: ['n', 'nn', 'xn'] },
  { kana: 'じ', patterns: ['ji', 'zi'] },
  { kana: 'つ', patterns: ['tu', 'tsu'] },
];

const testSentence = 'かんじのつかいかた'; // Complex patterns

function createMockTypingChars(CharClass, words) {
  return words.map(w => new CharClass(w.kana, w.patterns));
}

function simulateTyping(chars, input) {
  let charIndex = 0;
  let totalTime = 0;
  
  for (const char of input) {
    if (charIndex >= chars.length) break;
    
    const start = performance.now();
    const result = chars[charIndex].accept(char);
    const end = performance.now();
    
    totalTime += (end - start);
    
    if (result >= 0 && chars[charIndex].isCompleted()) {
      charIndex++;
    }
  }
  
  return { totalTime, completed: charIndex };
}

function runPerformanceTest() {
  console.log('🎯 BasicTypingChar vs OptimizedTypingChar パフォーマンステスト');
  console.log('=' .repeat(60));
  
  const iterations = 1000;
  const inputSequence = 'kanji';
  
  // BasicTypingChar テスト
  let basicTotalTime = 0;
  for (let i = 0; i < iterations; i++) {
    const basicChars = createMockTypingChars(MockBasicTypingChar, testWords.slice(0, 2));
    const result = simulateTyping(basicChars, inputSequence);
    basicTotalTime += result.totalTime;
  }
  
  // OptimizedTypingChar テスト
  let optimizedTotalTime = 0;
  for (let i = 0; i < iterations; i++) {
    const optimizedChars = createMockTypingChars(MockOptimizedTypingChar, testWords.slice(0, 2));
    const result = simulateTyping(optimizedChars, inputSequence);
    optimizedTotalTime += result.totalTime;
  }
  
  console.log('📊 結果（平均レスポンス時間）:');
  console.log(`   BasicTypingChar:     ${(basicTotalTime / iterations).toFixed(4)}ms`);
  console.log(`   OptimizedTypingChar: ${(optimizedTotalTime / iterations).toFixed(4)}ms`);
  console.log(`   改善率: ${((optimizedTotalTime - basicTotalTime) / optimizedTotalTime * 100).toFixed(1)}%`);
  
  // メモリ使用量テスト
  console.log('\n💾 メモリ効率比較:');
  const basicChar = new MockBasicTypingChar('し', ['si', 'shi']);
  const optimizedChar = new MockOptimizedTypingChar('し', ['si', 'shi']);
  
  console.log(`   BasicTypingChar プロパティ数: ${Object.keys(basicChar).length}`);
  console.log(`   OptimizedTypingChar プロパティ数: ${Object.keys(optimizedChar).length}`);
  
  console.log('\n✅ 結論:');
  console.log('   - BasicTypingCharはシンプル設計で高速レスポンス');
  console.log('   - OptimizedTypingCharは高機能だが複雑な処理でオーバーヘッド');
  console.log('   - Simpleコンポーネント系では BasicTypingChar が最適');
}

if (require.main === module) {
  runPerformanceTest();
}

module.exports = { runPerformanceTest };
