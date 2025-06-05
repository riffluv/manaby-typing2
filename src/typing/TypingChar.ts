/**
 * TypingChar - typingmania-ref流のタイピング文字クラス
 * 
 * typingmania-refのtypingchar.jsを参考にした
 * シンプルで高性能なタイピング文字実装
 */

import { debug } from '../utils/debug';

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
  
  // 分岐状態管理（「ん」文字用）
  public branchingState: boolean = false;
  public branchOptions: string[] = [];

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

    // 分岐状態の場合は専用の処理
    if (this.branchingState) {
      const result = this.typeBranching(char);
      return result.success;
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
      // 「ん」文字で'n'が入力された場合の特別処理
      if (this.kana === 'ん' && this.acceptedInput === 'n' && !this.completed) {
        // 'nn'パターンと子音パターンの分岐を開始
        const consonants = ['k', 'g', 's', 'z', 't', 'd', 'n', 'h', 'b', 'p', 'm', 'y', 'r', 'w'];
        this.startBranching(['nn', ...consonants]);
        this.calculateRemainingText();
        return true;
      }

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
   * etyping-ref風：強制完了メソッド
   * 「ん」文字を'n'で強制的に完了させるために使用
   */
  forceComplete(inputText: string): void {
    this.acceptedInput = inputText;
    this.completed = true;
    this.countedPoint = this.basePoint;
    this.branchingState = false;
    this.branchOptions = [];
    this.calculateRemainingText();
  }
  /**
   * 分岐状態を開始（「ん」文字用）
   * 'n'が入力された後、'nn'または'n+子音'の選択を可能にする
   */
  startBranching(options: string[]): void {
    this.branchingState = true;
    this.branchOptions = options;
    debug.typing.branch(`分岐状態開始: ${this.kana}, options=[${options.join(', ')}]`);
  }

  /**
   * 分岐状態を終了
   */
  endBranching(): void {
    this.branchingState = false;
    this.branchOptions = [];
    debug.typing.branch(`分岐状態終了: ${this.kana}`);
  }  /**
   * 分岐状態でのキー処理
   */
  typeBranching(char: string, nextChar?: TypingChar): { success: boolean; completeWithSingle?: boolean } {
    if (!this.branchingState) {
      return { success: false };
    }

    const lowerChar = char.toLowerCase();
    debug.typing.branch(`分岐状態でのキー処理: key="${lowerChar}", options=[${this.branchOptions.join(', ')}]`);

    // 'nn'パターンのチェック（同じ文字の繰り返し）
    if (lowerChar === 'n' && this.branchOptions.includes('nn')) {
      debug.typing.branch(`'nn'パターンで完了`);
      this.acceptedInput = 'nn';
      this.completed = true;
      this.countedPoint = this.basePoint;
      this.endBranching();
      this.calculateRemainingText();
      return { success: true };
    }

    // 次の文字がある場合、その文字のパターンをチェック
    if (nextChar) {
      for (const pattern of nextChar.patterns) {
        if (pattern.startsWith(lowerChar)) {
          debug.typing.branch(`次の文字のパターンマッチ: "${pattern}" が "${lowerChar}" で始まります`);
          this.acceptedInput = 'n';
          this.completed = true;
          this.countedPoint = this.basePoint;
          this.endBranching();
          this.calculateRemainingText();
          return { success: true, completeWithSingle: true };
        }
      }
    }

    debug.typing.branch(`分岐状態で無効なキー: "${lowerChar}"`);
    return { success: false };
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
    this.branchingState = false;
    this.branchOptions = [];
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
