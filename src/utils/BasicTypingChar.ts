/**
 * BasicTypingChar - typingmania-ref流のシンプルなタイピング文字実装
 * 
 * 元のtypingmania-refのtypingchar.jsを参考に、
 * 複雑な最適化を削除してシンプルな実装に回帰
 * 
 * ユーザーの複数入力パターンと「ん」処理は japaneseUtils.ts で完全保持
 */

export interface BasicDisplayInfo {
  displayText: string;
  acceptedText: string;
  remainingText: string;
  isCompleted: boolean;
}

/**
 * typingmania-ref流のシンプルなタイピング文字クラス
 * 元の33行レベルのシンプルな設計に回帰
 */
export class BasicTypingChar {
  public readonly kana: string;
  public readonly patterns: string[];
  
  // typingmania-ref互換プロパティ
  public acceptedInput: string = '';
  public remainingText: string = '';
  public completed: boolean = false;
  public basePoint: number = 0;
  public countedPoint: number = 0;

  constructor(kana: string, patterns: string[]) {
    this.kana = kana;
    this.patterns = patterns.map(p => p.toLowerCase());
    this.basePoint = this.patterns[0]?.length || 0;
    this.calculateRemainingText();
  }

  /**
   * typingmania-ref流：最短残りテキスト計算
   */
  calculateRemainingText(): void {
    if (this.completed) {
      this.remainingText = '';
      return;
    }

    // 最短の残りテキストを検索（typingmania-ref原理）
    this.remainingText = this.patterns[this.patterns.length - 1] || '';
    
    for (const pattern of this.patterns) {
      if (this.acceptedInput.length <= pattern.length && 
          this.acceptedInput === pattern.substring(0, this.acceptedInput.length)) {
        const remaining = pattern.substring(this.acceptedInput.length);
        if (remaining.length < this.remainingText.length) {
          this.remainingText = remaining;
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
    // 既に完了している場合は受け付けない
    if (this.completed) return false;
    
    const char = character.toLowerCase();
    const newInput = this.acceptedInput + char;
    
    for (const pattern of this.patterns) {
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
    const available = this.basePoint - this.countedPoint;
    const actualPoint = Math.min(requiredPoint, available);
    this.countedPoint += actualPoint;
    return actualPoint;
  }

  /**
   * typingmania-ref流：文字受け入れ
   */
  accept(character: string): number {
    const char = character.toLowerCase();
    
    if (this.canAccept(char)) {
      const point = this.dispensePoint(char.length);
      this.acceptedInput += char;
      this.calculateRemainingText();
      return point;
    }
    
    return -1;
  }
  /**
   * 表示情報を取得
   */
  getDisplayInfo(): BasicDisplayInfo {
    // 現在入力されているパターンを特定
    let currentPattern = this.patterns[0] || '';
    
    // 入力済みテキストが存在する場合、どのパターンが使われているかを判定
    if (this.acceptedInput.length > 0) {
      for (const pattern of this.patterns) {
        if (this.acceptedInput.length <= pattern.length && 
            this.acceptedInput === pattern.substring(0, this.acceptedInput.length)) {
          currentPattern = pattern;
          break;
        }
      }
    }
    
    return {
      displayText: currentPattern,
      acceptedText: this.acceptedInput,
      remainingText: this.remainingText,
      isCompleted: this.completed
    };
  }

  /**
   * 完了判定
   */
  isCompleted(): boolean {
    return this.completed;
  }

  /**
   * 残りテキストを取得
   */
  getRemainingText(): string {
    return this.remainingText;
  }

  /**
   * 文字数を取得
   */
  getCharacterCount(): number {
    return this.basePoint;
  }

  /**
   * 残り文字数を取得
   */
  getLeftoverCharCount(): number {
    return this.basePoint - this.countedPoint;
  }

  /**
   * リセット
   */
  reset(): void {
    this.acceptedInput = '';
    this.completed = false;
    this.countedPoint = 0;
    this.calculateRemainingText();
  }

  /**
   * 有効なパターンを取得
   */
  getActivePatterns(): string[] {
    const activePatterns: string[] = [];
    
    for (const pattern of this.patterns) {
      if (this.acceptedInput.length <= pattern.length && 
          this.acceptedInput === pattern.substring(0, this.acceptedInput.length)) {
        activePatterns.push(pattern);
      }
    }
    
    return activePatterns;
  }
}
