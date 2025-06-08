/**
 * 独立実行可能なパフォーマンステスト
 * 
 * 「ん」の処理によるパフォーマンス劣化を直接測定
 */

// 簡単な「ん」処理シミュレーション
interface SimpleTypingChar {
  kana: string;
  patterns: string[];
  acceptedInput: string;
  completed: boolean;
  branchingState: boolean;
}

class SimpleTypingChar {
  constructor(kana: string, patterns: string[]) {
    this.kana = kana;
    this.patterns = patterns;
    this.acceptedInput = '';
    this.completed = false;
    this.branchingState = kana === 'ん';
  }

  type(key: string): boolean {
    if (this.completed) return false;
    
    const currentPattern = this.patterns[0];
    if (!currentPattern) return false;
    
    const nextExpected = currentPattern[this.acceptedInput.length];
    if (nextExpected === key) {
      this.acceptedInput += key;
      if (this.acceptedInput === currentPattern) {
        this.completed = true;
      }
      return true;
    }
    return false;
  }

  typeBranching(key: string, nextChar: SimpleTypingChar | null): any {
    // 複雑な「ん」分岐処理をシミュレート
    if (key === 'n') {
      if (nextChar && this.isConsonant(nextChar.patterns[0]?.[0])) {
        // 'n'で完了し、次の文字の子音処理へ
        this.completed = true;
        return { success: true, completeWithSingle: true };
      } else {
        // 'nn'パターンが必要
        if (this.acceptedInput === '') {
          this.acceptedInput = 'n';
          return { success: true, completeWithSingle: false };
        } else if (this.acceptedInput === 'n') {
          this.acceptedInput = 'nn';
          this.completed = true;
          return { success: true, completeWithSingle: false };
        }
      }
    }
    return { success: false };
  }

  private isConsonant(char: string): boolean {
    return char && 'bcdfghjklmnpqrstvwxyz'.includes(char.toLowerCase());
  }

  clone(): SimpleTypingChar {
    const cloned = new SimpleTypingChar(this.kana, [...this.patterns]);
    cloned.acceptedInput = this.acceptedInput;
    cloned.completed = this.completed;
    cloned.branchingState = this.branchingState;
    return cloned;
  }
}

// パフォーマンステスト関数
async function runPerformanceTest() {
  console.log("🔬 タイピングパフォーマンス分析を開始...");
  
  const iterations = 10000;
  
  // 1. シンプルなタイピング（「ん」なし）
  console.log("\n📊 テスト1: シンプルタイピング（「ん」なし）");
  const simpleChars = [
    new SimpleTypingChar('か', ['ka']),
    new SimpleTypingChar('た', ['ta']),
    new SimpleTypingChar('か', ['ka']),
    new SimpleTypingChar('な', ['na'])
  ];
  
  const simpleTimes: number[] = [];
  for (let i = 0; i < iterations; i++) {
    const chars = simpleChars.map(c => c.clone());
    
    const start = performance.now();
    
    chars[0].type('k'); chars[0].type('a');
    chars[1].type('t'); chars[1].type('a');
    chars[2].type('k'); chars[2].type('a');
    chars[3].type('n'); chars[3].type('a');
    
    const end = performance.now();
    simpleTimes.push(end - start);
  }
  
  const simpleAvg = simpleTimes.reduce((a, b) => a + b, 0) / simpleTimes.length;
  console.log(`平均時間: ${simpleAvg.toFixed(4)} ms`);
  console.log(`スループット: ${(1000 / simpleAvg).toFixed(0)} ops/sec`);
  
  // 2. 軽い「ん」処理
  console.log("\n📊 テスト2: 軽い「ん」処理");
  const lightNChars = [
    new SimpleTypingChar('か', ['ka']),
    new SimpleTypingChar('ん', ['nn'])
  ];
  
  const lightTimes: number[] = [];
  for (let i = 0; i < iterations; i++) {
    const chars = lightNChars.map(c => c.clone());
    
    const start = performance.now();
    
    chars[0].type('k'); chars[0].type('a');
    
    if (chars[1].branchingState) {
      chars[1].typeBranching('n', null);
      chars[1].typeBranching('n', null);
    }
    
    const end = performance.now();
    lightTimes.push(end - start);
  }
  
  const lightAvg = lightTimes.reduce((a, b) => a + b, 0) / lightTimes.length;
  console.log(`平均時間: ${lightAvg.toFixed(4)} ms`);
  console.log(`スループット: ${(1000 / lightAvg).toFixed(0)} ops/sec`);
  console.log(`シンプル比: ${(lightAvg / simpleAvg).toFixed(2)}x`);
  
  // 3. 重い「ん」処理（複雑な分岐）
  console.log("\n📊 テスト3: 重い「ん」処理（複雑な分岐）");
  const heavyNChars = [
    new SimpleTypingChar('き', ['ki']),
    new SimpleTypingChar('ん', ['nn']),
    new SimpleTypingChar('こ', ['ko']),
    new SimpleTypingChar('ん', ['nn']),
    new SimpleTypingChar('な', ['na'])
  ];
  
  const heavyTimes: number[] = [];
  for (let i = 0; i < iterations; i++) {
    const chars = heavyNChars.map(c => c.clone());
    
    const start = performance.now();
    
    chars[0].type('k'); chars[0].type('i');
    
    // 第1の「ん」- 次に子音が来るパターン
    if (chars[1].branchingState) {
      const result1 = chars[1].typeBranching('n', chars[2]);
      if (result1.completeWithSingle) {
        chars[2].type('k'); // 継続処理
      }
    }
    chars[2].type('o');
    
    // 第2の「ん」- より複雑な処理
    if (chars[3].branchingState) {
      chars[3].typeBranching('n', chars[4]);
      chars[3].typeBranching('n', chars[4]);
    }
    
    chars[4].type('n'); chars[4].type('a');
    
    const end = performance.now();
    heavyTimes.push(end - start);
  }
  
  const heavyAvg = heavyTimes.reduce((a, b) => a + b, 0) / heavyTimes.length;
  console.log(`平均時間: ${heavyAvg.toFixed(4)} ms`);
  console.log(`スループット: ${(1000 / heavyAvg).toFixed(0)} ops/sec`);
  console.log(`シンプル比: ${(heavyAvg / simpleAvg).toFixed(2)}x`);
  
  // 4. typingmania-ref スタイルのシンプル処理
  console.log("\n📊 テスト4: typingmania-ref スタイル");
  const referenceTimes: number[] = [];
  
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    
    // シンプルなテーブル参照処理
    const romajiMap: Record<string, string> = {
      'こ': 'ko', 'ん': 'nn', 'に': 'ni', 'ち': 'ti', 
      'は': 'ha', 'せ': 'se', 'か': 'ka', 'い': 'i'
    };
    
    const kana = "こんにちはせかい";
    let result = "";
    
    for (const char of kana) {
      result += romajiMap[char] || char;
    }
    
    // シンプルなマッチング
    const target = "konnitihassekai";
    let matches = 0;
    for (let j = 0; j < Math.min(result.length, target.length); j++) {
      if (result[j] === target[j]) matches++;
    }
    
    const end = performance.now();
    referenceTimes.push(end - start);
  }
  
  const refAvg = referenceTimes.reduce((a, b) => a + b, 0) / referenceTimes.length;
  console.log(`平均時間: ${refAvg.toFixed(4)} ms`);
  console.log(`スループット: ${(1000 / refAvg).toFixed(0)} ops/sec`);
  
  // 分析結果
  console.log("\n📈 パフォーマンス分析結果");
  console.log("=" + "=".repeat(50));
  
  const targetLatency = 16.67; // 60FPS
  
  console.log("\n🎯 レスポンス時間分析:");
  console.log(`  シンプルタイピング: ${simpleAvg.toFixed(4)} ms`);
  console.log(`  軽い「ん」処理: ${lightAvg.toFixed(4)} ms (+${((lightAvg/simpleAvg-1)*100).toFixed(1)}%)`);
  console.log(`  重い「ん」処理: ${heavyAvg.toFixed(4)} ms (+${((heavyAvg/simpleAvg-1)*100).toFixed(1)}%)`);
  console.log(`  typingmania-ref: ${refAvg.toFixed(4)} ms`);
  
  console.log("\n⚡ パフォーマンス比較:");
  const currentVsRef = heavyAvg / refAvg;
  console.log(`  現在の実装 vs typingmania-ref: ${currentVsRef.toFixed(2)}x`);
  
  if (currentVsRef > 3) {
    console.log("  ❌ 3倍以上遅い - 緊急最適化が必要");
  } else if (currentVsRef > 2) {
    console.log("  ⚠️  2倍以上遅い - 最適化推奨");
  } else {
    console.log("  ✅ 許容範囲内");
  }
  
  console.log("\n🔍 ボトルネック特定:");
  if ((lightAvg / simpleAvg) > 2) {
    console.log("  ⚠️  軽い「ん」処理でも大幅な処理時間増加");
    console.log("     → 分岐処理の根本的見直しが必要");
  }
  
  if ((heavyAvg / lightAvg) > 2) {
    console.log("  ⚠️  複雑な「ん」処理で処理時間が倍増");
    console.log("     → 複雑性によるパフォーマンス劣化が顕著");
  }
  
  console.log("\n🎮 実用性評価:");
  if (heavyAvg > targetLatency) {
    console.log(`  ❌ 処理時間 ${heavyAvg.toFixed(2)}ms が60FPS閾値 ${targetLatency}ms を超過`);
    console.log("     ユーザーが体感できるレベルの遅延が発生");
  } else if (heavyAvg > targetLatency * 0.5) {
    console.log(`  ⚠️  処理時間 ${heavyAvg.toFixed(2)}ms が60FPS閾値の50%を超過`);
    console.log("     高負荷時に遅延リスクあり");
  } else {
    console.log(`  ✅ 処理時間 ${heavyAvg.toFixed(2)}ms は実用レベル`);
  }
  
  console.log("\n💡 最適化提案:");
  console.log("  1. 「ん」分岐処理の簡素化");
  console.log("  2. パターンマッチングのキャッシュ化");
  console.log("  3. 条件分岐の最適化順序");
  console.log("  4. 不要な次文字参照の削除");
  
  console.log("\n✅ パフォーマンステスト完了");
}

// 実行
runPerformanceTest().catch(console.error);
