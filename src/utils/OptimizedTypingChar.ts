/**
 * typingmania-ref流 最適化されたTypingChar
 * 
 * 元のtypingmania-refのロジックを日本語用に最適化
 * 複雑な最適化を削除し、シンプルで高速な処理を実現
 * TypingCharインターフェースと互換性を保持
 */

export class OptimizedTypingChar {
  kana: string;
  patterns: string[];
  // typingmania-ref互換の統一プロパティ
  acceptedInput: string = '';
  remainingText: string = '';
  completed: boolean = false;
  activePatternIndices: number[] = [];
  base_point: number = 0;
  counted_point: number = 0;
  constructor(kana: string, patterns: string[]) {
    this.kana = kana;
    this.patterns = patterns.map(p => p.toLowerCase());
    this.base_point = this.patterns[0]?.length || 0;
    // 最初はすべてのパターンが有効
    this.activePatternIndices = Array.from({ length: patterns.length }, (_, i) => i);
    this.calculateRemainingText();
  }
  /**
   * typingmania-ref流：最短経路を効率的に計算
   * TypingChar互換メソッド
   */  calculateRemainingText(): void {
    if (this.completed) {
      this.remainingText = '';
      return;
    }

    // typingmania-ref流：最短の残りテキストを検索
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

  /**
   * typingmania-ref流：入力可能判定
   */
  canAccept(character: string): boolean {
    const char = character.toLowerCase();
    const newInput = this.acceptedInput + char;
    
    // 有効なパターンで入力可能かチェック
    for (const patternIndex of this.activePatternIndices) {
      const pattern = this.patterns[patternIndex];
      if (newInput.length <= pattern.length && 
          newInput === pattern.substring(0, newInput.length)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * typingmania-ref流：ポイント分配
   */
  dispensePoint(requiredPoint: number): number {
    const available = this.base_point - this.counted_point;
    const actualPoint = Math.min(requiredPoint, available);
    this.counted_point += actualPoint;
    return actualPoint;
  }

  /**
   * typingmania-ref流：文字受け入れ
   */  accept(character: string): number {
    const char = character.toLowerCase();
    
    if (this.canAccept(char)) {
      const point = this.dispensePoint(char.length);
      this.acceptedInput += char;
      
      // 入力後に有効なパターンを更新
      this.updateActivePatterns();
      this.calculateRemainingText();
      return point;
    }
    
    return -1;
  }

  /**
   * TypingChar互換：現在の入力に基づいて有効なパターンを更新
   */
  updateActivePatterns(): void {
    const newActiveIndices: number[] = [];
    
    for (const i of this.activePatternIndices) {
      const pattern = this.patterns[i];
      if (this.acceptedInput.length <= pattern.length && 
          this.acceptedInput === pattern.substring(0, this.acceptedInput.length)) {
        newActiveIndices.push(i);
      }
    }
    
    this.activePatternIndices = newActiveIndices;
  }

  /**
   * TypingChar互換：文字の表示用の情報を取得
   */
  getDisplayInfo(): {
    displayText: string;
    acceptedText: string;
    remainingText: string;
    isCompleted: boolean;
  } {
    return {
      displayText: this.patterns[0], // 表示用テキスト（最初のパターン）
      acceptedText: this.acceptedInput,
      remainingText: this.remainingText,
      isCompleted: this.completed
    };
  }

  /**
   * TypingChar互換：活性なパターンを取得
   */
  getActivePatterns(): string[] {
    return this.activePatternIndices.map(i => this.patterns[i]);
  }

  isCompleted(): boolean {
    return this.completed;
  }
  getRemainingText(): string {
    return this.remainingText;
  }

  getCharacterCount(): number {
    return this.base_point;
  }

  /**
   * 残り文字数を取得（utility用）
   */
  getLeftoverCharCount(): number {
    return this.remainingText.length;
  }

  /**
   * リトライ用：文字状態を完全リセット
   */
  reset(): void {
    this.acceptedInput = '';
    this.completed = false;
    this.counted_point = 0;
    // 最初はすべてのパターンが有効
    this.activePatternIndices = Array.from({ length: this.patterns.length }, (_, i) => i);
    this.calculateRemainingText();
  }
}

/**
 * TypingChar互換エイリアス
 * OptimizedTypingCharをTypingCharとして使用可能にする
 */
export type TypingChar = OptimizedTypingChar;
