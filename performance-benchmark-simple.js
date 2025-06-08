/**
 * シンプルなパフォーマンスベンチマーク
 * TypeScriptの依存関係なしで実行可能
 */

// パフォーマンス測定用のシンプルなシミュレーション
class SimplePerformanceBenchmark {
  constructor() {
    this.iterations = 1000;
  }

  // 「ん」処理なしのシンプルなパターンマッチング
  benchmarkSimpleTyping() {
    const times = [];
    
    for (let i = 0; i < this.iterations; i++) {
      const start = performance.now();
      
      // シンプルなタイピング処理
      const patterns = ['ka', 'ta', 'ka', 'na'];
      const input = 'katakana';
      let position = 0;
      
      for (const pattern of patterns) {
        for (const char of pattern) {
          if (input[position] === char) {
            position++;
          }
        }
      }
      
      const end = performance.now();
      times.push(end - start);
    }
    
    return this.calculateStats('Simple Typing', times);
  }

  // 「ん」の複雑な分岐処理をシミュレート
  benchmarkComplexNProcessing() {
    const times = [];
    
    for (let i = 0; i < this.iterations; i++) {
      const start = performance.now();
      
      // 複雑な「ん」処理のシミュレーション
      const kana = 'こんにちは';
      const input = 'konnitiha';
      let position = 0;
      
      for (let j = 0; j < kana.length; j++) {
        const char = kana[j];
        
        if (char === 'ん') {
          // 「ん」の複雑な分岐処理をシミュレート
          const nextChar = kana[j + 1];
          
          // 次の文字をチェック（実際の処理を模擬）
          const consonants = ['k', 'g', 's', 'z', 't', 'd', 'n', 'h', 'b', 'p', 'm', 'y', 'r', 'w'];
          
          if (nextChar && input[position + 1]) {
            const nextInputChar = input[position + 1];
            
            // 複雑な分岐判定
            if (consonants.includes(nextInputChar)) {
              // 子音があるかチェック
              const patterns = [];
              
              // パターン生成（重い処理をシミュレート）
              for (const cons of consonants) {
                if (nextInputChar.startsWith(cons)) {
                  patterns.push(`n${cons}`);
                  patterns.push(`nn${cons}`);
                }
              }
              
              // パターンマッチング（さらに重い処理）
              let matched = false;
              for (const pattern of patterns) {
                if (input.substr(position, pattern.length) === pattern) {
                  position += pattern.length;
                  matched = true;
                  break;
                }
              }
              
              if (!matched) {
                // フォールバック処理
                if (input.substr(position, 2) === 'nn') {
                  position += 2;
                } else if (input[position] === 'n') {
                  position += 1;
                }
              }
            } else {
              // 母音の場合のパターン
              if (input.substr(position, 2) === 'nn') {
                position += 2;
              } else {
                position += 1;
              }
            }
          } else {
            // 文末の「ん」
            if (input.substr(position, 2) === 'nn') {
              position += 2;
            } else {
              position += 1;
            }
          }
        } else {
          // 通常の文字処理
          const patterns = this.getKanaPatterns(char);
          let matched = false;
          
          for (const pattern of patterns) {
            if (input.substr(position, pattern.length) === pattern) {
              position += pattern.length;
              matched = true;
              break;
            }
          }
          
          if (!matched && input[position]) {
            position += 1;
          }
        }
      }
      
      const end = performance.now();
      times.push(end - start);
    }
    
    return this.calculateStats('Complex N Processing', times);
  }

  // typingmania-refスタイルのシンプル処理
  benchmarkSimpleReference() {
    const times = [];
    
    for (let i = 0; i < this.iterations; i++) {
      const start = performance.now();
      
      // typingmania-refスタイルのシンプルなテーブル参照
      const simpleTable = {
        'こ': 'ko',
        'ん': 'nn',  // 固定パターン
        'に': 'ni',
        'ち': 'ti',
        'は': 'ha'
      };
      
      const kana = 'こんにちは';
      let result = '';
      
      for (const char of kana) {
        result += simpleTable[char] || char;
      }
      
      // シンプルなマッチング
      const target = 'konnitiha';
      let matches = 0;
      for (let j = 0; j < Math.min(result.length, target.length); j++) {
        if (result[j] === target[j]) {
          matches++;
        }
      }
      
      const end = performance.now();
      times.push(end - start);
    }
    
    return this.calculateStats('Simple Reference', times);
  }

  // ひらがなのローマ字パターンを取得（簡易版）
  getKanaPatterns(kana) {
    const patterns = {
      'こ': ['ko'],
      'に': ['ni'],
      'ち': ['ti', 'chi'],
      'は': ['ha'],
      'せ': ['se'],
      'か': ['ka'],
      'い': ['i']
    };
    
    return patterns[kana] || [kana];
  }

  // 統計計算
  calculateStats(testName, times) {
    const totalTime = times.reduce((sum, time) => sum + time, 0);
    const averageTime = totalTime / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const throughput = 1000 / averageTime;

    return {
      testName,
      iterations: times.length,
      totalTime,
      averageTime,
      minTime,
      maxTime,
      throughput
    };
  }

  // 結果をフォーマット
  formatResults(results) {
    let output = '\n🔬 タイピングパフォーマンス分析結果\n';
    output += '='.repeat(60) + '\n\n';

    for (const result of results) {
      output += `📊 ${result.testName}\n`;
      output += '-'.repeat(40) + '\n';
      output += `  平均時間: ${result.averageTime.toFixed(4)} ms\n`;
      output += `  最小時間: ${result.minTime.toFixed(4)} ms\n`;
      output += `  最大時間: ${result.maxTime.toFixed(4)} ms\n`;
      output += `  スループット: ${result.throughput.toFixed(0)} ops/sec\n`;
      output += `  反復回数: ${result.iterations}\n\n`;
    }

    // パフォーマンス比較
    if (results.length >= 3) {
      const simple = results.find(r => r.testName.includes('Simple Typing'));
      const complex = results.find(r => r.testName.includes('Complex N'));
      const reference = results.find(r => r.testName.includes('Reference'));
      
      if (simple && complex && reference) {
        output += '📈 パフォーマンス分析\n';
        output += '-'.repeat(40) + '\n';
        
        const complexRatio = complex.averageTime / simple.averageTime;
        const refRatio = reference.averageTime / complex.averageTime;
        
        output += `「ん」処理による影響: ${complexRatio.toFixed(2)}x (${((complexRatio - 1) * 100).toFixed(1)}% 増加)\n`;
        output += `シンプル実装との比較: ${(1/refRatio).toFixed(2)}x ${refRatio > 1 ? '遅い' : '速い'}\n\n`;
        
        // 具体的な分析
        if (complexRatio > 3) {
          output += '⚠️  「ん」処理による大幅なパフォーマンス劣化が確認されました\n';
        } else if (complexRatio > 2) {
          output += '⚠️  「ん」処理により有意なパフォーマンス劣化があります\n';
        } else {
          output += '✅ 「ん」処理のパフォーマンス影響は許容範囲内です\n';
        }
        
        output += '\n🎯 最適化提案:\n';
        if (complexRatio > 2) {
          output += '  1. 「ん」のパターン生成を事前計算に変更\n';
          output += '  2. 分岐条件の簡素化\n';
          output += '  3. キャッシュ機能の追加\n';
        } else {
          output += '  現在のパフォーマンスは良好です\n';
        }
      }
    }

    return output;
  }

  // ベンチマーク実行
  async runBenchmark() {
    console.log('🚀 パフォーマンスベンチマーク開始...');
    console.log(`反復回数: ${this.iterations}\n`);
    
    const results = [];
    
    console.log('テスト1: シンプルタイピング処理');
    results.push(this.benchmarkSimpleTyping());
    
    console.log('テスト2: 複雑な「ん」処理');
    results.push(this.benchmarkComplexNProcessing());
    
    console.log('テスト3: typingmania-refスタイル');
    results.push(this.benchmarkSimpleReference());
    
    console.log('\n✅ 全てのテスト完了\n');
    
    const output = this.formatResults(results);
    console.log(output);
    
    return results;
  }
}

// メイン実行
const benchmark = new SimplePerformanceBenchmark();
benchmark.runBenchmark().catch(console.error);

export default SimplePerformanceBenchmark;
