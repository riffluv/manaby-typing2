/**
 * タイピングエンジンのパフォーマンスベンチマークツール
 * 
 * 現在の「ん」処理の複雑な実装と、typingmania-refのシンプルな実装を比較し、
 * パフォーマンス劣化の原因を特定する
 */

import { TypingChar } from '../typing/TypingChar';
import { JapaneseConverter } from '../typing/JapaneseConverter';

interface BenchmarkResult {
  testName: string;
  iterations: number;
  totalTime: number;
  averageTime: number;
  minTime: number;
  maxTime: number;
  throughput: number; // operations per second
}

interface TypingBenchmarkSuite {
  simple: BenchmarkResult;
  nCharacterLight: BenchmarkResult;
  nCharacterHeavy: BenchmarkResult;
  complexSentence: BenchmarkResult;
}

export class TypingPerformanceBenchmark {
  private iterations = 1000;

  /**
   * シンプルなタイピング処理（「ん」なし）のベンチマーク
   */
  private async benchmarkSimpleTyping(): Promise<BenchmarkResult> {
    const testChars = JapaneseConverter.convertToTypingChars("かたかな");
    const times: number[] = [];

    for (let i = 0; i < this.iterations; i++) {
      // 文字をリセット
      const chars = testChars.map(char => char.clone());
      
      const start = performance.now();
      
      // 通常のタイピングシミュレーション: "katakana"
      chars[0].type('k'); // か
      chars[0].type('a');
      chars[1].type('t'); // た
      chars[1].type('a');
      chars[2].type('k'); // か
      chars[2].type('a');
      chars[3].type('n'); // な
      chars[3].type('a');
      
      const end = performance.now();
      times.push(end - start);
    }

    return this.calculateStats("Simple Typing (no ん)", times);
  }

  /**
   * 軽い「ん」処理のベンチマーク
   */
  private async benchmarkLightNCharacter(): Promise<BenchmarkResult> {
    const testChars = JapaneseConverter.convertToTypingChars("かん");
    const times: number[] = [];

    for (let i = 0; i < this.iterations; i++) {
      // 文字をリセット
      const chars = testChars.map(char => char.clone());
      
      const start = performance.now();
      
      // 「ん」の分岐処理: "kan"
      chars[0].type('k'); // か
      chars[0].type('a');
      
      // 「ん」の処理 - ここで分岐状態に入る
      if (chars[1].branchingState) {
        chars[1].typeBranching('n', null); // 単語末の「ん」
      } else {
        chars[1].type('n');
        chars[1].type('n');
      }
      
      const end = performance.now();
      times.push(end - start);
    }

    return this.calculateStats("Light ん Character", times);
  }

  /**
   * 重い「ん」処理のベンチマーク（複雑な分岐パターン）
   */
  private async benchmarkHeavyNCharacter(): Promise<BenchmarkResult> {
    const testChars = JapaneseConverter.convertToTypingChars("きんこんなか");
    const times: number[] = [];

    for (let i = 0; i < this.iterations; i++) {
      // 文字をリセット
      const chars = testChars.map(char => char.clone());
      
      const start = performance.now();
      
      // 複雑な「ん」分岐処理: "kinkonnnaka"
      chars[0].type('k'); // き
      chars[0].type('i');
      
      // 最初の「ん」- 次に子音が来るパターン
      if (chars[1].branchingState) {
        const result = chars[1].typeBranching('n', chars[2]); // 次文字は「こ」
        if (result.completeWithSingle) {
          // 'n'で完了し、次の文字の子音処理へ
          chars[2].type('k'); // こ の 'k'
        }
      }
      
      chars[2].type('o'); // こ の 'o'
      
      // 二番目の「ん」- より複雑なパターン
      if (chars[3].branchingState) {
        chars[3].typeBranching('n', chars[4]);
        chars[3].typeBranching('n', chars[4]); // 'nn'パターン
      }
      
      chars[4].type('n'); // な
      chars[4].type('a');
      chars[5].type('k'); // か
      chars[5].type('a');
      
      const end = performance.now();
      times.push(end - start);
    }

    return this.calculateStats("Heavy ん Character (Complex Branching)", times);
  }

  /**
   * 複雑な文のベンチマーク
   */
  private async benchmarkComplexSentence(): Promise<BenchmarkResult> {
    const testChars = JapaneseConverter.convertToTypingChars("こんにちはせかい");
    const times: number[] = [];

    for (let i = 0; i < this.iterations; i++) {
      // 文字をリセット
      const chars = testChars.map(char => char.clone());
      
      const start = performance.now();
      
      // 完全なタイピングシミュレーション
      let charIndex = 0;
      const inputSequence = "konnichihassekai";
      
      for (const key of inputSequence) {
        const currentChar = chars[charIndex];
        if (!currentChar) break;
        
        if (currentChar.branchingState) {
          const nextChar = chars[charIndex + 1];
          const result = currentChar.typeBranching(key, nextChar);
          
          if (result.success) {
            if (result.completeWithSingle) {
              charIndex++;
              // 次の文字への継続処理
              const nextChar = chars[charIndex];
              if (nextChar) {
                nextChar.type(key);
                if (nextChar.completed) {
                  charIndex++;
                }
              }
            } else {
              charIndex++;
            }
          }
        } else {
          const isCorrect = currentChar.type(key);
          if (isCorrect && currentChar.completed) {
            charIndex++;
          }
        }
      }
      
      const end = performance.now();
      times.push(end - start);
    }

    return this.calculateStats("Complex Sentence", times);
  }

  /**
   * typingmania-ref スタイルのシンプル処理ベンチマーク
   */
  private async benchmarkSimpleReference(): Promise<BenchmarkResult> {
    const times: number[] = [];

    for (let i = 0; i < this.iterations; i++) {
      const start = performance.now();
      
      // typingmania-refスタイルのシンプルなテーブル参照処理
      const romajiMap = {
        'こ': 'ko',
        'ん': 'nn', // シンプルな固定マッピング
        'に': 'ni',
        'ち': 'ti',
        'は': 'ha',
        'せ': 'se',
        'か': 'ka',
        'い': 'i'
      };
      
      const kana = "こんにちはせかい";
      let result = "";
      
      for (const char of kana) {
        result += romajiMap[char] || char;
      }
      
      // シンプルなマッチング処理
      const target = "konnitihassekai";
      let matches = 0;
      for (let j = 0; j < Math.min(result.length, target.length); j++) {
        if (result[j] === target[j]) {
          matches++;
        }
      }
      
      const end = performance.now();
      times.push(end - start);
    }

    return this.calculateStats("Simple Reference (typingmania-ref style)", times);
  }

  /**
   * 統計計算
   */
  private calculateStats(testName: string, times: number[]): BenchmarkResult {
    const totalTime = times.reduce((sum, time) => sum + time, 0);
    const averageTime = totalTime / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const throughput = 1000 / averageTime; // operations per second

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

  /**
   * 完全なベンチマークスイートを実行
   */
  async runBenchmarkSuite(): Promise<TypingBenchmarkSuite> {
    console.log("🔬 タイピングパフォーマンスベンチマーク開始...");
    console.log(`反復回数: ${this.iterations}`);
    
    const simple = await this.benchmarkSimpleTyping();
    console.log("✅ シンプルタイピング完了");
    
    const nCharacterLight = await this.benchmarkLightNCharacter();
    console.log("✅ 軽い「ん」処理完了");
    
    const nCharacterHeavy = await this.benchmarkHeavyNCharacter();
    console.log("✅ 重い「ん」処理完了");
    
    const complexSentence = await this.benchmarkComplexSentence();
    console.log("✅ 複雑な文完了");
    
    return {
      simple,
      nCharacterLight,
      nCharacterHeavy,
      complexSentence
    };
  }

  /**
   * 比較ベンチマーク（現在の実装 vs typingmania-ref）
   */
  async runComparisonBenchmark(): Promise<{
    current: BenchmarkResult;
    reference: BenchmarkResult;
    performanceRatio: number;
  }> {
    console.log("🆚 比較ベンチマーク開始...");
    
    const current = await this.benchmarkComplexSentence();
    const reference = await this.benchmarkSimpleReference();
    
    const performanceRatio = reference.averageTime / current.averageTime;
    
    return {
      current,
      reference,
      performanceRatio
    };
  }

  /**
   * 結果をフォーマットして出力
   */
  formatResults(results: TypingBenchmarkSuite): string {
    let output = "\n🔬 タイピングパフォーマンスベンチマーク結果\n";
    output += "=" * 60 + "\n\n";

    const tests = [
      results.simple,
      results.nCharacterLight,
      results.nCharacterHeavy,
      results.complexSentence
    ];

    for (const result of tests) {
      output += `📊 ${result.testName}\n`;
      output += `-`.repeat(40) + "\n";
      output += `  平均時間: ${result.averageTime.toFixed(4)} ms\n`;
      output += `  最小時間: ${result.minTime.toFixed(4)} ms\n`;
      output += `  最大時間: ${result.maxTime.toFixed(4)} ms\n`;
      output += `  スループット: ${result.throughput.toFixed(0)} ops/sec\n`;
      output += `  反復回数: ${result.iterations}\n\n`;
    }

    // パフォーマンス分析
    const baselinePerf = results.simple.averageTime;
    output += "📈 パフォーマンス比較 (vs シンプルタイピング)\n";
    output += `-`.repeat(40) + "\n";
    
    const nLightRatio = results.nCharacterLight.averageTime / baselinePerf;
    const nHeavyRatio = results.nCharacterHeavy.averageTime / baselinePerf;
    const complexRatio = results.complexSentence.averageTime / baselinePerf;
    
    output += `  軽い「ん」処理: ${nLightRatio.toFixed(2)}x (${((nLightRatio - 1) * 100).toFixed(1)}% 増加)\n`;
    output += `  重い「ん」処理: ${nHeavyRatio.toFixed(2)}x (${((nHeavyRatio - 1) * 100).toFixed(1)}% 増加)\n`;
    output += `  複雑な文: ${complexRatio.toFixed(2)}x (${((complexRatio - 1) * 100).toFixed(1)}% 増加)\n\n`;

    return output;
  }

  /**
   * 比較結果をフォーマット
   */
  formatComparisonResults(comparison: {
    current: BenchmarkResult;
    reference: BenchmarkResult;
    performanceRatio: number;
  }): string {
    let output = "\n🆚 実装比較結果\n";
    output += "=" * 60 + "\n\n";
    
    output += `現在の実装 (完璧な「ん」処理):\n`;
    output += `  平均時間: ${comparison.current.averageTime.toFixed(4)} ms\n`;
    output += `  スループット: ${comparison.current.throughput.toFixed(0)} ops/sec\n\n`;
    
    output += `typingmania-ref スタイル (シンプル処理):\n`;
    output += `  平均時間: ${comparison.reference.averageTime.toFixed(4)} ms\n`;
    output += `  スループット: ${comparison.reference.throughput.toFixed(0)} ops/sec\n\n`;
    
    if (comparison.performanceRatio > 1) {
      output += `🚀 typingmania-refが ${comparison.performanceRatio.toFixed(2)}x 高速\n`;
      output += `⚠️  現在の実装は ${((1/comparison.performanceRatio - 1) * -100).toFixed(1)}% 遅い\n`;
    } else {
      output += `🎉 現在の実装が ${(1/comparison.performanceRatio).toFixed(2)}x 高速\n`;
    }
    
    return output;
  }
}
