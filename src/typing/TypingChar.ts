/**
 * TypingChar - typingmania-ref流のタイピング文字クラス
 * 
 * typingmania-refのtypingchar.jsを参考にした
 * シンプルで高性能なタイピング文字実装
 */

export interface DisplayInfo {
  displayText: string;
  acceptedText: string;
  remainingText: string;
  isCompleted: boolean;
}

/**
 * typingmania-ref流のタイピング文字クラス
 * シンプルな設計で高速処理を実現
 */
export class TypingChar {
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
  private calculateRemainingText(): void {
    if (this.completed) {
      this.remainingText = '';
      return;
    }

    // 最短の残りテキストを検索（typingmania-ref原理）
    this.remainingText = this.patterns[this.patterns.length - 1] || '';
    
    for (const pattern of this.patterns) {
      if (pattern.startsWith(this.acceptedInput)) {
        const remaining = pattern.slice(this.acceptedInput.length);
        if (remaining.length < this.remainingText.length) {
          this.remainingText = remaining;
        }
      }
    }
  }

  /**
   * typingmania-ref流：キー入力処理
   */
  type(char: string): boolean {
    if (this.completed) {
      return false;
    }

    const lowerChar = char.toLowerCase();
    let progress = false;

    // パターンマッチング検査
    for (const pattern of this.patterns) {
      if (pattern.startsWith(this.acceptedInput + lowerChar)) {
        this.acceptedInput += lowerChar;
        progress = true;
        break;
      }
    }

    if (progress) {
      // 完了チェック
      for (const pattern of this.patterns) {
        if (pattern === this.acceptedInput) {
          this.completed = true;
          this.countedPoint = this.basePoint;
          break;
        }
      }
      
      this.calculateRemainingText();
    }

    return progress;
  }

  /**
   * typingmania-ref流：表示情報取得
   */
  getDisplayInfo(): DisplayInfo {
    return {
      displayText: this.kana,
      acceptedText: this.acceptedInput,
      remainingText: this.remainingText,
      isCompleted: this.completed,
    };
  }

  /**
   * typingmania-ref流：リセット機能
   */
  reset(): void {
    this.acceptedInput = '';
    this.completed = false;
    this.countedPoint = 0;
    this.calculateRemainingText();
  }

  /**
   * typingmania-ref流：ポイント計算
   */
  getPoint(): number {
    return this.completed ? this.basePoint : 0;
  }

  /**
   * typingmania-ref流：進行率取得
   */
  getProgress(): number {
    if (this.patterns.length === 0) return 1;
    const firstPattern = this.patterns[0];
    if (!firstPattern) return 1;
    return this.acceptedInput.length / firstPattern.length;
  }
}
