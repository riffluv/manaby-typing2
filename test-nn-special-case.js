// 「ん」の特別ケースをテストするスクリプト

// japaneseUtils.tsの実装をJavaScriptに簡略化
class TypingChar {
  constructor(kana, patterns) {
    this.kana = kana;
    this.patterns = patterns;
    this.acceptedInput = '';
    this.remainingText = '';
    this.completed = false;
    // 複数パターンのうち現在有効なパターンのインデックス
    this.activePatternIndices = Array.from({ length: patterns.length }, (_, i) => i);
    this.calculateRemainingText();
  }
  
  canAccept(character) {
    const char = character.toLowerCase();
    const newInput = this.acceptedInput + char;
    
    // 活性なパターンだけをチェック
    for (const patternIndex of this.activePatternIndices) {
      const pattern = this.patterns[patternIndex];
      if (newInput.length <= pattern.length && newInput === pattern.substring(0, newInput.length)) {
        return true;
      }
    }
    
    return false;
  }
  
  accept(character) {
    const char = character.toLowerCase();
    
    if (this.canAccept(char)) {
      this.acceptedInput += char;
      
      // 入力後に有効なパターンを更新
      this.updateActivePatterns();
      this.calculateRemainingText();
      return true;
    }
    
    return false;
  }
  
  updateActivePatterns() {
    const validPatternIndices = [];
    
    for (let i = 0; i < this.patterns.length; i++) {
      const pattern = this.patterns[i];
      if (this.acceptedInput.length <= pattern.length && 
          this.acceptedInput === pattern.substring(0, this.acceptedInput.length)) {
        validPatternIndices.push(i);
      }
    }
    
    this.activePatternIndices = validPatternIndices;
  }
  
  calculateRemainingText() {
    if (this.completed) {
      this.remainingText = '';
      return;
    }
    
    // 最短の残りの表現を検索（活性パターンの中から）
    let shortestRemaining = '';
    let shortestLength = Infinity;
    
    for (const patternIndex of this.activePatternIndices) {
      const pattern = this.patterns[patternIndex];
      if (this.acceptedInput.length <= pattern.length) {
        const remaining = pattern.substring(this.acceptedInput.length);
        if (remaining.length < shortestLength) {
          shortestRemaining = remaining;
          shortestLength = remaining.length;
        }
      }
    }
    
    this.remainingText = shortestRemaining;
    
    // どのパターンも完了した場合は完了フラグをセット
    if (this.activePatternIndices.length === 0 || this.remainingText === '') {
      this.completed = true;
      this.remainingText = '';
    }
  }
  
  getDisplayInfo() {
    return {
      displayText: this.patterns[0], // 表示用テキスト（最初のパターン）
      acceptedText: this.acceptedInput,
      remainingText: this.remainingText,
      isCompleted: this.completed
    };
  }
}

// テスト関数
function testTyping(word, input) {
  console.log(`\nテスト: "${word}" に "${input}" を入力`);
  
  // 文字オブジェクトを作成
  const typingChars = [
    new TypingChar('ぷ', ['pu']),
    new TypingChar('ろ', ['ro']),
    new TypingChar('ぐ', ['gu']),
    new TypingChar('ら', ['ra']),
    new TypingChar('み', ['mi']),
    new TypingChar('ん', ['n', 'nn', 'xn']),
    new TypingChar('ぐ', ['gu'])
  ];
  
  let currentIndex = 0;
  let totalInput = '';
  let success = true;
  
  // 入力文字列を1文字ずつ処理
  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    const currentChar = typingChars[currentIndex];
    
    console.log(`[${i}] 入力: ${char}, 現在の文字: ${currentChar.kana}`);
    
    // 通常の入力処理
    if (currentChar.canAccept(char)) {
      currentChar.accept(char);
      totalInput += char;
      
      const info = currentChar.getDisplayInfo();
      console.log(`  受付: OK, 受入済: ${info.acceptedText}, 残り: ${info.remainingText}`);
      
      if (info.isCompleted) {
        currentIndex++;
        console.log(`  完了: ${currentChar.kana}, 次の文字へ`);
      }
    } 
    // 「ん」の特別処理
    else if (
      currentChar.kana === 'ん' && 
      currentChar.acceptedInput === 'n' && 
      !currentChar.completed && 
      currentIndex + 1 < typingChars.length
    ) {
      const nextChar = typingChars[currentIndex + 1];
      const nextFirstChar = nextChar.patterns[0][0];
      
      // 次の文字が母音またはy,nで始まらない場合のみ特別処理
      if (!('aiueony'.includes(nextFirstChar)) && nextChar.canAccept(char)) {
        // 「ん」を完了状態に
        currentChar.completed = true;
        currentChar.remainingText = '';
        totalInput += 'n'; // nだけ記録
        
        console.log(`  「ん」特別処理: 次の文字 ${nextChar.kana} の入力を開始`);
        
        // 次の文字にフォーカスを移して入力を処理
        currentIndex++;
        nextChar.accept(char);
        
        const nextInfo = nextChar.getDisplayInfo();
        console.log(`  次の文字受付: OK, 受入済: ${nextInfo.acceptedText}, 残り: ${nextInfo.remainingText}`);
      } else {
        console.log(`  受付: NG (特別処理が適用できない)`);
        success = false;
        break;
      }
    } else {
      console.log(`  受付: NG`);
      success = false;
      break;
    }
    
    // すべての文字が完了したかチェック
    if (currentIndex >= typingChars.length) {
      console.log("すべての文字の入力が完了しました！");
      break;
    }
  }
  
  if (success) {
    console.log(`入力成功: ${totalInput}`);
  } else {
    console.log(`入力失敗: ${totalInput}`);
  }
  
  // 残りの状態確認
  console.log("\n現在の状態:");
  for (let i = 0; i < typingChars.length; i++) {
    const info = typingChars[i].getDisplayInfo();
    console.log(`[${i}] ${typingChars[i].kana}: ${info.isCompleted ? '完了' : '未完了'}, 入力済: ${info.acceptedText}`);
  }
}

// テストケース
console.log("=== 「プログラミング」のテスト ===");

// 正式な入力方法
testTyping("ぷろぐらみんぐ", "puroguraminngu");

// 「ん」を「n」だけで入力するケース
testTyping("ぷろぐらみんぐ", "puroguraming");

// 「ん」を「n」で入力し、フォーカスが「ん」にあるときに「g」を入力するケース
testTyping("ぷろぐらみんぐ", "puroguramingu");

// Node.jsで実行する場合はこのコメントを外して実行してください
// node test-nn-special-case.js
